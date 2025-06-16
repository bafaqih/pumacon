package admin

import (
	"errors"
	"fmt"
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
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	employeeDateFormat = "2006-01-02"
)

var adminJwtExpirationTime = 1000 * time.Hour

type AdminJwtCustomClaims struct {
	EmployeeID string `json:"employee_id"`
	Role       string `json:"role"`
	jwt.RegisteredClaims
}

type Service interface {
	RegisterAdmin(input AdminRegisterInput) (models.EmployeeAccount, error)
	LoginAdmin(input AdminLoginInput) (string, error)
	AddEmployee(input AddEmployeeInput, imageFileHeader *multipart.FileHeader) (models.Employee, error)
	GetAdminProfile(employeeID string) (models.Employee, error)
	ListEmployees() ([]models.Employee, error)
	GetEmployeeByID(employeeID string) (models.Employee, error)
	DeleteEmployee(employeeID string) error
	UpdateEmployee(employeeID string, input AddEmployeeInput, newImagePath *string) (models.Employee, error)
	AddDepartment(input AddDepartmentInput) (models.Department, error)
	ListActiveDepartmentsForDropdown() ([]models.Department, error)
	ListDepartmentsWithEmployeeCount() ([]models.Department, error)
	DeleteDepartment(departmentID string) error
	UpdateDepartment(departmentID string, input UpdateDepartmentInput) (models.Department, error)
	GetDepartmentByID(departmentID string) (models.Department, error)
	AddProductCategory(input AddProductCategoryInput) (models.ProductCategory, error)
	ListProductCategories() ([]models.ProductCategory, error)
	GetProductCategoryByID(categoryID string) (models.ProductCategory, error)
	UpdateProductCategory(categoryID string, input UpdateProductCategoryInput) (models.ProductCategory, error)
	DeleteProductCategory(categoryID string) error
	ListActiveProductCategories() ([]models.ProductCategory, error)
	AddProduct(input AddProductInput, imagePaths []string) (models.Product, error)
	ListProducts() ([]models.Product, error)
	GetProductBySKU(productSKU string) (models.Product, error)
	UpdateProduct(productSKU string, input AddProductInput, newImagePaths []string) (models.Product, error)
	DeleteProduct(productSKU string) error
	ListAllOrders(statusFilter string) ([]AdminOrderListView, error)
	GetOrderDetailForAdmin(orderID string) (AdminOrderDetailView, error)
	UpdateOrderStatus(orderID string, input AdminUpdateOrderStatusInput) (models.Order, error)
	DeleteOrder(orderID string) error
	ListOrderedCustomers() ([]AdminCustomerListView, error)
	GetCustomerDetailForAdmin(customerID string) (AdminCustomerDetailView, error)
	DeleteCustomer(customerID string) error

	AddNewsCategory(input UpsertNewsCategoryInput) (models.NewsCategory, error)
	ListNewsCategories() ([]models.NewsCategory, error)
	GetNewsCategoryByID(categoryID string) (models.NewsCategory, error)
	UpdateNewsCategory(categoryID string, input UpsertNewsCategoryInput) (models.NewsCategory, error)
	DeleteNewsCategory(categoryID string) error
	AddNewsPost(authorID string, input AddNewsPostInput, imageFileHeader *multipart.FileHeader) (models.NewsPost, error)
	ListActiveNewsCategories() ([]models.NewsCategory, error)
	ListNewsPosts() ([]AdminNewsPostListView, error)
	GetNewsPostByID(newsID string) (models.NewsPost, error)
	UpdateNewsPost(newsID string, input UpdateNewsPostInput, imageFileHeader *multipart.FileHeader) (models.NewsPost, error)
	DeleteNewsPost(newsID string) error

	GetDashboardStatistics() (DashboardStats, error)
}

type service struct {
	db           *gorm.DB
	jwtSecretKey []byte
}

func NewService(db *gorm.DB, adminJwtSecret []byte) Service {
	return &service{
		db:           db,
		jwtSecretKey: adminJwtSecret,
	}
}

func getDepartmentName(db *gorm.DB, departmentID string) (string, error) {
	if departmentID == "" {
		return "", nil
	}
	var dept models.Department
	if err := db.Where("department_id = ?", departmentID).First(&dept).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service Helper] Department dengan ID '%s' tidak ditemukan untuk lookup nama.\n", departmentID)
			return "", nil
		}
		return "", err
	}
	return dept.DepartmentName, nil
}

func (s *service) AddEmployee(input AddEmployeeInput, imageFileHeader *multipart.FileHeader) (models.Employee, error) {
	log.Printf("[Service AddEmployee] Menambah employee baru dengan email: %s\n", input.Email)

	var existingEmployeeCount int64
	if err := s.db.Model(&models.Employee{}).Where("email = ?", input.Email).Count(&existingEmployeeCount).Error; err != nil {
		return models.Employee{}, fmt.Errorf("gagal memeriksa email: %w", err)
	}
	if existingEmployeeCount > 0 {
		return models.Employee{}, errors.New("email sudah terdaftar untuk employee lain")
	}

	var newImagePath string
	var finalCreatedEmployee models.Employee

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Logika untuk menyimpan file gambar (jika ada)
		if imageFileHeader != nil {
			ext := filepath.Ext(imageFileHeader.Filename)
			uniqueFilename := "emp_" + uuid.New().String() + ext
			uploadDir := "./uploads/images/profile/"
			if errMkdir := os.MkdirAll(uploadDir, os.ModePerm); errMkdir != nil {
				return fmt.Errorf("gagal membuat direktori untuk gambar profil: %w", errMkdir)
			}
			savePathOnDisk := filepath.Join(uploadDir, uniqueFilename)

			src, errOpen := imageFileHeader.Open()
			if errOpen != nil {
				return fmt.Errorf("gagal membuka file gambar: %w", errOpen)
			}
			defer src.Close()

			dst, errCreate := os.Create(savePathOnDisk)
			if errCreate != nil {
				return fmt.Errorf("gagal membuat file tujuan: %w", errCreate)
			}
			defer dst.Close()

			if _, errCopy := io.Copy(dst, src); errCopy != nil {
				return fmt.Errorf("gagal menyimpan file gambar: %w", errCopy)
			}
			newImagePath = strings.TrimPrefix(filepath.ToSlash(savePathOnDisk), "./")
		} else if input.Image != "" {
			newImagePath = input.Image
		}

		// 2. Parsing tanggal lahir dan tanggal bergabung
		birthday, errParseBirthday := time.Parse(employeeDateFormat, input.Birthday)
		if errParseBirthday != nil {
			return fmt.Errorf("format tanggal lahir tidak valid (gunakan YYYY-MM-DD): %w", errParseBirthday)
		}
		joinDate, errParseJoinDate := time.Parse(employeeDateFormat, input.JoinDate)
		if errParseJoinDate != nil {
			return fmt.Errorf("format tanggal bergabung tidak valid (gunakan YYYY-MM-DD): %w", errParseJoinDate)
		}

		// 3. Generate Employee ID sekuensial dari database
		var nextVal int
		if err := tx.Raw("SELECT nextval('employee_id_seq')").Scan(&nextVal).Error; err != nil {
			return fmt.Errorf("gagal mendapatkan ID employee: %w", err)
		}
		newEmployeeID := fmt.Sprintf("EMP%05d", nextVal)
		log.Printf("[Service AddEmployee] ID Employee baru digenerate: %s\n", newEmployeeID)

		// 4. Buat instance Employee
		employee := models.Employee{
			EmployeeID: newEmployeeID,
			Image:      newImagePath,
			FullName:   input.FullName,
			Birthday:   birthday,
			Department: input.DepartmentID,
			Email:      input.Email,
			Phone:      input.Phone,
			JoinDate:   joinDate,
			Role:       input.Role,
			Status:     input.Status,
		}
		if err := tx.Create(&employee).Error; err != nil {
			return fmt.Errorf("gagal menyimpan data employee: %w", err)
		}

		// 5. Buat EmployeeAddress
		employeeAddress := models.EmployeeAddress{
			EmployeeID:   newEmployeeID,
			Street:       input.Address.Street,
			DistrictCity: input.Address.DistrictCity,
			Province:     input.Address.Province,
			PostCode:     input.Address.PostCode,
			Country:      input.Address.Country,
		}
		if err := tx.Create(&employeeAddress).Error; err != nil {
			return fmt.Errorf("gagal menyimpan alamat employee: %w", err)
		}

		// Langkah 6 (Pembuatan models.EmployeeAccount) DIHAPUS

		// 6. Ambil kembali data lengkap untuk dikembalikan ke fungsi utama
		if err := tx.Preload("Address").First(&finalCreatedEmployee, "employee_id = ?", newEmployeeID).Error; err != nil {
			return fmt.Errorf("gagal mengambil data employee lengkap setelah create: %w", err)
		}

		return nil // Commit transaksi
	})

	if err != nil {
		if newImagePath != "" && imageFileHeader != nil {
			os.Remove(filepath.Join(".", newImagePath))
		}
		return models.Employee{}, err
	}

	// Isi DepartmentName untuk respons
	deptName, _ := getDepartmentName(s.db, finalCreatedEmployee.Department)
	finalCreatedEmployee.DepartmentName = deptName

	log.Printf("[Service AddEmployee] Employee '%s' (ID: %s) berhasil disimpan.\n", finalCreatedEmployee.FullName, finalCreatedEmployee.EmployeeID)
	return finalCreatedEmployee, nil
}

