package admin

import (
	"encoding/json"

	"log" // PASTIKAN INI ADA DAN TIDAK DIKOMENTARI
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Input untuk registrasi (sudah ada)
// type RegisterInput struct { ... }

type Handler interface {
	RegisterAdmin(c *gin.Context)
	LoginAdmin(c *gin.Context)
	AddEmployee(c *gin.Context)
	GetAdminProfile(c *gin.Context)
	ListEmployees(c *gin.Context)
	GetEmployeeByID(c *gin.Context)
	DeleteEmployee(c *gin.Context)
	UpdateEmployee(c *gin.Context)
	AddDepartment(c *gin.Context)
	ListActiveDepartmentsForDropdown(c *gin.Context)
	ListDepartments(c *gin.Context)
	DeleteDepartment(c *gin.Context)
	UpdateDepartment(c *gin.Context)
	GetDepartmentByID(c *gin.Context)
	AddProductCategory(c *gin.Context)
	ListProductCategories(c *gin.Context)
	GetProductCategoryByID(c *gin.Context)
	UpdateProductCategory(c *gin.Context)
	DeleteProductCategory(c *gin.Context)
	ListActiveProductCategories(c *gin.Context)
	AddProduct(c *gin.Context)
	ListProducts(c *gin.Context)
	GetProductBySKU(c *gin.Context)
	UpdateProduct(c *gin.Context)
	DeleteProduct(c *gin.Context)
}

func NewHandler(svc Service) Handler {
	return &handler{
		svc: svc,
	}
}

type handler struct {
	svc Service
}

func (h *handler) AddEmployee(c *gin.Context) {
	var input AddEmployeeInput // Dari model.go (package admin)

	// Set batas memori untuk parsing multipart form (misal 10 MB)
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		log.Printf("Error parsing multipart form: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal memproses form data: " + err.Error()})
		return
	}

	// 1. Ambil string JSON dari field "jsonData"
	jsonDataString := c.PostForm("jsonData")
	if jsonDataString == "" {
		log.Println("Error: Field 'jsonData' kosong.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data employee (jsonData) tidak ditemukan."})
		return
	}

	// 2. Unmarshal string JSON ke struct AddEmployeeInput
	if err := json.Unmarshal([]byte(jsonDataString), &input); err != nil {
		log.Printf("Error unmarshalling jsonData: %v\njsonData: %s\n", err, jsonDataString)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data employee tidak valid: " + err.Error()})
		return
	}
	log.Printf("Data employee dari jsonData (sebelum proses file): %+v\n", input)

	// 3. Ambil file dari field "imageFile"
	fileHeader, err := c.FormFile("imageFile") // "imageFile" adalah key yang dikirim frontend

	// Variabel untuk menyimpan path gambar yang akan disimpan ke DB
	var imagePathForDB string = "" // Default kosong jika tidak ada file

	if err == nil && fileHeader != nil { // Ada file yang diupload
		// Buat nama file unik untuk menghindari konflik dan masalah keamanan
		ext := filepath.Ext(fileHeader.Filename)
		uniqueFilename := uuid.New().String() + ext // Contoh: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.jpg

		// Tentukan direktori penyimpanan
		// Pastikan path ini sesuai dengan yang disajikan oleh r.Static() di main.go
		uploadDir := "./uploads/images/profile/"
		savePath := filepath.Join(uploadDir, uniqueFilename)

		// Buat direktori jika belum ada
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			log.Printf("Error membuat direktori uploads: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyiapkan penyimpanan file."})
			return
		}

		// Simpan file yang diupload ke path tujuan
		if err := c.SaveUploadedFile(fileHeader, savePath); err != nil {
			log.Printf("Error menyimpan file upload: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file gambar."})
			return
		}
		log.Printf("File berhasil disimpan ke: %s\n", savePath)

		// Path yang akan disimpan ke database dan dikirim ke frontend (relatif terhadap URL root static)
		imagePathForDB = strings.TrimPrefix(filepath.ToSlash(savePath), "./") // Hasil: "uploads/images/profile/namaunik.jpg"
		// Atau jika Anda ingin konsisten selalu ada "uploads/" di depan:
		// imagePathForDB = "uploads/images/profile/" + uniqueFilename

	} else if err != nil && err != http.ErrMissingFile {
		// Error lain saat mencoba mendapatkan file (bukan karena file tidak ada)
		log.Printf("Error mendapatkan file (bukan ErrMissingFile): %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error memproses file gambar: " + err.Error()})
		return
	}
	// Jika err == http.ErrMissingFile, berarti tidak ada file diupload, imagePathForDB akan tetap kosong. Ini OK.

	// 4. Set field Image di struct input dengan path file yang sudah disimpan (atau kosong)
	input.Image = imagePathForDB
	log.Printf("Data input final yang akan dikirim ke service: %+v\n", input)

	// 5. Panggil service untuk menambahkan employee
	createdEmployee, serviceErr := h.svc.AddEmployee(input) // Service AddEmployee sekarang menerima input dengan Image path
	if serviceErr != nil {
		log.Printf("Error dari service AddEmployee: %v\n", serviceErr)
		// Anda bisa lebih spesifik menangani jenis error di sini
		if strings.Contains(serviceErr.Error(), "email sudah terdaftar") || strings.Contains(serviceErr.Error(), "duplicate key value violates unique constraint") {
			c.JSON(http.StatusConflict, gin.H{"error": "Email employee sudah terdaftar."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": serviceErr.Error()})
		return
	}

	log.Printf("Employee berhasil dibuat oleh service: %+v\n", createdEmployee)
	// Kirim respons sukses
	c.JSON(http.StatusCreated, gin.H{
		"message":  "Employee berhasil ditambahkan",
		"employee": createdEmployee,
	})
}

func (h *handler) RegisterAdmin(c *gin.Context) {
	var input AdminRegisterInput // Dari model.go

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	registeredAdminAccount, err := h.svc.RegisterAdmin(input)
	if err != nil {
		// Error spesifik dari service
		if err.Error() == "employee ID tidak ditemukan, tidak dapat register akun admin" ||
			err.Error() == "employee ID sudah terdaftar sebagai akun admin" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Akun admin berhasil diregistrasi",
		"account": gin.H{ // Kirim data yang aman
			"employee_id": registeredAdminAccount.EmployeeID,
			"fullname":    registeredAdminAccount.FullName,
			"role":        registeredAdminAccount.Role,
			"created_at":  registeredAdminAccount.CreatedAt,
		},
	})
}

func (h *handler) LoginAdmin(c *gin.Context) {
	var input AdminLoginInput // Dari model.go

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tokenString, err := h.svc.LoginAdmin(input)
	if err != nil {
		if err.Error() == "employee ID admin tidak ditemukan" || err.Error() == "password admin salah" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Employee ID atau password admin salah"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login admin berhasil",
		"token":   tokenString,
	})
}

