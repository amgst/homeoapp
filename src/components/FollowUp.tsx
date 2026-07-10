import React, { useState, useEffect } from 'react';
import { 
  Calendar, Check, AlertCircle, Clock, ChevronLeft, ChevronRight, User, 
  CheckCircle2, ArrowRight, PhoneCall 
} from 'lucide-react';
import { getVisits, getPatients } from '../utils/db';
import { Visit, Patient } from '../types';

interface FollowUpProps {
  onSelectPatient: (patientId: string) => void;
}

export default function FollowUp({ onSelectPatient }: FollowUpProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<'Today' | 'Tomorrow' | 'Next Week' | 'Missed' | 'All'>('Today');

  // Mini calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setVisits(getVisits());
    setPatients(getPatients());
  }, []);

  const getDayDiff = (dateStr: string) => {
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Categorization
  const todayFollowUps = visits.filter(v => v.followUpDate === todayStr);
  
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const tomorrowFollowUps = visits.filter(v => v.followUpDate === tomorrowStr);

  const nextWeekFollowUps = visits.filter(v => {
    if (!v.followUpDate) return false;
    const diff = getDayDiff(v.followUpDate);
    return diff > 1 && diff <= 7;
  });

  const missedFollowUps = visits.filter(v => {
    if (!v.followUpDate) return false;
    const diff = getDayDiff(v.followUpDate);
    return diff < 0; // Past dates
  });

  const getActiveList = () => {
    switch (activeTab) {
      case 'Today': return todayFollowUps;
      case 'Tomorrow': return tomorrowFollowUps;
      case 'Next Week': return nextWeekFollowUps;
      case 'Missed': return missedFollowUps;
      default: return visits.filter(v => !!v.followUpDate);
    }
  };

  // Simple mini calendar numbers
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // empty placeholders
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasFollowUp = visits.some(v => v.followUpDate === dateString);
      const isToday = dateString === todayStr;

      days.push(
        <div 
          key={day} 
          title={hasFollowUp ? `${visits.filter(v => v.followUpDate === dateString).length} Patient followups` : ''}
          className={`p-2 rounded-lg text-center relative font-mono text-xs font-semibold cursor-default ${
            isToday 
              ? 'bg-emerald-600 text-white' 
              : hasFollowUp 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'hover:bg-slate-100'
          }`}
        >
          {day}
          {hasFollowUp && !isToday && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></span>
          )}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (dir: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const nextDate = new Date(prev);
      nextDate.setMonth(prev.getMonth() + (dir === 'next' ? 1 : -1));
      return nextDate;
    });
  };

  const listToRender = getActiveList();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-800">Follow-up Schedules</h2>
        <p className="text-sm text-slate-500">Coordinate recurring clinic revisits and track client health progressions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Follow up tab indexes */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex border-b border-slate-100 pb-1 overflow-x-auto gap-2">
            {[
              { id: 'Today', label: "Today's Follow-ups", count: todayFollowUps.length, color: 'bg-emerald-50 text-emerald-700' },
              { id: 'Tomorrow', label: 'Tomorrow', count: tomorrowFollowUps.length, color: 'bg-teal-50 text-teal-700' },
              { id: 'Next Week', label: 'Next Week', count: nextWeekFollowUps.length, color: 'bg-indigo-50 text-indigo-700' },
              { id: 'Missed', label: 'Missed / Past', count: missedFollowUps.length, color: 'bg-rose-50 text-rose-700' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-emerald-500 text-white' : tab.color
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* List display */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {listToRender.length === 0 ? (
              <div className="text-center py-24 text-slate-400 space-y-2">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 animate-bounce" />
                <h4 className="font-display font-bold text-slate-700">Clear Schedule!</h4>
                <p className="text-sm">No follow-ups recorded for this period.</p>
              </div>
            ) : (
              listToRender.map(v => {
                const patient = patients.find(p => p.id === v.patientId);
                const diffDays = v.followUpDate ? getDayDiff(v.followUpDate) : 0;
                
                return (
                  <div 
                    key={v.id}
                    onClick={() => patient && onSelectPatient(patient.id)}
                    className="p-4 bg-slate-50 hover:bg-emerald-50/30 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold font-display text-sm">
                        {patient?.fullName.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {patient?.fullName || 'Unknown Patient'}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium font-mono">
                          ID: {v.patientId} • Contact: {patient?.mobileNumber || 'N/A'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 italic font-medium">
                          Last session: "{v.diagnosis}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-2 shrink-0">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Follow-up Date:</span>
                        <span className="text-xs font-bold font-mono text-slate-700">{v.followUpDate}</span>
                      </div>

                      {diffDays < 0 ? (
                        <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 rounded-sm font-bold text-[9px] uppercase font-mono">
                          🔴 Missed ({Math.abs(diffDays)} days ago)
                        </span>
                      ) : diffDays === 0 ? (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm font-bold text-[9px] uppercase font-mono">
                          🟢 Scheduled Today
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-sm font-bold text-[9px] uppercase font-mono">
                          🔵 In {diffDays} days
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Calendar grid widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            
            {/* Calendar header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center">
                <Calendar className="h-4.5 w-4.5 text-emerald-600 mr-2" />
                Clinic Calendar
              </h3>
              <div className="flex items-center space-x-1.5">
                <button 
                  onClick={() => changeMonth('prev')}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 min-w-[70px] text-center capitalize font-mono">
                  {currentDate.toLocaleString('default', { month: 'short' })} {currentDate.getFullYear()}
                </span>
                <button 
                  onClick={() => changeMonth('next')}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {renderCalendarDays()}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-100 font-semibold font-mono">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-emerald-600 rounded-full mr-1"></span>
                Today
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-emerald-50 border border-emerald-300 rounded-full mr-1"></span>
                Follow-ups
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
