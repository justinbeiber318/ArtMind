import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ChatbotWidget from './components/ChatbotWidget.jsx';
import { selectIsAuthed, selectIsAdmin } from './features/auth/authSlice.js';

import Home from './pages/Home.jsx';
import Gallery from './pages/Gallery.jsx';
import PaintingDetails from './pages/PaintingDetails.jsx';
import AISearch from './pages/AISearch.jsx';
import AIRecognition from './pages/AIRecognition.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Favorites from './pages/Favorites.jsx';
import Profile from './pages/Profile.jsx';
import Upload from './pages/Upload.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function Protected({ children, admin }) {
  const authed = useSelector(selectIsAuthed);
  const isAdmin = useSelector(selectIsAdmin);
  if (!authed) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      {!isHome && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/paintings/:slug" element={<PaintingDetails />} />
          <Route path="/ai-search" element={<AISearch />} />
          <Route path="/ai-recognition" element={<AIRecognition />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/upload" element={<Protected><Upload /></Protected>} />
          <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/admin" element={<Protected admin><AdminDashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isHome && <Footer />}
      {!isHome && <ChatbotWidget />}
    </>
  );
}
