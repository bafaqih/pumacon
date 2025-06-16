package user

import (
	"errors"
	"fmt"
	"math"

	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"

	"strings"
	"time"

	"backend-user/domain/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/microcosm-cc/bluemonday"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	defaultCustomerImagePath  = "uploads/images/profile/avatar-1.jpg"
	customerJwtExpirationTime = 7 * 24 * time.Hour
)

type Service interface {
	RegisterCustomer(input CustomerRegisterInput) (models.Customer, error)
	LoginCustomer(input CustomerLoginInput) (CustomerLoginResponse, error)
	GetCustomerProfile(customerID string) (models.Customer, error)
	UpdateCustomerProfile(customerID string, input CustomerProfileUpdateInput) (*models.Customer, error)
	ChangeCustomerPassword(customerID string, input CustomerPasswordUpdateInput) error

	AddCustomerAddress(customerID string, input UpsertCustomerAddressInput) (models.CustomerAddress, error)
	ListCustomerAddresses(customerID string) ([]models.CustomerAddress, error)
	UpdateCustomerAddress(customerID string, addressID uint, input UpsertCustomerAddressInput) (models.CustomerAddress, error)

	ListPublicProductsAndCategories() (map[string]interface{}, error)
	GetPublicProductDetail(productSKU string) (PublicProductDetail, error)
	AddToCart(customerID string, input AddToCartInput) (models.Cart, error)
	GetCartItems(customerID string) ([]models.Cart, error)
	UpdateCartItemQuantity(customerID string, cartItemID uint, newQuantity int) (models.Cart, error)
	RemoveCartItem(customerID string, cartItemID uint) error

	CreateOrderFromCart(customerID string, input CheckoutInput, proofPaymentFile *multipart.FileHeader) (models.Order, error)
	ListCustomerOrders(customerID string) ([]OrderHistoryItem, error)

	GetNewsPageData(page, limit int) (NewsPageData, error)
	GetNewsDetailPageData(newsID string) (NewsDetailPageData, error)
}

func NewService(db *gorm.DB, jwtSecret []byte) Service {
	return &service{db: db, jwtSecret: jwtSecret}
}

type service struct {
	db        *gorm.DB
	jwtSecret []byte
}

func (s *service) generateJWTToken(customer models.Customer) (string, error) {
	claims := &CustomerJwtCustomClaims{
		customer.CustomerID,
		customer.Email,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(customerJwtExpirationTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "pumacon",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Gunakan s.jwtSecretKey
	signedToken, err := token.SignedString(s.jwtSecret) // <--- GUNAKAN DARI STRUCT
	if err != nil {
		return "", fmt.Errorf("gagal menandatangani token: %w", err)
	}

	return signedToken, nil
}

func (s *service) RegisterCustomer(input CustomerRegisterInput) (models.Customer, error) {
	log.Printf("[Service RegisterCustomer] Memulai registrasi untuk email: %s\n", input.Email)
	var finalCreatedCustomer models.Customer

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Cek apakah email sudah terdaftar di tabel 'customers'
		var existingCustomerCount int64
		tx.Model(&models.Customer{}).Where("email = ?", input.Email).Count(&existingCustomerCount)
		if existingCustomerCount > 0 {
			log.Printf("[Service RegisterCustomer] Email '%s' sudah terdaftar.\n", input.Email)
			return errors.New("email sudah terdaftar")
		}
		// Tidak perlu cek di customer_details untuk email karena diasumsikan email di customers adalah sumber utama

		// 2. DAPATKAN NOMOR ID BERURUTAN DARI DATABASE
		var nextVal int
		if err := tx.Raw("SELECT nextval('customer_id_seq')").Scan(&nextVal).Error; err != nil {
			log.Printf("[Service RegisterCustomer] Error mendapatkan ID berikutnya dari sequence: %v\n", err)
			return fmt.Errorf("gagal mendapatkan ID customer: %w", err)
		}

		newCustomerID := fmt.Sprintf("CST%05d", nextVal)
		log.Printf("[Service RegisterCustomer] ID Customer baru digenerate: %s\n", newCustomerID)

		// 3. Hash password
		hashedPassword, errHash := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if errHash != nil {
			log.Printf("[Service RegisterCustomer] Gagal hash password: %v\n", errHash)
			return fmt.Errorf("gagal memproses password: %w", errHash)
		}

		// 4. Buat instance Customer (tabel customers)
		customer := models.Customer{
			CustomerID: newCustomerID,
			Email:      input.Email,
			Phone:      input.Phone,
			Password:   string(hashedPassword),
		}
		if errCreateCust := tx.Create(&customer).Error; errCreateCust != nil {
			log.Printf("[Service RegisterCustomer] Gagal menyimpan ke tabel customers: %v\n", errCreateCust)
			return fmt.Errorf("gagal menyimpan data customer: %w", errCreateCust)
		}

		// 5. Buat instance CustomerDetail (tabel customer_details)
		customerDetail := models.CustomerDetail{
			CustomerID: newCustomerID, // Link ke customer utama
			FirstName:  input.FirstName,
			LastName:   input.LastName,
			Image:      defaultCustomerImagePath, // Path default
			Email:      input.Email,              // Replikasi email
			Phone:      input.Phone,              // Replikasi phone
			JoinDate:   time.Now(),               // Tanggal hari ini
			Birthday:   nil,                      // Birthday null saat registrasi
		}
		if errCreateDetail := tx.Create(&customerDetail).Error; errCreateDetail != nil {
			log.Printf("[Service RegisterCustomer] Gagal menyimpan ke tabel customer_details: %v\n", errCreateDetail)
			return fmt.Errorf("gagal menyimpan detail customer: %w", errCreateDetail)
		}

		// Ambil kembali customer dengan detailnya untuk dikembalikan
		// Alamat akan kosong karena belum dibuat
		if errLoad := tx.Preload("Detail").First(&finalCreatedCustomer, "customer_id = ?", newCustomerID).Error; errLoad != nil {
			return fmt.Errorf("gagal mengambil data customer lengkap setelah create: %w", errLoad)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		return models.Customer{}, err // Kembalikan error dari transaksi
	}

	log.Printf("[Service RegisterCustomer] Customer '%s' (ID: %s) berhasil diregistrasi.\n", finalCreatedCustomer.Email, finalCreatedCustomer.CustomerID)
	return finalCreatedCustomer, nil
}

func (s *service) generateJWTTokenForCustomer(customer models.Customer) (string, error) {
	claims := &CustomerJwtCustomClaims{
		CustomerID: customer.CustomerID,
		Email:      customer.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(customerJwtExpirationTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "pumacon", // Ganti dengan issuer Anda
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(s.jwtSecret)
	if err != nil {
		log.Printf("[Service generateJWTTokenForCustomer] Gagal sign token: %v\n", err)
		return "", fmt.Errorf("gagal membuat sesi login: %w", err)
	}
	return signedToken, nil
}

func (s *service) LoginCustomer(input CustomerLoginInput) (CustomerLoginResponse, error) {
	var customer models.Customer
	var response CustomerLoginResponse

	log.Printf("[Service LoginCustomer] Mencoba login untuk email: %s\n", input.Email)

	if err := s.db.Preload("Detail").Where("email = ?", input.Email).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response, errors.New("email atau password salah")
		}
		return response, fmt.Errorf("gagal mencari customer: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(customer.Password), []byte(input.Password)); err != nil {
		return response, errors.New("email atau password salah")
	}

	tokenString, err := s.generateJWTTokenForCustomer(customer)
	if err != nil {
		return response, err
	}

	response.Token = tokenString
	response.CustomerID = customer.CustomerID
	response.Email = customer.Email
	if customer.Detail.CustomerID != "" {
		response.FirstName = customer.Detail.FirstName
		response.LastName = customer.Detail.LastName
	}

	log.Printf("[Service LoginCustomer] Customer %s login berhasil.\n", customer.Email)
	return response, nil
}

func (s *service) GetCustomerProfile(customerID string) (models.Customer, error) {
	log.Printf("[Service GetCustomerProfile] Mengambil profil dasar untuk Customer ID: %s\n", customerID)
	var customer models.Customer
	// Preload "Detail" untuk mengambil data dari customer_details.
	// Preload "Addresses" DIHAPUS dari sini.
	if err := s.db.Preload("Detail").Where("customer_id = ?", customerID).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service GetCustomerProfile] Customer dengan ID %s tidak ditemukan.\n", customerID)
			return models.Customer{}, errors.New("customer tidak ditemukan")
		}
		log.Printf("[Service GetCustomerProfile] Error mengambil profil customer %s: %v\n", customerID, err)
		return models.Customer{}, fmt.Errorf("gagal mengambil profil customer: %w", err)
	}
	// Field customer.Addresses akan menjadi slice kosong (atau nil) di sini.
	log.Printf("[Service GetCustomerProfile] Profil dasar berhasil diambil untuk Customer ID: %s\n", customerID)
	return customer, nil
}

