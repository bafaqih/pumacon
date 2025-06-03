// src/pages/AddDepartment.jsx
import React, { useState } from 'react'; // useEffect tidak digunakan, bisa dihapus
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; // Jika 'react-quill-new' adalah fork, pastikan importnya benar
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu
import api from '../services/api'; // Sesuaikan path jika perlu

const AddDepartment = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // Ambil token untuk API call

  // State untuk form fields department
  const [departmentName, setDepartmentName] = useState('');
  // departmentId akan digenerate backend, jadi tidak perlu state di sini untuk input
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active'); // Default 'active', opsi: 'active', 'inactive'

  // State untuk loading dan pesan
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => { // Ubah menjadi async
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      form.classList.add('was-validated');
      setLoading(false);
      return;
    }
    // form.classList.add('was-validated'); // Bisa dihapus jika error ditangani state

    if (!token) {
        setErrorMessage("Autentikasi dibutuhkan. Silakan login kembali.");
        setLoading(false);
        logout(); // Panggil logout dari context jika token tidak ada
        navigate('/dashboard/login', {replace: true});
        return;
    }

    const departmentData = {
      department_name: departmentName, // Sesuaikan dengan field DTO backend
      description: description,
      status: status,
    };

    try {
      // Ganti dengan endpoint API Anda yang sebenarnya
      const response = await api.post('/admin/departments', departmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage(response.data.message || 'Departemen berhasil ditambahkan!');
      // Kosongkan form
      setDepartmentName('');
      setDescription('');
      setStatus('active');
      form.classList.remove('was-validated'); // Hapus kelas validasi bootstrap

      // Opsional: Arahkan ke halaman daftar departemen setelah beberapa detik
      setTimeout(() => {
        navigate('/dashboard/departments');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        logout();
        navigate('/dashboard/login', {replace: true});
      } else {
        setErrorMessage(err.response?.data?.error || 'Gagal menambahkan departemen. Terjadi kesalahan.');
      }
      console.error('Add department error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2>Add New Department</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/departments" className="text-inherit">Departments</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Add New Department</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/departments" className="btn btn-light">Back to Departments</Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- Tampilkan Pesan Sukses atau Error --- */}
        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

        <form onSubmit={handleSubmit} noValidate className="needs-validation">
          <div className="row">
            <div className="col-lg-12 col-12">
              <div className="card mb-6 shadow border-0">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5 mt-0">Department Information</h4>
                  <div className="row">
                    {/* Department Name */}
                    <div className="mb-3 col-lg-12"> {/* Dibuat full width */}
                      <label className="form-label" htmlFor="departmentNameInput">Department Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Department Name" 
                        id="departmentNameInput" 
                        value={departmentName} 
                        onChange={(e) => setDepartmentName(e.target.value)} 
                        required 
                        disabled={loading}
                      />
                      <div className="invalid-feedback">Please enter department name.</div>
                    </div>
                    
                    {/* Department ID Dihapus dari Form Input */}
                    
                    {/* Descriptions */}
                    <div className="mb-1 col-lg-12" style={{minHeight: '250px'}}> {/* Tambah minHeight untuk ReactQuill */}
                      <label className="form-label">Description</label>
                        <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        style={{ height: '150px' }} // Konten quill akan mengisi ini, marginBottom dihapus dari sini
                        placeholder="Write department description here..."
                        readOnly={loading} // Tambahkan readOnly saat loading
                      />
                    </div>

                    {/* Status */}
                    <div className="mb-3 col-lg-12"> {/* Tambah margin top untuk spasi setelah ReactQuill */}
                      <label className="form-label d-block" id="departmentStatusLabel">Status <span className="text-danger">*</span></label>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="departmentStatusRadio"
                            id="statusActiveDept" // ID unik
                            value="active"
                            checked={status === 'active'} 
                            onChange={(e) => setStatus(e.target.value)} 
                            disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="statusActiveDept">Active</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="departmentStatusRadio" 
                            id="statusInactiveDept" // ID unik
                            value="inactive"
                            checked={status === 'inactive'} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="statusInactiveDept">Inactive</label>
                      </div>
                    </div>
                    
                    {/* Tombol Aksi */}
                    <div className="col-lg-12 mt-4">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Department'}
                      </button>
                      <Link to="/dashboard/departments" className="btn btn-secondary ms-2" disabled={loading}>
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

export default AddDepartment;