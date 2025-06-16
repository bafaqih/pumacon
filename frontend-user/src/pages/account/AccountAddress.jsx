import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import apiClient from '../../services/apiClient';
import { Alert, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';

const AccountAddress = () => {
    const location = useLocation(); 
    const navigate = useNavigate();
    const { currentUser, token, logout, fetchUserDetails, isAuthLoading } = useCustomerAuth();

    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [pageError, setPageError] = useState(null); 
    const [actionMessage, setActionMessage] = useState(null); 

    const initialFormData = {
        AddressID: 0, 
        Title: '',
        Street: '',
        Additional: '',
        DistrictCity: '',
        Province: '',
        PostCode: '',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [validated, setValidated] = useState(false);

    const openBootstrapModal = () => {
        const modalElement = document.getElementById('addressFormModal');
        if (modalElement && window.bootstrap) {
            try {
                const bootstrapModal = new window.bootstrap.Modal(modalElement);
                bootstrapModal.show();
            } catch (e) { console.error("Error showing Bootstrap modal:", e); }
        }
    };

    const closeBootstrapModal = () => {
        const modalElement = document.getElementById('addressFormModal');
        if (modalElement && window.bootstrap) {
            try {
                const bootstrapModal = window.bootstrap.Modal.getInstance(modalElement);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            } catch (e) { console.error("Error hiding Bootstrap modal:", e); }
        }
        setFormData(initialFormData);
        setIsEditMode(false);
        setValidated(false);
    };
    
    useEffect(() => {
        const modalElement = document.getElementById('addressFormModal');
        if (modalElement) {
            const handleModalHidden = () => {
                setFormData(initialFormData);
                setIsEditMode(false);
                setValidated(false);
            };
            modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
            return () => {
                modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
            };
        }
    }, []);

    const fetchCustomerAddresses = useCallback(async () => {
        if (!token || !currentUser?.customerID) {
            console.log("[AccountAddress] fetchCustomerAddresses: Skip, token atau CustomerID belum siap.", { hasToken: !!token, hasCustomerID: !!currentUser?.customerID });
            setLoadingAddresses(false); 
            setAddresses([]);
            return;
        }

        console.log(`[AccountAddress] fetchCustomerAddresses: Memulai fetch untuk CustomerID: ${currentUser.CustomerID}`);
        setLoadingAddresses(true);
        setActionMessage(null); 
        try {
            const response = await apiClient.get('/user/addresses', { 
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedData = response.data.addresses || [];
            console.log("[AccountAddress] fetchCustomerAddresses - Data diterima:", fetchedData);
            setAddresses(fetchedData);
        } catch (error) {
            console.error("Failed to fetch addresses:", error.response?.data?.error || error.message);
            const errorMsg = error.response?.data?.error || "Failed to load your addresses. Please try again.";
            setActionMessage({ type: 'danger', text: errorMsg });
            setAddresses([]);
            if (error.response && error.response.status === 401) {
                logout(); 
                navigate('/login', {replace: true}); 
            }
        } finally {
            setLoadingAddresses(false);
            console.log("[AccountAddress] fetchCustomerAddresses: Selesai.");
        }
    }, [token, currentUser?.customerID, logout, navigate]);

    useEffect(() => {
        console.log("[AccountAddress] useEffect dependencies changed: isAuthLoading:", isAuthLoading, "currentUser exists:", !!currentUser, "token exists:", !!token);
        if (!isAuthLoading && token && currentUser?.customerID) {
            console.log("[AccountAddress] useEffect: Kondisi terpenuhi, memanggil fetchCustomerAddresses.");
            fetchCustomerAddresses();
        } else if (!isAuthLoading && !token) {
            console.log("[AccountAddress] useEffect: Tidak ada token, set loadingAddresses false.");
            setLoadingAddresses(false);
            setAddresses([]); 
        } else if (!isAuthLoading && token && !currentUser?.customerID) {
            console.warn("[AccountAddress] useEffect: Token ada, tapi CustomerID tidak ada di currentUser. Alamat tidak diambil.");
            setLoadingAddresses(false);
            setAddresses([]);
            setActionMessage({ type: 'warning', text: "Could not verify user details to fetch addresses." });
        }
    }, [isAuthLoading, currentUser, token, fetchCustomerAddresses]);
    useEffect(() => {
        if (location.state?.openAddAddressModal && currentUser) {
            handleShowModalForAdd();
            navigate(location.pathname, { replace: true, state: {} }); 
        }
    }, [location.state, navigate, currentUser]);


    const handleShowModalForAdd = () => {
        setFormData({ ...initialFormData }); 
        setIsEditMode(false);
        setActionMessage(null); 
        setValidated(false);
        openBootstrapModal();
    };

    const handleShowModalForEdit = (address) => {
        setFormData({
            AddressID: address.AddressID,
            Title: address.Title || '',
            Street: address.Street || '',
            Additional: address.Additional || '',
            DistrictCity: address.DistrictCity || '',
            Province: address.Province || '',
            PostCode: address.PostCode || '',
        });
        setIsEditMode(true);
        setActionMessage(null); 
        setValidated(false);
        openBootstrapModal();
    };

    const handleFormInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmitAddress = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setValidated(true);

        if (form.checkValidity() === false) {
            e.stopPropagation();
            return;
        }

        setLoadingModal(true);
        setActionMessage(null); 

        const payload = {
            title: formData.Title,
            street: formData.Street,
            additional: formData.Additional,
            district_city: formData.DistrictCity,
            province: formData.Province,
            post_code: formData.PostCode,
        };

        try {
            let response;
            if (isEditMode && formData.AddressID) {
                response = await apiClient.put(`/user/addresses/${formData.AddressID}`, payload, { headers: { Authorization: `Bearer ${token}` }});
            } else {
                response = await apiClient.post('/user/addresses', payload, { headers: { Authorization: `Bearer ${token}` }});
            }
            setActionMessage({ type: 'success', text: response.data.message || "Operation successful!" });
            closeBootstrapModal(); 
            console.log("[AccountAddress] handleSubmitAddress: Operasi alamat sukses, memanggil fetchCustomerAddresses untuk refresh.");
            await fetchCustomerAddresses();
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to save address.";
            setActionMessage({ type: 'danger', text: msg, context: 'modal' });
            if (error.response?.status === 401) { logout(); navigate('/login', {replace: true});}
        } finally {
            setLoadingModal(false);
        }
    };
    

    if (isAuthLoading) { 
        return <div className="container p-5 text-center">Initializing session...</div>;
    }
    if (!currentUser && !token) { 
        navigate('/login', {replace: true});
        return null; 
    }
    if (!currentUser && token) { 
        return <div className="container p-5 text-center">Loading user data... (currentUser is null)</div>;
    }
    if (pageError) { 
        return <div className="container p-5"><Alert variant="danger">{pageError}</Alert></div>;
    }

    return (
        <>
            <div className="col-lg-9 col-md-8 col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0 h2">Addresses</h1>
                    <Button variant="dark" className="rounded-0" onClick={handleShowModalForAdd}>
                        <i className="bi bi-plus-lg me-2"></i>Add New Address
                    </Button>
                </div>

                {actionMessage && actionMessage.context !== 'modal' && (
                    <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible>
                        {actionMessage.text}
                    </Alert>
                )}

                {loadingAddresses ? (
                    <p className="text-center">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                    <Alert variant="info">You don't have any saved addresses yet. Click "Add New Address" to get started.</Alert>
                ) : (
                    <Row className="g-4">
                        {addresses.map((address) => (
                            <Col lg={6} xs={12} key={address.AddressID}>
                                <Card className="h-100 rounded-0">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between mb-2">
                                            <Card.Title as="h5" className="mb-0 text-truncate">
                                                {address.Title}
                                            </Card.Title>
                                            <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="me-1 p-1 text-body-tertiary" 
                                                    onClick={() => handleShowModalForEdit(address)}
                                                    title="Edit Address" 
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                                    </svg>
                                                </Button>
                                        </div>
                                        <address className="mb-0 small flex-grow-1">
                                            {address.Street}<br />
                                            {address.Additional && <>{address.Additional}<br /></>}
                                            {address.DistrictCity}, {address.Province} {address.PostCode}
                                        </address>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            <div className="modal fade" id="addressFormModal" tabIndex="-1" aria-labelledby="addressFormModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content rounded-0">
                        <Form noValidate validated={validated} onSubmit={handleSubmitAddress}>
                            <Modal.Header closeButton onHide={closeBootstrapModal}>
                                <Modal.Title id="addressFormModalLabel">
                                    {isEditMode ? 'Edit Address' : 'Add New Address'}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {actionMessage && actionMessage.context === 'modal' && 
                                    <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible>
                                        {actionMessage.text}
                                    </Alert>
                                }
                                
                                <Form.Group className="mb-3" controlId="formAddressTitle">
                                    <Form.Label>Address Title <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" placeholder="e.g., Home, Office" name="Title" value={formData.Title} onChange={handleFormInputChange} required disabled={loadingModal}/>
                                    <Form.Control.Feedback type="invalid">Address title is required.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formAddressStreet">
                                    <Form.Label>Street Address <span className="text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={2} placeholder="Street name, building number" name="Street" value={formData.Street} onChange={handleFormInputChange} required disabled={loadingModal}/>
                                    <Form.Control.Feedback type="invalid">Street address is required.</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formAddressAdditional">
                                    <Form.Label>Additional Info (Optional)</Form.Label>
                                    <Form.Control type="text" placeholder="e.g., Block A1, Unit 2, Landmark" name="Additional" value={formData.Additional} onChange={handleFormInputChange} disabled={loadingModal}/>
                                </Form.Group>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="formAddressDistrictCity">
                                            <Form.Label>District/City <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="District/City" name="DistrictCity" value={formData.DistrictCity} onChange={handleFormInputChange} required disabled={loadingModal}/>
                                            <Form.Control.Feedback type="invalid">District/City is required.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="formAddressProvince">
                                            <Form.Label>Province <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Province" name="Province" value={formData.Province} onChange={handleFormInputChange} required disabled={loadingModal}/>
                                            <Form.Control.Feedback type="invalid">Province is required.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6} className="mb-3"> 
                                        <Form.Group controlId="formAddressPostCode">
                                            <Form.Label>Post Code <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" placeholder="Post Code" name="PostCode" value={formData.PostCode} onChange={handleFormInputChange} required disabled={loadingModal}/>
                                            <Form.Control.Feedback type="invalid">Post Code is required.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={closeBootstrapModal} disabled={loadingModal} className="rounded-0">Cancel</Button>
                                <Button variant="primary" type="submit" disabled={loadingModal} className="rounded-0">
                                    {loadingModal ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Address')}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountAddress;