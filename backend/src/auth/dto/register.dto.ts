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
    country?: string;
  
    // Supervisor / Admin only
    staffId?: string;
    department?: string;
  }