package user

import (
	"math/rand"
	"strconv"
	"time"
)

type Customer struct {
	CustomerID string            `gorm:"primaryKey;size:13"`       // Format: CUSXXXXXXXXXX
	Email      string            `gorm:"not null;unique;size:255"` // Email untuk login, harus unik
	Phone      string            `gorm:"size:20"`
	Password   string            `gorm:"not null;size:255"`                           // Akan disimpan sebagai hash bcrypt
	Detail     CustomerDetail    `gorm:"foreignKey:CustomerID;references:CustomerID"` // Relasi one-to-one
	Addresses  []CustomerAddress `gorm:"foreignKey:CustomerID;references:CustomerID"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (Customer) TableName() string { return "customers" }

type CustomerDetail struct {
	CustomerID string     `gorm:"primaryKey;size:13"` // PK dan FK ke customers.customer_id
	FirstName  string     `gorm:"not null;size:100"`
	LastName   string     `gorm:"not null;size:100"`
	Image      string     `gorm:"type:text"`                // Default path akan diisi service
	Email      string     `gorm:"not null;unique;size:255"` // Direplikasi dari tabel customers, juga unik
	Phone      string     `gorm:"size:20"`                  // Direplikasi
	JoinDate   time.Time  `gorm:"type:date"`                // Tanggal registrasi
	Birthday   *time.Time `gorm:"type:date"`                // Pointer agar bisa NULL, diisi nanti
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (CustomerDetail) TableName() string { return "customer_details" }

type CustomerAddress struct {
	AddressID    uint   `gorm:"primaryKey"`             // ID unik auto-increment untuk setiap record alamat
	CustomerID   string `gorm:"size:13;index;not null"` // Foreign Key ke customers.customer_id
	Title        string `gorm:"not null;size:100"`      // Mis: "Rumah", "Kantor", "Apartemen Ayah"
	Street       string `gorm:"not null;size:255"`
	Additional   string `gorm:"size:100"`                               // Mis: Blok A No. 12, Lantai 3, Patokan dekat Indomaret
	DistrictCity string `gorm:"column:district_city;not null;size:100"` // Kecamatan/Kota
	Province     string `gorm:"not null;size:100"`
	PostCode     string `gorm:"column:post_code;not null;size:10"` // Kode Pos (VARCHAR untuk fleksibilitas)
	IsDefault    bool   `gorm:"default:false"`                     // Opsional: untuk menandai alamat pengiriman utama
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (CustomerAddress) TableName() string { return "customer_addresses" }

// Input untuk registrasi (sama seperti sebelumnya)
type CustomerRegisterInput struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Phone     string `json:"phone"` // Bisa opsional di frontend, sesuaikan binding jika wajib
	Password  string `json:"password" binding:"required,min=6"`
}

type CustomerLoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func generateCustomerID() string {
	randomNumber := ""
	for i := 0; i < 10; i++ {
		randomNumber += strconv.Itoa(rand.Intn(10))
	}
	return "CST" + randomNumber
}

type CustomerLoginResponse struct {
	Token      string `json:"token"`
	CustomerID string `json:"customer_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Email      string `json:"email"`
	HasAddress bool   `json:"hasAddress"`
}

type CustomerProfileUpdateInput struct {
	FirstName string     `json:"first_name" binding:"required"`
	LastName  string     `json:"last_name" binding:"required"`
	Phone     string     `json:"phone"`
	Birthday  *time.Time `json:"birthday" time_format:"2006-01-02T15:04:05Z07:00"` // Sesuaikan format waktu jika perlu
	// Image update akan lebih kompleks, bisa ditangani terpisah (misal: /user/profile/image)
}

type CustomerPasswordUpdateInput struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}
