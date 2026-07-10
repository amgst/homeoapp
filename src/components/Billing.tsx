import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, Calendar, Plus, Printer, ShieldCheck, Tag, CreditCard, 
  Trash2, TrendingUp, Filter, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { getBills, saveBill, generateBillNumber, generateBillId, getPatients } from '../utils/db';
import { Bill } from '../types';

interface BillingProps {
  onPrintBillReceipt: (billId: string, visitId: string) => void;
}

export default function Billing({ onPrintBillReceipt }: BillingProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Cash' | 'Card' | 'Online'>('All');
  
  // Custom manual bill form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    patientName: '',
    doctorFee: 500,
    medicineCharges: 250,
    discount: 50,
    paymentMethod: 'Cash',
  });

  const loadData = () => {
    setBills(getBills().sort((a, b) => b.date.localeCompare(a.date)));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateManualBill = () => {
    if (!newBill.patientName) {
      alert('Please fill out the Patient Name.');
      return;
    }

    const billId = generateBillId();
    const billNum = generateBillNumber();
    const fee = newBill.doctorFee || 0;
    const medCharges = newBill.medicineCharges || 0;
    const disc = newBill.discount || 0;
    const finalAmt = Math.max(0, fee + medCharges - disc);

    const manualBill: Bill = {
      id: billId,
      billNumber: billNum,
      patientId: 'HHC-MANUAL',
      patientName: newBill.patientName,
      doctorFee: fee,
      medicineCharges: medCharges,
      discount: disc,
      totalAmount: finalAmt,
      paymentMethod: newBill.paymentMethod || 'Cash',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    saveBill(manualBill);
    loadData();
    setShowManualForm(false);
    setNewBill({
      patientName: '',
      doctorFee: 500,
      medicineCharges: 250,
      discount: 50,
      paymentMethod: 'Cash',
    });
  };

  // Stats
  const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const cashRevenue = bills.filter(b => b.paymentMethod === 'Cash').reduce((sum, b) => sum + b.totalAmount, 0);
  const cardRevenue = bills.filter(b => b.paymentMethod === 'Card').reduce((sum, b) => sum + b.totalAmount, 0);
  const onlineRevenue = bills.filter(b => b.paymentMethod === 'Online').reduce((sum, b) => sum + b.totalAmount, 0);

  // Search query
  const filteredBills = bills.filter(b => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = b.billNumber.toLowerCase().includes(term) || 
                          b.patientName.toLowerCase().includes(term);
    const matchesPayment = paymentFilter === 'All' || b.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Billing & Invoices</h2>
          <p className="text-sm text-slate-500">Generate, track, and manage clinic receipts and income records</p>
        </div>
        {!showManualForm && (
          <button 
            onClick={() => setShowManualForm(true)}
            className="flex items-center justify-center space-x-2 py-2.5 px-5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-sm transition-all text-sm cursor-pointer"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>Generate Quick Bill</span>
          </button>
        )}
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Total Revenue</span>
          <span className="text-2xl font-display font-black text-slate-800 font-mono">PKR {totalRevenue.toLocaleString()}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Cash Payments</span>
          <span className="text-xl font-display font-bold text-green-700 font-mono">PKR {cashRevenue.toLocaleString()}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Card Payments</span>
          <span className="text-xl font-display font-bold text-blue-700 font-mono">PKR {cardRevenue.toLocaleString()}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Online Payments</span>
          <span className="text-xl font-display font-bold text-indigo-700 font-mono">PKR {onlineRevenue.toLocaleString()}</span>
        </div>
      </div>

      {showManualForm ? (
        /* Quick Manual Invoicing Form */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-lg">Generate Quick Clinic Bill</h3>
            <button 
              onClick={() => setShowManualForm(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
            >
              Cancel Bill
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Patient Name</label>
              <input 
                type="text" 
                value={newBill.patientName || ''} 
                onChange={(e) => setNewBill(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="e.g., Walk-in customer, General sales"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Payment Method</label>
              <select 
                value={newBill.paymentMethod || 'Cash'} 
                onChange={(e) => setNewBill(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm text-slate-700 font-semibold"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online">Online / EasyPaisa / JazzCash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Clinic Consultation Fee (PKR)</label>
              <input 
                type="number" 
                value={newBill.doctorFee || ''} 
                onChange={(e) => setNewBill(prev => ({ ...prev, doctorFee: parseInt(e.target.value, 10) || 0 }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-mono text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Remedy Charges (PKR)</label>
              <input 
                type="number" 
                value={newBill.medicineCharges || ''} 
                onChange={(e) => setNewBill(prev => ({ ...prev, medicineCharges: parseInt(e.target.value, 10) || 0 }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Discount (PKR)</label>
              <input 
                type="number" 
                value={newBill.discount || ''} 
                onChange={(e) => setNewBill(prev => ({ ...prev, discount: parseInt(e.target.value, 10) || 0 }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-mono text-slate-700"
              />
            </div>

            <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Calculated Invoice Total:</p>
                <p className="text-xl font-black text-green-900 font-mono">
                  PKR {Math.max(0, (newBill.doctorFee || 0) + (newBill.medicineCharges || 0) - (newBill.discount || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
            <button 
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateManualBill}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save & Finalize Invoice
            </button>
          </div>
        </div>
      ) : (
        /* Bill listings and Search */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-5 w-5" />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices by Bill Number (e.g. INV-2026-0001) or Patient Name..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:bg-white text-slate-700 text-sm font-medium transition-all"
              />
            </div>

            {/* Payment Method Filters */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Payment:</span>
              {(['All', 'Cash', 'Card', 'Online'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentFilter(method)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    paymentFilter === method 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs font-medium text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Bill Number</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Consult Fee</th>
                  <th className="py-3 px-3">Remedies</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">No invoices recorded or matching criteria.</td>
                  </tr>
                ) : (
                  filteredBills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold font-mono text-green-800">{b.billNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{b.patientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold font-mono uppercase">{b.patientId}</p>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500">{b.date}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          b.paymentMethod === 'Cash' 
                            ? 'bg-green-50 text-green-700' 
                            : b.paymentMethod === 'Card' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">PKR {b.doctorFee}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">PKR {b.medicineCharges}</td>
                      <td className="py-3.5 px-3 font-mono text-rose-500">- PKR {b.discount}</td>
                      <td className="py-3.5 px-4 font-bold font-mono text-slate-800 text-right text-xs">
                        PKR {b.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            // Find matching visit to load medicines and doctor notes on thermal receipt if available
                            onPrintBillReceipt(b.id, b.id.replace('BILL', 'VIS'));
                          }}
                          className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold transition-all inline-flex items-center justify-center cursor-pointer"
                          title="Print thermal clinical receipt"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
