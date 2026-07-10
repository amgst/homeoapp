import { useState, useEffect } from 'react';
import {
  Printer, ArrowLeft, Send, Check, Heart, ShieldAlert, CheckCircle, Smartphone, Copy, Bluetooth
} from 'lucide-react';
import { getVisits, getPatients, getBills, getSettings } from '../utils/db';
import { Visit, Patient, Bill, ClinicSettings } from '../types';
import { isWebSerialSupported, printReceiptDirect } from '../utils/thermalPrinter';

interface ThermalReceiptProps {
  visitId: string;
  billId: string;
  onBack: () => void;
}

export default function ThermalReceipt({ visitId, billId, onBack }: ThermalReceiptProps) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  
  // Printing statuses
  const [printed, setPrinted] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [directPrinting, setDirectPrinting] = useState(false);
  const [directPrintError, setDirectPrintError] = useState('');

  useEffect(() => {
    const listVisits = getVisits();
    const listPatients = getPatients();
    const listBills = getBills();
    
    const matchedVisit = listVisits.find(v => v.id === visitId);
    if (matchedVisit) {
      setVisit(matchedVisit);
      setPatient(listPatients.find(p => p.id === matchedVisit.patientId) || null);
    }

    const matchedBill = listBills.find(b => b.id === billId);
    if (matchedBill) {
      setBill(matchedBill);
    }

    setSettings(getSettings());
  }, [visitId, billId]);

  const activeSettings = settings || getSettings();

  const activePatient: Patient = patient || (visit ? {
    id: visit.patientId,
    fullName: 'Unknown Patient (ID Mismatch)',
    gender: 'N/A',
    age: 0,
    mobileNumber: '',
    address: 'N/A',
    chiefComplaint: visit.symptoms || '',
    diagnosis: visit.diagnosis || ''
  } : {
    id: 'UNKNOWN',
    fullName: 'Unknown Patient',
    gender: 'N/A',
    age: 0,
    mobileNumber: '',
    address: 'N/A',
    chiefComplaint: '',
    diagnosis: ''
  });

  const handlePrint = () => {
    setPrinted(true);
    window.print();
    setTimeout(() => setPrinted(false), 2000);
  };

  const handleDirectPrint = async () => {
    if (!visit) return;
    setDirectPrintError('');
    setDirectPrinting(true);
    try {
      await printReceiptDirect(activePatient, visit, activeSettings);
    } catch (err: any) {
      setDirectPrintError(err?.message || 'Failed to print directly to the Bluetooth printer.');
    } finally {
      setDirectPrinting(false);
    }
  };

  const handleCopyText = () => {
    if (!visit) return;

    const separator = "--------------------------------";
    const dSeparator = "================================";
    
    let text = "";
    text += `${dSeparator}\n`;
    text += `   ${activeSettings.clinicName.toUpperCase()}\n`;
    text += `${dSeparator}\n`;
    text += `Doctor: ${activeSettings.doctorName}\n`;
    text += `Address: ${activeSettings.clinicAddress}\n`;
    text += `Phone: ${activeSettings.phoneNumber}\n`;
    text += `${separator}\n`;
    text += `PATIENT: ${activePatient.fullName.toUpperCase()}\n`;
    text += `PATIENT ID: ${activePatient.id}\n`;
    text += `AGE/GENDER: ${activePatient.age} Y / ${activePatient.gender.toUpperCase()}\n`;
    text += `DATE: ${visit.visitDate}\n`;
    text += `VISIT ID: ${visit.id}\n`;
    text += `${separator}\n`;
    text += `Rx - Homeopathic Prescription:\n`;
    text += `${separator}\n`;

    visit.medicines.forEach((m, idx) => {
      text += `${idx + 1}. ${m.name} ${m.potency}\n`;
      text += `   Form: ${m.form} (${m.quantity})\n`;
      text += `   Duration: ${m.duration}\n`;
      
      const timings = [];
      if (m.timing.morning) timings.push("Morning");
      if (m.timing.afternoon) timings.push("Afternoon");
      if (m.timing.evening) timings.push("Evening");
      if (m.timing.night) timings.push("Night");
      text += `   Schedule: ${timings.join(" - ")}\n`;
      text += `   Timing: ${m.foodInstructions}\n`;
      if (m.specialInstructions) {
        text += `   Instruction: ${m.specialInstructions}\n`;
      }
      text += `\n`;
    });

    if (visit.doctorNotes) {
      text += `DOCTOR NOTES:\n"${visit.doctorNotes}"\n\n`;
    }

    if (visit.followUpDate) {
      text += `NEXT VISIT: ${visit.followUpDate}\n\n`;
    }

    text += `${separator}\n`;
    text += `Thank You for Choosing Us\n`;
    text += `Restoring health naturally\n`;
    text += `${dSeparator}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    setWhatsappSent(true);
    setTimeout(() => {
      alert(`Simulating prescription and digital receipt delivery to ${activePatient.fullName} (${activePatient.mobileNumber || 'no mobile number'}) via WhatsApp integration.`);
      setWhatsappSent(false);
    }, 1200);
  };

  // If the prescription visit record is missing or deleted, show a beautiful error card with an active Escape button
  if (!visit) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-lg font-sans space-y-4 my-12 animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-xs border border-rose-100">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-base font-black text-slate-800">نسخہ تلاش نہیں کیا جا سکا (Prescription Not Found)</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested clinical prescription ID <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-600 font-mono font-bold">{visitId || 'None'}</code> could not be located in your local history, or has been cleaned.
        </p>
        <button
          onClick={onBack}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          Return to Dashboard / واپس ڈیش بورڈ پر جائیں
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <button 
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Return to Clinic Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyText}
            className={`flex items-center space-x-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              copied 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Copy className="h-4 w-4" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text for Bluetooth Printer'}</span>
          </button>

          <button 
            onClick={handleSendWhatsApp}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Smartphone className="h-4 w-4" />
            <span>{whatsappSent ? 'Sending...' : 'Send WhatsApp Prescription'}</span>
          </button>

          {isWebSerialSupported() && (
            <button
              onClick={handleDirectPrint}
              disabled={directPrinting}
              className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              title="Send raw ESC/POS data directly to the paired Bluetooth printer's serial port, no OS print dialog"
            >
              <Bluetooth className="h-4 w-4" />
              <span>{directPrinting ? 'Sending to Printer...' : 'Print via Bluetooth (Direct)'}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{printed ? 'Spooling Printer...' : 'Print Thermal 80mm'}</span>
          </button>
        </div>
      </div>

      {directPrintError && (
        <div className="no-print max-w-3xl mx-auto bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
          {directPrintError}
        </div>
      )}

      {/* Urdu instructions card for mobile Bluetooth thermal printers */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 no-print font-sans max-w-3xl mx-auto">
        <h4 className="text-xs font-black text-slate-700 flex items-center space-x-2">
          <Smartphone className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>موبائل بلوٹوتھ تھرمل پرنٹر کے لیے رہنمائی (Mobile Thermal Printing Guide):</span>
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed text-right font-semibold" dir="rtl">
          اگر آپ موبائل پر ہیں اور آپ کا بلوٹوتھ تھرمل پرنٹر (Bluetooth Thermal Printer) براہِ راست پرنٹ نہیں کر رہا، تو اوپر موجود <strong className="text-emerald-700">"Copy Text for Bluetooth Printer"</strong> کا بٹن دبائیں۔ پھر پلے اسٹور سے کوئی بھی فری پرنٹنگ ایپ جیسے <strong className="text-blue-700">"RawBT"</strong> یا <strong className="text-blue-700">"Bluetooth Print"</strong> ڈاؤن لوڈ کر کے یہ کاپی شدہ نسخہ وہاں پیسٹ (Paste) کریں اور باآسانی پرنٹ نکال لیں۔
        </p>
      </div>

      {/* Main receipt body centering card */}
      <div className="flex justify-center select-none">
        
        {/* Retro paper receipt wrapper */}
        <div className="printable-receipt w-full max-w-[340px] bg-white border border-slate-200 p-6 rounded-md shadow-lg font-mono text-[11px] text-slate-800 leading-normal select-text">
          
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-display font-black text-sm rounded-full flex items-center justify-center mx-auto mb-1.5">
              HHC
            </div>
            <h1 className="text-sm font-black uppercase tracking-wider">{activeSettings.clinicName}</h1>
            <p className="text-[10px] text-slate-500 font-semibold">{activeSettings.doctorName}</p>
            <p className="text-[9px] text-slate-400 font-medium max-w-[240px] mx-auto leading-relaxed">{activeSettings.clinicAddress}</p>
            <p className="text-[9px] text-slate-500 font-bold">Phone: {activeSettings.phoneNumber}</p>
          </div>

          {/* Patient Details */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span>PATIENT:</span>
              <span className="font-bold">{activePatient.fullName.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>PATIENT ID:</span>
              <span className="font-bold">{activePatient.id}</span>
            </div>
            <div className="flex justify-between">
              <span>AGE / GENDER:</span>
              <span>{activePatient.age} Y / {activePatient.gender.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>MOBILE:</span>
              <span>{activePatient.mobileNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>VISIT ID:</span>
              <span>{visit.id}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>DATE:</span>
              <span>{visit.visitDate}</span>
            </div>
          </div>

          {/* Medicines Prescription */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-3">
            <h2 className="font-bold uppercase tracking-wider text-[10px] text-center border border-slate-200 py-1 rounded-sm bg-slate-50">
              Rx - Homeopathic Remedies
            </h2>

            <div className="space-y-3">
              {visit.medicines.length === 0 ? (
                <p className="text-center text-slate-400">No remedy prescribed.</p>
              ) : (
                visit.medicines.map((m, idx) => (
                  <div key={idx} className="space-y-1 text-left">
                    <div className="flex justify-between font-bold">
                      <span>{idx + 1}. {m.name}</span>
                      <span>{m.potency}</span>
                    </div>
                    <div className="pl-3 space-y-0.5 text-slate-600 text-[10px]">
                      <div className="flex justify-between">
                        <span>Form / Qty:</span>
                        <span>{m.form} • {m.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-bold">{m.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Schedule:</span>
                        <span className="font-bold text-emerald-700">
                          {m.timing.morning ? ' Morn' : ''}
                          {m.timing.afternoon ? ' Aft' : ''}
                          {m.timing.evening ? ' Eve' : ''}
                          {m.timing.night ? ' Night' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Food Timing:</span>
                        <span>{m.foodInstructions}</span>
                      </div>
                      {m.specialInstructions && (
                        <p className="italic text-slate-400 text-[9px] mt-0.5">
                          * {m.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Billing section removed */}

          {/* Directives and footer */}
          <div className="py-3 space-y-4 text-center">
            {visit.doctorNotes && (
              <div className="text-left space-y-0.5 text-[9px] text-slate-600 leading-normal bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                <span className="font-bold text-slate-700 block">DOCTOR DIRECTIVE:</span>
                <p className="italic">"{visit.doctorNotes}"</p>
              </div>
            )}

            {visit.followUpDate && (
              <div className="border border-indigo-200 p-2 text-indigo-950 font-bold uppercase rounded-sm bg-indigo-50/50">
                NEXT VISIT: {visit.followUpDate}
              </div>
            )}

            <div className="pt-4 border-t border-dashed border-slate-200 text-center space-y-1">
              <p className="text-[10px] font-black uppercase">Thank You for Choosing Us</p>
              <p className="text-[9px] text-slate-400">Restoring health naturally since 2012</p>
            </div>

            <div className="pt-6 space-y-1 flex flex-col items-center">
              <div className="w-24 h-0.5 bg-slate-300"></div>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Authorized Doctor Signature</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
