// domain/admin/service.go
package admin

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	employeeDateFormat = "2006-01-02"
)

var adminJwtExpirationTime = 1000 * time.Hour // Anda set ke 1000 jam, pastikan ini yang diinginkan

type AdminJwtCustomClaims struct {
	EmployeeID string `json:"employee_id"`
	Role       string `json:"role"`
	jwt.RegisteredClaims
}

type Service interface {
	RegisterAdmin(input AdminRegisterInput) (EmployeeAccount, error)
	LoginAdmin(input AdminLoginInput) (string, error)
	AddEmployee(input AddEmployeeInput) (Employee, error)
	GetAdminProfile(employeeID string) (Employee, error)
	ListEmployees() ([]Employee, error)
	GetEmployeeByID(employeeID string) (Employee, error)
	DeleteEmployee(employeeID string) error
	UpdateEmployee(employeeID string, input AddEmployeeInput, newImagePath *string) (Employee, error)
	AddDepartment(input AddDepartmentInput) (Department, error)
	ListActiveDepartmentsForDropdown() ([]Department, error)
	ListDepartmentsWithEmployeeCount() ([]Department, error)
	DeleteDepartment(departmentID string) error
	UpdateDepartment(departmentID string, input UpdateDepartmentInput) (Department, error)
	GetDepartmentByID(departmentID string) (Department, error)
	AddProductCategory(input AddProductCategoryInput) (ProductCategory, error)
	ListProductCategories() ([]ProductCategory, error)
	GetProductCategoryByID(categoryID string) (ProductCategory, error)
	UpdateProductCategory(categoryID string, input UpdateProductCategoryInput) (ProductCategory, error)
	DeleteProductCategory(categoryID string) error
	ListActiveProductCategories() ([]ProductCategory, error)
	AddProduct(input AddProductInput, imagePaths []string) (Product, error)
	ListProducts() ([]Product, error)
	GetProductBySKU(productSKU string) (Product, error)
	UpdateProduct(productSKU string, input AddProductInput, newImagePaths []string) (Product, error)
	DeleteProduct(productSKU string) error
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

// Helper function (sudah ada dan benar)
func getDepartmentName(db *gorm.DB, departmentID string) (string, error) {
	if departmentID == "" {
		return "", nil
	}
	var dept Department
	if err := db.Where("department_id = ?", departmentID).First(&dept).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service Helper] Department dengan ID '%s' tidak ditemukan untuk lookup nama.\n", departmentID)
			return "", nil // Mungkin lebih baik mengembalikan error jika ID tidak valid
		}
		return "", err
	}
	return dept.DepartmentName, nil
}

