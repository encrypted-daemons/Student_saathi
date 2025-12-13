import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LocaleProvider } from './context/LocaleContext';

// Components
import Navbar from './components/common/Navbar'; // ✅ Imported, but used inside ProtectedLayout
import LoadingSpinner from './components/common/Loader';
import InstallPWA from './components/common/InstallPWA';
import UpdateToast from './components/common/UpdateToast';
import BottomNav from './components/layout/BottomNav';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// --- LAZY LOAD PAGES ---

// Auth
const Splash = React.lazy(() => import('./pages/Auth/Splash'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));

// Student Pages
const StudentDashboard = React.lazy(() => import('./pages/Student/Dashboard'));
const FindRoom = React.lazy(() => import('./pages/Student/FindRoom'));
const PropertyDetails = React.lazy(() => import('./pages/Student/PropertyDetails'));
const FindRoommate = React.lazy(() => import('./pages/Student/FindRoommate'));
const FindMess = React.lazy(() => import('./pages/Student/FindMess'));
const FindTransport = React.lazy(() => import('./pages/Student/FindTransport'));
const TransportDetails = React.lazy(() => import('./pages/Student/TransportDetails'));
const ServiceDetails = React.lazy(() => import('./pages/Student/ServiceDetails'));
const Marketplace = React.lazy(() => import('./pages/Student/Marketplace'));
const MarketplaceItemDetails = React.lazy(() => import('./pages/Student/MarketplaceItemDetails'));
const Events = React.lazy(() => import('./pages/Student/Events'));
const CityWiki = React.lazy(() => import('./pages/Student/CityWiki'));
const StudentProfile = React.lazy(() => import('./pages/Student/Profile'));
const RoommateDetails = React.lazy(() => import('./pages/Student/RoommateDetails'));

// Provider Pages
const ProviderDashboard = React.lazy(() => import('./pages/Provider/Dashboard'));
const AddProperty = React.lazy(() => import('./pages/Provider/AddProperty'));
const EditProperty = React.lazy(() => import('./pages/Provider/EditProperty'));
const AddService = React.lazy(() => import('./pages/Provider/AddService'));
const ManageService = React.lazy(() => import('./pages/Provider/ManageService'));
const AddTransport = React.lazy(() => import('./pages/Provider/AddTransport'));
const EditTransport = React.lazy(() => import('./pages/Provider/EditTransport'));
const AddResource = React.lazy(() => import('./pages/Provider/AddResource'));
const EditResource = React.lazy(() => import('./pages/Provider/EditResource'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));
const AdminActivityLogs = React.lazy(() => import('./pages/Admin/ActivityLogs'));
const AdminBroadcast = React.lazy(() => import('./pages/Admin/Broadcast'));
const AdminDisputes = React.lazy(() => import('./pages/Admin/Disputes'));
const AdminVerification = React.lazy(() => import('./pages/Admin/Verification'));


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="p-10 text-center"><h1>Something went wrong.</h1><button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Reload</button></div>;
    return this.props.children;
  }
}

// 👇 MODIFIED PROTECTED LAYOUT: Navbar yahan add kiya hai
const ProtectedLayout = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isProvider = allowedRoles.includes('provider') && (user.role === 'provider' || ['landlord', 'mess', 'transport', 'library', 'stationery', 'coaching'].includes(user.role));
  const hasAccess = allowedRoles.includes(user.role) || isProvider;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar /> 
      <Outlet />
    </>
  );
};

const StudentLayout = () => {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
};

const RootRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    serviceWorkerRegistration.register({
      onUpdate: (registration) => { setWaitingWorker(registration.waiting); setShowUpdate(true); },
    });
  }, []);

  const updateServiceWorker = () => {
    if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    setShowUpdate(false);
    window.location.reload();
  };

  return (
    <ErrorBoundary>
      <LocaleProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-gray-900">
                
                {/* ❌ REMOVED NAVBAR FROM HERE (Global) */}
                
                <InstallPWA />
                {showUpdate && <UpdateToast onRefresh={updateServiceWorker} onClose={() => setShowUpdate(false)} />}

                {/* Added padding-top only for protected routes via inner layouts, but removed global pt-16 */}
                <main className="flex-grow container mx-auto px-0 md:px-4 py-0 md:py-6 mb-16 md:mb-0">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      
                      {/* --- PUBLIC ROUTES (No Navbar) --- */}
                      <Route path="/" element={<Splash />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* --- 🎓 STUDENT ROUTES (Has Navbar via ProtectedLayout) --- */}
                      <Route path="/student" element={<ProtectedLayout allowedRoles={['student']} />}>
                          <Route element={<StudentLayout />}>
                              <Route path="dashboard" element={<StudentDashboard />} />
                              
                              <Route path="find-room" element={<FindRoom />} />
                              <Route path="property/:id" element={<PropertyDetails />} />
                              
                              <Route path="find-mess" element={<FindMess />} />
                              <Route path="find-transport" element={<FindTransport />} />
                              <Route path="transport/:id" element={<TransportDetails />} />
                              <Route path="service/:id" element={<ServiceDetails />} />
                              
                              <Route path="find-roommate" element={<FindRoommate />} />
                              <Route path="roommate/:id" element={<RoommateDetails />} />
                              <Route path="marketplace" element={<Marketplace />} />
                              <Route path="marketplace/:id" element={<MarketplaceItemDetails />} />
                              <Route path="events" element={<Events />} />
                              <Route path="wiki" element={<CityWiki />} />
                              <Route path="profile" element={<StudentProfile />} />
                              
                              <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                          </Route>
                      </Route>

                      {/* --- 🏠 PROVIDER ROUTES (Has Navbar via ProtectedLayout) --- */}
                      <Route path="/provider" element={<ProtectedLayout allowedRoles={['provider', 'landlord', 'mess', 'transport', 'library', 'coaching', 'stationery']} />}>
                          <Route path="dashboard" element={<ProviderDashboard />} />
                          
                          <Route path="add-property" element={<AddProperty />} />
                          <Route path="edit-property/:id" element={<EditProperty />} />
                          
                          <Route path="add-service" element={<AddService />} />
                          <Route path="manage-service" element={<ManageService />} />
                          
                          <Route path="add-transport" element={<AddTransport />} />
                          <Route path="edit-transport/:id" element={<EditTransport />} />
                          
                          <Route path="add-resource" element={<AddResource />} />
                          <Route path="edit-resource/:id" element={<EditResource />} />

                          <Route path="*" element={<Navigate to="/provider/dashboard" replace />} />
                      </Route>

                      {/* --- 🛡️ ADMIN ROUTES (Has Navbar via ProtectedLayout) --- */}
                      <Route path="/admin" element={<ProtectedLayout allowedRoles={['admin']} />}>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="logs" element={<AdminActivityLogs />} />
                          <Route path="broadcast" element={<AdminBroadcast />} />
                          <Route path="disputes" element={<AdminDisputes />} />
                          <Route path="verification" element={<AdminVerification />} />
                          
                          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                      </Route>
                      {/* --- GLOBAL FALLBACK --- */}
                      <Route path="*" element={<RootRedirect />} />

                    </Routes>
                  </Suspense>
                </main>
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}

export default App;
