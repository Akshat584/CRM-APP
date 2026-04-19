const mockQuery = jest.fn();

module.exports = {
  query: mockQuery,
  connect: jest.fn().mockResolvedValue({
    query: mockQuery,
    release: jest.fn(),
  }),
  end: jest.fn()
};