func (s *service) UpdateCustomerProfile(customerID string, input CustomerProfileUpdateInput) (*models.Customer, error) {
	var customer models.Customer
	// Cari customer utama dan detailnya dengan Preload
	if err := s.db.Preload("Detail").Where("customer_id = ?", customerID).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("customer tidak ditemukan")
		}
		return nil, fmt.Errorf("gagal mencari customer: %w", err)
	}

	// Mulai transaksi untuk memastikan konsistensi update
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Update tabel Customer (untuk Phone)
		customer.Phone = input.Phone
		if err := tx.Save(&customer).Error; err != nil {
			log.Printf("[Service UpdateCustomerProfile] Gagal update nomor telepon customer %s: %v\n", customerID, err)
			return fmt.Errorf("gagal update nomor telepon customer: %w", err)
		}

		// Update tabel CustomerDetail
		// Asumsi customer.Detail sudah di-preload dari query First(&customer) di atas
		if customer.Detail.CustomerID == "" { // Ini sebagai fallback jika detail somehow belum ada (jarang terjadi)
			log.Printf("[Service UpdateCustomerProfile] Detail customer %s tidak ditemukan saat update profil.\n", customerID)
			return errors.New("detail customer tidak ditemukan, tidak bisa diupdate")
		}

		customer.Detail.FirstName = input.FirstName
		customer.Detail.LastName = input.LastName
		customer.Detail.Birthday = input.Birthday
		// Replikasi email dan phone ke CustomerDetail agar konsisten
		customer.Detail.Email = customer.Email
		customer.Detail.Phone = input.Phone

		if err := tx.Save(&customer.Detail).Error; err != nil {
			log.Printf("[Service UpdateCustomerProfile] Gagal update detail customer %s: %v\n", customerID, err)
			return fmt.Errorf("gagal update detail customer: %w", err)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Setelah transaksi, preload lagi untuk mengembalikan data lengkap dan terbaru
	// Ini penting agar response ke frontend mengandung data terbaru dari Detail
	if err := s.db.Preload("Detail").Where("customer_id = ?", customerID).First(&customer).Error; err != nil {
		log.Printf("[Service UpdateCustomerProfile] Gagal mengambil customer %s setelah update: %v\n", customerID, err)
		return nil, fmt.Errorf("gagal mengambil customer setelah update: %w", err)
	}

	log.Printf("[Service UpdateCustomerProfile] Profil customer %s berhasil diupdate.\n", customerID)
	return &customer, nil
}

func (s *service) ChangeCustomerPassword(customerID string, input CustomerPasswordUpdateInput) error {
	var customer models.Customer
	if err := s.db.Where("customer_id = ?", customerID).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service ChangeCustomerPassword] Customer %s tidak ditemukan: %v\n", customerID, err)
			return errors.New("customer tidak ditemukan")
		}
		log.Printf("[Service ChangeCustomerPassword] Gagal mencari customer %s: %v\n", customerID, err)
		return fmt.Errorf("gagal mencari customer: %w", err)
	}

	// Verifikasi current password
	if err := bcrypt.CompareHashAndPassword([]byte(customer.Password), []byte(input.CurrentPassword)); err != nil {
		log.Printf("[Service ChangeCustomerPassword] Password saat ini salah untuk customer %s.\n", customerID)
		return errors.New("password saat ini salah")
	}

	// Hash new password
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[Service ChangeCustomerPassword] Gagal hash password baru untuk customer %s: %v\n", customerID, err)
		return fmt.Errorf("gagal memproses password baru: %w", err)
	}

	// Update password di database
	customer.Password = string(newHashedPassword)
	if err := s.db.Save(&customer).Error; err != nil {
		log.Printf("[Service ChangeCustomerPassword] Gagal menyimpan password baru untuk customer %s: %v\n", customerID, err)
		return fmt.Errorf("gagal menyimpan password baru: %w", err)
	}

	log.Printf("[Service ChangeCustomerPassword] Password customer %s berhasil diubah.\n", customerID)
	return nil
}

