import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader'; // Safe loading state

// 👇 Import All Fixed & Premium Dashboards
import LandlordDashboard from './LandlordDashboard';   // Rooms/Hostels
import TransportDashboard from './TransportDashboard'; // Auto/Van/Bus
import ResourceDashboard from './ResourceDashboard';   // Library/Stationery/Coaching
import ServiceDashboard from './ServiceDashboard';     // Mess/Tiffin (Fallback)

const ProviderDashboard = () => {
  const { user, loading } = useAuth();

  // 1. Safety Check (Agar user load nahi hua)
  if (loading || !user) {
    return <Loader text="Loading Dashboard..." />;
  }
  
  // 2. Safe Data Extraction
  const providerData = user?.providerDetails || user?.details || {};
  
  // 3. Category Detection (Default to Landlord)
  const category = providerData.category || 'Landlord';

  console.log("🎛️ Dashboard Active:", category);

  // 4. SMART SWITCH LOGIC

  // Case A: Room Provider (Landlord)
  if (category === 'Landlord') {
      return <LandlordDashboard user={user} />;
  }

  // Case B: Transport Provider (Auto/Bus)
  if (category === 'Transport') {
      return <TransportDashboard user={user} />;
  }

  // Case C: Resource Providers (Library, Stationery, Coaching)
  if (['Library', 'Stationery', 'Coaching'].includes(category)) {
      return <ResourceDashboard user={user} />;
  }

  // Case D: Service Providers (Mess/Tiffin - Default Fallback)
  return <ServiceDashboard user={user} category={category} />;
};

export default ProviderDashboard;