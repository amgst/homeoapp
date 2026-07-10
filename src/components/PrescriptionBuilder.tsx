import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Pill, Activity, User, BookOpen, AlertTriangle, 
  Sparkles, CheckCircle, ArrowRight, CornerDownRight, CheckSquare, Square
} from 'lucide-react';
import { 
  getPatients, getInventory, saveVisit, generateVisitId, generateBillId, generateBillNumber, saveBill 
} from '../utils/db';
import { Patient, InventoryMedicine, PrescribedMedicine, Visit, Bill } from '../types';
import MurakkabatChart from './MurakkabatChart';

interface PrescriptionBuilderProps {
  initialPatientId?: string | null;
  onSuccess: (visitId: string, billId: string) => void;
  onCancel: () => void;
}

export default function PrescriptionBuilder({ initialPatientId, onSuccess, onCancel }: PrescriptionBuilderProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [inventory, setInventory] = useState<InventoryMedicine[]>([]);
  
  // Selection states
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Active prescriptions list
  const [prescriptionList, setPrescriptionList] = useState<PrescribedMedicine[]>([]);
  
  // Current editing medicine item
  const [currentMed, setCurrentMed] = useState<Partial<PrescribedMedicine>>({
    id: '',
    name: '',
    potency: '',
    form: 'Pills',
    quantity: '1 Bottle',
    duration: '7 Days',
    timing: { morning: true, afternoon: false, evening: false, night: true },
    foodInstructions: 'After Food',
    specialInstructions: ''
  });

  // Search query in stock list
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryMedicine | null>(null);

  // Patient search state
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // AI recommendations states
  const [aiRecommendations, setAiRecommendations] = useState<{name: string, inInventory: boolean, reason: string}[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Dose Combination state
  const [isCombinedMode, setIsCombinedMode] = useState(false);
  const [combinedRemedies, setCombinedRemedies] = useState<string[]>([]);
  const [activeRemedyTab, setActiveRemedyTab] = useState<'single' | 'murakkabat'>('single');

  // Visit details
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Billing parameters (Zeroed since pricing is disabled)
  const [doctorFee, setDoctorFee] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const listPatients = getPatients();
    setPatients(listPatients);
    setInventory(getInventory());

    if (initialPatientId) {
      const matched = listPatients.find(p => p.id === initialPatientId);
      if (matched) {
        setSelectedPatient(matched);
        setSelectedPatientId(matched.id);
        setPatientSearchQuery(`${matched.fullName} (${matched.id})`);
        // Autofill current symptoms/diagnosis based on patient's general complaint
        setSymptoms(matched.chiefComplaint);
        setDiagnosis(matched.diagnosis);
      }
    }
  }, [initialPatientId]);

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    const matched = patients.find(p => p.id === patientId);
    if (matched) {
      setSelectedPatient(matched);
      setPatientSearchQuery(`${matched.fullName} (${matched.id})`);
      setSymptoms(matched.chiefComplaint);
      setDiagnosis(matched.diagnosis);
    } else {
      setSelectedPatient(null);
      setPatientSearchQuery('');
    }
  };

  const handleAddAiRecommendedMed = (medName: string, reason: string) => {
    // Try to find the matched medicine in our inventory to get ID, potency and form
    const matched = inventory.find(i => i.name.toLowerCase() === medName.toLowerCase());
    const finalId = matched ? matched.id : `AI-${Date.now()}`;
    const finalPotency = matched ? matched.potency : '30C';
    const finalForm = matched ? (matched.type || 'Pills') : 'Pills';

    const itemToAdd: PrescribedMedicine = {
      id: finalId,
      name: matched ? matched.name : medName,
      potency: finalPotency,
      form: finalForm as any,
      quantity: '1 Bottle',
      duration: '7 Days',
      timing: {
        morning: true,
        afternoon: false,
        evening: false,
        night: true,
      },
      foodInstructions: 'After Food',
      specialInstructions: reason
    };

    setPrescriptionList(prev => {
      if (prev.some(m => m.name.toLowerCase() === itemToAdd.name.toLowerCase())) {
        alert(`${itemToAdd.name} is already in the prescription list.`);
        return prev;
      }
      return [...prev, itemToAdd];
    });
  };

  const handleGetAiRecommendations = async () => {
    const query = diagnosis || symptoms;
    if (!query.trim()) {
      alert('Please write symptoms or diagnosis (in Urdu or English) first.');
      return;
    }

    setIsLoadingAi(true);
    setAiError(null);
    setAiRecommendations([]);

    try {
      const response = await fetch('/api/recommend-medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: query,
          inventory: inventory
        })
      });

      const data = await response.json();
      if (data.error) {
        setAiError(data.error);
      } else if (data.recommendations) {
        setAiRecommendations(data.recommendations);
      } else {
        setAiError('Failed to parse response. Please try again.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Server network error occurred.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Patient search filtering
  const filteredPatients = patients.filter(p => {
    const term = patientSearchQuery.toLowerCase();
    return p.fullName.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
  });

  // Medicine Stock selection
  const filteredMeds = inventory.filter(i => {
    const term = medSearchQuery.toLowerCase();
    return i.name.toLowerCase().includes(term) || i.potency.toLowerCase().includes(term);
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleSelectMedFromStock = (med: InventoryMedicine) => {
    if (isCombinedMode) {
      if (combinedRemedies.includes(med.name)) {
        alert('This remedy is already in the combination.');
        return;
      }
      setCombinedRemedies(prev => [...prev, med.name]);
      if (!currentMed.potency) {
        setCurrentMed(prev => ({
          ...prev,
          potency: med.potency
        }));
      }
      setMedSearchQuery('');
    } else {
      setSelectedInventoryItem(med);
      setMedSearchQuery(`${med.name} ${med.potency}`);
      setCurrentMed(prev => ({
        ...prev,
        id: med.id,
        name: med.name,
        potency: med.potency
      }));
    }
  };

  const handleSelectMurakkabCompound = (compoundName: string) => {
    // Check if already prescribed
    if (prescriptionList.some(m => m.name === compoundName)) {
      // Remove it if clicked again (toggle mode)
      setPrescriptionList(prev => prev.filter(m => m.name !== compoundName));
      return;
    }

    // Find the medicine in our inventory to get its correct ID or details
    const matched = inventory.find(i => i.name === compoundName);
    const finalId = matched ? matched.id : `MED-MUR-${Date.now()}`;

    const itemToAdd: PrescribedMedicine = {
      id: finalId,
      name: compoundName,
      potency: 'N/A',
      form: 'Compound',
      quantity: '1 Bottle',
      duration: '7 Days',
      timing: {
        morning: true,
        afternoon: false,
        evening: false,
        night: true,
      },
      foodInstructions: 'After Food',
      specialInstructions: 'Dissolve 4 pills on tongue dry.'
    };

    setPrescriptionList(prev => [...prev, itemToAdd]);
  };

  const handleAddMedicine = () => {
    let finalName = currentMed.name || '';
    let finalId = currentMed.id || `M-${Date.now()}`;

    if (isCombinedMode) {
      if (combinedRemedies.length < 2) {
        alert('Please add at least 2 remedies to create a combined dose.');
        return;
      }
      finalName = combinedRemedies.join(' + ');
      finalId = `COMB-${Date.now()}`;
    }

    if (!finalName.trim() || !currentMed.potency) {
      alert('Please select or specify both the Remedy Name and Potency.');
      return;
    }

    const itemToAdd: PrescribedMedicine = {
      id: finalId,
      name: finalName,
      potency: currentMed.potency,
      form: currentMed.form || 'Pills',
      quantity: currentMed.quantity || '1 Bottle',
      duration: currentMed.duration || '7 Days',
      timing: {
        morning: currentMed.timing?.morning ?? true,
        afternoon: currentMed.timing?.afternoon ?? false,
        evening: currentMed.timing?.evening ?? false,
        night: currentMed.timing?.night ?? true,
      },
      foodInstructions: currentMed.foodInstructions || 'After Food',
      specialInstructions: currentMed.specialInstructions || ''
    };

    setPrescriptionList(prev => [...prev, itemToAdd]);
    
    // Reset medicine section
    setSelectedInventoryItem(null);
    setMedSearchQuery('');
    setCombinedRemedies([]);
    setCurrentMed({
      id: '',
      name: '',
      potency: '',
      form: 'Pills',
      quantity: '1 Bottle',
      duration: '7 Days',
      timing: { morning: true, afternoon: false, evening: false, night: true },
      foodInstructions: 'After Food',
      specialInstructions: ''
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescriptionList(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTiming = (key: 'morning' | 'afternoon' | 'evening' | 'night') => {
    setCurrentMed(prev => ({
      ...prev,
      timing: {
        ...prev.timing!,
        [key]: !prev.timing![key]
      }
    }));
  };

  // Save full prescription session + auto bill generation
  const handleSavePrescriptionAndBill = () => {
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    if (!symptoms.trim()) {
      alert('Please input active clinical symptoms.');
      return;
    }

    const visitId = generateVisitId();
    const billId = generateBillId();
    const billNum = generateBillNumber();

    // 1. Billing and medicine charges are completely removed / zeroed out
    const medicineCharges = 0;
    const totalBillAmt = 0;

    // 2. Save Clinical Visit Record
    const visitRecord: Visit = {
      id: visitId,
      patientId: selectedPatient.id,
      visitDate: new Date().toISOString().split('T')[0],
      symptoms,
      diagnosis,
      doctorNotes,
      medicines: prescriptionList,
      followUpDate: followUpDate || undefined,
      billId: billId
    };

    // 3. Save Clinic Bill Invoice
    const billRecord: Bill = {
      id: billId,
      billNumber: billNum,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      doctorFee,
      medicineCharges,
      discount,
      totalAmount: totalBillAmt,
      paymentMethod: 'Cash',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    saveVisit(visitRecord);
    saveBill(billRecord);

    onSuccess(visitId, billId);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Prescription Builder</h2>
          <p className="text-sm text-slate-500">Design custom constitutional remedies with live stock balance checks</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline"
        >
          Cancel Builder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Add Remedies */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Patient Selection Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center">
              <User className="h-4.5 w-4.5 text-green-600 mr-2" />
              Patient Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Select Registered Patient</label>
                <input
                  type="text"
                  placeholder="🔍 Search patient name or ID..."
                  value={patientSearchQuery}
                  onChange={(e) => {
                    setPatientSearchQuery(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                />
                
                {showPatientDropdown && (
                  <div className="absolute z-40 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                    <div 
                      onClick={() => {
                        setSelectedPatientId('');
                        setSelectedPatient(null);
                        setPatientSearchQuery('');
                        setShowPatientDropdown(false);
                      }}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs font-black text-rose-500"
                    >
                      -- Clear Selection --
                    </div>
                    {filteredPatients.length === 0 ? (
                      <div className="p-3 text-xs text-slate-400 text-center font-bold">
                        No registered patients found.
                      </div>
                    ) : (
                      filteredPatients.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => {
                            handlePatientChange(p.id);
                            setShowPatientDropdown(false);
                          }}
                          className="p-2.5 hover:bg-green-50/50 cursor-pointer flex items-center justify-between text-xs font-semibold"
                        >
                          <span>{p.fullName} <span className="text-slate-400 font-normal">({p.id})</span></span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{p.mobileNumber || 'No Phone'}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/50 text-xs text-slate-600 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-green-950">{selectedPatient.fullName}</p>
                    <p>{selectedPatient.gender}, {selectedPatient.age} yrs • Blood: {selectedPatient.bloodGroup || 'N/A'}</p>
                    <p className="font-mono text-[10px] text-slate-400">Allergies: {selectedPatient.allergies || 'None listed'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Symptoms and Diagnosis Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="h-4.5 w-4.5 text-rose-500 mr-2" />
                Clinical Presentation
              </span>
              <button
                type="button"
                onClick={handleGetAiRecommendations}
                disabled={isLoadingAi || (!symptoms.trim() && !diagnosis.trim())}
                className="inline-flex items-center space-x-1 py-1.5 px-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-black rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isLoadingAi ? 'Analyzing Urdu...' : '✨ AI Remedy Recommendation'}</span>
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 font-bold text-rose-600">Symptoms / Presentations *</label>
                <textarea 
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe active symptoms or write them in Urdu (e.g. پیٹ میں درد، رات کو شدت)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 font-bold text-green-700">Evaluation & Diagnosis (In Urdu / English)</label>
                <textarea 
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis or write in Urdu (e.g. دائمی نزلہ، Gastritis)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-700 font-semibold"
                />
              </div>
            </div>

            {/* AI Recommendation Panel */}
            {(isLoadingAi || aiError || aiRecommendations.length > 0) && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>AI Pharmacy Diagnostic Assistant</span>
                </div>

                {isLoadingAi && (
                  <div className="flex items-center justify-center py-6 space-x-2 text-xs font-bold text-slate-500">
                    <span className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
                    <span>علومات کا تجزیہ کیا جا رہا ہے اور فارمیسی اسٹاک سے ادویات تلاش کی جا رہی ہیں...</span>
                  </div>
                )}

                {aiError && (
                  <div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-xl border border-red-100 flex items-center space-x-2">
                    <span className="shrink-0 font-bold">⚠️</span>
                    <span>{aiError}</span>
                  </div>
                )}

                {aiRecommendations.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      Recommended Constitutional Remedies matched with stock:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aiRecommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-2.5 hover:border-green-200 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-sm text-slate-800">{rec.name}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded font-sans uppercase ${
                                rec.inInventory 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {rec.inInventory ? 'In Stock' : 'Not in Stock'}
                              </span>
                            </div>
                            {/* Urdu reasoning justification */}
                            <p className="text-xs text-slate-600 leading-relaxed font-sans text-right" dir="rtl">
                              {rec.reason}
                            </p>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddAiRecommendedMed(rec.name, rec.reason)}
                              className="py-1.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-950 text-[10px] font-black rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                            >
                              <span>➕ Add to Prescription</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remedy prescription addition box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Pill className="h-4.5 w-4.5 text-emerald-600 mr-2" />
                Add Homeopathic Remedy
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                Pharmacy Stock Synced
              </span>
            </h3>

            {/* Tab selection to toggle between standard and Murakkabat */}
            <div className="flex border-b border-slate-100 pb-1">
              <button
                type="button"
                onClick={() => setActiveRemedyTab('single')}
                className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  activeRemedyTab === 'single'
                    ? 'border-green-600 text-green-700 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Single Remedy / Custom Combination
              </button>
              <button
                type="button"
                onClick={() => setActiveRemedyTab('murakkabat')}
                className={`flex-1 pb-2 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  activeRemedyTab === 'murakkabat'
                    ? 'border-green-600 text-green-700 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                50 Murakkabat Quick Prescribe (50 مرکبات)
              </button>
            </div>

            {activeRemedyTab === 'single' ? (
              <div className="space-y-5">
                {/* Dose Combination Toggle */}
            <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox"
                  id="combined-mode-toggle"
                  checked={isCombinedMode}
                  onChange={(e) => {
                    setIsCombinedMode(e.target.checked);
                    setCombinedRemedies([]);
                    setSelectedInventoryItem(null);
                    setMedSearchQuery('');
                  }}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500 h-4.5 w-4.5 cursor-pointer"
                />
                <label htmlFor="combined-mode-toggle" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Combine multiple medicines in one dose (e.g., Arnica + Belladonna)
                </label>
              </div>
              {isCombinedMode && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Combination Active
                </span>
              )}
            </div>

            {/* Combined Remedies Active List */}
            {isCombinedMode && (
              <div className="bg-emerald-50/25 p-4 rounded-xl border border-emerald-100/60 space-y-2.5">
                <p className="text-xs font-bold text-emerald-900 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1.5 text-emerald-600" />
                  Remedies included in this combined dose:
                </p>
                <div className="flex flex-wrap gap-2">
                  {combinedRemedies.map((rem, idx) => (
                    <span key={idx} className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-sm">
                      <span>{rem}</span>
                      <button 
                        type="button" 
                        onClick={() => setCombinedRemedies(p => p.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-600 font-bold ml-1 text-sm focus:outline-hidden"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {combinedRemedies.length === 0 && (
                    <p className="text-xs text-slate-400 font-medium italic">No remedies added to this combination yet. Search or enter below to add.</p>
                  )}
                </div>
              </div>
            )}

            {/* Live Pharmacy Stock Search Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                {isCombinedMode ? 'Search & Add Remedy to Combination' : 'Search Remedy Inventory'}
              </label>
              <input 
                type="text" 
                value={medSearchQuery}
                onChange={(e) => {
                  setMedSearchQuery(e.target.value);
                  setSelectedInventoryItem(null);
                }}
                placeholder="Type remedy name (e.g., Arnica, Nux Vomica)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-hidden text-sm text-slate-800 font-bold"
              />

              {medSearchQuery && !selectedInventoryItem && (
                <div className="absolute z-10 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filteredMeds.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 font-semibold text-center">
                      No matching remedies in stock inventory.
                    </div>
                  ) : (
                    filteredMeds.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => handleSelectMedFromStock(m)}
                        className="p-3 hover:bg-green-50/50 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{m.name} <span className="text-green-700 font-mono font-black">{m.potency}</span></p>
                          <p className="text-slate-400">{m.company} • Batch: {m.batchNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[10px] font-bold ${m.currentStock <= m.minimumStock ? 'text-amber-600' : 'text-slate-400'}`}>
                            Stock: {m.currentStock} units
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Custom Remedy Adder Button */}
            {medSearchQuery.trim() && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const nameToUse = medSearchQuery.trim();
                    if (isCombinedMode) {
                      if (!combinedRemedies.includes(nameToUse)) {
                        setCombinedRemedies(p => [...p, nameToUse]);
                      }
                      setMedSearchQuery('');
                    } else {
                      setCurrentMed(prev => ({ ...prev, name: nameToUse }));
                      setSelectedInventoryItem(null);
                    }
                  }}
                  className="text-[11px] font-bold text-green-700 hover:text-green-800 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>+ Add custom remedy "{medSearchQuery.trim()}" {isCombinedMode ? 'to combination' : ''}</span>
                </button>
              </div>
            )}

            {/* Inventory Item feedback */}
            {selectedInventoryItem && (
              <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-green-950">Selected: {selectedInventoryItem.name} {selectedInventoryItem.potency}</p>
                  <p className="text-green-700 font-medium">Company: {selectedInventoryItem.company} | Size: {selectedInventoryItem.bottleSize}</p>
                </div>
                <div className="text-right">
                  {selectedInventoryItem.currentStock <= 0 ? (
                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-sm font-bold text-[10px]">
                      In Stock ({selectedInventoryItem.currentStock} units)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Remedy Parameters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Potency / Strength</label>
                <select 
                  value={currentMed.potency} 
                  onChange={(e) => {
                    const selectedPotency = e.target.value;
                    setCurrentMed(p => {
                      const updated = { ...p, potency: selectedPotency };
                      if (selectedPotency === 'Q') {
                        updated.form = 'Liquid';
                      }
                      return updated;
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 font-mono"
                >
                  <option value="">-- Select --</option>
                  <option value="30C">30C</option>
                  <option value="200C">200C</option>
                  <option value="1M">1M</option>
                  <option value="10M">10M</option>
                  <option value="CM">CM</option>
                  <option value="Q">Q (Mother Tincture)</option>
                  <option value="3X">3X</option>
                  <option value="6X">6X</option>
                  <option value="12X">12X</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Medicine Form</label>
                <select 
                  value={currentMed.form} 
                  onChange={(e) => {
                    const selectedForm = e.target.value as any;
                    setCurrentMed(p => {
                      const updated = { ...p, form: selectedForm };
                      if (selectedForm === 'Liquid' || selectedForm === 'Mother Tincture') {
                        updated.potency = 'Q';
                      } else if (selectedForm === 'Biochemic Salt') {
                        updated.potency = '6X';
                      } else if (selectedForm === 'Tablet' || selectedForm === 'Syrup' || selectedForm === 'Compound') {
                        updated.potency = 'N/A';
                      }
                      return updated;
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="Pills">Pills (Pellets)</option>
                  <option value="Drops">Drops (Liquid Dilution)</option>
                  <option value="Powder">Powder (Trituration)</option>
                  <option value="Capsules">Capsules</option>
                  <option value="Mother Tincture">Mother Tincture (Q)</option>
                  <option value="Tablet">Tablet (Tabs)</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Biochemic Salt">Biochemic Salt / Tissue Salt</option>
                  <option value="Compound">Compound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Quantity / Size</label>
                <input 
                  type="text" 
                  value={currentMed.quantity} 
                  onChange={(e) => setCurrentMed(p => ({ ...p, quantity: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  placeholder="e.g., 1 Bottle, 15 ml"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Duration</label>
                <select 
                  value={currentMed.duration} 
                  onChange={(e) => setCurrentMed(p => ({ ...p, duration: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="1 Day">1 Day</option>
                  <option value="3 Days">3 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Food Instructions</label>
                <select 
                  value={currentMed.foodInstructions} 
                  onChange={(e) => setCurrentMed(p => ({ ...p, foodInstructions: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="Before Food">Before Food</option>
                  <option value="After Food">After Food</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            {/* Dose timings checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Dosage Timing Schedule</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {['morning', 'afternoon', 'evening', 'night'].map((time) => {
                  const isActive = (currentMed.timing as any)?.[time];
                  return (
                    <button
                      type="button"
                      key={time}
                      onClick={() => toggleTiming(time as any)}
                      className={`flex items-center justify-center space-x-2 py-2 px-3 border rounded-xl font-semibold capitalize transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-green-50 border-green-300 text-green-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {isActive ? (
                        <CheckSquare className="h-4.5 w-4.5 text-green-600" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-slate-300" />
                      )}
                      <span>{time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special dosage directives */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Special Dosage Instructions</label>
              <input 
                type="text" 
                value={currentMed.specialInstructions} 
                onChange={(e) => setCurrentMed(p => ({ ...p, specialInstructions: e.target.value }))}
                placeholder="e.g., Dissolve 4 pills on tongue dry, or mix 5 drops in warm water..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-green-500"
              />
            </div>

                {/* Add Button */}
                <button 
                  type="button"
                  onClick={handleAddMedicine}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Remedy to Active Prescription List</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <MurakkabatChart 
                  onSelectCompound={handleSelectMurakkabCompound} 
                  selectedCompounds={prescriptionList.map(m => m.name)} 
                  compact={true} 
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Prescriptions list, follow-up, and billing parameters */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active prescription remedies panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center justify-between border-b border-slate-50 pb-2">
              <span>Active Prescription List</span>
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-sm font-mono text-xs font-black">
                {prescriptionList.length} Items
              </span>
            </h3>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {prescriptionList.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center font-semibold">No remedies added. Select and add from stock above.</p>
              ) : (
                prescriptionList.map((m, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 relative group">
                    <button 
                      onClick={() => handleRemoveMedicine(index)}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div>
                      <p className="font-bold text-xs text-slate-800 leading-tight pr-6">{m.name} <span className="text-green-700 font-mono text-[10px]">{m.potency}</span></p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{m.form} • {m.quantity}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/40">
                      <span>🕒 {m.duration} • {m.foodInstructions}</span>
                      <div className="flex space-x-1 font-mono text-[9px] bg-slate-200/50 px-1 rounded-sm">
                        <span className={m.timing.morning ? 'font-black text-green-700' : 'text-slate-300'}>M</span>
                        <span className={m.timing.afternoon ? 'font-black text-green-700' : 'text-slate-300'}>A</span>
                        <span className={m.timing.evening ? 'font-black text-green-700' : 'text-slate-300'}>E</span>
                        <span className={m.timing.night ? 'font-black text-green-700' : 'text-slate-300'}>N</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Clinical Directives & Follow Up Date */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm">Directives & Follow-up</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Doctor Notes for Patient</label>
              <textarea 
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter constitutional guidance, dietary restrictions (e.g. avoid raw onions), etc."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-xs text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Scheduled Follow-Up Date</label>
              <input 
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 text-xs font-mono text-slate-700"
              />
            </div>
          </div>

          {/* Save Action */}
          <div className="space-y-4">
            <button 
              onClick={handleSavePrescriptionAndBill}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Save & Register Prescription</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
