import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import CartContext from '../context/CartContext';

const ProductCard = ({ product, showToast }) => {
  const { addToCart, toggleWishlist, wishlist } = useContext(CartContext);

  // Check if item is in wishlist
  const isInWishlist = wishlist.some((x) => x._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stockQuantity <= 0) {
      showToast('Sorry, this product is temporarily out of stock.', 'warning');
      return;
    }
    
    const result = addToCart(product, 1);
    if (result && !result.success) {
      showToast(result.message, 'warning');
    } else {
      showToast(`Added "${product.name}" to cart!`, 'success');
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleWishlist(product);
    if (result.added) {
      showToast(`Added "${product.name}" to wishlist!`, 'success');
    } else {
      showToast(`Removed "${product.name}" from wishlist.`, 'info');
    }
  };

  // Render Star Ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={13} fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} size={13} fill="url(#halfGrad)" />);
      } else {
        stars.push(<Star key={i} size={13} />);
      }
    }
    return stars;
  };

  return (
    <div className="product-card">
      {/* SVG Gradient definitions for half stars */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="halfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="var(--warning)" />
            <stop offset="50%" stopColor="var(--text-tertiary)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wishlist Icon */}
      <button
        onClick={handleWishlistClick}
        className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
        title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product._id}`}>
        <div className="card-image-wrapper">
          <img src={product.images[0] || '/images/placeholder.jpg'} alt={product.name} />
          {product.stockQuantity <= 0 ? (
            <span className="card-badge" style={{ backgroundColor: 'var(--danger)' }}>Out of stock</span>
          ) : product.stockQuantity <= 5 ? (
            <span className="card-badge" style={{ backgroundColor: 'var(--warning)' }}>Only {product.stockQuantity} Left</span>
          ) : null}
        </div>
      </Link>

      {/* Details Card */}
      <div className="card-details">
        <span className="product-cat">{product.category}</span>
        <Link to={`/product/${product._id}`}>
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="rating-container">
          <span className="stars">{renderStars(product.rating)}</span>
          <span>({product.numReviews})</span>
        </div>

        {/* Card Footer */}
        <div className="card-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="add-cart-btn"
            title="Add to Cart"
            disabled={product.stockQuantity <= 0}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
