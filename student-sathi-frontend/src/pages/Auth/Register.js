import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { 
  UserIcon, BriefcaseIcon, AcademicCapIcon, 
  SparklesIcon, ChevronDownIcon 
} from '@heroicons/react/24/solid';

// --- REUSABLE CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ name, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || "Select";

  const handleSelect = (val) => {
    // Fake event object to match parent handler structure
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field flex justify-between items-center text-left bg-gray-50 h-[46px]" // Height match input field
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{selectedLabel}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-primary-50 transition-colors ${value === option.value ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  // --- FULL DATA STATE ---
  const [formData, setFormData] = useState({
    // 1. Basic
    name: '', phone: '', password: '',
    
    // 2. Provider Specific
    providerCategory: 'Landlord', businessName: '',

    // 3. Student Specific
    dob: '', gender: 'Male', caste: '',
    state: '', district: '', hometown: '',
    college: '', course: '', year: '1st',
    
    // Habits
    diet: 'Veg', smoking: 'No', drinking: 'No', cleanliness: 'Average',
    
    // Privacy
    relationshipStatus: 'Single', guestPolicy: 'Friends Allowed'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper for Option Buttons (Vibe Check)
  const OptionButton = ({ name, value, icon, label }) => (
    <button
      type="button"
      onClick={() => setFormData({ ...formData, [name]: value })}
      className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all border ${
        formData[name] === value
          ? 'bg-primary-100 border-primary-500 text-primary-700 shadow-sm'
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, role };
      const res = await api.post('/auth/register', payload);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        if (role === 'student') navigate('/student/dashboard');
        else navigate('/provider/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  // --- DROPDOWN OPTIONS ---
  const yearOptions = [
      { value: '1st', label: '1st Year' },
      { value: '2nd', label: '2nd Year' },
      { value: '3rd', label: '3rd Year' },
      { value: '4th', label: '4th Year' }
  ];

  const genderOptions = [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
  ];

  const categoryOptions = [
      { value: 'Landlord', label: '🏠 Landlord (Room/Hostel)' },
      { value: 'Mess', label: '🍱 Mess / Tiffin Center' },
      { value: 'Library', label: '📚 Library' },
      { value: 'Transport', label: '🚌 Transport / Auto' },
      { value: 'Coaching', label: '🎓 Coaching Institute' },
      { value: 'Stationery', label: '🖊️ Stationery / Book Store' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-visible border border-white/50 relative"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-8 text-white text-center relative overflow-hidden rounded-t-3xl">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" 
           />
           <h2 className="text-3xl font-extrabold tracking-tight relative z-10">Join the Tribe 🚀</h2>
           <p className="text-primary-100 text-sm mt-2 relative z-10">Student Sathi mein aapka swagat hai!</p>
        </div>

        {/* Role Switcher */}
        <div className="px-8 pt-6">
            <div className="flex p-1.5 bg-gray-100 rounded-2xl relative">
            {['student', 'provider'].map((tab) => (
                <button
                key={tab}
                onClick={() => setRole(tab)}
                className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all z-10 ${
                    role === tab 
                    ? 'bg-white text-primary-600 shadow-md scale-100' 
                    : 'text-gray-500 hover:text-gray-700 scale-95'
                }`}
                >
                {tab === 'student' ? <UserIcon className="w-5 h-5 mr-2" /> : <BriefcaseIcon className="w-5 h-5 mr-2" />}
                {tab === 'student' ? 'I am a Student' : 'I am a Partner'}
                </button>
            ))}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* --- SECTION 1: BASIC INFO --- */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basic Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="name" placeholder="Full Name" onChange={handleChange} className="input-field" />
                <input required name="phone" type="tel" placeholder="Phone Number (10 digits)" onChange={handleChange} className="input-field" />
                <input required name="password" type="password" placeholder="Set Password" onChange={handleChange} className="input-field md:col-span-2" />
            </div>
          </div>

          {/* --- SECTION 2: DYNAMIC FIELDS --- */}
          <AnimatePresence mode='wait'>
            
            {/* === STUDENT FORM === */}
            {role === 'student' ? (
              <motion.div 
                key="student"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Academic */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                        <AcademicCapIcon className="w-4 h-4 mr-1" /> Academic & Origins
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input required name="college" placeholder="College Name" onChange={handleChange} className="input-field" />
                        <input required name="course" placeholder="Course (e.g. MCA)" onChange={handleChange} className="input-field" />
                        
                        {/* CUSTOM SELECT: Year */}
                        <CustomSelect 
                            name="year" 
                            value={formData.year} 
                            onChange={handleChange} 
                            options={yearOptions} 
                            placeholder="Year"
                        />

                        <input name="hometown" placeholder="Home Town (City)" onChange={handleChange} className="input-field" />
                        <input name="state" placeholder="Home State" onChange={handleChange} className="input-field" />
                        
                        {/* CUSTOM SELECT: Gender */}
                        <CustomSelect 
                            name="gender" 
                            value={formData.gender} 
                            onChange={handleChange} 
                            options={genderOptions} 
                            placeholder="Gender"
                        />

                        <input name="caste" placeholder="Caste/Community (Optional)" onChange={handleChange} className="input-field md:col-span-2" />
                    </div>
                </div>

                {/* Vibe Check */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-1" /> Vibe Check
                    </h3>
                    
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Diet Preference</label>
                        <div className="grid grid-cols-4 gap-2">
                            <OptionButton name="diet" value="Veg" icon="🥬" label="Veg" />
                            <OptionButton name="diet" value="Non-Veg" icon="🍗" label="NV" />
                            <OptionButton name="diet" value="Eggitarian" icon="🥚" label="Egg" />
                            <OptionButton name="diet" value="Jain" icon="🥗" label="Jain" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Smoking?</label>
                            <div className="flex gap-2">
                                <OptionButton name="smoking" value="No" icon="🚭" label="No" />
                                <OptionButton name="smoking" value="Yes" icon="🚬" label="Yes" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Drinking?</label>
                            <div className="flex gap-2">
                                <OptionButton name="drinking" value="No" icon="🚫" label="No" />
                                <OptionButton name="drinking" value="Yes" icon="🍺" label="Yes" />
                            </div>
                        </div>
                    </div>
                </div>
              </motion.div>
            ) : (
              
              /* === PROVIDER FORM === */
              <motion.div 
                key="provider"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <BriefcaseIcon className="w-4 h-4 mr-1" /> Business Details
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Service Category</label>
                        {/* CUSTOM SELECT: Category */}
                        <CustomSelect 
                            name="providerCategory" 
                            value={formData.providerCategory} 
                            onChange={handleChange} 
                            options={categoryOptions} 
                            placeholder="Select Category"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Business Name</label>
                        <input required name="businessName" placeholder="e.g. Sharma Boys Hostel" onChange={handleChange} className="input-field w-full" />
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-70"
          >
            {loading ? 'Setting up profile...' : `Create ${role === 'student' ? 'Student' : 'Partner'} Account`}
          </motion.button>

          <p className="text-center text-gray-600 text-sm">
            Already joined? <Link to="/login" className="text-primary-600 font-bold hover:underline">Login here</Link>
          </p>
        </form>
      </motion.div>

      {/* Helper Styles */}
      <style>{`
        .input-field {
            width: 100%;
            padding: 0.75rem;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus, .input-field:focus-within {
            background-color: #fff;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Register;