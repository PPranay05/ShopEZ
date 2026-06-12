import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { BarChart3, Plus, Edit, Trash2, Check, RefreshCw, Layers, DollarSign, ShoppingBag } from 'lucide-react';
import AuthContext from '../context/AuthContext';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = ({ showToast }) => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tab State: 'analytics' | 'inventory' | 'orders'
  const [activeTab, setActiveTab] = useState('analytics');

  // Database Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Statistics
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
  });

  // Product CRUD Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Redirect if user is not admin
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      showToast('Access Denied. Administrator role required.', 'danger');
      navigate('/');
    } else {
      fetchAdminData();
    }
  }, [userInfo]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch products & orders in parallel
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/orders'),
      ]);

      setProducts(productsRes.data);
      setOrders(ordersRes.data);

      // 2. Compute Statistics
      const sales = ordersRes.data.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
      setStats({
        totalSales: sales,
        totalOrders: ordersRes.data.length,
        totalProducts: productsRes.data.length,
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Error loading server databases.', 'danger');
    }
    setLoading(false);
  };

  // Mark Order as Delivered
  const handleDeliverOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/deliver`);
      showToast('Order status updated: Shipped & Delivered.', 'success');
      fetchAdminData(); // refresh list
    } catch (error) {
      showToast('Failed to update delivery status.', 'danger');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        showToast('Product successfully removed from database.', 'success');
        fetchAdminData();
      } catch (error) {
        showToast('Failed to remove product.', 'danger');
      }
    }
  };

  // Create or Update Product Submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !description || !stockQuantity) {
      showToast('Please fill out all product form fields.', 'warning');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      description,
      category,
      stockQuantity: Number(stockQuantity),
      image: imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/products/${currentProductId}`, payload);
        showToast(`Product "${name}" updated successfully!`, 'success');
      } else {
        await axios.post('http://localhost:5000/api/products', payload);
        showToast(`Product "${name}" added to catalog!`, 'success');
      }
      setShowProductModal(false);
      resetProductForm();
      fetchAdminData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Action failed.', 'danger');
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    resetProductForm();
    setShowProductModal(true);
  };

  const openEditModal = (prod) => {
    setIsEditMode(true);
    setCurrentProductId(prod._id);
    setName(prod.name);
    setPrice(prod.price);
    setDescription(prod.description);
    setCategory(prod.category);
    setStockQuantity(prod.stockQuantity);
    setImageUrl(prod.images[0] || '');
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setCurrentProductId(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategory('Electronics');
    setStockQuantity('');
    setImageUrl('');
  };

  // --- Chart.js Data Configurations ---
  const salesChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue ($)',
        data: [
          stats.totalSales * 0.1,
          stats.totalSales * 0.15,
          stats.totalSales * 0.25,
          stats.totalSales * 0.18,
          stats.totalSales * 0.32,
          stats.totalSales, // Current month peak
          0, 0, 0, 0, 0, 0
        ],
        fill: false,
        borderColor: '#6366f1',
        tension: 0.3,
        pointBackgroundColor: '#818cf8',
        pointHoverRadius: 8,
      },
    ],
  };

  // Count items per category
  const categoriesCount = products.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.stockQuantity;
    return acc;
  }, {});

  const categoriesChartData = {
    labels: Object.keys(categoriesCount),
    datasets: [
      {
        label: 'Stock Quantity',
        data: Object.values(categoriesCount),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)'
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#818cf8',
          font: { family: 'Inter', weight: '500' }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)' }
      }
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="container flex-center" style={{ minHeight: '450px', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        ></div>
        <span style={{ color: 'var(--text-secondary)' }}>Loading Administrator Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Administrator Management Console</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Store statistics, database inventory curation, and shipping status tracker.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
        >
          <RefreshCw size={13} /> Sync Data
        </button>
      </div>

      <div className="admin-layout">
        {/* Sidebar Tabs */}
        <aside className="admin-menu">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`admin-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <BarChart3 size={16} /> Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`admin-menu-item ${activeTab === 'inventory' ? 'active' : ''}`}
          >
            <Layers size={16} /> Inventory Catalog
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`admin-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingBag size={16} /> Customers Orders
          </button>
        </aside>

        {/* Content Panels */}
        <main className="admin-content-panel">
          {/* TAB: Analytics */}
          {activeTab === 'analytics' && (
            <div>
              {/* Stats Cards */}
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Sales Revenue</span>
                    <DollarSign size={16} style={{ color: 'var(--success)' }} />
                  </div>
                  <div className="stat-value text-gradient">${stats.totalSales.toFixed(2)}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Orders Fulfilled</span>
                    <ShoppingBag size={16} style={{ color: 'var(--accent-color)' }} />
                  </div>
                  <div className="stat-value">{stats.totalOrders}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Unique SKUs</span>
                    <Layers size={16} style={{ color: 'var(--warning)' }} />
                  </div>
                  <div className="stat-value">{stats.totalProducts}</div>
                </div>
              </div>

              {/* Data Visualization Charts */}
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginTop: '40px' }}>
                Store Sales Trends
              </h3>
              
              <div className="analytics-charts-grid">
                {/* Line Chart */}
                <div className="chart-wrapper">
                  <Line data={salesChartData} options={chartOptions} />
                </div>
                
                {/* Bar Chart */}
                <div className="chart-wrapper">
                  <Bar data={categoriesChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Inventory */}
          {activeTab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Inventory Products List</h3>
                <button
                  onClick={openAddModal}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13px' }}
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {/* Products Table */}
              <div className="orders-table-wrapper" style={{ margin: 0 }}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Quantity</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id}>
                        <td>
                          <img
                            src={prod.images[0] || '/images/placeholder.jpg'}
                            alt={prod.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        </td>
                        <td style={{ fontWeight: '600' }}>{prod.name}</td>
                        <td>{prod.category}</td>
                        <td style={{ fontWeight: '600' }}>${prod.price.toFixed(2)}</td>
                        <td>
                          <span
                            style={{
                              color: prod.stockQuantity <= 0 ? 'var(--danger)' : prod.stockQuantity <= 5 ? 'var(--warning)' : 'var(--text-primary)',
                              fontWeight: '600'
                            }}
                          >
                            {prod.stockQuantity}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => openEditModal(prod)}
                              className="wishlist-to-cart-btn"
                              style={{ color: 'var(--accent-color)' }}
                              title="Edit Product"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="wishlist-to-cart-btn"
                              style={{ color: 'var(--danger)' }}
                              title="Delete Product"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Orders */}
          {activeTab === 'orders' && (
            <div>
              <h3>Customers Orders Fulfilment</h3>
              
              <div className="orders-table-wrapper" style={{ marginTop: '20px' }}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Purchase Date</th>
                      <th>Total Paid</th>
                      <th>Fulfillment</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                          No orders placed in system.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: '600', fontSize: '12px' }}>{order._id}</td>
                          <td>{order.user?.name || 'Guest User'}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: '600' }}>${order.totalPrice.toFixed(2)}</td>
                          <td>
                            {order.isDelivered ? (
                              <span className="status-badge delivered">Delivered</span>
                            ) : (
                              <span className="status-badge pending">Processing</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {!order.isDelivered && (
                              <button
                                onClick={() => handleDeliverOrder(order._id)}
                                className="btn-primary"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '11px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderRadius: '6px'
                                }}
                              >
                                <Check size={11} /> Mark Shipped
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CRUD Product Modal Overlay */}
      {showProductModal && (
        <div className="modal-overlay open">
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <button
              onClick={() => setShowProductModal(false)}
              className="close-modal-btn"
              title="Close modal"
            >
              &times;
            </button>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>
                {isEditMode ? 'Modify Catalog SKU' : 'Add New Catalog SKU'}
              </h2>
              
              <form onSubmit={handleProductSubmit} className="checkout-form">
                <div className="form-group">
                  <label htmlFor="prod-name">Product Name</label>
                  <input
                    id="prod-name"
                    type="text"
                    placeholder="e.g. Mechanical keyboard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="prod-price">Price ($)</label>
                    <input
                      id="prod-price"
                      type="number"
                      step="0.01"
                      placeholder="99.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prod-stock">Stock Level</label>
                    <input
                      id="prod-stock"
                      type="number"
                      placeholder="10"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="prod-cat">Category</label>
                  <select
                    id="prod-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="prod-img">Image URL</label>
                  <input
                    id="prod-img"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-desc">Description</label>
                  <textarea
                    id="prod-desc"
                    rows="3"
                    placeholder="Describe item technical specs..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={{ width: '100%', resize: 'none' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '16px' }}
                >
                  {isEditMode ? 'Apply SKU Changes' : 'Publish SKU'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
