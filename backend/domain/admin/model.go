package admin

import (
	"math/rand"
	"strconv"
	"time"
)

type EmployeeAccount struct {
	EmployeeID string `gorm:"primaryKey;size:13"` // Foreign Key ke employees.employee_id dan Primary Key di sini
	FullName   string `gorm:"not null"`
	Role       string `gorm:"not null"`
	Password   string `gorm:"not null"` // Hash password
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type AdminRegisterInput struct {
	EmployeeID string `json:"employee_id" binding:"required"`
	Password   string `json:"password" binding:"required,min=6"`
}

type AdminLoginInput struct {
	EmployeeID string `json:"employee_id" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

func (EmployeeAccount) TableName() string {
	return "employees_account"
}

type Employee struct {
	EmployeeID     string    `gorm:"primaryKey;size:13"` // EMP + 10 angka
	Image          string    // Path atau URL gambar
	FullName       string    `gorm:"not null"`
	Birthday       time.Time // Akan di-parse dari string
	Department     string    `gorm:"column:department;size:7;index"`
	DepartmentName string    `gorm:"-"`
	Email          string    `gorm:"unique;not null"` // Email employee harus unik
	Phone          string
	JoinDate       time.Time // Akan di-parse dari string
	Role           string
	Status         string          // Mis: "active", "inactive", "probation"
	Address        EmployeeAddress `gorm:"foreignKey:EmployeeID;references:EmployeeID"` // Relasi one-to-one
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type EmployeeAddress struct {
	EmployeeID   string `gorm:"primaryKey;size:13"`
	Street       string
	DistrictCity string
	Province     string
	PostCode     string
	Country      string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (EmployeeAddress) TableName() string {
	return "employees_address"
}

type AddEmployeeAddressInput struct {
	Street       string `json:"street" binding:"required"`
	DistrictCity string `json:"district_city" binding:"required"`
	Province     string `json:"province" binding:"required"`
	PostCode     string `json:"post_code" binding:"required"`
	Country      string `json:"country" binding:"required"`
}

type AddEmployeeInput struct {
	Image        string                  `json:"image"`
	FullName     string                  `json:"full_name" binding:"required"`
	Birthday     string                  `json:"birthday" binding:"required"` // Format: "YYYY-MM-DD"
	DepartmentID string                  `json:"department_id" binding:"required"`
	Email        string                  `json:"email" binding:"required,email"`
	Phone        string                  `json:"phone" binding:"required"`
	JoinDate     string                  `json:"join_date" binding:"required"` // Format: "YYYY-MM-DD"
	Role         string                  `json:"role" binding:"required"`
	Status       string                  `json:"status" binding:"required"` // Misal: "active", "inactive"
	Address      AddEmployeeAddressInput `json:"address" binding:"required"`
}

// Input untuk registrasi (sama seperti sebelumnya)

func generateEmployeeID() string {
	randomNumber := ""
	for i := 0; i < 10; i++ {
		randomNumber += strconv.Itoa(rand.Intn(10))
	}
	return "EMP" + randomNumber
}

type Department struct {
	DepartmentID   string `gorm:"primaryKey;size:7"` // Format: DEPXXXX (4 angka random)
	DepartmentName string `gorm:"not null;unique"`   // Nama departemen harus unik
	Description    string `gorm:"type:text"`         // Menggunakan TEXT untuk deskripsi yang lebih panjang
	Status         string `gorm:"not null;size:20"`  // Mis: "active", "inactive"
	EmployeeCount  int64  `gorm:"-"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type AddDepartmentInput struct {
	DepartmentName string `json:"department_name" binding:"required"`
	Description    string `json:"description"` // Deskripsi bisa opsional
	Status         string `json:"status" binding:"required"`
}

type UpdateDepartmentInput struct {
	DepartmentName string `json:"department_name" binding:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" binding:"required"`
}

func generateDepartmentID() string {
	randomNumber := ""
	for i := 0; i < 4; i++ { // Hanya 4 angka random
		randomNumber += strconv.Itoa(rand.Intn(10)) // Angka 0-9
	}
	return "DEP" + randomNumber
}

func (Department) TableName() string {
	return "departments"
}

type ProductCategory struct {
	CategoryID    string `gorm:"primaryKey;size:7"` // Format: CATXXXX (4 angka random)
	CategoryName  string `gorm:"not null;unique"`   // Nama kategori harus unik
	Description   string `gorm:"type:text"`
	Status        string `gorm:"not null;size:20"` // Mis: "published", "unpublished"
	ProductsCount int64  `gorm:"-"`                // Akan ditambahkan nanti untuk GET list
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func (ProductCategory) TableName() string {
	return "product_categories"
}

type AddProductCategoryInput struct {
	CategoryName string `json:"category_name" binding:"required"`
	Description  string `json:"description"`               // Deskripsi bisa opsional
	Status       string `json:"status" binding:"required"` // "published" atau "unpublished"
}

func generateProductCategoryID() string {
	randomNumber := ""
	for i := 0; i < 4; i++ {
		randomNumber += strconv.Itoa(rand.Intn(10))
	}
	return "CAT" + randomNumber
}

type UpdateProductCategoryInput struct {
	CategoryName string `json:"category_name" binding:"required"`
	Description  string `json:"description"`
	Status       string `json:"status" binding:"required"` // "published" atau "unpublished"
}

type Product struct {
	ProductSKU        string          `gorm:"primaryKey;size:13"`
	Title             string          `gorm:"not null;size:255"`
	Brand             string          `gorm:"size:100"`
	ProductCategoryID string          `gorm:"column:product_category;size:7;index"`
	ProductCategory   ProductCategory `gorm:"foreignKey:ProductCategoryID;references:CategoryID"`
	PowerSource       string          `gorm:"size:100"`
	WarrantyPeriod    string          `gorm:"size:50"`
	ProductionDate    *time.Time      `gorm:"type:date"`
	Descriptions      string          `gorm:"type:text"`
	Stock             int             `gorm:"default:0"`
	Status            string          `gorm:"not null;size:20"`
	RegularPrice      float64         `gorm:"type:numeric(12,2)"`
	Images            []ProductImage  `gorm:"foreignKey:ProductSKU;references:ProductSKU"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (Product) TableName() string { return "products" }

type ProductImage struct {
	ProductSKU string `gorm:"size:14;index;not null"`
	Image      string `gorm:"type:text;not null"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (ProductImage) TableName() string { return "product_images" }

type AddProductInput struct {
	Title             string  `json:"title" binding:"required"`
	Brand             string  `json:"brand"`
	ProductCategoryID string  `json:"product_category_id" binding:"required"` // Frontend akan kirim ini
	PowerSource       string  `json:"power_source"`
	WarrantyPeriod    string  `json:"warranty_period"`
	ProductionDate    string  `json:"production_date"` // String format YYYY-MM-DD dari frontend
	Descriptions      string  `json:"descriptions"`
	Stock             int     `json:"stock"`
	Status            string  `json:"status" binding:"required"` // "Published" atau "Unpublished"
	RegularPrice      float64 `json:"regular_price" binding:"required"`
}

func generateProductSKU() string {
	// Pastikan rand.Seed() sudah dipanggil sekali di main.go:
	// rand.Seed(time.Now().UnixNano())

	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 10 // Panjang karakter random yang diinginkan

	skuChars := make([]byte, length)
	for i := range skuChars {
		skuChars[i] = charset[rand.Intn(len(charset))]
	}
	return "SKU" + string(skuChars)
}
