import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; 

const EditEmployee = () => {
  const { employeeId: paramEmployeeId } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [departmentsOptions, setDepartmentsOptions] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentsError, setDepartmentsError] = useState('');

  const [employeeIdDisplay, setEmployeeIdDisplay] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(''); 
  const [role, setRole] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [status, setStatus] = useState('active');
  const [currentImagePath, setCurrentImagePath] = useState(''); 

  const [addressStreet, setAddressStreet] = useState('');
  const [addressDistrictCity, setAddressDistrictCity] = useState(''); 
  const [addressProvince, setAddressProvince] = useState('');
  const [addressPostCode, setAddressPostCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('');

  const [avatarPreview, setAvatarPreview] = useState('/assets/images/docs/placeholder-img.jpg');
  const [avatarFile, setAvatarFile] = useState(null);
  const [validated, setValidated] = useState(false);

  const defaultAvatar = '/assets/images/avatar/default-avatar.png';
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return defaultAvatar;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${backendAssetBaseUrl}/${cleanPath}`;
  }, [backendAssetBaseUrl, defaultAvatar]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) { return ''; }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token) {
        setDepartmentsError("Autentikasi dibutuhkan."); setLoadingDepartments(false); return;
      }
      setLoadingDepartments(true); setDepartmentsError('');
      try {
        const response = await api.get('/admin/departments/list', { headers: { Authorization: `Bearer ${token}` } });
        setDepartmentsOptions(response.data.departments || []);
      } catch (err) {
        if (err.response && err.response.status === 401) { setDepartmentsError("Sesi tidak valid."); logout(); navigate('/dashboard/login', {replace: true}); }
        else { setDepartmentsError(err.response?.data?.error || "Gagal memuat departemen."); }
      } finally { setLoadingDepartments(false); }
    };
    fetchDepartments();
  }, [token, navigate, logout]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!paramEmployeeId || !token) {
        setErrorMessage("Employee ID tidak valid atau Anda tidak terautentikasi.");
        setLoadingData(false);
        if (!token) navigate('/dashboard/login', { replace: true });
        return;
      }
      setLoadingData(true); setErrorMessage('');
      try {
        const response = await api.get(`/admin/employees/${paramEmployeeId}`, { headers: { Authorization: `Bearer ${token}` } });
        const emp = response.data.employee || response.data; 
        if (emp) {
          setEmployeeIdDisplay(emp.EmployeeID);
          setFullName(emp.FullName || '');
          setEmail(emp.Email || '');
          setPhone(emp.Phone || '');
          setBirthDate(formatDateForInput(emp.Birthday));
          setSelectedDepartmentId(emp.Department || ''); 
          setRole(emp.Role || '');
          setJoinDate(formatDateForInput(emp.JoinDate));
          setStatus(emp.Status || 'active');
          setCurrentImagePath(emp.Image || '');
          setAvatarPreview(getImageUrl(emp.Image));
          if (emp.Address) {
            setAddressStreet(emp.Address.Street || '');
            setAddressDistrictCity(emp.Address.DistrictCity || '');
            setAddressProvince(emp.Address.Province || '');
            setAddressPostCode(emp.Address.PostCode || '');
            setAddressCountry(emp.Address.Country || '');
          }
        } else { setErrorMessage(`Employee dengan ID ${paramEmployeeId} tidak ditemukan.`); }
      } catch (err) {
        if (err.response && err.response.status === 401) { setErrorMessage('Sesi tidak valid.'); logout(); navigate('/dashboard/login', {replace: true}); }
        else { setErrorMessage(err.response?.data?.error || `Gagal mengambil data employee ${paramEmployeeId}.`); }
        console.error("Fetch employee data error:", err);
      } finally { setLoadingData(false); }
    };
    if (paramEmployeeId) { 
        fetchEmployeeData();
    }
  }, [paramEmployeeId, token, navigate, logout, getImageUrl]);


  useEffect(() => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      const currentPreview = avatarPreview;
      return () => URL.revokeObjectURL(currentPreview);
    }
  }, [avatarPreview]);

  const handleAvatarChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarPreview(getImageUrl(currentImagePath));
    }
  };

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
        setErrorMessage("Autentikasi dibutuhkan..."); logout(); navigate('/dashboard/login', {replace: true}); setLoading(false); return;
    }

    const formDataPayload = new FormData();
    if (avatarFile) { 
      formDataPayload.append('imageFile', avatarFile);
    }

    const employeeDataForUpdate = {
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
        district_city: addressDistrictCity,
        province: addressProvince,
        post_code: addressPostCode,
        country: addressCountry,
      },
    };
    formDataPayload.append('jsonData', JSON.stringify(employeeDataForUpdate));

    try {
      const response = await api.put(`/admin/employees/${paramEmployeeId}`, formDataPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(response.data.message || 'Employee berhasil diupdate!');
      if (response.data.employee && response.data.employee.Image) {
        setCurrentImagePath(response.data.employee.Image);
        setAvatarPreview(getImageUrl(response.data.employee.Image));
      }
      setAvatarFile(null);
      setValidated(false);
    } catch (err) {
      if (err.response && err.response.status === 401) { setErrorMessage('Sesi tidak valid.'); logout(); navigate('/dashboard/login', {replace: true});}
      else { setErrorMessage(err.response?.data?.error || 'Gagal mengupdate employee.'); }
      console.error('Update employee error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <main className="main-content-wrapper"><div className="container text-center p-5">Memuat data employee...</div></main>
    );
  }

  if (errorMessage && !fullName && !loadingData) {
      return (
          <main className="main-content-wrapper">
              <div className="container">
                  <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>
                  <Link to="/dashboard/employees" className="btn btn-secondary">Kembali ke Daftar Employee</Link>
              </div>
          </main>
      );
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div>
              <h2>Edit Employee <span className="text-muted fs-5">({employeeIdDisplay || '...'})</span></h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/dashboard/employees" className="text-inherit">Employees</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Edit Employee</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
            {errorMessage && !loadingData && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            {departmentsError && <div className="alert alert-warning" role="alert">{departmentsError}</div>}

            <form className={`needs-validation ${validated ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
              <div className="card shadow border-0">
                <div className="card-body d-flex flex-column gap-8 p-7">
                  <div className="d-flex flex-column flex-md-row align-items-center file-input-wrapper gap-2">
                    <div><img className="image avatar avatar-lg rounded-3" src={avatarPreview} alt="Employee Avatar" /></div>
                    <div className="file-upload btn btn-light ms-md-4">
                      <input type="file" className="file-input opacity-0" id="employeeAvatarUpload" 
                        onChange={handleAvatarChange} accept="image/jpeg, image/png, image/gif" disabled={loading || loadingData} />
                      <label htmlFor="employeeAvatarUpload" style={{ cursor: 'pointer' }}>Change Photo</label>
                    </div>
                    <span className="ms-md-2 text-muted">JPG, PNG. Max 2MB.</span>
                  </div>
                  <div className="d-flex flex-column gap-4">
                    <h3 className="mb-0 h6">Employee Information</h3>
                    <div className="row g-3">
                      <div className="col-lg-6 col-12">
                        <div><label htmlFor="editEmployeeId" className="form-label">Employee ID</label>
                          <input type="text" className="form-control" id="editEmployeeId" value={employeeIdDisplay} readOnly disabled style={{ backgroundColor: '#e9ecef' }} />
                        </div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <div><label htmlFor="editEmployeeName" className="form-label">Full Name <span className="text-danger">*</span></label>
                          <input type="text" className="form-control" id="editEmployeeName" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={loading || loadingData} />
                          <div className="invalid-feedback">Please enter full name.</div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <div><label htmlFor="editEmployeeEmail" className="form-label">Email <span className="text-danger">*</span></label>
                          <input type="email" className="form-control" id="editEmployeeEmail" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading || loadingData} />
                          <div className="invalid-feedback">Please enter a valid email.</div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <div><label htmlFor="editEmployeePhone" className="form-label">Phone <span className="text-danger">*</span></label>
                          <input type="text" className="form-control" id="editEmployeePhone" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading || loadingData} />
                          <div className="invalid-feedback">Please enter phone number.</div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label className="form-label" htmlFor="editEmployeeBirthDate">Birthday <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" id="editEmployeeBirthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required disabled={loading || loadingData} />
                        <div className="invalid-feedback">Please enter birth date.</div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label className="form-label" htmlFor="editEmployeeJoinDate">Join Date <span className="text-danger">*</span></label>
                        <input type="date" className="form-control" id="editEmployeeJoinDate" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required disabled={loading || loadingData} />
                        <div className="invalid-feedback">Please enter join date.</div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label htmlFor="editEmployeeDepartment" className="form-label">Department <span className="text-danger">*</span></label>
                        <select className="form-select" id="editEmployeeDepartment" value={selectedDepartmentId} onChange={(e) => setSelectedDepartmentId(e.target.value)} required disabled={loading || loadingData || loadingDepartments}>
                          <option value="">{loadingDepartments ? 'Loading...' : 'Select Department'}</option>
                          {departmentsOptions.map(dept => (
                            <option key={dept.DepartmentID} value={dept.DepartmentID}>{dept.DepartmentName}</option>
                          ))}
                        </select>
                        <div className="invalid-feedback">{departmentsError ? departmentsError : 'Please select a department.'}</div>
                      </div>
                      <div className="col-lg-6 col-12">
                        <label htmlFor="editEmployeeRole" className="form-label">Role <span className="text-danger">*</span></label>
                        <select className="form-select" id="editEmployeeRole" value={role} onChange={(e) => setRole(e.target.value)} required disabled={loading || loadingData}>
                          <option value="">Select Role</option>
                          <option value="Admin HR">Admin HR</option>
                          <option value="Staff">Staff</option>
                        </select>
                        <div className="invalid-feedback">Please select a role.</div>
                      </div>
                      <div className="mb-3 col-lg-6 col-12">
                        <label className="form-label d-block">Status <span className="text-danger">*</span></label>
                        <div className="form-check form-check-inline"><input className="form-check-input" type="radio" name="editEmployeeStatusRadio" id="statusActiveEdit" value="active" checked={status === 'active'} onChange={(e) => setStatus(e.target.value)} disabled={loading||loadingData} /><label className="form-check-label" htmlFor="statusActiveEdit">Active</label></div>
                        <div className="form-check form-check-inline"><input className="form-check-input" type="radio" name="editEmployeeStatusRadio" id="statusInactiveEdit" value="inactive" checked={status === 'inactive'} onChange={(e) => setStatus(e.target.value)} disabled={loading||loadingData} /><label className="form-check-label" htmlFor="statusInactiveEdit">Inactive</label></div>
                        <div className="form-check form-check-inline"><input className="form-check-input" type="radio" name="editEmployeeStatusRadio" id="statusOnleaveEdit" value="on_leave" checked={status === 'on_leave'} onChange={(e) => setStatus(e.target.value)} disabled={loading||loadingData} /><label className="form-check-label" htmlFor="statusOnleaveEdit">On Leave</label></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-column gap-4">
                    <h3 className="mb-0 h6">Address Information</h3>
                    <div className="row g-3">
                        <div className="col-12"><label htmlFor="editEmpAddrStreet" className="form-label">Street <span className="text-danger">*</span></label><input type="text" className="form-control" id="editEmpAddrStreet" placeholder="Street Address" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} required disabled={loading||loadingData} /><div className="invalid-feedback">Please enter street.</div></div>
                        <div className="col-md-6"><label htmlFor="editEmpAddrCity" className="form-label">District/City <span className="text-danger">*</span></label><input type="text" className="form-control" id="editEmpAddrCity" placeholder="District/City" value={addressDistrictCity} onChange={(e) => setAddressDistrictCity(e.target.value)} required disabled={loading||loadingData} /><div className="invalid-feedback">Please enter district/city.</div></div>
                        <div className="col-md-6"><label htmlFor="editEmpAddrProvince" className="form-label">Province <span className="text-danger">*</span></label><input type="text" className="form-control" id="editEmpAddrProvince" placeholder="Province" value={addressProvince} onChange={(e) => setAddressProvince(e.target.value)} required disabled={loading||loadingData} /><div className="invalid-feedback">Please enter province.</div></div>
                        <div className="col-md-6"><label htmlFor="editEmpAddrPostCode" className="form-label">Post Code <span className="text-danger">*</span></label><input type="text" className="form-control" id="editEmpAddrPostCode" placeholder="Post Code" value={addressPostCode} onChange={(e) => setAddressPostCode(e.target.value)} required disabled={loading||loadingData} /><div className="invalid-feedback">Please enter post code.</div></div>
                        <div className="col-md-6"><label htmlFor="editEmpAddrCountry" className="form-label">Country <span className="text-danger">*</span></label><input type="text" className="form-control" id="editEmpAddrCountry" placeholder="Country" value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} required disabled={loading||loadingData} /><div className="invalid-feedback">Please enter country.</div></div>
                    </div>
                  </div>
                  
                  <div className="col-12 mt-4">
                    <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
                      <Link to="/dashboard/employees" className="btn btn-secondary" disabled={loading || loadingData}>Cancel</Link>
                      <button className="btn btn-primary" type="submit" disabled={loading || loadingData}>
                        {loading ? 'Saving...' : 'Save Changes'}
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

export default EditEmployee;