import React, { useState } from 'react';
import { useProperties } from '../hooks/useProperties';
import { useCRM } from '../context/CRMContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { formatCurrency } from '../utils/format';
import Badge from '../components/Badge';

const Properties = () => {
  const { data: properties, loading, createProperty, updateProperty, deleteProperty } = useProperties();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0, status: 'available', property_type: 'residential',
    bedrooms: 0, bathrooms: 0, sqft: 0, address: '', image_url: ''
  });

  const handleOpenCreate = () => {
    setSelectedProperty(null);
    setFormData({ title: '', description: '', price: 0, status: 'available', property_type: 'residential', bedrooms: 0, bathrooms: 0, sqft: 0, address: '', image_url: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (prop) => {
    setSelectedProperty(prop);
    setFormData({
      title: prop.title, description: prop.description || '', price: prop.price, status: prop.status,
      property_type: prop.property_type, bedrooms: prop.bedrooms || 0, bathrooms: prop.bathrooms || 0,
      sqft: prop.sqft || 0, address: prop.address || '', image_url: prop.image_url || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    let success = false;
    if (selectedProperty) {
      success = await updateProperty(selectedProperty.id, formData);
    } else {
      success = await createProperty(formData);
    }
    if (success) setShowModal(false);
  };

  const handleDelete = async () => {
    if (selectedProperty) {
      await deleteProperty(selectedProperty.id);
      setShowDeleteModal(false);
      setShowModal(false);
    }
  };

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Portfolio Management</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Properties.</h2>
          <Button variant="primary" onClick={handleOpenCreate}>Add Listing</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && properties.length === 0 ? (
          [1,2,3].map(i => <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-3xl" />)
        ) : (
          properties.map(prop => (
            <div key={prop.id} className="bg-surface-container-lowest rounded-[32px] overflow-hidden border border-slate-50 editorial-shadow hover:shadow-xl transition-all cursor-pointer" onClick={() => handleOpenEdit(prop)}>
               <div className="h-48 bg-slate-100 relative group">
                  {prop.image_url ? (
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                       <span className="material-symbols-outlined text-4xl mb-2">home_work</span>
                       <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                     <Badge variant={prop.status === 'available' ? 'success' : prop.status === 'pending' ? 'warning' : 'neutral'}>
                        {prop.status}
                     </Badge>
                  </div>
               </div>
               
               <div className="p-6">
                  <h3 className="text-lg font-bold text-on-surface truncate mb-1">{prop.title}</h3>
                  <p className="text-xs text-on-surface-variant truncate mb-4">{prop.address || 'Address not specified'}</p>
                  
                  <div className="flex items-center gap-4 mb-6">
                     <div className="flex items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-sm">bed</span>
                        <span className="text-xs font-bold">{prop.bedrooms || 0}</span>
                     </div>
                     <div className="flex items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-sm">shower</span>
                        <span className="text-xs font-bold">{prop.bathrooms || 0}</span>
                     </div>
                     <div className="flex items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-sm">square_foot</span>
                        <span className="text-xs font-bold">{prop.sqft || 0}</span>
                     </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                     <div className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(prop.price)}</div>
                     <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{prop.property_type}</span>
                  </div>
               </div>
            </div>
          ))
        )}
        
        {!loading && properties.length === 0 && (
           <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">real_estate_agent</span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active listings in portfolio.</p>
           </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedProperty ? "Edit Listing" : "New Listing"} size="lg">
        <div className="space-y-8">
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Listing Title *</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary outline-none transition-all" 
                placeholder="e.g. Luxury Penthouse Suite" 
              />
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Price *</label>
                 <div className="flex items-center bg-slate-50 rounded-xl px-4 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <span className="text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full py-3 px-2 bg-transparent text-sm font-bold border-none outline-none"
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Status</label>
                    <select 
                       value={formData.status}
                       onChange={e => setFormData({...formData, status: e.target.value})}
                       className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold shadow-sm outline-none border-none"
                    >
                       <option value="available">Available</option>
                       <option value="pending">Pending</option>
                       <option value="sold">Sold</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Type</label>
                    <select 
                       value={formData.property_type}
                       onChange={e => setFormData({...formData, property_type: e.target.value})}
                       className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold shadow-sm outline-none border-none"
                    >
                       <option value="residential">Residential</option>
                       <option value="commercial">Commercial</option>
                       <option value="land">Land</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl">
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Bedrooms</label>
                 <input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})} className="w-full bg-white rounded-lg py-2 px-3 text-sm font-bold outline-none border-none" />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Bathrooms</label>
                 <input type="number" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})} className="w-full bg-white rounded-lg py-2 px-3 text-sm font-bold outline-none border-none" />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Square Feet</label>
                 <input type="number" value={formData.sqft} onChange={e => setFormData({...formData, sqft: Number(e.target.value)})} className="w-full bg-white rounded-lg py-2 px-3 text-sm font-bold outline-none border-none" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Address</label>
                 <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold outline-none border-none" placeholder="Full property address" />
              </div>
              <div className="col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Image URL</label>
                 <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold outline-none border-none" placeholder="https://..." />
              </div>
              <div className="col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Description</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 rounded-xl py-4 px-4 min-h-[100px] text-sm outline-none border-none" placeholder="Property details..." />
              </div>
           </div>

           <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              {selectedProperty ? (
                 <Button variant="secondary" className="!text-red-600 hover:!bg-red-50" onClick={() => setShowDeleteModal(true)}>
                    <span className="material-symbols-outlined text-sm mr-2">delete</span> Delete Listing
                 </Button>
              ) : <div />}
              <div className="flex gap-4">
                 <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                 <Button variant="primary" onClick={handleSubmit} disabled={!formData.title || formData.price <= 0}>
                   {selectedProperty ? 'Save Changes' : 'Create Listing'}
                 </Button>
              </div>
           </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
        <div className="space-y-6">
          <p className="text-on-surface text-lg">Are you sure you want to remove <strong>{selectedProperty?.title}</strong>? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="primary" className="!bg-red-600 hover:!bg-red-700 !text-white" onClick={handleDelete}>Yes, Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Properties;
