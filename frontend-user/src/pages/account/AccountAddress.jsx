import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient'; // Import apiClient
import { useCustomerAuth } from '../../contexts/CustomerAuthContext'; // Import useCustomerAuth
import { Alert } from 'react-bootstrap';

const AccountAddress = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Ambil currentUser dan setCurrentUser dari CustomerAuthContext
    const { currentUser, setCurrentUser } = useCustomerAuth();

    // State untuk menyimpan daftar alamat dari API
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [addressError, setAddressError] = useState(null);
    const [addressMessage, setAddressMessage] = useState(null); // Untuk pesan sukses

    // State untuk mengontrol visibilitas modal (dengan Bootstrap)
    const [isModalOpen, setIsModalOpen] = useState(false); // State ini akan mengontrol Modal Bootstrap secara programatis

    // Initial form data untuk tambah/edit alamat
    const initialFormData = {
        addressID: null, // Menggunakan addressID sesuai model Go (uint)
        title: '',
        street: '', // Sesuaikan dengan field 'Street' di model Go
        additional: '', // Sesuaikan dengan field 'Additional' di model Go
        districtCity: '',
        province: '',
        postCode: '', // Sesuaikan dengan field 'PostCode' di model Go
        isDefault: false, // Sesuaikan dengan field 'IsDefault' di model Go
    };
    const [formData, setFormData] = useState(initialFormData);
    const [loadingSaveAddress, setLoadingSaveAddress] = useState(false); // Loading saat menyimpan alamat

    // Fungsi untuk membuka modal Bootstrap
    const openBootstrapModal = () => {
        const modalElement = document.getElementById('addressFormModal');
        if (modalElement && window.bootstrap) {
            const bootstrapModal = new window.bootstrap.Modal(modalElement);
            bootstrapModal.show();
            setIsModalOpen(true);
        }
    };

    // Fungsi untuk menutup modal Bootstrap
    const closeBootstrapModal = () => {
        const modalElement = document.getElementById('addressFormModal');
        if (modalElement && window.bootstrap) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            // Tambahkan listener untuk membersihkan form setelah modal benar-benar tertutup
            modalElement.addEventListener('hidden.bs.modal', () => {
                setFormData(initialFormData); // Reset form data
                setIsModalOpen(false);
                setAddressError(null); // Bersihkan error saat modal ditutup
                setAddressMessage(null); // Bersihkan pesan saat modal ditutup
            }, { once: true });
        } else {
            setFormData(initialFormData);
            setIsModalOpen(false);
            setAddressError(null);
            setAddressMessage(null);
        }
    };

    // Fungsi untuk mengambil alamat dari backend
    const fetchAddresses = useCallback(async () => {
        setLoadingAddresses(true);
        setAddressError(null);
        try {
            // Asumsi API GET /user/addresses mengembalikan array alamat di properti 'addresses'
            const response = await apiClient.get('/user/addresses');
            const fetchedAddresses = response.data.addresses || [];
            setAddresses(fetchedAddresses);

            // Setelah fetch alamat, perbarui hasAddress di currentUser jika perlu
            // Ini menjaga konsistensi hasAddress di context
            if (currentUser && setCurrentUser) { // Pastikan setCurrentUser tersedia
                const currentHasAddress = currentUser.hasAddress || false;
                const newHasAddress = fetchedAddresses.length > 0;
                if (currentHasAddress !== newHasAddress) {
                    setCurrentUser(prev => ({
                        ...prev,
                        hasAddress: newHasAddress
                    }));
                }
            }
        } catch (error) {
            console.error("Gagal mengambil alamat:", error.response?.data?.error || error.message);
            setAddressError("Gagal memuat alamat. Silakan coba lagi.");
            setAddresses([]); // Kosongkan alamat jika gagal
            if (currentUser && setCurrentUser) {
                setCurrentUser(prev => ({ ...prev, hasAddress: false }));
            }
        } finally {
            setLoadingAddresses(false);
        }
    }, [currentUser, setCurrentUser]); // Dependensi: currentUser dan setCurrentUser

    // useEffect untuk memicu fetchAddresses dan membuka modal otomatis
    useEffect(() => {
        fetchAddresses(); // Panggil fetch saat komponen dimuat

        // Logika untuk membuka modal secara otomatis dari state navigasi (setelah login)
        if (location.state?.openAddAddressModal) {
            prepareModalData(); // Siapkan form untuk alamat baru
            setTimeout(() => {
                openBootstrapModal();
            }, 100); // Penundaan kecil untuk memastikan modal sudah ada di DOM
            // Hapus state dari URL setelah digunakan agar tidak terbuka lagi saat refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [fetchAddresses, location.state, navigate]); // Dependensi

    // Menyiapkan data form modal (untuk tambah atau edit)
    const prepareModalData = (addressToEdit = null) => {
        if (addressToEdit) {
            // Mengisi formData dengan data alamat yang akan diedit
            setFormData({
                addressID: addressToEdit.AddressID, // Sesuaikan dengan AddressID dari backend
                title: addressToEdit.Title,
                street: addressToEdit.Street,
                additional: addressToEdit.Additional,
                districtCity: addressToEdit.DistrictCity,
                province: addressToEdit.Province,
                postCode: addressToEdit.PostCode,
                isDefault: addressToEdit.IsDefault,
            });
        } else {
            // Mengatur form untuk alamat baru
            setFormData({ ...initialFormData, title: 'Alamat Baru' });
        }
        // Pastikan modal terbuka saat prepareData dipanggil dari tombol manual
        if (!isModalOpen) {
            openBootstrapModal();
        }
    };

    // Handler perubahan input form modal
    const handleFormInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handler saat form modal disubmit (tambah atau edit alamat)
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setLoadingSaveAddress(true);
        setAddressError(null);
        setAddressMessage(null); // Reset pesan

        try {
            const dataToSave = {
                title: formData.title,
                street: formData.street,
                additional: formData.additional,
                district_city: formData.districtCity, // Sesuaikan dengan snake_case di backend
                province: formData.province,
                post_code: formData.postCode, // Sesuaikan dengan snake_case di backend
                is_default: formData.isDefault, // Sesuaikan dengan snake_case di backend
            };

            if (formData.addressID) {
                // UPDATE ALAMAT: Panggil API PUT /user/addresses/:id
                const response = await apiClient.put(`/user/addresses/${formData.addressID}`, dataToSave);
                setAddressMessage(response.data.message || "Alamat berhasil diperbarui!");
            } else {
                // TAMBAH ALAMAT BARU: Panggil API POST /user/addresses
                const response = await apiClient.post('/user/addresses', dataToSave);
                setAddressMessage(response.data.message || "Alamat berhasil ditambahkan!");
            }
            closeBootstrapModal(); // Tutup modal setelah berhasil
            fetchAddresses(); // Refresh daftar alamat setelah operasi sukses
        } catch (error) {
            console.error("Gagal menyimpan alamat:", error.response?.data?.error || error.message);
            const msg = error.response?.data?.error || "Gagal menyimpan alamat. Silakan coba lagi.";
            setAddressError(msg);
        } finally {
            setLoadingSaveAddress(false);
        }
    };

    return (
        <>
            <div className="col-lg-9 col-md-8">
                <div className="row g-3 mb-4 align-items-center">
                    <div className="col-xl-9 col-md-6 col-4">
                        <h1 className="mb-0 h2">Addresses</h1>
                    </div>
                    <div className="col-xl-3 col-md-6 col-8 text-end">
                        <a
                            href="#!"
                            className="btn btn-outline-dark rounded-0"
                            data-bs-toggle="modal"
                            data-bs-target="#addressFormModal"
                            onClick={() => prepareModalData()} // Panggil prepareModalData untuk tambah
                        >
                            + Add address
                        </a>
                    </div>
                </div>

                {addressMessage && <Alert variant="success">{addressMessage}</Alert>}
                {addressError && <Alert variant="danger">{addressError}</Alert>}

                {loadingAddresses ? (
                        <p>Loading addresses...</p>
                    ) : addresses.length === 0 ? (
                        <div className="alert alert-info" role="alert">
                            You don't have any address yet.
                        </div>
                    ) : (
                    <div className="row g-4">
                        {addresses.map((address) => (
                            <div className="col-lg-6 col-12" key={address.AddressID}> {/* Menggunakan AddressID sebagai key */}
                                <div className="card h-100 rounded-0">
                                    <div className="card-body d-flex flex-column gap-3 p-4">
                                        <div className="d-flex flex-row align-items-center justify-content-between">
                                            <div className="d-flex flex-row gap-3 align-items-center">
                                                <h2 className="mb-0 h5">{address.Title}</h2>
                                                {address.IsDefault && ( // Sesuaikan dengan IsDefault dari backend
                                                    <span>
                                                        <span className="badge text-bg-info">Primary</span>
                                                    </span>
                                                )}
                                            </div>
                                            <a
                                                href="#!"
                                                data-bs-toggle="modal"
                                                data-bs-target="#addressFormModal"
                                                onClick={() => prepareModalData(address)} // Panggil prepareModalData untuk edit
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-pencil text-body-tertiary"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                                </svg>
                                            </a>
                                        </div>
                                        <div>
                                            <address className="mb-0">
                                                {address.Street} <br /> {/* Sesuaikan dengan Street dari backend */}
                                                {address.Additional && <>{address.Additional}<br /></>} {/* Sesuaikan dengan Additional dari backend */}
                                                {address.DistrictCity}, {address.Province} {address.PostCode} {/* Sesuaikan dengan PostCode dari backend */}
                                                <br />
                                                
                                            </address>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL FORM UNTUK TAMBAH/EDIT ALAMAT */}
            <div className="modal fade" id="addressFormModal" tabIndex="-1" aria-labelledby="addressFormModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content rounded-0">
                        <form onSubmit={handleSaveChanges}>
                            <div className="modal-header">
                                <h5 className="modal-title" id="addressFormModalLabel">
                                    {formData.addressID ? 'Edit Address' : 'Add New Address'}
                                </h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {addressError && <Alert variant="danger">{addressError}</Alert>}
                                {addressMessage && <Alert variant="success">{addressMessage}</Alert>}
                                <div className="mb-3">
                                    <label htmlFor="formTitle" className="form-label">Address Title <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="formTitle"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="formStreet" className="form-label">Street Address <span className="text-danger">*</span></label> {/* Ganti AddressFull jadi Street */}
                                    <textarea
                                        className="form-control"
                                        id="formStreet"
                                        name="street" // Ganti name jadi 'street'
                                        rows="3"
                                        value={formData.street}
                                        onChange={handleFormInputChange}
                                        required
                                    ></textarea>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="formAdditional"
                                            name="additional" // Ganti name jadi 'additional'
                                            placeholder="Additional Info (Block/Unit No, Benchmark)"
                                            value={formData.additional}
                                            onChange={handleFormInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="formDistrictCity"
                                            name="districtCity"
                                            placeholder="District/City *"
                                            value={formData.districtCity}
                                            onChange={handleFormInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="formProvince"
                                            name="province"
                                            placeholder="Province *"
                                            value={formData.province}
                                            onChange={handleFormInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="formPostCode"
                                            name="postCode" // Ganti name jadi 'postCode'
                                            placeholder="Postcode *"
                                            value={formData.postCode}
                                            onChange={handleFormInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-1 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="formIsDefault" // Ganti id jadi 'formIsDefault'
                                        name="isDefault" // Ganti name jadi 'isDefault'
                                        checked={formData.isDefault}
                                        onChange={handleFormInputChange}
                                    />
                                    <label className="form-check-label" htmlFor="formIsDefault">Set as primary address</label>
                                </div>
                            </div>
                            <div className="mb-1 modal-footer">
                                <button type="submit" className="btn btn-primary rounded-0 w-100" disabled={loadingSaveAddress}>
                                    {loadingSaveAddress ? (formData.addressID ? 'Saving Changes...' : 'Saving Address...') : (formData.addressID ? 'Save Changes' : 'Save Address')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountAddress;