const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactCount
} = require('../contactService');
const pool = require('../../db/pool');

jest.mock('../../db/pool');

describe('contactService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = 'user-uuid';

  describe('getAllContacts', () => {
    it('should return a list of contacts', async () => {
      const mockContacts = [{ id: '1', name: 'Test Contact' }];
      const mockCount = '1';
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: mockCount }] })
        .mockResolvedValueOnce({ rows: mockContacts });

      const result = await getAllContacts(mockUserId, {});
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        contacts: mockContacts,
        count: 1,
        totalPages: 1
      });
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

      const result = await getContactById(mockUserId, '1');

      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        ...mockContact,
        deals: mockDeals,
        recent_activities: mockActivities
      });
    });

    it('should return null if contact not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getContactById(mockUserId, 'nonexistent');

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('createContact', () => {
    it('should create and return a new contact', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        status: 'Lead'
      };
      const mockReturn = { id: '1', ...contactData, avatar_initials: 'JO' };
      pool.query.mockResolvedValue({ rows: [mockReturn] });

      const result = await createContact(mockUserId, contactData);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReturn);
    });
  });

  describe('updateContact', () => {
    it('should update and return a contact', async () => {
      const contactData = { name: 'Jane Doe' };
      const mockReturn = { id: '1', name: 'Jane Doe' };
      pool.query.mockResolvedValue({ rows: [mockReturn] });

      const result = await updateContact(mockUserId, '1', contactData);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReturn);
    });

    it('should throw an error if no allowed fields are provided', async () => {
      await expect(updateContact(mockUserId, '1', { unknownField: 'test' })).rejects.toThrow('No fields to update');
    });
  });

  describe('deleteContact', () => {
    it('should soft delete a contact', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: '1' }] });
      const result = await deleteContact(mockUserId, '1');
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: '1' });
    });
  });
});