func (s *service) AddEmployee(input AddEmployeeInput) (Employee, error) {
	birthday, err := time.Parse(employeeDateFormat, input.Birthday)
	if err != nil {
		return Employee{}, fmt.Errorf("format tanggal lahir tidak valid (gunakan %s): %w", employeeDateFormat, err)
	}
	joinDate, err := time.Parse(employeeDateFormat, input.JoinDate)
	if err != nil {
		// Pesan error di sini salah, seharusnya untuk JoinDate
		return Employee{}, fmt.Errorf("format tanggal bergabung tidak valid (gunakan %s): %w", employeeDateFormat, err)
	}

	var newEmployeeID string
	// var existingEmployee Employee // Tidak perlu dideklarasikan di scope ini jika hanya untuk loop
	for {
		newEmployeeID = generateEmployeeID()
		var tempEmp Employee                                             // Gunakan variabel temporary di dalam loop
		result := s.db.First(&tempEmp, "employee_id = ?", newEmployeeID) // Perbaiki: s.db.First, bukan &existingEmployee
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				break
			}
			return Employee{}, fmt.Errorf("gagal memverifikasi ID employee: %w", result.Error)
		}
		fmt.Printf("Employee ID %s sudah ada, generate ulang...\n", newEmployeeID)
	}

	employee := Employee{
		EmployeeID: newEmployeeID,
		Image:      input.Image,
		FullName:   input.FullName,
		Birthday:   birthday,
		Department: input.DepartmentID, // Menyimpan DepartmentID
		Email:      input.Email,
		Phone:      input.Phone,
		JoinDate:   joinDate,
		Role:       input.Role,
		Status:     input.Status,
		// DepartmentName akan diisi setelah create
	}

	var finalCreatedEmployee Employee // Variabel untuk menampung hasil akhir dengan preload

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&employee).Error; err != nil {
			return fmt.Errorf("gagal menyimpan data employee: %w", err)
		}

		employeeAddress := EmployeeAddress{
			EmployeeID:   newEmployeeID,
			Street:       input.Address.Street,
			DistrictCity: input.Address.DistrictCity,
			Province:     input.Address.Province,
			PostCode:     input.Address.PostCode,
			Country:      input.Address.Country,
		}
		if err := tx.Create(&employeeAddress).Error; err != nil {
			return fmt.Errorf("gagal menyimpan data alamat employee: %w", err)
		}

		// Ambil kembali employee yang baru dibuat dengan preloading Address dan mengisi DepartmentName
		// Preload Department di sini tidak akan mengisi struct Department karena relasi eksplisit sudah dihapus
		// Kita akan mengisi DepartmentName secara manual setelah transaksi
		if err := tx.Preload("Address").First(&finalCreatedEmployee, "employee_id = ?", newEmployeeID).Error; err != nil {
			return fmt.Errorf("gagal mengambil employee setelah create: %w", err)
		}
		return nil
	})

	if err != nil {
		return Employee{}, err
	}

	// Isi DepartmentName untuk respons
	// finalCreatedEmployee.Department berisi DepartmentID
	deptName, deptErr := getDepartmentName(s.db, finalCreatedEmployee.Department)
	if deptErr != nil {
		// Log error tapi mungkin tidak menggagalkan seluruh proses jika nama departemen hanya untuk display
		log.Printf("Peringatan: Gagal mengambil nama departemen untuk ID %s: %v", finalCreatedEmployee.Department, deptErr)
	}
	finalCreatedEmployee.DepartmentName = deptName
	// finalCreatedEmployee.Address sudah terisi dari Preload di dalam transaksi

	log.Printf("[Service AddEmployee] Employee berhasil dibuat: %+v\n", finalCreatedEmployee)
	return finalCreatedEmployee, nil
}

func (s *service) RegisterAdmin(input AdminRegisterInput) (EmployeeAccount, error) {
	// ... (Kode RegisterAdmin Anda sepertinya sudah benar)
	var employee Employee
	if err := s.db.Where("employee_id = ?", input.EmployeeID).First(&employee).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return EmployeeAccount{}, errors.New("employee ID tidak ditemukan, tidak dapat register akun admin")
		}
		return EmployeeAccount{}, fmt.Errorf("gagal mencari data employee: %w", err)
	}
	var existingAccount EmployeeAccount
	if err := s.db.Where("employee_id = ?", input.EmployeeID).First(&existingAccount).Error; err == nil {
		return EmployeeAccount{}, errors.New("employee ID sudah terdaftar sebagai akun admin")
	} else if err != gorm.ErrRecordNotFound {
		return EmployeeAccount{}, fmt.Errorf("gagal memeriksa akun admin existing: %w", err)
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return EmployeeAccount{}, fmt.Errorf("gagal mengenkripsi password: %w", err)
	}
	adminAccount := EmployeeAccount{
		EmployeeID: employee.EmployeeID, FullName: employee.FullName, Role: employee.Role, Password: string(hashedPassword),
	}
	if err := s.db.Create(&adminAccount).Error; err != nil {
		return EmployeeAccount{}, fmt.Errorf("gagal membuat akun admin: %w", err)
	}
	return adminAccount, nil
}

func (s *service) generateJWTTokenForAdmin(account EmployeeAccount) (string, error) {
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
	var account EmployeeAccount
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

func (s *service) GetAdminProfile(employeeID string) (Employee, error) {
	var employee Employee
	// Preload Address. DepartmentName akan diisi manual.
	if err := s.db.Preload("Address").Where("employee_id = ?", employeeID).First(&employee).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Employee{}, errors.New("detail employee untuk admin tidak ditemukan")
		}
		return Employee{}, fmt.Errorf("gagal mengambil profil admin: %w", err)
	}
	// Isi DepartmentName
	deptName, _ := getDepartmentName(s.db, employee.Department)
	employee.DepartmentName = deptName
	return employee, nil
}

