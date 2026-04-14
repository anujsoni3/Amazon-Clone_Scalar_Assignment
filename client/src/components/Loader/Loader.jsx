import React from 'react';

const Loader = ({ fullPage = false }) => {
  const loaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: fullPage ? '80vh' : 'auto',
    padding: '40px',
  };

  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTop: '4px solid var(--color-btn-secondary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={loaderStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default Loader;