func (s *service) RegisterAdmin(input AdminRegisterInput) (models.EmployeeAccount, error) {
	// ... (Kode RegisterAdmin Anda sepertinya sudah benar)
	var employee models.Employee
	if err := s.db.Where("employee_id = ?", input.EmployeeID).First(&employee).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return models.EmployeeAccount{}, errors.New("employee ID tidak ditemukan, tidak dapat register akun admin")
		}
		return models.EmployeeAccount{}, fmt.Errorf("gagal mencari data employee: %w", err)
	}
	var existingAccount models.EmployeeAccount
	if err := s.db.Where("employee_id = ?", input.EmployeeID).First(&existingAccount).Error; err == nil {
		return models.EmployeeAccount{}, errors.New("employee ID sudah terdaftar sebagai akun admin")
	} else if err != gorm.ErrRecordNotFound {
		return models.EmployeeAccount{}, fmt.Errorf("gagal memeriksa akun admin existing: %w", err)
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return models.EmployeeAccount{}, fmt.Errorf("gagal mengenkripsi password: %w", err)
	}
	adminAccount := models.EmployeeAccount{
		EmployeeID: employee.EmployeeID, FullName: employee.FullName, Role: employee.Role, Password: string(hashedPassword),
	}
	if err := s.db.Create(&adminAccount).Error; err != nil {
		return models.EmployeeAccount{}, fmt.Errorf("gagal membuat akun admin: %w", err)
	}
	return adminAccount, nil
}

func (s *service) generateJWTTokenForAdmin(account models.EmployeeAccount) (string, error) {
	// ... (Kode generateJWTTokenForAdmin Anda sudah benar)
	claims := &AdminJwtCustomClaims{
		account.EmployeeID,
		account.Role,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(adminJwtExpirationTime)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "pumacon", // Pastikan konsisten dengan validasi jika ada
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecretKey)
}

func (s *service) LoginAdmin(input AdminLoginInput) (string, error) {
	// ... (Kode LoginAdmin Anda sudah benar)
	var account models.EmployeeAccount
	if err := s.db.Where("employee_id = ?", input.EmployeeID).First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", errors.New("employee ID admin tidak ditemukan")
		}
		return "", fmt.Errorf("gagal mencari akun admin: %w", err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(input.Password)); err != nil {
		return "", errors.New("password admin salah")
	}
	tokenString, err := s.generateJWTTokenForAdmin(account)
	if err != nil {
		return "", fmt.Errorf("gagal membuat token JWT admin: %w", err)
	}
	return tokenString, nil
}

func (s *service) GetAdminProfile(employeeID string) (models.Employee, error) {
	var employee models.Employee
	// Preload Address. DepartmentName akan diisi manual.
	if err := s.db.Preload("Address").Where("employee_id = ?", employeeID).First(&employee).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Employee{}, errors.New("detail employee untuk admin tidak ditemukan")
		}
		return models.Employee{}, fmt.Errorf("gagal mengambil profil admin: %w", err)
	}
	// Isi DepartmentName
	deptName, _ := getDepartmentName(s.db, employee.Department)
	employee.DepartmentName = deptName
	return employee, nil
}

func (s *service) ListEmployees() ([]models.Employee, error) {
	var employees []models.Employee
	if err := s.db.Preload("Address").Order("created_at desc").Find(&employees).Error; err != nil {
		// ... (error handling)
		return nil, fmt.Errorf("gagal mengambil daftar karyawan: %w", err)
	}

	// Ambil semua ID departemen unik
	departmentIDs := make(map[string]bool)
	for _, emp := range employees {
		if emp.Department != "" { // emp.Department berisi DepartmentID
			departmentIDs[emp.Department] = true
		}
	}

	var deptIdList []string
	for id := range departmentIDs {
		deptIdList = append(deptIdList, id)
	}

	departmentMap := make(map[string]string) // Peta dari DepartmentID ke DepartmentName
	if len(deptIdList) > 0 {
		var depts []models.Department
		if err := s.db.Where("department_id IN ?", deptIdList).Find(&depts).Error; err == nil {
			for _, dept := range depts {
				departmentMap[dept.DepartmentID] = dept.DepartmentName
			}
		} else {
			log.Printf("[Service ListEmployees] Gagal mengambil nama departemen untuk daftar: %v", err)
		}
	}

	// Isi DepartmentName untuk setiap employee
	for i := range employees {
		if deptName, ok := departmentMap[employees[i].Department]; ok { // employees[i].Department adalah ID
			employees[i].DepartmentName = deptName
		} else if employees[i].Department != "" {
			employees[i].DepartmentName = "N/A (ID: " + employees[i].Department + ")" // Fallback jika nama tidak ketemu
		}
	}
	return employees, nil
}

func (s *service) GetEmployeeByID(employeeID string) (models.Employee, error) {
	var employee models.Employee
	if err := s.db.Preload("Address").Where("employee_id = ?", employeeID).First(&employee).Error; err != nil {
		// ... (error handling gorm.ErrRecordNotFound, dll) ...
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Employee{}, errors.New("karyawan tidak ditemukan")
		}
		return models.Employee{}, fmt.Errorf("gagal mengambil detail karyawan: %w", err)
	}

	// Isi DepartmentName
	deptName, deptErr := getDepartmentName(s.db, employee.Department) // employee.Department adalah ID
	if deptErr != nil {
		log.Printf("Peringatan saat GetEmployeeByID: Gagal mengambil nama departemen untuk ID %s: %v", employee.Department, deptErr)
	}
	employee.DepartmentName = deptName
	if employee.DepartmentName == "" && employee.Department != "" {
		employee.DepartmentName = "N/A (ID: " + employee.Department + ")" // Fallback
	}
	return employee, nil
}

func (s *service) DeleteEmployee(employeeID string) error {
	// ... (Kode DeleteEmployee Anda sudah benar)
	log.Printf("[Service DeleteEmployee] Memulai proses delete untuk Employee ID: %s\n", employeeID)
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var employee models.Employee
		if err := tx.Where("employee_id = ?", employeeID).First(&employee).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return errors.New("employee tidak ditemukan")
			}
			return fmt.Errorf("gagal memeriksa data employee: %w", err)
		}
		if err := tx.Where("employee_id = ?", employeeID).Delete(&models.EmployeeAccount{}).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("gagal menghapus akun employee: %w", err)
		}
		if err := tx.Where("employee_id = ?", employeeID).Delete(&models.EmployeeAddress{}).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("gagal menghapus alamat employee: %w", err)
		}
		result := tx.Where("employee_id = ?", employeeID).Delete(&models.Employee{})
		if result.Error != nil {
			return fmt.Errorf("gagal menghapus data utama employee: %w", result.Error)
		}
		// if result.RowsAffected == 0 { return errors.New("data employee utama tidak ditemukan untuk dihapus") } // Bisa dipertimbangkan
		return nil
	})
	if err != nil {
		log.Printf("[Service DeleteEmployee] Transaksi gagal untuk Employee ID %s: %v\n", employeeID, err)
		return err
	}
	log.Printf("[Service DeleteEmployee] Berhasil menghapus semua data terkait Employee ID: %s\n", employeeID)
	return nil
}

func (s *service) UpdateEmployee(employeeID string, input AddEmployeeInput, newImagePath *string) (models.Employee, error) {
	var birthday, joinDate time.Time
	var err error
	if input.Birthday != "" {
		birthday, err = time.Parse(employeeDateFormat, input.Birthday)
		if err != nil {
			return models.Employee{}, fmt.Errorf("format tanggal lahir tidak valid: %w", err)
		}
	}
	if input.JoinDate != "" {
		joinDate, err = time.Parse(employeeDateFormat, input.JoinDate)
		if err != nil {
			return models.Employee{}, fmt.Errorf("format tanggal bergabung tidak valid: %w", err)
		}
	}

	var finalUpdatedEmployee models.Employee
	err = s.db.Transaction(func(tx *gorm.DB) error {
		var empToUpdate models.Employee
		if err := tx.Preload("Address").Where("employee_id = ?", employeeID).First(&empToUpdate).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("employee tidak ditemukan")
			}
			return fmt.Errorf("gagal mengambil employee: %w", err)
		}
		oldImagePath := empToUpdate.Image
		empToUpdate.FullName = input.FullName
		empToUpdate.Email = input.Email
		empToUpdate.Phone = input.Phone
		if !birthday.IsZero() {
			empToUpdate.Birthday = birthday
		}
		if !joinDate.IsZero() {
			empToUpdate.JoinDate = joinDate
		}
		empToUpdate.Department = input.DepartmentID // Simpan DepartmentID
		empToUpdate.Role = input.Role
		empToUpdate.Status = input.Status

		if newImagePath != nil {
			if oldImagePath != "" && (newImagePath == nil || *newImagePath != oldImagePath) {
				fullOldPath := filepath.Join(".", oldImagePath)
				if errRem := os.Remove(fullOldPath); errRem != nil {
					log.Printf("Peringatan: Gagal menghapus file lama %s: %v", fullOldPath, errRem)
				}
			}
			if *newImagePath == "" {
				empToUpdate.Image = ""
			} else {
				empToUpdate.Image = *newImagePath
			}
		}

		if err := tx.Save(&empToUpdate).Error; err != nil {
			return fmt.Errorf("gagal update employee: %w", err)
		}

		if empToUpdate.Address.EmployeeID == "" {
			empToUpdate.Address = models.EmployeeAddress{EmployeeID: employeeID}
		}
		empToUpdate.Address.Street = input.Address.Street
		empToUpdate.Address.DistrictCity = input.Address.DistrictCity
		empToUpdate.Address.Province = input.Address.Province
		empToUpdate.Address.PostCode = input.Address.PostCode
		empToUpdate.Address.Country = input.Address.Country
		if err := tx.Save(&empToUpdate.Address).Error; err != nil {
			return fmt.Errorf("gagal update alamat employee: %w", err)
		}

		// Ambil kembali untuk mengisi DepartmentName dan memastikan Address termuat
		if err := tx.Preload("Address").First(&finalUpdatedEmployee, "employee_id = ?", employeeID).Error; err != nil {
			return fmt.Errorf("gagal mengambil data employee lengkap setelah update: %w", err)
		}
		return nil
	})
	if err != nil {
		return models.Employee{}, err
	}

	deptName, _ := getDepartmentName(s.db, finalUpdatedEmployee.Department)
	finalUpdatedEmployee.DepartmentName = deptName

	return finalUpdatedEmployee, nil
}

