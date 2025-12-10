import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import Loader from '../../components/common/Loader';
import { 
  UserIcon, AcademicCapIcon, MapPinIcon, 
  FireIcon, SparklesIcon, ArrowLeftIcon, 
  CheckCircleIcon, XCircleIcon, HeartIcon
} from '@heroicons/react/24/solid';

const RoommateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock Fetch (Real API integration ready)
  useEffect(() => {
      setTimeout(() => {
          setProfile({
              _id: id,
              name: 'Rahul Sharma',
              college: 'Madicaps University',
              course: 'B.Tech CS',
              year: '3rd Year',
              hometown: 'Bhopal',
              matchPercentage: 85,
              habits: { smoking: 'No', drinking: 'No', diet: 'Veg', sleep: 'Night Owl' },
              bio: "I am a night owl, love coding and cricket. Looking for a chill roommate who respects cleanliness.",
              budget: '₹3000 - ₹5000',
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`
          });
          setLoading(false);
      }, 800);
  }, [id]);

  if (loading) return <Loader text="Checking Vibe..." />;
  if (!profile) return <div className="p-10 text-center">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-white pb-24 font-sans relative overflow-x-hidden">
        
        {/* 1. HERO HEADER */}
        <div className="relative h-72 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-b-[3rem] shadow-2xl overflow-hidden">
            
            {/* Decorative Circles */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            {/* Nav */}
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-all z-20">
                <ArrowLeftIcon className="w-6 h-6"/>
            </button>

            {/* Profile Image */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-36 h-36 rounded-full border-[6px] border-white shadow-2xl bg-gray-100 overflow-hidden relative"
                >
                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                </motion.div>
                <div className="absolute bottom-3 right-3 bg-green-500 w-6 h-6 rounded-full border-2 border-white shadow-md animate-pulse" title="Online"></div>
            </div>
        </div>

        {/* 2. MAIN INFO */}
        <div className="pt-20 px-6 text-center">
            <motion.h1 
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-black text-gray-900"
            >
                {profile.name}
            </motion.h1>
            
            <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-1"/> {profile.course}
                </span>
                <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1"/> {profile.hometown}
                </span>
            </div>

            {/* Match Score Card */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
                className="mt-6 mx-auto max-w-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white p-1 rounded-2xl shadow-lg"
            >
                <div className="bg-white text-gray-900 rounded-xl p-3 flex items-center justify-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-full">
                        <FireIcon className="w-6 h-6 text-pink-600 animate-pulse"/> 
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vibe Match</p>
                        <p className="text-xl font-black text-pink-600">{profile.matchPercentage}% Compatible</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* 3. DETAILS SECTION */}
        <div className="max-w-lg mx-auto px-6 mt-8 space-y-6">
            
            {/* Bio */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
                <SparklesIcon className="w-8 h-8 text-yellow-400 absolute -top-4 -right-2 rotate-12" />
                <h3 className="font-bold text-gray-900 mb-2">About Me</h3>
                <p className="text-gray-600 text-sm leading-relaxed italic">"{profile.bio}"</p>
            </div>

            {/* Habits Grid */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4 px-2">Lifestyle & Habits</h3>
                <div className="grid grid-cols-2 gap-4">
                    <HabitBox label="Smoking" value={profile.habits.smoking} type={profile.habits.smoking === 'No' ? 'good' : 'bad'} icon="🚭" />
                    <HabitBox label="Drinking" value={profile.habits.drinking} type={profile.habits.drinking === 'No' ? 'good' : 'bad'} icon="🍺" />
                    <HabitBox label="Diet" value={profile.habits.diet} type="neutral" icon="🥗" />
                    <HabitBox label="Sleep" value={profile.habits.sleep || 'Regular'} type="neutral" icon="😴" />
                </div>
            </div>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-6 left-6 right-6 z-50">
                <div className="shadow-2xl rounded-2xl overflow-hidden">
                    <WhatsAppButton 
                        phoneNumber="919876543210" // Use real phone in production
                        message={`Hey ${profile.name}, we have a ${profile.matchPercentage}% match on Student Sathi! Wanna connect?`}
                        label={`Connect with ${profile.name.split(' ')[0]}`}
                        className="w-full py-4 font-bold text-lg bg-[#25D366] hover:bg-[#20bd5a]"
                    />
                </div>
            </div>
            
        </div>
    </div>
  );
};

// Helper Component for Habits
const HabitBox = ({ label, value, type, icon }) => {
    const colors = {
        good: 'bg-green-50 text-green-700 border-green-200',
        bad: 'bg-red-50 text-red-700 border-red-200',
        neutral: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
        <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-transform hover:scale-105 ${colors[type]}`}>
            <span className="text-2xl">{icon}</span>
            <span className="text-[10px] font-bold uppercase opacity-70">{label}</span>
            <span className="text-sm font-extrabold">{value}</span>
        </div>
    );
};

export default RoommateDetails;