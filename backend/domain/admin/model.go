package admin

import (
	"time"

	"backend-user/domain/models"
)

type AdminRegisterInput struct {
	EmployeeID string `json:"employee_id" binding:"required"`
	Password   string `json:"password" binding:"required,min=6"`
}

type AdminLoginInput struct {
	EmployeeID string `json:"employee_id" binding:"required"`
	Password   string `json:"password" binding:"required"`
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
	Birthday     string                  `json:"birthday" binding:"required"` // Diterima sebagai string
	DepartmentID string                  `json:"department_id" binding:"required"`
	Email        string                  `json:"email" binding:"required,email"`
	Phone        string                  `json:"phone" binding:"required"`
	JoinDate     string                  `json:"join_date" binding:"required"` // Diterima sebagai string
	Role         string                  `json:"role" binding:"required"`
	Status       string                  `json:"status" binding:"required"`
	Address      AddEmployeeAddressInput `json:"address" binding:"required"`
}

type AddDepartmentInput struct {
	DepartmentName string `json:"department_name" binding:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" binding:"required"`
}

type UpdateDepartmentInput struct {
	DepartmentName string `json:"department_name" binding:"required"`
	Description    string `json:"description"`
	Status         string `json:"status" binding:"required"`
}

type AddProductCategoryInput struct {
	CategoryName string `json:"category_name" binding:"required"`
	Description  string `json:"description"`
	Status       string `json:"status" binding:"required"`
}

type UpdateProductCategoryInput struct {
	CategoryName string `json:"category_name" binding:"required"`
	Description  string `json:"description"`
	Status       string `json:"status" binding:"required"`
}

type AddProductInput struct {
	Title             string  `json:"title" binding:"required"`
	Brand             string  `json:"brand"`
	ProductCategoryID string  `json:"product_category_id" binding:"required"`
	PowerSource       string  `json:"power_source"`
	WarrantyPeriod    string  `json:"warranty_period"`
	ProductionDate    string  `json:"production_date"` // Diterima sebagai string
	Descriptions      string  `json:"descriptions"`
	Stock             int     `json:"stock"`
	Status            string  `json:"status" binding:"required"`
	CapitalPrice      float64 `json:"capital_price" binding:"required,min=0"`
	RegularPrice      float64 `json:"regular_price" binding:"required,min=0"`
}

type AdminOrderListView struct {
	OrderID          string    `json:"order_id"`
	CustomerFullname string    `json:"customer_fullname"`
	OrderDateTime    time.Time `json:"order_date_time"`
	PaymentMethod    string    `json:"payment_method"`
	OrderStatus      string    `json:"order_status"`
	GrandTotal       float64   `json:"grand_total"`
	// Path gambar dari item pertama di order untuk thumbnail
	FirstItemImage string `json:"first_item_image"`
}

type AdminUpdateOrderStatusInput struct {
	// Menggunakan `oneof` untuk validasi bahwa status yang dikirim adalah salah satu dari nilai yang diizinkan
	OrderStatus string `json:"order_status" binding:"required,oneof='Pending Confirmation' Processed Shipped Completed Canceled"`
}

type AdminOrderDetailItemView struct {
	ProductSKU           string  `json:"product_sku"`
	ProductImageSnapshot string  `json:"product_image_snapshot"`
	ProductTitleSnapshot string  `json:"product_title_snapshot"`
	PriceAtOrder         float64 `json:"price_at_order"`
	Quantity             int     `json:"quantity"`
	SubTotal             float64 `json:"sub_total"`
}

type AdminOrderDetailView struct {
	// Info Order Utama
	OrderID        string    `json:"order_id"`
	OrderDateTime  time.Time `json:"order_date_time"`
	OrderStatus    string    `json:"order_status"`
	PaymentMethod  string    `json:"payment_method"`
	ProofOfPayment string    `json:"proof_of_payment"` // Path ke gambar bukti bayar
	Notes          string    `json:"notes"`

	// Info Customer
	CustomerID       string `json:"customer_id"`
	CustomerFullname string `json:"customer_fullname"`
	CustomerEmail    string `json:"customer_email"`
	CustomerPhone    string `json:"customer_phone"`

	// Info Pengiriman
	ShippingAddressSnapshot string `json:"shipping_address_snapshot"`

	// Info Harga
	Subtotal     float64 `json:"subtotal"` // Dihitung dari jumlah total item
	ShippingCost float64 `json:"shipping_cost"`
	GrandTotal   float64 `json:"grand_total"`

	// Daftar Item yang Dipesan
	Items []AdminOrderDetailItemView `json:"items"`
}