func (h *handler) GetAdminProfile(c *gin.Context) {
	// Ambil employee_id dari JWT claims yang sudah di-set oleh middleware autentikasi Anda
	// Ini adalah contoh, cara Anda mendapatkan claim bisa berbeda tergantung implementasi middleware Anda
	employeeIDInterface, exists := c.Get("admin_employee_id") // Ganti "employee_id_from_token" dengan nama key yang benar
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Employee ID tidak ditemukan di token"})
		return
	}

	employeeID, ok := employeeIDInterface.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Format Employee ID di token tidak valid"})
		return
	}

	adminProfile, err := h.svc.GetAdminProfile(employeeID)
	if err != nil {
		if err.Error() == "detail employee untuk admin tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Kembalikan data yang aman
	c.JSON(http.StatusOK, gin.H{
		"employeeId": adminProfile.EmployeeID,
		"fullName":   adminProfile.FullName,
		"role":       adminProfile.Role,
		"image":      adminProfile.Image,
		// Tambahkan field lain dari struct Employee jika perlu
	})
}

func (h *handler) ListEmployees(c *gin.Context) {
	log.Println("[Handler ListEmployees] Memulai proses...")
	employees, err := h.svc.ListEmployees()
	if err != nil {
		log.Printf("[Handler ListEmployees] Error dari service: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar karyawan", "details": err.Error()})
		return
	}

	log.Printf("[Handler ListEmployees] Berhasil mengambil %d karyawan.\n", len(employees))
	// Frontend Anda mengharapkan response.data.employees atau response.data
	// Memberikan wrapper "employees" lebih konsisten
	c.JSON(http.StatusOK, gin.H{"employees": employees})
}

