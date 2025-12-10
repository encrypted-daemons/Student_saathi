import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import Loader from '../../components/common/Loader';
import { 
  UserIcon, AcademicCapIcon, PencilSquareIcon, 
  CheckIcon, XMarkIcon, SparklesIcon, ArrowPathIcon, CameraIcon 
} from '@heroicons/react/24/solid';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', profilePic: '',
    studentProfile: {
      college: '', course: '', year: '', hometown: '', state: '',
      habits: { diet: 'Veg', smoking: 'No', drinking: 'No' }
    }
  });

  // Fixed Data Loading Logic
  useEffect(() => {
    if (user) {
      const profileData = user.studentProfile || user.details || {};
      
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profilePic: user.profilePic || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`,
        studentProfile: {
            college: profileData.college || '',
            course: profileData.course || '',
            year: profileData.year || '',
            hometown: profileData.hometown || '',
            state: profileData.state || '',
            habits: { 
                diet: profileData.habits?.diet || 'Veg', 
                smoking: profileData.habits?.smoking || 'No', 
                drinking: profileData.habits?.drinking || 'No' 
            }
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle Nested Updates Safely
    if (name.includes('.')) {
        const parts = name.split('.');
        
        if (parts[0] === 'habits') {
             setFormData(prev => ({
                ...prev,
                studentProfile: {
                    ...prev.studentProfile,
                    habits: { ...prev.studentProfile.habits, [parts[1]]: value }
                }
             }));
        } else if (parts[0] === 'studentProfile') {
             setFormData(prev => ({
                ...prev,
                studentProfile: { ...prev.studentProfile, [parts[1]]: value }
             }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const res = await authService.updateProfile(formData);
        if (res.success) {
            if (updateUserProfile) updateUserProfile(res.data.user); 
            else localStorage.setItem('user', JSON.stringify(res.data.user)); 
            
            setIsEditing(false);
            alert("Profile Updated! Looking fresh! 😎");
        }
    } catch (error) {
        console.error(error);
        alert("Update failed. Check console.");
    } finally {
        setLoading(false);
    }
  };

  const handleAvatarSelect = (url) => {
      setFormData(prev => ({ ...prev, profilePic: url }));
      setShowAvatarModal(false);
  };

  // --- AVATAR PICKER COMPONENT ---
  const AvatarPicker = () => {
      const [seeds, setSeeds] = useState(Array.from({ length: 12 }, () => Math.random().toString(36).substring(7)));
      const [style, setStyle] = useState('notionists'); 
      const refreshAvatars = () => setSeeds(Array.from({ length: 12 }, () => Math.random().toString(36).substring(7)));

      return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-yellow-300"/> Choose Your Avatar</h3>
                    <button onClick={() => setShowAvatarModal(false)}><XMarkIcon className="w-6 h-6 hover:rotate-90 transition-transform"/></button>
                </div>
                <div className="p-6">
                    <div className="flex gap-2 mb-6 justify-center overflow-x-auto pb-2 scrollbar-hide">
                        {['notionists', 'adventurer', 'avataaars', 'micah'].map((s) => (
                            <button key={s} onClick={() => setStyle(s)} className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${style === s ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'text-gray-500 border-gray-200'}`}>{s}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {seeds.map((seed) => {
                            const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
                            return (
                                <motion.div key={seed} whileHover={{ scale: 1.1 }} onClick={() => handleAvatarSelect(url)} className={`cursor-pointer rounded-full border-4 p-1 ${formData.profilePic === url ? 'border-green-500' : 'border-transparent hover:border-indigo-200'}`}>
                                    <img src={url} alt="avatar" className="w-full h-full rounded-full bg-gray-50" />
                                </motion.div>
                            );
                        })}
                    </div>
                    <button onClick={refreshAvatars} className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <ArrowPathIcon className="w-5 h-5 mr-2" /> Shuffle
                    </button>
                </div>
            </div>
        </motion.div>
      );
  };

  // Helper Field Component
  const Field = ({ label, value, name, isEdit }) => (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        {isEdit ? (
            <input name={name} value={value} onChange={handleChange} className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-gray-900" />
        ) : (
            <p className="font-bold text-gray-800 text-sm truncate min-h-[24px] flex items-center">{value || 'Not Set'}</p>
        )}
    </div>
  );

  // Helper Vibe Button Component
  const VibeButton = ({ label, current, options, name }) => (
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
              {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => isEditing && handleChange({ target: { name: name, value: opt } })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${current === opt ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'} ${!isEditing && current !== opt ? 'opacity-50 cursor-default' : 'cursor-pointer hover:scale-105'}`}
                    disabled={!isEditing}
                  >
                      {opt}
                  </button>
              ))}
          </div>
      </div>
  );

  if (!user) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans relative overflow-x-hidden">
      <AnimatePresence>{showAvatarModal && <AvatarPicker />}</AnimatePresence>

      {/* Header Background */}
      <div className="h-48 bg-gradient-to-r from-purple-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-10">
          
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
              <motion.div 
                 whileHover={isEditing ? { scale: 1.05 } : {}}
                 onClick={() => isEditing && setShowAvatarModal(true)}
                 className={`w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white relative group ${isEditing ? 'cursor-pointer ring-4 ring-purple-300' : ''}`}
              >
                  <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  {isEditing && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-100 transition-opacity">
                          <CameraIcon className="w-8 h-8 mb-1" /><span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                      </div>
                  )}
              </motion.div>
              
              <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-black text-gray-900">{formData.name}</h1>
                  <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-1 mt-1">
                      <AcademicCapIcon className="w-4 h-4 text-purple-500" /> {formData.studentProfile.college || 'College Name'}
                  </p>
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                disabled={loading}
                className={`px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all ${isEditing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'}`}
              >
                {loading ? <span>Saving...</span> : isEditing ? <><CheckIcon className="w-5 h-5" /> Save</> : <><PencilSquareIcon className="w-5 h-5 text-purple-600" /> Edit Profile</>}
              </motion.button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold text-lg flex items-center text-gray-800"><UserIcon className="w-5 h-5 mr-2 text-purple-500" /> Personal Info</h3>
                  <div className="grid grid-cols-1 gap-3">
                      <Field label="Full Name" value={formData.name} name="name" isEdit={isEditing} />
                      <Field label="Phone" value={formData.phone} name="phone" isEdit={isEditing} />
                      <Field label="Home Town" value={formData.studentProfile.hometown} name="studentProfile.hometown" isEdit={isEditing} />
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                  <h3 className="font-bold text-lg flex items-center text-gray-800"><SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" /> Campus Vibe</h3>
                  <div className="grid grid-cols-2 gap-3">
                      <Field label="Course" value={formData.studentProfile.course} name="studentProfile.course" isEdit={isEditing} />
                      <Field label="Year" value={formData.studentProfile.year} name="studentProfile.year" isEdit={isEditing} />
                  </div>
                  <div className="border-t border-gray-100 my-2"></div>
                  <VibeButton label="Diet" current={formData.studentProfile.habits.diet} options={['Veg', 'Non-Veg', 'Eggitarian']} name="habits.diet"/>
                  <div className="grid grid-cols-2 gap-3">
                    <VibeButton label="Smoking" current={formData.studentProfile.habits.smoking} options={['No', 'Yes']} name="habits.smoking"/>
                    <VibeButton label="Drinking" current={formData.studentProfile.habits.drinking} options={['No', 'Yes']} name="habits.drinking"/>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;