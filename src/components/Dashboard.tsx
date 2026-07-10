import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, AlertTriangle, TrendingUp, Calendar, DollarSign, 
  PlusCircle, Search, ClipboardList, Package, BarChart3, AlertOctagon 
} from 'lucide-react';
import { getPatients, getVisits, getBills, getInventory } from '../utils/db';
import { Patient, Visit, Bill, InventoryMedicine } from '../types';
import MurakkabatChart from './MurakkabatChart';

interface DashboardProps {
  onAction: (action: 'new-patient' | 'search-patient' | 'new-prescription' | 'inventory' | 'reports') => void;
  onSelectPatient?: (patientId: string) => void;
}

export default function Dashboard({ onAction, onSelectPatient }: DashboardProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [inventory, setInventory] = useState<InventoryMedicine[]>([]);

  useEffect(() => {
    setPatients(getPatients());
    setVisits(getVisits());
    setBills(getBills());
    setInventory(getInventory());
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // Calculates stats
  const todayPatientsCount = visits.filter(v => v.visitDate === todayStr).length;
  const totalPatientsCount = patients.length;
  const followupsToday = visits.filter(v => v.followUpDate === todayStr);
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minimumStock).length;
  
  const todayIncome = bills
    .filter(b => b.date.startsWith(todayStr))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const monthlyIncome = bills
    .filter(b => b.date.startsWith(currentMonthStr))
    .reduce((sum, b) => sum + b.totalAmount, 0);


  return (
    <div className="space-y-6 font-sans">
      
      {/* Alert Banners */}
      <div className="space-y-3">
        {lowStockCount > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-xl shadow-xs flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Low Stock Alert!</p>
              <p className="text-xs text-amber-700 font-medium">
                There are {lowStockCount} homeopathic remedy items below or at their minimum stock level. 
                <button onClick={() => onAction('inventory')} className="ml-1 text-amber-900 underline font-semibold hover:text-amber-950">
                  Manage stock
                </button>
              </p>
            </div>
          </div>
        )}


      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Visits</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-display font-bold text-slate-800">{todayPatientsCount}</span>
            <span className="text-xs text-green-600 ml-2 font-medium">Active today</span>
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-display font-bold text-slate-800">{totalPatientsCount}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">In local database</span>
          </div>
        </div>

        {/* Follow-ups Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Follow-ups Today</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-display font-bold text-slate-800">{followupsToday.length}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">Scheduled</span>
          </div>
        </div>

        {/* Medicines Low in Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Medicines</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-display font-bold text-slate-800">{lowStockCount}</span>
            <span className="text-xs text-amber-600 ml-2 font-medium">Need ordering</span>
          </div>
        </div>
      </div>

      {/* Quick Action Rails */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => onAction('new-patient')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-green-200 hover:bg-green-50/50 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <PlusCircle className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700 mt-3">New Patient</span>
            <span className="text-[10px] text-slate-400 mt-1">Register record</span>
          </button>

          <button
            onClick={() => onAction('search-patient')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-green-200 hover:bg-green-50/50 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <Search className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700 mt-3">Search Patient</span>
            <span className="text-[10px] text-slate-400 mt-1">ID, Name, Mobile</span>
          </button>

          <button
            onClick={() => onAction('new-prescription')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-green-200 hover:bg-green-50/50 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <ClipboardList className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700 mt-3">New Prescription</span>
            <span className="text-[10px] text-slate-400 mt-1">Select from Inventory</span>
          </button>

          <button
            onClick={() => onAction('inventory')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-green-200 hover:bg-green-50/50 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700 mt-3">Remedy Inventory</span>
            <span className="text-[10px] text-slate-400 mt-1">Stock & expiry logs</span>
          </button>

          <button
            onClick={() => onAction('reports')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-green-200 hover:bg-green-50/50 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-slate-700 mt-3">Clinic Reports</span>
            <span className="text-[10px] text-slate-400 mt-1">Daily / Monthly stats</span>
          </button>
        </div>
      </div>

      {/* Today's Follow-up Patients and Recent Patients list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Follow ups */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-800 text-lg">Today's Follow-ups</h3>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
              {followupsToday.length} Patient{followupsToday.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {followupsToday.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">No follow-ups scheduled for today.</p>
            ) : (
              followupsToday.map((v) => {
                const patient = patients.find(p => p.id === v.patientId);
                return (
                  <div 
                    key={v.id} 
                    onClick={() => onSelectPatient && patient && onSelectPatient(patient.id)}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-green-50/40 rounded-xl transition-all cursor-pointer border border-transparent hover:border-green-100 group"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-slate-800 group-hover:text-green-700 transition-colors">
                        {patient?.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        ID: {v.patientId} • Mobile: {patient?.mobileNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] bg-slate-200/60 text-slate-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                        View History
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-800 text-lg">Recent Registrations</h3>
            <button 
              onClick={() => onAction('search-patient')}
              className="text-xs font-semibold text-green-600 hover:text-green-700 hover:underline"
            >
              View all patients
            </button>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {patients.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">No patients registered yet.</p>
            ) : (
              patients.slice(-4).reverse().map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => onSelectPatient && onSelectPatient(p.id)}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-green-50/40 rounded-xl transition-all cursor-pointer border border-transparent hover:border-green-100 group"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-slate-800 group-hover:text-green-700 transition-colors">
                      {p.fullName}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      ID: {p.id} • {p.gender}, {p.age} yrs • {p.bloodGroup || 'Blood N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium block">Reg Date:</span>
                    <span className="text-xs font-semibold text-slate-600 font-mono">{p.registrationDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Interactive 50 Murakkabat Reference Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <MurakkabatChart />
      </div>

    </div>
  );
}