func (h *handler) GetEmployeeByID(c *gin.Context) {
	employeeID := c.Param("employeeId") // Ambil ID dari path parameter
	log.Printf("[Handler GetEmployeeByID] Memulai proses untuk Employee ID: %s\n", employeeID)

	if employeeID == "" {
		log.Println("[Handler GetEmployeeByID] Error: Employee ID kosong.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Employee ID dibutuhkan"})
		return
	}

	employee, err := h.svc.GetEmployeeByID(employeeID)
	if err != nil {
		log.Printf("[Handler GetEmployeeByID] Error dari service untuk ID %s: %v\n", employeeID, err)
		if err.Error() == "karyawan tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil detail karyawan", "details": err.Error()})
		return
	}

	log.Printf("[Handler GetEmployeeByID] Berhasil mengambil detail untuk Employee ID: %s\n", employeeID)
	// Frontend Anda mengharapkan response.data.employee atau response.data
	c.JSON(http.StatusOK, gin.H{"employee": employee})
}

func (h *handler) DeleteEmployee(c *gin.Context) {
	employeeID := c.Param("employeeId") // Ambil ID dari path parameter
	log.Printf("[Handler DeleteEmployee] Memulai proses delete untuk Employee ID: %s\n", employeeID)

	if employeeID == "" {
		log.Println("[Handler DeleteEmployee] Error: Employee ID kosong.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Employee ID dibutuhkan"})
		return
	}

	err := h.svc.DeleteEmployee(employeeID)
	if err != nil {
		log.Printf("[Handler DeleteEmployee] Error dari service DeleteEmployee untuk ID %s: %v\n", employeeID, err)
		if err.Error() == "employee tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		// Error lain dari service (misal, gagal hapus dari salah satu tabel)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus karyawan", "details": err.Error()})
		return
	}

	log.Printf("[Handler DeleteEmployee] Berhasil menghapus karyawan dengan ID: %s\n", employeeID)
	// Mengembalikan status 200 OK dengan pesan, atau bisa juga 204 No Content jika tidak ada body respons
	c.JSON(http.StatusOK, gin.H{"message": "Karyawan berhasil dihapus"})
}

