import { ISalonAppointmentItem } from "../types/appointments.type";

/**
 * Returns the first appointment (already scoped to one staff member and one day) whose
 * time range overlaps the candidate slot, or null if the slot is free. Half-open interval
 * overlap: [start, end) vs [candidateStart, candidateEnd).
 */
export function findConflictingAppointment(
  staffAppointments: ISalonAppointmentItem[],
  candidateStartTime: string,
  durationMinutes: number
): ISalonAppointmentItem | null {
  const candidateStart = new Date(candidateStartTime).getTime();
  if (Number.isNaN(candidateStart) || durationMinutes <= 0) return null;
  const candidateEnd = candidateStart + durationMinutes * 60_000;

  for (const appointment of staffAppointments) {
    const start = new Date(appointment.startTime).getTime();
    const end = new Date(appointment.endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    if (candidateStart < end && start < candidateEnd) {
      return appointment;
    }
  }
  return null;
}
