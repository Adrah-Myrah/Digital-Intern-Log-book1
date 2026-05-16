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
  // Industry Supervisor Detailed Grading
  enthusiasm?: number;
  technicalCompetence?: number;
  punctuality?: number;
  presentationSmartness?: number;
  superiorSubordinateRelationship?: number;
  adherenceToPolicies?: number;
  industrySupervisorTotal?: number;
  overallGrade?: string;
  finalComments?: string;
}
