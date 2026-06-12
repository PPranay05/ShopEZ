import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, ArrowLeft, Send } from 'lucide-react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const ProductDetail = ({ showToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product detail on load or ID change
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      showToast('Product not found or failed to load.', 'danger');
      navigate('/');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (qty > product.stockQuantity) {
      showToast('Not enough stock available.', 'warning');
      return;
    }
    const result = addToCart(product, qty);
    if (result && !result.success) {
      showToast(result.message, 'warning');
    } else {
      showToast(`Added ${qty} x "${product.name}" to cart!`, 'success');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please type a comment for your review.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post(`http://localhost:5000/api/products/${id}/reviews`, {
        rating,
        comment,
      });
      showToast('Review submitted successfully!', 'success');
      setComment('');
      setRating(5);
      // Reload product details to show the new review
      fetchProduct();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit review.', 'danger');
    }
    setSubmittingReview(false);
  };

  // Star icons utility
  const renderStars = (val, size = 14) => {
    const stars = [];
    const full = Math.floor(val);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          fill={i <= full ? 'currentColor' : 'none'}
          className={i <= full ? 'stars' : ''}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        ></div>
        <span style={{ color: 'var(--text-secondary)' }}>Loading details...</span>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container detail-page">
      {/* Back Button */}
      <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', marginBottom: '28px' }}>
        <ArrowLeft size={14} /> Back to Catalog
      </Link>

      <div className="detail-layout">
        {/* Left column: Product Image */}
        <div className="detail-image-panel">
          <img src={product.images[0] || '/images/placeholder.jpg'} alt={product.name} />
          {product.stockQuantity > 0 ? (
            <span className="stock-tag in-stock">In Stock ({product.stockQuantity} available)</span>
          ) : (
            <span className="stock-tag out-stock">Temporarily Out of Stock</span>
          )}
        </div>

        {/* Right column: Details and Purchase Actions */}
        <div className="detail-info-panel">
          <span className="detail-cat">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>

          {/* Rating */}
          <div className="rating-container" style={{ fontSize: '14px', marginBottom: '20px' }}>
            <span className="stars" style={{ display: 'flex', gap: '2px' }}>
              {renderStars(product.rating, 16)}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
              {product.rating.toFixed(1)} / 5.0 ({product.numReviews} customer reviews)
            </span>
          </div>

          <div className="detail-price">${product.price.toFixed(2)}</div>

          <p className="detail-desc">{product.description}</p>

          {/* Quantity selector and Add to Cart */}
          {product.stockQuantity > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
              <div className="quantity-control" style={{ height: '42px' }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ width: '36px', height: '40px', fontSize: '16px' }}
                >
                  -
                </button>
                <span style={{ width: '48px', fontSize: '15px' }}>{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                  style={{ width: '36px', height: '40px', fontSize: '16px' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary"
                style={{ height: '42px', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShoppingCart size={16} /> Add To Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>Customer Reviews</h2>
        
        <div className="reviews-grid">
          {/* Write a review card */}
          <div className="write-review-card">
            <h3>Share Your Thoughts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '6px 0 20px 0' }}>
              Let other buyers know your experience with this item.
            </p>

            {userInfo ? (
              <form onSubmit={handleReviewSubmit} className="checkout-form">
                <div className="form-group">
                  <label>Your Rating</label>
                  <div className="rating-select">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rating-star-btn ${star <= rating ? 'selected' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-comment">Review Comments</label>
                  <textarea
                    id="review-comment"
                    rows="4"
                    placeholder="Describe what you liked or disliked about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      width: '100%',
                      resize: 'none',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '12px'
                    }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    marginTop: '8px'
                  }}
                  disabled={submittingReview}
                >
                  <Send size={14} /> Submit Review
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                  You must be logged in to leave a review.
                </p>
                <Link to="/login" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  Log In To Review
                </Link>
              </div>
            )}
          </div>

          {/* List of reviews */}
          <div className="review-list">
            {product.reviews.length === 0 ? (
              <div
                className="glass-panel"
                style={{
                  padding: '40px',
                  borderRadius: 'var(--border-radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="review-item">
                  <div className="review-meta">
                    <span className="review-author">{rev.name}</span>
                    <span className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="stars" style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                    {renderStars(rev.rating, 13)}
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