func (s *service) ListEmployees() ([]Employee, error) {
	var employees []Employee
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
		var depts []Department
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

func (s *service) GetEmployeeByID(employeeID string) (Employee, error) {
	var employee Employee
	if err := s.db.Preload("Address").Where("employee_id = ?", employeeID).First(&employee).Error; err != nil {
		// ... (error handling gorm.ErrRecordNotFound, dll) ...
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Employee{}, errors.New("karyawan tidak ditemukan")
		}
		return Employee{}, fmt.Errorf("gagal mengambil detail karyawan: %w", err)
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
		var employee Employee
		if err := tx.Where("employee_id = ?", employeeID).First(&employee).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return errors.New("employee tidak ditemukan")
			}
			return fmt.Errorf("gagal memeriksa data employee: %w", err)
		}
		if err := tx.Where("employee_id = ?", employeeID).Delete(&EmployeeAccount{}).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("gagal menghapus akun employee: %w", err)
		}
		if err := tx.Where("employee_id = ?", employeeID).Delete(&EmployeeAddress{}).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("gagal menghapus alamat employee: %w", err)
		}
		result := tx.Where("employee_id = ?", employeeID).Delete(&Employee{})
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

func (s *service) UpdateEmployee(employeeID string, input AddEmployeeInput, newImagePath *string) (Employee, error) {
	var birthday, joinDate time.Time
	var err error
	if input.Birthday != "" {
		birthday, err = time.Parse(employeeDateFormat, input.Birthday)
		if err != nil {
			return Employee{}, fmt.Errorf("format tanggal lahir tidak valid: %w", err)
		}
	}
	if input.JoinDate != "" {
		joinDate, err = time.Parse(employeeDateFormat, input.JoinDate)
		if err != nil {
			return Employee{}, fmt.Errorf("format tanggal bergabung tidak valid: %w", err)
		}
	}

	var finalUpdatedEmployee Employee
	err = s.db.Transaction(func(tx *gorm.DB) error {
		var empToUpdate Employee
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
			empToUpdate.Address = EmployeeAddress{EmployeeID: employeeID}
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
		return Employee{}, err
	}

	deptName, _ := getDepartmentName(s.db, finalUpdatedEmployee.Department)
	finalUpdatedEmployee.DepartmentName = deptName

	return finalUpdatedEmployee, nil
}

func (s *service) AddDepartment(input AddDepartmentInput) (Department, error) {
	// ... (Kode AddDepartment Anda sudah benar)
	var existingDept Department
	if err := s.db.Where("department_name = ?", input.DepartmentName).First(&existingDept).Error; err == nil {
		return Department{}, errors.New("nama departemen sudah ada")
	} else if err != gorm.ErrRecordNotFound {
		return Department{}, fmt.Errorf("gagal memeriksa nama departemen: %w", err)
	}
	var newDepartmentID string
	for {
		newDepartmentID = generateDepartmentID()
		var tempDept Department
		if err := s.db.Where("department_id = ?", newDepartmentID).First(&tempDept).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				break
			}
			return Department{}, fmt.Errorf("gagal memverifikasi ID departemen: %w", err)
		}
	}
	department := Department{
		DepartmentID: newDepartmentID, DepartmentName: input.DepartmentName, Description: input.Description, Status: input.Status,
	}
	if err := s.db.Create(&department).Error; err != nil {
		return Department{}, fmt.Errorf("gagal menyimpan departemen: %w", err)
	}
	return department, nil
}

func (s *service) ListActiveDepartmentsForDropdown() ([]Department, error) {
	var departments []Department
	if err := s.db.Select("department_id, department_name").Where("status = ?", "active").Order("department_name asc").Find(&departments).Error; err != nil {
		log.Printf("[Service ListActiveDepartmentsForDropdown] Error: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar departemen aktif: %w", err)
	}
	return departments, nil
}

