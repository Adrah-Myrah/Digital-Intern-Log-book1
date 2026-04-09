export class LoginDto {
  identifier: string; // reg number or staff ID
  password: string;
  role?: string; // optional for backward compatibility
}