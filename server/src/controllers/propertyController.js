const pool = require('../db/pool');

const getProperties = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const result = await pool.query(
      `SELECT * FROM properties WHERE organization_id = $1 ORDER BY created_at DESC`,
      [organizationId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch properties' });
  }
};

const createProperty = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { title, description, price, status, property_type, bedrooms, bathrooms, sqft, address, image_url } = req.body;
    
    const result = await pool.query(
      `INSERT INTO properties (organization_id, title, description, price, status, property_type, bedrooms, bathrooms, sqft, address, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [organizationId, title, description, price, status || 'available', property_type || 'residential', bedrooms, bathrooms, sqft, address, image_url]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create property' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { title, description, price, status, property_type, bedrooms, bathrooms, sqft, address, image_url } = req.body;
    
    const result = await pool.query(
      `UPDATE properties 
       SET title = $1, description = $2, price = $3, status = $4, property_type = $5, bedrooms = $6, bathrooms = $7, sqft = $8, address = $9, image_url = $10
       WHERE id = $11 AND organization_id = $12
       RETURNING *`,
      [title, description, price, status, property_type, bedrooms, bathrooms, sqft, address, image_url, id, organizationId]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Property not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update property' });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;
    
    await pool.query('DELETE FROM properties WHERE id = $1 AND organization_id = $2', [id, organizationId]);
    res.json({ success: true, data: { message: 'Property deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete property' });
  }
};

module.exports = {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty
};