const Issue = require('../models/Issue');
const User = require('../models/User');
const Property = require('../models/Property');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const sendNotification = require('../utils/notificationHelper');

exports.getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalProperties = await Property.countDocuments();
    const totalServices = await Service.countDocuments();
    
    
    const pendingVerifications = await User.countDocuments({ role: 'provider', 'providerDetails.isVerified': false });

    successResponse(res, 'Stats Fetched', {
        totalStudents, totalProviders, totalProperties, totalServices, pendingVerifications
    });
  } catch (error) { errorResponse(res, error.message); }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, verified } = req.query;
    let query = {};
    if (role) query.role = role;
    if (verified === 'false') query['providerDetails.isVerified'] = false;

    const users = await User.find(query).sort({ createdAt: -1 });
    successResponse(res, 'Users Fetched', users);
  } catch (error) { errorResponse(res, error.message); }
};

exports.verifyProvider = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'provider') return errorResponse(res, 'Invalid Provider', 400);

    user.providerDetails.isVerified = !user.providerDetails.isVerified;
    await user.save();

    // Notify Provider
    const io = req.app.get('io');
    const status = user.providerDetails.isVerified ? 'Verified ✅' : 'Unverified ⚠️';
    sendNotification(io, user._id, 'Account Status', `Your account is now ${status}.`);

    successResponse(res, `Provider ${status}`);
  } catch (error) { errorResponse(res, error.message); }
};

// 4. Broadcast Notification 
exports.broadcast = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    const query = targetRole === 'all' ? {} : { role: targetRole };
    
    const users = await User.find(query).select('_id');
    const io = req.app.get('io');

    // Bulk Notification
    users.forEach(u => {
        sendNotification(io, u._id, title, message, 'info');
    });

    successResponse(res, `Broadcast sent to ${users.length} users.`);
  } catch (error) { errorResponse(res, error.message); }
};

exports.getAllDisputes = async (req, res) => {
  try {
    const disputes = await Issue.find()
      .populate('student', 'name phone')
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 }); 
    
    successResponse(res, 'Disputes Fetched', disputes);
  } catch (error) { errorResponse(res, error.message); }
};

exports.resolveDispute = async (req, res) => {
  try {
    await Issue.findByIdAndUpdate(req.params.id, { status: 'Resolved' });
    successResponse(res, 'Issue Marked Resolved ✅');
  } catch (error) { errorResponse(res, error.message); }
};

exports.getLogs = async (req, res) => {
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt');
    const recentProps = await Property.find().sort({ createdAt: -1 }).limit(5).select('title createdAt');

    const logs = [
        ...recentUsers.map(u => ({ type: 'USER_JOINED', msg: `${u.name} joined as ${u.role}`, time: u.createdAt })),
        ...recentProps.map(p => ({ type: 'PROPERTY_ADDED', msg: `New Property listed: ${p.title}`, time: p.createdAt }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    successResponse(res, 'Logs Fetched', logs);
  } catch (error) { errorResponse(res, error.message); }
};