func (h *handler) UpdateEmployee(c *gin.Context) {
	employeeID := c.Param("employeeId")
	log.Printf("[Handler UpdateEmployee] Memulai update untuk Employee ID: %s\n", employeeID)

	if employeeID == "" {
		log.Println("[Handler UpdateEmployee] Error: Employee ID kosong di path.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Employee ID dibutuhkan di URL"})
		return
	}

	// Set batas memori untuk parsing multipart form
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10 MB
		log.Printf("[Handler UpdateEmployee] Error parsing multipart form: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal memproses form data: " + err.Error()})
		return
	}

	// 1. Ambil string JSON dari field "jsonData"
	jsonDataString := c.PostForm("jsonData")
	if jsonDataString == "" {
		log.Println("[Handler UpdateEmployee] Error: Field 'jsonData' kosong.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data employee (jsonData) tidak ditemukan."})
		return
	}

	var inputDTO AddEmployeeInput // DTO yang sama dengan AddEmployee, field EmployeeID tidak akan dipakai dari sini
	if err := json.Unmarshal([]byte(jsonDataString), &inputDTO); err != nil {
		log.Printf("[Handler UpdateEmployee] Error unmarshalling jsonData: %v\njsonData: %s\n", err, jsonDataString)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data employee tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler UpdateEmployee] Data employee dari jsonData: %+v\n", inputDTO)

	// 2. Proses file gambar baru jika ada
	var newImagePath *string // Pointer ke string, nil berarti tidak ada file baru / tidak ada instruksi ubah gambar
	fileHeader, errFile := c.FormFile("imageFile")

	if errFile == nil && fileHeader != nil { // Ada file baru yang diupload
		ext := filepath.Ext(fileHeader.Filename)
		uniqueFilename := uuid.New().String() + ext
		uploadDir := "./uploads/images/profile/"
		savePathOnDisk := filepath.Join(uploadDir, uniqueFilename)

		if errMkdir := os.MkdirAll(uploadDir, os.ModePerm); errMkdir != nil {
			log.Printf("[Handler UpdateEmployee] Error membuat direktori uploads: %v\n", errMkdir)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyiapkan penyimpanan file."})
			return
		}

		if errSave := c.SaveUploadedFile(fileHeader, savePathOnDisk); errSave != nil {
			log.Printf("[Handler UpdateEmployee] Error menyimpan file upload baru: %v\n", errSave)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file gambar baru."})
			return
		}
		log.Printf("[Handler UpdateEmployee] File baru berhasil disimpan ke: %s\n", savePathOnDisk)

		// Path yang akan disimpan ke DB dan dikirim ke service
		savedPathForService := strings.TrimPrefix(filepath.ToSlash(savePathOnDisk), "./")
		newImagePath = &savedPathForService // Set pointer ke path baru

	} else if errFile != nil && errFile != http.ErrMissingFile {
		log.Printf("[Handler UpdateEmployee] Error mendapatkan file (bukan ErrMissingFile): %v\n", errFile)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error memproses file gambar: " + errFile.Error()})
		return
	}
	// Jika errFile == http.ErrMissingFile, newImagePath akan tetap nil (tidak ada file baru)

	// 3. Panggil service dengan ID dari path, DTO dari jsonData, dan pointer ke path gambar baru
	updatedEmployee, serviceErr := h.svc.UpdateEmployee(employeeID, inputDTO, newImagePath)
	if serviceErr != nil {
		log.Printf("[Handler UpdateEmployee] Error dari service UpdateEmployee untuk ID %s: %v\n", employeeID, serviceErr)
		if serviceErr.Error() == "employee tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		// Tangani error duplikat email jika ada dari service
		if strings.Contains(serviceErr.Error(), "email sudah terdaftar") || strings.Contains(strings.ToLower(serviceErr.Error()), "unique constraint") && strings.Contains(strings.ToLower(serviceErr.Error()), "email") {
			c.JSON(http.StatusConflict, gin.H{"error": "Email sudah digunakan oleh karyawan lain."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate karyawan", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler UpdateEmployee] Berhasil mengupdate karyawan dengan ID: %s\n", employeeID)
	c.JSON(http.StatusOK, gin.H{
		"message":  "Employee berhasil diupdate",
		"employee": updatedEmployee, // Kirim data employee yang sudah diupdate
	})
}

func (h *handler) AddDepartment(c *gin.Context) {
	var input AddDepartmentInput // Dari model.go (package admin)

	// Bind JSON input ke struct AddDepartmentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[Handler AddDepartment] Error binding JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler AddDepartment] Menerima input: %+v\n", input)

	// Panggil service untuk menambahkan departemen
	createdDepartment, serviceErr := h.svc.AddDepartment(input)
	if serviceErr != nil {
		log.Printf("[Handler AddDepartment] Error dari service AddDepartment: %v\n", serviceErr)
		if serviceErr.Error() == "nama departemen sudah ada" {
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan departemen", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler AddDepartment] Departemen berhasil dibuat: %+v\n", createdDepartment)
	c.JSON(http.StatusCreated, gin.H{
		"message":    "Departemen berhasil ditambahkan",
		"department": createdDepartment,
	})
}

func (h *handler) ListActiveDepartmentsForDropdown(c *gin.Context) {
	log.Println("[Handler ListActiveDepartmentsForDropdown] Memulai proses...")
	departments, err := h.svc.ListActiveDepartmentsForDropdown()
	if err != nil {
		// ... (error handling)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar departemen aktif"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"departments": departments})
}

func (h *handler) ListDepartments(c *gin.Context) {
	log.Println("[Handler ListDepartments] Memulai proses...")
	departments, err := h.svc.ListDepartmentsWithEmployeeCount()
	if err != nil {
		log.Printf("[Handler ListDepartments] Error dari service: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar departemen", "details": err.Error()})
		return
	}
	log.Printf("[Handler ListDepartments] Berhasil mengambil %d departemen.\n", len(departments))
	c.JSON(http.StatusOK, gin.H{"departments": departments})
}

func (h *handler) DeleteDepartment(c *gin.Context) {
	departmentID := c.Param("departmentId") // Ambil ID dari path parameter
	log.Printf("[Handler DeleteDepartment] Memulai proses delete untuk Department ID: %s\n", departmentID)

	if departmentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Department ID dibutuhkan"})
		return
	}

	err := h.svc.DeleteDepartment(departmentID)
	if err != nil {
		log.Printf("[Handler DeleteDepartment] Error dari service untuk ID %s: %v\n", departmentID, err)
		if err.Error() == "departemen tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		// Cek error spesifik dari service jika departemen masih punya employee
		if err.Error()[:50] == "departemen tidak dapat dihapus karena masih memiliki" { // Periksa prefix error
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus departemen", "details": err.Error()})
		return
	}

	log.Printf("[Handler DeleteDepartment] Berhasil menghapus departemen dengan ID: %s\n", departmentID)
	c.JSON(http.StatusOK, gin.H{"message": "Departemen berhasil dihapus"})
}

func (h *handler) UpdateDepartment(c *gin.Context) {
	departmentID := c.Param("departmentId") // Ambil ID dari path parameter
	log.Printf("[Handler UpdateDepartment] Memulai update untuk Department ID: %s\n", departmentID)

	if departmentID == "" {
		log.Println("[Handler UpdateDepartment] Error: Department ID kosong di path.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Department ID dibutuhkan di URL"})
		return
	}

	var input UpdateDepartmentInput // DTO dari model.go
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[Handler UpdateDepartment] Error binding JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler UpdateDepartment] Menerima input: %+v untuk ID: %s\n", input, departmentID)

	updatedDepartment, serviceErr := h.svc.UpdateDepartment(departmentID, input)
	if serviceErr != nil {
		log.Printf("[Handler UpdateDepartment] Error dari service UpdateDepartment untuk ID %s: %v\n", departmentID, serviceErr)
		if serviceErr.Error() == "departemen tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		// Cek error spesifik dari service jika nama departemen sudah ada
		if strings.Contains(serviceErr.Error(), "nama departemen sudah digunakan") {
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate departemen", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler UpdateDepartment] Berhasil mengupdate departemen dengan ID: %s\n", departmentID)
	c.JSON(http.StatusOK, gin.H{
		"message":    "Departemen berhasil diupdate",
		"department": updatedDepartment,
	})
}

func (h *handler) GetDepartmentByID(c *gin.Context) {
	departmentID := c.Param("departmentId") // Ambil ID dari path parameter
	log.Printf("[Handler GetDepartmentByID] Memulai proses untuk Department ID: %s\n", departmentID)

	if departmentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Department ID dibutuhkan"})
		return
	}

	department, err := h.svc.GetDepartmentByID(departmentID)
	if err != nil {
		if err.Error() == "departemen tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil detail departemen", "details": err.Error()})
		return
	}

	log.Printf("[Handler GetDepartmentByID] Berhasil mengambil detail untuk Department ID: %s\n", departmentID)
	// Frontend Anda mungkin mengharapkan { "department": ... } atau langsung objeknya
	c.JSON(http.StatusOK, gin.H{"department": department})
}

