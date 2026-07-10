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

export function isWebSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator && !!navigator.serial;
}

function parseBaudRate(printerAddress?: string): number {
  const match = printerAddress?.match(/(\d{3,7})\s*baud/i);
  return match ? parseInt(match[1], 10) : 9600;
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

export async function printReceiptDirect(patient: Patient, visit: Visit, settings: ClinicSettings): Promise<void> {
  if (!isWebSerialSupported()) {
    throw new Error('Direct printing needs Chrome or Edge on desktop (Web Serial API not available).');
  }

  const serial = navigator.serial!;
  const grantedPorts = await serial.getPorts();
  const port = grantedPorts[0] || (await serial.requestPort());

  const data = buildReceiptEscPos(patient, visit, settings);

  await port.open({ baudRate: parseBaudRate(settings.printerAddress) });
  const writer = port.writable!.getWriter();
  try {
    await writer.write(data);
  } finally {
    writer.releaseLock();
    await port.close();
  }
}
