const activityService = require('../activityService');
const pool = require('../../db/pool');

jest.mock('../../db/pool');

describe('activityService', () => {
  const userId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllActivities', () => {
    it('should fetch activities with default options', async () => {
      const mockActivities = [{ id: '1', subject: 'Call' }];
      pool.query.mockResolvedValue({ rows: mockActivities });

      const result = await activityService.getAllActivities(userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM activities WHERE user_id = $1'),
        [userId, 20, 0]
      );
      expect(result).toEqual(mockActivities);
    });

    it('should filter by contact_id, deal_id, and type', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const options = {
        contact_id: 'contact-1',
        deal_id: 'deal-1',
        type: 'call'
      };

      await activityService.getAllActivities(userId, options);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND contact_id = $2 AND deal_id = $3 AND type = $4'),
        [userId, 'contact-1', 'deal-1', 'call', 20, 0]
      );
    });
  });

  describe('createActivity', () => {
    it('should create a new activity', async () => {
      const activityData = {
        subject: 'Meeting',
        type: 'meeting',
        body: 'Discussed project'
      };
      const mockSaved = { id: '1', ...activityData };
      pool.query.mockResolvedValue({ rows: [mockSaved] });

      const result = await activityService.createActivity(userId, activityData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO activities'),
        [userId, undefined, undefined, 'meeting', 'Meeting', 'Discussed project', expect.any(Date)]
      );
      expect(result).toEqual(mockSaved);
    });
  });

  describe('deleteActivity', () => {
    it('should delete an activity', async () => {
      const activityId = 'act-1';
      pool.query.mockResolvedValue({ rows: [{ id: activityId }] });

      const result = await activityService.deleteActivity(userId, activityId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM activities WHERE id = $1 AND user_id = $2'),
        [activityId, userId]
      );
      expect(result.id).toBe(activityId);
    });
  });
});