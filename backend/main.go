package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"backend-user/domain/admin"
	"backend-user/domain/models"
	"backend-user/domain/user"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB
var errDb error

func AdminAuthMiddleware(jwtSecret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("[Middleware] AdminAuthMiddleware: Request diterima untuk path:", c.Request.URL.Path)
		authHeader := c.GetHeader("Authorization")
		log.Printf("[Middleware] AdminAuthMiddleware: Authorization Header: [%s]\n", authHeader)

		if authHeader == "" {
			log.Println("[Middleware] AdminAuthMiddleware: Header Authorization kosong.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header dibutuhkan"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			log.Printf("[Middleware] AdminAuthMiddleware: Format header salah: %s\n", authHeader)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Format Authorization header salah (expected: Bearer [token])"})
			return
		}
		tokenString := parts[1]
		log.Printf("[Middleware] AdminAuthMiddleware: Token String Diterima: [%s]\n", tokenString)

		claims := &admin.AdminJwtCustomClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				log.Printf("[Middleware] AdminAuthMiddleware: Metode signing tidak terduga: %v\n", token.Header["alg"])
				return nil, fmt.Errorf("metode signing tidak terduga: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil {
			log.Printf("[Middleware] AdminAuthMiddleware: Error parsing/validasi token: %v\n", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau kedaluwarsa", "details": err.Error()})
			return
		}

		if !token.Valid {
			log.Println("[Middleware] AdminAuthMiddleware: Token.Valid adalah false.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid"})
			return
		}

		log.Printf("[Middleware] AdminAuthMiddleware: Token valid. Claims: %+v\n", claims)
		c.Set("admin_employee_id", claims.EmployeeID)
		c.Set("admin_role", claims.Role)
		c.Next()
	}
}

