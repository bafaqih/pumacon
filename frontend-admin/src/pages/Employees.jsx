// src/pages/Employees.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path ke AuthContext.jsx Anda
import api from '../services/api'; // Sesuaikan path ke api.js Anda

const Employees = () => {
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');
  const [deleteError, setDeleteError] = useState('');    
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const defaultAvatar = '/assets/images/avatar/avatar-1.jpg'; // Sediakan gambar default di folder public/assets Anda
  const backendAssetBaseUrl = 'http://localhost:8080'; // Sesuaikan jika base URL backend Anda berbeda

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return defaultAvatar;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${backendAssetBaseUrl}/${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Format: DD Mon, YYYY (contoh: 01 Jan, 2023)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Kembalikan string asli jika parsing gagal
    }
  };

  const fetchEmployees = useCallback(async () => {
    if (!token) {
      setError("Autentikasi dibutuhkan untuk melihat data karyawan.");
      setLoading(false);
      // logout(); // Opsional: logout jika token tiba-tiba hilang
      // navigate('/dashboard/login', { replace: true }); // Opsional: redirect
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Asumsi backend mengembalikan array of employees di response.data atau response.data.employees
      // Setiap employee HARUS memiliki EmployeeID, FullName, Email, Phone, Department, JoinDate,
      // dan objek Address jika ada.
      setEmployeesList(response.data.employees || response.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.");
        logout();
        navigate('/dashboard/login', { replace: true });
      } else {
        setError(err.response?.data?.error || "Gagal mengambil data karyawan.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout]); // useCallback dependencies

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]); // Panggil fetchEmployees saat komponen mount atau dependensi berubah

  const handleViewEmployeeInOffcanvas = async (employeeId) => {
    if (!token) {
      setErrorDetail("Autentikasi dibutuhkan.");
      return;
    }
    setSelectedEmployee(null);
    setLoadingDetail(true);
    setErrorDetail('');
    try {
      const response = await api.get(`/admin/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Asumsi backend mengembalikan satu objek employee di response.data atau response.data.employee
      // dan objek ini memiliki Image, FullName, Status, EmployeeID, Role, Email, Phone, Department, JoinDate, Birthday,
      // dan objek Address (Street, DistrictCity, Province, PostCode, Country).
      setSelectedEmployee(response.data.employee || response.data);
    } catch (err) {
      console.error(`Error fetching employee ${employeeId} details:`, err);
      if (err.response && err.response.status === 401) {
        setErrorDetail("Sesi Anda tidak valid. Silakan login kembali.");
        logout();
        navigate('/dashboard/login', { replace: true });
      } else {
        setErrorDetail(err.response?.data?.error || `Gagal mengambil detail karyawan ${employeeId}.`);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    // Tampilkan konfirmasi sebelum menghapus
    if (!window.confirm(`Apakah Anda yakin ingin menghapus karyawan "${employeeName}" (ID: ${employeeId})? Tindakan ini tidak dapat diurungkan.`)) {
      return;
    }

    if (!token) {
      setDeleteError("Autentikasi dibutuhkan.");
      // logout(); navigate('/dashboard/login'); // Opsional redirect
      return;
    }

    setDeleteError('');
    setDeleteSuccess('');
    // Anda bisa menambahkan state loading spesifik untuk tombol delete jika mau

    try {
      await api.delete(`/admin/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteSuccess(`Karyawan "${employeeName}" berhasil dihapus.`);
      // Update daftar karyawan di UI dengan menghapus karyawan yang baru saja dihapus
      setEmployeesList(prevList => prevList.filter(emp => emp.EmployeeID !== employeeId));
      // Jika offcanvas menampilkan detail karyawan yang dihapus, tutup atau clear
      if (selectedEmployee && selectedEmployee.EmployeeID === employeeId) {
        setSelectedEmployee(null);
        // Anda mungkin perlu menutup offcanvas secara manual jika ia tidak menutup otomatis
        const offcanvasElement = document.getElementById('offcanvasEmployeeDetail');
        if (offcanvasElement && bootstrap.Offcanvas.getInstance(offcanvasElement)) { // Perlu import bootstrap jika belum
            bootstrap.Offcanvas.getInstance(offcanvasElement).hide();
        }
      }

    } catch (err) {
      console.error(`Error deleting employee ${employeeId}:`, err);
      if (err.response && err.response.status === 401) {
        setDeleteError("Sesi Anda tidak valid. Silakan login kembali.");
        logout();
        navigate('/dashboard/login', { replace: true });
      } else {
        setDeleteError(err.response?.data?.error || `Gagal menghapus karyawan ${employeeId}.`);
      }
    }
  };

  return (
    <>
      <main className="main-content-wrapper">
        <div className="container">
          <div className="row mb-8">
            <div className="col-md-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                <div>
                  <h2>Employees</h2>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
                      <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                      <li className="breadcrumb-item active" aria-current="page">Employees</li>
                    </ol>
                  </nav>
                </div>
                <div>
                  <Link to="/dashboard/employees/add-employee" className="btn btn-primary">Add Employee</Link>
                </div>
              </div>
            </div>
          </div>

          {deleteSuccess && <div className="alert alert-success" role="alert">{deleteSuccess}</div>}
          {deleteError && <div className="alert alert-danger" role="alert">{deleteError}</div>}

          <div className="row">
            <div className="col-xl-12 col-12 mb-5">
              <div className="card h-100 card-lg">
                <div className="p-6">
                  <div className="row justify-content-between">
                    <div className="col-md-4 col-12">
                      <form className="d-flex" role="search">
                        <label htmlFor="searchEmployees" className="visually-hidden">Search Employees</label>
                        <input className="form-control" type="search" id="searchEmployees" placeholder="Search Employees" aria-label="Search" />
                      </form>
                    </div>
                    {/* Tambahkan filter atau tombol lain di sini jika perlu */}
                  </div>
                </div>
                <div className="card-body p-0">
                  {loading && <p className="p-4 text-center">Loading employees...</p>}
                  {error && <div className="alert alert-danger m-4" role="alert">{error}</div>}
                  {!loading && !error && employeesList.length === 0 && (
                    <p className="p-4 text-center">No employees found.</p>
                  )}
                  {!loading && !error && employeesList.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-centered table-hover table-borderless mb-0 table-with-checkbox text-nowrap">
                        <thead className="bg-light">
                          <tr>
                            <th>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id="checkAllEmployees" />
                                <label className="form-check-label" htmlFor="checkAllEmployees"></label>
                              </div>
                            </th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Department</th>
                            <th>Join Date</th>
                            <th></th> {/* Kolom untuk action dropdown */}
                          </tr>
                        </thead>
                        <tbody>
                          {employeesList.map((employee) => (
                            <tr key={employee.EmployeeID}>
                              <td>
                                <div className="form-check">
                                  <input className="form-check-input" type="checkbox" value="" id={`employee-${employee.EmployeeID}`} />
                                  <label className="form-check-label" htmlFor={`employee-${employee.EmployeeID}`}></label>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img 
                                    src={getProfileImageUrl(employee.Image)}
                                    alt={employee.FullName} 
                                    className="avatar avatar-xs rounded-circle me-2"
                                    onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar; }}
                                  />
                                  {employee.FullName}
                                </div>
                              </td>
                              <td>{employee.Email}</td>
                              <td>{employee.Phone || '-'}</td>
                              <td>{employee.DepartmentName || employee.Department || '-'}</td> 
                              <td>{formatDate(employee.JoinDate)}</td>
                              <td>
                                <div className="dropdown">
                                  <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="feather-icon icon-more-vertical fs-5"></i> {/* Pastikan Anda punya ikon ini atau ganti */}
                                  </Link>
                                  <ul className="dropdown-menu">
                                    <li>
                                      <a
                                        className="dropdown-item"
                                        href="#!"
                                        data-bs-toggle="offcanvas"
                                        data-bs-target="#offcanvasEmployeeDetail"
                                        aria-controls="offcanvasEmployeeDetail"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleViewEmployeeInOffcanvas(employee.EmployeeID);
                                        }}
                                      >
                                        <i className="bi bi-eye me-3"></i>View
                                      </a>
                                    </li>
                                    <li>
                                      <Link className="dropdown-item" to={`/dashboard/employees/${employee.EmployeeID}/edit`}>
                                        <i className="bi bi-pencil-square me-3"></i>Edit
                                      </Link>
                                    </li>
                                    <li>
                                      <button className="dropdown-item text-danger"
                                        onClick={() => handleDeleteEmployee(employee.EmployeeID, employee.FullName)}
                                      >
                                        <i className="bi bi-trash me-3"></i>Delete
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!loading && !error && employeesList.length > 0 && (
                     <div className="border-top d-md-flex justify-content-between align-items-center p-6">
                        <span>Showing 1 to {employeesList.length} of {employeesList.length} entries</span> {/* Perlu disesuaikan dengan pagination backend */}
                        <nav className="mt-2 mt-md-0">
                            <ul className="pagination mb-0">
                                <li className="page-item disabled"><Link className="page-link" to="#!">Previous</Link></li>
                                <li className="page-item"><Link className="page-link active" to="#!">1</Link></li>
                                <li className="page-item"><Link className="page-link" to="#!">Next</Link></li>
                            </ul>
                        </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Offcanvas untuk Detail Karyawan */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasEmployeeDetail" aria-labelledby="offcanvasEmployeeDetailLabel">
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title" id="offcanvasEmployeeDetailLabel">Employee Details</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body d-flex flex-column"> {/* Konten akan diisi secara kondisional */}
            {loadingDetail && <div className="text-center p-5">Loading details...</div>}
            {errorDetail && <div className="alert alert-danger m-3">{errorDetail}</div>}
            {!loadingDetail && !errorDetail && selectedEmployee ? (
                <div className="d-flex flex-column gap-4"> {/* Wrapper untuk konten jika ada data */}
                    <div className="d-flex flex-row align-items-center gap-4 w-100">
                        <div className="flex-shrink-0">
                            <img 
                                src={getProfileImageUrl(selectedEmployee.Image)} 
                                alt={selectedEmployee.FullName} 
                                className="avatar avatar-xl rounded-circle"
                                onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar; }}
                            />
                        </div>
                        <div className="d-flex flex-column gap-1 flex-grow-1">
                            <h3 className="mb-0 h5 d-flex flex-row align-items-center gap-3">
                                {selectedEmployee.FullName}
                                {selectedEmployee.Status === 'active' && <span className="badge bg-light-success text-dark-success">Active</span>}
                                {selectedEmployee.Status === 'inactive' && <span className="badge bg-light-danger text-dark-danger">Inactive</span>}
                                {selectedEmployee.Status === 'on_leave' && <span className="badge bg-light-warning text-dark-warning">On Leave</span>}
                                {/* Tambahkan status lain jika ada */}
                            </h3>
                            <div className="d-md-flex align-items-center justify-content-between">
                                <div className="">ID: {selectedEmployee.EmployeeID}</div>
                                <div className="text-black-50">
                                    Role: <span className="text-dark">{selectedEmployee.Role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex flex-row gap-2"><span className="text-dark fw-semibold" style={{minWidth: '120px'}}>Email:</span><span className="text-black-50">{selectedEmployee.Email}</span></div>
                        <div className="d-flex flex-row gap-2"><span className="text-dark fw-semibold" style={{minWidth: '120px'}}>Phone:</span><span className="text-black-50">{selectedEmployee.Phone}</span></div>
                        <div className="d-flex flex-row gap-2"><span className="text-dark fw-semibold" style={{minWidth: '120px'}}>Department:</span><span className="text-black-50">{selectedEmployee.DepartmentName || selectedEmployee.Department || '-'}</span></div>
                        <div className="d-flex flex-row gap-2"><span className="text-dark fw-semibold" style={{minWidth: '120px'}}>Join Date:</span><span className="text-black-50">{formatDate(selectedEmployee.JoinDate)}</span></div>
                        <div className="d-flex flex-row gap-2"><span className="text-dark fw-semibold" style={{minWidth: '120px'}}>Birthday:</span><span className="text-black-50">{formatDate(selectedEmployee.Birthday) || '-'}</span></div>
                    </div>

                    {selectedEmployee.Address ? (
                        <div className="card">
                            <div className="card-body p-4">
                                <h6 className="mb-2">Address</h6>
                                <p className="text-black-50 mb-0">
                                    {selectedEmployee.Address.Street}<br />
                                    {selectedEmployee.Address.DistrictCity}, {selectedEmployee.Address.Province} {selectedEmployee.Address.PostCode}<br />
                                    {selectedEmployee.Address.Country}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="card"><div className="card-body p-4"><h6 className="mb-2">Address</h6><p className="text-black-50 mb-0">No address provided.</p></div></div>
                    )}
                </div>
            ) : (
                !loadingDetail && !errorDetail && <p className="text-center p-5">Select an employee to view their details.</p>
            )}
        </div>
      </div>
    </>
  );
};

export default Employees;