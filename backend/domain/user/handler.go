package user

import (
	"encoding/json"
	"log"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type Handler interface {
	RegisterCustomer(c *gin.Context)
	LoginCustomer(c *gin.Context)
	GetCustomerProfile(c *gin.Context)
	UpdateCustomerProfile(c *gin.Context)
	ChangeCustomerPassword(c *gin.Context)

	AddCustomerAddress(c *gin.Context)
	ListCustomerAddresses(c *gin.Context)
	UpdateCustomerAddress(c *gin.Context)

	ListPublicProductsAndCategories(c *gin.Context)
	GetPublicProductDetail(c *gin.Context)
	AddToCart(c *gin.Context)
	GetCartItems(c *gin.Context)

	UpdateCartItemQuantity(c *gin.Context)
	RemoveCartItem(c *gin.Context)

	CreateOrder(c *gin.Context)
	ListCustomerOrders(c *gin.Context)

	GetNewsPageData(c *gin.Context)
	GetNewsDetailPageData(c *gin.Context)
}

func NewHandler(svc Service) Handler {
	return &handler{
		svc: svc,
	}
}

type handler struct {
	svc Service
}

func (h *handler) RegisterCustomer(c *gin.Context) {
	var input CustomerRegisterInput

	if err := c.ShouldBindJSON(&input); err != nil { /* ... error handling ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler RegisterCustomer] Input: %+v\n", input)

	createdCustomer, serviceErr := h.svc.RegisterCustomer(input)
	if serviceErr != nil {
		if strings.Contains(serviceErr.Error(), "email sudah terdaftar") {
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registrasi customer gagal", "details": serviceErr.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registrasi customer berhasil. Silakan login.",
		"customer": gin.H{ // Kirim data yang aman dan relevan
			"customer_id": createdCustomer.CustomerID,
			"first_name":  createdCustomer.Detail.FirstName,
			"last_name":   createdCustomer.Detail.LastName,
			"email":       createdCustomer.Email,
		},
	})
}

func (h *handler) LoginCustomer(c *gin.Context) {
	var input CustomerLoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler LoginCustomer] Input: %+v\n", input)

	loginResponse, serviceErr := h.svc.LoginCustomer(input) // Memanggil service login
	if serviceErr != nil {
		if serviceErr.Error() == "email atau password salah" || serviceErr.Error() == "email tidak terdaftar" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password yang Anda masukkan salah."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Terjadi kesalahan internal saat login.", "details": serviceErr.Error()})
		return
	}

	// Kirim CustomerLoginResponse yang berisi token, info user, dan hasAddress
	c.JSON(http.StatusOK, loginResponse)
}

func (h *handler) GetCustomerProfile(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		log.Println("[Handler GetCustomerProfile] Customer ID tidak ditemukan di context.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID := customerIDInterface.(string) // Asumsi customerID selalu string
	log.Printf("[Handler GetCustomerProfile] Mengambil profil untuk Customer ID dari token: %s\n", customerID)

	profile, err := h.svc.GetCustomerProfile(customerID)
	if err != nil {
		if strings.Contains(err.Error(), "customer tidak ditemukan") { // Cek error dari service
			c.JSON(http.StatusNotFound, gin.H{"error": "Profil customer tidak ditemukan."})
			return
		}
		log.Printf("[Handler GetCustomerProfile] Gagal mengambil profil customer: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil profil customer.", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"customer": gin.H{
			"customerID": profile.CustomerID,
			"email":      profile.Email,
			"phone":      profile.Phone,
			"detail": gin.H{
				"first_name": profile.Detail.FirstName,
				"last_name":  profile.Detail.LastName,
				"image":      profile.Detail.Image,
				"join_date":  profile.Detail.JoinDate,
				"birthday":   profile.Detail.Birthday,
			},
		},
	})
}

func (h *handler) UpdateCustomerProfile(c *gin.Context) {
	customerID, exists := c.Get("customer_id_from_token")
	if !exists {
		log.Println("[Handler UpdateCustomerProfile] Customer ID tidak ditemukan di context.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}

	var input CustomerProfileUpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[Handler UpdateCustomerProfile] Input tidak valid: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid", "details": err.Error()})
		return
	}

	updatedCustomer, err := h.svc.UpdateCustomerProfile(customerID.(string), input)
	if err != nil {
		log.Printf("[Handler UpdateCustomerProfile] Gagal memperbarui profil untuk customer ID %s: %v\n", customerID, err)
		if strings.Contains(err.Error(), "customer tidak ditemukan") || strings.Contains(err.Error(), "detail customer tidak ditemukan") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui profil.", "details": err.Error()})
		return
	}

	// Kirim kembali data customer yang diperbarui (tanpa password)
	// Struktur respons ini harus cocok dengan ekspektasi frontend
	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui",
		"customer": gin.H{ // Frontend mengharapkan 'customer' object
			"customerID": updatedCustomer.CustomerID,
			"email":      updatedCustomer.Email,
			"phone":      updatedCustomer.Phone,
			"detail": gin.H{ // Frontend mengharapkan 'detail' object di dalamnya
				"first_name": updatedCustomer.Detail.FirstName,
				"last_name":  updatedCustomer.Detail.LastName,
				"image":      updatedCustomer.Detail.Image,
				"join_date":  updatedCustomer.Detail.JoinDate,
				"birthday":   updatedCustomer.Detail.Birthday,
			},
			// tambahkan hasAddress jika diperlukan di respons ini juga
			"hasAddress": len(updatedCustomer.Addresses) > 0,
		},
	})
}

func (h *handler) ChangeCustomerPassword(c *gin.Context) {
	customerID, exists := c.Get("customer_id_from_token")
	if !exists {
		log.Println("[Handler ChangeCustomerPassword] Customer ID tidak ditemukan di context.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}

	var input CustomerPasswordUpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[Handler ChangeCustomerPassword] Input tidak valid: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid", "details": err.Error()})
		return
	}

	err := h.svc.ChangeCustomerPassword(customerID.(string), input)
	if err != nil {
		log.Printf("[Handler ChangeCustomerPassword] Gagal mengubah password untuk customer ID %s: %v\n", customerID, err)
		if strings.Contains(err.Error(), "password saat ini salah") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengubah password.", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diubah."})
}

func (h *handler) AddCustomerAddress(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID := customerIDInterface.(string)

	var input UpsertCustomerAddressInput // Menggunakan DTO yang sesuai
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input alamat tidak valid", "details": err.Error()})
		return
	}

	createdAddress, serviceErr := h.svc.AddCustomerAddress(customerID, input)
	if serviceErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan alamat.", "details": serviceErr.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Alamat berhasil ditambahkan", "address": createdAddress})
}

func (h *handler) ListCustomerAddresses(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID := customerIDInterface.(string)

	addresses, err := h.svc.ListCustomerAddresses(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil alamat.", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"addresses": addresses}) // Kirim array alamat
}

func (h *handler) UpdateCustomerAddress(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID := customerIDInterface.(string)

	addressIDStr := c.Param("addressId") // Ambil addressId dari URL
	addressIDUint64, err := strconv.ParseUint(addressIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format Address ID tidak valid"})
		return
	}
	addressID := uint(addressIDUint64)

	var input UpsertCustomerAddressInput // Menggunakan DTO yang sesuai
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input alamat tidak valid", "details": err.Error()})
		return
	}

	updatedAddress, serviceErr := h.svc.UpdateCustomerAddress(customerID, addressID, input)
	if serviceErr != nil {
		if serviceErr.Error() == "alamat tidak ditemukan atau Anda tidak berhak mengubahnya" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()}) // Atau StatusForbidden
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate alamat.", "details": serviceErr.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Alamat berhasil diupdate", "address": updatedAddress})
}

func (h *handler) ListPublicProductsAndCategories(c *gin.Context) {
	log.Println("[Handler ListPublicProductsAndCategories] Memulai proses...")

	data, err := h.svc.ListPublicProductsAndCategories()
	if err != nil {
		log.Printf("[Handler ListPublicProductsAndCategories] Error dari service: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data produk dan kategori", "details": err.Error()})
		return
	}

	log.Printf("[Handler ListPublicProductsAndCategories] Berhasil mengambil data.\n")
	// Service mengembalikan map {"products": [...], "categories": [...]}
	// Langsung kirim map tersebut sebagai respons JSON
	c.JSON(http.StatusOK, data)
}

func (h *handler) GetPublicProductDetail(c *gin.Context) {
	productSKU := c.Param("productSKU") // Ambil SKU dari path parameter
	log.Printf("[Handler GetPublicProductDetail] Memulai proses untuk SKU: %s\n", productSKU)

	if productSKU == "" {
		log.Println("[Handler GetPublicProductDetail] Error: Product SKU kosong di path.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product SKU dibutuhkan di URL"})
		return
	}

	productDetail, err := h.svc.GetPublicProductDetail(productSKU)
	if err != nil {
		log.Printf("[Handler GetPublicProductDetail] Error dari service untuk SKU %s: %v\n", productSKU, err)
		if strings.Contains(err.Error(), "produk tidak ditemukan") { // Cek error dari service
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil detail produk", "details": err.Error()})
		return
	}

	log.Printf("[Handler GetPublicProductDetail] Berhasil mengambil detail untuk SKU: %s\n", productSKU)
	// Frontend ProductDetail.jsx Anda mungkin mengharapkan objek produk langsung atau dibungkus.
	// Untuk konsistensi, kita bisa bungkus dalam "product".
	c.JSON(http.StatusOK, gin.H{"product": productDetail})
}

func (h *handler) AddToCart(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID := customerIDInterface.(string)

	var input AddToCartInput // DTO dari model.go: { ProductSKU, Quantity }
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	log.Printf("[Handler AddToCart] CustomerID: %s, Menambah ke keranjang: %+v\n", customerID, input)

	cartItem, serviceErr := h.svc.AddToCart(customerID, input)
	if serviceErr != nil {
		log.Printf("[Handler AddToCart] Error dari service: %v\n", serviceErr)
		if serviceErr.Error() == "produk tidak ditemukan atau tidak tersedia" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		if strings.Contains(serviceErr.Error(), "stok produk") { // Mencakup "tidak mencukupi"
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan ke keranjang", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler AddToCart] Berhasil menambahkan/update item ke keranjang: %+v\n", cartItem)
	c.JSON(http.StatusOK, gin.H{
		"message":   "Produk berhasil ditambahkan ke keranjang",
		"cart_item": cartItem,
	})
}

func (h *handler) GetCartItems(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID := customerIDInterface.(string)

	log.Printf("[Handler GetCartItems] Mengambil item keranjang untuk CustomerID: %s\n", customerID)

	cartItems, err := h.svc.GetCartItems(customerID)
	if err != nil {
		log.Printf("[Handler GetCartItems] Error dari service: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil isi keranjang", "details": err.Error()})
		return
	}

	// Jika keranjang kosong, cartItems akan menjadi slice kosong, yang mana valid JSON ([])
	c.JSON(http.StatusOK, gin.H{"cart_items": cartItems})
}

func (h *handler) UpdateCartItemQuantity(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	customerID := customerIDInterface.(string)

	cartItemIDStr := c.Param("cartItemId") // Ambil cartItemId dari URL
	cartItemIDUint64, err := strconv.ParseUint(cartItemIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format Cart Item ID tidak valid"})
		return
	}
	cartItemID := uint(cartItemIDUint64)

	var input UpdateCartItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	log.Printf("[Handler UpdateCartItemQuantity] CustomerID: %s, CartItemID: %d, Input: %+v\n", customerID, cartItemID, input)

	updatedCartItem, serviceErr := h.svc.UpdateCartItemQuantity(customerID, cartItemID, input.Quantity)
	if serviceErr != nil {
		log.Printf("[Handler UpdateCartItemQuantity] Error dari service: %v\n", serviceErr)
		if serviceErr.Error() == "item keranjang tidak ditemukan atau bukan milik Anda" ||
			serviceErr.Error() == "detail produk untuk item keranjang tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		if strings.Contains(serviceErr.Error(), "stok produk") || serviceErr.Error() == "kuantitas tidak boleh kurang dari 1" {
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate kuantitas item", "details": serviceErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Kuantitas item keranjang berhasil diupdate",
		"cart_item": updatedCartItem,
	})
}

func (h *handler) RemoveCartItem(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	customerID := customerIDInterface.(string)

	cartItemIDStr := c.Param("cartItemId") // Ambil cartItemId dari URL
	cartItemIDUint64, err := strconv.ParseUint(cartItemIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format Cart Item ID tidak valid"})
		return
	}
	cartItemID := uint(cartItemIDUint64)

	log.Printf("[Handler RemoveCartItem] CustomerID: %s, Menghapus CartItemID: %d\n", customerID, cartItemID)

	serviceErr := h.svc.RemoveCartItem(customerID, cartItemID)
	if serviceErr != nil {
		log.Printf("[Handler RemoveCartItem] Error dari service: %v\n", serviceErr)
		if serviceErr.Error() == "item keranjang tidak ditemukan atau Anda tidak berhak menghapusnya" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item dari keranjang", "details": serviceErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item berhasil dihapus dari keranjang"})
	// Atau bisa juga c.Status(http.StatusNoContent) jika tidak ada body respons
}

func (h *handler) CreateOrder(c *gin.Context) {
	// 1. Ambil CustomerID dari context yang diset oleh CustomerAuthMiddleware
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		log.Println("[Handler CreateOrder] Error: Customer ID tidak ditemukan di context token.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID, ok := customerIDInterface.(string)
	if !ok || customerID == "" {
		log.Println("[Handler CreateOrder] Error: Format Customer ID di token salah atau kosong.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Data autentikasi tidak valid."})
		return
	}

	// 2. Set batas memori untuk parsing multipart form (misal 10MB untuk bukti bayar)
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		log.Printf("[Handler CreateOrder] Error parsing multipart form: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal memproses form data: " + err.Error()})
		return
	}

	// 3. Ambil string JSON dari field "jsonData"
	jsonDataString := c.PostForm("jsonData")
	if jsonDataString == "" {
		log.Println("[Handler CreateOrder] Error: Field 'jsonData' kosong.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data checkout (jsonData) tidak ditemukan."})
		return
	}

	var inputDTO CheckoutInput // DTO dari model.go (package user)
	if err := json.Unmarshal([]byte(jsonDataString), &inputDTO); err != nil {
		log.Printf("[Handler CreateOrder] Error unmarshalling jsonData: %v\nInput: %s\n", err, jsonDataString)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data checkout tidak valid: " + err.Error()})
		return
	}

	// 4. Ambil file bukti pembayaran (opsional)
	var proofPaymentFileHeader *multipart.FileHeader
	file, handlerFileHeader, errFile := c.Request.FormFile("proofPaymentFile") // "proofPaymentFile" harus cocok dengan key di FormData frontend

	if errFile == nil && file != nil { // Ada file yang diupload
		defer file.Close() // Penting untuk menutup file setelah selesai
		proofPaymentFileHeader = handlerFileHeader
		log.Printf("[Handler CreateOrder] File bukti pembayaran diterima: %s\n", proofPaymentFileHeader.Filename)
	} else if errFile != http.ErrMissingFile {
		// Error lain selain file tidak ada (misalnya, masalah baca form)
		log.Printf("[Handler CreateOrder] Error saat mengambil file bukti pembayaran: %v\n", errFile)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error memproses file bukti pembayaran: " + errFile.Error()})
		return
	}
	// Jika errFile == http.ErrMissingFile, maka proofPaymentFileHeader akan tetap nil (tidak ada file diupload), ini OK.

	log.Printf("[Handler CreateOrder] CustomerID: %s, Input DTO: %+v, Ada File Bukti: %t\n", customerID, inputDTO, proofPaymentFileHeader != nil)

	// 5. Panggil service CreateOrderFromCart
	order, serviceErr := h.svc.CreateOrderFromCart(customerID, inputDTO, proofPaymentFileHeader)
	if serviceErr != nil {
		log.Printf("[Handler CreateOrder] Error dari service CreateOrderFromCart: %v\n", serviceErr)
		// Tangani error spesifik dari service
		if strings.Contains(serviceErr.Error(), "keranjang Anda kosong") ||
			strings.Contains(serviceErr.Error(), "alamat pengiriman yang dipilih tidak valid") ||
			strings.Contains(serviceErr.Error(), "bukti pembayaran diperlukan") {
			c.JSON(http.StatusBadRequest, gin.H{"error": serviceErr.Error()})
			return
		}
		if strings.Contains(serviceErr.Error(), "stok produk") { // Mencakup "tidak mencukupi"
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		if strings.Contains(serviceErr.Error(), "produk tidak ditemukan") {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat pesanan Anda", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler CreateOrder] Order berhasil dibuat dengan ID: %s\n", order.OrderID)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Pesanan Anda berhasil dibuat!",
		"order":   order, // Kirim kembali data order yang sudah lengkap
	})
}

func (h *handler) ListCustomerOrders(c *gin.Context) {
	customerIDInterface, exists := c.Get("customer_id_from_token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}
	customerID := customerIDInterface.(string)

	log.Printf("[Handler ListCustomerOrders] Mengambil riwayat pesanan untuk CustomerID: %s\n", customerID)

	orders, err := h.svc.ListCustomerOrders(customerID)
	if err != nil {
		log.Printf("[Handler ListCustomerOrders] Error dari service: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat pesanan", "details": err.Error()})
		return
	}

	// Jika tidak ada pesanan, 'orders' akan menjadi slice kosong [], yang merupakan respons JSON yang valid.
	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func (h *handler) GetNewsPageData(c *gin.Context) {
	// Ambil parameter 'page' dan 'limit' dari query URL, dengan nilai default
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5")) // Default 5 berita per halaman

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 5
	}

	pageData, err := h.svc.GetNewsPageData(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data berita", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pageData)
}

func (h *handler) GetNewsDetailPageData(c *gin.Context) {
	newsID := c.Param("newsId") // Ambil ID dari URL

	pageData, err := h.svc.GetNewsDetailPageData(newsID)
	if err != nil {
		if err.Error() == "postingan berita tidak ditemukan atau belum dipublikasikan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data halaman berita", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pageData)
}