func (s *service) AddCustomerAddress(customerID string, input UpsertCustomerAddressInput) (models.CustomerAddress, error) {
	log.Printf("[Service AddCustomerAddress] Menambah alamat untuk Customer ID: %s, Data: %+v\n", customerID, input)

	address := models.CustomerAddress{
		CustomerID:   customerID, // Diambil dari token di handler, diteruskan ke service
		Title:        input.Title,
		Street:       input.Street,
		Additional:   input.Additional,
		DistrictCity: input.DistrictCity,
		Province:     input.Province,
		PostCode:     input.PostCode,
		// Country dan IsDefault tidak ada sesuai DDL terakhir
	}

	// Tidak ada logika IsDefault yang kompleks jika field tersebut tidak ada
	if err := s.db.Create(&address).Error; err != nil {
		log.Printf("[Service AddCustomerAddress] Gagal menyimpan alamat baru: %v\n", err)
		return models.CustomerAddress{}, fmt.Errorf("gagal menyimpan alamat: %w", err)
	}

	log.Printf("[Service AddCustomerAddress] Alamat berhasil ditambahkan dengan ID: %d untuk Customer ID: %s\n", address.AddressID, customerID)
	return address, nil
}

func (s *service) ListCustomerAddresses(customerID string) ([]models.CustomerAddress, error) {
	var addresses []models.CustomerAddress
	log.Printf("[Service ListCustomerAddresses] Mengambil alamat untuk Customer ID: %s\n", customerID)

	if err := s.db.Where("customer_id = ?", customerID).Order("created_at DESC").Find(&addresses).Error; err != nil {
		log.Printf("[Service ListCustomerAddresses] Gagal mengambil alamat untuk CustomerID %s: %v\n", customerID, err)
		return nil, fmt.Errorf("gagal mengambil alamat untuk customer %s: %w", customerID, err)
	}
	log.Printf("[Service ListCustomerAddresses] Ditemukan %d alamat untuk CustomerID: %s\n", len(addresses), customerID)
	return addresses, nil
}

func (s *service) UpdateCustomerAddress(customerID string, addressID uint, input UpsertCustomerAddressInput) (models.CustomerAddress, error) {
	log.Printf("[Service UpdateCustomerAddress] Mengupdate alamat ID %d untuk CustomerID %s. Data: %+v\n", addressID, customerID, input)

	var addressToUpdate models.CustomerAddress
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil alamat yang akan diupdate, pastikan milik customer yang benar
		if err := tx.Where("address_id = ? AND customer_id = ?", addressID, customerID).First(&addressToUpdate).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("[Service UpdateCustomerAddress] Alamat ID %d tidak ditemukan atau bukan milik CustomerID %s.\n", addressID, customerID)
				return errors.New("alamat tidak ditemukan atau Anda tidak berhak mengubahnya")
			}
			log.Printf("[Service UpdateCustomerAddress] Error mengambil alamat: %v\n", err)
			return fmt.Errorf("gagal mengambil data alamat untuk update: %w", err)
		}

		// 2. Update field-field alamat
		addressToUpdate.Title = input.Title
		addressToUpdate.Street = input.Street
		addressToUpdate.Additional = input.Additional
		addressToUpdate.DistrictCity = input.DistrictCity
		addressToUpdate.Province = input.Province
		addressToUpdate.PostCode = input.PostCode
		// IsDefault dan Country tidak ada

		// 3. Simpan perubahan
		if err := tx.Save(&addressToUpdate).Error; err != nil {
			log.Printf("[Service UpdateCustomerAddress] Error menyimpan perubahan alamat: %v\n", err)
			return fmt.Errorf("gagal menyimpan perubahan alamat: %w", err)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		return models.CustomerAddress{}, err
	}

	log.Printf("[Service UpdateCustomerAddress] Berhasil mengupdate alamat ID: %d untuk CustomerID %s\n", addressID, customerID)
	return addressToUpdate, nil
}

func (s *service) ListPublicProductsAndCategories() (map[string]interface{}, error) {
	log.Println("[Service ListPublicProductsAndCategories] Memulai proses...")

	var productsFromDB []models.Product
	var categoriesFromDB []models.ProductCategory

	// 1. Ambil Produk yang "Published"
	if err := s.db.
		Preload("Images").          // Untuk gambar pertama
		Preload("ProductCategory"). // <<< UNTUK MENGAMBIL DATA KATEGORI TERKAIT
		Where("status = ?", "Published").
		Order("created_at desc").
		Find(&productsFromDB).Error; err != nil {
		log.Printf("[Service ListPublicProductsAndCategories] Error mengambil produk: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar produk: %w", err)
	}

	// Mapping produk ke DTO PublicProductGridItem
	publicProducts := make([]PublicProductGridItem, 0, len(productsFromDB))
	for _, p := range productsFromDB { // p adalah models.Product
		var imageUrl string
		if len(p.Images) > 0 && p.Images[0].Image != "" {
			imageUrl = p.Images[0].Image
		}

		var categoryNameFromProduct string
		if p.ProductCategory.CategoryID != "" { // Cek apakah ProductCategory terisi (hasil preload)
			categoryNameFromProduct = p.ProductCategory.CategoryName
		} else {
			log.Printf("[Service ListPublicProductsAndCategories] Peringatan: Produk SKU %s tidak memiliki detail kategori yang ter-preload atau CategoryID tidak valid.\n", p.ProductSKU)
		}

		publicProducts = append(publicProducts, PublicProductGridItem{
			ProductSKU:   p.ProductSKU,
			Title:        p.Title,
			CategoryName: categoryNameFromProduct, // <<< PASTIKAN INI DIISI DENGAN BENAR
			RegularPrice: p.RegularPrice,
			ImageUrl:     imageUrl,
		})
	}

	// 2. Ambil Kategori Produk yang "Published" (atau "active" sesuai status di tabel product_categories)
	if err := s.db.
		Where("status = ?", "published"). // Hanya kategori yang published/active
		Order("category_name asc").
		Find(&categoriesFromDB).Error; err != nil {
		log.Printf("[Service ListPublicProductsAndCategories] Error mengambil kategori produk: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar kategori produk: %w", err)
	}

	// Mapping kategori ke DTO PublicProductCategoryView
	publicCategories := make([]PublicProductCategoryView, 0, len(categoriesFromDB))
	for _, cat := range categoriesFromDB {
		publicCategories = append(publicCategories, PublicProductCategoryView{
			CategoryID:   cat.CategoryID,
			CategoryName: cat.CategoryName,
		})
	}

	responseData := map[string]interface{}{
		"products":   publicProducts,
		"categories": publicCategories,
	}

	log.Printf("[Service ListPublicProductsAndCategories] Berhasil mengambil %d produk dan %d kategori.\n", len(publicProducts), len(publicCategories))
	return responseData, nil
}

