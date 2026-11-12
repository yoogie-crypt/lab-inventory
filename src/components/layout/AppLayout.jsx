import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAV_ADMIN, NAV_STAFF } from '../../routes/navigation.js';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <Sidebar
        open={open}
        user={user}
        items={isAdmin ? NAV_ADMIN : NAV_STAFF}
        onLogout={handleLogout}
      />
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <Topbar role={user.role} open={open} onToggle={() => setOpen((o) => !o)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
