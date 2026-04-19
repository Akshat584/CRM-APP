const { body } = require('express-validator');
const taskService = require('../services/taskService');

const validateTask = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority').isIn(['High', 'Medium', 'Low']).withMessage('Invalid priority'),
  body('status').isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status')
];

const getTasks = async (req, res) => {
  try {
    const { status, priority, assignee_id, due_before, page, limit } = req.query;

    const tasks = await taskService.getAllTasks(req.user.userId, {
      status,
      priority,
      assignee_id,
      due_before,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.user.userId, req.params.id, req.body);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await taskService.deleteTask(req.user.userId, req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' }
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
};

module.exports = {
  validateTask,
  getTasks,
  createTask,
  updateTask,
  deleteTask
};