func (s *service) AddDepartment(input AddDepartmentInput) (models.Department, error) {
	// ... (Kode AddDepartment Anda sudah benar)
	var existingDept models.Department
	if err := s.db.Where("department_name = ?", input.DepartmentName).First(&existingDept).Error; err == nil {
		return models.Department{}, errors.New("nama departemen sudah ada")
	} else if err != gorm.ErrRecordNotFound {
		return models.Department{}, fmt.Errorf("gagal memeriksa nama departemen: %w", err)
	}

	var nextVal int
	if err := s.db.Raw("SELECT nextval('department_id_seq')").Scan(&nextVal).Error; err != nil {
		return models.Department{}, fmt.Errorf("gagal mendapatkan department id berikutnya: %w", err)
	}

	newDepartmentID := fmt.Sprintf("DEP%04d", nextVal)

	department := models.Department{
		DepartmentID: newDepartmentID, DepartmentName: input.DepartmentName, Description: input.Description, Status: input.Status,
	}
	if err := s.db.Create(&department).Error; err != nil {
		return models.Department{}, fmt.Errorf("gagal menyimpan departemen: %w", err)
	}
	return department, nil
}

func (s *service) ListActiveDepartmentsForDropdown() ([]models.Department, error) {
	var departments []models.Department
	if err := s.db.Select("department_id, department_name").Where("status = ?", "active").Order("department_name asc").Find(&departments).Error; err != nil {
		log.Printf("[Service ListActiveDepartmentsForDropdown] Error: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar departemen aktif: %w", err)
	}
	return departments, nil
}

func (s *service) ListDepartmentsWithEmployeeCount() ([]models.Department, error) {
	var departments []models.Department
	// Ambil semua departemen, tidak peduli statusnya untuk halaman list utama
	if err := s.db.Order("department_name asc").Find(&departments).Error; err != nil {
		log.Printf("[Service ListDepartmentsWithEmployeeCount] Error mengambil departemen: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar departemen: %w", err)
	}

	// Untuk setiap departemen, hitung jumlah employee
	for i := range departments {
		var count int64
		// Employee.Department menyimpan DepartmentID
		if err := s.db.Model(&models.Employee{}).Where("department = ?", departments[i].DepartmentID).Count(&count).Error; err != nil {
			log.Printf("[Service ListDepartmentsWithEmployeeCount] Error menghitung employee untuk department %s: %v\n", departments[i].DepartmentID, err)
			// Lanjutkan saja, count akan 0 jika error
		}
		departments[i].EmployeeCount = count
	}
	return departments, nil
}

func (s *service) DeleteDepartment(departmentID string) error {
	log.Printf("[Service DeleteDepartment] Memulai proses delete untuk Department ID: %s\n", departmentID)

	// Opsional: Cek apakah departemen ini digunakan oleh employee
	var employeeCount int64
	if err := s.db.Model(&models.Employee{}).Where("department = ?", departmentID).Count(&employeeCount).Error; err != nil {
		log.Printf("[Service DeleteDepartment] Error saat cek employee terkait: %v\n", err)
		return fmt.Errorf("gagal memeriksa keterkaitan employee: %w", err)
	}

	if employeeCount > 0 {
		log.Printf("[Service DeleteDepartment] Departemen %s masih memiliki %d karyawan.\n", departmentID, employeeCount)
		return fmt.Errorf("departemen tidak dapat dihapus karena masih memiliki %d karyawan terkait. Harap pindahkan atau hapus karyawan terlebih dahulu", employeeCount)
	}

	// Jika tidak ada employee terkait, lanjutkan hapus
	result := s.db.Where("department_id = ?", departmentID).Delete(&models.Department{})
	if result.Error != nil {
		log.Printf("[Service DeleteDepartment] Error menghapus departemen %s: %v\n", departmentID, result.Error)
		return fmt.Errorf("gagal menghapus departemen: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		log.Printf("[Service DeleteDepartment] Departemen %s tidak ditemukan untuk dihapus.\n", departmentID)
		return errors.New("departemen tidak ditemukan")
	}

	log.Printf("[Service DeleteDepartment] Berhasil menghapus departemen dengan ID: %s\n", departmentID)
	return nil
}

func (s *service) UpdateDepartment(departmentID string, input UpdateDepartmentInput) (models.Department, error) {
	log.Printf("[Service UpdateDepartment] Memulai update untuk Department ID: %s, dengan data: %+v\n", departmentID, input)

	var departmentToUpdate models.Department

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil departemen yang akan diupdate
		if err := tx.Where("department_id = ?", departmentID).First(&departmentToUpdate).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("[Service UpdateDepartment] Department dengan ID %s tidak ditemukan.\n", departmentID)
				return errors.New("departemen tidak ditemukan")
			}
			log.Printf("[Service UpdateDepartment] Error mengambil departemen: %v\n", err)
			return fmt.Errorf("gagal mengambil data departemen untuk update: %w", err)
		}

		// 2. Opsional: Cek jika nama departemen baru (jika diubah) sudah digunakan oleh departemen lain
		if departmentToUpdate.DepartmentName != input.DepartmentName {
			var existingDeptWithNewName models.Department
			if errCheckName := tx.Where("department_name = ? AND department_id != ?", input.DepartmentName, departmentID).First(&existingDeptWithNewName).Error; errCheckName == nil {
				// Jika errCheckName == nil, berarti nama baru sudah dipakai departemen lain
				log.Printf("[Service UpdateDepartment] Nama departemen baru '%s' sudah digunakan oleh departemen lain (ID: %s).\n", input.DepartmentName, existingDeptWithNewName.DepartmentID)
				return errors.New("nama departemen sudah digunakan oleh departemen lain")
			} else if !errors.Is(errCheckName, gorm.ErrRecordNotFound) {
				// Error lain saat query cek nama
				log.Printf("[Service UpdateDepartment] Error saat cek duplikasi nama departemen baru: %v\n", errCheckName)
				return fmt.Errorf("gagal memeriksa duplikasi nama departemen: %w", errCheckName)
			}
		}

		// 3. Update field-field departemen
		departmentToUpdate.DepartmentName = input.DepartmentName
		departmentToUpdate.Description = input.Description
		departmentToUpdate.Status = input.Status
		// UpdatedAt akan dihandle otomatis oleh GORM

		// 4. Simpan perubahan
		if err := tx.Save(&departmentToUpdate).Error; err != nil {
			log.Printf("[Service UpdateDepartment] Error menyimpan perubahan departemen: %v\n", err)
			return fmt.Errorf("gagal menyimpan perubahan departemen: %w", err)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		log.Printf("[Service UpdateDepartment] Transaksi gagal untuk Department ID %s: %v\n", departmentID, err)
		return models.Department{}, err // Kembalikan error dari transaksi
	}

	log.Printf("[Service UpdateDepartment] Berhasil mengupdate data untuk Department ID: %s\n", departmentID)
	return departmentToUpdate, nil // Kembalikan departemen yang sudah diupdate
}

func (s *service) GetDepartmentByID(departmentID string) (models.Department, error) {
	var department models.Department
	// Untuk halaman edit, kita mungkin tidak perlu employee count, jadi query sederhana sudah cukup.
	if err := s.db.Where("department_id = ?", departmentID).First(&department).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service GetDepartmentByID] Department dengan ID %s tidak ditemukan.\n", departmentID)
			return models.Department{}, errors.New("departemen tidak ditemukan")
		}
		log.Printf("[Service GetDepartmentByID] Error mengambil departemen ID %s: %v\n", departmentID, err)
		return models.Department{}, fmt.Errorf("gagal mengambil detail departemen: %w", err)
	}
	// Tidak perlu menghitung employee di sini, kecuali jika halaman edit membutuhkannya
	return department, nil
}

