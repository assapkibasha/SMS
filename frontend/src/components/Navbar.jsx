import React from 'react';

function Navbar({ activePage }) {
  return (
    <nav className="bg-tealgrey-600 text-white shadow px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-white/15 flex items-center justify-center font-bold">SMS</div>
        <div>
          <div className="font-bold text-lg leading-tight">Student Management System</div>
          <div className="text-xs opacity-90">{activePage || 'Dashboard'}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div>User: <span className="font-semibold">{localStorage.getItem('username') || 'Guest'}</span></div>
      </div>
    </nav>
  );
}

export default Navbar;