func (s *service) ListDepartmentsWithEmployeeCount() ([]Department, error) {
	var departments []Department
	// Ambil semua departemen, tidak peduli statusnya untuk halaman list utama
	if err := s.db.Order("department_name asc").Find(&departments).Error; err != nil {
		log.Printf("[Service ListDepartmentsWithEmployeeCount] Error mengambil departemen: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar departemen: %w", err)
	}

	// Untuk setiap departemen, hitung jumlah employee
	for i := range departments {
		var count int64
		// Employee.Department menyimpan DepartmentID
		if err := s.db.Model(&Employee{}).Where("department = ?", departments[i].DepartmentID).Count(&count).Error; err != nil {
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
	if err := s.db.Model(&Employee{}).Where("department = ?", departmentID).Count(&employeeCount).Error; err != nil {
		log.Printf("[Service DeleteDepartment] Error saat cek employee terkait: %v\n", err)
		return fmt.Errorf("gagal memeriksa keterkaitan employee: %w", err)
	}

	if employeeCount > 0 {
		log.Printf("[Service DeleteDepartment] Departemen %s masih memiliki %d karyawan.\n", departmentID, employeeCount)
		return fmt.Errorf("departemen tidak dapat dihapus karena masih memiliki %d karyawan terkait. Harap pindahkan atau hapus karyawan terlebih dahulu", employeeCount)
	}

	// Jika tidak ada employee terkait, lanjutkan hapus
	result := s.db.Where("department_id = ?", departmentID).Delete(&Department{})
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

func (s *service) UpdateDepartment(departmentID string, input UpdateDepartmentInput) (Department, error) {
	log.Printf("[Service UpdateDepartment] Memulai update untuk Department ID: %s, dengan data: %+v\n", departmentID, input)

	var departmentToUpdate Department

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
			var existingDeptWithNewName Department
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
		return Department{}, err // Kembalikan error dari transaksi
	}

	log.Printf("[Service UpdateDepartment] Berhasil mengupdate data untuk Department ID: %s\n", departmentID)
	return departmentToUpdate, nil // Kembalikan departemen yang sudah diupdate
}

func (s *service) GetDepartmentByID(departmentID string) (Department, error) {
	var department Department
	// Untuk halaman edit, kita mungkin tidak perlu employee count, jadi query sederhana sudah cukup.
	if err := s.db.Where("department_id = ?", departmentID).First(&department).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service GetDepartmentByID] Department dengan ID %s tidak ditemukan.\n", departmentID)
			return Department{}, errors.New("departemen tidak ditemukan")
		}
		log.Printf("[Service GetDepartmentByID] Error mengambil departemen ID %s: %v\n", departmentID, err)
		return Department{}, fmt.Errorf("gagal mengambil detail departemen: %w", err)
	}
	// Tidak perlu menghitung employee di sini, kecuali jika halaman edit membutuhkannya
	return department, nil
}

func (s *service) AddProductCategory(input AddProductCategoryInput) (ProductCategory, error) {
	log.Printf("[Service AddProductCategory] Memulai proses untuk kategori: %s\n", input.CategoryName)

	// 1. Cek apakah nama kategori sudah ada
	var existingCategory ProductCategory
	if err := s.db.Where("category_name = ?", input.CategoryName).First(&existingCategory).Error; err == nil {
		log.Printf("[Service AddProductCategory] Nama kategori '%s' sudah ada.\n", input.CategoryName)
		return ProductCategory{}, errors.New("nama kategori produk sudah ada")
	} else if err != gorm.ErrRecordNotFound {
		log.Printf("[Service AddProductCategory] Error saat cek nama kategori existing: %v\n", err)
		return ProductCategory{}, fmt.Errorf("gagal memeriksa nama kategori produk: %w", err)
	}

	// 2. Generate Category ID unik
	var newCategoryID string
	for {
		newCategoryID = generateProductCategoryID() // Dari model.go (package admin)
		var tempCategory ProductCategory
		if err := s.db.Where("category_id = ?", newCategoryID).First(&tempCategory).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				break // ID unik
			}
			log.Printf("[Service AddProductCategory] Error saat cek Category ID existing: %v\n", err)
			return ProductCategory{}, fmt.Errorf("gagal memverifikasi ID kategori produk: %w", err)
		}
		log.Printf("[Service AddProductCategory] Category ID %s sudah ada, generate ulang...\n", newCategoryID)
	}

	// 3. Buat instance ProductCategory
	category := ProductCategory{
		CategoryID:   newCategoryID,
		CategoryName: input.CategoryName,
		Description:  input.Description,
		Status:       input.Status,
		// CreatedAt dan UpdatedAt akan dihandle GORM
	}

	// 4. Simpan ke database
	if err := s.db.Create(&category).Error; err != nil {
		log.Printf("[Service AddProductCategory] Error saat menyimpan kategori produk baru: %v\n", err)
		return ProductCategory{}, fmt.Errorf("gagal menyimpan kategori produk: %w", err)
	}

	log.Printf("[Service AddProductCategory] Kategori produk '%s' (ID: %s) berhasil disimpan.\n", category.CategoryName, category.CategoryID)
	return category, nil
}