func (s *service) GetPublicProductDetail(productSKU string) (PublicProductDetail, error) {
	log.Printf("[Service GetPublicProductDetail] Mengambil detail untuk SKU: %s\n", productSKU)
	var productFromDB models.Product
	var publicProductDetail PublicProductDetail

	// Ambil produk yang statusnya "Published"
	if err := s.db.
		Preload("Images").
		Preload("ProductCategory").
		Where("product_sku = ? AND status = ?", productSKU, "Published").
		First(&productFromDB).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service GetPublicProductDetail] Produk dengan SKU %s (Published) tidak ditemukan.\n", productSKU)
			return publicProductDetail, errors.New("produk tidak ditemukan atau tidak tersedia")
		}
		log.Printf("[Service GetPublicProductDetail] Error mengambil produk SKU %s: %v\n", productSKU, err)
		return publicProductDetail, fmt.Errorf("gagal mengambil detail produk: %w", err)
	}

	// Mapping ke PublicProductDetail DTO
	imageUrls := make([]string, 0, len(productFromDB.Images))
	for _, img := range productFromDB.Images {
		if img.Image != "" {
			imageUrls = append(imageUrls, img.Image) // Path relatif
		}
	}

	publicProductDetail = PublicProductDetail{
		ProductSKU:     productFromDB.ProductSKU,
		Title:          productFromDB.Title,
		Brand:          productFromDB.Brand,
		CategoryName:   productFromDB.ProductCategory.CategoryName,
		PowerSource:    productFromDB.PowerSource,
		WarrantyPeriod: productFromDB.WarrantyPeriod,
		ProductionDate: productFromDB.ProductionDate, // Sudah *time.Time
		Descriptions:   productFromDB.Descriptions,
		Stock:          productFromDB.Stock,
		Status:         productFromDB.Status,
		RegularPrice:   productFromDB.RegularPrice,
		Images:         imageUrls,
	}

	log.Printf("[Service GetPublicProductDetail] Detail untuk SKU %s berhasil diambil.\n", productSKU)
	return publicProductDetail, nil
}

func (s *service) AddToCart(customerID string, input AddToCartInput) (models.Cart, error) {
	log.Printf("[Service AddToCart] CustomerID: %s, ProductSKU: %s, Quantity: %d\n", customerID, input.ProductSKU, input.Quantity)

	var product models.Product // Menggunakan model Product dari package admin
	var cartEntry models.Cart  // Model Cart dari package user (sekarang dengan ProductSKU)
	var finalCartEntry models.Cart

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil detail produk dari tabel 'products'
		if errProduct := tx.Preload("Images").Where("product_sku = ? AND status = ?", input.ProductSKU, "Published").First(&product).Error; errProduct != nil {
			if errors.Is(errProduct, gorm.ErrRecordNotFound) {
				return errors.New("produk tidak ditemukan atau tidak tersedia")
			}
			return fmt.Errorf("gagal memverifikasi produk: %w", errProduct)
		}

		// 2. Cek apakah item produk ini sudah ada di keranjang customer
		//    Sekarang kita bisa cek berdasarkan ProductSKU.
		errSearchCart := tx.Where("customer_id = ? AND product_sku = ?", customerID, input.ProductSKU).First(&cartEntry).Error

		requestedQuantity := input.Quantity
		if requestedQuantity <= 0 {
			requestedQuantity = 1
		}

		var imageToStore string
		if len(product.Images) > 0 && product.Images[0].Image != "" {
			imageToStore = product.Images[0].Image
		} else {
			imageToStore = defaultCustomerImagePath // Gunakan default jika produk tidak punya gambar
		}

		if errors.Is(errSearchCart, gorm.ErrRecordNotFound) {
			// Item BELUM ADA di keranjang, buat entri baru
			if product.Stock < requestedQuantity {
				return fmt.Errorf("stok produk '%s' tidak mencukupi (diminta: %d, tersedia: %d)", product.Title, requestedQuantity, product.Stock)
			}
			cartEntry = models.Cart{
				CustomerID:   customerID,
				ProductSKU:   product.ProductSKU, // <<< SIMPAN ProductSKU
				Image:        imageToStore,
				Title:        product.Title,
				RegularPrice: product.RegularPrice,
				Quantity:     requestedQuantity,
			}
			if errCreate := tx.Create(&cartEntry).Error; errCreate != nil {
				return fmt.Errorf("gagal menambahkan item ke keranjang: %w", errCreate)
			}
			log.Printf("[Service AddToCart] Item baru ditambahkan ke keranjang: %+v\n", cartEntry)
		} else if errSearchCart == nil {
			// Item SUDAH ADA di keranjang, update quantity-nya
			newQuantity := cartEntry.Quantity + requestedQuantity
			if product.Stock < newQuantity {
				return fmt.Errorf("stok produk '%s' tidak mencukupi untuk menambah kuantitas (total diminta: %d, tersedia: %d)", product.Title, newQuantity, product.Stock)
			}
			cartEntry.Quantity = newQuantity
			cartEntry.Title = product.Title               // Update jika nama produk bisa berubah
			cartEntry.RegularPrice = product.RegularPrice // Update jika harga berubah
			cartEntry.Image = imageToStore                // Update jika gambar produk utama berubah

			if errUpdate := tx.Save(&cartEntry).Error; errUpdate != nil {
				return fmt.Errorf("gagal mengupdate kuantitas item di keranjang: %w", errUpdate)
			}
			log.Printf("[Service AddToCart] Kuantitas item di keranjang diupdate: %+v\n", cartEntry)
		} else {
			return fmt.Errorf("gagal memeriksa keranjang: %w", errSearchCart)
		}

		// Ambil kembali cart item yang baru dibuat/diupdate untuk respons
		if err := tx.First(&finalCartEntry, cartEntry.CartID).Error; err != nil {
			return fmt.Errorf("gagal mengambil cart item setelah operasi: %w", err)
		}
		return nil
	})

	if err != nil {
		return models.Cart{}, err
	}
	return finalCartEntry, nil
}

