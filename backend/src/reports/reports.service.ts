import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { ReviewReportDto } from './dto/review-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  // Student uploads report
  async uploadReport(
    studentId: number,
    file: Express.Multer.File,
  ): Promise<Report> {
    // Check if student already submitted
    const existing = await this.reportsRepository.findOne({
      where: { studentId },
    });
    if (existing)
      throw new ConflictException('You have already submitted a report');

    const report = this.reportsRepository.create({
      studentId,
      fileName: file.originalname,
      fileUrl: file.path,
      status: 'submitted',
    });

    return this.reportsRepository.save(report);
  }

  // Get report for a specific student
  async getStudentReport(studentId: number): Promise<Report | null> {
    return this.reportsRepository.findOne({ where: { studentId } });
  }

  // Get all reports (admin/supervisor)
  async getAllReports(): Promise<Report[]> {
    return this.reportsRepository.find({
      order: { submittedAt: 'DESC' },
    });
  }

  // Get single report
  async getReportById(id: number): Promise<Report> {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  // Supervisor reviews and grades report
  async reviewReport(id: number, dto: ReviewReportDto): Promise<Report> {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    Object.assign(report, dto);
    return this.reportsRepository.save(report);
  }
}
