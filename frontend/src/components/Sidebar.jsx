import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  const linkCls = ({ isActive }) =>
    `block rounded px-3 py-2 ${isActive ? 'bg-white/20' : 'bg-transparent'} text-white`;

  return (
    <aside className="w-60 h-full bg-teal-600 text-white p-4 flex flex-col justify-between">
      <div className="font-bold text-sm mb-1 opacity-95">Menu</div>
      <nav className="flex flex-col gap-1">
        {role === 'admin' ? (
          <>
            <NavLink to="/admin" end className={linkCls}>Dashboard</NavLink>
            <NavLink to="/admin/classes" className={linkCls}>Classes</NavLink>
            <NavLink to="/admin/teachers" className={linkCls}>Teachers</NavLink>
            <NavLink to="/admin/laptops" className={linkCls}>Laptops</NavLink>
            <NavLink to="/reports" className={linkCls}>Reports</NavLink>
            <NavLink to="/settings" className={linkCls}>Settings</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/teacher" end className={linkCls}>Dashboard</NavLink>
            <NavLink to="/teacher/students" className={linkCls}>Students</NavLink>
            <NavLink to="/teacher/attendance" className={linkCls}>Attendance</NavLink>
            <NavLink to="/teacher/laptops" className={linkCls}>Laptops</NavLink>
            <NavLink to="/reports" className={linkCls}>Reports</NavLink>
            <NavLink to="/settings" className={linkCls}>Settings</NavLink>
          </>
        )}
      </nav>
      <div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            window.location.href = '/login';
          }}
          className="w-full bg-white/20 text-white font-semibold px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;