const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }, // Optional
  
  type: { 
    type: String, 
    enum: ['Electricity', 'Water', 'Cleaning', 'Furniture', 'Wifi', 'Other'],
    required: true 
  },
  description: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved'], 
    default: 'Open' 
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);