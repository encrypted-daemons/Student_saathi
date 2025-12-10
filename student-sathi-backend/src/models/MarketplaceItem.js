const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // --- Product Info ---
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Books', 'Electronics', 'Furniture', 'Stationery', 'Vehicles', 'Fashion', 'Others'],
    required: true
  },
  
  // --- Condition & Price ---
  condition: {
    type: String,
    enum: ['New (Sealed)', 'Like New', 'Good', 'Fair', 'Heavily Used'],
    default: 'Good'
  },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // Compare karne ke liye
  isNegotiable: { type: Boolean, default: true }, // Ground Reality: Bargaining hoti hai

  // --- Trust Factors ---
  billAvailable: { type: Boolean, default: false },
  usageDuration: { type: String }, // e.g. "6 Months old"

  // --- Location (Pickup Point) ---
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [Lng, Lat]
    addressText: { type: String } // e.g. "Madicaps Canteen"
  },

  images: [String],
  isSold: { type: Boolean, default: false },
  views: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);