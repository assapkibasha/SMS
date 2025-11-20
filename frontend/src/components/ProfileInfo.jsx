import React from 'react';

function ProfileInfo() {
  const userRole = localStorage.getItem('role');
  const username = localStorage.getItem('username') || 'Guest';

  return (
    <div>
      <p>Logged in as: {username} ({userRole})</p>
    </div>
  );
}

export default ProfileInfo;