const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', taskController.getTasks);
router.post('/', validate, taskController.createTask);
router.put('/:id', validate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;