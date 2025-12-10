import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { 
  CakeIcon, FireIcon, PencilSquareIcon, TrashIcon, 
  CurrencyRupeeIcon, PlusIcon, CheckBadgeIcon, XCircleIcon, CalendarDaysIcon,
  BookOpenIcon, ArrowLeftIcon, MegaphoneIcon, SunIcon, MoonIcon, AcademicCapIcon,
  PrinterIcon
} from '@heroicons/react/24/solid';

const ManageService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  
  // --- STATES ---
  const [isActive, setIsActive] = useState(true);
  const [newPlan, setNewPlan] = useState({ title: '', price: '', duration: 'Monthly' });

  // Mess Specific
  const [specialMenu, setSpecialMenu] = useState('');
  const [mealStatus, setMealStatus] = useState({ lunch: true, dinner: true }); 
  
  // Library Specific
  const [availableSeats, setAvailableSeats] = useState(0);
  
  // Stationery
  const [printRate, setPrintRate] = useState(0);
  const [hasSecondHand, setHasSecondHand] = useState(false);
  
  // Coaching
  const [newBatchDate, setNewBatchDate] = useState('');
  const [announcement, setAnnouncement] = useState('');


  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get('/services/my-services');
        
        if (res.success && res.data && res.data.length > 0) {
             const myService = res.data[0];
             setService(myService);
             setIsActive(myService.isActive);
             
             // Pre-fill Data
             if (myService.category === 'Mess') {
                 setSpecialMenu(myService.messDetails?.specialMenu || '');
             }
             else if (myService.category === 'Library') {
                 setAvailableSeats(myService.libraryDetails?.availableSeats || 0);
             }
             else if (myService.category === 'Stationery') {
                 setPrintRate(myService.stationeryDetails?.printingRate || 1);
                 setHasSecondHand(myService.stationeryDetails?.sellsSecondHand || false);
             }
             else if (myService.category === 'Coaching') {
                 setNewBatchDate(myService.coachingDetails?.newBatchDate || '');
                 setAnnouncement(myService.coachingDetails?.announcement || '');
             }

        } else {
             navigate('/provider/add-service', { replace: true });
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchService();
  }, [navigate]);

  // --- UPDATE HANDLER ---
  const handleUpdate = async () => {
    if(!service) return;
    try {
        let payload = {};
        
        if (service.category === 'Mess') {
            payload = { details: { specialMenu } };
        } else if (service.category === 'Library') {
            payload = { details: { availableSeats } };
        } else if (service.category === 'Stationery') {
            payload = { details: { printingRate: printRate, sellsSecondHand: hasSecondHand } };
        }
        else if (service.category === 'Coaching') {
            payload = { details: { newBatchDate, announcement } };
        }

        await api.put(`/services/${service._id}`, payload);
        
        if(service.category === 'Mess') alert("📢 Menu Broadcasted to Students! Notification Sent. 🔔");
        else alert("Updated Successfully! ✅");

    } catch(e) { alert("Update Failed"); }
  };

  const handleToggleStatus = async () => {
      try {
          await api.put(`/services/${service._id}`, { isActive: !isActive });
          setIsActive(!isActive);
      } catch(e) { alert("Failed"); }
  };

  // Plan Handlers
  const handleAddPlan = async () => {
      if(!newPlan.title || !newPlan.price) return alert("Fill details");
      try {
          const updatedPlans = [...(service.plans || []), { ...newPlan, price: Number(newPlan.price), features: [] }];
          await api.put(`/services/${service._id}`, { plans: updatedPlans });
          setService(prev => ({ ...prev, plans: updatedPlans }));
          setNewPlan({ title: '', price: '', duration: 'Monthly' });
      } catch(e) { alert("Failed"); }
  };

  const handleDeletePlan = async (idx) => {
      if(!window.confirm("Delete Plan?")) return;
      const updatedPlans = service.plans.filter((_, i) => i !== idx);
      await api.put(`/services/${service._id}`, { plans: updatedPlans });
      setService(prev => ({ ...prev, plans: updatedPlans }));
  };

  if (loading) return <Loader text="Opening Shop..." />;
  if (!service) return null;

  const isMess = service.category === 'Mess';
  const isLibrary = service.category === 'Library';
  const isStationery = service.category === 'Stationery';
  const isCoaching = service.category === 'Coaching';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
       {/* Header */}
       <div className="bg-white px-6 py-5 shadow-sm flex justify-between items-center sticky top-0 z-20 border-b border-gray-200">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/provider/dashboard')} className="text-gray-500 hover:text-black"><ArrowLeftIcon className="w-6 h-6"/></button>
             <div>
                 <h1 className="text-xl font-extrabold text-gray-900">{service.name}</h1>
                 <p className="text-[10px] text-gray-500 font-bold uppercase">{service.category} Manager</p>
             </div>
          </div>
          <button onClick={handleToggleStatus} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {isActive ? <CheckBadgeIcon className="w-4 h-4"/> : <XCircleIcon className="w-4 h-4"/>}
              {isActive ? 'OPEN' : 'CLOSED'}
          </button>
       </div>

       <div className="max-w-2xl mx-auto p-6 space-y-8">
           
           {/* --- 1. MESS CONTROL (Enhanced) --- */}
           {isMess && (
               <div className="bg-white p-6 rounded-3xl shadow-lg border border-orange-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><CakeIcon className="w-24 h-24 text-orange-500"/></div>
                   
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-lg text-orange-700 flex items-center">
                           <FireIcon className="w-5 h-5 mr-2"/> Today's Special
                       </h3>
                       <div className="flex gap-2">
                           <button 
                               onClick={() => setMealStatus(p => ({...p, lunch: !p.lunch}))}
                               className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1 ${mealStatus.lunch ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-400'}`}
                           >
                               <SunIcon className="w-4 h-4"/> Lunch {mealStatus.lunch ? 'ON' : 'OFF'}
                           </button>
                           <button 
                               onClick={() => setMealStatus(p => ({...p, dinner: !p.dinner}))}
                               className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1 ${mealStatus.dinner ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-400'}`}
                           >
                               <MoonIcon className="w-4 h-4"/> Dinner {mealStatus.dinner ? 'ON' : 'OFF'}
                           </button>
                       </div>
                   </div>

                   <textarea 
                       value={specialMenu} 
                       onChange={(e) => setSpecialMenu(e.target.value)} 
                       className="w-full p-4 bg-orange-50/50 rounded-2xl border-2 border-orange-100 focus:border-orange-400 outline-none h-32 resize-none font-medium text-gray-800 text-lg placeholder-gray-400" 
                       placeholder="Aaj khane me kya hai? (e.g. Shahi Paneer, 4 Roti, Rice, Salad)"
                   ></textarea>
                   
                   <button onClick={handleUpdate} className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                       <MegaphoneIcon className="w-5 h-5"/> Broadcast Menu
                   </button>
                   <p className="text-center text-xs text-gray-400 mt-2">Clicking this sends notification to all students.</p>
               </div>
           )}

           {/* --- 2. LIBRARY CONTROL --- */}
           {isLibrary && (
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                   <h3 className="font-bold text-lg text-blue-700 mb-3">Seat Availability</h3>
                   <div className="text-center mb-4"><span className="text-5xl font-black text-blue-600">{availableSeats}</span><span className="text-gray-400 text-sm font-bold"> / {service.libraryDetails?.totalSeats} Free</span></div>
                   <input type="range" min="0" max={service.libraryDetails?.totalSeats || 100} value={availableSeats} onChange={(e) => setAvailableSeats(e.target.value)} className="w-full accent-blue-600" />
                   <button onClick={handleUpdate} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">Update Seats 🪑</button>
               </div>
           )}

           {/* --- 3. STATIONERY CONTROL --- */}
           {isStationery && (
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-yellow-100">
                   <h3 className="font-bold text-lg text-yellow-700 mb-3 flex items-center"><PencilSquareIcon className="w-5 h-5 mr-2"/> Shop Updates</h3>
                   <div className="grid grid-cols-2 gap-4">
                       <div className="bg-yellow-50 p-3 rounded-xl">
                           <label className="text-xs font-bold text-yellow-800 uppercase block mb-1">Photocopy Rate</label>
                           <div className="flex items-center"><span className="text-lg font-bold text-gray-600 mr-1">₹</span><input type="number" value={printRate} onChange={(e) => setPrintRate(e.target.value)} className="w-full bg-transparent font-bold text-xl outline-none text-gray-900" /></div>
                       </div>
                       <div onClick={() => setHasSecondHand(!hasSecondHand)} className={`p-3 rounded-xl cursor-pointer border-2 transition-all flex flex-col justify-center items-center ${hasSecondHand ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                           <BookOpenIcon className={`w-6 h-6 mb-1 ${hasSecondHand ? 'text-green-600' : 'text-gray-400'}`}/>
                           <span className={`text-xs font-bold ${hasSecondHand ? 'text-green-700' : 'text-gray-500'}`}>{hasSecondHand ? 'Second Hand ✅' : 'No Old Books ❌'}</span>
                       </div>
                   </div>
                   <button onClick={handleUpdate} className="mt-4 w-full bg-yellow-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-yellow-600">Update Info 🖊️</button>
               </div>
           )}

           {/* --- 4. COACHING CONTROL --- */}
           {isCoaching && (
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><AcademicCapIcon className="w-24 h-24 text-purple-500"/></div>
                   
                   <h3 className="font-bold text-lg text-purple-800 mb-4 flex items-center">
                       <MegaphoneIcon className="w-5 h-5 mr-2"/> Notice Board
                   </h3>

                   <div className="space-y-4">
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Next Batch Starting</label>
                           <div className="flex items-center bg-purple-50 p-3 rounded-xl border border-purple-200">
                               <CalendarDaysIcon className="w-5 h-5 text-purple-600 mr-2"/>
                               <input type="date" value={newBatchDate} onChange={(e) => setNewBatchDate(e.target.value)} className="bg-transparent w-full outline-none font-bold text-purple-900" />
                           </div>
                       </div>

                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Latest Achievement / News</label>
                           <textarea 
                               value={announcement} 
                               onChange={(e) => setAnnouncement(e.target.value)} 
                               className="w-full p-3 bg-purple-50 rounded-xl border border-purple-200 focus:border-purple-500 outline-none h-20 resize-none font-medium"
                               placeholder="e.g. Congratulations Amit for AIR 100! 🎉"
                           ></textarea>
                       </div>
                   </div>

                   <button onClick={handleUpdate} className="mt-4 w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-transform active:scale-[0.98]">
                       Broadcast Update 📢
                   </button>
               </div>
           )}

           {/* --- 5. PLANS (Common) --- */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center"><CurrencyRupeeIcon className="w-5 h-5 mr-2 text-green-600"/> Pricing Plans</h3>
               <div className="space-y-3 mb-4">
                   {service.plans?.map((plan, i) => (
                       <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                           <div><p className="font-bold text-gray-900">{plan.title}</p><p className="text-xs text-gray-500 font-medium uppercase">{plan.duration}</p></div>
                           <div className="flex items-center gap-4"><span className="font-black text-xl text-green-600">₹{plan.price}</span><button onClick={() => handleDeletePlan(i)} className="text-red-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button></div>
                       </div>
                   ))}
                   {service.plans?.length === 0 && <p className="text-center text-gray-400 text-sm italic py-2">Add plans like 'Monthly Thali' or 'Library Pass'</p>}
               </div>
               <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl">
                   <input placeholder="Plan Name (e.g. Monthly)" value={newPlan.title} onChange={e=>setNewPlan({...newPlan, title: e.target.value})} className="flex-[2] p-3 bg-white rounded-xl border-none outline-none text-sm font-medium shadow-sm" />
                   <input placeholder="₹" type="number" value={newPlan.price} onChange={e=>setNewPlan({...newPlan, price: e.target.value})} className="w-24 p-3 bg-white rounded-xl border-none outline-none text-sm font-bold shadow-sm" />
                   <button onClick={handleAddPlan} className="bg-black text-white p-3 rounded-xl hover:bg-gray-800"><PlusIcon className="w-5 h-5"/></button>
               </div>
           </div>

       </div>
    </div>
  );
};

export default ManageService;