func (h *handler) AddProductCategory(c *gin.Context) {
	var input AddProductCategoryInput // Dari model.go (package admin)

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[Handler AddProductCategory] Error binding JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler AddProductCategory] Menerima input: %+v\n", input)

	createdCategory, serviceErr := h.svc.AddProductCategory(input)
	if serviceErr != nil {
		log.Printf("[Handler AddProductCategory] Error dari service AddProductCategory: %v\n", serviceErr)
		if strings.Contains(serviceErr.Error(), "nama kategori produk sudah ada") {
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan kategori produk", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler AddProductCategory] Kategori produk berhasil dibuat: %+v\n", createdCategory)
	c.JSON(http.StatusCreated, gin.H{
		"message":  "Kategori produk berhasil ditambahkan",
		"category": createdCategory,
	})
}

func (h *handler) ListProductCategories(c *gin.Context) {
	log.Println("[Handler ListProductCategories] Memulai proses...")
	categories, err := h.svc.ListProductCategories()
	if err != nil {
		log.Printf("[Handler ListProductCategories] Error dari service: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar kategori produk", "details": err.Error()})
		return
	}

	log.Printf("[Handler ListProductCategories] Berhasil mengambil %d kategori produk.\n", len(categories))
	// Frontend ProductCategories.jsx Anda mengharapkan response.data.categories atau response.data
	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

