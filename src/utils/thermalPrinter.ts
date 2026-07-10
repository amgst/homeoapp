import { Visit, Patient, ClinicSettings } from '../types';

// ESC/POS control bytes
const ESC = 0x1b;
const GS = 0x1d;
const INIT = [ESC, 0x40];
const ALIGN_LEFT = [ESC, 0x61, 0x00];
const ALIGN_CENTER = [ESC, 0x61, 0x01];
const BOLD_ON = [ESC, 0x45, 0x01];
const BOLD_OFF = [ESC, 0x45, 0x00];
const DOUBLE_SIZE_ON = [GS, 0x21, 0x11];
const DOUBLE_SIZE_OFF = [GS, 0x21, 0x00];
const LINE_FEED = [0x0a];

const WRITE_CHUNK_SIZE = 20;

const OPTIONAL_SERVICE_UUIDS: BluetoothServiceUUID[] = [
  0xFFE0,
  0xFF00,
  0x18F0,
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '000018f0-0000-1000-8000-00805f9b34fb'
];

type PrinterConnection = {
  device: BluetoothDevice;
  characteristic: BluetoothRemoteGATTCharacteristic;
};

let cachedConnection: PrinterConnection | null = null;

export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator && !!navigator.bluetooth;
}

class ReceiptBuilder {
  private bytes: number[] = [];

  push(...codes: number[]) {
    this.bytes.push(...codes);
    return this;
  }

  text(line: string) {
    const encoded = new TextEncoder().encode(line);
    this.bytes.push(...encoded);
    return this;
  }

  line(line = '') {
    this.text(line);
    this.push(...LINE_FEED);
    return this;
  }

  separator(char = '-', width = 32) {
    return this.line(char.repeat(width));
  }

  build(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}

export function buildReceiptEscPos(patient: Patient, visit: Visit, settings: ClinicSettings): Uint8Array {
  const b = new ReceiptBuilder();

  b.push(...INIT);
  b.push(...ALIGN_CENTER);
  b.push(...BOLD_ON).push(...DOUBLE_SIZE_ON);
  b.line(settings.clinicName.toUpperCase());
  b.push(...DOUBLE_SIZE_OFF).push(...BOLD_OFF);
  b.line(settings.doctorName);
  b.line(settings.clinicAddress);
  b.line(`Phone: ${settings.phoneNumber}`);
  b.separator('=');

  b.push(...ALIGN_LEFT);
  b.line(`PATIENT: ${patient.fullName.toUpperCase()}`);
  b.line(`ID: ${patient.id}   AGE/GENDER: ${patient.age}Y/${patient.gender.toUpperCase()}`);
  b.line(`VISIT: ${visit.id}   DATE: ${visit.visitDate}`);
  b.separator();

  b.push(...ALIGN_CENTER).push(...BOLD_ON);
  b.line('Rx - Homeopathic Prescription');
  b.push(...BOLD_OFF).push(...ALIGN_LEFT);
  b.separator();

  if (visit.medicines.length === 0) {
    b.line('No remedy prescribed.');
  } else {
    visit.medicines.forEach((m, idx) => {
      b.push(...BOLD_ON).line(`${idx + 1}. ${m.name} ${m.potency}`).push(...BOLD_OFF);
      b.line(`   Form: ${m.form} (${m.quantity})`);
      b.line(`   Duration: ${m.duration}`);

      const timings = [];
      if (m.timing.morning) timings.push('Morning');
      if (m.timing.afternoon) timings.push('Afternoon');
      if (m.timing.evening) timings.push('Evening');
      if (m.timing.night) timings.push('Night');
      b.line(`   Schedule: ${timings.join(' - ')}`);
      b.line(`   Timing: ${m.foodInstructions}`);
      if (m.specialInstructions) {
        b.line(`   Note: ${m.specialInstructions}`);
      }
      b.line();
    });
  }

  if (visit.doctorNotes) {
    b.separator();
    b.push(...BOLD_ON).line('DOCTOR NOTES:').push(...BOLD_OFF);
    b.line(visit.doctorNotes);
  }

  if (visit.followUpDate) {
    b.separator();
    b.push(...ALIGN_CENTER).push(...BOLD_ON);
    b.line(`NEXT VISIT: ${visit.followUpDate}`);
    b.push(...BOLD_OFF).push(...ALIGN_LEFT);
  }

  b.separator();
  b.push(...ALIGN_CENTER);
  b.line('Thank You for Choosing Us');
  b.line('Restoring health naturally');
  b.line();
  b.line();
  b.line();

  return b.build();
}

async function pickWritableCharacteristic(device: BluetoothDevice): Promise<BluetoothRemoteGATTCharacteristic> {
  const server = await device.gatt?.connect();
  if (!server) {
    throw new Error('Bluetooth connection failed.');
  }
  const services = await server.getPrimaryServices();
  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    for (const characteristic of characteristics) {
      if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
        return characteristic;
      }
    }
  }
  throw new Error('No writable characteristic found on this printer.');
}

async function getConnection(): Promise<PrinterConnection> {
  if (cachedConnection?.device?.gatt?.connected) return cachedConnection;

  if (navigator.bluetooth.getDevices) {
    const devices = await navigator.bluetooth.getDevices();
    if (devices.length > 0) {
      const device = devices[0];
      const characteristic = await pickWritableCharacteristic(device);
      cachedConnection = { device, characteristic };
      return cachedConnection;
    }
  }

  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: OPTIONAL_SERVICE_UUIDS
  });

  const characteristic = await pickWritableCharacteristic(device);
  cachedConnection = { device, characteristic };
  return cachedConnection;
}

async function writeInChunks(characteristic: BluetoothRemoteGATTCharacteristic, data: Uint8Array): Promise<void> {
  let offset = 0;
  while (offset < data.length) {
    const chunk = data.slice(offset, offset + WRITE_CHUNK_SIZE);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
    offset += WRITE_CHUNK_SIZE;
  }
}

export async function printReceiptDirect(patient: Patient, visit: Visit, settings: ClinicSettings): Promise<void> {
  if (!isWebBluetoothSupported()) {
    throw new Error('Direct printing needs a browser with Web Bluetooth support (Chrome on Android or desktop).');
  }

  const { characteristic } = await getConnection();
  const data = buildReceiptEscPos(patient, visit, settings);
  await writeInChunks(characteristic, data);
}
