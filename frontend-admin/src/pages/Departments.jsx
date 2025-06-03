// src/pages/Departments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu
import api from '../services/api'; // Sesuaikan path jika perlu

const Departments = () => {
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Untuk pesan sukses (misal setelah delete)
  // State untuk filter (opsional, bisa dikembangkan lebih lanjut)
  // const [searchTerm, setSearchTerm] = useState('');
  // const [statusFilter, setStatusFilter] = useState('');


  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Fungsi untuk menentukan kelas badge berdasarkan status (sudah ada dan bagus)
  const getStatusClass = (status) => {
    if (!status) return 'bg-light-secondary text-dark-secondary'; // Fallback jika status null/undefined
    if (status.toLowerCase() === 'active') {
      return 'bg-light-success text-dark-success';
    } else if (status.toLowerCase() === 'inactive') {
      return 'bg-light-danger text-dark-danger';
    }
    return 'bg-light-secondary text-dark-secondary'; // Fallback
  };

  // Fungsi untuk mengambil daftar departemen
  const fetchDepartments = useCallback(async () => {
    if (!token) {
      setError("Autentikasi dibutuhkan untuk melihat data departemen.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage(''); // Bersihkan pesan sukses saat fetch ulang
    try {
      const response = await api.get('/admin/departments', { // Endpoint list department dengan employee count
        headers: { Authorization: `Bearer ${token}` },
      });
      // Asumsi backend mengembalikan { departments: [...] }
      setDepartmentsList(response.data.departments || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.");
        logout();
        navigate('/dashboard/login', { replace: true });
      } else {
        setError(err.response?.data?.error || "Gagal mengambil daftar departemen.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]); // Panggil fetchDepartments saat komponen mount atau dependensi berubah

  // Fungsi untuk menangani delete department
  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus departemen "${departmentName}" (ID: ${departmentId})? Karyawan yang ada di departemen ini mungkin perlu dipindahkan terlebih dahulu.`)) {
      return;
    }

    if (!token) {
      setError("Autentikasi dibutuhkan.");
      return;
    }
    setError('');
    setSuccessMessage('');

    try {
      await api.delete(`/admin/departments/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(`Departemen "${departmentName}" berhasil dihapus.`);
      // Update daftar departemen di UI
      setDepartmentsList(prevList => prevList.filter(dept => dept.DepartmentID !== departmentId));
    } catch (err) {
      console.error(`Error deleting department ${departmentId}:`, err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda tidak valid. Silakan login kembali.");
        logout();
        navigate('/dashboard/login', { replace: true });
      } else {
        // Tangani error spesifik dari backend (misal, tidak bisa hapus karena masih ada employee)
        setError(err.response?.data?.error || `Gagal menghapus departemen ${departmentId}.`);
      }
    }
  };


  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div>
                <h2>Departments</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Departments</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/departments/add-department" className="btn btn-primary">Add New Department</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tampilkan pesan sukses atau error global untuk halaman ini */}
        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="row">
          <div className="col-xl-12 col-12 mb-5">
            <div className="card h-100 card-lg">
              <div className="px-6 py-6">
                <div className="row justify-content-between">
                  <div className="col-lg-4 col-md-6 col-12 mb-2 mb-md-0">
                    <form className="d-flex" role="search">
                      <input className="form-control" type="search" placeholder="Search Department" aria-label="Search" />
                      {/* Logika search bisa ditambahkan nanti (client-side atau server-side) */}
                    </form>
                  </div>
                  <div className="col-xl-2 col-md-4 col-12">
                    <select className="form-select">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      {/* Logika filter status bisa ditambahkan nanti */}
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {loading && <p className="p-4 text-center">Loading departments...</p>}
                {!loading && !error && departmentsList.length === 0 && (
                  <p className="p-4 text-center">No departments found.</p>
                )}
                {!loading && !error && departmentsList.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-centered table-hover mb-0 text-nowrap table-borderless table-with-checkbox">
                      <thead className="bg-light">
                        <tr>
                          <th>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" value="" id="checkAllDepts" />
                              <label className="form-check-label" htmlFor="checkAllDepts"></label>
                            </div>
                          </th>
                          <th>Department Name</th>
                          <th>Employees</th>
                          <th>Status</th>
                          <th></th> {/* Kolom untuk action dropdown */}
                        </tr>
                      </thead>
                      <tbody>
                        {departmentsList.map((dept) => (
                          <tr key={dept.DepartmentID}>
                            <td>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id={`dept-${dept.DepartmentID}`} />
                                <label className="form-check-label" htmlFor={`dept-${dept.DepartmentID}`}></label>
                              </div>
                            </td>
                            <td>
                              {/* Link ke halaman Edit Department */}
                              <Link to={`/dashboard/departments/${dept.DepartmentID}/edit`} className="text-reset">
                                {dept.DepartmentName}
                              </Link>
                            </td>
                            <td>{dept.EmployeeCount}</td> {/* Menampilkan employeeCount dari API */}
                            <td>
                              <span className={`badge ${getStatusClass(dept.Status)}`}>{dept.Status}</span>
                            </td>
                            <td>
                              <div className="dropdown">
                                <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i className="feather-icon icon-more-vertical fs-5"></i>
                                </Link>
                                <ul className="dropdown-menu">
                                  <li>
                                    {/* Link ke halaman Edit Department */}
                                    <Link className="dropdown-item" to={`/dashboard/departments/${dept.DepartmentID}/edit`}>
                                      <i className="bi bi-pencil-square me-3"></i> Edit
                                    </Link>
                                  </li>
                                  <li>
                                    {/* Tombol Delete */}
                                    <button 
                                      className="dropdown-item text-danger" 
                                      onClick={() => handleDeleteDepartment(dept.DepartmentID, dept.DepartmentName)}
                                    >
                                      <i className="bi bi-trash me-3"></i> Delete
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
                {!loading && !error && departmentsList.length > 0 && (
                   <div className="border-top d-flex justify-content-between align-items-md-center px-6 py-6 flex-md-row flex-column gap-4">
                      <span>Showing 1 to {departmentsList.length} of {departmentsList.length} entries</span> {/* Perlu disesuaikan dengan pagination backend */}
                      <nav>
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
  );
};

export default Departments;