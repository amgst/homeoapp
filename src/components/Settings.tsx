import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, ShieldCheck, Download, Upload, Trash2, Printer, 
  Languages, Moon, Sun, CheckCircle2, AlertCircle, Smartphone 
} from 'lucide-react';
import { getSettings, saveSettings, exportDatabaseBackup, restoreDatabaseBackup } from '../utils/db';
import { ClinicSettings } from '../types';

export default function SettingsView() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [restored, setRestored] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [backupJson, setBackupJson] = useState('');

  useEffect(() => {
    setSettings(getSettings());
    setBackupJson(exportDatabaseBackup());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev!,
      [name]: name === 'autoLockMinutes' ? parseInt(value, 10) || 15 : value
    }));
  };

  const handleSaveSettings = () => {
    if (!settings) return;
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HHC_Clinic_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        const text = event.target?.result as string;
        const success = restoreDatabaseBackup(text);
        if (success) {
          setRestored(true);
          setRestoreError('');
          setSettings(getSettings());
          setTimeout(() => setRestored(false), 3000);
        } else {
          setRestoreError('Invalid clinical backup file format. Please upload a valid JSON backup exported from Haris Homeo Clinic.');
        }
      };
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-slate-400 font-semibold font-sans">Syncing local settings...</div>;
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Clinic Configurations</h2>
          <p className="text-sm text-slate-500">Configure clinic metadata, printer channels, localization, and databases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form inputs */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          
          {/* Saved feedback banner */}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-pulse">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              <span>Configurations saved successfully. Active clinical themes and receipt footers updated.</span>
            </div>
          )}

          {/* Clinic Branding and Details */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm">Clinic Details & Header Layout</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Clinic Practice Name</label>
                <input 
                  type="text"
                  name="clinicName"
                  value={settings.clinicName}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Practitioner Name & Degrees</label>
                <input 
                  type="text"
                  name="doctorName"
                  value={settings.doctorName}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Clinic Telephone Line</label>
              <input 
                type="text"
                name="phoneNumber"
                value={settings.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Physical Clinic Address</label>
              <textarea 
                rows={2}
                name="clinicAddress"
                value={settings.clinicAddress}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Theme, language, security */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-sm">Theme & Language Localization</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Default Color Theme</label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Light">Light Mode (Green Medical Theme)</option>
                  <option value="Dark">Dark Mode (Immersive slate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Active Language Translation</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="English">English (United Kingdom)</option>
                  <option value="Urdu">Urdu (اردو - Bilingual Subtitles)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Biometric Auto-Lock Timer</label>
                <select
                  name="autoLockMinutes"
                  value={settings.autoLockMinutes}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={5}>5 Minutes of Inactivity</option>
                  <option value={15}>15 Minutes of Inactivity</option>
                  <option value={30}>30 Minutes of Inactivity</option>
                  <option value={0}>Disabled / Do Not Lock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Printer configuration settings */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center">
              <Printer className="h-4.5 w-4.5 text-slate-500 mr-2" />
              Thermal 80mm ESC/POS Printer Interface Setup
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Printer Channel Port</label>
                <select
                  name="printerType"
                  value={settings.printerType}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="System">Standard System Spooler / PDF Driver</option>
                  <option value="Bluetooth">Bluetooth Mini-Thermal Printer (80mm)</option>
                  <option value="USB">Direct USB COM-Port Cable Connection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">COM Port / Bluetooth MAC Address</label>
                <input 
                  type="text"
                  name="printerAddress"
                  value={settings.printerAddress || 'COM4:9600baud'}
                  onChange={handleInputChange}
                  placeholder="e.g. COM4, Bluetooth Name..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              onClick={handleSaveSettings}
              className="flex items-center justify-center space-x-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Clinical Settings</span>
            </button>
          </div>

        </div>

        {/* Right Column: Database Backup & Recovery Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 mr-2" />
              Backup & Recovery Engine
            </h3>

            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Export the clinical patient databases, visit timeline histories, bill registries, and pharmacopeia inventory records into a secure local JSON backup file instantly.
            </p>

            {/* Error notifications */}
            {restoreError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold space-y-1">
                <p className="flex items-center"><AlertCircle className="h-4 w-4 mr-1 text-rose-500" /> Error Restoring Backup:</p>
                <p className="font-medium text-[10px] leading-relaxed">{restoreError}</p>
              </div>
            )}

            {restored && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-1.5 animate-pulse">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Database successfully restored! Reloading assets...</span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <button
                onClick={handleDownloadBackup}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 cursor-pointer transition-all"
              >
                <Download className="h-4 w-4 text-slate-400" />
                <span>Manual Offline Backup</span>
              </button>

              <div className="relative">
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleRestoreUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <button
                  type="button"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 cursor-pointer transition-all"
                >
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span>Restore Local Database</span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-50 uppercase tracking-widest font-black">
              AES-256 local storage
            </div>

          </div>

          {/* Quick Urdu Bilingual Help Banner */}
          {settings.language === 'Urdu' && (
            <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl space-y-2 animate-fade-in text-right">
              <h4 className="font-bold text-sm">اردو معاونت فعال ہے</h4>
              <p className="text-[11px] text-emerald-300 leading-relaxed font-sans">
                اردو مینو سپورٹ اور دو لسانی طبی پرنٹر کی ترسیل کے لیے معاونت جاری ہے۔ پرنٹ فارمیٹس میں انگریزی اور اردو دونوں اصطلاحات خود کار طریقے سے چسپاں ہو جائیں گی۔
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