func (h *handler) GetProductCategoryByID(c *gin.Context) {
	categoryID := c.Param("categoryId") // Ambil ID dari path parameter
	log.Printf("[Handler GetProductCategoryByID] Memulai proses untuk Category ID: %s\n", categoryID)

	if categoryID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category ID dibutuhkan"})
		return
	}

	category, err := h.svc.GetProductCategoryByID(categoryID)
	if err != nil {
		log.Printf("[Handler GetProductCategoryByID] Error dari service untuk ID %s: %v\n", categoryID, err)
		if err.Error() == "kategori produk tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil detail kategori produk", "details": err.Error()})
		return
	}

	log.Printf("[Handler GetProductCategoryByID] Berhasil mengambil detail untuk Category ID: %s\n", categoryID)
	// Frontend EditProductCategories.jsx mengharapkan response.data.category atau response.data
	c.JSON(http.StatusOK, gin.H{"category": category})
}

func (h *handler) UpdateProductCategory(c *gin.Context) {
	categoryID := c.Param("categoryId")
	log.Printf("[Handler UpdateProductCategory] Memulai update untuk Category ID: %s\n", categoryID)

	if categoryID == "" {
		log.Println("[Handler UpdateProductCategory] Error: Category ID kosong di path.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category ID dibutuhkan di URL"})
		return
	}

	var input UpdateProductCategoryInput // DTO dari model.go
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[Handler UpdateProductCategory] Error binding JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data input tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler UpdateProductCategory] Menerima input: %+v untuk ID: %s\n", input, categoryID)

	updatedCategory, serviceErr := h.svc.UpdateProductCategory(categoryID, input)
	if serviceErr != nil {
		log.Printf("[Handler UpdateProductCategory] Error dari service UpdateProductCategory untuk ID %s: %v\n", categoryID, serviceErr)
		if serviceErr.Error() == "kategori produk tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		if strings.Contains(serviceErr.Error(), "nama kategori produk sudah digunakan") {
			c.JSON(http.StatusConflict, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate kategori produk", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler UpdateProductCategory] Berhasil mengupdate kategori produk dengan ID: %s\n", categoryID)
	c.JSON(http.StatusOK, gin.H{
		"message":  "Kategori produk berhasil diupdate",
		"category": updatedCategory, // Kirim data kategori yang sudah diupdate
	})
}

func (h *handler) DeleteProductCategory(c *gin.Context) {
	categoryID := c.Param("categoryId") // Ambil ID dari path parameter
	log.Printf("[Handler DeleteProductCategory] Memulai proses delete untuk Category ID: %s\n", categoryID)

	if categoryID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category ID dibutuhkan"})
		return
	}

	err := h.svc.DeleteProductCategory(categoryID)
	if err != nil {
		log.Printf("[Handler DeleteProductCategory] Error dari service untuk ID %s: %v\n", categoryID, err)
		// Sesuaikan penanganan error berdasarkan pesan dari service
		if err.Error() == "kategori produk tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		// Contoh jika service mengembalikan error karena masih ada produk terkait
		// (Anda perlu menyesuaikan pesan error aktual dari service)
		// if strings.Contains(err.Error(), "masih memiliki produk terkait") {
		// 	c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		// 	return
		// }
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori produk", "details": err.Error()})
		return
	}

	log.Printf("[Handler DeleteProductCategory] Berhasil menghapus kategori produk dengan ID: %s\n", categoryID)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori produk berhasil dihapus"})
	// Alternatif: return c.Status(http.StatusNoContent) jika tidak ada body respons
}

