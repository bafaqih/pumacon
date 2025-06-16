package models

import (
	"time"
)

// --- CUSTOMER DOMAIN MODELS ---
type Customer struct {
	CustomerID string            `gorm:"primaryKey;size:13"`
	Email      string            `gorm:"not null;unique;size:255"`
	Phone      string            `gorm:"size:20"`
	Password   string            `gorm:"not null;size:255"`
	Detail     CustomerDetail    `gorm:"foreignKey:CustomerID;references:CustomerID"`
	Addresses  []CustomerAddress `gorm:"foreignKey:CustomerID;references:CustomerID"`
	Orders     []Order           `gorm:"foreignKey:CustomerID;references:CustomerID"`
	Carts      []Cart            `gorm:"foreignKey:CustomerID;references:CustomerID"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (Customer) TableName() string { return "customers" }

type CustomerDetail struct {
	CustomerID string     `gorm:"primaryKey;size:13"`
	FirstName  string     `gorm:"not null;size:100"`
	LastName   string     `gorm:"not null;size:100"`
	Image      string     `gorm:"type:text"`
	Email      string     `gorm:"not null;unique;size:255"`
	Phone      string     `gorm:"size:20"`
	JoinDate   time.Time  `gorm:"type:date"`
	Birthday   *time.Time `gorm:"type:date"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (CustomerDetail) TableName() string { return "customer_details" }

type CustomerAddress struct {
	AddressID    uint   `gorm:"primaryKey"`
	CustomerID   string `gorm:"size:13;not null;index"`
	Title        string `gorm:"size:100;not null"`
	Street       string `gorm:"size:100;not null"`
	Additional   string `gorm:"size:100"`
	DistrictCity string `gorm:"column:district_city;size:100;not null"`
	Province     string `gorm:"size:100;not null"`
	PostCode     string `gorm:"column:post_code;size:100;not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (CustomerAddress) TableName() string { return "customer_address" }

type Cart struct {
	CartID       uint    `gorm:"primaryKey"`
	CustomerID   string  `gorm:"column:customer_id;size:13;not null;index"`
	ProductSKU   string  `gorm:"column:product_sku;size:13;not null;index"`
	Image        string  `gorm:"type:text"`
	Title        string  `gorm:"size:255;not null"`
	RegularPrice float64 `gorm:"column:regular_price;type:numeric(12,2);not null"`
	Quantity     int     `gorm:"not null;default:1"`
	Total        float64 `gorm:"->;-:migration"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (Cart) TableName() string { return "carts" }

type Order struct {
	OrderID                 string          `gorm:"primaryKey;size:10"`
	CustomerID              string          `gorm:"column:customer_id;size:13;not null;index"`
	CustomerFullname        string          `gorm:"column:customer_fullname;size:200;not null"`
	CustomerEmail           string          `gorm:"column:customer_email;size:255;not null"`
	CustomerPhone           string          `gorm:"column:customer_phone;size:20"`
	ShippingAddressID       uint            `gorm:"column:shipping_address_id;not null"`
	ShippingAddressSnapshot string          `gorm:"column:shipping_address_snapshot;type:text;not null"`
	OrderDateTime           time.Time       `gorm:"column:order_date_time;not null;autoCreateTime"`
	PaymentMethod           string          `gorm:"column:payment_method;size:50;not null"`
	OrderStatus             string          `gorm:"column:order_status;size:50;not null"`
	GrandTotal              float64         `gorm:"column:grand_total;type:numeric(12,2);not null"`
	Notes                   string          `gorm:"type:text"`
	ProofOfPayment          string          `gorm:"column:proof_of_payment;type:text"`
	CreatedAt               time.Time       `gorm:"autoCreateTime"`
	UpdatedAt               time.Time       `gorm:"autoUpdateTime"`
	OrderItems              []OrderItem     `gorm:"foreignKey:OrderID;references:OrderID"`
	Customer                Customer        `gorm:"foreignKey:CustomerID;references:CustomerID"`
	ShippingAddress         CustomerAddress `gorm:"foreignKey:ShippingAddressID;references:AddressID"`
}

func (Order) TableName() string { return "orders" }

type OrderItem struct {
	OrderItemID          uint      `gorm:"primaryKey"`
	OrderID              string    `gorm:"column:order_id;size:10;not null;index"`
	ProductSKU           string    `gorm:"column:product_sku;size:13;not null;index"`
	Quantity             int       `gorm:"not null;default:1"`
	PriceAtOrder         float64   `gorm:"column:price_at_order;type:numeric(12,2);not null"`
	ProductTitleSnapshot string    `gorm:"column:product_title_snapshot;size:255;not null"`
	ProductImageSnapshot string    `gorm:"column:product_image_snapshot;type:text"`
	SubTotal             float64   `gorm:"column:sub_total;->;-:migration"`
	CreatedAt            time.Time `gorm:"autoCreateTime"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime"`
}

func (OrderItem) TableName() string { return "order_items" }

// === MODEL-MODEL DARI DOMAIN ADMIN ===

type Employee struct {
	EmployeeID     string    `gorm:"primaryKey;size:13"`
	Image          string    `gorm:"type:text"`
	FullName       string    `gorm:"not null"`
	Birthday       time.Time `gorm:"type:date"`
	Department     string    `gorm:"column:department;size:7;index"`
	DepartmentName string    `gorm:"-"`
	Email          string    `gorm:"unique;not null"`
	Phone          string
	JoinDate       time.Time `gorm:"type:date"`
	Role           string
	Status         string
	Address        EmployeeAddress `gorm:"foreignKey:EmployeeID;references:EmployeeID"`
	Account        EmployeeAccount `gorm:"foreignKey:EmployeeID;references:EmployeeID"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type EmployeeAddress struct {
	EmployeeID   string `gorm:"primaryKey;size:13"`
	Street       string
	DistrictCity string `gorm:"column:district_city"`
	Province     string
	PostCode     string `gorm:"column:post_code"`
	Country      string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (EmployeeAddress) TableName() string { return "employees_address" }

type EmployeeAccount struct {
	EmployeeID string `gorm:"primaryKey;size:13"`
	FullName   string `gorm:"not null"`
	Role       string `gorm:"not null"`
	Password   string `gorm:"not null"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (EmployeeAccount) TableName() string { return "employees_account" }

type Department struct {
	DepartmentID   string `gorm:"primaryKey;size:7"`
	DepartmentName string `gorm:"not null;unique"`
	Description    string `gorm:"type:text"`
	Status         string `gorm:"not null;size:20"`
	EmployeeCount  int64  `gorm:"-"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func (Department) TableName() string { return "departments" }

type ProductCategory struct {
	CategoryID    string `gorm:"primaryKey;size:7"`
	CategoryName  string `gorm:"not null;unique"`
	Description   string `gorm:"type:text"`
	Status        string `gorm:"not null;size:20"`
	ProductsCount int64  `gorm:"-"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func (ProductCategory) TableName() string { return "product_categories" }

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
	CapitalPrice      float64         `gorm:"type:numeric(12,2)"`
	RegularPrice      float64         `gorm:"type:numeric(12,2)"`
	Images            []ProductImage  `gorm:"foreignKey:ProductSKU;references:ProductSKU"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (Product) TableName() string { return "products" }

type ProductImage struct {
	ID         uint   `gorm:"primaryKey"` // Menambahkan ID sebagai PK yang lebih standar untuk GORM
	ProductSKU string `gorm:"size:14;index;not null"`
	Image      string `gorm:"type:text;not null"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (ProductImage) TableName() string { return "product_images" }

type NewsCategory struct {
	CategoryID    string `gorm:"primaryKey;size:8"`
	CategoryName  string `gorm:"not null;unique;size:100"`
	Description   string `gorm:"type:text"`
	Status        string `gorm:"not null;size:20"`
	NewsPostCount int64  `gorm:"-"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func (NewsCategory) TableName() string {
	return "news_categories"
}

type NewsPost struct {
	NewsID          string    `gorm:"primaryKey;size:8"`
	Title           string    `gorm:"not null;size:255"`
	Image           string    `gorm:"type:text"`
	Content         string    `gorm:"not null;type:text"`
	CategoryID      string    `gorm:"column:category_id;size:8;not null;index"`
	AuthorID        string    `gorm:"column:author_id;size:13;not null;index"`
	PublicationDate time.Time `gorm:"column:publication_date;not null"`
	Status          string    `gorm:"not null;size:20"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime"`

	NewsCategory NewsCategory `gorm:"foreignKey:CategoryID;references:CategoryID"`
	Author       Employee     `gorm:"foreignKey:AuthorID;references:EmployeeID"`
}

func (NewsPost) TableName() string {
	return "news"
}