func (s *service) AddProductCategory(input AddProductCategoryInput) (models.ProductCategory, error) {
	log.Printf("[Service AddProductCategory] Memulai proses untuk kategori: %s\n", input.CategoryName)

	// 1. Cek apakah nama kategori sudah ada
	var existingCategory models.ProductCategory
	if err := s.db.Where("category_name = ?", input.CategoryName).First(&existingCategory).Error; err == nil {
		log.Printf("[Service AddProductCategory] Nama kategori '%s' sudah ada.\n", input.CategoryName)
		return models.ProductCategory{}, errors.New("nama kategori produk sudah ada")
	} else if err != gorm.ErrRecordNotFound {
		log.Printf("[Service AddProductCategory] Error saat cek nama kategori existing: %v\n", err)
		return models.ProductCategory{}, fmt.Errorf("gagal memeriksa nama kategori produk: %w", err)
	}

	// 2. Generate Category ID urut
	var nextVal int
	if err := s.db.Raw("SELECT nextval('product_category_id_seq')").Scan(&nextVal).Error; err != nil {
		return models.ProductCategory{}, fmt.Errorf("gagal mendapatkan product category id berikutnya: %w", err)
	}
	// Format ID: "CAT" + 4 digit angka (misal: CAT0001)
	newCategoryID := fmt.Sprintf("CAT%04d", nextVal)

	// 3. Buat instance ProductCategory
	category := models.ProductCategory{
		CategoryID:   newCategoryID,
		CategoryName: input.CategoryName,
		Description:  input.Description,
		Status:       input.Status,
		// CreatedAt dan UpdatedAt akan dihandle GORM
	}

	// 4. Simpan ke database
	if err := s.db.Create(&category).Error; err != nil {
		log.Printf("[Service AddProductCategory] Error saat menyimpan kategori produk baru: %v\n", err)
		return models.ProductCategory{}, fmt.Errorf("gagal menyimpan kategori produk: %w", err)
	}

	log.Printf("[Service AddProductCategory] Kategori produk '%s' (ID: %s) berhasil disimpan.\n", category.CategoryName, category.CategoryID)
	return category, nil
}

func (s *service) ListProductCategories() ([]models.ProductCategory, error) {
	var categories []models.ProductCategory
	// 1. Ambil semua kategori produk
	if err := s.db.Order("category_name asc").Find(&categories).Error; err != nil {
		log.Printf("[Service ListProductCategories] Error mengambil daftar kategori: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar kategori produk: %w", err)
	}

	if len(categories) == 0 {
		log.Println("[Service ListProductCategories] Tidak ada kategori produk ditemukan.")
		return []models.ProductCategory{}, nil // Kembalikan array kosong jika tidak ada kategori
	}

	// 2. Siapkan untuk menghitung produk per kategori
	// Buat map untuk menyimpan hasil hitungan: map[CategoryID]count
	categoryCounts := make(map[string]int64)

	// Definisikan struct untuk menampung hasil query agregasi
	type ProductCategoryCountResult struct {
		ProductCategoryID string // Harus cocok dengan nama kolom di `products` setelah AS (atau nama field jika GORM pintar)
		Count             int64
	}
	var counts []ProductCategoryCountResult

	// Lakukan query agregasi ke tabel products.
	// Kolom di tabel 'products' yang menyimpan ID kategori adalah 'product_category'
	// berdasarkan model Product Anda: ProductCategoryID string `gorm:"column:product_category;..."`
	if err := s.db.Model(&models.Product{}).
		Select("product_category as product_category_id, count(*) as count"). // Gunakan "product_category" sesuai nama kolom di DB
		Group("product_category").                                            // Group berdasarkan kolom FK di tabel products
		Scan(&counts).Error; err != nil {
		log.Printf("[Service ListProductCategories] Error menghitung produk per kategori: %v\n", err)
		// Kita bisa memilih untuk melanjutkan tanpa product count jika query ini gagal,
		// atau mengembalikan error. Untuk saat ini, kita log dan lanjutkan (count akan 0).
	} else {
		for _, c := range counts {
			categoryCounts[c.ProductCategoryID] = c.Count
		}
	}

	// 3. Isi field ProductsCount untuk setiap kategori
	for i := range categories {
		if count, ok := categoryCounts[categories[i].CategoryID]; ok {
			categories[i].ProductsCount = count
		} else {
			categories[i].ProductsCount = 0 // Default ke 0 jika tidak ada produk atau tidak ada di map
		}
	}

	log.Printf("[Service ListProductCategories] Berhasil mengambil %d kategori produk dengan jumlah produk.\n", len(categories))
	return categories, nil
}

func (s *service) GetProductCategoryByID(categoryID string) (models.ProductCategory, error) {
	var category models.ProductCategory
	if err := s.db.Where("category_id = ?", categoryID).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service GetProductCategoryByID] Kategori produk dengan ID %s tidak ditemukan.\n", categoryID)
			return models.ProductCategory{}, errors.New("kategori produk tidak ditemukan")
		}
		log.Printf("[Service GetProductCategoryByID] Error mengambil kategori produk ID %s: %v\n", categoryID, err)
		return models.ProductCategory{}, fmt.Errorf("gagal mengambil detail kategori produk: %w", err)
	}
	// Untuk halaman edit, kita tidak perlu ProductCount secara eksplisit di sini
	return category, nil
}

func (s *service) UpdateProductCategory(categoryID string, input UpdateProductCategoryInput) (models.ProductCategory, error) {
	log.Printf("[Service UpdateProductCategory] Memulai update untuk Category ID: %s, dengan data: %+v\n", categoryID, input)

	var categoryToUpdate models.ProductCategory

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Ambil kategori yang akan diupdate
		if err := tx.Where("category_id = ?", categoryID).First(&categoryToUpdate).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("[Service UpdateProductCategory] Kategori produk dengan ID %s tidak ditemukan.\n", categoryID)
				return errors.New("kategori produk tidak ditemukan")
			}
			log.Printf("[Service UpdateProductCategory] Error mengambil kategori produk: %v\n", err)
			return fmt.Errorf("gagal mengambil data kategori produk untuk update: %w", err)
		}

		// 2. Cek jika nama kategori baru (jika diubah) sudah digunakan oleh kategori lain
		if categoryToUpdate.CategoryName != input.CategoryName {
			var existingCategoryWithNewName models.ProductCategory
			if errCheckName := tx.Where("category_name = ? AND category_id != ?", input.CategoryName, categoryID).First(&existingCategoryWithNewName).Error; errCheckName == nil {
				log.Printf("[Service UpdateProductCategory] Nama kategori baru '%s' sudah digunakan.\n", input.CategoryName)
				return errors.New("nama kategori produk sudah digunakan")
			} else if !errors.Is(errCheckName, gorm.ErrRecordNotFound) {
				log.Printf("[Service UpdateProductCategory] Error saat cek duplikasi nama kategori baru: %v\n", errCheckName)
				return fmt.Errorf("gagal memeriksa duplikasi nama kategori produk: %w", errCheckName)
			}
		}

		// 3. Update field-field kategori
		categoryToUpdate.CategoryName = input.CategoryName
		categoryToUpdate.Description = input.Description
		categoryToUpdate.Status = input.Status
		// UpdatedAt akan dihandle otomatis oleh GORM

		// 4. Simpan perubahan
		if err := tx.Save(&categoryToUpdate).Error; err != nil {
			log.Printf("[Service UpdateProductCategory] Error menyimpan perubahan kategori produk: %v\n", err)
			return fmt.Errorf("gagal menyimpan perubahan kategori produk: %w", err)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		log.Printf("[Service UpdateProductCategory] Transaksi gagal untuk Category ID %s: %v\n", categoryID, err)
		return models.ProductCategory{}, err
	}

	log.Printf("[Service UpdateProductCategory] Berhasil mengupdate data untuk Category ID: %s\n", categoryID)
	return categoryToUpdate, nil // Kembalikan kategori yang sudah diupdate
}

