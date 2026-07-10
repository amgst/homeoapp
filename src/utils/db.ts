import { Patient, Visit, InventoryMedicine, Bill, ClinicSettings, PrescribedMedicine } from '../types';
import { MURAKKABAT_LIST } from './murakkabat';

// Default mock inventory medicines
const DEFAULT_INVENTORY_BASE: InventoryMedicine[] = [
  {
    id: 'MED-0001',
    name: 'Arnica Montana',
    potency: '200C',
    company: 'Dr. Reckeweg',
    batchNumber: 'AR-9921',
    expiryDate: '2029-12-31',
    bottleSize: '30 ml',
    purchasePrice: 150,
    salePrice: 220,
    currentStock: 25,
    minimumStock: 5,
    barcode: '400012345678',
    qrCode: 'HHC-MED-0001'
  },
  {
    id: 'MED-0002',
    name: 'Nux Vomica',
    potency: '30C',
    company: 'Schwabe',
    batchNumber: 'NV-2180',
    expiryDate: '2028-06-30',
    bottleSize: '30 ml',
    purchasePrice: 130,
    salePrice: 190,
    currentStock: 3, // Low stock warning
    minimumStock: 5,
    barcode: '400087654321',
    qrCode: 'HHC-MED-0002'
  },
  {
    id: 'MED-0003',
    name: 'Arsenicum Album',
    potency: '30C',
    company: 'Dr. Reckeweg',
    batchNumber: 'AA-3341',
    expiryDate: '2026-09-15', // Near expiry alert
    bottleSize: '15 ml',
    purchasePrice: 140,
    salePrice: 200,
    currentStock: 12,
    minimumStock: 4,
    barcode: '400034567890',
    qrCode: 'HHC-MED-0003'
  },
  {
    id: 'MED-0004',
    name: 'Lycopodium Clavatum',
    potency: '200C',
    company: 'SBL',
    batchNumber: 'LY-4412',
    expiryDate: '2030-01-10',
    bottleSize: '30 ml',
    purchasePrice: 100,
    salePrice: 160,
    currentStock: 20,
    minimumStock: 5,
    barcode: '400045678901',
    qrCode: 'HHC-MED-0004'
  },
  {
    id: 'MED-0005',
    name: 'Thuja Occidentalis',
    potency: '1M',
    company: 'SBL',
    batchNumber: 'TH-0815',
    expiryDate: '2026-08-20', // Near expiry alert
    bottleSize: '30 ml',
    purchasePrice: 120,
    salePrice: 180,
    currentStock: 1, // Extremely low stock
    minimumStock: 4,
    barcode: '400056789012',
    qrCode: 'HHC-MED-0005'
  },
  {
    id: 'MED-0006',
    name: 'Belladonna',
    potency: '30C',
    company: 'Schwabe',
    batchNumber: 'BL-9912',
    expiryDate: '2028-11-30',
    bottleSize: '100 Pellets',
    purchasePrice: 160,
    salePrice: 240,
    currentStock: 15,
    minimumStock: 3,
    barcode: '400067890123',
    qrCode: 'HHC-MED-0006'
  },
  {
    id: 'MED-0007',
    name: 'Gelsemium',
    potency: '200C',
    company: 'Dr. Reckeweg',
    batchNumber: 'GE-1122',
    expiryDate: '2029-05-15',
    bottleSize: '30 ml',
    purchasePrice: 150,
    salePrice: 220,
    currentStock: 18,
    minimumStock: 4,
    barcode: '400078901234',
    qrCode: 'HHC-MED-0007'
  },
  {
    id: 'MED-0008',
    name: 'Sulphur',
    potency: '200C',
    company: 'SBL',
    batchNumber: 'SU-4521',
    expiryDate: '2029-08-10',
    bottleSize: '30 ml',
    purchasePrice: 110,
    salePrice: 170,
    currentStock: 0, // Out of stock warning
    minimumStock: 5,
    barcode: '400089012345',
    qrCode: 'HHC-MED-0008'
  },
  // Homeopathic Remedy Catalog (140 medicines from clinical layout card, IDs MED-0101 to MED-0240)
  { id: 'MED-0101', name: 'Abrotanum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B101', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0102', name: 'Aconite', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B102', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0103', name: 'Aconite', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B103', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0104', name: 'Aesculus', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B104', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0105', name: 'Aethusa', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B105', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0106', name: 'Agaricus', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B106', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0107', name: 'Agnus Castus', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B107', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0108', name: 'Artimisia', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B108', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0109', name: 'Aurum Mur', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B109', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0110', name: 'Antimonium Crud', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B110', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0111', name: 'Antimonium Tart', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B111', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0112', name: 'Apis Melli', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B112', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0113', name: 'Argentum Nit', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B113', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0114', name: 'Arnica', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B114', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0115', name: 'Arnica', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B115', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0116', name: 'Arsenic Alb', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B116', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0117', name: 'Arsenic Alb', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B117', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0118', name: 'Arsenic Sulp', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B118', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0119', name: 'Bacillinum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B119', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0120', name: 'Baptisia', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B120', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0121', name: 'Baptisia', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B121', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0122', name: 'Bryta Carb', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B122', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0123', name: 'Bryta Carb', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B123', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0124', name: 'Belladona', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B124', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0125', name: 'Belladona', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B125', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0126', name: 'Belladona', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B126', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0127', name: 'Benzonic Acid', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B127', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0128', name: 'Berberis Valg', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B128', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0129', name: 'Borex', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B129', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0130', name: 'Bryonia Alb', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B130', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0131', name: 'Bryonia Alb', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B131', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0132', name: 'Cactus Grand', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B132', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0133', name: 'Cadmium', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B133', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0134', name: 'Calc Carb', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B134', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0135', name: 'Calc Flour', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B135', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0136', name: 'Calc Phos', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B136', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0137', name: 'Calc Sulp', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B137', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0138', name: 'Cantharis', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B138', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0139', name: 'Carbo Veg', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B139', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0140', name: 'Carbo Veg', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B140', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0141', name: 'Caulophyllum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B141', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0142', name: 'Causticum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B142', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0143', name: 'Cholesterinum', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B143', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0144', name: 'Cocculus Ind', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B144', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0145', name: 'Chamomilla', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B145', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0146', name: 'Chelidonium', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B146', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0147', name: 'China Off', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B147', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0148', name: 'Cimicifuga', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B148', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0149', name: 'Cina', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B149', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0150', name: 'Colchicum', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B150', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0151', name: 'Colocynthis', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B151', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0152', name: 'Colocynthis', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B152', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0153', name: 'Conium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B153', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0154', name: 'Croton Tig', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B154', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0155', name: 'Cuprum Met', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B155', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0156', name: 'Digitalis', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B156', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0157', name: 'Dioscorea', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B157', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0158', name: 'Drosera', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B158', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0159', name: 'Dulcamara', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B159', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0160', name: 'Euphrasia', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B160', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0161', name: 'Equisetum', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B161', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0162', name: 'Eupatorium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B162', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0163', name: 'Ferum Phos', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B163', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0164', name: 'Gelsemium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B164', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0165', name: 'Glonine', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B165', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0166', name: 'Gnaphalium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B166', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0167', name: 'Graphites', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B167', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0168', name: 'Hepar Sulph', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B168', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0169', name: 'Hypericum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B169', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0170', name: 'Hydrocynic Acid', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B170', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0171', name: 'Hydrophobinium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B171', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0172', name: 'Ignitia', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B172', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0173', name: 'Ipecac', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B173', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0174', name: 'Infleuzinium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B174', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0175', name: 'Kali bich', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B175', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0176', name: 'Kali Carb', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B176', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0177', name: 'Kali Mur', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B177', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0178', name: 'Kali Phos', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B178', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0179', name: 'Kali Sulph', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B179', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0180', name: 'Kreosotum', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B180', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0181', name: 'Kurchi', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B181', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0182', name: 'Lachesis', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B182', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0183', name: 'Lac Def', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B183', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0184', name: 'Ledum Pal', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B184', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0185', name: 'Lillium Tig', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B185', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0186', name: 'Lycopodium', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B186', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0187', name: 'Lycopodium', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B187', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0188', name: 'Mag Phos', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B188', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0189', name: 'Medorrhinum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B189', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0190', name: 'Merc Sol', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B190', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0191', name: 'Merc Sol', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B191', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0192', name: 'Merc Cor', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B192', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0193', name: 'Millefolium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B193', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0194', name: 'Maja Trip', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B194', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0195', name: 'Nat Mur', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B195', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0196', name: 'Nat Phos', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B196', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0197', name: 'Nat Sulph', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B197', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0198', name: 'Nux Vomica', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B198', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0199', name: 'Nux Vomica', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B199', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0200', name: 'Onosmodium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B200', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0201', name: 'Passiflora', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B201', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0202', name: 'Petrolium', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B202', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0203', name: 'Phosphors', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B203', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0204', name: 'Picris Acid', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B204', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0205', name: 'Plumbum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B205', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0206', name: 'Podophyllum', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B206', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0207', name: 'Psorinum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B207', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0208', name: 'Plusatilla', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B208', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0209', name: 'Plusatilla', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B209', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0210', name: 'Phyrogenium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B210', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0211', name: 'Phytolacca Berry', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B211', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0212', name: 'Rhus Tox', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B212', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0213', name: 'Rhus Tox', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B213', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0214', name: 'Ruta Grave', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B214', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0215', name: 'Rumex', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B215', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0216', name: 'SecalCor', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B216', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0217', name: 'Sabina', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B217', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0218', name: 'Sepia', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B218', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0219', name: 'Sabadilla', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B219', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0220', name: 'Silicea', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B220', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0221', name: 'Silicea', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B221', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0222', name: 'Spigelia', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B222', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0223', name: 'Spongia Tos', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B223', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0224', name: 'Staphysagria', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B224', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0225', name: 'Stramonium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B225', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0226', name: 'Sulphur', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B226', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0227', name: 'Sulphur', potency: '1M', company: 'Schwabe', batchNumber: 'HHC-B227', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0228', name: 'Symphytum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B228', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0229', name: 'Syphilinium', potency: 'CM', company: 'Schwabe', batchNumber: 'HHC-B229', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0230', name: 'Teucrium', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B230', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0231', name: 'Tellurium', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B231', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0232', name: 'Thuja', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B232', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0233', name: 'Thuja', potency: '10M', company: 'Schwabe', batchNumber: 'HHC-B233', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0234', name: 'Tuberculinum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B234', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0235', name: 'Typhoidunum', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B235', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0236', name: 'Typhoidunum', potency: 'CM', company: 'Schwabe', batchNumber: 'HHC-B236', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0237', name: 'Veratrum Alb', potency: '30C', company: 'Schwabe', batchNumber: 'HHC-B237', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0238', name: 'Zincum Met', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B238', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0239', name: 'Zincum Sulph', potency: '200C', company: 'Schwabe', batchNumber: 'HHC-B239', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0240', name: 'Zincum Sulph', potency: 'CM', company: 'Schwabe', batchNumber: 'HHC-B240', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0241', name: 'Nux Vomica', potency: '1000', company: 'Schwabe', batchNumber: 'HHC-B241', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0242', name: 'Cobaltum Met', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B242', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0243', name: 'Progesterone', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B243', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0244', name: 'Thuja', potency: '1000', company: 'Schwabe', batchNumber: 'HHC-B244', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0245', name: 'Ammon Carbonicum', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B245', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0246', name: 'Carduus', potency: '30', company: 'Schwabe', batchNumber: 'HHC-B246', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0247', name: 'Silicea', potency: '1000', company: 'Schwabe', batchNumber: 'HHC-B247', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0248', name: 'Thuja', potency: 'CM', company: 'Schwabe', batchNumber: 'HHC-B248', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0249', name: 'Yohimbinum', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B249', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0250', name: 'Urtica', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B250', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0251', name: 'Carcinosin', potency: '1000', company: 'Schwabe', batchNumber: 'HHC-B251', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0252', name: 'Agaricus', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B252', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0253', name: 'Moschus', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B253', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0254', name: 'Asafoetida', potency: '30', company: 'Schwabe', batchNumber: 'HHC-B254', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0255', name: 'Nux Vomica', potency: 'CM', company: 'Schwabe', batchNumber: 'HHC-B255', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0256', name: 'Merc Sol', potency: '1000', company: 'Schwabe', batchNumber: 'HHC-B256', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0257', name: 'Rauwolfia', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B257', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0258', name: 'Hamamelis', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B258', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0259', name: 'Estrogen', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B259', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0260', name: 'Sabal Serrulata', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B260', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0261', name: 'Osteo', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B261', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0262', name: 'Hypericum', potency: '1000', company: 'Schwabe', batchNumber: 'HHC-B262', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0263', name: 'Aspidosperma', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B263', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0264', name: 'Bryta Mur', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B264', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0265', name: 'Syphilinum', potency: '1000', company: 'Schwabe', batchNumber: 'HHC-B265', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0266', name: 'Artemisia', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B266', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0267', name: 'Allium Cepa', potency: '200', company: 'Schwabe', batchNumber: 'HHC-B267', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 120, salePrice: 180, currentStock: 20, minimumStock: 5 },
  { id: 'MED-0268', name: 'Berberis Vulgaris (Berberis)', potency: 'Q', form: 'Mother Tincture', company: 'Schwabe', batchNumber: 'HHC-B268', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 150, salePrice: 220, currentStock: 25, minimumStock: 5 },
  { id: 'MED-0269', name: 'Chelidonium Majus (Cheilidonium)', potency: 'Q', form: 'Mother Tincture', company: 'Schwabe', batchNumber: 'HHC-B269', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 150, salePrice: 220, currentStock: 25, minimumStock: 5 },
  { id: 'MED-0270', name: 'Alfalfa', potency: 'Q', form: 'Mother Tincture', company: 'Schwabe', batchNumber: 'HHC-B270', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 150, salePrice: 220, currentStock: 25, minimumStock: 5 },
  { id: 'MED-0271', name: 'Crataegus Oxyacantha (Crateagus)', potency: 'Q', form: 'Mother Tincture', company: 'Schwabe', batchNumber: 'HHC-B271', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 150, salePrice: 220, currentStock: 25, minimumStock: 5 },
  { id: 'MED-0272', name: 'Urtica Urens (Artica)', potency: 'Q', form: 'Mother Tincture', company: 'Schwabe', batchNumber: 'HHC-B272', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 150, salePrice: 220, currentStock: 25, minimumStock: 5 },
  { id: 'MED-0273', name: 'Calendula Officinalis (Calendula)', potency: 'Q', form: 'Mother Tincture', company: 'Schwabe', batchNumber: 'HHC-B273', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 150, salePrice: 220, currentStock: 25, minimumStock: 5 },
  { id: 'MED-0274', name: 'Cantharis', potency: 'Q', form: 'Mother Tincture', company: 'Schwabe', batchNumber: 'HHC-B274', expiryDate: '2031-12-31', bottleSize: '30 ml', purchasePrice: 150, salePrice: 220, currentStock: 25, minimumStock: 5 }
];

