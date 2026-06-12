import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, CheckCircle, Package, ArrowLeft, Truck } from 'lucide-react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const Checkout = ({ showToast }) => {
  const { cartItems, totalPrice, itemsPrice, shippingPrice, taxPrice, clearCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    } else if (cartItems.length === 0 && !isSuccess) {
      navigate('/');
    }
  }, [userInfo, cartItems]);

  // Shipping Form State
  const [street, setStreet] = useState(userInfo?.address?.street || '');
  const [city, setCity] = useState(userInfo?.address?.city || '');
  const [postalCode, setPostalCode] = useState(userInfo?.address?.postalCode || '');
  const [country, setCountry] = useState(userInfo?.address?.country || '');

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!street || !city || !postalCode || !country) {
      showToast('Please fill out all shipping address fields.', 'warning');
      return;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      showToast('Please enter a valid 16-digit credit card number.', 'warning');
      return;
    }

    if (!expDate || !expDate.includes('/')) {
      showToast('Please enter card expiry date in MM/YY format.', 'warning');
      return;
    }

    if (!cvv || cvv.length !== 3) {
      showToast('Please enter a valid 3-digit CVV number.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Simulate Stripe payment intent request
      const paymentResponse = await axios.post('http://localhost:5000/api/payments/intent', {
        amount: totalPrice,
      });

      if (paymentResponse.data.success) {
        const paymentResult = {
          id: paymentResponse.data.paymentId,
          status: paymentResponse.data.status,
        };

        // 2. Format order items for database Schema
        const orderItems = cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item.product,
        }));

        // 3. POST Order to backend database
        const orderResponse = await axios.post('http://localhost:5000/api/orders', {
          orderItems,
          shippingAddress: { street, city, postalCode, country },
          paymentMethod: 'Stripe',
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          paymentResult,
        });

        // 4. Success Actions
        setCompletedOrder(orderResponse.data);
        setIsSuccess(true);
        clearCart();
        showToast('Payment verified. Order placed successfully!', 'success');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToast(
        error.response?.data?.message || 'Payment transaction rejected. Please check card inputs.',
        'danger'
      );
    }
    setIsProcessing(false);
  };

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry Date (slash after 2 digits)
  const handleExpDateChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = input;
    if (input.length > 2) {
      formatted = `${input.substring(0, 2)}/${input.substring(2)}`;
    }
    setExpDate(formatted);
  };

  const handleCvvChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(input);
  };

  if (isSuccess && completedOrder) {
    return (
      <div className="container" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="success-card glass-panel">
          <div className="success-icon">
            <CheckCircle size={36} />
          </div>
          <h2 className="success-title">Order Confirmed!</h2>
          <p className="success-desc">
            Thank you for shopping with ShopEZ. Your transaction has been verified, and your premium item order is now processing.
          </p>

          <div
            style={{
              textAlign: 'left',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid var(--border-color)',
              fontSize: '14px'
            }}
          >
            <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Receipt Details
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
              <span style={{ fontWeight: '600' }}>{completedOrder._id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
              <span style={{ fontWeight: '600', fontSize: '12px' }}>{completedOrder.paymentResult.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ship To:</span>
              <span style={{ fontWeight: '600' }}>
                {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '12px',
                fontWeight: '700',
                fontSize: '16px'
              }}
            >
              <span>Amount Paid:</span>
              <span className="text-gradient">${completedOrder.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/orders" className="btn-primary" style={{ padding: '12px 24px' }}>
              Track My Order
            </Link>
            <Link to="/" className="btn-secondary" style={{ padding: '12px 24px' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', marginBottom: '28px' }}>
        <ArrowLeft size={14} /> Back to Catalog
      </Link>

      <h1 style={{ marginBottom: '32px' }}>Complete Purchase</h1>

      <div className="checkout-layout">
        {/* Form Inputs (Left) */}
        <form onSubmit={handlePaymentSubmit} className="checkout-form-panel">
          {/* Shipping Address */}
          <div style={{ marginBottom: '32px' }}>
            <h3 className="checkout-section-title">
              <Truck size={18} />
              <span>Shipping Information</span>
            </h3>
            <div className="checkout-form">
              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <input
                  id="street"
                  type="text"
                  placeholder="Street address / apartment"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="City name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postal-code">Postal/Zip Code</label>
                  <input
                    id="postal-code"
                    type="text"
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  placeholder="Country name"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Secure Payment */}
          <div>
            <h3 className="checkout-section-title">
              <CreditCard size={18} />
              <span>Credit Card Payment (Simulated)</span>
            </h3>
            <div className="checkout-form">
              <div className="form-group">
                <label htmlFor="card-number">Card Number</label>
                <input
                  id="card-number"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiry-date">Expiry Date</label>
                  <input
                    id="expiry-date"
                    type="text"
                    placeholder="MM/YY"
                    value={expDate}
                    onChange={handleExpDateChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    type="password"
                    placeholder="000"
                    value={cvv}
                    onChange={handleCvvChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontWeight: '600',
              marginTop: '32px',
              justifyContent: 'center',
              gap: '10px'
            }}
            disabled={isProcessing}
          >
            {isProcessing ? 'Verifying Stripe Intent...' : `Pay $${totalPrice.toFixed(2)}`}
          </button>
        </form>

        {/* Order review list (Right) */}
        <aside className="checkout-summary-panel">
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Order Review</h3>

          <div className="checkout-items-list">
            {cartItems.map((item) => (
              <div key={item.product} className="checkout-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                  <div>
                    <span className="checkout-item-name" title={item.name}>
                      {item.name}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Qty: {item.qty} &times; ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <span className="checkout-item-price">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="cart-summary" style={{ marginTop: '24px' }}>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span>Sales Tax (8%)</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="checkout-total-row">
              <span>Total Due</span>
              <span className="text-gradient">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
