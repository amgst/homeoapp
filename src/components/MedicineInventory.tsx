import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Plus, Trash2, Edit3, AlertTriangle, Calendar, ShieldCheck, 
  BarChart, CircleDollarSign, Check, X, QrCode, Tag, FlaskConical, Pill, Droplet, Layers, Sparkles
} from 'lucide-react';
import { 
  getInventory, saveInventoryItem, deleteInventoryItem, generateInventoryId 
} from '../utils/db';
import { InventoryMedicine } from '../types';

export default function MedicineInventory() {
  const [inventory, setInventory] = useState<InventoryMedicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Potency' | 'Mother Tincture' | 'Tablet' | 'Syrup' | 'Biochemic Salt' | 'Compound'>('All');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryMedicine>>({
    id: '',
    name: '',
    potency: '30C',
    form: 'Potency',
    company: '',
    batchNumber: '',
    expiryDate: '',
    bottleSize: '30 ml',
    purchasePrice: 0,
    salePrice: 0,
    currentStock: 10,
    minimumStock: 5,
    barcode: '',
    qrCode: ''
  });

  const loadData = () => {
    setInventory(getInventory());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['purchasePrice', 'salePrice', 'currentStock', 'minimumStock'].includes(name) 
        ? parseInt(value, 10) || 0 
        : value
    }));
  };

  const handleOpenNewForm = () => {
    setEditMode(false);
    const newId = generateInventoryId();
    const defaultForm = typeFilter === 'All' ? 'Potency' : typeFilter;
    let defaultPotency = '30C';
    if (defaultForm === 'Mother Tincture') {
      defaultPotency = 'Q';
    } else if (defaultForm === 'Biochemic Salt') {
      defaultPotency = '6X';
    } else if (defaultForm === 'Tablet' || defaultForm === 'Syrup' || defaultForm === 'Compound') {
      defaultPotency = 'N/A';
    }

    setFormData({
      id: newId,
      name: '',
      potency: defaultPotency,
      form: defaultForm,
      company: 'Dr. Reckeweg',
      batchNumber: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 years expiry
      bottleSize: defaultForm === 'Biochemic Salt' ? '20g Tablets' : '30 ml',
      purchasePrice: 100,
      salePrice: 150,
      currentStock: 15,
      minimumStock: 4,
      barcode: `4000${Math.floor(10000000 + Math.random() * 90000000)}`,
      qrCode: `HHC-${newId}`
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.potency) {
      alert('Please fill out the Remedy Name and Potency.');
      return;
    }

    const itemToSave: InventoryMedicine = {
      id: formData.id!,
      name: formData.name,
      potency: formData.potency,
      form: formData.form || 'Potency',
      company: formData.company || 'Unknown Company',
      batchNumber: formData.batchNumber || 'N/A',
      expiryDate: formData.expiryDate || new Date().toISOString().split('T')[0],
      bottleSize: formData.bottleSize || '30 ml',
      purchasePrice: formData.purchasePrice || 0,
      salePrice: formData.salePrice || 0,
      currentStock: formData.currentStock ?? 0,
      minimumStock: formData.minimumStock || 4,
      barcode: formData.barcode,
      qrCode: formData.qrCode || `HHC-${formData.id}`
    };

    saveInventoryItem(itemToSave);
    loadData();
    setShowForm(false);
    setEditMode(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this remedy from stock inventory?')) {
      deleteInventoryItem(id);
      loadData();
    }
  };

  const handleEdit = (item: InventoryMedicine) => {
    setFormData(item);
    setEditMode(true);
    setShowForm(true);
  };

  // Stock status checks
  const isLowStock = (item: InventoryMedicine) => item.currentStock > 0 && item.currentStock <= item.minimumStock;
  const isOutOfStock = (item: InventoryMedicine) => item.currentStock <= 0;
  const isExpiringSoon = (item: InventoryMedicine) => {
    if (!item.expiryDate) return false;
    const exp = new Date(item.expiryDate);
    const today = new Date();
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  };

  // Search filter
  const filteredMeds = inventory.filter(i => {
    // Apply type filter
    if (typeFilter !== 'All') {
      const itemForm = i.form || 'Potency';
      if (itemForm !== typeFilter) return false;
    }

    const query = searchQuery.toLowerCase();
    const matchesSearch = i.name.toLowerCase().includes(query) || 
                          i.potency.toLowerCase().includes(query) || 
                          i.company.toLowerCase().includes(query);
    
    if (!matchesSearch) return false;

    if (stockFilter === 'Low Stock') return isLowStock(i);
    if (stockFilter === 'Out of Stock') return isOutOfStock(i);
    if (stockFilter === 'Expiring Soon') return isExpiringSoon(i);
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const categories = [
    { type: 'All', label: 'All Medicines', urdu: 'سارا سٹاک', icon: Package, color: 'text-slate-600 bg-slate-100 border-slate-200' },
    { type: 'Potency', label: 'Potency', urdu: 'پوٹینسی', icon: Tag, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { type: 'Mother Tincture', label: 'Mother Tinctures', urdu: 'مدر ٹینکچر', icon: FlaskConical, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { type: 'Biochemic Salt', label: 'Biochemic Salts', urdu: 'بائیو کیمک سالٹ', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { type: 'Tablet', label: 'Tablets', urdu: 'ٹیبلیٹ', icon: Pill, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { type: 'Syrup', label: 'Syrups', urdu: 'سرپ', icon: Droplet, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { type: 'Compound', label: 'Compounds', urdu: 'کمپاؤنڈز', icon: Layers, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ] as const;

  const getCount = (type: string) => {
    if (type === 'All') return inventory.length;
    return inventory.filter(i => (i.form || 'Potency') === type).length;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Pharmacy Inventory</h2>
          <p className="text-sm text-slate-500">Track constitutional remedies, stock levels, and batch numbers</p>
        </div>
        {!showForm && (
          <button 
            onClick={handleOpenNewForm}
            className="flex items-center justify-center space-x-2 py-2.5 px-5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-sm transition-all text-sm cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Stock Medicine</span>
          </button>
        )}
      </div>

      {/* Medicine Category Cards Grid */}
      {!showForm && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = getCount(cat.type);
            const isActive = typeFilter === cat.type;
            return (
              <button
                key={cat.type}
                onClick={() => setTypeFilter(cat.type)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group relative cursor-pointer ${
                  isActive 
                    ? 'border-green-600 bg-green-50/50 shadow-md ring-2 ring-green-600/25' 
                    : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-green-600 text-white' : cat.color.split(' ')[1] + ' ' + cat.color.split(' ')[0]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    {count}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 tracking-tight leading-none">
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1" dir="rtl">
                      {cat.urdu}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showForm ? (
        /* Medicine Addition / Modification Form */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-green-800 text-lg">
              {editMode ? `Edit Remedy Record: ${formData.id}` : 'Register New Remedy Stock'}
            </h3>
            <button 
              onClick={() => { setShowForm(false); setEditMode(false); }}
              className="text-slate-400 hover:text-slate-600 font-semibold text-sm hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Primary Identifiers */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stock ID</label>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  disabled 
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Remedy / Medicine Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name || ''} 
                  onChange={handleInputChange}
                  placeholder="e.g., Arnica Montana, Lycopodium"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Medicine Form *</label>
                <select 
                  name="form" 
                  value={formData.form || 'Potency'} 
                  onChange={(e) => {
                    const selectedForm = e.target.value as 'Potency' | 'Mother Tincture' | 'Tablet' | 'Syrup' | 'Biochemic Salt' | 'Compound';
                    setFormData(prev => {
                      const updated = { ...prev, form: selectedForm };
                      if (selectedForm === 'Mother Tincture') {
                        updated.potency = 'Q';
                      } else if (selectedForm === 'Biochemic Salt') {
                        updated.potency = '6X';
                      } else if (selectedForm === 'Tablet' || selectedForm === 'Syrup' || selectedForm === 'Compound') {
                        updated.potency = 'N/A';
                      } else if (prev.potency === 'Q' || prev.potency === 'N/A' || prev.potency === '6X') {
                        updated.potency = '30C';
                      }
                      return updated;
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700 font-bold"
                >
                  <option value="Potency">Potency</option>
                  <option value="Mother Tincture">Mother Tincture</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Biochemic Salt">Biochemic Salt</option>
                  <option value="Compound">Compound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Potency / Strength *</label>
                <select 
                  name="potency" 
                  value={formData.potency || '30C'} 
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700 font-bold font-mono"
                >
                  <option value="30C">30C</option>
                  <option value="200C">200C</option>
                  <option value="1M">1M</option>
                  <option value="10M">10M</option>
                  <option value="CM">CM</option>
                  <option value="Q">Q (Mother Tincture)</option>
                  <option value="3X">3X</option>
                  <option value="6X">6X</option>
                  <option value="12X">12X</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>

            {/* Logistics Batch details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Manufacturing Company</label>
                <input 
                  type="text" 
                  name="company" 
                  value={formData.company || ''} 
                  onChange={handleInputChange}
                  placeholder="e.g., Dr. Reckeweg, Schwabe, SBL"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Batch Number</label>
                <input 
                  type="text" 
                  name="batchNumber" 
                  value={formData.batchNumber || ''} 
                  onChange={handleInputChange}
                  placeholder="AR-9921"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bottle Size / Package</label>
                <input 
                  type="text" 
                  name="bottleSize" 
                  value={formData.bottleSize || ''} 
                  onChange={handleInputChange}
                  placeholder="30 ml, 100 Pellets"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>
            </div>

            {/* Stock controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Stock Unit</label>
                <input 
                  type="number" 
                  name="currentStock" 
                  value={formData.currentStock ?? ''} 
                  onChange={handleInputChange}
                  placeholder="20"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm font-mono font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Minimum Limit Alert</label>
                <input 
                  type="number" 
                  name="minimumStock" 
                  value={formData.minimumStock || ''} 
                  onChange={handleInputChange}
                  placeholder="4"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm font-mono text-slate-700"
                />
              </div>
            </div>

            {/* Barcodes / Scan Codes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Barcode Value</label>
                <input 
                  type="text" 
                  name="barcode" 
                  value={formData.barcode || ''} 
                  onChange={handleInputChange}
                  placeholder="Product barcode standard digit string"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">QR Code ID</label>
                <input 
                  type="text" 
                  name="qrCode" 
                  value={formData.qrCode || ''} 
                  onChange={handleInputChange}
                  placeholder="QR security clinical lookup ID"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm font-mono"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => { setShowForm(false); setEditMode(false); }}
                className="flex items-center justify-center space-x-1 py-2.5 px-5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all text-sm cursor-pointer"
              >
                <span>Cancel</span>
              </button>

              <button 
                type="button"
                onClick={handleSave}
                className="flex items-center justify-center space-x-1 py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
              >
                <Check className="h-4.5 w-4.5" />
                <span>Save Remedy Item</span>
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Medicine Search and Stock Index */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-5 w-5" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search remedies by Name, Potency, or Manufacturer..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:bg-white text-slate-700 text-sm font-medium transition-all"
              />
            </div>

            {/* Warning Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase shrink-0">Filter Stock:</span>
              {(['All', 'Low Stock', 'Out of Stock'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStockFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    stockFilter === filter 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout of Remedies */}
          {filteredMeds.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm space-y-2 text-slate-400 font-medium">
              <Package className="h-10 w-10 mx-auto text-slate-300" />
              <p>No homeopathic remedies matching that criteria in stock.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredMeds.map((item) => {
                const isItemLow = isLowStock(item);
                const isItemOut = isOutOfStock(item);
                const isItemExp = isExpiringSoon(item);

                return (
                  <div 
                    key={item.id}
                    className={`bg-white p-5 rounded-2xl border shadow-sm transition-all relative flex flex-col justify-between group ${
                      isItemOut 
                        ? 'border-rose-200 bg-rose-50/10' 
                        : isItemLow 
                        ? 'border-amber-200 bg-amber-50/10'
                        : 'border-slate-100 hover:border-green-200'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Brand Label and Action Toolbar */}
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          {item.id}
                        </span>
                        
                        {/* Quick controls - permanently visible for convenient access */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button 
                            onClick={() => handleEdit(item)}
                            title="Edit remedy record"
                            className="p-1.5 bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            title="Delete remedy record"
                            className="p-1.5 bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Name & Potency */}
                      <div>
                        <div className="flex items-baseline space-x-1.5">
                          <h4 className="font-display font-black text-slate-800 text-base leading-tight">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                          {item.company} • {item.bottleSize}
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-bold text-[10px] font-mono">
                          FORM: {item.form || 'Potency'}
                        </span>
                        {item.potency !== 'N/A' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[10px] font-mono">
                            POTENCY: {item.potency}
                          </span>
                        )}
                        {isItemOut && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-bold text-[9px] uppercase tracking-wider animate-pulse flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" /> OUT OF STOCK
                          </span>
                        )}
                        {isItemLow && !isItemOut && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[9px] uppercase tracking-wider flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" /> LOW STOCK
                          </span>
                        )}
                      </div>

                      {/* Prices removed */}

                    </div>

                    {/* Stock balance indicator in footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Available Units</span>
                        <span className={`text-sm font-black font-mono ${isItemOut ? 'text-rose-600' : isItemLow ? 'text-amber-600' : 'text-slate-700'}`}>
                          {item.currentStock} Units
                        </span>
                      </div>

                      <div className="text-right text-[10px] text-slate-400 font-semibold font-mono">
                        <p className="text-[9px]">Batch: {item.batchNumber}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
