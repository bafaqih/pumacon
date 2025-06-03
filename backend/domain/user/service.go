// user/service.go
package user

import (
	"errors" // <--- TAMBAHKAN IMPORT INI
	"fmt"    // <--- TAMBAHKAN IMPORT INI
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	// Default path untuk gambar profil customer baru
	defaultCustomerImagePath = "uploads/images/profile/avatar-1.jpg" // Sesuaikan jika perlu
	// Durasi token JWT untuk customer (misalnya, 7 hari)
	customerJwtExpirationTime = 7 * 24 * time.Hour
)

// JwtCustomClaims (tetap sama)
type CustomerJwtCustomClaims struct {
	CustomerID string `json:"customer_id"`
	Email      string `json:"email"`
	// Anda bisa menambahkan 'type': 'customer' jika perlu membedakan dengan token admin
	jwt.RegisteredClaims
}

type Service interface {
	RegisterCustomer(input CustomerRegisterInput) (Customer, error)
	LoginCustomer(input CustomerLoginInput) (CustomerLoginResponse, error)
	GetCustomerProfile(customerID string) (Customer, error) // <<< HAPUS KOMENTAR LINTER DARI SINI
	GetAddressesByCustomerID(customerID string) ([]CustomerAddress, error)
	AddAddress(customerID string, address CustomerAddress) (*CustomerAddress, error)
	UpdateAddress(customerID string, addressID uint, updatedAddress CustomerAddress) (*CustomerAddress, error)
	UpdateCustomerProfile(customerID string, input CustomerProfileUpdateInput) (*Customer, error)
	ChangeCustomerPassword(customerID string, input CustomerPasswordUpdateInput) error
}

func NewService(db *gorm.DB, jwtSecret []byte) Service {
	return &service{db: db, jwtSecret: jwtSecret}
}

type service struct {
	db        *gorm.DB
	jwtSecret []byte
}

func (s *service) generateJWTToken(customer Customer) (string, error) {
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

func (s *service) RegisterCustomer(input CustomerRegisterInput) (Customer, error) {
	log.Printf("[Service RegisterCustomer] Memulai registrasi untuk email: %s\n", input.Email)
	var finalCreatedCustomer Customer

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Cek apakah email sudah terdaftar di tabel 'customers'
		var existingCustomerCount int64
		tx.Model(&Customer{}).Where("email = ?", input.Email).Count(&existingCustomerCount)
		if existingCustomerCount > 0 {
			log.Printf("[Service RegisterCustomer] Email '%s' sudah terdaftar.\n", input.Email)
			return errors.New("email sudah terdaftar")
		}
		// Tidak perlu cek di customer_details untuk email karena diasumsikan email di customers adalah sumber utama

		// 2. Generate Customer ID unik
		var newCustomerID string
		for {
			newCustomerID = generateCustomerID() // Dari model.go
			var tempCustomer Customer
			if errGen := tx.Where("customer_id = ?", newCustomerID).First(&tempCustomer).Error; errGen != nil {
				if errors.Is(errGen, gorm.ErrRecordNotFound) {
					break // ID unik
				}
				log.Printf("[Service RegisterCustomer] Error saat verifikasi Customer ID: %v\n", errGen)
				return fmt.Errorf("gagal memverifikasi ID customer: %w", errGen)
			}
			log.Printf("[Service RegisterCustomer] Customer ID %s sudah ada, generate ulang.\n", newCustomerID)
		}

		// 3. Hash password
		hashedPassword, errHash := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if errHash != nil {
			log.Printf("[Service RegisterCustomer] Gagal hash password: %v\n", errHash)
			return fmt.Errorf("gagal memproses password: %w", errHash)
		}

		// 4. Buat instance Customer (tabel customers)
		customer := Customer{
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
		customerDetail := CustomerDetail{
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
		return Customer{}, err // Kembalikan error dari transaksi
	}

	log.Printf("[Service RegisterCustomer] Customer '%s' (ID: %s) berhasil diregistrasi.\n", finalCreatedCustomer.Email, finalCreatedCustomer.CustomerID)
	return finalCreatedCustomer, nil
}

func (s *service) generateJWTTokenForCustomer(customer Customer) (string, error) {
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
	var customer Customer
	var response CustomerLoginResponse

	log.Printf("[Service LoginCustomer] Mencoba login untuk email: %s\n", input.Email)

	// 1. Cari customer berdasarkan email & preload Detail (untuk nama depan & belakang)
	if err := s.db.Preload("Detail").Where("email = ?", input.Email).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service LoginCustomer] Email '%s' tidak terdaftar.\n", input.Email)
			return response, errors.New("email atau password salah") // Pesan generik
		}
		log.Printf("[Service LoginCustomer] Error query customer: %v\n", err)
		return response, fmt.Errorf("gagal mencari customer: %w", err)
	}

	// 2. Bandingkan password
	if err := bcrypt.CompareHashAndPassword([]byte(customer.Password), []byte(input.Password)); err != nil {
		log.Printf("[Service LoginCustomer] Password salah untuk email '%s'.\n", input.Email)
		return response, errors.New("email atau password salah") // Pesan generik
	}

	// 3. Generate JWT token
	tokenString, err := s.generateJWTTokenForCustomer(customer)
	if err != nil {
		// Error sudah di-log di dalam generateJWTTokenForCustomer
		return response, err // Teruskan error dari pembuatan token
	}

	// 4. Cek apakah customer memiliki alamat di tabel 'customer_addresses'
	var addressCount int64
	if err := s.db.Model(&CustomerAddress{}).Where("customer_id = ?", customer.CustomerID).Count(&addressCount).Error; err != nil {
		log.Printf("[Service LoginCustomer] Error saat menghitung alamat untuk CustomerID %s: %v. Menganggap belum ada alamat.\n", customer.CustomerID, err)
		response.HasAddress = false
	} else {
		response.HasAddress = addressCount > 0
	}

	response.Token = tokenString
	response.CustomerID = customer.CustomerID
	response.Email = customer.Email
	if customer.Detail.CustomerID != "" { // Pastikan Detail ada dan terisi
		response.FirstName = customer.Detail.FirstName
		response.LastName = customer.Detail.LastName
	} else {
		log.Printf("[Service LoginCustomer] Peringatan: CustomerDetail tidak ditemukan atau kosong untuk CustomerID %s\n", customer.CustomerID)
		// Anda bisa set default atau biarkan kosong jika memang bisa terjadi
		response.FirstName = ""
		response.LastName = ""
	}

	log.Printf("[Service LoginCustomer] Customer '%s' (ID: %s) login berhasil. HasAddress: %t\n", customer.Email, customer.CustomerID, response.HasAddress)
	return response, nil
}

