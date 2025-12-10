const Issue = require('../models/Issue');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const sendNotification = require('../utils/notificationHelper');

// Create Issue (Student)
exports.raiseIssue = async (req, res) => {
  try {
    const { ownerId, type, description } = req.body;
    
    const issue = await Issue.create({
      student: req.user.id,
      owner: ownerId,
      type,
      description
    });

    // Notify Owner
    const io = req.app.get('io');
    sendNotification(io, ownerId, 'New Complaint ⚠️', `${req.user.name} reported a ${type} issue.`, 'error');

    successResponse(res, 'Issue Reported Successfully', issue, 201);
  } catch (e) { errorResponse(res, e.message, 500); }
};

// Get Issues (Owner)
exports.getOwnerIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ owner: req.user.id })
      .populate('student', 'name phone')
      .sort({ createdAt: -1 });
    successResponse(res, 'Issues fetched', issues);
  } catch (e) { errorResponse(res, e.message, 500); }
};

// Resolve Issue (Owner)
exports.updateStatus = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    issue.status = req.body.status;
    await issue.save();
    
    // Notify Student
    const io = req.app.get('io');
    sendNotification(io, issue.student, 'Issue Update ✅', `Your complaint is now ${issue.status}`, 'success');

    successResponse(res, 'Status Updated');
  } catch (e) { errorResponse(res, e.message, 500); }
};