func (s *service) DeleteProductCategory(categoryID string) error {
	log.Printf("[Service DeleteProductCategory] Memulai proses delete untuk Category ID: %s\n", categoryID)

	// Mulai transaksi database
	err := s.db.Transaction(func(tx *gorm.DB) error {

		// 2. Hapus kategori produk
		result := tx.Where("category_id = ?", categoryID).Delete(&models.ProductCategory{})
		if result.Error != nil {
			log.Printf("[Service DeleteProductCategory] Error menghapus kategori produk %s: %v\n", categoryID, result.Error)
			return fmt.Errorf("gagal menghapus kategori produk: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			log.Printf("[Service DeleteProductCategory] Kategori produk %s tidak ditemukan untuk dihapus.\n", categoryID)
			return errors.New("kategori produk tidak ditemukan") // atau gorm.ErrRecordNotFound jika Anda cek dulu
		}

		return nil // Commit transaksi
	})

	if err != nil {
		log.Printf("[Service DeleteProductCategory] Transaksi gagal untuk Category ID %s: %v\n", categoryID, err)
		return err
	}

	log.Printf("[Service DeleteProductCategory] Berhasil menghapus kategori produk dengan ID: %s\n", categoryID)
	return nil
}

func (s *service) AddProduct(input AddProductInput, imagePaths []string) (models.Product, error) {
	log.Printf("[Service AddProduct] Input diterima: %+v, Jumlah Gambar: %d\n", input, len(imagePaths))

	var parsedProductionDate *time.Time
	if input.ProductionDate != "" {
		t, err := time.Parse(employeeDateFormat, input.ProductionDate)
		if err != nil {
			return models.Product{}, fmt.Errorf("format tanggal produksi tidak valid (gunakan %s): %w", employeeDateFormat, err)
		}
		parsedProductionDate = &t
	}

	// 1. Validasi ProductCategoryID
	var category models.ProductCategory
	if err := s.db.Where("category_id = ?", input.ProductCategoryID).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Product{}, errors.New("kategori produk tidak ditemukan")
		}
		return models.Product{}, fmt.Errorf("gagal memvalidasi kategori produk: %w", err)
	}

	// 2. Generate Product SKU unik
	var nextVal int
	if err := s.db.Raw("SELECT nextval('product_sku_seq')").Scan(&nextVal).Error; err != nil {
		return models.Product{}, fmt.Errorf("gagal mendapatkan product sku berikutnya: %w", err)
	}
	// Format SKU: "SKU" + 8 digit angka (misal: SKU00000001)
	// Total 11 karakter, cocok untuk VARCHAR(13) di model
	newProductSKU := fmt.Sprintf("SKU%08d", nextVal)

	// 3. Buat instance Product dengan CapitalPrice
	product := models.Product{
		ProductSKU:        newProductSKU,
		Title:             input.Title,
		Brand:             input.Brand,
		ProductCategoryID: input.ProductCategoryID,
		PowerSource:       input.PowerSource,
		WarrantyPeriod:    input.WarrantyPeriod,
		ProductionDate:    parsedProductionDate,
		Descriptions:      input.Descriptions,
		Stock:             input.Stock,
		Status:            input.Status,
		CapitalPrice:      input.CapitalPrice, // <<< TAMBAHKAN CapitalPrice DARI INPUT
		RegularPrice:      input.RegularPrice,
		// Images akan di-create terpisah dan direlasikan
	}

	var finalCreatedProduct models.Product

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 4. Simpan data produk utama
		if err := tx.Create(&product).Error; err != nil {
			return fmt.Errorf("gagal menyimpan data produk: %w", err)
		}

		// 5. Simpan gambar produk (jika ada)
		if len(imagePaths) > 0 {
			var productImages []models.ProductImage
			for _, imgPath := range imagePaths {
				productImages = append(productImages, models.ProductImage{
					ProductSKU: newProductSKU, // Relasikan dengan SKU produk yang baru dibuat
					Image:      imgPath,       // Path gambar yang sudah disimpan oleh handler
				})
			}
			if err := tx.Create(&productImages).Error; err != nil {
				return fmt.Errorf("gagal menyimpan gambar produk: %w", err)
			}
		}

		// 6. Ambil kembali produk yang baru dibuat dengan preloading Images dan ProductCategory
		if err := tx.Preload("Images").Preload("ProductCategory").First(&finalCreatedProduct, "product_sku = ?", newProductSKU).Error; err != nil {
			return fmt.Errorf("gagal mengambil data produk lengkap setelah create: %w", err)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		// Logika untuk menghapus file yang sudah terupload jika transaksi gagal bisa ditambahkan di sini jika diperlukan
		log.Printf("[Service AddProduct] Transaksi gagal: %v\n", err)
		return models.Product{}, err
	}

	log.Printf("[Service AddProduct] Produk '%s' (SKU: %s) berhasil disimpan.\n", finalCreatedProduct.Title, finalCreatedProduct.ProductSKU)
	return finalCreatedProduct, nil
}

func (s *service) ListActiveProductCategories() ([]models.ProductCategory, error) {
	var categories []models.ProductCategory
	if err := s.db.Select("category_id, category_name").Where("status = ?", "published").Order("category_name asc").Find(&categories).Error; err != nil {
		log.Printf("[Service ListActiveProductCategories] Error: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar kategori produk aktif: %w", err)
	}
	log.Printf("[Service ListActiveProductCategories] Berhasil mengambil %d kategori produk aktif.\n", len(categories))
	return categories, nil
}

func (s *service) ListProducts() ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Preload("Images").Preload("ProductCategory").Order("created_at desc").Find(&products).Error; err != nil {
		log.Printf("[Service ListProducts] Error: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar produk: %w", err)
	}
	return products, nil
}

func (s *service) GetProductBySKU(productSKU string) (models.Product, error) {
	var product models.Product
	if err := s.db.Preload("Images").Preload("ProductCategory").Where("product_sku = ?", productSKU).First(&product).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Product{}, errors.New("produk tidak ditemukan")
		}
		return models.Product{}, fmt.Errorf("gagal mengambil detail produk: %w", err)
	}
	return product, nil
}

func (s *service) UpdateProduct(productSKU string, input AddProductInput, newImagePaths []string) (models.Product, error) {
	log.Printf("[Service UpdateProduct] Input diterima untuk SKU %s: %+v, Jumlah Gambar Baru: %d\n", productSKU, input, len(newImagePaths))

	var parsedProductionDate *time.Time
	if input.ProductionDate != "" {
		t, err := time.Parse(employeeDateFormat, input.ProductionDate)
		if err != nil {
			return models.Product{}, fmt.Errorf("format tanggal produksi tidak valid (gunakan %s): %w", employeeDateFormat, err)
		}
		parsedProductionDate = &t
	}

	// Validasi ProductCategoryID jika diubah atau diisi
	if input.ProductCategoryID != "" {
		var category models.ProductCategory
		if err := s.db.Where("category_id = ?", input.ProductCategoryID).First(&category).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return models.Product{}, errors.New("kategori produk yang dipilih tidak valid")
			}
			return models.Product{}, fmt.Errorf("gagal memvalidasi kategori produk: %w", err)
		}
	}

	var finalUpdatedProduct models.Product
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var productToUpdate models.Product
		// Ambil produk yang ada, termasuk preload Images untuk mengetahui gambar lama
		if err := tx.Preload("Images").Where("product_sku = ?", productSKU).First(&productToUpdate).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("produk tidak ditemukan untuk diupdate")
			}
			return fmt.Errorf("gagal mengambil produk untuk diupdate: %w", err)
		}

		// Simpan path gambar lama untuk potensi penghapusan file fisik
		var oldImageFilePathsOnDisk []string
		for _, oldImg := range productToUpdate.Images {
			if oldImg.Image != "" { // Pastikan path tidak kosong
				oldImageFilePathsOnDisk = append(oldImageFilePathsOnDisk, filepath.Join(".", oldImg.Image))
			}
		}

		// Update fields pada productToUpdate
		productToUpdate.Title = input.Title
		productToUpdate.Brand = input.Brand
		productToUpdate.ProductCategoryID = input.ProductCategoryID
		productToUpdate.PowerSource = input.PowerSource
		productToUpdate.WarrantyPeriod = input.WarrantyPeriod
		productToUpdate.ProductionDate = parsedProductionDate
		productToUpdate.Descriptions = input.Descriptions
		productToUpdate.Stock = input.Stock
		productToUpdate.Status = input.Status
		productToUpdate.CapitalPrice = input.CapitalPrice
		productToUpdate.RegularPrice = input.RegularPrice

		if len(newImagePaths) > 0 {
			// 1. Hapus file gambar lama dari server
			for _, fullOldPath := range oldImageFilePathsOnDisk {
				if err := os.Remove(fullOldPath); err != nil {
					// Jangan gagalkan transaksi utama, cukup log error
					log.Printf("[Service UpdateProduct] Peringatan: Gagal menghapus file gambar lama %s: %v\n", fullOldPath, err)
				} else {
					log.Printf("[Service UpdateProduct] Berhasil menghapus file gambar lama: %s\n", fullOldPath)
				}
			}
			// 2. Hapus record gambar lama dari DB untuk produk ini
			if err := tx.Where("product_sku = ?", productSKU).Delete(&models.ProductImage{}).Error; err != nil {
				// Jika tidak ada gambar lama, ini tidak error, jadi tidak perlu cek gorm.ErrRecordNotFound
				log.Printf("[Service UpdateProduct] Info/Error saat menghapus record gambar lama dari DB: %v\n", err)
				// return fmt.Errorf("gagal menghapus gambar lama dari db: %w", err) // Mungkin tidak perlu menggagalkan jika hanya tidak ada record
			}
			// 3. Tambahkan record gambar baru
			var newProductImagesToCreate []models.ProductImage
			for _, imgPath := range newImagePaths {
				newProductImagesToCreate = append(newProductImagesToCreate, models.ProductImage{ProductSKU: productSKU, Image: imgPath})
			}
			if len(newProductImagesToCreate) > 0 {
				if err := tx.Create(&newProductImagesToCreate).Error; err != nil {
					return fmt.Errorf("gagal menyimpan gambar produk baru: %w", err)
				}
			}
		}
		if err := tx.Omit("ProductCategory", "Images").Save(&productToUpdate).Error; err != nil {
			return fmt.Errorf("gagal menyimpan update produk: %w", err)
		}

		if err := tx.Preload("Images").Preload("ProductCategory").First(&finalUpdatedProduct, "product_sku = ?", productSKU).Error; err != nil {
			return fmt.Errorf("gagal mengambil data produk lengkap setelah update: %w", err)
		}
		return nil // Commit transaksi
	})

	if err != nil {
		return models.Product{}, err
	}
	return finalUpdatedProduct, nil
}