// Map 50 Murakkabat medicines into stock inventory objects
const DEFAULT_MURAKKAB_INVENTORY: InventoryMedicine[] = MURAKKABAT_LIST.map(m => ({
  id: `MED-MUR-${String(m.number).padStart(4, '0')}`,
  name: m.remedyName,
  potency: 'N/A',
  form: 'Compound',
  company: 'HHC Pharmacy',
  batchNumber: `HHC-MUR-${String(m.number).padStart(2, '0')}`,
  expiryDate: '2035-12-31',
  bottleSize: '30 ml',
  purchasePrice: 100,
  salePrice: 180,
  currentStock: 50,
  minimumStock: 10,
  barcode: `HHC-MUR-${String(m.number).padStart(2, '0')}`,
  qrCode: `HHC-MUR-${String(m.number).padStart(2, '0')}`
}));

// Default 12 Biochemic / Tissue Salts
const BIOCHEMIC_SALTS_LIST = [
  { name: 'Calcarea Fluorica', potency: '6X' },
  { name: 'Calcarea Phosphorica', potency: '6X' },
  { name: 'Calcarea Sulphurica', potency: '6X' },
  { name: 'Ferrum Phosphoricum', potency: '6X' },
  { name: 'Kali Muriaticum', potency: '6X' },
  { name: 'Kali Phosphoricum', potency: '6X' },
  { name: 'Kali Sulphuricum', potency: '6X' },
  { name: 'Magnesia Phosphorica', potency: '6X' },
  { name: 'Natrum Muriaticum', potency: '6X' },
  { name: 'Natrum Phosphoricum', potency: '6X' },
  { name: 'Natrum Sulphuricum', potency: '6X' },
  { name: 'Silicea', potency: '6X' }
];

