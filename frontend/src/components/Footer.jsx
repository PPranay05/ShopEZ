import React from 'react';

const Footer = () => {
  return (
    <footer
      className="glass-panel"
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '24px 0',
        textAlign: 'center',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="container">
        <p>&copy; {new Date().getFullYear()} ShopEZ Inc. All rights reserved.</p>
        <p style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
          ShopEZ — A premium full-stack retail experience built with React, Express & MongoDB.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