func CustomerAuthMiddleware(jwtSecret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("[Middleware] CustomerAuthMiddleware: Request diterima untuk path:", c.Request.URL.Path)
		authHeader := c.GetHeader("Authorization")
		log.Printf("[Middleware] CustomerAuthMiddleware: Authorization Header: [%s]\n", authHeader)

		if authHeader == "" {
			log.Println("[Middleware] CustomerAuthMiddleware: Header Authorization kosong.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header dibutuhkan"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			log.Printf("[Middleware] CustomerAuthMiddleware: Format header salah: %s\n", authHeader)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Format Authorization header salah (expected: Bearer [token])"})
			return
		}
		tokenString := parts[1]
		log.Printf("[Middleware] CustomerAuthMiddleware: Token String Diterima: [%s]\n", tokenString)

		claims := &user.CustomerJwtCustomClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				log.Printf("[Middleware] CustomerAuthMiddleware: Metode signing tidak terduga: %v\n", token.Header["alg"])
				return nil, fmt.Errorf("metode signing tidak terduga: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil {
			log.Printf("[Middleware] CustomerAuthMiddleware: Error parsing/validasi token: %v\n", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau kedaluwarsa", "details": err.Error()})
			return
		}

		if !token.Valid {
			log.Println("[Middleware] CustomerAuthMiddleware: Token.Valid adalah false.")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid"})
			return
		}

		log.Printf("[Middleware] CustomerAuthMiddleware: Token valid. Claims: %+v\n", claims)
		c.Set("customer_id_from_token", claims.CustomerID)
		c.Next()
	}
}

func init() {

	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: Tidak dapat memuat file .env. Menggunakan environment variable sistem jika ada.")
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())

	jwtSecretUser := os.Getenv("JWT_SECRET_KEY_USER")
	if jwtSecretUser == "" {
		log.Fatal("Kesalahan: JWT_SECRET_KEY_USER tidak disetel.")
	}

	jwtSecretAdmin := os.Getenv("JWT_SECRET_KEY_ADMIN")
	if jwtSecretAdmin == "" {
		log.Println("Peringatan: JWT_SECRET_KEY_ADMIN tidak disetel. Menggunakan JWT_SECRET_KEY user untuk admin.")
		jwtSecretAdmin = jwtSecretUser

	}
	log.Printf("[Main Debug] Nilai string jwtSecretAdmin yang akan digunakan: [%s]\n", jwtSecretAdmin)
	log.Printf("[Main Debug] Panjang byte jwtSecretAdmin yang akan digunakan: %d\n", len([]byte(jwtSecretAdmin)))

	dsn := "host=localhost user=bafaqih password=8055 dbname=pumacon port=5432 sslmode=disable TimeZone=Asia/Jakarta"

	db, errDb = gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if errDb != nil {
		panic("Gagal koneksi ke database PostgreSQL: " + errDb.Error())
	}
	fmt.Println("Berhasil koneksi ke database PostgreSQL!")

	errMigrate := db.AutoMigrate(
		&models.Employee{},
		&models.EmployeeAddress{},
		&models.EmployeeAccount{},
		&models.Department{},
		&models.ProductCategory{},
		&models.Product{},
		&models.ProductImage{},

		&models.Customer{},
		&models.CustomerDetail{},
		&models.CustomerAddress{},
		&models.Cart{},
		&models.Order{},
		&models.OrderItem{},
		&models.NewsCategory{},
		&models.NewsPost{},
	)
	if errMigrate != nil {
		panic("Gagal migrasi database: " + errMigrate.Error())
	}
	fmt.Println("Migrasi database berhasil.")

	usersvc := user.NewService(db, []byte(jwtSecretUser))
	userhandler := user.NewHandler(usersvc)

	adminsvc := admin.NewService(db, []byte(jwtSecretAdmin))
	adminhandler := admin.NewHandler(adminsvc)

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5174", "http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	r.Static("/uploads", "./uploads")

	r.GET("/products", userhandler.ListPublicProductsAndCategories)
	r.GET("/products/:productSKU", userhandler.GetPublicProductDetail)
	r.GET("/news", userhandler.GetNewsPageData)
	r.GET("/news/:newsId", userhandler.GetNewsDetailPageData)

	userApi := r.Group("/user")
	{
		userApi.POST("/register", userhandler.RegisterCustomer)
		userApi.POST("/login", userhandler.LoginCustomer)

		authenticatedUser := userApi.Group("/")
		authenticatedUser.Use(CustomerAuthMiddleware([]byte(jwtSecretUser)))
		{
			authenticatedUser.GET("/profile", userhandler.GetCustomerProfile)
			authenticatedUser.PUT("/profile", userhandler.UpdateCustomerProfile)
			authenticatedUser.PUT("/password", userhandler.ChangeCustomerPassword)

			authenticatedUser.GET("/addresses", userhandler.ListCustomerAddresses)
			authenticatedUser.POST("/addresses", userhandler.AddCustomerAddress)
			authenticatedUser.PUT("/addresses/:addressId", userhandler.UpdateCustomerAddress)
			authenticatedUser.POST("/cart", userhandler.AddToCart)
			authenticatedUser.GET("/cart", userhandler.GetCartItems)
			authenticatedUser.PUT("/cart/:cartItemId", userhandler.UpdateCartItemQuantity)
			authenticatedUser.DELETE("/cart/:cartItemId", userhandler.RemoveCartItem)

			authenticatedUser.POST("/orders", userhandler.CreateOrder)
			authenticatedUser.GET("/orders", userhandler.ListCustomerOrders)
		}
	}

	adminApiRoutes := r.Group("/admin")
	{
		adminApiRoutes.GET("/profile", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetAdminProfile)
		adminApiRoutes.POST("/add-employee", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.AddEmployee)
		adminApiRoutes.POST("/register", adminhandler.RegisterAdmin)
		adminApiRoutes.POST("/login", adminhandler.LoginAdmin)
		adminApiRoutes.GET("/employees", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListEmployees)
		adminApiRoutes.GET("/employees/:employeeId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetEmployeeByID)
		adminApiRoutes.DELETE("/employees/:employeeId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteEmployee)
		adminApiRoutes.PUT("/employees/:employeeId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.UpdateEmployee)
		adminApiRoutes.POST("/departments", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.AddDepartment)
		adminApiRoutes.GET("/departments/list", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListActiveDepartmentsForDropdown)
		adminApiRoutes.GET("/departments", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListDepartments)
		adminApiRoutes.DELETE("/departments/:departmentId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteDepartment)
		adminApiRoutes.PUT("/departments/:departmentId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.UpdateDepartment)
		adminApiRoutes.GET("/departments/:departmentId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetDepartmentByID)
		adminApiRoutes.POST("/add-product-category", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.AddProductCategory)
		adminApiRoutes.GET("/product-categories", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListProductCategories)
		adminApiRoutes.GET("/product-categories/:categoryId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetProductCategoryByID)
		adminApiRoutes.PUT("/product-categories/:categoryId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.UpdateProductCategory)
		adminApiRoutes.DELETE("/product-categories/:categoryId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteProductCategory)
		adminApiRoutes.GET("/product-categories/list-active", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListActiveProductCategories)
		adminApiRoutes.POST("/products", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.AddProduct)
		adminApiRoutes.GET("/products", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListProducts)
		adminApiRoutes.GET("/products/:productSKU", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetProductBySKU)
		adminApiRoutes.PUT("/products/:productSKU", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.UpdateProduct)
		adminApiRoutes.DELETE("/products/:productSKU", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteProduct)
		adminApiRoutes.GET("/orders", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListAllOrders)
		adminApiRoutes.GET("/orders/:orderId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetOrderDetailForAdmin)
		adminApiRoutes.PUT("/orders/:orderId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.UpdateOrderStatus)
		adminApiRoutes.DELETE("/orders/:orderId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteOrder)
		adminApiRoutes.GET("/customers", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListOrderedCustomers)
		adminApiRoutes.GET("/customers/:customerId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetCustomerDetailForAdmin)
		adminApiRoutes.DELETE("/customers/:customerId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteCustomer)
		adminApiRoutes.POST("/news-categories", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.AddNewsCategory)
		adminApiRoutes.GET("/news-categories", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListNewsCategories)
		adminApiRoutes.GET("/news-categories/list-active", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListActiveNewsCategories)
		adminApiRoutes.GET("/news-categories/:categoryId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetNewsCategoryByID)
		adminApiRoutes.PUT("/news-categories/:categoryId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.UpdateNewsCategory)
		adminApiRoutes.DELETE("/news-categories/:categoryId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteNewsCategory)
		adminApiRoutes.POST("/news-posts", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.AddNewsPost)
		adminApiRoutes.GET("/news-posts", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.ListNewsPosts)
		adminApiRoutes.GET("/news-posts/:newsId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetNewsPostByID)
		adminApiRoutes.PUT("/news-posts/:newsId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.UpdateNewsPost)
		adminApiRoutes.DELETE("/news-posts/:newsId", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.DeleteNewsPost)
		adminApiRoutes.GET("/dashboard-summary", AdminAuthMiddleware([]byte(jwtSecretAdmin)), adminhandler.GetDashboardStatistics)
	}

	fmt.Println("Server berjalan di port 8080...")
	r.Run(":8080")
}
