import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid, 
  MagnifyingGlassIcon as SearchSolid, 
  SparklesIcon as SparklesSolid, 
  UserIcon as UserSolid 
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'home', 
      icon: HomeIcon, 
      activeIcon: HomeSolid, 
      label: 'Home', 
      path: '/student/dashboard' 
    },
    { 
      id: 'search', 
      icon: MagnifyingGlassIcon, 
      activeIcon: SearchSolid, 
      label: 'Rooms', 
      path: '/student/find-room' 
    },
    { 
      id: 'events', 
      icon: SparklesIcon, 
      activeIcon: SparklesSolid, 
      label: 'Chill Zone', 
      path: '/student/events' 
    },
    { 
      id: 'profile', 
      icon: UserIcon, 
      activeIcon: UserSolid, 
      label: 'Profile', 
      path: '/student/profile' 
    },
  ];

  // Hide BottomNav on specific full-screen pages (Optional)
  // if (location.pathname.includes('/login') || location.pathname.includes('/register')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 md:hidden z-[100] pb-safe safe-area-pb shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 group`}
            >
              {/* Active Background Pill Animation */}
              {isActive && (
                <motion.div 
                    layoutId="nav-active"
                    className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`} />
                
                {/* Active Dot */}
                {isActive && (
                    <motion.div 
                        layoutId="nav-dot"
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                    />
                )}
              </div>

              <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;