func (s *service) DeleteProduct(productSKU string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var product models.Product
		// Ambil data produk untuk mendapatkan path gambar yang akan dihapus
		if err := tx.Preload("Images").Where("product_sku = ?", productSKU).First(&product).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("produk tidak ditemukan")
			}
			return fmt.Errorf("gagal mengambil produk untuk dihapus: %w", err)
		}

		// Hapus file gambar dari server
		for _, img := range product.Images {
			fullPath := filepath.Join(".", img.Image)
			if err := os.Remove(fullPath); err != nil {
				log.Printf("[Service DeleteProduct] Peringatan: Gagal menghapus file gambar %s: %v\n", fullPath, err)
			}
		}

		if err := tx.Where("product_sku = ?", productSKU).Delete(&models.ProductImage{}).Error; err != nil {
			// Jangan error jika record tidak ada, mungkin sudah terhapus oleh cascade atau tidak ada gambar
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("gagal menghapus gambar produk terkait: %w", err)
			}
		}

		// Hapus produk utama
		if err := tx.Where("product_sku = ?", productSKU).Delete(&models.Product{}).Error; err != nil {
			return fmt.Errorf("gagal menghapus produk: %w", err)
		}
		return nil
	})
}

func (s *service) ListAllOrders(statusFilter string) ([]AdminOrderListView, error) {
	var ordersFromDB []models.Order
	log.Printf("[Service ListAllOrders] Mengambil data pesanan dengan filter status: '%s'\n", statusFilter)

	// Mulai query, belum dieksekusi
	query := s.db.Preload("OrderItems").Order("order_date_time DESC")

	// Terapkan filter status JIKA parameter statusFilter tidak kosong
	if statusFilter != "" {
		query = query.Where("order_status = ?", statusFilter)
	}

	// Jalankan query yang sudah difilter (atau tidak)
	if err := query.Find(&ordersFromDB).Error; err != nil {
		log.Printf("[Service ListAllOrders] Error saat mengambil pesanan dari DB: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar pesanan: %w", err)
	}

	// Logika mapping ke DTO tetap sama persis
	orderListView := make([]AdminOrderListView, 0, len(ordersFromDB))
	for _, order := range ordersFromDB {
		var firstImage string
		if len(order.OrderItems) > 0 && order.OrderItems[0].ProductImageSnapshot != "" {
			firstImage = order.OrderItems[0].ProductImageSnapshot
		}

		orderView := AdminOrderListView{
			OrderID:          order.OrderID,
			CustomerFullname: order.CustomerFullname,
			OrderDateTime:    order.OrderDateTime,
			PaymentMethod:    order.PaymentMethod,
			OrderStatus:      order.OrderStatus,
			GrandTotal:       order.GrandTotal,
			FirstItemImage:   firstImage,
		}
		orderListView = append(orderListView, orderView)
	}

	log.Printf("[Service ListAllOrders] Berhasil mengambil %d pesanan.\n", len(orderListView))
	return orderListView, nil
}

func (s *service) GetOrderDetailForAdmin(orderID string) (AdminOrderDetailView, error) {
	var orderFromDB models.Order
	var orderDetailView AdminOrderDetailView

	// Preload semua relasi yang dibutuhkan untuk halaman detail
	if err := s.db.
		Preload("OrderItems").
		Where("order_id = ?", orderID).
		First(&orderFromDB).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return orderDetailView, errors.New("pesanan tidak ditemukan")
		}
		return orderDetailView, fmt.Errorf("gagal mengambil detail pesanan: %w", err)
	}

	// Mapping ke DTO utama
	orderDetailView = AdminOrderDetailView{
		OrderID:                 orderFromDB.OrderID,
		OrderDateTime:           orderFromDB.OrderDateTime,
		OrderStatus:             orderFromDB.OrderStatus,
		PaymentMethod:           orderFromDB.PaymentMethod,
		ProofOfPayment:          orderFromDB.ProofOfPayment,
		Notes:                   orderFromDB.Notes,
		CustomerID:              orderFromDB.CustomerID,
		CustomerFullname:        orderFromDB.CustomerFullname,
		CustomerEmail:           orderFromDB.CustomerEmail,
		CustomerPhone:           orderFromDB.CustomerPhone,
		ShippingAddressSnapshot: orderFromDB.ShippingAddressSnapshot,
		Subtotal:                orderFromDB.GrandTotal, // Asumsi subtotal = grandtotal jika ongkir 0
		ShippingCost:            0,
		GrandTotal:              orderFromDB.GrandTotal,
		Items:                   []AdminOrderDetailItemView{},
	}

	// Mapping item-itemnya
	for _, item := range orderFromDB.OrderItems {
		orderDetailView.Items = append(orderDetailView.Items, AdminOrderDetailItemView{
			ProductSKU:           item.ProductSKU,
			ProductImageSnapshot: item.ProductImageSnapshot,
			ProductTitleSnapshot: item.ProductTitleSnapshot,
			PriceAtOrder:         item.PriceAtOrder,
			Quantity:             item.Quantity,
			SubTotal:             item.SubTotal,
		})
	}

	return orderDetailView, nil
}

func (s *service) UpdateOrderStatus(orderID string, input AdminUpdateOrderStatusInput) (models.Order, error) {
	var order models.Order

	// Cari order berdasarkan ID
	if err := s.db.Where("order_id = ?", orderID).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Order{}, errors.New("pesanan tidak ditemukan")
		}
		return models.Order{}, fmt.Errorf("gagal mencari pesanan: %w", err)
	}

	// Update statusnya
	order.OrderStatus = input.OrderStatus

	// Simpan perubahan
	if err := s.db.Save(&order).Error; err != nil {
		return models.Order{}, fmt.Errorf("gagal mengupdate status pesanan: %w", err)
	}

	return order, nil
}

func (s *service) DeleteOrder(orderID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var order models.Order
		// Ambil data order untuk mendapatkan path bukti pembayaran sebelum menghapus
		if err := tx.Where("order_id = ?", orderID).First(&order).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("pesanan tidak ditemukan")
			}
			return fmt.Errorf("gagal mencari pesanan untuk dihapus: %w", err)
		}

		// Hapus file bukti pembayaran dari server jika ada
		if order.ProofOfPayment != "" {
			fullPath := filepath.Join(".", order.ProofOfPayment)
			if err := os.Remove(fullPath); err != nil {
				// Jangan gagalkan transaksi jika file tidak ada, cukup log
				log.Printf("[Service DeleteOrder] Peringatan: Gagal menghapus file bukti pembayaran %s: %v\n", fullPath, err)
			} else {
				log.Printf("[Service DeleteOrder] Berhasil menghapus file bukti pembayaran: %s\n", fullPath)
			}
		}

		result := tx.Where("order_id = ?", orderID).Delete(&models.Order{})
		if result.Error != nil {
			return fmt.Errorf("gagal menghapus pesanan: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return errors.New("pesanan tidak ditemukan saat mencoba menghapus")
		}
		return nil
	})
}

func (s *service) ListOrderedCustomers() ([]AdminCustomerListView, error) {
	var results []AdminCustomerListView

	err := s.db.Table("customers c").
		Select("c.customer_id, d.first_name || ' ' || d.last_name as full_name, c.email, c.phone, SUM(o.grand_total) as total_spent, MAX(o.order_date_time) as last_purchase").
		Joins("JOIN customer_details d ON c.customer_id = d.customer_id").
		Joins("JOIN orders o ON c.customer_id = o.customer_id").
		Group("c.customer_id, d.first_name, d.last_name, c.email, c.phone").
		Order("last_purchase DESC").
		Scan(&results).Error

	if err != nil {
		log.Printf("[Service ListOrderedCustomers] Error: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar customer: %w", err)
	}
	return results, nil
}

func (s *service) GetCustomerDetailForAdmin(customerID string) (AdminCustomerDetailView, error) {
	var customer models.Customer
	var customerDetailView AdminCustomerDetailView

	// Preload semua relasi yang dibutuhkan
	if err := s.db.
		Preload("Detail").
		Preload("Addresses").
		Preload("Orders.OrderItems"). // Preload order, dan di dalam order, preload item-itemnya
		Where("customer_id = ?", customerID).
		First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return customerDetailView, errors.New("customer tidak ditemukan")
		}
		return customerDetailView, fmt.Errorf("gagal mengambil detail customer: %w", err)
	}

	// Mapping ke DTO utama
	customerDetailView.CustomerID = customer.CustomerID
	customerDetailView.FullName = customer.Detail.FirstName + " " + customer.Detail.LastName
	customerDetailView.Email = customer.Email
	customerDetailView.Phone = customer.Phone
	customerDetailView.Birthday = customer.Detail.Birthday
	customerDetailView.JoinDate = customer.Detail.JoinDate
	customerDetailView.Addresses = customer.Addresses
	customerDetailView.TotalOrders = len(customer.Orders)

	// Hitung TotalSpent dan map riwayat order
	var totalSpent float64 = 0
	orderHistory := make([]AdminCustomerOrderHistory, 0, len(customer.Orders))
	for _, order := range customer.Orders {
		totalSpent += order.GrandTotal

		orderItemsView := make([]AdminCustomerOrderItemHistory, 0, len(order.OrderItems))
		for _, item := range order.OrderItems {
			orderItemsView = append(orderItemsView, AdminCustomerOrderItemHistory{
				ProductSKU:           item.ProductSKU,
				ProductImageSnapshot: item.ProductImageSnapshot,
				ProductTitleSnapshot: item.ProductTitleSnapshot,
				PriceAtOrder:         item.PriceAtOrder,
				Quantity:             item.Quantity,
				SubTotal:             item.SubTotal,
			})
		}

		orderHistory = append(orderHistory, AdminCustomerOrderHistory{
			OrderID:       order.OrderID,
			OrderDateTime: order.OrderDateTime,
			GrandTotal:    order.GrandTotal,
			OrderItems:    orderItemsView,
		})
	}
	customerDetailView.TotalSpent = totalSpent
	customerDetailView.OrderHistory = orderHistory

	return customerDetailView, nil
}

