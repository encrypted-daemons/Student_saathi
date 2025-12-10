import React, { useState, useEffect } from 'react';
import { CloudIcon, SunIcon, BoltIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Live Weather for Indore (Default Campus Hub)
    // Open-Meteo is Free & No Key Required
    fetch('https://api.open-meteo.com/v1/forecast?latitude=22.7196&longitude=75.8577&current_weather=true')
      .then(res => res.json())
      .then(data => {
          setWeather({
              temp: Math.round(data.current_weather.temperature),
              code: data.current_weather.weathercode,
              wind: data.current_weather.windspeed
          });
          setLoading(false);
      })
      .catch(err => {
          console.error("Weather Error", err);
          setLoading(false);
      });
  }, []);

  // Helper to get dynamic UI based on weather code
  const getWeatherUI = (code) => {
     if (code === undefined) return { label: 'Loading...', icon: SunIcon, gradient: 'from-blue-400 to-blue-500' };
     
     // WMO Weather Codes Logic
     if (code <= 3) return { label: 'Clear Sky ☀️', icon: SunIcon, gradient: 'from-blue-400 to-blue-600' };
     if (code <= 48) return { label: 'Cloudy ☁️', icon: CloudIcon, gradient: 'from-gray-400 to-blue-400' };
     if (code <= 80) return { label: 'Rainy 🌧️', icon: CloudIcon, gradient: 'from-indigo-500 to-blue-700' };
     return { label: 'Stormy ⛈️', icon: BoltIcon, gradient: 'from-slate-700 to-slate-900' };
  };

  const ui = getWeatherUI(weather?.code);
  const Icon = ui.icon;

  if (loading) return (
      <div className="h-32 rounded-3xl bg-gray-200 animate-pulse mb-6 w-full"></div>
  );

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br ${ui.gradient} relative overflow-hidden mb-6 flex justify-between items-center`}
    >
       {/* Background Decor Icon */}
       <Icon className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10 rotate-12" />

       {/* Left: Temp & Info */}
       <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
             <Icon className="w-5 h-5 text-yellow-300" />
             <span className="font-bold text-xs tracking-widest uppercase opacity-80">Indore Campus</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter drop-shadow-sm">
             {weather ? `${weather.temp}°` : '--'}
          </h2>
          <p className="text-sm font-bold opacity-90 mt-1">{ui.label}</p>
       </div>

       {/* Right: Badge */}
       <div className="text-right z-10">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold shadow-sm">
             Live Update
          </div>
          {weather && (
              <p className="text-[10px] mt-2 opacity-75 font-medium text-right">
                 Wind: {weather.wind} km/h
              </p>
          )}
       </div>
    </motion.div>
  );
};

export default WeatherWidget;