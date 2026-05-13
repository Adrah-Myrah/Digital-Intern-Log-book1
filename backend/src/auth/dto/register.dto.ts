export class RegisterDto {
  role: string;
  fullName: string;
  email: string;
  password: string;

  // Student only
  registrationNumber?: string;
  yearOfStudy?: string;
  internshipAttempt?: string;
  course?: string;
  placementCompany?: string;
  placementLatitude?: number;
  placementLongitude?: number;
  geofenceRadiusMeters?: number;
  country?: string;

  // Supervisor / Admin only
  staffId?: string;
  department?: string;
  maxCapacity?: number;
}
