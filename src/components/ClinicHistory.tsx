import { useState, useEffect } from 'react';
import { Clock, Search, Calendar, User, FileText, ArrowRight, Pill } from 'lucide-react';
import { getVisits, getPatients } from '../utils/db';
import { Visit, Patient } from '../types';

interface ClinicHistoryProps {
  onSelectVisit: (visitId: string, billId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export default function ClinicHistory({ onSelectVisit, onSelectPatient }: ClinicHistoryProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    // Sort visits by date latest first
    const allVisits = getVisits().sort((a, b) => b.visitDate.localeCompare(a.visitDate));
    setVisits(allVisits);
    setPatients(getPatients());
  }, []);

  // Helper to find patient name
  const getPatientDetails = (patientId: string) => {
    const p = patients.find(pat => pat.id === patientId);
    return p ? { name: p.fullName, gender: p.gender, age: p.age } : { name: 'Unknown Patient', gender: 'N/A', age: 'N/A' };
  };

  // Filter visits
  const filteredVisits = visits.filter(v => {
    const patientInfo = getPatientDetails(v.patientId);
    const matchesSearch = 
      patientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = selectedDate ? v.visitDate === selectedDate : true;
    
    return matchesSearch && matchesDate;
  });

  // Group visits by date for dates sectioning
  const groupedVisits: { [date: string]: Visit[] } = {};
  filteredVisits.forEach(v => {
    if (!groupedVisits[v.visitDate]) {
      groupedVisits[v.visitDate] = [];
    }
    groupedVisits[v.visitDate].push(v);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groupedVisits).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-800">Clinic Visit History</h2>
        <p className="text-sm text-slate-500">Chronological logs of all clinical consultations and remedy prescriptions</p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by Patient Name, ID, Symptoms, or Diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-xs font-semibold text-slate-700"
          />
        </div>

        <div className="relative w-full md:w-56">
          <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-xs font-semibold font-mono text-slate-700"
          />
        </div>

        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {/* History Timeline */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm text-slate-400">
            <Clock className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="font-bold">No visit records match the criteria.</p>
            <p className="text-xs mt-1">Try resetting the search filters or dates query.</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              {/* Date Header Badge */}
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-full font-mono shadow-xs">
                  📅 {date}
                </span>
                <span className="h-px bg-slate-200 flex-1"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{groupedVisits[date].length} visits</span>
              </div>

              {/* Visits list for this date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedVisits[date].map(v => {
                  const patientInfo = getPatientDetails(v.patientId);
                  return (
                    <div key={v.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Header Patient info row */}
                        <div className="flex justify-between items-start">
                          <div 
                            onClick={() => onSelectPatient(v.patientId)}
                            className="cursor-pointer group"
                          >
                            <h4 className="font-bold text-sm text-slate-800 group-hover:text-green-700 group-hover:underline flex items-center gap-1">
                              <User className="h-4 w-4 text-slate-400 shrink-0" />
                              {patientInfo.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {v.patientId} • {patientInfo.gender}, {patientInfo.age} yrs
                            </p>
                          </div>
                          <span className="bg-slate-100 text-slate-600 font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                            {v.id}
                          </span>
                        </div>

                        {/* Symptom / Diagnosis */}
                        <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <span className="font-black text-[10px] text-slate-400 uppercase block font-sans">Symptom Summary:</span>
                            <p className="text-slate-700 font-medium line-clamp-2">{v.symptoms}</p>
                          </div>
                          {v.diagnosis && (
                            <div className="pt-1.5 border-t border-slate-200/50">
                              <span className="font-black text-[10px] text-slate-400 uppercase block font-sans">Diagnosis:</span>
                              <p className="text-green-800 font-bold line-clamp-1">{v.diagnosis}</p>
                            </div>
                          )}
                        </div>

                        {/* Prescribed medicines */}
                        {v.medicines && v.medicines.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Prescription:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {v.medicines.map((m, idx) => (
                                <span key={idx} className="inline-flex items-center space-x-1 bg-green-50/50 border border-green-100/60 px-2 py-0.5 rounded-lg text-[10px] text-green-800 font-bold">
                                  <Pill className="h-3 w-3 text-green-600 shrink-0" />
                                  <span>{m.name} {m.potency !== 'N/A' && m.potency}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* View Action row */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        {v.followUpDate ? (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100/60 px-2 py-0.5 rounded font-black font-mono">
                            🔁 Next: {v.followUpDate}
                          </span>
                        ) : (
                          <span></span>
                        )}

                        <button
                          onClick={() => onSelectVisit(v.id, v.billId || v.id.replace('VIS', 'BILL'))}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-green-700 hover:text-green-800 hover:underline cursor-pointer group"
                        >
                          <span>View Prescription</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
