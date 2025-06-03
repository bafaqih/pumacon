import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context (ini akan kita buat/gunakan nanti)
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Layouts
import AdminMainLayout from './layouts/AdminMainLayout';

// Pages Admin
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductCategories from './pages/ProductCategories';
import AddProductCategories from './pages/AddProductCategories';
import EditProductCategories from './pages/EditProductCategories';
import Orders from './pages/Orders';
import UpdateOrder from './pages/UpdateOrder';
import Customers from './pages/Customers';
import Employees from './pages/Employees';
import EditEmployee from './pages/EditEmployee';
import AddEmployee from './pages/AddEmployee';
import News from './pages/News';
import AddNews from './pages/AddNews';
import EditNews from './pages/EditNews';
import Login from './pages/Login'; // Jika Anda ingin menambahkan halaman login
import NewsCategories from './pages/NewsCategories'; // Jika Anda ingin menambahkan halaman kategori berita
import AddNewsCategories from './pages/AddNewsCategories';
import EditNewsCategories from './pages/EditNewsCategories';
import Departments from './pages/Departments';
import AddDepartment from './pages/AddDepartment';
import EditDepartments from './pages/EditDepartments';
import Registration from './pages/Registration'; // Jika Anda ingin menambahkan halaman registrasi

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth(); // Mengambil token dari AuthContext
  const location = useLocation();

  if (!token) {
    // Jika tidak ada token (belum login), redirect ke halaman login admin
    // state={{ from: location }} berguna jika Anda ingin redirect kembali setelah login
    return <Navigate to="/dashboard/login" state={{ from: location }} replace />;
  }

  return children; // Jika sudah login, tampilkan children (dalam kasus ini AdminMainLayout)
};

const App = () => (
    <AuthProvider>
    <Router>
        <Routes>
            <Route path="/dashboard/login" element={<Login />} />
            <Route path="/dashboard/registration" element={<Registration />} />

            <Route path="/dashboard" element={<ProtectedRoute><AdminMainLayout /></ProtectedRoute>
                }
            >

                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/add-product" element={<AddProduct />} />
                <Route path="products/:productId/edit" element={<EditProduct />} />
                <Route path="products/categories" element={<ProductCategories />} />
                <Route path="products/categories/add-category" element={<AddProductCategories />} />
                <Route path="products/categories/:categoryId/edit" element={<EditProductCategories />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderId" element={<UpdateOrder />} />
                <Route path="customers" element={<Customers />} />
                <Route path="employees" element={<Employees />} />
                <Route path="employees/:employeeId/edit" element={<EditEmployee />} />
                <Route path="employees/add-employee" element={<AddEmployee />} />
                <Route path="news" element={<News />} />
                <Route path="news/add-post" element={<AddNews />} />
                <Route path="news/:newsId/edit" element={<EditNews />} />
                <Route path="news/categories" element={<NewsCategories />} />
                <Route path="news/categories/add-category" element={<AddNewsCategories />} />
                <Route path="news/categories/:categoryId/edit" element={<EditNewsCategories />} />
                <Route path="departments" element={<Departments />} />
                <Route path="departments/add-department" element={<AddDepartment />} />
                <Route path="departments/:departmentId/edit" element={<EditDepartments />} />
                {/* Tambahkan rute untuk kategori berita jika diperlukan */}
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </Router>
    </AuthProvider>
);

export default App;