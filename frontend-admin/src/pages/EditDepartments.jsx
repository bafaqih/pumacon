// src/pages/EditDepartment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; // Asumsi 'react-quill' adalah yang benar
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu
import api from '../services/api'; // Sesuaikan path jika perlu

const EditDepartment = () => { // Nama komponen diubah menjadi EditDepartment
  const { departmentId: paramDepartmentId } = useParams(); // Ambil departmentId dari URL
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // State untuk loading dan pesan
  const [loading, setLoading] = useState(false);         // Untuk proses submit
  const [loadingData, setLoadingData] = useState(true); // Untuk fetch data awal
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State untuk form fields department
  const [departmentIdDisplay, setDepartmentIdDisplay] = useState(''); // Untuk menampilkan Department ID (read-only)
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active'); 
  const [validated, setValidated] = useState(false); // Untuk validasi Bootstrap

  // useEffect untuk mengambil data departemen yang akan diedit
  useEffect(() => {
    const fetchDepartmentData = async () => {
      if (!paramDepartmentId || !token) {
        setErrorMessage("Department ID tidak valid atau Anda tidak terautentikasi.");
        setLoadingData(false);
        if (!token) navigate('/dashboard/login', { replace: true });
        return;
      }
      setLoadingData(true);
      setErrorMessage('');
      try {
        // Panggil API untuk mendapatkan detail departemen
        const response = await api.get(`/admin/departments/${paramDepartmentId}`, { // Endpoint GET detail departemen
          headers: { Authorization: `Bearer ${token}` },
        });
        // Asumsi backend mengembalikan { department: {...} } atau langsung objek department
        const dept = response.data.department || response.data; 
        if (dept) {
          setDepartmentIdDisplay(dept.DepartmentID); // DepartmentID dari data backend
          setDepartmentName(dept.DepartmentName || '');
          setDescription(dept.Description || '');
          setStatus(dept.Status || 'active');
        } else {
          setErrorMessage(`Departemen dengan ID ${paramDepartmentId} tidak ditemukan.`);
        }
      } catch (err) {
        console.error("Error fetching department data for edit:", err);
        if (err.response && err.response.status === 401) {
          setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
          logout();
          navigate('/dashboard/login', { replace: true });
        } else {
          setErrorMessage(err.response?.data?.error || `Gagal mengambil data departemen ${paramDepartmentId}.`);
        }
      } finally {
        setLoadingData(false);
      }
    };
    if (paramDepartmentId) {
        fetchDepartmentData();
    }
  }, [paramDepartmentId, token, navigate, logout]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setValidated(true);

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setLoading(false);
      return;
    }

    if (!token) {
        setErrorMessage("Autentikasi dibutuhkan.");
        logout();
        navigate('/dashboard/login', {replace: true});
        setLoading(false);
        return;
    }

    const departmentDataToUpdate = {
      // DepartmentID tidak dikirim di body JSON, karena ada di URL dan tidak boleh diubah
      department_name: departmentName,
      description: description,
      status: status,
    };

    try {
      // Panggil API PUT untuk update departemen
      const response = await api.put(`/admin/departments/${paramDepartmentId}`, departmentDataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Pastikan content type JSON
        },
      });

      setSuccessMessage(response.data.message || 'Departemen berhasil diupdate!');
      // Tidak perlu reset form di halaman edit, biarkan data yang baru disimpan ditampilkan
      // Atau Anda bisa memuat ulang data dari server jika perlu
      setValidated(false);

      // Opsional: Arahkan kembali ke daftar departemen setelah beberapa detik
      setTimeout(() => {
        navigate('/dashboard/departments');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        logout();
        navigate('/dashboard/login', {replace: true});
      } else {
        setErrorMessage(err.response?.data?.error || 'Gagal mengupdate departemen. Terjadi kesalahan.');
      }
      console.error('Update department error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingData) {
    return (
      <main className="main-content-wrapper">
        <div className="container text-center p-5">Memuat data departemen...</div>
      </main>
    );
  }

  // Jika error saat fetch data awal dan tidak ada departmentName (indikasi data belum terload)
  if (errorMessage && !departmentName && !loadingData) { 
      return (
          <main className="main-content-wrapper">
              <div className="container">
                  <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>
                  <Link to="/dashboard/departments" className="btn btn-secondary">Kembali ke Daftar Departemen</Link>
              </div>
          </main>
      );
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2>Edit Department <span className="text-muted fs-5">({departmentIdDisplay || '...'})</span></h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/departments" className="text-inherit">Departments</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Edit Department</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/departments" className="btn btn-light">Back to Departments</Link>
              </div>
            </div>
          </div>
        </div>

        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
        {errorMessage && !loadingData && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        
        <form onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
          <div className="row">
            <div className="col-lg-12 col-12">
              <div className="card mb-6 shadow border-0">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5 mt-0">Department Information</h4>
                  <div className="row">
                    {/* Department ID (Read-Only) */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="departmentIdDisplayInput">Department ID</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="departmentIdDisplayInput" 
                        value={departmentIdDisplay} 
                        readOnly 
                        disabled
                        style={{ backgroundColor: '#e9ecef' }}
                      />
                    </div>

                    {/* Department Name */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="departmentNameInput">Department Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Department Name" 
                        id="departmentNameInput" 
                        value={departmentName} 
                        onChange={(e) => setDepartmentName(e.target.value)} 
                        required 
                        disabled={loading || loadingData}
                      />
                      <div className="invalid-feedback">Please enter department name.</div>
                    </div>
                    
                    {/* Descriptions */}
                    <div className="mb-3 col-lg-12" style={{minHeight: '250px', marginBottom: '40px' }}> {/* Penyesuaian margin bawah */}
                      <label className="form-label">Description</label>
                        <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        style={{ height: '150px' }} 
                        placeholder="Write department description here..."
                        readOnly={loading || loadingData}
                      />
                    </div>

                    {/* Status */}
                    <div className="mb-3 col-lg-12 mt-3"> {/* Penyesuaian margin atas */}
                      <label className="form-label d-block" id="departmentStatusLabel">Status <span className="text-danger">*</span></label>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="departmentStatusRadioEdit" 
                            id="statusActiveEditDept"
                            value="active"
                            checked={status === 'active'} 
                            onChange={(e) => setStatus(e.target.value)} 
                            disabled={loading || loadingData}
                        />
                        <label className="form-check-label" htmlFor="statusActiveEditDept">Active</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="departmentStatusRadioEdit" 
                            id="statusInactiveEditDept"
                            value="inactive"
                            checked={status === 'inactive'} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading || loadingData}
                        />
                        <label className="form-check-label" htmlFor="statusInactiveEditDept">Inactive</label>
                      </div>
                    </div>
                    
                    {/* Tombol Aksi */}
                    <div className="col-lg-12 mt-4">
                      <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <Link to="/dashboard/departments" className="btn btn-secondary ms-2" disabled={loading || loadingData}>
                        Cancel
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditDepartment; // Nama komponen diubah