const DEFAULT_BIOCHEMIC_INVENTORY: InventoryMedicine[] = BIOCHEMIC_SALTS_LIST.map((salt, idx) => ({
  id: `MED-BIO-${String(idx + 1).padStart(4, '0')}`,
  name: salt.name,
  potency: salt.potency,
  form: 'Biochemic Salt',
  company: 'Schwabe',
  batchNumber: `HHC-BIO-${String(idx + 1).padStart(2, '0')}`,
  expiryDate: '2032-12-31',
  bottleSize: '20g Tablets',
  purchasePrice: 120,
  salePrice: 180,
  currentStock: 30,
  minimumStock: 5,
  barcode: `HHC-BIO-${String(idx + 1).padStart(2, '0')}`,
  qrCode: `HHC-BIO-${String(idx + 1).padStart(2, '0')}`
}));

const DEFAULT_TABLET_INVENTORY: InventoryMedicine[] = [
  { id: 'MED-TAB-0001', name: 'Doloex plus', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-01', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 90, minimumStock: 10 },
  { id: 'MED-TAB-0002', name: 'Arthofin', potency: 'N/A', form: 'Tablet', company: 'MS', batchNumber: 'HHC-TAB-02', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 100, minimumStock: 10 },
  { id: 'MED-TAB-0003', name: 'Doloex', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-03', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 160, minimumStock: 10 },
  { id: 'MED-TAB-0004', name: 'Golden Stroke', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-04', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 100, minimumStock: 10 },
  { id: 'MED-TAB-0005', name: 'Acomic', potency: 'N/A', form: 'Tablet', company: 'MS', batchNumber: 'HHC-TAB-05', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 210, minimumStock: 10 },
  { id: 'MED-TAB-0006', name: 'Hepato Live', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-06', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 100, minimumStock: 10 },
  { id: 'MED-TAB-0007', name: 'Rauwolfia', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-07', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 60, minimumStock: 10 },
  { id: 'MED-TAB-0008', name: 'Homoelax', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-08', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 180, minimumStock: 10 },
  { id: 'MED-TAB-0009', name: 'Arthribid', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-09', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 180, minimumStock: 10 },
  { id: 'MED-TAB-0010', name: 'Syz Jambol', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-10', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 60, minimumStock: 10 },
  { id: 'MED-TAB-0011', name: 'Cobaltum', potency: 'N/A', form: 'Tablet', company: 'Azeem Lab', batchNumber: 'HHC-TAB-11', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 127, minimumStock: 20 },
  { id: 'MED-TAB-0012', name: 'Dibesol', potency: 'N/A', form: 'Tablet', company: 'Al Sehat', batchNumber: 'HHC-TAB-12', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 100, minimumStock: 20 },
  { id: 'MED-TAB-0013', name: 'Sexovit Forte', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-13', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 40, minimumStock: 10 },
  { id: 'MED-TAB-0014', name: 'Nux Vomica', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-14', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 90, minimumStock: 10 },
  { id: 'MED-TAB-0015', name: 'Sepa', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-15', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 20, minimumStock: 10 },
  { id: 'MED-TAB-0016', name: 'Cholesterinum 3x', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-16', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 220, minimumStock: 20 },
  { id: 'MED-TAB-0017', name: 'Hair Support', potency: 'N/A', form: 'Tablet', company: 'BM', batchNumber: 'HHC-TAB-17', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 45, minimumStock: 10 },
  { id: 'MED-TAB-0018', name: 'Lexit', potency: 'N/A', form: 'Tablet', company: 'Paul Brooks', batchNumber: 'HHC-TAB-18', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 50, minimumStock: 10 },
  { id: 'MED-TAB-0019', name: 'Tonsicare', potency: 'N/A', form: 'Tablet', company: 'Paul Brooks', batchNumber: 'HHC-TAB-19', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 48, minimumStock: 10 },
  { id: 'MED-TAB-0020', name: 'Loozen', potency: 'N/A', form: 'Tablet', company: 'Faran', batchNumber: 'HHC-TAB-20', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 30, minimumStock: 10 },
  { id: 'MED-TAB-0021', name: 'Tonsigin', potency: 'N/A', form: 'Tablet', company: 'Faran', batchNumber: 'HHC-TAB-21', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 50, minimumStock: 10 },
  { id: 'MED-TAB-0022', name: 'Carbozyme', potency: 'N/A', form: 'Tablet', company: 'Faran', batchNumber: 'HHC-TAB-22', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 90, minimumStock: 10 },
  { id: 'MED-TAB-0023', name: 'Cuftux', potency: 'N/A', form: 'Tablet', company: 'Faran', batchNumber: 'HHC-TAB-23', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 200, minimumStock: 10 },
  { id: 'MED-TAB-0024', name: 'Mv Fit', potency: 'N/A', form: 'Tablet', company: 'Public Pharma', batchNumber: 'HHC-TAB-24', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 40, minimumStock: 10 },
  { id: 'MED-TAB-0025', name: 'Reutone', potency: 'N/A', form: 'Tablet', company: 'Faran', batchNumber: 'HHC-TAB-25', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 100, minimumStock: 10 },
  { id: 'MED-TAB-0026', name: 'Super Agnus', potency: 'N/A', form: 'Tablet', company: 'MS', batchNumber: 'HHC-TAB-26', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 30, minimumStock: 10 },
  { id: 'MED-TAB-0027', name: 'Korean Ginseng', potency: 'N/A', form: 'Tablet', company: 'MS', batchNumber: 'HHC-TAB-27', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 20, minimumStock: 10 },
  { id: 'MED-TAB-0028', name: 'Lipicol', potency: 'N/A', form: 'Tablet', company: 'Paul Brooks', batchNumber: 'HHC-TAB-28', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 36, minimumStock: 5 },
  { id: 'MED-TAB-0029', name: 'Fucus', potency: 'N/A', form: 'Tablet', company: 'Blossom', batchNumber: 'HHC-TAB-29', expiryDate: '2031-12-31', bottleSize: 'Tablets', purchasePrice: 100, salePrice: 150, currentStock: 20, minimumStock: 5 }
];

const DEFAULT_INVENTORY: InventoryMedicine[] = [
  ...DEFAULT_INVENTORY_BASE, 
  ...DEFAULT_MURAKKAB_INVENTORY,
  ...DEFAULT_BIOCHEMIC_INVENTORY,
  ...DEFAULT_TABLET_INVENTORY
];

// Default mock patients
const DEFAULT_PATIENTS: Patient[] = [
  {
    id: 'HHC-2026-0001',
    fullName: 'Haris Mehmood',
    fatherOrHusbandName: 'Tarik Mehmood',
    age: 32,
    dateOfBirth: '1993-09-29',
    gender: 'Male',
    mobileNumber: '+9233357752900',
    address: 'Satellite Town, Rawalpindi',
    weight: '125 kg',
    bloodPressure: '120/80',
    height: "5'11\"",
    bloodGroup: 'O+',
    registrationDate: '2026-07-08',
    chiefComplaint: 'Healthy checkup, seeking preventative constitutional remedy.',
    diagnosis: 'Constitutional general health',
    allergies: 'None',
    doctorNotes: 'General fitness advice. Advised hydration and balanced sleep.',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'HHC-2026-0002',
    fullName: 'Salman Haris',
    fatherOrHusbandName: 'Haris Mehmood',
    age: 11,
    dateOfBirth: '2015-08-26',
    gender: 'Male',
    mobileNumber: '+9233357752900',
    address: 'Satellite Town, Rawalpindi',
    weight: '34 kg',
    bloodPressure: '110/70',
    height: "4'8\"",
    bloodGroup: 'O+',
    registrationDate: '2026-07-08',
    chiefComplaint: 'General checkup.',
    diagnosis: 'Healthy',
    allergies: 'None',
    doctorNotes: 'Normal physical development. Active child.'
  },
  {
    id: 'HHC-2026-0003',
    fullName: 'Rahib Ahmed Wasif',
    fatherOrHusbandName: 'Haris Mehmood',
    age: 8,
    dateOfBirth: '2018-04-02',
    gender: 'Male',
    mobileNumber: '+9233357752900',
    address: 'Satellite Town, Rawalpindi',
    weight: '26 kg',
    bloodPressure: '105/65',
    height: "4'1\"",
    bloodGroup: 'O+',
    registrationDate: '2026-07-08',
    chiefComplaint: 'General development check.',
    diagnosis: 'Healthy',
    allergies: 'None',
    doctorNotes: 'Very active and healthy child.'
  },
  {
    id: 'HHC-2026-0004',
    fullName: 'Shahroz Haris',
    fatherOrHusbandName: 'Haris Mehmood',
    age: 2,
    dateOfBirth: '2023-08-28',
    gender: 'Male',
    mobileNumber: '+9233357752900',
    address: 'Satellite Town, Rawalpindi',
    weight: '13 kg',
    bloodPressure: '95/60',
    height: "2'11\"",
    bloodGroup: 'O+',
    registrationDate: '2026-07-08',
    chiefComplaint: 'Routine baby checkup.',
    diagnosis: 'Healthy development',
    allergies: 'None',
    doctorNotes: 'Growing normally, reflexes and motor skills are sound.'
  },
  {
    id: 'HHC-2026-0005',
    fullName: 'Saida Haris',
    fatherOrHusbandName: 'Haris Mehmood',
    age: 33,
    dateOfBirth: '1993-06-08',
    gender: 'Female',
    mobileNumber: '+9233357752900',
    address: 'Satellite Town, Rawalpindi',
    weight: '62 kg',
    bloodPressure: '115/75',
    height: "5'4\"",
    bloodGroup: 'B+',
    registrationDate: '2026-07-08',
    chiefComplaint: 'General physical checkup.',
    diagnosis: 'Healthy',
    allergies: 'None',
    doctorNotes: 'Maintain a nutritious diet and routine light exercise.'
  }
];

// Default mock visits
const DEFAULT_VISITS: Visit[] = [];

// Default mock bills
const DEFAULT_BILLS: Bill[] = [];


// Default Clinic Settings
const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'Haris Homeo Clinic',
  doctorName: 'Dr. Haris Mehmood (DHMS, MD Homoeo)',
  clinicAddress: 'Opposite Bilal Hospital, Satellite Town, Rawalpindi',
  phoneNumber: '+923037752900',
  theme: 'Light',
  language: 'English',
  printerType: 'System',
  autoLockMinutes: 15
};

// State key constants for localStorage
const KEYS = {
  PATIENTS: 'hhc_patients',
  VISITS: 'hhc_visits',
  INVENTORY: 'hhc_inventory',
  BILLS: 'hhc_bills',
  SETTINGS: 'hhc_settings',
  LOGGED_IN_USER: 'hhc_user'
};

// Initialize DB with defaults if empty
export function initDB(): void {
  const existingRaw = localStorage.getItem(KEYS.INVENTORY);
  if (!existingRaw) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
  } else {
    try {
      const existing: InventoryMedicine[] = JSON.parse(existingRaw);
      
      // Perform automated migration for existing items
      let migrated = false;
      const migratedList = existing.map(item => {
        if (item.id.startsWith('MED-MUR-')) {
          if (item.form !== 'Compound' || item.potency !== 'N/A') {
            migrated = true;
            return {
              ...item,
              form: 'Compound' as any,
              potency: 'N/A'
            };
          }
        }
        if (item.id.startsWith('MED-BIO-')) {
          if (item.form !== 'Biochemic Salt' || item.potency !== '6X') {
            migrated = true;
            return {
              ...item,
              form: 'Biochemic Salt' as any,
              potency: '6X'
            };
          }
        }
        return item;
      });

      const existingIds = new Set(migratedList.map(item => item.id));
      const toAppend: InventoryMedicine[] = [];
      
      DEFAULT_INVENTORY.forEach(item => {
        if (!existingIds.has(item.id)) {
          toAppend.push(item);
        }
      });
      
      if (toAppend.length > 0 || migrated) {
        localStorage.setItem(KEYS.INVENTORY, JSON.stringify([...migratedList, ...toAppend]));
      }
    } catch (e) {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
    }
  }
  // Perform forced migration/cleanup of patients in localStorage
  try {
    let patients = JSON.parse(localStorage.getItem(KEYS.PATIENTS) || '[]');
    if (!Array.isArray(patients) || patients.length === 0) {
      patients = [...DEFAULT_PATIENTS];
      localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
    } else {
      // 1. Delete Bilal, Kamran, Aisha
      const filtered = patients.filter((p: any) => {
        const name = (p.fullName || '').toLowerCase();
        return !name.includes('bilal') && !name.includes('kamran') && !name.includes('ayesha');
      });

      // 2. Remap IDs of the family of Haris Mehmood
      const familyOrder = [
        'Haris Mehmood',
        'Salman Haris',
        'Rahib Ahmed Wasif',
        'Shahroz Haris',
        'Saida Haris'
      ];

      filtered.forEach((p: any) => {
        const idx = familyOrder.findIndex(name => p.fullName === name);
        if (idx !== -1) {
          p.id = `HHC-2026-000${idx + 1}`;
          if (p.fullName === 'Haris Mehmood') {
            p.weight = '125 kg';
          }
          if (p.fullName !== 'Haris Mehmood' && p.fatherOrHusbandName) {
            p.fatherOrHusbandName = 'Haris Mehmood';
          }
        }
      });

      // 3. Make sure any missing ones from DEFAULT_PATIENTS are appended
      DEFAULT_PATIENTS.forEach(dp => {
        if (!filtered.some((p: any) => p.fullName === dp.fullName)) {
          filtered.push(dp);
        }
      });

      // Write updated patients back
      localStorage.setItem(KEYS.PATIENTS, JSON.stringify(filtered));
    }
  } catch (e) {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(DEFAULT_PATIENTS));
  }

  // Prune visits whose patient record no longer exists
  try {
    let visits = JSON.parse(localStorage.getItem(KEYS.VISITS) || '[]');
    if (Array.isArray(visits)) {
      const patientsList = JSON.parse(localStorage.getItem(KEYS.PATIENTS) || '[]');
      const patientIds = new Set(patientsList.map((p: any) => p.id));
      
      visits = visits.filter((v: any) => patientIds.has(v.patientId));
      localStorage.setItem(KEYS.VISITS, JSON.stringify(visits));
    } else {
      localStorage.setItem(KEYS.VISITS, JSON.stringify(DEFAULT_VISITS));
    }
  } catch (e) {
    localStorage.setItem(KEYS.VISITS, JSON.stringify(DEFAULT_VISITS));
  }

  try {
    const bills = JSON.parse(localStorage.getItem(KEYS.BILLS) || '[]');
    if (!Array.isArray(bills)) {
      localStorage.setItem(KEYS.BILLS, JSON.stringify(DEFAULT_BILLS));
    }
  } catch (e) {
    localStorage.setItem(KEYS.BILLS, JSON.stringify(DEFAULT_BILLS));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } else {
    try {
      const settingsRaw = localStorage.getItem(KEYS.SETTINGS);
      if (settingsRaw) {
        const settings = JSON.parse(settingsRaw);
        let updated = false;
        if (settings.doctorName === 'Dr. Haris Jameel (BHMS, MD Homoeo)' || 
            settings.doctorName === 'Dr. Haris Mehmood (BHMS, MD Homoeo)' || 
            (settings.doctorName && settings.doctorName.includes('BHMS'))) {
          settings.doctorName = 'Dr. Haris Mehmood (DHMS, MD Homoeo)';
          updated = true;
        }
        if (settings.phoneNumber === '+92 51 4422334') {
          settings.phoneNumber = '+923037752900';
          updated = true;
        }
        if (updated) {
          localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Also upgrade the active logged in user name if it's the old one
  const loggedInRaw = localStorage.getItem(KEYS.LOGGED_IN_USER);
  if (loggedInRaw === 'Dr. Haris Jameel') {
    localStorage.setItem(KEYS.LOGGED_IN_USER, 'Dr. Haris Mehmood');
  }
}

// Low level generic storage helper functions
function getItems<T>(key: string): T[] {
  initDB();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ---------------- PATIENTS ----------------
export function getPatients(): Patient[] {
  return getItems<Patient>(KEYS.PATIENTS);
}

export function savePatient(patient: Patient): void {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === patient.id);
  if (index >= 0) {
    patients[index] = patient;
  } else {
    patients.push(patient);
  }
  setItems(KEYS.PATIENTS, patients);
}

export function deletePatient(id: string): void {
  const patients = getPatients();
  setItems(KEYS.PATIENTS, patients.filter(p => p.id !== id));
  // cascade delete visits
  const visits = getVisits();
  setItems(KEYS.VISITS, visits.filter(v => v.patientId !== id));
}

export function generatePatientId(): string {
  const patients = getPatients();
  const year = new Date().getFullYear();
  const currentYearPatients = patients.filter(p => p.id.startsWith(`HHC-${year}-`));
  let maxNum = 0;
  currentYearPatients.forEach(p => {
    const parts = p.id.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  return `HHC-${year}-${String(nextNum).padStart(4, '0')}`;
}

// ---------------- VISITS ----------------
export function getVisits(): Visit[] {
  return getItems<Visit>(KEYS.VISITS);
}

export function getPatientVisits(patientId: string): Visit[] {
  return getVisits().filter(v => v.patientId === patientId).sort((a, b) => b.visitDate.localeCompare(a.visitDate));
}

export function saveVisit(visit: Visit): void {
  const visits = getVisits();
  const index = visits.findIndex(v => v.id === visit.id);
  if (index >= 0) {
    visits[index] = visit;
  } else {
    visits.push(visit);
  }
  setItems(KEYS.VISITS, visits);

  // Automatically decrease inventory for prescribed medicines
  decreaseInventoryForPrescription(visit.medicines);
}

export function deleteVisit(id: string): void {
  const visits = getVisits();
  setItems(KEYS.VISITS, visits.filter(v => v.id !== id));
}

export function generateVisitId(): string {
  const visits = getVisits();
  let maxNum = 1000;
  visits.forEach(v => {
    const num = parseInt(v.id.replace('VIS-', ''), 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });
  return `VIS-${maxNum + 1}`;
}

// ---------------- INVENTORY ----------------
export function getInventory(): InventoryMedicine[] {
  const items = getItems<InventoryMedicine>(KEYS.INVENTORY);
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function saveInventoryItem(item: InventoryMedicine): void {
  const inventory = getInventory();
  const index = inventory.findIndex(i => i.id === item.id);
  if (index >= 0) {
    inventory[index] = item;
  } else {
    inventory.push(item);
  }
  setItems(KEYS.INVENTORY, inventory);
}

export function deleteInventoryItem(id: string): void {
  const inventory = getInventory();
  setItems(KEYS.INVENTORY, inventory.filter(i => i.id !== id));
}

export function generateInventoryId(): string {
  const inventory = getInventory();
  let maxNum = 0;
  inventory.forEach(i => {
    const num = parseInt(i.id.replace('MED-', ''), 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });
  return `MED-${String(maxNum + 1).padStart(4, '0')}`;
}

export function decreaseInventoryForPrescription(medicines: PrescribedMedicine[]): void {
  const inventory = getInventory();
  let changed = false;
  medicines.forEach(prescribed => {
    const invItem = inventory.find(i => i.name.toLowerCase() === prescribed.name.toLowerCase() && i.potency === prescribed.potency);
    if (invItem) {
      // Deduct stock. Since dose forms vary, we'll deduct 1 unit per prescription by default
      if (invItem.currentStock > 0) {
        invItem.currentStock -= 1;
        changed = true;
      }
    }
  });
  if (changed) {
    setItems(KEYS.INVENTORY, inventory);
  }
}

// ---------------- BILLS ----------------
export function getBills(): Bill[] {
  return getItems<Bill>(KEYS.BILLS);
}

export function saveBill(bill: Bill): void {
  const bills = getBills();
  const index = bills.findIndex(b => b.id === bill.id);
  if (index >= 0) {
    bills[index] = bill;
  } else {
    bills.push(bill);
  }
  setItems(KEYS.BILLS, bills);
}

export function generateBillNumber(): string {
  const bills = getBills();
  const year = new Date().getFullYear();
  const currentYearBills = bills.filter(b => b.billNumber.startsWith(`INV-${year}-`));
  let maxNum = 0;
  currentYearBills.forEach(b => {
    const parts = b.billNumber.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  return `INV-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export function generateBillId(): string {
  const bills = getBills();
  let maxNum = 1000;
  bills.forEach(b => {
    const num = parseInt(b.id.replace('BILL-', ''), 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });
  return `BILL-${maxNum + 1}`;
}

// ---------------- CLINIC SETTINGS ----------------
export function getSettings(): ClinicSettings {
  initDB();
  const raw = localStorage.getItem(KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
}

export function saveSettings(settings: ClinicSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ---------------- AUTH / LOGIN ----------------
export function getLoggedInUser(): string | null {
  return localStorage.getItem(KEYS.LOGGED_IN_USER);
}

export function setLoggedInUser(username: string | null): void {
  if (username) {
    localStorage.setItem(KEYS.LOGGED_IN_USER, username);
  } else {
    localStorage.removeItem(KEYS.LOGGED_IN_USER);
  }
}

// ---------------- BACKUP & RESTORE ----------------
export function exportDatabaseBackup(): string {
  const data = {
    patients: getPatients(),
    visits: getVisits(),
    inventory: getInventory(),
    bills: getBills(),
    settings: getSettings(),
    backupDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
}

export function restoreDatabaseBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.patients && data.visits && data.inventory && data.bills && data.settings) {
      setItems(KEYS.PATIENTS, data.patients);
      setItems(KEYS.VISITS, data.visits);
      setItems(KEYS.INVENTORY, data.inventory);
      setItems(KEYS.BILLS, data.bills);
      saveSettings(data.settings);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to restore backup', e);
    return false;
  }
}
