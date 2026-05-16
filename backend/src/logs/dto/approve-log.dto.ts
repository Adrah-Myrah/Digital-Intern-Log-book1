export class ApproveLogDto {
  status: 'approved' | 'rejected';
  supervisorComment?: string;
  approvedBy: number;
}
