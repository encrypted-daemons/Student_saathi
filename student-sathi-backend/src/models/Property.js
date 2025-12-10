const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // --- 1. Basic Info ---
  title: { 
    type: String, 
    required: [true, 'Title zaroori hai (e.g. 2 Seater Room)'], 
    trim: true 
  },
  description: { type: String },
  
  // Type Dropdown
  type: { 
    type: String, 
    enum: ['Single Room', 'Double Sharing', 'Triple Sharing', 'Flat', 'Hostel', 'PG'],
    required: true 
  },
  
  genderPreference: {
    type: String,
    enum: ['Boys Only', 'Girls Only', 'Family', 'Any'],
    default: 'Any'
  },

  // --- 2. Financials (Asli Mudda) ---
  rent: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
  isNegotiable: { type: Boolean, default: false },
  
  // Ground Reality: Hidden Costs
  electricityBill: {
    type: String,
    enum: ['Included', 'Excluded', 'Meter Reading', 'Fixed Amount'],
    default: 'Excluded'
  },
  maintenance: { type: Number, default: 0 },

  // --- 3. Location & Map (Path ke liye zaroori) ---
  address: { type: String, required: true },
  city: { type: String, default: 'Indore' },
  landmark: { type: String },
  
  // 👇 GEO-LOCATION (Google Map Path isse banega)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [Longitude, Latitude]
  },

  // --- 4. Room Inventory (Kya saman milega?) ---
  furnishing: {
    type: String,
    enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
    default: 'Unfurnished'
  },
  inventory: {
    bed: { type: Boolean, default: false },
    mattress: { type: Boolean, default: false }, // Gadda
    cupboard: { type: Boolean, default: false }, // Almari
    table: { type: Boolean, default: false },
    fan: { type: Boolean, default: true },
    light: { type: Boolean, default: true }
  },

  // --- 5. Amenities (Suvidhayein) ---
  amenities: {
    wifi: { type: Boolean, default: false },
    attachedBathroom: { type: Boolean, default: false }, // Sabse important
    roWater: { type: Boolean, default: false },
    messAvailable: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    cooler: { type: Boolean, default: false },
    hotWater: { type: Boolean, default: false } // Geyser
  },

  // --- 6. Strict Rules (Makan Malik ki shartein) ---
  rules: {
    gateClosingTime: { type: String, default: 'No Restriction' },
    nonVegAllowed: { type: Boolean, default: true },
    guestsAllowed: { type: String, enum: ['Allowed', 'Day Only', 'Not Allowed'], default: 'Day Only' },
    smokingAllowed: { type: Boolean, default: false },
    noticePeriod: { type: String, default: '1 Month' }
  },

  // --- 7. Media & Status ---
  images: [String], // Photo URLs
  isAvailable: { type: Boolean, default: true },
  views: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);