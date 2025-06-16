package user

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Input untuk registrasi
type CustomerRegisterInput struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Phone     string `json:"phone"`
	Password  string `json:"password" binding:"required,min=6"`
}

// Input untuk login
type CustomerLoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Respons untuk login
type CustomerLoginResponse struct {
	Token      string `json:"token"`
	CustomerID string `json:"customer_id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Email      string `json:"email"`
}

// Input untuk update profil
type CustomerProfileUpdateInput struct {
	FirstName string     `json:"first_name" binding:"required"`
	LastName  string     `json:"last_name" binding:"required"`
	Phone     string     `json:"phone"`
	Birthday  *time.Time `json:"birthday" time_format:"2006-01-02"` // Format lebih sederhana
}

// Input untuk ganti password
type CustomerPasswordUpdateInput struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// Input untuk tambah/update alamat
type UpsertCustomerAddressInput struct {
	Title        string `json:"title" binding:"required"`
	Street       string `json:"street" binding:"required"`
	Additional   string `json:"additional"`
	DistrictCity string `json:"district_city" binding:"required"`
	Province     string `json:"province" binding:"required"`
	PostCode     string `json:"post_code" binding:"required"`
}

// Struct untuk JWT
type CustomerJwtCustomClaims struct {
	CustomerID string `json:"customer_id"`
	Email      string `json:"email"`
	jwt.RegisteredClaims
}

// DTO untuk tampilan produk publik (grid)
type PublicProductGridItem struct {
	ProductSKU   string  `json:"product_sku"`
	CategoryName string  `json:"category_name"`
	Title        string  `json:"title"`
	RegularPrice float64 `json:"regular_price"`
	ImageUrl     string  `json:"image_url"`
}

// DTO untuk detail produk publik
type PublicProductDetail struct {
	ProductSKU     string     `json:"product_sku"`
	Title          string     `json:"title"`
	Brand          string     `json:"brand,omitempty"`
	CategoryName   string     `json:"category_name"`
	PowerSource    string     `json:"power_source,omitempty"`
	WarrantyPeriod string     `json:"warranty_period,omitempty"`
	ProductionDate *time.Time `json:"production_date,omitempty"`
	Descriptions   string     `json:"descriptions,omitempty"`
	Stock          int        `json:"stock"`
	Status         string     `json:"status"`
	RegularPrice   float64    `json:"regular_price"`
	Images         []string   `json:"images"`
}

// DTO untuk list kategori publik
type PublicProductCategoryView struct {
	CategoryID   string `json:"category_id"`
	CategoryName string `json:"category_name"`
}

// DTO untuk item di keranjang
type AddToCartInput struct {
	ProductSKU string `json:"product_sku" binding:"required"`
	Quantity   int    `json:"quantity" binding:"required,min=1"`
}

// DTO untuk update item di keranjang
type UpdateCartItemInput struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

// DTO untuk input checkout
type CheckoutInput struct {
	SelectedAddressID uint   `json:"selected_address_id" binding:"required"`
	PaymentMethod     string `json:"payment_method" binding:"required"`
	Notes             string `json:"notes"`
}

// DTO untuk riwayat pesanan di halaman list akun
type OrderHistoryItem struct {
	OrderID       string    `json:"order_id"`
	OrderDateTime time.Time `json:"order_date_time"`
	GrandTotal    float64   `json:"grand_total"`
	OrderStatus   string    `json:"order_status"`
	ItemImages    []string  `json:"item_images"`
}

type PublicNewsListItem struct {
	NewsID          string    `json:"news_id"`
	Title           string    `json:"title"`
	Image           string    `json:"image"`
	PublicationDate time.Time `json:"publication_date"`
	AuthorName      string    `json:"author_name"`
	ContentSnippet  string    `json:"content_snippet"` // Potongan singkat dari isi berita
}

type PublicNewsCategoryWithCount struct {
	CategoryID   string `json:"category_id"`
	CategoryName string `json:"category_name"`
	PostCount    int64  `json:"post_count"`
}

type PaginationData struct {
	CurrentPage  int   `json:"current_page"`
	TotalPages   int   `json:"total_pages"`
	TotalRecords int64 `json:"total_records"`
}

type NewsPageData struct {
	NewsPosts  []PublicNewsListItem          `json:"news"`
	Categories []PublicNewsCategoryWithCount `json:"categories"`
	Pagination PaginationData                `json:"pagination"`
}

type NewsAuthorInfo struct {
	FullName string `json:"full_name"`
	Image    string `json:"image"`
}

type PublicNewsPostDetail struct {
	NewsID          string         `json:"news_id"`
	Title           string         `json:"title"`
	Image           string         `json:"image"`
	Content         string         `json:"content"`
	PublicationDate time.Time      `json:"publication_date"`
	Status          string         `json:"status"`
	Author          NewsAuthorInfo `json:"author"`
	CategoryName    string         `json:"category_name"`
}

type NewsDetailPageData struct {
	PostDetail  PublicNewsPostDetail          `json:"post_detail"`
	Categories  []PublicNewsCategoryWithCount `json:"categories"`   // Menggunakan DTO yang sudah ada
	RecentPosts []PublicNewsListItem          `json:"recent_posts"` // Menggunakan DTO yang sudah ada
}
