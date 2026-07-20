import { storage } from '../config';
import { resumeRepository, scanRepository } from '../repositories';
import { parseResume } from '../utils';
import { logger } from '../config';
import { AppError } from '../middleware';
import { atsService } from './ats.service';

export class ResumeService {
  async uploadResume(
    userId: string,
    file: any,
    fileType: string,
    jobDescriptionText?: string
  ): Promise<any> {
    try {
      let url = '';
      try {
        // Upload to Firebase Storage
        const bucket = storage.bucket();
        const fileName = `resumes/${userId}/${Date.now()}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(file.buffer, {
          contentType: file.mimetype,
        });

        const [signedUrl] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        url = signedUrl;
      } catch (storageError) {
        logger.warn('Firebase storage upload failed, falling back to local storage:', storageError);
        const path = require('path');
        const fs = require('fs');
        const uploadsDir = path.join(__dirname, '../../../../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const localFileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadsDir, localFileName);
        fs.writeFileSync(filePath, file.buffer);
        url = `/uploads/${localFileName}`;
      }

      // Parse resume
      const parsedData = await parseResume(file.buffer, file.mimetype);

      // Save to database with stringified JSON fields for SQLite compatibility
      const resume = await resumeRepository.create({
        userId,
        fileName: file.originalname,
        fileType: fileType === 'application/pdf' ? 'PDF' : 'DOCX',
        fileUrl: url,
        fileSize: file.size,
        parsedName: parsedData.name || null,
        parsedEmail: parsedData.email || null,
        parsedPhone: parsedData.phone || null,
        parsedSkills: JSON.stringify(parsedData.skills || []),
        parsedExperience: JSON.stringify(parsedData.experience || []),
        parsedEducation: JSON.stringify(parsedData.education || []),
        parsedProjects: JSON.stringify(parsedData.projects || []),
        parsedCertifications: JSON.stringify(parsedData.certifications || []),
        parsedLanguages: JSON.stringify(parsedData.languages || []),
      });

      // Auto-trigger strict ATS Scan with optional Job Description
      try {
        const scan = await this.scanResume(resume.id, userId, jobDescriptionText);
        return { ...resume, scans: [scan] };
      } catch (scanError) {
        logger.warn('Auto ATS scan error:', scanError);
        return resume;
      }
    } catch (error) {
      logger.error('Resume upload error:', error);
      throw new AppError('Failed to upload resume', 500);
    }
  }

  async getUserResumes(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const resumes = await resumeRepository.findByUserId(userId, limit, offset);
    const total = await resumeRepository.countByUserId(userId);

    return {
      resumes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getResumeById(resumeId: string, userId: string) {
    const resume = await resumeRepository.findById(resumeId);

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (resume.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return resume;
  }

  async deleteResume(resumeId: string, userId: string) {
    const resume = await resumeRepository.findById(resumeId);

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (resume.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Delete from Firebase Storage
    try {
      const bucket = storage.bucket();
      const fileName = resume.fileUrl.split('/').pop();
      if (fileName) {
        await bucket.file(`resumes/${userId}/${fileName}`).delete();
      }
    } catch (error) {
      logger.warn('Failed to delete file from storage:', error);
    }

    await resumeRepository.delete(resumeId);

    return { message: 'Resume deleted successfully' };
  }

  async scanResume(
    resumeId: string,
    userId: string,
    jobDescriptionInput?: string
  ) {
    const resume = await resumeRepository.findById(resumeId);

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (resume.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const resumeText = this.reconstructResumeText(resume);
    const jobDescriptionText = jobDescriptionInput || '';

    // Calculate ATS scores against job description if provided
    const scores = await atsService.calculateATSScore(resumeText, jobDescriptionText);

    // Analyze resume
    const analysis = await atsService.analyzeResume(resumeText, jobDescriptionText);

    // Save scan results
    const scan = await scanRepository.create({
      resumeId,
      status: 'COMPLETED',
      ...scores,
      ...analysis,
    });

    return scan;
  }

  private reconstructResumeText(resume: any): string {
    let text = '';

    if (resume.parsedName) text += `Name: ${resume.parsedName}\n`;
    if (resume.parsedEmail) text += `Email: ${resume.parsedEmail}\n`;
    if (resume.parsedPhone) text += `Phone: ${resume.parsedPhone}\n`;

    const parseField = (val: any) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return val || [];
    };

    const skills = parseField(resume.parsedSkills);
    const experience = parseField(resume.parsedExperience);
    const education = parseField(resume.parsedEducation);
    const projects = parseField(resume.parsedProjects);
    const certifications = parseField(resume.parsedCertifications);

    if (Array.isArray(skills) && skills.length > 0) {
      text += `\nSkills:\n${skills.join(', ')}\n`;
    }

    if (Array.isArray(experience) && experience.length > 0) {
      text += `\nExperience:\n`;
      experience.forEach((exp: any) => {
        text += `${exp.title || ''} at ${exp.company || ''}\n${exp.description || ''}\n`;
      });
    }

    if (Array.isArray(education) && education.length > 0) {
      text += `\nEducation:\n`;
      education.forEach((edu: any) => {
        text += `${edu.institution || ''} - ${edu.degree || ''}\n`;
      });
    }

    if (Array.isArray(projects) && projects.length > 0) {
      text += `\nProjects:\n`;
      projects.forEach((proj: any) => {
        text += `${proj.name || ''}\n${proj.description || ''}\n`;
      });
    }

    if (Array.isArray(certifications) && certifications.length > 0) {
      text += `\nCertifications:\n${certifications.join('\n')}\n`;
    }

    return text;
  }
}

export default new ResumeService();
