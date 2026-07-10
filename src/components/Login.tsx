import React, { useState } from 'react';
import { Shield, Fingerprint, ScanFace, KeyRound, Star, ShieldCheck } from 'lucide-react';
import { setLoggedInUser } from '../utils/db';
import BusinessCard from './BusinessCard';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    
    // Simple credentials: admin/1234, doctor/1234, reception/1234, haris/1234
    const validUsers = ['admin', 'doctor', 'reception', 'haris'];
    if (validUsers.includes(username.toLowerCase()) && password === '1234') {
      const displayUser = username.charAt(0).toUpperCase() + username.slice(1);
      setLoggedInUser(displayUser);
      onLoginSuccess(displayUser);
    } else {
      setError('Invalid clinical credentials. Try: haris / 1234');
    }
  };

  const triggerBiometric = (type: 'fingerprint' | 'face') => {
    setBiometricType(type);
    setTimeout(() => {
      setLoggedInUser('Dr. Haris Mehmood');
      onLoginSuccess('Dr. Haris Mehmood');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F5] px-4 py-8 md:p-12 select-none font-sans">
      
      {/* Outer Grid Container */}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300">
        
        {/* Left Side: Dynamic Business Card & Welcome Branding */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#0c331a] via-[#114b27] to-[#062411] p-6 sm:p-10 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle green ambient light bubbles */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-lime-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div>
              <span className="bg-lime-500/20 text-lime-300 border border-lime-500/30 text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full">
                Professional EHR Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight font-serif italic">
                Haris <span className="text-lime-300 not-italic font-sans">Homeo Clinic</span>
              </h1>
              <p className="text-emerald-100/80 text-xs sm:text-sm font-medium mt-2 max-w-md">
                Welcome to your patient database and electronic prescription gateway. Designed for Dr. Haris Mehmood.
              </p>
            </div>

            {/* Displaying the custom card directly! */}
            <div className="py-2 flex justify-center lg:justify-start">
              <BusinessCard className="w-full max-w-sm sm:max-w-md hover:rotate-1 hover:scale-105 shadow-2xl shadow-emerald-950/40 border border-emerald-400/20" interactive={true} />
            </div>

            {/* Core features of the clinic system */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100/95">
                <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                <span>Integrated Pharmacy Stock (Potencies, Mother Tinctures, Biochemic Salts & Compounds)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100/95">
                <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                <span>EHR History, Patient Logs, Dynamic Follow-ups & Digital Billing Receipts</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100/95">
                <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                <span>Secure Offline Database Persistence with Quick Biometric Access</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-300/80 font-mono">
            <span>Powered by Smart EHR Engine</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-lime-400 text-lime-400" /> Authorized Access Only</span>
          </div>
        </div>

        {/* Right Side: Secure Login Gateway Form */}
        <div className="lg:col-span-5 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-white relative">
          
          <div className="my-auto space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="w-7 h-7 text-green-600 shrink-0" />
                <span>System Gate</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                ENTER REGISTERED CLINICAL CREDENTIALS
              </p>
            </div>

            {/* Biometric Simulation Modal */}
            {biometricType && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl text-center space-y-4 border border-green-50">
                  <div className="mx-auto w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center animate-bounce">
                    {biometricType === 'fingerprint' ? (
                      <Fingerprint className="w-12 h-12" />
                    ) : (
                      <ScanFace className="w-12 h-12" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {biometricType === 'fingerprint' ? 'Scanning Fingerprint...' : 'Recognizing Face...'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Place your finger on the reader or face the camera.
                  </p>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%', transition: 'width 1.5s ease-in-out' }}></div>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Clinical Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Shield className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:bg-white text-slate-800 transition-all text-sm font-semibold"
                      placeholder="e.g., haris"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Security Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:bg-white text-slate-800 transition-all text-sm font-semibold"
                      placeholder="••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-semibold">
                <span className="flex items-center gap-1 text-slate-400">
                  🔒 AES-256 Offline Encryption
                </span>
                <span className="text-green-600 font-bold cursor-help hover:underline">
                  haris / 1234
                </span>
              </div>

              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-green-600 hover:bg-green-700 active:bg-green-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md cursor-pointer"
              >
                Access Clinic Database
              </button>
            </form>

            {/* Biometric quick entry widgets */}
            <div className="border-t border-slate-100 pt-6">
              <p className="text-center text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                Fast Biometric Authentication
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => triggerBiometric('fingerprint')}
                  className="flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-green-50 hover:border-green-200 text-slate-600 hover:text-green-700 transition-all text-xs font-bold cursor-pointer"
                >
                  <Fingerprint className="h-4 w-4 text-green-600" />
                  <span>Touch ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerBiometric('face')}
                  className="flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-green-50 hover:border-green-200 text-slate-600 hover:text-green-700 transition-all text-xs font-bold cursor-pointer"
                >
                  <ScanFace className="h-4 w-4 text-green-600" />
                  <span>Face ID</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-mono mt-8">
            v2.5.0 • Authorized Clinical Client Node
          </div>
        </div>

      </div>
    </div>
  );
}
