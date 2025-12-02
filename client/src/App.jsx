import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import FamilyTree from './pages/FamilyTree';
import Admin from './pages/Admin';
import InstallPrompt from './components/InstallPrompt';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-100 relative overflow-hidden">
        {/* Floating butterflies */}
        <div className="butterfly" style={{top: '10%', left: '5%'}}>🦋</div>
        <div className="butterfly" style={{top: '20%', right: '10%'}}>🦋</div>
        <div className="butterfly" style={{bottom: '15%', left: '15%'}}>🦋</div>
        <div className="butterfly" style={{bottom: '25%', right: '8%'}}>🦋</div>

        {/* PWA Install Prompt */}
        <InstallPrompt />

        <nav className="bg-gradient-to-r from-amber-700 to-orange-600 text-white shadow-2xl relative z-20">
          <div className="container mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold celebration-title" style={{fontFamily: "'Dancing Script', cursive"}}>
                ✨ Madrigal Family Reunion ✨
              </h1>
              <div className="flex gap-6 font-medium">
                <Link to="/" className="hover:text-amber-200 transition transform hover:scale-110">Home</Link>
                <Link to="/register" className="hover:text-amber-200 transition transform hover:scale-110">Register</Link>
                <Link to="/family-tree" className="hover:text-amber-200 transition transform hover:scale-110">Family Tree</Link>
                <Link to="/admin" className="hover:text-amber-200 transition transform hover:scale-110">Admin</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
