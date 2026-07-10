import { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, FileDown, TrendingUp, Package, Pill, Users, 
  DollarSign, Activity, Sparkles, Printer, CheckCircle 
} from 'lucide-react';
import { getPatients, getVisits, getBills, getInventory } from '../utils/db';
import { Patient, Visit, Bill, InventoryMedicine } from '../types';

export default function Reports() {
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
  const currentMonthStr = todayStr.substring(0, 7);
  const currentYearStr = todayStr.substring(0, 4);

  // 1. Patient Registrations statistics
  const dailyPatients = patients.filter(p => p.registrationDate === todayStr).length;
  const monthlyPatients = patients.filter(p => p.registrationDate.startsWith(currentMonthStr)).length;
  const yearlyPatients = patients.filter(p => p.registrationDate.startsWith(currentYearStr)).length;

  // 2. Financial Statistics
  const dailyIncome = bills
    .filter(b => b.date.startsWith(todayStr))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const monthlyIncome = bills
    .filter(b => b.date.startsWith(currentMonthStr))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalDiscountGiven = bills
    .filter(b => b.date.startsWith(currentMonthStr))
    .reduce((sum, b) => sum + b.discount, 0);

  // 3. Medicine / Remedy Statistics (Most Used Remedies based on prescriptions)
  const remedySalesMap: { [key: string]: { count: number; potency: string } } = {};
  visits.forEach(v => {
    v.medicines.forEach(m => {
      const key = `${m.name} ${m.potency}`;
      if (!remedySalesMap[key]) {
        remedySalesMap[key] = { count: 0, potency: m.potency };
      }
      remedySalesMap[key].count += 1;
    });
  });

  const sortedRemedies = Object.keys(remedySalesMap)
    .map(key => ({
      name: key,
      count: remedySalesMap[key].count,
      potency: remedySalesMap[key].potency
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5 remedies

  // 4. Low stock inventory report
  const lowStockRemedies = inventory.filter(i => i.currentStock <= i.minimumStock);

  // Export helper functions
  const triggerExport = (format: 'CSV' | 'Excel' | 'PDF', reportType: string) => {
    if (format === 'PDF') {
      window.print();
      return;
    }

    // Generate CSV raw string
    let csvContent = '';
    csvContent = "Remedy Name,Potency,Company,Current Stock,Min Stock\n" + 
      inventory.map(i => `"${i.name}",${i.potency},"${i.company}",${i.currentStock},${i.minimumStock}`).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HHC_Clinic_${reportType}_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Clinic Reports</h2>
          <p className="text-sm text-slate-500">Analyze clinical performance, financial parameters, and pharmacy sales</p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Registrations summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-sm flex items-center">
            <Users className="h-4.5 w-4.5 text-blue-600 mr-2" />
            Registration Statistics
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between py-2.5 font-medium text-slate-600">
              <span>Patients Registered Today:</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{dailyPatients}</span>
            </div>
            <div className="flex justify-between py-2.5 font-medium text-slate-600">
              <span>Registered This Month ({currentMonthStr}):</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{monthlyPatients}</span>
            </div>
            <div className="flex justify-between py-2.5 font-medium text-slate-600">
              <span>Registered This Year ({currentYearStr}):</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{yearlyPatients}</span>
            </div>
          </div>
        </div>

        {/* Action downloads block */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
          <h3 className="font-display font-bold text-slate-800 text-sm flex items-center">
            <FileDown className="h-4.5 w-4.5 text-indigo-600 mr-2" />
            Export & Downloads
          </h3>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <button 
              onClick={() => triggerExport('CSV', 'inventory')}
              className="py-3 px-3 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 font-bold text-slate-700 hover:text-emerald-800 text-center cursor-pointer transition-all"
            >
              📦 Export Remedy Inventory (CSV)
            </button>
            <button 
              onClick={() => triggerExport('PDF', 'any')}
              className="py-3 px-3 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 font-bold text-slate-700 hover:text-emerald-800 text-center cursor-pointer transition-all flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report (PDF)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Top Remedies & Stock Warnings splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 prescribed remedies */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-md flex items-center">
            <Pill className="h-4.5 w-4.5 text-emerald-600 mr-2" />
            Most Used Homeopathic Remedies
          </h3>

          <div className="space-y-3 text-xs font-medium">
            {sortedRemedies.length === 0 ? (
              <p className="text-slate-400 py-10 text-center">No remedy prescription records logged yet.</p>
            ) : (
              sortedRemedies.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">{r.name}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-mono">Rank {idx + 1}</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full font-mono text-[11px]">
                    Prescribed {r.count} Times
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock warn list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-800 text-md flex items-center">
              <Package className="h-4.5 w-4.5 text-amber-600 mr-2" />
              Critical Low Stock Reports
            </h3>
            <span className="bg-rose-50 text-rose-700 font-mono text-[11px] font-black px-2.5 py-0.5 rounded-sm">
              {lowStockRemedies.length} Alerts
            </span>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {lowStockRemedies.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <CheckCircle className="h-8 w-8 mx-auto text-emerald-500 animate-bounce" />
                <p className="text-sm font-semibold text-slate-600">Stock Standard Levels Clean</p>
                <p className="text-xs">No remedy items require immediate reordering.</p>
              </div>
            ) : (
              lowStockRemedies.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-rose-50/20 border border-transparent hover:border-rose-100 rounded-xl transition-all">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">{r.name} <span className="font-mono text-emerald-700 font-black text-[10px]">{r.potency}</span></p>
                    <p className="text-[10px] text-slate-400">{r.company} • Expiry: {r.expiryDate}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black font-mono text-xs ${r.currentStock === 0 ? 'text-rose-600 animate-pulse' : 'text-amber-600'}`}>
                      {r.currentStock} Units Left
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold font-mono">Limit: {r.minimumStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
