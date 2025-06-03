import React, { useEffect, useState } from "react";
import { useCustomerAuth } from '../../contexts/CustomerAuthContext'; // Import useCustomerAuth
import apiClient from '../../services/apiClient';
import { Alert } from 'react-bootstrap';

const AccountProfile = () => {
    // === Bagian yang sudah ada ===
    useEffect(() => {
        if (window.WOW) {
            new window.WOW().init();
        }
    }, []);

    const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
    const handleAccountDeletion = async (event) => {
        event.preventDefault(); // Mencegah refresh halaman standar form HTML

        console.log("Password yang dimasukkan untuk konfirmasi hapus:", deleteConfirmPassword);

        if (deleteConfirmPassword) {
            alert(`Simulasi: Akun akan dihapus dengan password: ${deleteConfirmPassword}`);
            // Idealnya, tutup modal setelah aksi
            const modalElement = document.getElementById('deleteModal');
            if (modalElement && window.bootstrap) { // Pastikan window.bootstrap ada
                const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement); // Gunakan getInstance
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
                // Membersihkan field setelah modal ditutup oleh Bootstrap bisa menggunakan event listener modal
                modalElement.addEventListener('hidden.bs.modal', () => {
                    setDeleteConfirmPassword('');
                }, { once: true });
            } else {
                setDeleteConfirmPassword(''); // fallback jika modal tidak bisa ditutup secara programatik
            }

        } else {
            alert("Silakan masukkan password Anda.");
        }
    };
    // === Akhir Bagian yang sudah ada ===


    // === BARU DITAMBAHKAN: State untuk Form & Pesan ===
    const { currentUser, setCurrentUser } = useCustomerAuth(); // Ambil currentUser dan setCurrentUser
    const [profileFormData, setProfileFormData] = useState({
        firstName: '',
        lastName: '',
        birthday: '', // Format YYYY-MM-DD untuk input type="date"
        phone: '',
        email: '', // Email biasanya tidak diedit via profil, tapi bisa ditampilkan
        image: '', // Untuk display atau preview avatar
    });
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [profileMessage, setProfileMessage] = useState(null);
    const [profileError, setProfileError] = useState(null);
    const [passwordMessage, setPasswordMessage] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [loadingProfileUpdate, setLoadingProfileUpdate] = useState(false);
    const [loadingPasswordChange, setLoadingPasswordChange] = useState(false);
    // === AKHIR BAGIAN BARU DITAMBAHKAN: State ===


    // === BARU DITAMBAHKAN: useEffect untuk mengisi form dari currentUser ===
    useEffect(() => {
        if (currentUser) {
            // Mengisi profileFormData dari currentUser.detail
            const birthdayFormatted = currentUser.detail?.birthday 
                ? new Date(currentUser.detail.birthday).toISOString().split('T')[0] 
                : ''; // Format ke YYYY-MM-DD
                
            setProfileFormData({
                firstName: currentUser.detail?.first_name || '',
                lastName: currentUser.detail?.last_name || '',
                birthday: birthdayFormatted,
                phone: currentUser.phone || '', // Phone biasanya ada di root currentUser
                email: currentUser.email || '', // Email juga di root currentUser
                image: currentUser.detail?.image || '', // Path image dari detail
            });
        }
    }, [currentUser]); // Bergantung pada currentUser
    // === AKHIR useEffect mengisi form ===


    // === BARU DITAMBAHKAN: Handler untuk perubahan input form ===
    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordFormData(prev => ({ ...prev, [name]: value }));
    };
    // === AKHIR Handler input ===


    // === BARU DITAMBAHKAN: Handler untuk submit form ===
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoadingProfileUpdate(true);
        setProfileMessage(null);
        setProfileError(null);

        try {
            // Data yang akan dikirim ke backend
            const dataToSend = {
                first_name: profileFormData.firstName,
                last_name: profileFormData.lastName,
                phone: profileFormData.phone,
                // Pastikan format tanggal sesuai ekspektasi backend (misal: "2000-01-01" atau "2000-01-01T00:00:00Z")
                birthday: profileFormData.birthday ? new Date(profileFormData.birthday).toISOString() : null, // Konversi ke ISO string atau null
            };
            
            const response = await apiClient.put('/user/profile', dataToSend);

            // Update currentUser di context setelah berhasil
            if (setCurrentUser) {
                 // Asumsi backend mengembalikan objek customer/user yang diperbarui di response.data.customer
                 // dan 'detail' ada di dalamnya
                 const updatedUser = response.data.customer;
                 setCurrentUser(prev => ({
                    ...prev, // Pertahankan properti root yang tidak diupdate (misal: customerID, token, hasAddress)
                    ...updatedUser, // Timpa dengan properti root yang diupdate (misal: email, phone)
                    detail: { // Update objek detail secara terpisah
                        ...prev.detail, // Pertahankan detail yang tidak diupdate
                        first_name: updatedUser.detail?.first_name || prev.detail?.first_name,
                        last_name: updatedUser.detail?.last_name || prev.detail?.last_name,
                        image: updatedUser.detail?.image || prev.detail?.image, // Image mungkin tidak diupdate di sini
                        birthday: updatedUser.detail?.birthday || prev.detail?.birthday,
                    },
                }));
            }
            setProfileMessage("Profil berhasil diperbarui!");
        } catch (error) {
            const msg = error.response?.data?.error || "Gagal memperbarui profil. Silakan coba lagi.";
            setProfileError(msg);
            console.error("Gagal update profil:", error);
        } finally {
            setLoadingProfileUpdate(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoadingPasswordChange(true);
        setPasswordMessage(null);
        setPasswordError(null);

        if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
            setPasswordError("Password baru dan konfirmasi tidak cocok.");
            setLoadingPasswordChange(false);
            return;
        }
        if (passwordFormData.newPassword.length < 6) {
            setPasswordError("Password baru minimal 6 karakter.");
            setLoadingPasswordChange(false);
            return;
        }

        try {
            const response = await apiClient.put('/user/password', {
                current_password: passwordFormData.currentPassword,
                new_password: passwordFormData.newPassword,
            });
            setPasswordMessage(response.data.message || "Password berhasil diubah!");
            setPasswordFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        } catch (error) {
            const msg = error.response?.data?.error || "Gagal mengubah password. Silakan coba lagi.";
            setPasswordError(msg);
            console.error("Gagal ubah password:", error);
        } finally {
            setLoadingPasswordChange(false);
        }
    };

     const formatDisplayDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A'; // Invalid date
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options); // Sesuaikan locale
    };

  return (
    <>
            <div className="col-lg-9 col-md-8">
                <div className="row mb-4">
                    <div className="col-lg-9 col-12">
                        <h1 className="mb-0 h2">Personal Info</h1>
                    </div>
                </div>

                {/* Personal information cards */}
                <div className="row g-4">
                    {/* Basic Info Card */}
                    <div className="col-lg-6 col-12">
                        <div className="card h-100 rounded-0">
                            <div className="card-body d-flex flex-column gap-3 p-4">
                                <div className="d-flex flex-row align-items-center justify-content-between">
                                    <h2 className="mb-0 h5">Basic Info</h2>
                                    <a href="#!" data-bs-toggle="modal" data-bs-target="#basicInfoModal"> {/* Targetkan modal Basic Info */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil text-body-tertiary" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                        </svg>
                                    </a>
                                </div>
                                <div>
                                    <div className="d-flex flex-column gap-2">
                                        <p className="mb-0">{profileFormData.firstName} {profileFormData.lastName}</p>
                                        <p className="mb-0">{formatDisplayDate(profileFormData.birthday)}</p> {/* Tampilkan tanggal lahir */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Card */}
                    <div className="col-lg-6 col-12">
                        <div className="card h-100 rounded-0">
                            <div className="card-body d-flex flex-column gap-3 p-4">
                                <div className="d-flex flex-row align-items-center justify-content-between">
                                    <h2 className="mb-0 h5">Contact</h2>
                                    <a href="#!" data-bs-toggle="modal" data-bs-target="#contactInfoModal"> {/* Targetkan modal Contact Info */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil text-body-tertiary" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                        </svg>
                                    </a>
                                </div>
                                <div>
                                    <div className="d-flex flex-column gap-2">
                                        <p className="mb-0">{profileFormData.email}</p>
                                        <p className="mb-0">{profileFormData.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Password Card */}
                    <div className="col-lg-12 col-12">
                        <div className="card h-100 rounded-0">
                            <div className="card-body d-flex flex-column gap-3 p-4">
                                <div className="d-flex flex-row align-items-center justify-content-between">
                                    <h2 className="mb-0 h5">Edit Password</h2>
                                    <a href="#!" data-bs-toggle="modal" data-bs-target="#passwordModal"> {/* Targetkan modal Password */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil text-body-tertiary" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                        </svg>
                                    </a>
                                </div>
                                <div>
                                    <div className="d-flex flex-column gap-2">
                                        <p className="mb-0">************</p> {/* Tampilkan placeholder */}
                                        <p className="mb-0 text-muted">Last updated: {formatDisplayDate(currentUser?.UpdatedAt)}</p> {/* Opsional: tampilkan kapan terakhir diupdate */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Account Card - Tetap ada di sini, tapi fungsionalitasnya disimulasi */}
                    <div className="col-lg-12 col-12">
                        <div className="card h-100 rounded-0">
                            <div className="card-body d-flex flex-column gap-3 p-4">
                                <div className="d-flex flex-row align-items-center justify-content-between">
                                    <h2 className="mb-0 h5">Delete Account</h2>
                                </div>
                                <div>
                                    <p className="mb-0">Permanently remove your personal account and all of your data.</p>
                                    <p className="mb-0 text-danger">This action cannot be undone.</p>
                                    <button
                                        className="btn btn-danger btn-sm mt-3"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteModal"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MODALS === */}

            {/* Basic Info Modal */}
            <div className="modal fade" id="basicInfoModal" tabIndex="-1" aria-labelledby="basicInfoModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-0">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="basicInfoModalLabel">Edit Basic Info</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {profileMessage && <Alert variant="success">{profileMessage}</Alert>}
                                {profileError && <Alert variant="danger">{profileError}</Alert>}
                                <div className="mb-3">
                                    <label htmlFor="editFirstName" className="form-label">First Name</label>
                                    <input type="text" className="form-control" id="editFirstName" name="firstName" value={profileFormData.firstName} onChange={handleProfileInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editLastName" className="form-label">Last Name</label>
                                    <input type="text" className="form-control" id="editLastName" name="lastName" value={profileFormData.lastName} onChange={handleProfileInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editBirthday" className="form-label">Birthday</label>
                                    <input type="date" className="form-control" id="editBirthday" name="birthday" value={profileFormData.birthday} onChange={handleProfileInputChange} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary rounded-0" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary rounded-0" disabled={loadingProfileUpdate}>
                                    {loadingProfileUpdate ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Contact Info Modal */}
            <div className="modal fade" id="contactInfoModal" tabIndex="-1" aria-labelledby="contactInfoModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-0">
                        <form onSubmit={handleUpdateProfile}> {/* Menggunakan handler yang sama */}
                            <div className="modal-header">
                                <h5 className="modal-title" id="contactInfoModalLabel">Edit Contact Info</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {profileMessage && <Alert variant="success">{profileMessage}</Alert>}
                                {profileError && <Alert variant="danger">{profileError}</Alert>}
                                <div className="mb-3">
                                    <label htmlFor="editEmail" className="form-label">Email</label>
                                    <input type="email" className="form-control" id="editEmail" name="email" value={profileFormData.email} disabled /> {/* Email biasanya tidak diedit */}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="editPhone" className="form-label">Phone</label>
                                    <input type="text" className="form-control" id="editPhone" name="phone" value={profileFormData.phone} onChange={handleProfileInputChange} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary rounded-0" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary rounded-0" disabled={loadingProfileUpdate}>
                                    {loadingProfileUpdate ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Edit Password Modal */}
            <div className="modal fade" id="passwordModal" tabIndex="-1" aria-labelledby="passwordModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-0">
                        <form onSubmit={handleChangePassword}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="passwordModalLabel">Change Password</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {passwordMessage && <Alert variant="success">{passwordMessage}</Alert>}
                                {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                                <div className="mb-3">
                                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                    <input type="password" className="form-control" id="currentPassword" name="currentPassword" value={passwordFormData.currentPassword} onChange={handlePasswordInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="newPassword" className="form-label">New Password</label>
                                    <input type="password" className="form-control" id="newPassword" name="newPassword" value={passwordFormData.newPassword} onChange={handlePasswordInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                                    <input type="password" className="form-control" id="confirmNewPassword" name="confirmNewPassword" value={passwordFormData.confirmNewPassword} onChange={handlePasswordInputChange} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary rounded-0" data-bs-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-primary rounded-0" disabled={loadingPasswordChange}>
                                    {loadingPasswordChange ? 'Changing Password...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal Delete Account (Pastikan modal ini didefinisikan di luar komponen ini atau di root App.jsx) */}
            <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleAccountDeletion}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="deleteModalLabel">Confirm Account Deletion</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                                <div className="mb-3">
                                    <label htmlFor="deletePassword" className="form-label">Enter your password to confirm:</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="deletePassword"
                                        value={deleteConfirmPassword}
                                        onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-danger">Delete My Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountProfile;