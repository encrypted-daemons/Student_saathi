import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("🔵 Sending Login Request...");
      const res = await api.post('/auth/login', formData);
      
      // 👇 DEBUGGING LOGS (Console F12 me dikhenge)
      console.log("🟢 FULL RESPONSE:", res);
      console.log("👤 USER OBJECT:", res.data?.user);
      console.log("🏷️ ROLE FROM DB:", res.data?.user?.role);

      if (res.success) {
        const { token, user } = res.data;
        
        // Clear old data first
        localStorage.clear();
        
        // Save new data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (login) login(user);

        // 👇 STRICT CHECKING
        const role = user.role ? user.role.trim().toLowerCase() : '';

        if (role === 'student') {
            console.log("✅ Matched Student -> Redirecting...");
            navigate('/student/dashboard');
        } 
        else if (role === 'provider') {
            console.log("✅ Matched Provider -> Redirecting...");
            navigate('/provider/dashboard');
        } 
        else if (role === 'admin') {
            console.log("✅ Matched Admin -> Redirecting...");
            navigate('/admin/dashboard');
        } 
        else {
            console.error("❌ UNKNOWN ROLE:", role);
            alert(`Error: Your account has an invalid role: ${role}`);
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary-600 p-8 text-white text-center">
           <h2 className="text-3xl font-bold">Welcome Back</h2>
           <p className="text-primary-100">Login to Student Sathi</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <input required name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            <input required name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <button disabled={loading} className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-colors">
             {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-gray-600 text-sm">
             New here? <Link to="/register" className="text-primary-600 font-bold">Create Account</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;