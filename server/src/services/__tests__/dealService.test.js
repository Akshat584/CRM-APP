const {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getPipelineStats
} = require('../dealService');
const pool = require('../../db/pool');

jest.mock('../../db/pool');

describe('dealService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = 'user-uuid';

  describe('getAllDeals', () => {
    it('should return a list of deals', async () => {
      const mockDeals = [{ id: '1', title: 'Test Deal' }];
      pool.query.mockResolvedValue({ rows: mockDeals });

      const result = await getAllDeals(mockUserId, {});
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeals);
    });
  });

  describe('getDealById', () => {
    it('should return a single deal', async () => {
      const mockDeal = { id: '1', title: 'Test Deal' };
      pool.query.mockResolvedValue({ rows: [mockDeal] });

      const result = await getDealById(mockUserId, '1');
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('createDeal', () => {
    it('should create and return a deal', async () => {
      const dealData = { title: 'New Deal', value: 1000, stage: 'New' };
      const mockDeal = { id: '1', ...dealData };

      const client = {
        query: jest.fn().mockResolvedValue({ rows: [mockDeal] }),
        release: jest.fn()
      };
      pool.connect.mockResolvedValue(client);

      const result = await createDeal(mockUserId, dealData);
      
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO deals'), expect.any(Array));
      expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO deal_stage_history'), expect.any(Array));
      expect(client.query).toHaveBeenCalledWith('COMMIT');
      expect(client.release).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('updateDeal', () => {
    it('should update and return a deal, and handle transaction for closed deals', async () => {
      const dealData = { stage: 'Closed Won' };
      const mockDeal = { id: '1', stage: 'Closed Won', contact_id: 'c1' };

      const client = {
        query: jest.fn().mockResolvedValue({ rows: [mockDeal] }),
        release: jest.fn()
      };
      pool.connect.mockResolvedValue(client);

      const result = await updateDeal(mockUserId, '1', dealData);
      
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
      expect(client.release).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('deleteDeal', () => {
    it('should delete and return the deleted deal ID', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: '1' }] });

      const result = await deleteDeal(mockUserId, '1');
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: '1' });
    });
  });
});