func (s *service) GetCartItems(customerID string) ([]models.Cart, error) {
	var cartItems []models.Cart
	log.Printf("[Service GetCartItems] Mengambil item keranjang untuk Customer ID: %s\n", customerID)

	if err := s.db.Where("customer_id = ?", customerID).Order("created_at DESC").Find(&cartItems).Error; err != nil {
		// gorm.ErrRecordNotFound tidak dianggap error fatal di sini, hanya berarti keranjang kosong.
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service GetCartItems] Error mengambil item keranjang untuk CustomerID %s: %v\n", customerID, err)
			return nil, fmt.Errorf("gagal mengambil item keranjang: %w", err)
		}
		// Jika record tidak ditemukan, kembalikan slice kosong, bukan error
	}

	log.Printf("[Service GetCartItems] Ditemukan %d item di keranjang untuk CustomerID: %s\n", len(cartItems), customerID)
	return cartItems, nil
}

func (s *service) UpdateCartItemQuantity(customerID string, cartItemID uint, newQuantity int) (models.Cart, error) {
	log.Printf("[Service UpdateCartItemQuantity] CustomerID: %s, CartItemID: %d, NewQuantity: %d\n", customerID, cartItemID, newQuantity)

	var cartItem models.Cart
	var product models.Product // Untuk cek stok
	var finalCartItem models.Cart

	if newQuantity < 1 {
		return models.Cart{}, errors.New("kuantitas tidak boleh kurang dari 1")
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil item keranjang, pastikan milik customer yang benar
		if err := tx.Where("cart_id = ? AND customer_id = ?", cartItemID, customerID).First(&cartItem).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("item keranjang tidak ditemukan atau bukan milik Anda")
			}
			return fmt.Errorf("gagal mengambil item keranjang: %w", err)
		}

		// 2. Ambil detail produk untuk cek stok
		if err := tx.Where("product_sku = ?", cartItem.ProductSKU).First(&product).Error; err != nil {
			// Ini seharusnya tidak terjadi jika data di keranjang valid, tapi sebagai pengaman
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("detail produk untuk item keranjang tidak ditemukan")
			}
			return fmt.Errorf("gagal mengambil detail produk: %w", err)
		}

		// 3. Cek stok
		if product.Stock < newQuantity {
			return fmt.Errorf("stok produk '%s' tidak mencukupi (diminta: %d, tersedia: %d)", product.Title, newQuantity, product.Stock)
		}

		// 4. Update kuantitas item keranjang
		cartItem.Quantity = newQuantity
		// Kolom 'Total' akan diupdate otomatis oleh database jika GENERATED
		// GORM akan handle UpdatedAt jika fieldnya ada di struct Cart

		if err := tx.Save(&cartItem).Error; err != nil {
			return fmt.Errorf("gagal mengupdate kuantitas item keranjang: %w", err)
		}

		// Ambil kembali cart item yang sudah diupdate
		if err := tx.First(&finalCartItem, cartItemID).Error; err != nil {
			return fmt.Errorf("gagal mengambil cart item setelah update: %w", err)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		return models.Cart{}, err
	}
	log.Printf("[Service UpdateCartItemQuantity] Kuantitas item keranjang (CartID: %d) berhasil diupdate menjadi %d\n", cartItemID, newQuantity)
	return finalCartItem, nil
}

