import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Alert } from 'react-bootstrap';

const Dashboard = () => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatPrice = (price) => {
        if (price === null || price === undefined) return 'Rp 0';
        return `Rp${Number(price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };
    
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
        } catch (e) { return dateString; }
    };
    
    const getStatusClass = (status) => {
        if (!status) return 'bg-light-secondary text-dark-secondary';
        const statusLower = status.toLowerCase();
        switch (statusLower) {
          case 'pending':
          case 'pending confirmation': return 'bg-light-warning text-dark-warning';
          case 'processed': return 'bg-light-info text-dark-info';
          case 'shipped': return 'bg-light-primary text-dark-primary';
          case 'completed':
          case 'success': return 'bg-light-success text-dark-success';
          case 'canceled': return 'bg-light-danger text-dark-danger';
          default: return 'bg-light-secondary text-dark-secondary';
        }
      };

    const statusColorMap = {
        'Pending Confirmation': 'warning',
        'Pending': 'warning',              
        'Processed': 'info',               
        'Shipped': 'primary',             
        'Completed': 'success',            
        'Success': 'success',             
        'Canceled': 'danger',              
    };
    const defaultStatusColor = 'secondary';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) { setLoading(false); return; }
            setLoading(true);
            setError('');
            try {
                const response = await api.get('/admin/dashboard-summary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDashboardData(response.data);
            } catch (err) {
                console.error("Error fetching dashboard data:", err.response || err);
                setError(err.response?.data?.error || "Failed to load dashboard data.");
                if (err.response?.status === 401) { logout(); navigate('/dashboard/login', { replace: true }); }
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [token, navigate, logout]);

    const revenueChart = {
        series: [{
            name: 'Revenue',
            data: dashboardData?.revenue_chart_data?.series || []
        }],
        options: {
            chart: { type: 'line', toolbar: { show: false } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 3, colors: ['#0d6efd'] },
            xaxis: { categories: dashboardData?.revenue_chart_data?.labels || [] },
            yaxis: { labels: { formatter: (value) => "Rp"+ Math.round(value).toLocaleString('id-ID') } },
            grid: { borderColor: '#e7e7e7', strokeDashArray: 5 }
        }
    };

    const donutChartColors = (dashboardData?.order_status_chart?.labels || []).map(
        label => {
            const colorName = statusColorMap[label] || defaultStatusColor;
            switch (colorName) {
                case 'primary': return '#0d6efd';
                case 'success': return '#198754';
                case 'warning': return '#ffc107';
                case 'danger': return '#dc3545';
                case 'info': return '#0dcaf0';
                default: return '#6c757d';
            }
        }
    );

    const totalSalesChart = {
        series: dashboardData?.order_status_chart?.series || [],
        options: {
            chart: { type: 'donut' },
            labels: dashboardData?.order_status_chart?.labels || [],
            legend: { show: false },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '75%' } } },
            stroke: { width: 0 },
            colors: donutChartColors,
        }
    };

    const profitPercentage = dashboardData?.total_income > 0 
        ? (dashboardData.total_profit / dashboardData.total_income) * 100 
        : 0;

    if (loading) {
        return <main className="main-content-wrapper"><div className="container p-5 text-center"><h1>Loading Dashboard...</h1></div></main>;
    }
    if (error) {
        return <main className="main-content-wrapper"><div className="container p-5 text-center"><Alert variant="danger">{error}</Alert></div></main>;
    }

    return (
        <main className="main-content-wrapper">
            <section className="container">
                <div className="table-responsive-xl mb-6 mb-lg-0">
                    <div className="row flex-nowrap pb-3 pb-lg-0">
                        <div className="col-lg-4 col-12 mb-6">
                            <div className="card h-100 card-lg">
                                <div className="card-body p-6">
                                    <div className="d-flex justify-content-between align-items-center mb-6">
                                        <div><h4 className="mb-0 fs-5">Earnings</h4></div>
                                        <div className="icon-shape icon-md bg-light-danger text-dark-danger rounded-circle"><i className="bi bi-currency-dollar fs-5"></i></div>
                                    </div>
                                    <div className="lh-1">
                                        <h1 className="mb-2 fw-bold fs-2">{formatPrice(dashboardData?.current_month_earnings)}</h1>
                                        <span>Current Month Revenue</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-12 mb-6">
                            <div className="card h-100 card-lg">
                                <div className="card-body p-6">
                                    <div className="d-flex justify-content-between align-items-center mb-6">
                                        <div><h4 className="mb-0 fs-5">Orders</h4></div>
                                        <div className="icon-shape icon-md bg-light-warning text-dark-warning rounded-circle"><i className="bi bi-cart fs-5"></i></div>
                                    </div>
                                    <div className="lh-1">
                                        <h1 className="mb-2 fw-bold fs-2">{(dashboardData?.total_orders_count || 0).toLocaleString('id-ID')}</h1>
                                        <span>Total Orders All Time</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-12 mb-6">
                            <div className="card h-100 card-lg">
                                <div className="card-body p-6">
                                    <div className="d-flex justify-content-between align-items-center mb-6">
                                        <div><h4 className="mb-0 fs-5">Customers</h4></div>
                                        <div className="icon-shape icon-md bg-light-info text-dark-info rounded-circle"><i className="bi bi-people fs-5"></i></div>
                                    </div>
                                    <div className="lh-1">
                                        <h1 className="mb-2 fw-bold fs-2">{(dashboardData?.total_customers_count || 0).toLocaleString('id-ID')}</h1>
                                        <span>Total Active Customers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                <div className="col-xl-8 col-lg-6 col-md-12 col-12 mb-6">
                    <div className="card h-100 card-lg">
                    <div className="card-body p-6">
                        <h3 className="mb-1 fs-5">Revenue</h3>
                        <small>(Last 8 Months)</small>
                        <div id="revenueChart" className="mt-6">
                        <Chart options={revenueChart.options} series={revenueChart.series} type="line" height={350} />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-6 col-12 mb-6">
                        <div className="card h-100 card-lg">
                            <div className="card-body p-6">
                                <h3 className="mb-0 fs-5">Sales by Order Status</h3>
                                <div id="totalSale" className="mt-6 d-flex justify-content-center">
                                    {(totalSalesChart.series || []).length > 0 ? (
                                        <Chart options={totalSalesChart.options} series={totalSalesChart.series} type="donut" height={220} />
                                    ) : ( <p>No order data for chart.</p> )}
                                </div>
                                <div className="mt-4">
                                    <ul className="list-unstyled mb-0">
                                        {(dashboardData?.order_status_chart?.labels || []).map((label, index) => {
                                            const colorName = statusColorMap[label] || defaultStatusColor;
                                            return (
                                                <li className="mb-2" key={label}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" className={`bi bi-circle-fill text-${colorName}`} viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" /></svg>
                                                    <span className="ms-2"><span className="text-dark">{label}</span>: {formatPrice(dashboardData.order_status_chart.series[index])}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xl-12 col-lg-6 col-md-12 col-12 mb-6">
                        <div className="card h-100 card-lg">
                            <div className="card-body p-6">
                                <h3 className="mb-0 fs-5">Sales Overview</h3>
                                <div className="mt-6">
                                    <div className="mb-5">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h5 className="fs-6 mb-0">Total Income (Gross Revenue)</h5>
                                            <span><span className="me-1 text-dark">{formatPrice(dashboardData?.total_income)}</span></span>
                                        </div>
                                        <div><div className="progress bg-light-primary mt-2" style={{ height: '6px' }}><div className="progress-bar bg-primary" role="progressbar" style={{ width: '100%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div></div></div>
                                    </div>
                                    <div className="mb-5">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h5 className="fs-6 mb-0">Total Profit (Net Revenue)</h5>
                                            <span><span className="me-1 text-dark">{formatPrice(dashboardData?.total_profit)}</span>({profitPercentage.toFixed(1)}%)</span>
                                        </div>
                                        <div><div className="progress bg-info-soft mt-2" style={{ height: '6px' }}><div className="progress-bar bg-info" role="progressbar" style={{ width: `${profitPercentage.toFixed(0)}%` }} aria-valuenow={profitPercentage.toFixed(0)} aria-valuemin="0" aria-valuemax="100"></div></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>     
                </div>
                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-12 mb-6">
                        <div className="card h-100 card-lg">
                            <div className="p-6">
                                <div className="d-flex justify-content-between">
                                    <h3 className="mb-0 fs-5">Recent Orders</h3>
                                    <Link to="/dashboard/orders" className="btn btn-outline-primary btn-sm">View All</Link>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-centered table-borderless text-nowrap table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th scope="col">Order ID</th>
                                                <th scope="col">Customer</th>
                                                <th scope="col">Order Date</th>
                                                <th scope="col">Amount</th>
                                                <th scope="col">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(dashboardData?.recent_orders || []).map(order => (
                                                <tr key={order.order_id}>
                                                    <td><Link to={`/dashboard/orders/${order.order_id}`}>#{order.order_id}</Link></td>
                                                    <td>{order.customer_fullname}</td>
                                                    <td>{formatDateTime(order.order_date_time)}</td>
                                                    <td>{formatPrice(order.grand_total)}</td>
                                                    <td><span className={`badge ${getStatusClass(order.order_status)}`}>{order.order_status}</span></td>
                                                </tr>
                                            ))}
                                            {(!dashboardData || !dashboardData.recent_orders || dashboardData.recent_orders.length === 0) && (
                                                <tr><td colSpan="5" className="text-center p-4">No recent orders found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Dashboard;