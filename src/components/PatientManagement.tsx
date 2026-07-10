import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Search, User, Clipboard, Plus, ShieldCheck, Phone, MapPin, 
  Trash2, Edit3, Calendar, FileText, Check, ArrowRight 
} from 'lucide-react';
import { 
  getPatients, savePatient, deletePatient, generatePatientId 
} from '../utils/db';
import { Patient } from '../types';

interface PatientManagementProps {
  onSelectPatient: (patientId: string) => void;
  onGoToPrescription: (patientId: string) => void;
  initialPatientId?: string | null;
}

export default function PatientManagement({ onSelectPatient, onGoToPrescription, initialPatientId }: PatientManagementProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  
  // Registration Form State
  const [showRegForm, setShowRegForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({
    id: '',
    fullName: '',
    fatherOrHusbandName: '',
    age: 0,
    gender: 'Male',
    mobileNumber: '',
    address: '',
    weight: '',
    bloodPressure: '',
    height: '',
    bloodGroup: '',
    registrationDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    diagnosis: '',
    allergies: '',
    doctorNotes: '',
    photoUrl: ''
  });

  useEffect(() => {
    setPatients(getPatients());
    if (initialPatientId) {
      const existing = getPatients().find(p => p.id === initialPatientId);
      if (existing) {
        setFormData(existing);
        setEditMode(true);
        setShowRegForm(true);
      }
    }
  }, [initialPatientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleOpenNewForm = () => {
    setEditMode(false);
    const newId = generatePatientId();
    setFormData({
      id: newId,
      fullName: '',
      fatherOrHusbandName: '',
      age: 30,
      dateOfBirth: '',
      gender: 'Male',
      mobileNumber: '',
      address: '',
      weight: '70 kg',
      isDiabetic: false,
      bloodPressure: '120/80',
      height: '5\'6"',
      bloodGroup: 'B+',
      registrationDate: new Date().toISOString().split('T')[0],
      chiefComplaint: '',
      diagnosis: '',
      allergies: 'None',
      doctorNotes: '',
      photoUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`
    });
    setShowRegForm(true);
  };

  const handleSave = (goToPrescriptionAfter = false) => {
    if (!formData.fullName || !formData.id) {
      alert('Please fill out at least the Full Name field.');
      return;
    }

    const patientToSave: Patient = {
      id: formData.id,
      fullName: formData.fullName,
      fatherOrHusbandName: formData.fatherOrHusbandName || '',
      age: formData.age || 0,
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender || 'Male',
      mobileNumber: formData.mobileNumber || '',
      address: formData.address || '',
      weight: formData.weight || '',
      isDiabetic: formData.isDiabetic || false,
      bloodPressure: formData.bloodPressure || '',
      height: formData.height || '',
      bloodGroup: formData.bloodGroup || '',
      registrationDate: formData.registrationDate || new Date().toISOString().split('T')[0],
      chiefComplaint: formData.chiefComplaint || '',
      diagnosis: formData.diagnosis || '',
      allergies: formData.allergies || '',
      doctorNotes: formData.doctorNotes || '',
      photoUrl: formData.photoUrl || ''
    };

    savePatient(patientToSave);
    setPatients(getPatients());
    setShowRegForm(false);
    setEditMode(false);

    if (goToPrescriptionAfter) {
      onGoToPrescription(patientToSave.id);
    } else {
      onSelectPatient(patientToSave.id);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this patient and all their visit histories permanently? This cannot be undone.')) {
      deletePatient(id);
      setPatients(getPatients());
    }
  };

  const handleEdit = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(p);
    setEditMode(true);
    setShowRegForm(true);
  };

  // Search filter
  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = p.id.toLowerCase().includes(query) || 
                          p.fullName.toLowerCase().includes(query) || 
                          p.mobileNumber.toLowerCase().includes(query);
    const matchesGender = selectedGender === 'All' || p.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Patient Database</h2>
          <p className="text-sm text-slate-500">Register and manage homeopathic clinical profiles securely</p>
        </div>
        {!showRegForm && (
          <button 
            onClick={handleOpenNewForm}
            className="flex items-center justify-center space-x-2 py-2.5 px-5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-sm transition-all text-sm cursor-pointer"
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>Add New Patient</span>
          </button>
        )}
      </div>

      {/* Main Grid View */}
      {showRegForm ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-green-800 text-lg">
              {editMode ? `Edit Patient Profile: ${formData.id}` : 'Register New Patient Profile'}
            </h3>
            <button 
              onClick={() => { setShowRegForm(false); setEditMode(false); }}
              className="text-slate-400 hover:text-slate-600 font-semibold text-sm hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Primary Details Block */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Generated ID</label>
                <input 
                  type="text" 
                  name="id" 
                  value={formData.id} 
                  disabled 
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName || ''} 
                  onChange={handleInputChange}
                  placeholder="e.g., Muhammad Bilal"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Father / Husband Name</label>
                <input 
                  type="text" 
                  name="fatherOrHusbandName" 
                  value={formData.fatherOrHusbandName || ''} 
                  onChange={handleInputChange}
                  placeholder="Father's or husband's name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>
            </div>

            {/* Vital Information Block */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 font-bold">Date of Birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  value={formData.dateOfBirth || ''} 
                  onChange={(e) => {
                    const dob = e.target.value;
                    setFormData(prev => {
                      const updated = { ...prev, dateOfBirth: dob };
                      if (dob) {
                        const birthYear = new Date(dob).getFullYear();
                        const currentYear = new Date().getFullYear();
                        const calculatedAge = currentYear - birthYear;
                        if (!isNaN(calculatedAge) && calculatedAge >= 0) {
                          updated.age = calculatedAge;
                        }
                      }
                      return updated;
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age || ''} 
                  onChange={handleInputChange}
                  placeholder="30"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender || 'Male'} 
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  name="mobileNumber" 
                  value={formData.mobileNumber || ''} 
                  onChange={handleInputChange}
                  placeholder="+92 300 1234567"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blood Group</label>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup || ''} 
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Registration Date</label>
                <input 
                  type="date" 
                  name="registrationDate" 
                  value={formData.registrationDate || ''} 
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Patient Photo (URL)</label>
                <input 
                  type="text" 
                  name="photoUrl" 
                  value={formData.photoUrl || ''} 
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>
            </div>

            {/* Vitals Form Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Weight</label>
                <input 
                  type="text" 
                  name="weight" 
                  value={formData.weight || ''} 
                  onChange={handleInputChange}
                  placeholder="70 kg"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Blood Pressure</label>
                <input 
                  type="text" 
                  name="bloodPressure" 
                  value={formData.bloodPressure || ''} 
                  onChange={handleInputChange}
                  placeholder="120/80"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Height</label>
                <input 
                  type="text" 
                  name="height" 
                  value={formData.height || ''} 
                  onChange={handleInputChange}
                  placeholder="5ft 7in"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 font-bold">Is Patient Diabetic?</label>
                <select 
                  name="isDiabetic" 
                  value={formData.isDiabetic ? 'Yes' : 'No'} 
                  onChange={(e) => {
                    const val = e.target.value === 'Yes';
                    setFormData(prev => ({ ...prev, isDiabetic: val }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700"
                >
                  <option value="No">No (Non-Diabetic)</option>
                  <option value="Yes">Yes (Diabetic)</option>
                </select>
              </div>
            </div>

            {/* Clinic Text Areas */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label>
                <textarea 
                  name="address" 
                  rows={2}
                  value={formData.address || ''} 
                  onChange={handleInputChange}
                  placeholder="Residential physical address"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-500 uppercase mb-1 font-bold">Chief Complaint / Symptoms *</label>
                  <textarea 
                    name="chiefComplaint" 
                    rows={3}
                    value={formData.chiefComplaint || ''} 
                    onChange={handleInputChange}
                    placeholder="Chief issues reported by patient"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-green-600 uppercase mb-1 font-bold">Diagnosis</label>
                  <textarea 
                    name="diagnosis" 
                    rows={3}
                    value={formData.diagnosis || ''} 
                    onChange={handleInputChange}
                    placeholder="Clinical evaluation or miasmatic assessment"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-600 uppercase mb-1 font-bold">Allergies / Miasms</label>
                  <textarea 
                    name="allergies" 
                    rows={2}
                    value={formData.allergies || ''} 
                    onChange={handleInputChange}
                    placeholder="Penicillin, Sulfa, Lactose, etc."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 font-bold">Doctor Notes / Observation</label>
                  <textarea 
                    name="doctorNotes" 
                    rows={2}
                    value={formData.doctorNotes || ''} 
                    onChange={handleInputChange}
                    placeholder="Constitutional symptoms, physical generals, modalities, etc."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => handleSave(false)}
                className="flex items-center justify-center space-x-2 py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all text-sm cursor-pointer"
              >
                <Check className="h-4.5 w-4.5 text-slate-500" />
                <span>Save Patient Profile</span>
              </button>

              <button 
                type="button"
                onClick={() => handleSave(true)}
                className="flex items-center justify-center space-x-2 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
              >
                <span>Save & Create Prescription</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Patient search listing */
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
                placeholder="Search patient by ID (e.g. HHC-2026-0001), Name, or Mobile number..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:bg-white text-slate-700 text-sm font-medium transition-all"
              />
            </div>

            {/* Gender Filters */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 uppercase mr-1">Gender:</span>
              {['All', 'Male', 'Female'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedGender === gender 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredPatients.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="text-4xl">👥</div>
              <h4 className="font-display font-bold text-slate-700 text-lg">No Patients Found</h4>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No profiles match your filters or search terms. Try double checking the patient ID or mobile phone number.
              </p>
              <button 
                onClick={handleOpenNewForm}
                className="mt-2 inline-flex items-center space-x-2 py-2 px-4 bg-green-50 text-green-700 font-bold text-xs rounded-xl hover:bg-green-100 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Register as a New Patient</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div className="space-y-4">
                    {/* ID and Name */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 font-bold shrink-0">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.fullName} referrerPolicy="no-referrer" className="h-full w-full object-cover rounded-xl" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-slate-800 leading-tight group-hover:text-green-700 transition-colors">
                            {p.fullName}
                          </h4>
                          <div className="flex flex-col space-y-0.5">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                {p.id}
                              </span>
                              {p.isDiabetic !== undefined && (
                                <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${p.isDiabetic ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                  {p.isDiabetic ? 'Diabetic' : 'Non-Diabetic'}
                                </span>
                              )}
                            </div>
                            {p.dateOfBirth && (
                              <span className="text-[10px] font-semibold text-slate-500">
                                DOB: {new Date(p.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick controls - permanently visible for convenient access */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button 
                          onClick={(e) => handleEdit(p, e)}
                          title="Edit patient profile"
                          className="p-2 bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                        >
                          <Edit3 className="h-4.5 w-4.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(p.id, e)}
                          title="Delete patient profile"
                          className="p-2 bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>

                    {/* Meta Indicators */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 text-center font-sans text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Age/Gender</span>
                        <span className="font-bold text-slate-700">{p.age} yrs, {p.gender[0]}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Blood Group</span>
                        <span className="font-bold text-slate-700">{p.bloodGroup || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">Weight</span>
                        <span className="font-bold text-slate-700 font-mono text-[11px]">{p.weight || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Chief Complaint info */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Chief Complaint:</span>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2">
                        {p.chiefComplaint || 'No complaints logged.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Reg: {p.registrationDate}
                    </span>

                    <button 
                      onClick={(e) => { e.stopPropagation(); onGoToPrescription(p.id); }}
                      className="flex items-center space-x-1 py-1.5 px-3 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      <span>Prescribe</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