func (s *service) RemoveCartItem(customerID string, cartItemID uint) error {
	log.Printf("[Service RemoveCartItem] CustomerID: %s, Menghapus CartItemID: %d\n", customerID, cartItemID)

	// Hapus item keranjang berdasarkan CartItemID DAN CustomerID untuk keamanan
	// Ini juga memastikan pengguna hanya bisa menghapus item miliknya sendiri.
	result := s.db.Where("cart_id = ? AND customer_id = ?", cartItemID, customerID).Delete(&models.Cart{})

	if result.Error != nil {
		log.Printf("[Service RemoveCartItem] Error menghapus item keranjang (CartID: %d): %v\n", cartItemID, result.Error)
		return fmt.Errorf("gagal menghapus item dari keranjang: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		log.Printf("[Service RemoveCartItem] Item keranjang (CartID: %d) tidak ditemukan untuk customer %s, atau sudah terhapus.\n", cartItemID, customerID)
		return errors.New("item keranjang tidak ditemukan atau Anda tidak berhak menghapusnya")
	}

	log.Printf("[Service RemoveCartItem] Berhasil menghapus item keranjang (CartID: %d) untuk CustomerID: %s\n", cartItemID, customerID)
	return nil
}

func (s *service) CreateOrderFromCart(customerID string, input CheckoutInput, proofPaymentFileHeader *multipart.FileHeader) (models.Order, error) {
	log.Printf("[Service CreateOrderFromCart] CustomerID: %s, Input: %+v, Ada File Bukti Bayar: %t\n", customerID, input, proofPaymentFileHeader != nil)

	var finalCreatedOrder models.Order
	var calculatedGrandTotal float64 = 0
	var orderItemsToCreate []models.OrderItem // Menggunakan OrderItem dari model.go
	var proofPaymentPath string = ""

	// Mulai transaksi database
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil semua item dari keranjang customer (tabel carts)
		var cartItems []models.Cart // Menggunakan Cart dari model.go
		if err := tx.Where("customer_id = ?", customerID).Find(&cartItems).Error; err != nil {
			log.Printf("[Service CreateOrderFromCart] Error mengambil item keranjang untuk CustomerID %s: %v\n", customerID, err)
			return fmt.Errorf("gagal mengambil item keranjang: %w", err)
		}
		if len(cartItems) == 0 {
			log.Println("[Service CreateOrderFromCart] Keranjang kosong.")
			return errors.New("keranjang Anda kosong, tidak bisa melanjutkan checkout")
		}

		// 2. Validasi alamat pengiriman yang dipilih
		var shippingAddress models.CustomerAddress // Menggunakan CustomerAddress dari model.go
		if err := tx.Where("address_id = ? AND customer_id = ?", input.SelectedAddressID, customerID).First(&shippingAddress).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("[Service CreateOrderFromCart] Alamat pengiriman ID %d tidak ditemukan untuk CustomerID %s.\n", input.SelectedAddressID, customerID)
				return errors.New("alamat pengiriman yang dipilih tidak valid atau bukan milik Anda")
			}
			log.Printf("[Service CreateOrderFromCart] Error validasi alamat CustomerID %s, AlamatID %d: %v\n", customerID, input.SelectedAddressID, err)
			return fmt.Errorf("gagal memvalidasi alamat pengiriman: %w", err)
		}
		// Buat snapshot alamat sebagai string
		addressSnapshot := fmt.Sprintf("%s, %s, %s, %s, %s, %s",
			shippingAddress.Title, shippingAddress.Street,
			shippingAddress.Additional, shippingAddress.DistrictCity,
			shippingAddress.Province, shippingAddress.PostCode)

		// 3. Simpan file bukti pembayaran jika ada dan metode pembayaran memerlukannya
		if proofPaymentFileHeader != nil {
			// (Logika penyimpanan file yang sudah kita diskusikan sebelumnya)
			ext := filepath.Ext(proofPaymentFileHeader.Filename)
			// Buat nama file yang lebih aman dan unik
			uniqueFilename := fmt.Sprintf("proof_%s_%d_%s%s", customerID, time.Now().UnixNano(), uuid.New().String()[:8], ext)
			uploadDir := "./uploads/payments/"
			if errMkdir := os.MkdirAll(uploadDir, os.ModePerm); errMkdir != nil {
				return fmt.Errorf("gagal membuat direktori untuk bukti pembayaran: %w", errMkdir)
			}
			savePathOnDisk := filepath.Join(uploadDir, uniqueFilename)

			src, errOpen := proofPaymentFileHeader.Open()
			if errOpen != nil {
				return fmt.Errorf("gagal membuka file bukti pembayaran: %w", errOpen)
			}
			defer src.Close()

			dst, errCreate := os.Create(savePathOnDisk)
			if errCreate != nil {
				return fmt.Errorf("gagal membuat file tujuan bukti pembayaran: %w", errCreate)
			}
			defer dst.Close()

			if _, errCopy := io.Copy(dst, src); errCopy != nil {
				return fmt.Errorf("gagal menyimpan file bukti pembayaran: %w", errCopy)
			}

			proofPaymentPath = strings.TrimPrefix(filepath.ToSlash(savePathOnDisk), "./")
			log.Printf("[Service CreateOrderFromCart] Bukti pembayaran disimpan ke: %s\n", proofPaymentPath)
		} else if input.PaymentMethod == "Manual Transfer BCA" { // Atau metode lain yang WAJIB bukti transfer
			return errors.New("bukti pembayaran diperlukan untuk metode transfer manual yang Anda pilih")
		}

		// 4. Generate Order ID unik
		var nextVal int
		if err := tx.Raw("SELECT nextval('order_id_seq')").Scan(&nextVal).Error; err != nil {
			log.Printf("[Service CreateOrderFromCart] Error mendapatkan ID berikutnya dari sequence: %v\n", err)
			return fmt.Errorf("gagal mendapatkan ID order: %w", err)
		}
		// Format ID baru: "ORD" + 5 digit angka dengan padding nol (misal: ORD00001)
		// Pastikan ukuran kolom di DB (VARCHAR 10) cukup (ORD + 5 digit = 8 karakter, jadi cukup)
		newOrderID := fmt.Sprintf("ORD%05d", nextVal)
		log.Printf("[Service CreateOrderFromCart] ID Order baru digenerate: %s\n", newOrderID)

		// 5. Ambil detail customer (nama, email, phone) untuk denormalisasi di order header
		var customerDetail models.CustomerDetail
		if err := tx.Where("customer_id = ?", customerID).First(&customerDetail).Error; err != nil {
			// Jika customer_detail tidak ada, ini masalah data. Bisa log atau return error.
			// Untuk contoh ini, kita biarkan field nama/email/phone kosong di order jika detail tidak ada.
			// Atau lebih baik return error jika ini data wajib.
			log.Printf("[Service CreateOrderFromCart] Peringatan: CustomerDetail tidak ditemukan untuk CustomerID %s. Beberapa info order mungkin kosong.\n", customerID)
			// return fmt.Errorf("detail customer tidak ditemukan: %w", err) // Pilih untuk error jika wajib
		}

		// 6. Buat OrderItem untuk setiap item di keranjang dan hitung GrandTotal
		now := time.Now()
		for _, itemInCart := range cartItems {
			var product models.Product // Menggunakan model Product dari package admin
			if err := tx.Preload("Images").Where("product_sku = ?", itemInCart.ProductSKU).First(&product).Error; err != nil {
				return fmt.Errorf("produk dengan SKU %s di keranjang tidak ditemukan: %w", itemInCart.ProductSKU, err)
			}
			if product.Stock < itemInCart.Quantity {
				return fmt.Errorf("stok produk '%s' tidak mencukupi (tersisa: %d, diminta: %d)", product.Title, product.Stock, itemInCart.Quantity)
			}

			orderItem := models.OrderItem{ // Menggunakan OrderItem dari model.go
				OrderID:              newOrderID,
				ProductSKU:           itemInCart.ProductSKU,
				Quantity:             itemInCart.Quantity,
				PriceAtOrder:         itemInCart.RegularPrice, // Ambil harga dari keranjang (snapshot)
				ProductTitleSnapshot: itemInCart.Title,        // Ambil judul dari keranjang (snapshot)
				ProductImageSnapshot: itemInCart.Image,        // Ambil gambar dari keranjang (snapshot)
				// SubTotal akan di-generate DB
				// Atribut lain seperti customer_id, date_time, payment, status, dll. TIDAK di sini sesuai DDL order_items ramping
			}
			orderItemsToCreate = append(orderItemsToCreate, orderItem)
			calculatedGrandTotal += (itemInCart.RegularPrice * float64(itemInCart.Quantity))

			// Kurangi stok produk
			newStock := product.Stock - itemInCart.Quantity
			if err := tx.Model(&models.Product{}).Where("product_sku = ?", itemInCart.ProductSKU).Update("stock", newStock).Error; err != nil {
				return fmt.Errorf("gagal mengupdate stok produk %s: %w", itemInCart.ProductSKU, err)
			}
		}

		// 7. Buat record Order utama
		order := models.Order{
			OrderID:                 newOrderID,
			CustomerID:              customerID,
			CustomerFullname:        customerDetail.FirstName + " " + customerDetail.LastName,
			CustomerEmail:           customerDetail.Email,      // Atau dari customer.Email jika lebih utama
			CustomerPhone:           customerDetail.Phone,      // Atau dari customer.Phone
			ShippingAddressID:       shippingAddress.AddressID, // Dari alamat yang divalidasi
			ShippingAddressSnapshot: addressSnapshot,
			OrderDateTime:           now,
			PaymentMethod:           input.PaymentMethod,
			OrderStatus:             "Pending", // Status awal order (sesuai DDL Anda 'Pending')
			GrandTotal:              calculatedGrandTotal,
			Notes:                   input.Notes,
			ProofOfPayment:          proofPaymentPath,
		}
		if err := tx.Create(&order).Error; err != nil {
			return fmt.Errorf("gagal membuat order: %w", err)
		}

		// 8. Simpan semua OrderItem
		if len(orderItemsToCreate) > 0 {
			if err := tx.Create(&orderItemsToCreate).Error; err != nil {
				return fmt.Errorf("gagal menyimpan item order: %w", err)
			}
		}

		// 9. Hapus item dari keranjang customer setelah checkout berhasil
		if err := tx.Where("customer_id = ?", customerID).Delete(&models.Cart{}).Error; err != nil {
			log.Printf("[Service CreateOrderFromCart] Peringatan: Gagal menghapus item dari keranjang CustomerID %s: %v\n", customerID, err)
			// Tidak menggagalkan transaksi utama
		}

		// Ambil kembali order dengan detail lengkapnya (termasuk OrderItems dan info Customer) untuk dikembalikan
		if err := tx.Preload("OrderItems").Preload("Customer.Detail").Preload("ShippingAddress").First(&finalCreatedOrder, "order_id = ?", newOrderID).Error; err != nil {
			return fmt.Errorf("gagal mengambil data order lengkap setelah create: %w", err)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		if proofPaymentPath != "" { // Jika transaksi gagal dan file sempat tersimpan, coba hapus
			if errRemove := os.Remove(filepath.Join(".", proofPaymentPath)); errRemove != nil {
				log.Printf("[Service CreateOrderFromCart] Gagal menghapus bukti pembayaran sementara setelah transaksi gagal: %v\n", errRemove)
			} else {
				log.Printf("[Service CreateOrderFromCart] Transaksi gagal, menghapus file bukti pembayaran sementara: %s\n", proofPaymentPath)
			}
		}
		return models.Order{}, err
	}

	log.Printf("[Service CreateOrderFromCart] Order %s berhasil dibuat.\n", finalCreatedOrder.OrderID)
	return finalCreatedOrder, nil
}

