import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AddEmployee = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [departmentsOptions, setDepartmentsOptions] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentsError, setDepartmentsError] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [role, setRole] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [status, setStatus] = useState('active');

  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressProvince, setAddressProvince] = useState('');
  const [addressPostCode, setAddressPostCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('');

  const [avatarPreview, setAvatarPreview] = useState('/assets/images/docs/placeholder-img.jpg');
  const [avatarFile, setAvatarFile] = useState(null);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token) {
        setDepartmentsError("Autentikasi dibutuhkan untuk memuat departemen.");
        setLoadingDepartments(false);
        return;
      }
      setLoadingDepartments(true);
      setDepartmentsError('');
      try {
        const response = await api.get('/admin/departments/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartmentsOptions(response.data.departments || []);
      } catch (err) {
        console.error("Error fetching departments:", err);
        if (err.response && err.response.status === 401) {
            setDepartmentsError("Sesi Anda tidak valid. Silakan login kembali.");
            logout(); 
            navigate('/dashboard/login', {replace: true});
        } else {
            setDepartmentsError(err.response?.data?.error || "Gagal memuat daftar departemen.");
        }
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [token, navigate, logout]);

  const handleAvatarFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarPreview('/assets/images/docs/placeholder-img.jpg');
    }
  };

  useEffect(() => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      const currentPreview = avatarPreview;
      return () => URL.revokeObjectURL(currentPreview);
    }
  }, [avatarPreview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setValidated(true);

    const form = event.currentTarget;
    if (form.checkValidity() === false || selectedDepartmentId === "") {
      event.stopPropagation();
      if (selectedDepartmentId === "") setErrorMessage("Departemen wajib dipilih.");
      setLoading(false);
      return;
    }

    if (!token) {
        setErrorMessage("Autentikasi dibutuhkan...");
        logout();
        navigate('/dashboard/login', {replace: true});
        setLoading(false);
        return;
    }

    const formDataPayload = new FormData();
    if (avatarFile) {
      formDataPayload.append('imageFile', avatarFile);
    }

    const employeeData = {
      full_name: fullName,
      birthday: birthDate,
      department_id: selectedDepartmentId,
      email: email,
      phone: phone,
      join_date: joinDate,
      role: role,
      status: status,
      address: {
        street: addressStreet,
        district_city: addressCity,
        province: addressProvince,
        post_code: addressPostCode,
        country: addressCountry,
      },
    };
    formDataPayload.append('jsonData', JSON.stringify(employeeData));

    try {
      const response = await api.post('/admin/add-employee', formDataPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(response.data.message || 'Employee berhasil ditambahkan!');
      setFullName(''); setEmail(''); setPhone(''); setBirthDate('');
      setSelectedDepartmentId(''); setRole(''); setJoinDate(''); setStatus('active');
      setAvatarFile(null); setAvatarPreview('/assets/images/docs/placeholder-img.jpg');
      setAddressStreet(''); setAddressCity(''); setAddressProvince('');
      setAddressPostCode(''); setAddressCountry('');
      setValidated(false);
      ;
    } catch (err) {
      if (err.response && err.response.status === 401) { 
        setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        logout();
        navigate('/dashboard/login', {replace: true});
      } else { 
        setErrorMessage(err.response?.data?.error || 'Gagal menambahkan employee.');
      }
      console.error('Add employee error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div>
              <h2>Add New Employee</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/dashboard/employees" className="text-inherit">Employees</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Add New Employee</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            {departmentsError && <div className="alert alert-warning" role="alert">{departmentsError}</div>}

            <form className={`needs-validation ${validated ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
              <div className="card shadow border-0">
                <div className="card-body d-flex flex-column gap-8 p-7">
                  <div className="d-flex flex-column flex-md-row align-items-center file-input-wrapper gap-2">
                    <div>
                      <img className="image avatar avatar-lg rounded-3" src={avatarPreview} alt="Employee Avatar Preview" />
                    </div>
                    <div className="file-upload btn btn-light ms-md-4">
                      <input type="file" className="file-input opacity-0" id="employeeAvatarUpload"
                        onChange={handleAvatarFileUpload} accept="image/jpeg, image/png, image/gif" disabled={loading} />
                      <label htmlFor="employeeAvatarUpload" style={{ cursor: 'pointer' }}>Upload Photo</label>
                    </div>
                    <span className="ms-md-2 text-muted">JPG, GIF, PNG. Max 2MB.</span>
                  </div>
                  <div className="d-flex flex-column gap-4">
                    <h3 className="mb-0 h6">Employee Information</h3>
                    <div className="row g-3">
                      <div className="col-lg-6 col-12">
                        <div>
                          <label htmlFor="addEmployeeName" className="form-label">Full Name <span className="text-danger">*</span></label>
                          <input type="text" className="form-control" id="addEmployeeName" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={loading} />
                          <div className="invalid-feedback">Please enter full name.</div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <div>
                          <label htmlFor="addEmployeeEmail" className="form-label">Email <span className="text-danger">*</span></label>
                          <input type="email" className="form-control" id="addEmployeeEmail" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                          <div className="invalid-feedback">Please enter a valid email.</div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <div>
                          <label htmlFor="addEmployeePhone" className="form-label">Phone <span className="text-danger">*</span></label>
                          <input type="text" className="form-control" id="addEmployeePhone" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
                          <div className="invalid-feedback">Please enter phone number.</div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label className="form-label" htmlFor="addEmployeeBirthDate">Birthday <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" id="addEmployeeBirthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required disabled={loading} />
                        <div className="invalid-feedback">Please enter birth date.</div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label className="form-label" htmlFor="addEmployeeJoinDate">Join Date <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" id="addEmployeeJoinDate" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required disabled={loading} />
                        <div className="invalid-feedback">Please enter join date.</div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label htmlFor="addEmployeeDepartment" className="form-label">Department <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          id="addEmployeeDepartment"
                          value={selectedDepartmentId}
                          onChange={(e) => setSelectedDepartmentId(e.target.value)}
                          required
                          disabled={loading || loadingDepartments}
                        >
                          <option value="">{loadingDepartments ? 'Loading departments...' : 'Select Department'}</option>
                          {departmentsOptions.map(dept => (
                            <option key={dept.DepartmentID} value={dept.DepartmentID}>{dept.DepartmentName}</option>
                          ))}
                        </select>
                        <div className="invalid-feedback">{departmentsError ? departmentsError : 'Please select a department.'}</div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label htmlFor="addEmployeeRole" className="form-label">Role <span className="text-danger">*</span></label>
                        <select className="form-select" id="addEmployeeRole" value={role} onChange={(e) => setRole(e.target.value)} required disabled={loading}>
                          <option value="">Select Role</option>
                          <option value="Admin HR">Admin HR</option>
                          <option value="Staff">Staff</option>
                        </select>
                        <div className="invalid-feedback">Please select a role.</div>
                      </div>
                      <div className="mb-3 col-lg-6 col-12">
                        <label className="form-label d-block" id="employeeStatusLabel">Status <span className="text-danger">*</span></label>
                        <div className="form-check form-check-inline">
                          <input className="form-check-input" type="radio" name="addEmployeeStatusRadio" id="statusActiveAddEmp" value="active" checked={status === 'active'} onChange={(e) => setStatus(e.target.value)} disabled={loading} />
                          <label className="form-check-label" htmlFor="statusActiveAddEmp">Active</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input className="form-check-input" type="radio" name="addEmployeeStatusRadio" id="statusInactiveAddEmp" value="inactive" checked={status === 'inactive'} onChange={(e) => setStatus(e.target.value)} disabled={loading} />
                          <label className="form-check-label" htmlFor="statusInactiveAddEmp">Inactive</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-column gap-4">
                    <h3 className="mb-0 h6">Address Information</h3>
                    <div className="row g-3">
                        <div className="col-12"><label htmlFor="addEmpAddrStreet" className="form-label">Street <span className="text-danger">*</span></label><input type="text" className="form-control" id="addEmpAddrStreet" placeholder="Street Address" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} required disabled={loading} /><div className="invalid-feedback">Please enter street.</div></div>
                        <div className="col-md-6"><label htmlFor="addEmpAddrCity" className="form-label">District/City <span className="text-danger">*</span></label><input type="text" className="form-control" id="addEmpAddrCity" placeholder="District/City" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} required disabled={loading} /><div className="invalid-feedback">Please enter district/city.</div></div>
                        <div className="col-md-6"><label htmlFor="addEmpAddrProvince" className="form-label">Province <span className="text-danger">*</span></label><input type="text" className="form-control" id="addEmpAddrProvince" placeholder="Province" value={addressProvince} onChange={(e) => setAddressProvince(e.target.value)} required disabled={loading} /><div className="invalid-feedback">Please enter province.</div></div>
                        <div className="col-md-6"><label htmlFor="addEmpAddrPostCode" className="form-label">Post Code <span className="text-danger">*</span></label><input type="text" className="form-control" id="addEmpAddrPostCode" placeholder="Post Code" value={addressPostCode} onChange={(e) => setAddressPostCode(e.target.value)} required disabled={loading} /><div className="invalid-feedback">Please enter post code.</div></div>
                        <div className="col-md-6"><label htmlFor="addEmpAddrCountry" className="form-label">Country <span className="text-danger">*</span></label><input type="text" className="form-control" id="addEmpAddrCountry" placeholder="Country" value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} required disabled={loading} /><div className="invalid-feedback">Please enter country.</div></div>
                    </div>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
                      <Link to="/dashboard/employees" className="btn btn-secondary" disabled={loading}>Cancel</Link>
                      <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create New Employee'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddEmployee;