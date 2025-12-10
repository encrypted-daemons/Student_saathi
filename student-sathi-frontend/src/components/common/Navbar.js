import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProviderNavbar from '../layout/ProviderNavbar';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import Toast from './Toast';
import api from '../../services/api'; // Import API
import { 
  HomeIcon, UserIcon, ChevronDownIcon, 
  Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, 
  PencilSquareIcon, Squares2X2Icon
} from '@heroicons/react/24/solid';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  if (user && (user.role === 'provider' || user.role === 'landlord' || user.role === 'mess' || user.role === 'library' || user.role === 'transport' || user.role === 'coaching' || user.role === 'stationery')) {
      return <ProviderNavbar />;
  }

  return <StudentNavbarImplementation user={user} logout={logout} />;
};

// --- STUDENT NAVBAR COMPONENT ---
const StudentNavbarImplementation = ({ user, logout }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Notifications Logic (The Fix)
  useEffect(() => {
    if (user) {
        const fetchNotifs = async () => {
            try {
                const res = await api.get('/notifications'); // Make sure this endpoint exists in backend
                setNotifications(res.data || []);
            } catch (e) { setNotifications([]); }
        };
        fetchNotifs();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      const handleNotification = (data) => {
        try { const audio = new Audio(NOTIFICATION_SOUND); audio.play().catch(e => {}); } catch(e) {}
        setToast({ message: data.message, type: data.type || 'info' });
        setNotifications(prev => [data, ...prev]); // Add to list in real-time
      };
      socket.on('notification', handleNotification);
      return () => socket.off('notification', handleNotification);
    }
  }, [socket, user]);

  const handleLogout = () => { logout(); navigate('/login'); setIsProfileOpen(false); };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/login';
  };

  const getProfilePath = () => {
      if (user?.role === 'student') return '/student/profile';
      return '#'; 
  };

  const NavItem = ({ to, children }) => {
      const isActive = location.pathname === to;
      return (
          <Link to={to} className="relative group px-3 py-2">
              <span className={`text-sm font-bold transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 group-hover:text-primary-600'}`}>
                  {children}
              </span>
              {isActive && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
          </Link>
      );
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-200' : 'bg-transparent border-b border-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to={getDashboardPath()} className="flex items-center space-x-2 group">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-9 h-9 bg-gradient-to-tr from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
              >
                <HomeIcon className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Student<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">Sathi</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              
              {user?.role === 'student' && (
                <div className="flex space-x-1 mr-4 bg-gray-100/50 p-1 rounded-xl border border-gray-200">
                   <NavItem to="/student/dashboard">Dashboard</NavItem>
                   <NavItem to="/student/find-room">Rooms</NavItem>
                   <NavItem to="/student/events">Chill Zone</NavItem>
                </div>
              )}

              {user?.role === 'admin' && (
                   <NavItem to="/admin/dashboard">Admin Panel</NavItem>
              )}

              {user ? (
                <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
                  
                  {/* ✅ SAFE NOTIFICATION BELL */}
                  <NotificationBell notifications={notifications || []} />

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 p-1 pr-3 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                    >
                      <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-r from-primary-500 to-purple-500">
                         <img 
                           src={user.profilePic && user.profilePic !== 'default_avatar.png' ? user.profilePic : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                           alt="Profile" 
                           className="w-full h-full object-cover rounded-full bg-white"
                         />
                      </div>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                        >
                          <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 font-medium capitalize flex items-center mt-1">
                               <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                               {user.role} Account
                            </p>
                          </div>

                          <div className="p-2 space-y-1">
                             <Link 
                                to={getDashboardPath()}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center px-3 py-2.5 text-sm text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                             >
                                <Squares2X2Icon className="w-5 h-5 mr-3 opacity-70" /> Dashboard
                             </Link>

                             <Link 
                                to={getProfilePath()}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center px-3 py-2.5 text-sm text-gray-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                             >
                                <PencilSquareIcon className="w-5 h-5 mr-3 opacity-70" /> Edit Profile
                             </Link>
                          </div>

                          <div className="h-px bg-gray-100 my-1 mx-2"></div>

                          <div className="p-2">
                             <button
                               onClick={handleLogout}
                               className="w-full flex items-center px-3 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold"
                             >
                               <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" /> Logout
                             </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 font-bold text-sm px-4 py-2">Login</Link>
                  <Link to="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-black font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              {user && <NotificationBell notifications={notifications || []} />}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                {isMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden overflow-hidden"
                >
                    <div className="py-4 space-y-4 border-t border-gray-100">
                         <Link to={getDashboardPath()} className="block px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-800" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                         {user ? (
                             <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-600 font-bold bg-red-50 rounded-xl">Logout</button>
                         ) : (
                             <div className="grid grid-cols-2 gap-3">
                                 <Link to="/login" className="text-center py-3 bg-gray-100 rounded-xl font-bold">Login</Link>
                                 <Link to="/register" className="text-center py-3 bg-primary-600 text-white rounded-xl font-bold">Register</Link>
                             </div>
                         )}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default Navbar;