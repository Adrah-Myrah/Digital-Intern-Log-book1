export class CreateSupervisionDto {
  supervisorId: number;
  studentId: number;
  mode: string;
  supervisionDate: string;
  supervisionTime: string;
  durationMinutes: number;
  location?: string;
  zoomLink?: string;
  notesBefore?: string;
}