func (s *service) ListCustomerOrders(customerID string) ([]OrderHistoryItem, error) {
	var ordersFromDB []models.Order
	log.Printf("[Service ListCustomerOrders] Mengambil riwayat pesanan untuk Customer ID: %s\n", customerID)

	// 1. Ambil semua order milik customer, diurutkan dari yang terbaru
	//    Sangat penting untuk Preload("OrderItems") agar kita bisa mengambil gambar produk
	if err := s.db.
		Preload("OrderItems").
		Where("customer_id = ?", customerID).
		Order("order_date_time DESC").
		Find(&ordersFromDB).Error; err != nil {

		log.Printf("[Service ListCustomerOrders] Error mengambil order untuk CustomerID %s: %v\n", customerID, err)
		return nil, fmt.Errorf("gagal mengambil riwayat pesanan: %w", err)
	}

	// 2. Mapping hasil query ke DTO OrderHistoryItem
	orderHistory := make([]OrderHistoryItem, 0, len(ordersFromDB))
	for _, order := range ordersFromDB {
		itemImages := make([]string, 0)
		// Ambil maksimal 3 gambar dari order item untuk ditampilkan di list
		for i, item := range order.OrderItems {
			if i >= 3 { // Batasi hanya 3 gambar
				break
			}
			if item.ProductImageSnapshot != "" {
				itemImages = append(itemImages, item.ProductImageSnapshot)
			}
		}

		historyItem := OrderHistoryItem{
			OrderID:       order.OrderID,
			OrderDateTime: order.OrderDateTime,
			GrandTotal:    order.GrandTotal,
			OrderStatus:   order.OrderStatus,
			ItemImages:    itemImages,
		}
		orderHistory = append(orderHistory, historyItem)
	}

	log.Printf("[Service ListCustomerOrders] Ditemukan %d pesanan untuk CustomerID: %s\n", len(orderHistory), customerID)
	return orderHistory, nil
}