func (s *service) GetCustomerProfile(customerID string) (Customer, error) {
	// Placeholder
	log.Printf("[Service GetCustomerProfile] Mengambil profil untuk Customer ID: %s (belum diimplementasikan penuh)\n", customerID)
	var customer Customer
	// Di sini Anda akan preload Detail dan Addresses
	if err := s.db.Preload("Detail").Preload("Addresses").Where("customer_id = ?", customerID).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Customer{}, errors.New("customer tidak ditemukan")
		}
		return Customer{}, fmt.Errorf("gagal mengambil profil customer: %w", err)
	}
	return customer, nil
}

func (s *service) GetAddressesByCustomerID(customerID string) ([]CustomerAddress, error) {
	var addresses []CustomerAddress
	// Mencari alamat berdasarkan CustomerID dan mengurutkan berdasarkan IsDefault (Primary)
	// Urutkan juga berdasarkan CreatedAt (terbaru dulu)
	if err := s.db.Where("customer_id = ?", customerID).Order("is_default DESC, created_at DESC").Find(&addresses).Error; err != nil {
		return nil, fmt.Errorf("failed to get addresses for customer %s: %w", customerID, err)
	}
	log.Printf("[Service GetAddressesByCustomerID] Ditemukan %d alamat untuk CustomerID: %s\n", len(addresses), customerID)
	return addresses, nil
}

