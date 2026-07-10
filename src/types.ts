export interface Patient {
  id: string; // Auto Generated e.g., HHC-2026-0001
  fullName: string;
  fatherOrHusbandName: string;
  age: number;
  dateOfBirth?: string;
  gender: string;
  mobileNumber: string;
  address: string;
  weight: string; // e.g., "70 kg"
  isDiabetic?: boolean;
  bloodPressure: string; // e.g., "120/80"
  height: string; // e.g., "5'8\""
  bloodGroup: string;
  registrationDate: string; // YYYY-MM-DD
  photoUrl?: string;
  chiefComplaint: string;
  diagnosis: string;
  allergies: string;
  doctorNotes: string;
}

export interface PrescribedMedicine {
  id: string;
  name: string;
  potency: string; // e.g., "30C", "200C", "Q"
  form: 'Pills' | 'Drops' | 'Powder' | 'Capsules' | 'Liquid' | 'Tablet' | 'Syrup' | 'Biochemic Salt' | 'Compound';
  quantity: string; // e.g., "1 bottle", "30ml"
  duration: string; // "1 Day" | "3 Days" | "7 Days" | "15 Days" | "30 Days" | "Custom"
  timing: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  foodInstructions: 'Before Food' | 'After Food' | 'None';
  specialInstructions?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string; // YYYY-MM-DD
  symptoms: string;
  diagnosis: string;
  doctorNotes: string;
  medicines: PrescribedMedicine[];
  followUpDate?: string; // YYYY-MM-DD
  billId?: string;
}

export interface InventoryMedicine {
  id: string;
  name: string;
  potency: string; // e.g., "30C", "200C", "1M", "Q"
  form?: 'Potency' | 'Mother Tincture' | 'Tablet' | 'Syrup' | 'Biochemic Salt' | 'Compound';
  company: string; // e.g., "Dr. Reckeweg", "Schwabe", "SBL"
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  bottleSize: string; // e.g., "30 ml", "100 Pellets"
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minimumStock: number;
  barcode?: string;
  qrCode?: string;
}

export interface Bill {
  id: string;
  billNumber: string; // e.g., "INV-2026-0001"
  patientId: string;
  patientName: string;
  doctorFee: number;
  medicineCharges: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  date: string; // YYYY-MM-DD HH:MM
}

export interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  clinicAddress: string;
  phoneNumber: string;
  clinicLogoUrl?: string;
  theme: 'Light' | 'Dark';
  language: 'English' | 'Urdu';
  printerType: 'Bluetooth' | 'USB' | 'System';
  printerAddress?: string;
  autoLockMinutes: number;
}

export interface ClinicUser {
  id: string;
  username: string;
  role: 'Doctor' | 'Receptionist';
}