func (s *service) ListProductCategories() ([]ProductCategory, error) {
	var categories []ProductCategory
	// 1. Ambil semua kategori produk
	if err := s.db.Order("category_name asc").Find(&categories).Error; err != nil {
		log.Printf("[Service ListProductCategories] Error mengambil daftar kategori: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar kategori produk: %w", err)
	}

	if len(categories) == 0 {
		log.Println("[Service ListProductCategories] Tidak ada kategori produk ditemukan.")
		return []ProductCategory{}, nil // Kembalikan array kosong jika tidak ada kategori
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
	if err := s.db.Model(&Product{}).
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

func (s *service) GetProductCategoryByID(categoryID string) (ProductCategory, error) {
	var category ProductCategory
	if err := s.db.Where("category_id = ?", categoryID).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[Service GetProductCategoryByID] Kategori produk dengan ID %s tidak ditemukan.\n", categoryID)
			return ProductCategory{}, errors.New("kategori produk tidak ditemukan")
		}
		log.Printf("[Service GetProductCategoryByID] Error mengambil kategori produk ID %s: %v\n", categoryID, err)
		return ProductCategory{}, fmt.Errorf("gagal mengambil detail kategori produk: %w", err)
	}
	// Untuk halaman edit, kita tidak perlu ProductCount secara eksplisit di sini
	return category, nil
}

func (s *service) UpdateProductCategory(categoryID string, input UpdateProductCategoryInput) (ProductCategory, error) {
	log.Printf("[Service UpdateProductCategory] Memulai update untuk Category ID: %s, dengan data: %+v\n", categoryID, input)

	var categoryToUpdate ProductCategory

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
			var existingCategoryWithNewName ProductCategory
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
		return ProductCategory{}, err
	}

	log.Printf("[Service UpdateProductCategory] Berhasil mengupdate data untuk Category ID: %s\n", categoryID)
	return categoryToUpdate, nil // Kembalikan kategori yang sudah diupdate
}

