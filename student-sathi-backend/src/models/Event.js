const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // --- 1. Event Info ---
  title: { 
    type: String, 
    required: [true, 'Event ka naam kya hai? (e.g. Mahakal Bhandara)'], 
    trim: true 
  },
  description: { type: String, required: true },
  
  category: {
    type: String,
    // 👇 Students ke interest ki categories
    enum: ['Bhandara', 'Concert', 'Workshop', 'College Fest', 'Sports', 'Meetup', 'Flash Mob', 'Protest/Rally'],
    required: true
  },

  // --- 2. Date & Time ---
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. "Abhi chalu hai" or "12:00 PM"
  
  // --- 3. Location ---
  venue: { type: String, required: true }, // e.g. "Bholaram Ustad Marg"
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },

  // --- 4. Entry & Type ---
  isFree: { type: Boolean, default: true },
  entryFee: { type: Number, default: 0 },
  isStudentEvent: { type: Boolean, default: false }, // Pata chale ki Official hai ya Student ne dala hai

  // --- 5. GROUND REALITY STATUS (Live Updates) ---
  foodStatus: {
    type: String,
    enum: ['Bharpur Hai 🍲', 'Khatam hone wala hai ⚠️', 'N/A'],
    default: 'N/A'
  },
  crowdStatus: {
    type: String,
    enum: ['Khali hai ✅', 'Thodi Bheed 🚶', 'Full House 🚫'],
    default: 'Thodi Bheed 🚶'
  },

  // --- 6. Social ---
  image: { type: String }, 
  goingCount: { type: Number, default: 0 },
  
  // Auto expire events after 24 hours to keep feed fresh
  createdAt: { type: Date, default: Date.now, expires: 86400 } 

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);