func (s *service) AddAddress(customerID string, address CustomerAddress) (*CustomerAddress, error) {
	address.CustomerID = customerID // Pastikan CustomerID diset dari token

	log.Printf("[Service AddAddress] Menambahkan alamat baru untuk CustomerID %s. IsDefault: %t\n", customerID, address.IsDefault)

	// Jika alamat yang ditambahkan adalah default, set semua alamat lain ke non-default
	if address.IsDefault {
		log.Printf("[Service AddAddress] Alamat baru diset sebagai default. Mengatur alamat lama menjadi non-default.\n")
		if err := s.db.Model(&CustomerAddress{}).Where("customer_id = ?", customerID).Update("is_default", false).Error; err != nil {
			return nil, fmt.Errorf("failed to unset old default address: %w", err)
		}
	} else {
		// Jika ini alamat pertama dan tidak secara eksplisit diset default, set sebagai default
		var count int64
		s.db.Model(&CustomerAddress{}).Where("customer_id = ?", customerID).Count(&count)
		if count == 0 {
			log.Printf("[Service AddAddress] Ini adalah alamat pertama untuk CustomerID %s. Otomatis diset sebagai default.\n", customerID)
			address.IsDefault = true
		}
	}

	if err := s.db.Create(&address).Error; err != nil {
		log.Printf("[Service AddAddress] Gagal menambahkan alamat untuk CustomerID %s: %v\n", customerID, err)
		return nil, fmt.Errorf("failed to add address: %w", err)
	}
	log.Printf("[Service AddAddress] Alamat berhasil ditambahkan. ID: %d\n", address.AddressID)
	return &address, nil
}

func (s *service) UpdateAddress(customerID string, addressID uint, updatedAddress CustomerAddress) (*CustomerAddress, error) {
	var existingAddress CustomerAddress

	log.Printf("[Service UpdateAddress] Mengupdate alamat ID %d untuk CustomerID %s.\n", addressID, customerID)

	// Cari alamat dan pastikan itu milik customer yang sedang login
	if err := s.db.Where("address_id = ? AND customer_id = ?", addressID, customerID).First(&existingAddress).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service UpdateAddress] Alamat ID %d tidak ditemukan atau bukan milik CustomerID %s.\n", addressID, customerID)
			return nil, errors.New("address not found or does not belong to this customer")
		}
		log.Printf("[Service UpdateAddress] Gagal mencari alamat ID %d: %v\n", addressID, err)
		return nil, fmt.Errorf("failed to find address for update: %w", err)
	}

	// Simpan status IsDefault lama untuk perbandingan
	oldIsDefault := existingAddress.IsDefault

	// Update fields
	existingAddress.Title = updatedAddress.Title
	existingAddress.Street = updatedAddress.Street
	existingAddress.Additional = updatedAddress.Additional
	existingAddress.DistrictCity = updatedAddress.DistrictCity
	existingAddress.Province = updatedAddress.Province
	existingAddress.PostCode = updatedAddress.PostCode
	existingAddress.IsDefault = updatedAddress.IsDefault // Update status IsDefault dari input

	// Logika untuk is_default address saat update
	if updatedAddress.IsDefault && !oldIsDefault { // Jika diubah menjadi default (sebelumnya bukan default)
		log.Printf("[Service UpdateAddress] Alamat ID %d diubah menjadi default. Mengatur alamat lama lainnya menjadi non-default.\n", addressID)
		if err := s.db.Model(&CustomerAddress{}).Where("customer_id = ?", customerID).Update("is_default", false).Error; err != nil {
			log.Printf("[Service UpdateAddress] Gagal mengatur alamat lama menjadi non-default: %v\n", err)
			return nil, fmt.Errorf("failed to unset old default address during update: %w", err)
		}
		// existingAddress.IsDefault sudah diset di atas
	} else if !updatedAddress.IsDefault && oldIsDefault { // Jika diubah dari default (sebelumnya default)
		// Cek jika ini satu-satunya alamat, jangan izinkan diubah dari default
		var count int64
		s.db.Model(&CustomerAddress{}).Where("customer_id = ?", customerID).Count(&count)
		if count == 1 {
			log.Printf("[Service UpdateAddress] Gagal unmark default alamat ID %d: Ini adalah satu-satunya alamat.\n", addressID)
			return nil, errors.New("cannot unmark default address if it's the only address")
		}
		// existingAddress.IsDefault sudah diset di atas
	}

	if err := s.db.Save(&existingAddress).Error; err != nil {
		log.Printf("[Service UpdateAddress] Gagal menyimpan update alamat ID %d: %v\n", addressID, err)
		return nil, fmt.Errorf("failed to update address: %w", err)
	}
	log.Printf("[Service UpdateAddress] Alamat ID %d berhasil diupdate.\n", addressID)
	return &existingAddress, nil
}

func (s *service) UpdateCustomerProfile(customerID string, input CustomerProfileUpdateInput) (*Customer, error) {
	var customer Customer
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
	var customer Customer
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
