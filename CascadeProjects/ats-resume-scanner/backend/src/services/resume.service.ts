import { storage } from '../config';
import { resumeRepository } from '../repositories';
import { parseResume } from '../utils';
import { logger } from '../config';
import { AppError } from '../middleware';
import { atsService } from './ats.service';

export class ResumeService {
  async uploadResume(
    userId: string,
    file: any,
    fileType: string
  ): Promise<any> {
    try {
      // Upload to Firebase Storage
      const bucket = storage.bucket();
      const fileName = `resumes/${userId}/${Date.now()}-${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(file.buffer, {
        contentType: file.mimetype,
      });

      // Get public URL
      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      });

      // Parse resume
      const parsedData = await parseResume(file.buffer, file.mimetype);

      // Save to database
      const resume = await resumeRepository.create({
        userId,
        fileName: file.originalname,
        fileType: fileType === 'application/pdf' ? 'PDF' : 'DOCX',
        fileUrl: url,
        fileSize: file.size,
        parsedName: parsedData.name,
        parsedEmail: parsedData.email,
        parsedPhone: parsedData.phone,
        parsedSkills: parsedData.skills,
        parsedExperience: parsedData.experience,
        parsedEducation: parsedData.education,
        parsedProjects: parsedData.projects,
        parsedCertifications: parsedData.certifications,
        parsedLanguages: parsedData.languages,
      });

      return resume;
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
    jobDescriptionId?: string
  ) {
    const resume = await resumeRepository.findById(resumeId);

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (resume.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // Get job description if provided
    let jobDescriptionText = '';
    if (jobDescriptionId) {
      // TODO: Fetch job description from repository
    }

    // Reconstruct resume text from parsed data
    const resumeText = this.reconstructResumeText(resume);

    // Calculate ATS scores
    const scores = await atsService.calculateATSScore(resumeText, jobDescriptionText);

    // Analyze resume
    const analysis = await atsService.analyzeResume(resumeText, jobDescriptionText);

    // Calculate semantic match if job description provided
    let matchData = {
      matchPercentage: null,
      matchReasons: [],
      missingSkills: [],
      matchingSkills: [],
    };

    if (jobDescriptionText) {
      matchData = await atsService.calculateSemanticMatch(resumeText, jobDescriptionText);
    }

    // Save scan results
    const scan = await resumeRepository.create({
      resumeId,
      jobDescriptionId,
      status: 'COMPLETED',
      ...scores,
      ...analysis,
      ...matchData,
    });

    return scan;
  }

  private reconstructResumeText(resume: any): string {
    let text = '';

    if (resume.parsedName) text += `Name: ${resume.parsedName}\n`;
    if (resume.parsedEmail) text += `Email: ${resume.parsedEmail}\n`;
    if (resume.parsedPhone) text += `Phone: ${resume.parsedPhone}\n`;

    if (resume.parsedSkills && resume.parsedSkills.length > 0) {
      text += `\nSkills:\n${resume.parsedSkills.join(', ')}\n`;
    }

    if (resume.parsedExperience && resume.parsedExperience.length > 0) {
      text += `\nExperience:\n`;
      resume.parsedExperience.forEach((exp: any) => {
        text += `${exp.title} at ${exp.company}\n${exp.description}\n`;
      });
    }

    if (resume.parsedEducation && resume.parsedEducation.length > 0) {
      text += `\nEducation:\n`;
      resume.parsedEducation.forEach((edu: any) => {
        text += `${edu.institution} - ${edu.degree}\n`;
      });
    }

    if (resume.parsedProjects && resume.parsedProjects.length > 0) {
      text += `\nProjects:\n`;
      resume.parsedProjects.forEach((proj: any) => {
        text += `${proj.name}\n${proj.description}\n`;
      });
    }

    if (resume.parsedCertifications && resume.parsedCertifications.length > 0) {
      text += `\nCertifications:\n${resume.parsedCertifications.join('\n')}\n`;
    }

    return text;
  }
}

export default new ResumeService();