func (h *handler) AddProduct(c *gin.Context) {
	var inputDTO AddProductInput // DTO untuk jsonData

	// Set batas memori untuk parsing multipart form (misal 20MB untuk multiple images)
	if err := c.Request.ParseMultipartForm(20 << 20); err != nil {
		log.Printf("[Handler AddProduct] Error parsing multipart form: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal memproses form data: " + err.Error()})
		return
	}

	// 1. Ambil string JSON dari field "jsonData"
	jsonDataString := c.PostForm("jsonData")
	if jsonDataString == "" {
		log.Println("[Handler AddProduct] Error: Field 'jsonData' kosong.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data produk (jsonData) tidak ditemukan."})
		return
	}

	// 2. Unmarshal string JSON ke struct AddProductInput
	if err := json.Unmarshal([]byte(jsonDataString), &inputDTO); err != nil {
		log.Printf("[Handler AddProduct] Error unmarshalling jsonData: %v\njsonData: %s\n", err, jsonDataString)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data produk tidak valid: " + err.Error()})
		return
	}
	log.Printf("[Handler AddProduct] Data produk dari jsonData: %+v\n", inputDTO)

	// 3. Proses multiple file gambar dari field "imageFiles"
	form, err := c.MultipartForm()
	if err != nil {
		log.Printf("[Handler AddProduct] Error mendapatkan multipart form: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal memproses file: " + err.Error()})
		return
	}

	imageFiles := form.File["imageFiles"] // "imageFiles" adalah key array dari FormData frontend
	var savedImagePaths []string

	uploadDir := "./uploads/images/products/" // Direktori penyimpanan gambar produk
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Printf("[Handler AddProduct] Error membuat direktori uploads: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyiapkan penyimpanan file."})
		return
	}

	for _, fileHeader := range imageFiles {
		if fileHeader == nil {
			continue
		}
		ext := filepath.Ext(fileHeader.Filename)
		uniqueFilename := uuid.New().String() + ext
		savePathOnDisk := filepath.Join(uploadDir, uniqueFilename)

		if errSave := c.SaveUploadedFile(fileHeader, savePathOnDisk); errSave != nil {
			log.Printf("[Handler AddProduct] Error menyimpan file upload '%s': %v\n", fileHeader.Filename, errSave)
			// Anda bisa memilih untuk melanjutkan tanpa gambar ini atau mengembalikan error
			// Untuk sekarang, kita lanjutkan saja dan log errornya.
			// Atau: c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan salah satu file gambar."}); return
			continue
		}
		log.Printf("[Handler AddProduct] File '%s' berhasil disimpan ke: %s\n", fileHeader.Filename, savePathOnDisk)

		// Path yang akan disimpan ke DB dan diteruskan ke service
		relativePath := strings.TrimPrefix(filepath.ToSlash(savePathOnDisk), "./")
		savedImagePaths = append(savedImagePaths, relativePath)
	}
	log.Printf("[Handler AddProduct] Path gambar yang tersimpan: %v\n", savedImagePaths)

	// 4. Panggil service untuk menambahkan produk
	createdProduct, serviceErr := h.svc.AddProduct(inputDTO, savedImagePaths)
	if serviceErr != nil {
		log.Printf("[Handler AddProduct] Error dari service AddProduct: %v\n", serviceErr)
		if serviceErr.Error() == "kategori produk tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		// Tangani error duplikasi lain jika ada (misal, jika title produk harus unik)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan produk", "details": serviceErr.Error()})
		return
	}

	log.Printf("[Handler AddProduct] Produk berhasil dibuat: %+v\n", createdProduct)
	c.JSON(http.StatusCreated, gin.H{
		"message": "Produk berhasil ditambahkan",
		"product": createdProduct,
	})
}

