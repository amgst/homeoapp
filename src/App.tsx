import { useState, useEffect, useRef } from 'react';
import { 
  Activity, ClipboardList, LayoutDashboard, Users, Package, DollarSign, 
  Calendar, BarChart3, Settings as SettingsIcon, LogOut, Lock, 
  Menu, Bell, UserCheck, X, Pill, AlertOctagon, History
} from 'lucide-react';

// DB and type utilities
import { initDB, getLoggedInUser, setLoggedInUser, getInventory, getSettings } from './utils/db';
import { ClinicSettings } from './types';

// Clinic Modular Sub-Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import PatientHistory from './components/PatientHistory';
import PrescriptionBuilder from './components/PrescriptionBuilder';
import MedicineInventory from './components/MedicineInventory';
import Billing from './components/Billing';
import FollowUp from './components/FollowUp';
import Reports from './components/Reports';
import SettingsView from './components/Settings';
import ThermalReceipt from './components/ThermalReceipt';
import ClinicHistory from './components/ClinicHistory';

export default function App() {
  // DB initialization
  useEffect(() => {
    initDB();
  }, []);

  // Authentication State
  const [user, setUser] = useState<string | null>(getLoggedInUser());

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'history' | 'clinicHistory' | 'prescription' | 'inventory' | 'billing' | 'followup' | 'reports' | 'settings' | 'receipt'>('dashboard');
  
  // Drill-down IDs
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string>('');

  // UI Drawer / Notifications
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Clinic parameters cache
  const [settings, setSettings] = useState<ClinicSettings>(getSettings());
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);

  // Load clinic alerts dynamically
  const reloadAlertStats = () => {
    const inv = getInventory();
    setLowStockCount(inv.filter(i => i.currentStock <= i.minimumStock).length);
    
    setExpiringSoonCount(inv.filter(i => {
      if (!i.expiryDate) return false;
      const exp = new Date(i.expiryDate);
      const today = new Date();
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 90;
    }).length);

    setSettings(getSettings());
  };

  useEffect(() => {
    if (user) {
      reloadAlertStats();
    }
  }, [user, activeTab]);

  // Security Lock timer
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    const minutes = settings.autoLockMinutes;
    if (minutes > 0 && user) {
      inactivityTimerRef.current = setTimeout(() => {
        handleLockDatabase();
      }, minutes * 60 * 1000);
    }
  };

  useEffect(() => {
    // Reset timer on any interactive triggers
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const reset = () => resetInactivityTimer();
    
    events.forEach(event => window.addEventListener(event, reset));
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach(event => window.removeEventListener(event, reset));
    };
  }, [user, settings.autoLockMinutes]);

  const handleLoginSuccess = (username: string) => {
    setUser(username);
    reloadAlertStats();
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setUser(null);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  };

  const handleLockDatabase = () => {
    // Lock app but preserve session info for fingerprint/quick unlock
    setUser(null);
  };

  // Helper dashboard actions redirection handler
  const handleDashboardAction = (action: 'new-patient' | 'search-patient' | 'new-prescription' | 'inventory' | 'reports') => {
    switch (action) {
      case 'new-patient':
        setSelectedPatientId(null);
        setActiveTab('patients');
        break;
      case 'search-patient':
        setSelectedPatientId(null);
        setActiveTab('patients');
        break;
      case 'new-prescription':
        setSelectedPatientId(null);
        setActiveTab('prescription');
        break;
      case 'inventory':
        setActiveTab('inventory');
        break;
      case 'reports':
        setActiveTab('reports');
        break;
    }
  };

  const handleSuccessPrescription = (visitId: string, billId: string) => {
    setSelectedVisitId(visitId);
    setSelectedBillId(billId);
    setActiveTab('receipt');
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen bg-[#F4F7F5] flex flex-col font-sans select-none ${settings.theme === 'Dark' ? 'dark' : ''}`}>
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 text-gray-800 sticky top-0 z-40 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group select-none" onClick={() => setActiveTab('dashboard')}>
            {/* Custom Circular Emblem */}
            <div className="w-11 h-11 border-2 border-emerald-500/30 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 shadow-md relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
              {/* Mini Green Cross */}
              <div className="w-6 h-6 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-xs flex items-center justify-center relative shadow-xs">
                {/* Vertical line */}
                <div className="absolute w-1.5 h-4.5 bg-white rounded-xs" />
                {/* Horizontal line */}
                <div className="absolute w-4.5 h-1.5 bg-white rounded-xs" />
              </div>

              {/* Overlapping Leaf */}
              <div className="absolute top-0.5 right-1.5 w-4 h-4 transform rotate-[15deg] pointer-events-none drop-shadow-xs">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2C22 2 14 4 11 11C8 18 10 21 10 21C10 21 11 19 13 16C15 13 22 2 22 2Z" fill="#4ade80" />
                  <path d="M2 22C2 22 6 14 14 12C14 12 11 11 9 11C7 11 2 15 2 22Z" fill="#22c55e" />
                </svg>
              </div>

              {/* Mini Mortar at the very bottom */}
              <div className="absolute -bottom-[2px] w-7 h-4 bg-slate-200 border-t border-slate-300 rounded-b-md rounded-t-xs flex items-center justify-center shadow-xs">
                <div className="w-1 h-3 bg-slate-400 absolute -top-1.5 left-2 rounded-full transform -rotate-[35deg]" />
              </div>
            </div>

            <div>
              <h1 className="text-sm font-black text-slate-800 leading-none tracking-tight font-serif italic flex items-center gap-1">
                Haris <span className="text-emerald-600 not-italic font-sans font-extrabold text-[13px]">Homeo Clinic</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[8.5px] uppercase font-black px-1.5 py-0.5 rounded-md leading-none">
                  Dr. Haris Mehmood
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-3.5">
            {/* Alerts Center Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl relative transition-colors cursor-pointer text-gray-500"
              >
                <Bell className="h-4.5 w-4.5" />
                {(lowStockCount + expiringSoonCount) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce shadow-sm">
                    {lowStockCount + expiringSoonCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden text-gray-800 text-xs font-medium z-50">
                  <div className="bg-green-50 p-3.5 font-bold text-green-950 flex items-center justify-between">
                    <span>Clinical Alerts Center</span>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {lowStockCount > 0 && (
                      <div className="p-3.5 bg-red-50/50 flex items-start space-x-2.5">
                        <Pill className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800">Pharmacy Warning</p>
                          <p className="text-[10px] text-red-500 font-medium mt-0.5">
                            {lowStockCount} homeopathic remedies are low or out of stock!
                          </p>
                        </div>
                      </div>
                    )}
                    {expiringSoonCount > 0 && (
                      <div className="p-3.5 bg-red-50/50 flex items-start space-x-2.5">
                        <AlertOctagon className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800">Remedy Expirations</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                            {expiringSoonCount} remedy batches will expire in the next 90 days.
                          </p>
                        </div>
                      </div>
                    )}
                    {lowStockCount === 0 && expiringSoonCount === 0 && (
                      <div className="p-8 text-center text-gray-400 py-10">
                        ✨ Pharmacy systems are optimal. No warning alerts today.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Locked screen button */}
            <button 
              onClick={handleLockDatabase}
              title="Lock database gateway"
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer text-gray-500"
            >
              <Lock className="h-4.5 w-4.5" />
            </button>

            {/* Profile Dropdown */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 pl-3.5 pr-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold text-xs text-gray-700 font-sans select-none">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span>{user}</span>
            </div>

            {/* Log Out */}
            <button 
              onClick={handleLogout}
              title="Sign out clinic session"
              className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>

            {/* Mobile Sidebar Trigger */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl lg:hidden cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Split Layout Container */}
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col lg:flex-row relative">
        
        {/* Navigation Sidebar Drawer */}
        <aside className={`w-64 bg-white border-r border-gray-200 space-y-2 p-4 shrink-0 transition-all z-30 lg:block no-print ${
          showMobileMenu ? 'fixed inset-y-0 left-0 pt-20 shadow-2xl block w-64' : 'hidden'
        }`}>
          
          <div className="space-y-1.5">
            <span className="px-3.5 block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 select-none">
              Main Menu
            </span>

            {[
              { id: 'dashboard', label: 'EHR Dashboard', icon: LayoutDashboard },
              { id: 'patients', label: 'Patient Database', icon: Users },
              { id: 'prescription', label: 'Write Prescription', icon: ClipboardList },
              { id: 'clinicHistory', label: 'Clinic History', icon: History },
              { id: 'billing', label: 'Billing & Invoices', icon: DollarSign },
              { id: 'inventory', label: 'Pharmacy Stock', icon: Package },
              { id: 'followup', label: 'Follow-ups', icon: Calendar },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'settings', label: 'Configurations', icon: SettingsIcon },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'patients' && activeTab === 'history');
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedPatientId(null);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none ${
                    isActive 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600 font-bold shadow-xs' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-12 text-center text-[10px] text-gray-400 font-mono select-none">
            ⚡ Offline Database Active
          </div>
        </aside>

        {/* Dynamic Client Stage */}
        <main className="flex-1 p-4 md:p-6 select-text overflow-x-hidden">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              onAction={handleDashboardAction}
              onSelectPatient={(patientId) => {
                setSelectedPatientId(patientId);
                setActiveTab('history');
              }}
            />
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <PatientManagement 
              initialPatientId={selectedPatientId}
              onSelectPatient={(patientId) => {
                setSelectedPatientId(patientId);
                setActiveTab('history');
              }}
              onGoToPrescription={(patientId) => {
                setSelectedPatientId(patientId);
                setActiveTab('prescription');
              }}
            />
          )}

          {/* Patient History Drill Down */}
          {activeTab === 'history' && selectedPatientId && (
            <PatientHistory 
              patientId={selectedPatientId}
              onBack={() => {
                setSelectedPatientId(null);
                setActiveTab('patients');
              }}
              onGoToPrescription={(patientId) => {
                setSelectedPatientId(patientId);
                setActiveTab('prescription');
              }}
              onPrintReceipt={(visitId) => {
                setSelectedVisitId(visitId);
                setSelectedBillId(visitId.replace('VIS', 'BILL'));
                setActiveTab('receipt');
              }}
            />
          )}

          {/* Prescription Builder Tab */}
          {activeTab === 'prescription' && (
            <PrescriptionBuilder 
              initialPatientId={selectedPatientId}
              onCancel={() => {
                setSelectedPatientId(null);
                setActiveTab('dashboard');
              }}
              onSuccess={handleSuccessPrescription}
            />
          )}

          {/* Clinic History Tab */}
          {activeTab === 'clinicHistory' && (
            <ClinicHistory 
              onSelectVisit={(visitId, billId) => {
                setSelectedVisitId(visitId);
                setSelectedBillId(billId);
                setActiveTab('receipt');
              }}
              onSelectPatient={(patientId) => {
                setSelectedPatientId(patientId);
                setActiveTab('history');
              }}
            />
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <Billing
              onPrintBillReceipt={(billId, visitId) => {
                setSelectedVisitId(visitId);
                setSelectedBillId(billId);
                setActiveTab('receipt');
              }}
            />
          )}

          {/* Medicine Inventory Tab */}
          {activeTab === 'inventory' && (
            <MedicineInventory />
          )}

          {/* Follow ups Tab */}
          {activeTab === 'followup' && (
            <FollowUp 
              onSelectPatient={(patientId) => {
                setSelectedPatientId(patientId);
                setActiveTab('history');
              }}
            />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <Reports />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {/* Thermal Receipt view */}
          {activeTab === 'receipt' && (
            <ThermalReceipt 
              visitId={selectedVisitId}
              billId={selectedBillId}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

        </main>

      </div>

    </div>
  );
}
