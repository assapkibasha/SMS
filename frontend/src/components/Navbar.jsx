import React from 'react';

function Navbar({ activePage }) {
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') || 'Guest' : 'Guest';
  const initials = React.useMemo(() => {
    if (!username) return 'G';
    const parts = username.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, [username]);

  return (
    <nav className="bg-tealgrey-600 text-white shadow px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-white/15 flex items-center justify-center font-bold">SMS</div>
        <div>
          <div className="font-bold text-lg leading-tight">Student Management System</div>
          <div className="text-xs opacity-90">{activePage || 'Dashboard'}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold uppercase">
          {initials}
        </div>
        <div className="flex flex-col leading-tight text-right">
          <span className="text-xs opacity-80">Logged in as</span>
          <span className="font-semibold truncate max-w-[140px]">{username}</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;