func (s *service) DeleteCustomer(customerID string) error {

	log.Printf("[Service DeleteCustomer] Menghapus customer dengan ID: %s\n", customerID)
	result := s.db.Where("customer_id = ?", customerID).Delete(&models.Customer{})

	if result.Error != nil {
		return fmt.Errorf("gagal menghapus customer: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("customer tidak ditemukan untuk dihapus")
	}

	return nil
}

func (s *service) AddNewsCategory(input UpsertNewsCategoryInput) (models.NewsCategory, error) {
	var nextVal int
	if err := s.db.Raw("SELECT nextval('news_category_id_seq')").Scan(&nextVal).Error; err != nil {
		return models.NewsCategory{}, fmt.Errorf("gagal mendapatkan ID kategori berita: %w", err)
	}
	newCategoryID := fmt.Sprintf("CAT%05d", nextVal)

	category := models.NewsCategory{
		CategoryID:   newCategoryID,
		CategoryName: input.CategoryName,
		Description:  input.Description,
		Status:       input.Status,
	}

	if err := s.db.Create(&category).Error; err != nil {
		return models.NewsCategory{}, fmt.Errorf("gagal menyimpan kategori berita: %w", err)
	}
	return category, nil
}

func (s *service) ListNewsCategories() ([]models.NewsCategory, error) {
	var categories []models.NewsCategory

	// 1. Ambil semua kategori berita dari database
	if err := s.db.Order("created_at DESC").Find(&categories).Error; err != nil {
		log.Printf("[Service ListNewsCategories] Error mengambil daftar kategori: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar kategori berita: %w", err)
	}

	if len(categories) == 0 {
		return categories, nil
	}

	type CategoryPostCount struct {
		CategoryID string
		Count      int64
	}
	var counts []CategoryPostCount

	// Query ke tabel news_posts, group berdasarkan category_id, dan hitung
	if err := s.db.Model(&models.NewsPost{}).
		Select("category_id, count(*) as count").
		Group("category_id").
		Scan(&counts).Error; err != nil {
		log.Printf("[Service ListNewsCategories] Error menghitung jumlah berita per kategori: %v\n", err)
		return nil, fmt.Errorf("gagal menghitung jumlah berita: %w", err)
	}

	// 3. Buat map untuk akses cepat ke hasil hitungan (map[categoryID] -> count)
	countsMap := make(map[string]int64)
	for _, countResult := range counts {
		countsMap[countResult.CategoryID] = countResult.Count
	}

	// 4. Gabungkan data hitungan ke hasil kategori utama
	for i := range categories {
		// Ambil hitungan dari map. Jika tidak ada, nilainya akan 0 (default untuk int64)
		categories[i].NewsPostCount = countsMap[categories[i].CategoryID]
	}

	log.Printf("[Service ListNewsCategories] Berhasil mengambil %d kategori beserta jumlah beritanya.\n", len(categories))
	return categories, nil
}

func (s *service) GetNewsCategoryByID(categoryID string) (models.NewsCategory, error) {
	var category models.NewsCategory
	if err := s.db.Where("category_id = ?", categoryID).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.NewsCategory{}, errors.New("kategori berita tidak ditemukan")
		}
		return models.NewsCategory{}, fmt.Errorf("gagal mengambil kategori berita: %w", err)
	}
	return category, nil
}

func (s *service) UpdateNewsCategory(categoryID string, input UpsertNewsCategoryInput) (models.NewsCategory, error) {
	category, err := s.GetNewsCategoryByID(categoryID)
	if err != nil {
		return models.NewsCategory{}, err // Mengembalikan error "tidak ditemukan" dari GetByID
	}

	category.CategoryName = input.CategoryName
	category.Description = input.Description
	category.Status = input.Status

	if err := s.db.Save(&category).Error; err != nil {
		return models.NewsCategory{}, fmt.Errorf("gagal mengupdate kategori berita: %w", err)
	}
	return category, nil
}

func (s *service) DeleteNewsCategory(categoryID string) error {

	result := s.db.Where("category_id = ?", categoryID).Delete(&models.NewsCategory{})
	if result.Error != nil {
		return fmt.Errorf("gagal menghapus kategori berita: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("kategori berita tidak ditemukan untuk dihapus")
	}
	return nil
}

func (s *service) AddNewsPost(authorID string, input AddNewsPostInput, imageFileHeader *multipart.FileHeader) (models.NewsPost, error) {
	log.Printf("[Service AddNewsPost] Menambah berita baru oleh Author ID: %s, Judul: %s\n", authorID, input.Title)

	var imagePath string = "" // Default path kosong

	// 1. Validasi apakah kategori yang dipilih ada dan statusnya "Published"
	var category models.NewsCategory
	if err := s.db.Where("category_id = ? AND status = ?", input.CategoryID, "Published").First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.NewsPost{}, errors.New("kategori yang dipilih tidak ditemukan atau tidak aktif")
		}
		return models.NewsPost{}, fmt.Errorf("gagal memvalidasi kategori berita: %w", err)
	}

	// 2. Generate News ID dari sequence
	var nextVal int
	if err := s.db.Raw("SELECT nextval('news_id_seq')").Scan(&nextVal).Error; err != nil {
		return models.NewsPost{}, fmt.Errorf("gagal mendapatkan ID berita: %w", err)
	}
	newNewsID := fmt.Sprintf("NEW%05d", nextVal)

	// 3. Simpan file gambar jika ada
	if imageFileHeader != nil {
		ext := filepath.Ext(imageFileHeader.Filename)
		uniqueFilename := fmt.Sprintf("news_%s_%d%s", newNewsID, time.Now().UnixNano(), ext)
		uploadDir := "./uploads/images/news/"
		if errMkdir := os.MkdirAll(uploadDir, os.ModePerm); errMkdir != nil {
			return models.NewsPost{}, fmt.Errorf("gagal membuat direktori untuk gambar berita: %w", errMkdir)
		}
		savePathOnDisk := filepath.Join(uploadDir, uniqueFilename)

		src, errOpen := imageFileHeader.Open()
		if errOpen != nil {
			return models.NewsPost{}, fmt.Errorf("gagal membuka file gambar: %w", errOpen)
		}
		defer src.Close()

		dst, errCreate := os.Create(savePathOnDisk)
		if errCreate != nil {
			return models.NewsPost{}, fmt.Errorf("gagal membuat file tujuan: %w", errCreate)
		}
		defer dst.Close()

		if _, errCopy := io.Copy(dst, src); errCopy != nil {
			return models.NewsPost{}, fmt.Errorf("gagal menyimpan file gambar: %w", errCopy)
		}

		imagePath = strings.TrimPrefix(filepath.ToSlash(savePathOnDisk), "./")
	}

	// 4. Parsing tanggal publikasi
	publicationDate, errParseDate := time.Parse("2006-01-02", input.PublicationDate)
	if errParseDate != nil {
		return models.NewsPost{}, fmt.Errorf("format tanggal publikasi tidak valid (gunakan YYYY-MM-DD): %w", errParseDate)
	}

	// 5. Buat instance NewsPost
	newsPost := models.NewsPost{
		NewsID:          newNewsID,
		Title:           input.Title,
		Image:           imagePath,
		Content:         input.Content,
		CategoryID:      input.CategoryID,
		AuthorID:        authorID, // Diambil dari token JWT admin
		PublicationDate: publicationDate,
		Status:          input.Status,
	}

	// 6. Simpan ke database
	if err := s.db.Create(&newsPost).Error; err != nil {
		// Jika create gagal, hapus file yang mungkin sudah terupload
		if imagePath != "" {
			os.Remove(filepath.Join(".", imagePath))
		}
		return models.NewsPost{}, fmt.Errorf("gagal menyimpan postingan berita: %w", err)
	}

	log.Printf("[Service AddNewsPost] Berita '%s' (ID: %s) berhasil disimpan.\n", newsPost.Title, newsPost.NewsID)
	return newsPost, nil
}

func (s *service) ListActiveNewsCategories() ([]models.NewsCategory, error) {
	var categories []models.NewsCategory

	// Query hanya untuk kategori dengan status "Published"
	if err := s.db.Order("category_name ASC").Where("status = ?", "Published").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("gagal mengambil daftar kategori berita aktif: %w", err)
	}

	// Service ini tidak perlu mengembalikan NewsPostCount, jadi lebih efisien.
	return categories, nil
}

func (s *service) ListNewsPosts() ([]AdminNewsPostListView, error) {
	var newsPosts []models.NewsPost

	// Preload Author dan NewsCategory untuk mendapatkan nama
	if err := s.db.
		Preload("Author").
		Preload("NewsCategory").
		Order("publication_date DESC, created_at DESC").
		Find(&newsPosts).Error; err != nil {
		return nil, fmt.Errorf("gagal mengambil daftar berita: %w", err)
	}

	// Mapping ke DTO
	var newsListView []AdminNewsPostListView
	for _, post := range newsPosts {
		newsListView = append(newsListView, AdminNewsPostListView{
			NewsID:          post.NewsID,
			Image:           post.Image,
			Title:           post.Title,
			CategoryName:    post.NewsCategory.CategoryName,
			AuthorName:      post.Author.FullName, // Mengambil nama lengkap dari relasi Author
			PublicationDate: post.PublicationDate,
			Status:          post.Status,
		})
	}
	return newsListView, nil
}