type AdminCustomerListView struct {
	CustomerID   string    `json:"customer_id"`
	FullName     string    `json:"full_name"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	TotalSpent   float64   `json:"total_spent"`
	LastPurchase time.Time `json:"last_purchase"`
}

type AdminCustomerOrderItemHistory struct {
	ProductSKU           string  `json:"product_sku"`
	ProductImageSnapshot string  `json:"product_image_snapshot"`
	ProductTitleSnapshot string  `json:"product_title_snapshot"`
	PriceAtOrder         float64 `json:"price_at_order"`
	Quantity             int     `json:"quantity"`
	SubTotal             float64 `json:"sub_total"`
}

type AdminCustomerOrderHistory struct {
	OrderID       string                          `json:"order_id"`
	OrderDateTime time.Time                       `json:"order_date_time"`
	GrandTotal    float64                         `json:"grand_total"`
	OrderItems    []AdminCustomerOrderItemHistory `json:"order_items"`
}

type AdminCustomerDetailView struct {
	// Info Profil Dasar
	CustomerID string     `json:"customer_id"`
	FullName   string     `json:"full_name"`
	Email      string     `json:"email"`
	Phone      string     `json:"phone"`
	Birthday   *time.Time `json:"birthday"`
	JoinDate   time.Time  `json:"join_date"`

	// Info Agregat
	TotalSpent  float64 `json:"total_spent"`
	TotalOrders int     `json:"total_orders"`

	// Info Terkait
	Addresses    []models.CustomerAddress    `json:"addresses"`
	OrderHistory []AdminCustomerOrderHistory `json:"order_history"`
}

type UpsertNewsCategoryInput struct {
	CategoryName string `json:"category_name" binding:"required"`
	Description  string `json:"description"`
	Status       string `json:"status" binding:"required,oneof=Published Unpublished"`
}

type AddNewsPostInput struct {
	Title           string `json:"title" binding:"required"`
	Content         string `json:"content" binding:"required"`
	CategoryID      string `json:"category_id" binding:"required"`
	PublicationDate string `json:"publication_date" binding:"required"` // Format "YYYY-MM-DD"
	Status          string `json:"status" binding:"required,oneof=Published Draft"`
}

type AdminNewsPostListView struct {
	NewsID          string    `json:"news_id"`
	Image           string    `json:"image"`
	Title           string    `json:"title"`
	CategoryName    string    `json:"category_name"`
	AuthorName      string    `json:"author_name"`
	PublicationDate time.Time `json:"publication_date"`
	Status          string    `json:"status"`
}

type UpdateNewsPostInput struct {
	Title           string `json:"title" binding:"required"`
	Content         string `json:"content" binding:"required"`
	CategoryID      string `json:"category_id" binding:"required"`
	PublicationDate string `json:"publication_date" binding:"required"` // Format "YYYY-MM-DD"
	Status          string `json:"status" binding:"required,oneof=Published Draft"`
}

type ChartData struct {
	Labels []string  `json:"labels"`
	Series []float64 `json:"series"` // <<< UBAH DARI int64 MENJADI float64
}

type DashboardStats struct {
	// Data untuk Summary Cards
	CurrentMonthEarnings float64 `json:"current_month_earnings"`
	TotalOrdersCount     int64   `json:"total_orders_count"`
	TotalCustomersCount  int64   `json:"total_customers_count"`

	// --- DATA BARU UNTUK SALES OVERVIEW ---
	TotalIncome      float64 `json:"total_income"`
	TotalProfit      float64 `json:"total_profit"`
	RevenueChartData struct {
		Labels []string  `json:"labels"`
		Series []float64 `json:"series"`
	} `json:"revenue_chart_data"`
	OrderStatusChart ChartData            `json:"order_status_chart"`
	RecentOrders     []AdminOrderListView `json:"recent_orders"`
}
