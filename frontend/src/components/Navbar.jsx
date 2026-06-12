import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Sun, Moon, User, LogOut, Settings, Search } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const Navbar = ({ toggleCart, toggleWishlist, theme, toggleTheme, onSearch }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems, wishlist } = useContext(CartContext);
  const [searchVal, setSearchVal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
    // Redirect to home catalog if searching from elsewhere
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  // Calculate items count
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="glass-panel">
      <div className="container nav-bar">
        {/* Logo */}
        <Link to="/" className="logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>ShopEZ</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-wrapper">
          <input
            type="text"
            placeholder="Search premium products..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <button type="submit" className="search-icon">
            <Search size={18} />
          </button>
        </form>

        {/* Navigation Links & Actions */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="icon-btn theme-toggle"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="icon-btn"
            title="View Wishlist"
          >
            <Heart size={18} />
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </button>

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="icon-btn"
            title="View Shopping Cart"
          >
            <ShoppingCart size={18} />
            {cartItemsCount > 0 && <span className="badge">{cartItemsCount}</span>}
          </button>

          {/* User Account / Admin Panel */}
          {userInfo ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="icon-btn"
                title="Account Settings"
              >
                <User size={18} />
              </button>
              
              {showDropdown && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0',
                    width: '200px',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: '201',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Hi, {userInfo.name}
                  </div>
                  
                  <Link
                    to="/orders"
                    className="admin-menu-item"
                    style={{ padding: '8px 12px', borderRadius: '8px' }}
                    onClick={() => setShowDropdown(false)}
                  >
                    My Orders
                  </Link>
                  
                  {userInfo.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="admin-menu-item"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        color: 'var(--accent-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings size={14} /> Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="admin-menu-item"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      width: '100%',
                      textAlign: 'left',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px', display: 'inline-flex' }}
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