func (s *service) GetNewsPostByID(newsID string) (models.NewsPost, error) {
	var newsPost models.NewsPost
	// Preload juga diperlukan di sini agar halaman edit bisa menampilkan nama author & kategori
	if err := s.db.Preload("Author").Preload("NewsCategory").Where("news_id = ?", newsID).First(&newsPost).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.NewsPost{}, errors.New("postingan berita tidak ditemukan")
		}
		return models.NewsPost{}, fmt.Errorf("gagal mengambil detail berita: %w", err)
	}
	return newsPost, nil
}

func (s *service) UpdateNewsPost(newsID string, input UpdateNewsPostInput, imageFileHeader *multipart.FileHeader) (models.NewsPost, error) {
	// Ambil post yang ada
	post, err := s.GetNewsPostByID(newsID)
	if err != nil {
		return models.NewsPost{}, err // Mengembalikan error "tidak ditemukan"
	}

	oldImagePath := post.Image
	var newImagePath string = oldImagePath

	// Handle upload file baru jika ada
	if imageFileHeader != nil {
		// Logika penyimpanan file (sama seperti di AddNewsPost)
		// ... (buat nama unik, simpan file, dapatkan path baru)
		// newImagePath = "path/ke/gambar/baru.jpg"

		// Setelah file baru berhasil disimpan, hapus file lama jika ada
		if oldImagePath != "" {
			os.Remove(filepath.Join(".", oldImagePath))
		}
	}

	// Parsing tanggal
	publicationDate, errParseDate := time.Parse("2006-01-02", input.PublicationDate)
	if errParseDate != nil {
		return models.NewsPost{}, fmt.Errorf("format tanggal publikasi tidak valid: %w", errParseDate)
	}

	// Update field
	post.Title = input.Title
	post.Content = input.Content
	post.CategoryID = input.CategoryID
	post.PublicationDate = publicationDate
	post.Status = input.Status
	post.Image = newImagePath // Update dengan path gambar baru atau tetap yang lama

	// Simpan perubahan
	if err := s.db.Save(&post).Error; err != nil {
		return models.NewsPost{}, fmt.Errorf("gagal mengupdate postingan berita: %w", err)
	}
	return post, nil
}

func (s *service) DeleteNewsPost(newsID string) error {
	// Ambil data post untuk mendapatkan path gambar
	post, err := s.GetNewsPostByID(newsID)
	if err != nil {
		return err // Mengembalikan error "tidak ditemukan"
	}

	// Hapus record dari database
	// Jika DDL news_posts memiliki ON DELETE CASCADE untuk relasi lain, mereka akan ikut terhapus
	if err := s.db.Delete(&post).Error; err != nil {
		return fmt.Errorf("gagal menghapus postingan berita dari database: %w", err)
	}

	// Hapus file gambar dari server jika ada
	if post.Image != "" {
		if err := os.Remove(filepath.Join(".", post.Image)); err != nil {
			log.Printf("Peringatan: Gagal menghapus file gambar %s: %v\n", post.Image, err)
		}
	}
	return nil
}

func (s *service) GetDashboardStatistics() (DashboardStats, error) {
	var stats DashboardStats
	now := time.Now()
	// Tentukan awal bulan ini untuk query "Earnings"
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	// Daftar status order yang dianggap sebagai penjualan berhasil/pendapatan
	successStatuses := []string{"Success", "Completed", "Shipped"}

	// 1. Get Current Month Earnings
	// Menjumlahkan grand_total dari order yang statusnya berhasil pada bulan ini.
	err := s.db.Model(&models.Order{}).
		Where("created_at >= ? AND order_status IN ?", startOfMonth, successStatuses).
		Select("COALESCE(SUM(grand_total), 0)").
		Row().Scan(&stats.CurrentMonthEarnings)
	if err != nil {
		log.Printf("[Service GetDashboardStatistics] Error menghitung pendapatan bulan ini: %v\n", err)
		return stats, fmt.Errorf("gagal menghitung pendapatan bulan ini: %w", err)
	}

	// 2. Get Total Orders Count (sepanjang waktu)
	if err := s.db.Model(&models.Order{}).Count(&stats.TotalOrdersCount).Error; err != nil {
		log.Printf("[Service GetDashboardStatistics] Error menghitung total order: %v\n", err)
		return stats, fmt.Errorf("gagal menghitung total order: %w", err)
	}

	// 3. Get Total Customers Count (hanya yang pernah order)
	err = s.db.Model(&models.Order{}).Distinct("customer_id").Count(&stats.TotalCustomersCount).Error
	if err != nil {
		log.Printf("[Service GetDashboardStatistics] Error menghitung total customer: %v\n", err)
		return stats, fmt.Errorf("gagal menghitung total customer: %w", err)
	}

	// 4. Get Data untuk Revenue Chart (pendapatan per bulan, 8 bulan terakhir)
	var monthlyRevenue []struct {
		Month  string
		Amount float64
	}
	eightMonthsAgo := now.AddDate(0, -7, 0)
	firstDayOfEightMonthsAgo := time.Date(eightMonthsAgo.Year(), eightMonthsAgo.Month(), 1, 0, 0, 0, 0, now.Location())

	err = s.db.Model(&models.Order{}).
		Select("TO_CHAR(order_date_time, 'YYYY-MM') as month, SUM(grand_total) as amount").
		Where("order_date_time >= ? AND order_status IN ?", firstDayOfEightMonthsAgo, successStatuses).
		Group("month").
		Order("month ASC").
		Scan(&monthlyRevenue).Error
	if err != nil {
		log.Printf("[Service GetDashboardStatistics] Error mengambil data chart pendapatan: %v\n", err)
		return stats, fmt.Errorf("gagal mengambil data chart pendapatan: %w", err)
	}

	revenueMap := make(map[string]float64)
	for i := 0; i < 8; i++ {
		monthKey := now.AddDate(0, -i, 0).Format("2006-01")
		revenueMap[monthKey] = 0
	}
	for _, data := range monthlyRevenue {
		revenueMap[data.Month] = data.Amount
	}

	for i := 7; i >= 0; i-- {
		monthTime := now.AddDate(0, -i, 0)
		monthKey := monthTime.Format("2006-01")
		stats.RevenueChartData.Labels = append(stats.RevenueChartData.Labels, monthTime.Format("Jan"))
		stats.RevenueChartData.Series = append(stats.RevenueChartData.Series, revenueMap[monthKey])
	}

	// 5. Get Total Income (Pendapatan Kotor dari semua order yang sukses)
	err = s.db.Model(&models.Order{}).
		Where("order_status IN ?", successStatuses).
		Select("COALESCE(SUM(grand_total), 0)").
		Row().Scan(&stats.TotalIncome)
	if err != nil {
		log.Printf("[Service GetDashboardStatistics] Error menghitung total pendapatan: %v\n", err)
		return stats, fmt.Errorf("gagal menghitung total pendapatan: %w", err)
	}

	// 6. Get Total Profit (Pendapatan Bersih)
	err = s.db.Model(&models.OrderItem{}).
		Select("COALESCE(SUM(order_items.quantity * (order_items.price_at_order - products.capital_price)), 0)").
		Joins("JOIN orders ON orders.order_id = order_items.order_id").
		Joins("JOIN products ON products.product_sku = order_items.product_sku").
		Where("orders.order_status IN ?", successStatuses).
		Row().Scan(&stats.TotalProfit)
	if err != nil {
		log.Printf("[Service GetDashboardStatistics] Error menghitung total profit: %v\n", err)
		return stats, fmt.Errorf("gagal menghitung total profit: %w", err)
	}

	// 7. Get Order Status Chart (menjumlahkan nilai uang per status)
	var statusValues []struct {
		OrderStatus string
		TotalValue  float64
	}
	err = s.db.Model(&models.Order{}).
		Select("order_status, COALESCE(SUM(grand_total), 0) as total_value").
		Group("order_status").
		Scan(&statusValues).Error
	if err != nil {
		log.Printf("[Service GetDashboardStatistics] Error mengambil data chart status order: %v\n", err)
		return stats, fmt.Errorf("gagal mengambil data chart status order: %w", err)
	}

	for _, data := range statusValues {
		stats.OrderStatusChart.Labels = append(stats.OrderStatusChart.Labels, data.OrderStatus)
		stats.OrderStatusChart.Series = append(stats.OrderStatusChart.Series, data.TotalValue)
	}

	// 8. Get Recent Orders (5 pesanan terbaru)
	recentOrdersDTO, err := s.ListAllOrders("Pending")
	if err != nil {
		// Jangan gagalkan seluruh dashboard jika hanya recent orders yang error
		log.Printf("[Service GetDashboardStatistics] Peringatan: Gagal mengambil pesanan terbaru: %v\n", err)
	} else {
		if len(recentOrdersDTO) > 5 {
			stats.RecentOrders = recentOrdersDTO[:5]
		} else {
			stats.RecentOrders = recentOrdersDTO
		}
	}

	log.Println("[Service GetDashboardStatistics] Berhasil mengambil semua data statistik.")
	return stats, nil
}
