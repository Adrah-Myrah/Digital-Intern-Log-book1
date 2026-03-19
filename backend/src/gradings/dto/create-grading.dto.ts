export class CreateGradingDto {
    supervisorId: number;
    studentId: number;
    attendanceRate?: number;
    attendanceComments?: string;
    logQuality?: string;
    logConsistency?: number;
    reportGrade?: string;
    reportFeedback?: string;
    communicationRating?: number;
    communicationObservations?: string;
    industryPerformance?: string;
    industryComments?: string;
    overallGrade?: string;
    finalComments?: string;
  }