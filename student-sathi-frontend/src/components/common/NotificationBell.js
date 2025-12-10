import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import notificationService from '../../services/notificationService';
import { useSocket } from '../../context/SocketContext';

const NotificationBell = ({ onClick }) => { // Added onClick prop support
  const [notifications, setNotifications] = useState([]); // Always init as array
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      if (res.success) {
        // ✅ FIX: Safe fallback to empty array if undefined
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Notification error", err);
      setNotifications([]); // Error hone par crash nahi hoga
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    if (socket) {
      socket.on('notification', (newNotif) => {
        // ✅ FIX: Previous state safety
        setNotifications(prev => [newNotif, ...(prev || [])]);
        setUnreadCount(prev => (prev || 0) + 1);
      });
    }
    return () => {
        if(socket) socket.off('notification');
    }
  }, [socket]);

  const handleOpen = async (e) => {
    // Agar parent se onClick aaya hai (Mobile Menu ke liye), to use call karo
    if (onClick) onClick(e);
    
    setIsOpen(!isOpen);
    
    if (!isOpen && unreadCount > 0) {
      try {
        await notificationService.markAllRead();
        setUnreadCount(0);
      } catch(e) { console.error(e); }
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleOpen} 
        className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto animate-fade-in-down">
                <div className="p-3 border-b bg-gray-50 font-semibold text-gray-700 flex justify-between items-center">
                    <span>Notifications</span>
                    <span className="text-xs text-gray-400">Recent</span>
                </div>
                
                {/* ✅ FIX: Safe Length Check using '?' */}
                {notifications?.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                        <BellIcon className="w-8 h-8 mb-2 opacity-20"/>
                        No notifications yet
                    </div>
                ) : (
                    notifications.map((notif, index) => (
                    <div key={index} className={`p-3 border-b hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                        <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                        </span>
                    </div>
                    ))
                )}
            </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;