func (s *service) DeleteProductCategory(categoryID string) error {
	log.Printf("[Service DeleteProductCategory] Memulai proses delete untuk Category ID: %s\n", categoryID)

	// Mulai transaksi database
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Opsional tapi direkomendasikan: Cek apakah kategori ini digunakan oleh produk.
		//    Untuk saat ini, kita belum memiliki model Product, jadi kita akan lewati langkah ini.
		//    Jika sudah ada model Product dengan relasi ke ProductCategory (misal field CategoryID di Product),
		//    Anda akan melakukan query COUNT di sini.
		//    Contoh placeholder:
		//    var productCount int64
		//    if err := tx.Model(&Product{}).Where("category_id = ?", categoryID).Count(&productCount).Error; err != nil {
		//        log.Printf("[Service DeleteProductCategory] Error saat cek produk terkait: %v\n", err)
		//        return fmt.Errorf("gagal memeriksa keterkaitan produk: %w", err)
		//    }
		//    if productCount > 0 {
		//        log.Printf("[Service DeleteProductCategory] Kategori %s masih memiliki %d produk.\n", categoryID, productCount)
		//        return fmt.Errorf("kategori tidak dapat dihapus karena masih memiliki %d produk terkait. Harap pindahkan atau hapus produk terlebih dahulu", productCount)
		//    }

		// 2. Hapus kategori produk
		result := tx.Where("category_id = ?", categoryID).Delete(&ProductCategory{})
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

func (s *service) AddProduct(input AddProductInput, imagePaths []string) (Product, error) {
	log.Printf("[Service AddProduct] Input diterima: %+v, Jumlah Gambar: %d\n", input, len(imagePaths))

	var parsedProductionDate *time.Time
	if input.ProductionDate != "" {
		t, err := time.Parse(employeeDateFormat, input.ProductionDate) // Gunakan format yang sama YYYY-MM-DD
		if err != nil {
			return Product{}, fmt.Errorf("format tanggal produksi tidak valid (gunakan %s): %w", employeeDateFormat, err)
		}
		parsedProductionDate = &t
	}

	// 1. Validasi ProductCategoryID (pastikan kategori ada)
	var category ProductCategory
	if err := s.db.Where("category_id = ?", input.ProductCategoryID).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Product{}, errors.New("kategori produk tidak ditemukan")
		}
		return Product{}, fmt.Errorf("gagal memvalidasi kategori produk: %w", err)
	}

	// 2. Generate Product SKU unik
	var newProductSKU string
	for {
		newProductSKU = generateProductSKU() // Dari model.go
		var tempProduct Product
		if err := s.db.Where("product_sku = ?", newProductSKU).First(&tempProduct).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				break // SKU unik
			}
			return Product{}, fmt.Errorf("gagal memverifikasi SKU produk: %w", err)
		}
		log.Printf("[Service AddProduct] Product SKU %s sudah ada, generate ulang...\n", newProductSKU)
	}

	// 3. Siapkan instance Product
	product := Product{
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
		RegularPrice:      input.RegularPrice,
		// Images akan diisi dalam transaksi
	}

	var finalCreatedProduct Product // Untuk menampung hasil dengan preload

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 4. Simpan data produk utama
		if err := tx.Create(&product).Error; err != nil {
			// Handle error duplikat lain jika ada (misal, jika Title harus unik)
			return fmt.Errorf("gagal menyimpan data produk: %w", err)
		}

		// 5. Simpan gambar produk (jika ada)
		if len(imagePaths) > 0 {
			var productImages []ProductImage
			for _, imgPath := range imagePaths {
				productImages = append(productImages, ProductImage{
					ProductSKU: newProductSKU,
					Image:      imgPath, // Path yang sudah disimpan oleh handler
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
		// Jika transaksi gagal, dan file gambar sudah terlanjur disimpan oleh handler,
		// idealnya ada mekanisme untuk menghapus file-file tersebut.
		// Untuk sekarang, kita fokus pada data DB dulu.
		log.Printf("[Service AddProduct] Transaksi gagal: %v\n", err)
		return Product{}, err
	}

	log.Printf("[Service AddProduct] Produk '%s' (SKU: %s) berhasil disimpan.\n", finalCreatedProduct.Title, finalCreatedProduct.ProductSKU)
	return finalCreatedProduct, nil
}

func (s *service) ListActiveProductCategories() ([]ProductCategory, error) {
	var categories []ProductCategory
	// Pilih hanya field yang dibutuhkan untuk dropdown agar lebih efisien
	// dan filter berdasarkan status. Backend akan menggunakan 'Published' atau 'Unpublished'.
	// Frontend di AddProduct.jsx saat ini menggunakan 'Published'/'Unpublished' untuk status produk.
	// Kita asumsikan status kategori juga sama.
	if err := s.db.Select("category_id, category_name").Where("status = ?", "published").Order("category_name asc").Find(&categories).Error; err != nil {
		log.Printf("[Service ListActiveProductCategories] Error: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar kategori produk aktif: %w", err)
	}
	log.Printf("[Service ListActiveProductCategories] Berhasil mengambil %d kategori produk aktif.\n", len(categories))
	return categories, nil
}

func (s *service) ListProducts() ([]Product, error) {
	var products []Product
	if err := s.db.Preload("Images").Preload("ProductCategory").Order("created_at desc").Find(&products).Error; err != nil {
		log.Printf("[Service ListProducts] Error: %v\n", err)
		return nil, fmt.Errorf("gagal mengambil daftar produk: %w", err)
	}
	return products, nil
}

func (s *service) GetProductBySKU(productSKU string) (Product, error) {
	var product Product
	if err := s.db.Preload("Images").Preload("ProductCategory").Where("product_sku = ?", productSKU).First(&product).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Product{}, errors.New("produk tidak ditemukan")
		}
		return Product{}, fmt.Errorf("gagal mengambil detail produk: %w", err)
	}
	return product, nil
}

