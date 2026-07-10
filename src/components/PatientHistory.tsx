import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clipboard, FileText, ChevronRight, PlusCircle, ArrowLeft, 
  Trash2, Edit3, Printer, Pill, MessageSquare, AlertCircle, Sparkles, UserRoundPlus 
} from 'lucide-react';
import { 
  getPatientVisits, deleteVisit, saveVisit, generateVisitId, getPatients 
} from '../utils/db';
import { Patient, Visit, PrescribedMedicine } from '../types';

interface PatientHistoryProps {
  patientId: string;
  onBack: () => void;
  onGoToPrescription: (patientId: string) => void;
  onPrintReceipt: (visitId: string) => void;
}

export default function PatientHistory({ patientId, onBack, onGoToPrescription, onPrintReceipt }: PatientHistoryProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [editVisitMode, setEditVisitMode] = useState(false);
  
  // Quick Visit Edit Form State
  const [formData, setFormData] = useState<Partial<Visit>>({
    id: '',
    patientId: '',
    visitDate: '',
    symptoms: '',
    diagnosis: '',
    doctorNotes: '',
    followUpDate: '',
    medicines: []
  });

  const loadData = () => {
    const matchedPatient = getPatients().find(p => p.id === patientId);
    if (matchedPatient) {
      setPatient(matchedPatient);
      const matchedVisits = getPatientVisits(patientId);
      setVisits(matchedVisits);
      if (matchedVisits.length > 0 && !selectedVisit) {
        setSelectedVisit(matchedVisits[0]);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleDeleteVisit = (visitId: string) => {
    if (confirm('Are you sure you want to permanently delete this visit history and its clinical prescription details?')) {
      deleteVisit(visitId);
      loadData();
      if (selectedVisit?.id === visitId) {
        setSelectedVisit(null);
      }
    }
  };

  const handleStartEditVisit = (v: Visit) => {
    setFormData(v);
    setEditVisitMode(true);
  };

  const handleSaveVisitEdit = () => {
    if (!formData.visitDate || !formData.symptoms) {
      alert('Please fill out the Visit Date and Symptoms fields.');
      return;
    }
    const updatedVisit: Visit = {
      id: formData.id!,
      patientId: patientId,
      visitDate: formData.visitDate,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis || '',
      doctorNotes: formData.doctorNotes || '',
      followUpDate: formData.followUpDate,
      medicines: formData.medicines || []
    };
    saveVisit(updatedVisit);
    setEditVisitMode(false);
    loadData();
    setSelectedVisit(updatedVisit);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Back button and patient profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Database</span>
        </button>

        <button 
          onClick={() => onGoToPrescription(patientId)}
          className="flex items-center justify-center space-x-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Prescription Visit</span>
        </button>
      </div>

      {patient && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold font-display text-xl shrink-0">
              {patient.photoUrl ? (
                <img src={patient.photoUrl} alt={patient.fullName} referrerPolicy="no-referrer" className="h-full w-full object-cover rounded-2xl" />
              ) : (
                patient.fullName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center space-x-3 flex-wrap gap-1">
                <h2 className="text-xl font-display font-bold text-slate-800">{patient.fullName}</h2>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold font-mono">
                  {patient.id}
                </span>
                {patient.isDiabetic !== undefined && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${patient.isDiabetic ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-600'}`}>
                    {patient.isDiabetic ? 'Diabetic' : 'Non-Diabetic'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {patient.gender}, {patient.age} years • Contact: {patient.mobileNumber || 'No Phone'} • Blood Group: {patient.bloodGroup || 'N/A'}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                📍 {patient.address || 'Address not listed'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-sm text-xs font-medium space-y-1">
            <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Chief Constitutional Complaint:</p>
            <p className="text-slate-600 line-clamp-2 italic">"{patient.chiefComplaint || 'None logged'}"</p>
          </div>
        </div>
      )}

      {/* Main timeline / history split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left visits index column */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-[600px] overflow-y-auto">
          <h3 className="font-display font-bold text-slate-800 text-md flex items-center">
            <Clipboard className="h-4.5 w-4.5 text-slate-500 mr-2" />
            Clinical Visit Timeline
          </h3>

          <div className="space-y-3">
            {visits.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <AlertCircle className="h-10 w-10 mx-auto text-slate-300" />
                <p className="text-sm font-medium">No medical visits recorded.</p>
                <button 
                  onClick={() => onGoToPrescription(patientId)}
                  className="text-xs text-emerald-600 hover:underline font-bold"
                >
                  Create first prescription
                </button>
              </div>
            ) : (
              visits.map((v) => (
                <div 
                  key={v.id}
                  onClick={() => { setSelectedVisit(v); setEditVisitMode(false); }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                    selectedVisit?.id === v.id 
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-xs' 
                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 flex items-center font-mono">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {v.visitDate}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                      {v.id}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                      🔬 {v.diagnosis || 'Prescribed Visit'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                      ⚠️ {v.symptoms}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100/60">
                    <span>💊 {v.medicines.length} remedy items</span>
                    {v.followUpDate && (
                      <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm">
                        Follow-up: {v.followUpDate}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right visit detailed view panel */}
        <div className="lg:col-span-8 space-y-4">
          {editVisitMode ? (
            /* Visit Quick Edit Form */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-display font-bold text-slate-800 text-lg">Edit Clinical Visit Details ({formData.id})</h3>
                <button 
                  onClick={() => setEditVisitMode(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
                >
                  Discard Edits
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Visit Date</label>
                  <input 
                    type="date" 
                    value={formData.visitDate} 
                    onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Next Follow-Up Date</label>
                  <input 
                    type="date" 
                    value={formData.followUpDate || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm font-mono text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Active Symptoms / Vitals</label>
                <textarea 
                  rows={2}
                  value={formData.symptoms} 
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm text-slate-700"
                  placeholder="Describe active clinical symptoms..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnosis / Assessment</label>
                <textarea 
                  rows={2}
                  value={formData.diagnosis} 
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm text-slate-700"
                  placeholder="Miasmatic diagnosis or organ assessment..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Doctor Private Clinical Notes</label>
                <textarea 
                  rows={3}
                  value={formData.doctorNotes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-sm text-slate-700"
                  placeholder="Enter medical observations, constitutional modalities, general instructions..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button 
                  onClick={() => setEditVisitMode(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveVisitEdit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : selectedVisit ? (
            /* Active Detailed View */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
              
              {/* Card Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest font-mono bg-emerald-50 px-2.5 py-1 rounded-md">
                    Visit ID: {selectedVisit.id}
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-semibold font-mono">
                    Session Timestamp: {selectedVisit.visitDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onPrintReceipt(selectedVisit.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Prescription</span>
                  </button>

                  <button 
                    onClick={() => handleStartEditVisit(selectedVisit)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    title="Edit medical visit notes"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button 
                    onClick={() => handleDeleteVisit(selectedVisit.id)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete visit history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Visit Diagnostic & Symptoms Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 space-y-1">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Symptoms & Presentation</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed font-sans">
                    {selectedVisit.symptoms || 'No symptoms specified.'}
                  </p>
                </div>

                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Active Clinical Diagnosis</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed font-sans">
                    {selectedVisit.diagnosis || 'Constitutional / No major pathology.'}
                  </p>
                </div>
              </div>

              {/* Prescribed Medicines Box */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-slate-800 text-sm flex items-center">
                  <Pill className="h-4 w-4 text-emerald-600 mr-2" />
                  Prescribed Homeopathic Remedies
                </h4>

                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-4">Remedy Name</th>
                        <th className="py-2.5 px-3">Potency & Form</th>
                        <th className="py-2.5 px-3">Dosage / Timings</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-4">Food / Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedVisit.medicines.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No remedies prescribed during this session.</td>
                        </tr>
                      ) : (
                        selectedVisit.medicines.map((m, index) => (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800">{m.name}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold mr-1.5 font-mono text-[10px]">{m.potency}</span>
                              <span className="text-slate-500 font-medium">{m.form}</span>
                            </td>
                            <td className="py-3 px-3 font-medium">
                              <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-600 bg-slate-100/60 px-2 py-0.5 rounded-sm max-w-fit">
                                <span className={m.timing.morning ? 'text-emerald-600 font-bold' : 'text-slate-300'}>M</span>
                                <span>-</span>
                                <span className={m.timing.afternoon ? 'text-emerald-600 font-bold' : 'text-slate-300'}>A</span>
                                <span>-</span>
                                <span className={m.timing.evening ? 'text-emerald-600 font-bold' : 'text-slate-300'}>E</span>
                                <span>-</span>
                                <span className={m.timing.night ? 'text-emerald-600 font-bold' : 'text-slate-300'}>N</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-600 font-mono">{m.duration}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-700">{m.foodInstructions}</p>
                              {m.specialInstructions && (
                                <p className="text-[10px] text-slate-400 italic font-medium mt-0.5">"{m.specialInstructions}"</p>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Private notes & follow-up block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    Doctor Session Notes & Directives
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedVisit.doctorNotes || 'No specific constitutional modalities or dietary instructions logged.'}
                  </p>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Scheduled Follow-Up</span>
                    <p className="text-sm font-bold text-indigo-950 font-mono">
                      📅 {selectedVisit.followUpDate || 'No follow-up logged'}
                    </p>
                  </div>
                  <span className="text-[10px] text-indigo-600/70 font-semibold block mt-4">
                    Patients are notified on WhatsApp / SMS automatically on this date.
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400 font-medium">
              Select a visit timeline entry on the left to view comprehensive medical details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