func (h *handler) ListActiveProductCategories(c *gin.Context) {
	log.Println("[Handler ListActiveProductCategories] Memulai proses...")
	categories, err := h.svc.ListActiveProductCategories()
	if err != nil {
		log.Printf("[Handler ListActiveProductCategories] Error dari service: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar kategori produk aktif", "details": err.Error()})
		return
	}

	log.Printf("[Handler ListActiveProductCategories] Berhasil mengambil %d kategori produk aktif.\n", len(categories))
	// Frontend AddProduct.jsx mengharapkan response.data.categories atau response.data
	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

func (h *handler) ListProducts(c *gin.Context) {
	products, err := h.svc.ListProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar produk", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"products": products})
}

func (h *handler) GetProductBySKU(c *gin.Context) {
	productSKU := c.Param("productSKU") // Sesuaikan nama parameter dengan rute
	if productSKU == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product SKU dibutuhkan"})
		return
	}
	product, err := h.svc.GetProductBySKU(productSKU)
	if err != nil {
		if err.Error() == "produk tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil detail produk", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"product": product})
}

func (h *handler) UpdateProduct(c *gin.Context) {
	productSKU := c.Param("productSKU")
	if productSKU == "" { /* ... error handling ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product SKU dibutuhkan"})
		return
	}

	var inputDTO AddProductInput                                   // Gunakan DTO yang sama untuk data JSON
	if err := c.Request.ParseMultipartForm(20 << 20); err != nil { /* ... error handling ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal parse form: " + err.Error()})
		return
	}
	jsonDataString := c.PostForm("jsonData")
	if jsonDataString == "" { /* ... error handling ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "jsonData tidak ditemukan"})
		return
	}
	if err := json.Unmarshal([]byte(jsonDataString), &inputDTO); err != nil { /* ... error handling ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format jsonData tidak valid: " + err.Error()})
		return
	}

	form, err := c.MultipartForm()
	if err != nil { /* ... error handling ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal proses file: " + err.Error()})
		return
	}
	newImageFiles := form.File["imageFiles"] // File baru yang diupload
	var newSavedImagePaths []string
	uploadDir := "./uploads/images/products/"                   // Pastikan direktori ini ada
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil { /* ... error handling ... */
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal siapkan storage"})
		return
	}

	for _, fileHeader := range newImageFiles {
		if fileHeader == nil {
			continue
		}
		ext := filepath.Ext(fileHeader.Filename)
		uniqueFilename := uuid.New().String() + ext
		savePathOnDisk := filepath.Join(uploadDir, uniqueFilename)
		if errSave := c.SaveUploadedFile(fileHeader, savePathOnDisk); errSave != nil { /* ... error handling ... */
			log.Printf("Gagal simpan file baru %s: %v", fileHeader.Filename, errSave)
			continue
		}
		newSavedImagePaths = append(newSavedImagePaths, strings.TrimPrefix(filepath.ToSlash(savePathOnDisk), "./"))
	}

	updatedProduct, serviceErr := h.svc.UpdateProduct(productSKU, inputDTO, newSavedImagePaths)
	if serviceErr != nil { /* ... error handling (404, 500, 409 jika nama/SKU duplikat) ... */
		if serviceErr.Error() == "produk tidak ditemukan untuk diupdate" {
			c.JSON(http.StatusNotFound, gin.H{"error": serviceErr.Error()})
			return
		}
		if strings.Contains(serviceErr.Error(), "kategori produk baru tidak valid") {
			c.JSON(http.StatusBadRequest, gin.H{"error": serviceErr.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": serviceErr.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil diupdate", "product": updatedProduct})
}

func (h *handler) DeleteProduct(c *gin.Context) {
	productSKU := c.Param("productSKU")
	if productSKU == "" { /* ... error handling ... */
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product SKU dibutuhkan"})
		return
	}
	err := h.svc.DeleteProduct(productSKU)
	if err != nil { /* ... error handling (404, 500) ... */
		if err.Error() == "produk tidak ditemukan" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil dihapus"})
}
