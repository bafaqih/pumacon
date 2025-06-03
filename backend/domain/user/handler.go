// user/handler.go
package user

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	// "strings" // Uncomment jika diperlukan untuk error handling spesifik

	"github.com/gin-gonic/gin"
)

// Input untuk registrasi (sudah ada)
// type RegisterInput struct { ... }

type Handler interface {
	RegisterCustomer(c *gin.Context)
	LoginCustomer(c *gin.Context) // Pastikan sudah ada di interface
	GetCustomerProfile(c *gin.Context)
	GetAddresses(c *gin.Context)
	AddAddress(c *gin.Context)
	UpdateAddress(c *gin.Context)
	UpdateCustomerProfile(c *gin.Context)
	ChangeCustomerPassword(c *gin.Context)
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
	// Mengambil customerID dari context yang diset oleh CustomerAuthMiddleware
	customerID, exists := c.Get("customer_id_from_token")
	if !exists {
		log.Println("[Handler GetCustomerProfile] Customer ID tidak ditemukan di context.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}

	profile, err := h.svc.GetCustomerProfile(customerID.(string))
	if err != nil {
		if strings.Contains(err.Error(), "customer tidak ditemukan") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profil customer tidak ditemukan."})
			return
		}
		log.Printf("[Handler GetCustomerProfile] Gagal mengambil profil customer: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil profil customer.", "details": err.Error()})
		return
	}

	// Kirim data profil yang relevan (tanpa password)
	// Pastikan struktur ini cocok dengan ekspektasi frontend di SidebarAccount.jsx
	c.JSON(http.StatusOK, gin.H{
		"customerID": profile.CustomerID, // Gunakan customerID sesuai frontend
		"email":      profile.Email,
		"phone":      profile.Phone,
		"detail": gin.H{ // Ini adalah objek detail yang frontend cari
			"first_name": profile.Detail.FirstName, // Sesuaikan dengan field di model CustomerDetail
			"last_name":  profile.Detail.LastName,  // Sesuaikan dengan field di model CustomerDetail
			"image":      profile.Detail.Image,     // Sesuaikan dengan field di model CustomerDetail
			"join_date":  profile.Detail.JoinDate,
			"birthday":   profile.Detail.Birthday,
		},
		"addresses": profile.Addresses, // Alamat juga akan ter-preload jika ada
		// Anda bisa menambahkan hasAddress di sini juga untuk konsistensi,
		// meskipun frontend sudah menanganinya saat login dan di AccountAddress.jsx
		"hasAddress": len(profile.Addresses) > 0,
	})
}

func (h *handler) GetAddresses(c *gin.Context) {
	customerID, exists := c.Get("customer_id_from_token") // Ambil customerID dari middleware
	if !exists {
		log.Println("[Handler GetAddresses] Customer ID tidak ditemukan di context.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}

	addresses, err := h.svc.GetAddressesByCustomerID(customerID.(string))
	if err != nil {
		log.Printf("[Handler GetAddresses] Gagal mengambil alamat untuk customer ID %s: %v\n", customerID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil alamat.", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"addresses": addresses})
}

func (h *handler) AddAddress(c *gin.Context) {
	customerID, exists := c.Get("customer_id_from_token") // Ambil customerID dari middleware
	if !exists {
		log.Println("[Handler AddAddress] Customer ID tidak ditemukan di context.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}

	var newAddress CustomerAddress
	if err := c.ShouldBindJSON(&newAddress); err != nil {
		log.Printf("[Handler AddAddress] Input alamat tidak valid: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input alamat tidak valid", "details": err.Error()})
		return
	}

	// Jangan izinkan client menyertakan AddressID (auto-increment)
	newAddress.AddressID = 0
	// Jangan izinkan client menyertakan CustomerID (ambil dari token)
	newAddress.CustomerID = ""
	// Jangan izinkan client menyertakan CreatedAt/UpdatedAt
	newAddress.CreatedAt = time.Time{}
	newAddress.UpdatedAt = time.Time{}

	address, err := h.svc.AddAddress(customerID.(string), newAddress)
	if err != nil {
		log.Printf("[Handler AddAddress] Gagal menambahkan alamat untuk customer ID %s: %v\n", customerID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan alamat.", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Alamat berhasil ditambahkan", "address": address})
}

func (h *handler) UpdateAddress(c *gin.Context) {
	customerID, exists := c.Get("customer_id_from_token") // Ambil customerID dari middleware
	if !exists {
		log.Println("[Handler UpdateAddress] Customer ID tidak ditemukan di context.")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Customer ID tidak ditemukan."})
		return
	}

	addressIDStr := c.Param("id")
	addressID, err := strconv.ParseUint(addressIDStr, 10, 32) // Parse string ID dari URL ke uint
	if err != nil {
		log.Printf("[Handler UpdateAddress] Format Address ID tidak valid: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format Address ID tidak valid"})
		return
	}

	var updatedAddress CustomerAddress
	if err := c.ShouldBindJSON(&updatedAddress); err != nil {
		log.Printf("[Handler UpdateAddress] Input alamat tidak valid: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input alamat tidak valid", "details": err.Error()})
		return
	}

	// Jangan izinkan client untuk mengubah AddressID atau CustomerID melalui body request
	// Pastikan hanya field yang diizinkan untuk diupdate yang diterima.
	// updatedAddress.AddressID = uint(addressID) // Ini akan diabaikan oleh service
	// updatedAddress.CustomerID = "" // Akan diset di service

	address, serviceErr := h.svc.UpdateAddress(customerID.(string), uint(addressID), updatedAddress)
	if serviceErr != nil {
		log.Printf("[Handler UpdateAddress] Gagal mengupdate alamat ID %d untuk customer ID %s: %v\n", uint(addressID), customerID, serviceErr)
		if serviceErr.Error() == "address not found or does not belong to this customer" || strings.Contains(serviceErr.Error(), "cannot unmark default address") {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate alamat.", "details": serviceErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Alamat berhasil diupdate", "address": address})
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
