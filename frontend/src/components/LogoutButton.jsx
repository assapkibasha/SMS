import React from 'react';

function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <button onClick={handleLogout} style={{ backgroundColor: '#6366f1', color: 'white', padding: '10px 20px' }}>
      Logout
    </button>
  );
}

export default LogoutButton;