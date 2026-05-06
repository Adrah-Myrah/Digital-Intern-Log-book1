export class CreateLogDto {
    studentId: number;
    taskName: string;
    workType: string;
    description: string;
    skillsApplied?: string;
    estimatedHours: number;
    proofFileUrl?: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
  }