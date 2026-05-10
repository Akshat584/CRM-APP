const taskService = require('../taskService');
const pool = require('../../db/pool');

jest.mock('../../db/pool');

describe('taskService', () => {
  const userId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should fetch tasks with default options', async () => {
      const mockTasks = [{ id: '1', title: 'Task 1' }];
      pool.query.mockResolvedValue({ rows: mockTasks });

      const result = await taskService.getAllTasks(userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tasks WHERE user_id = $1'),
        [userId, 20, 0]
      );
      expect(result).toEqual(mockTasks);
    });

    it('should filter by status and priority', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await taskService.getAllTasks(userId, { status: 'Todo', priority: 'High' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND status = $2 AND priority = $3'),
        [userId, 'Todo', 'High', 20, 0]
      );
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = { title: 'New Task', priority: 'Medium' };
      const mockSaved = { id: '1', ...taskData };
      pool.query.mockResolvedValue({ rows: [mockSaved] });

      const result = await taskService.createTask(userId, taskData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        [userId, undefined, undefined, 'New Task', 'Medium', 'Todo', undefined, undefined, undefined]
      );
      expect(result).toEqual(mockSaved);
    });
  });

  describe('updateTask', () => {
    it('should update task fields selectively', async () => {
      const taskId = 'task-1';
      const updateData = { title: 'Updated Title', status: 'Done' };
      pool.query.mockResolvedValue({ rows: [{ id: taskId, ...updateData }] });

      const result = await taskService.updateTask(userId, taskId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE\s+tasks\s+SET\s+title\s+=\s+\$1,\s+status\s+=\s+\$2/i),
        ['Updated Title', 'Done', taskId, userId]
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should prevent updating non-allowed fields', async () => {
      const taskId = 'task-1';
      const updateData = { user_id: 'malicious-id', title: 'Valid' };
      pool.query.mockResolvedValue({ rows: [{ id: taskId, title: 'Valid' }] });

      await taskService.updateTask(userId, taskId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE\s+tasks\s+SET\s+title\s+=\s+\$1/i),
        ['Valid', taskId, userId] // user_id should NOT be in values
      );
    });
  });
});