func (s *service) GetNewsPageData(page, limit int) (NewsPageData, error) {
	var pageData NewsPageData
	var totalPosts int64
	now := time.Now()

	// --- 1. Ambil Kategori Berita & Hitung Jumlah Postingan ---
	var categoriesWithCount []PublicNewsCategoryWithCount
	// Query ini mengambil kategori yang Published dan menghitung jumlah berita Published di dalamnya
	err := s.db.Model(&models.NewsCategory{}).
		Select("news_categories.category_id, news_categories.category_name, COUNT(news.news_id) as post_count").
		Joins("LEFT JOIN news ON news.category_id = news_categories.category_id AND news.status = 'Published' AND news.publication_date <= ?", now).
		Where("news_categories.status = ?", "Published").
		Group("news_categories.category_id").
		Order("news_categories.category_name ASC").
		Scan(&categoriesWithCount).Error
	if err != nil {
		log.Printf("[Service GetNewsPageData] Error mengambil kategori: %v\n", err)
		return pageData, fmt.Errorf("gagal mengambil kategori berita: %w", err)
	}
	pageData.Categories = categoriesWithCount

	// --- 2. Hitung Total Postingan untuk Pagination ---
	if err := s.db.Model(&models.NewsPost{}).Where("status = ? AND publication_date <= ?", "Published", now).Count(&totalPosts).Error; err != nil {
		log.Printf("[Service GetNewsPageData] Error menghitung total berita: %v\n", err)
		return pageData, fmt.Errorf("gagal menghitung total berita: %w", err)
	}

	// Isi data pagination
	pageData.Pagination = PaginationData{
		CurrentPage:  page,
		TotalRecords: totalPosts,
		TotalPages:   int(math.Ceil(float64(totalPosts) / float64(limit))),
	}

	// --- 3. Ambil Daftar Berita Sesuai Halaman (Paginated) ---
	var newsPostsFromDB []models.NewsPost
	offset := (page - 1) * limit
	if err := s.db.
		Preload("Author"). // Untuk mendapatkan nama penulis
		Where("status = ? AND publication_date <= ?", "Published", now).
		Order("publication_date DESC").
		Limit(limit).
		Offset(offset).
		Find(&newsPostsFromDB).Error; err != nil {
		log.Printf("[Service GetNewsPageData] Error mengambil daftar berita: %v\n", err)
		return pageData, fmt.Errorf("gagal mengambil daftar berita: %w", err)
	}

	p := bluemonday.StripTagsPolicy()
	// Mapping ke DTO PublicNewsListItem
	for _, post := range newsPostsFromDB {
		// 1. Bersihkan tag HTML dari konten
		plainTextContent := p.Sanitize(post.Content)

		// 2. Buat snippet dari teks bersih
		snippet := plainTextContent
		if len(snippet) > 150 { // Potong setelah 150 karakter
			snippet = snippet[:150] + "..."
		}

		pageData.NewsPosts = append(pageData.NewsPosts, PublicNewsListItem{
			NewsID:          post.NewsID,
			Title:           post.Title,
			Image:           post.Image,
			PublicationDate: post.PublicationDate,
			AuthorName:      post.Author.FullName,
			ContentSnippet:  snippet, // Gunakan snippet yang sudah bersih
		})
	}

	return pageData, nil
}

func (s *service) GetNewsDetailPageData(newsID string) (NewsDetailPageData, error) {
	var pageData NewsDetailPageData
	now := time.Now()

	// --- 1. Ambil Detail Post Utama ---
	var postFromDB models.NewsPost
	if err := s.db.
		Preload("Author").
		Preload("NewsCategory").
		Where("news_id = ? AND status = ? AND publication_date <= ?", newsID, "Published", now).
		First(&postFromDB).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pageData, errors.New("postingan berita tidak ditemukan atau belum dipublikasikan")
		}
		return pageData, fmt.Errorf("gagal mengambil detail berita: %w", err)
	}

	pageData.PostDetail = PublicNewsPostDetail{
		NewsID:          postFromDB.NewsID,
		Title:           postFromDB.Title,
		Image:           postFromDB.Image,
		Content:         postFromDB.Content,
		PublicationDate: postFromDB.PublicationDate,
		Status:          postFromDB.Status,
		Author: NewsAuthorInfo{
			FullName: postFromDB.Author.FullName,
			Image:    postFromDB.Author.Image,
		},
		CategoryName: postFromDB.NewsCategory.CategoryName,
	}

	// --- 2. Ambil Daftar Kategori (logika sama seperti GetNewsPageData) ---
	var categoriesWithCount []PublicNewsCategoryWithCount
	if err := s.db.Model(&models.NewsCategory{}).
		Select("news_categories.category_id, news_categories.category_name, COUNT(news.news_id) as post_count").
		Joins("LEFT JOIN news ON news.category_id = news_categories.category_id AND news.status = 'Published' AND news.publication_date <= ?", now).
		Where("news_categories.status = ?", "Published").
		Group("news_categories.category_id").
		Order("news_categories.category_name ASC").
		Scan(&categoriesWithCount).Error; err != nil {
		log.Printf("[Service GetNewsDetailPageData] Peringatan: Gagal mengambil kategori: %v\n", err)
	}
	pageData.Categories = categoriesWithCount

	// --- 3. Ambil 3 Berita Terbaru (Recent Posts), kecuali yang sedang dilihat ---
	var recentPostsFromDB []models.NewsPost
	if err := s.db.
		Preload("Author").
		Where("status = ? AND publication_date <= ? AND news_id != ?", "Published", now, newsID).
		Order("publication_date DESC").
		Limit(3).
		Find(&recentPostsFromDB).Error; err != nil {
		log.Printf("[Service GetNewsDetailPageData] Peringatan: Gagal mengambil berita terbaru: %v\n", err)
	}
	// Mapping ke DTO
	for _, post := range recentPostsFromDB {
		pageData.RecentPosts = append(pageData.RecentPosts, PublicNewsListItem{
			NewsID:          post.NewsID,
			Title:           post.Title,
			Image:           post.Image,
			PublicationDate: post.PublicationDate,
			AuthorName:      post.Author.FullName,
		})
	}

	return pageData, nil
}
