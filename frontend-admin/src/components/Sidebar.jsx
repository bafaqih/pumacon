import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';


const SidebarNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const isParentActive = (childBasePaths) => {
        return childBasePaths.some(basePath => currentPath.startsWith(basePath));
    };

    const productsBasePaths = ['/dashboard/products'];
    const ordersBasePaths = ['/dashboard/orders'];
    const customersBasePaths = ['/dashboard/customers'];
    const employeesBasePaths = ['/dashboard/employees'];
    const categoriesBasePaths = ['/dashboard/product-categories'];
    const newsBasePaths = ['/dashboard/news'];
    const departmentsBasePaths = ['/dashboard/departments'];
    const categoriesNewsBasePaths = ['/dashboard/news-categories'];

    const isProductsActive = isParentActive(productsBasePaths);
    const isOrdersActive = isParentActive(ordersBasePaths);
    const isCustomersActive = isParentActive(customersBasePaths);
    const isEmployeesActive = isParentActive(employeesBasePaths);
    const isDepartmentsActive = isParentActive(departmentsBasePaths);
    const isNewsActive = isParentActive(newsBasePaths);

    return (
        <ul className="navbar-nav flex-column" id="sideNavbar">
            <div className="sticky-top bg-white z-1 pt-2">
                <li className="nav-item">
                    <NavLink className="nav-link" to="/dashboard" end>
                        <div className="d-flex align-items-center">
                            <span className="nav-link-icon"><i className="bi bi-house"></i></span>
                            <span className="nav-link-text">Dashboard</span>
                        </div>
                    </NavLink>
                </li>
            </div>
            <li className="nav-item mt-6 mb-3"><span className="nav-label">Store Managements</span></li>
            <li className="nav-item">
                <a
                    className={`nav-link ${!isProductsActive ? 'collapsed' : ''}`}
                    href="#"
                    data-bs-toggle="collapse"
                    data-bs-target="#navProducts"
                    aria-expanded={isProductsActive ? 'true' : 'false'}
                    aria-controls="navProducts"
                >
                    <div className="d-flex align-items-center">
                        <span className="nav-link-icon"><i className="bi bi-cart"></i></span>
                        <span className="nav-link-text">Products</span>
                    </div>
                </a>
                <div
                    id="navProducts"
                    className={`collapse ${isProductsActive ? 'show' : ''}`}
                    data-bs-parent="#sideNavbar"
                >
                    <ul className="nav flex-column">
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/products" end>Product List</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/products/add-product">Add Product</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/products/categories" end>Category List</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/products/categories/add-category">Add Category</NavLink></li>
                    </ul>
                </div>
            </li>

            <li className="nav-item">
                <a
                    className={`nav-link ${!isOrdersActive ? 'collapsed' : ''}`}
                    href="#"
                    data-bs-toggle="collapse"
                    data-bs-target="#navOrders"
                    aria-expanded={isOrdersActive ? 'true' : 'false'}
                    aria-controls="navOrders"
                >
                    <div className="d-flex align-items-center">
                        <span className="nav-link-icon"><i className="bi bi-shop"></i></span>
                        <span className="nav-link-text">Orders</span>
                    </div>
                </a>
                <div
                    id="navOrders"
                    className={`collapse ${isOrdersActive ? 'show' : ''}`}
                    data-bs-parent="#sideNavbar"
                >
                    <ul className="nav flex-column">
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/orders" end>Order List</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/orders/history">Order History</NavLink></li>
                    </ul>
                </div>
            </li>

            {/* Customers */}
            <li className="nav-item">
                <NavLink className="nav-link" to="/dashboard/customers">
                    <div className="d-flex align-items-center">
                        <span className="nav-link-icon"><i className="bi bi-people"></i></span>
                        <span className="nav-link-text">Customers</span>
                    </div>
                </NavLink>
            </li>

            <li className="nav-item mt-6 mb-3"><span className="nav-label">Organization</span></li>

            {/* Employees Dropdown */}
            <li className="nav-item">
                <a
                    className={`nav-link ${!isEmployeesActive ? 'collapsed' : ''}`}
                    href="#"
                    data-bs-toggle="collapse"
                    data-bs-target="#navEmployees"
                    aria-expanded={isEmployeesActive ? 'true' : 'false'}
                    aria-controls="navEmployees"
                >
                    <div className="d-flex align-items-center">
                        <span className="nav-link-icon"><i className="bi bi-people"></i></span>
                        <span className="nav-link-text">Employees</span>
                    </div>
                </a>
                <div
                    id="navEmployees"
                    className={`collapse ${isEmployeesActive ? 'show' : ''}`}
                    data-bs-parent="#sideNavbar"
                >
                    <ul className="nav flex-column">
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/employees" end>Employee List</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/employees/add-employee">Add Employee</NavLink></li>
                    </ul>
                </div>
            </li>

            {/* Departments Dropdown */}
            <li className="nav-item">
                <a
                    className={`nav-link ${!isDepartmentsActive ? 'collapsed' : ''}`}
                    href="#"
                    data-bs-toggle="collapse"
                    data-bs-target="#navDepartments"
                    aria-expanded={isDepartmentsActive ? 'true' : 'false'}
                    aria-controls="navDepartments"
                >
                    <div className="d-flex align-items-center">
                        <span className="nav-link-icon"><i className="bi bi-building"></i></span>
                        <span className="nav-link-text">Departments</span>
                    </div>
                </a>
                <div
                    id="navDepartments"
                    className={`collapse ${isDepartmentsActive ? 'show' : ''}`}
                    data-bs-parent="#sideNavbar"
                >
                    <ul className="nav flex-column">
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/departments" end>Department List</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/departments/add-department">Add Department</NavLink></li>
                    </ul>
                </div>
            </li>

            <li className="nav-item mt-6 mb-3"><span className="nav-label">Site Settings</span></li>

            {/* News Dropdown */}
            <li className="nav-item pb-9">
                <a
                    className={`nav-link ${!isNewsActive ? 'collapsed' : ''}`}
                    href="#"
                    data-bs-toggle="collapse"
                    data-bs-target="#navNews"
                    aria-expanded={isNewsActive ? 'true' : 'false'}
                    aria-controls="navNews"
                >
                    <div className="d-flex align-items-center">
                        <span className="nav-link-icon"><i className="bi bi-newspaper"></i></span>
                        <span className="nav-link-text">News</span>
                    </div>
                </a>
                <div
                    id="navNews"
                    className={`collapse ${isNewsActive ? 'show' : ''}`}
                    data-bs-parent="#sideNavbar"
                >
                    <ul className="nav flex-column">
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/news" end>News Grid</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/news/add-post">Add Post</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/news/categories" end>Category List</NavLink></li>
                        <li className="nav-item"><NavLink className="nav-link" to="/dashboard/news/categories/add-category">Add Category</NavLink></li>
                    </ul>
                </div>
            </li>
        </ul>
    );
};

const Sidebar = () => {
    return (
        <>
            {/* Sidebar untuk Desktop */}
            <nav className="navbar-vertical-nav d-none d-xl-block">
                <div className="navbar-vertical">
                    <div className="px-7 py-6">
                        <Link to="/" className="navbar-brand">
                            <img src="/assets/images/logo/logo.png" alt="PumaCon Logo" />
                        </Link>
                    </div>
                    <SimpleBar className="navbar-vertical-content flex-grow-1">
                        <SidebarNav />
                    </SimpleBar>
                </div>
            </nav>

            {/* Sidebar untuk Mobile (Offcanvas) */}
            <nav className="navbar-vertical-nav offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample">
                <div className="navbar-vertical">
                    <div className="px-4 py-5 d-flex justify-content-between align-items-center">
                        <Link to="/" className="navbar-brand">
                            <img src="/assets/images/logo/logo.png" alt="PumaCon Logo" />
                        </Link>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <SimpleBar className="navbar-vertical-content flex-grow-1">
                        <SidebarNav />
                    </SimpleBar>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;