const { getAllContacts, getContactById } = require('../contactService');
const pool = require('../../db/pool');

jest.mock('../../db/pool');

describe('contactService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllContacts', () => {
    it('should return contacts for a user', async () => {
      const mockContacts = [{ id: '1', name: 'John Doe' }];
      pool.query.mockResolvedValue({ rows: mockContacts });

      const result = await getAllContacts('user1', { limit: 10, page: 1 });

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockContacts);
    });
  });

  describe('getContactById', () => {
    it('should return a contact with deals and activities', async () => {
      const mockContact = { id: '1', name: 'John Doe' };
      const mockDeals = [{ id: 'd1', title: 'Deal 1' }];
      const mockActivities = [{ id: 'a1', body: 'Activity 1' }];

      pool.query
        .mockResolvedValueOnce({ rows: [mockContact] })
        .mockResolvedValueOnce({ rows: mockDeals })
        .mockResolvedValueOnce({ rows: mockActivities });

      const result = await getContactById('user1', '1');

      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        ...mockContact,
        deals: mockDeals,
        recent_activities: mockActivities
      });
    });

    it('should return null if contact not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getContactById('user1', 'nonexistent');

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });
});