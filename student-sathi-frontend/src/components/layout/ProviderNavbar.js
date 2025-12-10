import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
// Note: Ensure NotificationBell is in the same folder or adjust path
import NotificationBell from '../common/NotificationBell'; 
import { 
  Squares2X2Icon, PlusCircleIcon, ArrowRightOnRectangleIcon, 
  Bars3Icon, XMarkIcon, BriefcaseIcon, UserIcon, ChevronDownIcon
} from '@heroicons/react/24/solid';

const ProviderNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const category = user?.providerDetails?.category || 'Partner';

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Default Avatar Logic
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`;
  const profileImage = (user?.profilePic && user.profilePic !== 'default_avatar.png') 
    ? user.profilePic 
    : defaultAvatar;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, icon: Icon, label }) => {
      const isActive = location.pathname === to;
      return (
        <Link to={to} className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 font-bold text-sm ${isActive ? 'bg-gray-900 text-white shadow-lg transform scale-105' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-white' : 'text-gray-400'}`} />
            {label}
        </Link>
      );
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-200' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 py-3">
          
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/provider/dashboard')}>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg transform hover:rotate-12 transition-transform">
                <BriefcaseIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-extrabold text-gray-900 leading-none">Partner<span className="text-blue-600">Panel</span></h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{category} Account</p>
              </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/provider/dashboard" icon={Squares2X2Icon} label="Dashboard" />
              
              {category === 'Landlord' ? (
                  <NavLink to="/provider/add-property" icon={PlusCircleIcon} label="Add Room" />
              ) : category === 'Transport' ? (
                  <NavLink to="/provider/add-transport" icon={PlusCircleIcon} label="Add Vehicle" />
              ) : (
                  <NavLink to="/provider/manage-service" icon={PlusCircleIcon} label="Manage Service" />
              )}

              <div className="h-8 w-px bg-gray-200 mx-3"></div>
              
              <NotificationBell />

              {/* Profile Dropdown */}
              <div className="relative ml-4">
                 <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-all group"
                 >
                    <img src={profileImage} className="w-9 h-9 rounded-full bg-gray-100 object-cover border-2 border-white shadow-sm" alt="Profile" />
                    <div className="text-left hidden lg:block">
                        <p className="text-xs font-bold text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Online</p>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}/>
                 </button>

                 <AnimatePresence>
                    {isProfileOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-50"
                        >
                            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 font-medium">{user?.phone}</p>
                            </div>
                            <div className="p-2">
                                <button onClick={handleLogout} className="w-full flex items-center px-3 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 font-bold transition-colors">
                                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" /> Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>
              </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
              <NotificationBell />
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition">
                  {isMenuOpen ? <XMarkIcon className="w-7 h-7"/> : <Bars3Icon className="w-7 h-7"/>}
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden shadow-lg"
          >
              <div className="flex flex-col p-4 space-y-2">
                  <Link to="/provider/dashboard" className="p-3 bg-gray-50 rounded-xl font-bold text-gray-700 flex items-center" onClick={()=>setIsMenuOpen(false)}>
                      <Squares2X2Icon className="w-5 h-5 mr-3 text-gray-500"/> Dashboard
                  </Link>
                  {category === 'Landlord' ? (
                      <Link to="/provider/add-property" className="p-3 bg-gray-50 rounded-xl font-bold text-gray-700 flex items-center" onClick={()=>setIsMenuOpen(false)}>
                          <PlusCircleIcon className="w-5 h-5 mr-3 text-blue-500"/> Add Room
                      </Link>
                  ) : (
                      <Link to="/provider/manage-service" className="p-3 bg-gray-50 rounded-xl font-bold text-gray-700 flex items-center" onClick={()=>setIsMenuOpen(false)}>
                          <PlusCircleIcon className="w-5 h-5 mr-3 text-blue-500"/> Manage Service
                      </Link>
                  )}
                  <button onClick={handleLogout} className="p-3 bg-red-50 text-red-600 rounded-xl font-bold text-left flex items-center mt-2">
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3"/> Logout
                  </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default ProviderNavbar;