func (s *service) UpdateProduct(productSKU string, input AddProductInput, newImagePaths []string) (Product, error) {
	var parsedProductionDate *time.Time
	if input.ProductionDate != "" {
		t, err := time.Parse(employeeDateFormat, input.ProductionDate)
		if err != nil {
			return Product{}, fmt.Errorf("format tanggal produksi tidak valid: %w", err)
		}
		parsedProductionDate = &t
	}

	if input.ProductCategoryID != "" { // Validasi kategori jika diubah
		var category ProductCategory
		if err := s.db.Where("category_id = ?", input.ProductCategoryID).First(&category).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return Product{}, errors.New("kategori produk baru tidak valid")
			}
			return Product{}, fmt.Errorf("gagal validasi kategori baru: %w", err)
		}
	}

	var finalUpdatedProduct Product
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var productToUpdate Product
		if err := tx.Preload("Images").Where("product_sku = ?", productSKU).First(&productToUpdate).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("produk tidak ditemukan untuk diupdate")
			}
			return fmt.Errorf("gagal mengambil produk: %w", err)
		}

		productToUpdate.Title = input.Title
		productToUpdate.Brand = input.Brand
		productToUpdate.ProductCategoryID = input.ProductCategoryID
		productToUpdate.PowerSource = input.PowerSource
		productToUpdate.WarrantyPeriod = input.WarrantyPeriod
		productToUpdate.ProductionDate = parsedProductionDate
		productToUpdate.Descriptions = input.Descriptions
		productToUpdate.Stock = input.Stock
		productToUpdate.Status = input.Status
		productToUpdate.RegularPrice = input.RegularPrice

		// Logika update gambar: Hapus semua gambar lama jika ada gambar baru yang diupload
		if len(newImagePaths) > 0 {
			// 1. Hapus file gambar lama dari server
			for _, oldImg := range productToUpdate.Images {
				fullOldPath := filepath.Join(".", oldImg.Image) // Asumsi oldImg.Image adalah path relatif seperti "uploads/..."
				if err := os.Remove(fullOldPath); err != nil {
					log.Printf("[Service UpdateProduct] Peringatan: Gagal menghapus file gambar lama %s: %v\n", fullOldPath, err)
				}
			}
			// 2. Hapus record gambar lama dari DB
			if err := tx.Where("product_sku = ?", productSKU).Delete(&ProductImage{}).Error; err != nil {
				return fmt.Errorf("gagal menghapus gambar lama dari db: %w", err)
			}
			// 3. Tambahkan record gambar baru
			var newProductImages []ProductImage
			for _, imgPath := range newImagePaths {
				newProductImages = append(newProductImages, ProductImage{ProductSKU: productSKU, Image: imgPath})
			}
			if err := tx.Create(&newProductImages).Error; err != nil {
				return fmt.Errorf("gagal menyimpan gambar baru: %w", err)
			}
		}
		// Jika newImagePaths kosong, gambar yang ada tidak diubah

		if err := tx.Omit("ProductCategory", "Images").Save(&productToUpdate).Error; err != nil {
			return fmt.Errorf("gagal menyimpan update produk: %w", err)
		}

		// Ambil kembali produk yang sudah diupdate dengan preload yang benar
		if err := tx.Preload("Images").Preload("ProductCategory").First(&finalUpdatedProduct, "product_sku = ?", productSKU).Error; err != nil {
			return fmt.Errorf("gagal mengambil data produk lengkap setelah update: %w", err)
		}
		return nil
	})

	if err != nil {
		return Product{}, err
	}
	return finalUpdatedProduct, nil
}

func (s *service) DeleteProduct(productSKU string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var product Product
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

		// Hapus dari product_images (akan otomatis jika ON DELETE CASCADE di DB)
		// Jika tidak ada CASCADE, hapus manual dulu:
		if err := tx.Where("product_sku = ?", productSKU).Delete(&ProductImage{}).Error; err != nil {
			// Jangan error jika record tidak ada, mungkin sudah terhapus oleh cascade atau tidak ada gambar
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("gagal menghapus gambar produk terkait: %w", err)
			}
		}

		// Hapus produk utama
		if err := tx.Where("product_sku = ?", productSKU).Delete(&Product{}).Error; err != nil {
			return fmt.Errorf("gagal menghapus produk: %w", err)
		}
		return nil
	})
}
