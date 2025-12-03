import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import FamilyTree from './pages/FamilyTree';
import Admin from './pages/Admin';
import InstallPrompt from './components/InstallPrompt';
import BottomNav from './components/BottomNav';

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/family-tree'; // Hide nav on tree for more space

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation - Desktop only */}
      <nav className="hidden md:block bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="logo-font text-2xl text-orange-600">
              Madrigal
            </Link>
            <div className="flex gap-8">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/register">Register</NavLink>
              <NavLink to="/family-tree">Family Tree</NavLink>
              <NavLink to="/admin">Admin</NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`pb-20 md:pb-8 ${showNav ? 'pt-0 md:pt-6' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/family-tree" element={<FamilyTree />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? 'text-orange-600'
          : 'text-neutral-600 hover:text-neutral-900'
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
