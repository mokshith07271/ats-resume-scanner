import { jobDescriptionRepository } from '../repositories';
import { AppError } from '../middleware';
import { logger } from '../config';

export class JobDescriptionService {
  async createJobDescription(
    userId: string,
    data: {
      title: string;
      company?: string;
      description: string;
      requirements?: string[];
      skills?: string[];
    }
  ) {
    try {
      const jobDescription = await jobDescriptionRepository.create({
        userId,
        ...data,
      });

      return jobDescription;
    } catch (error) {
      logger.error('Job description creation error:', error);
      throw new AppError('Failed to create job description', 500);
    }
  }

  async getUserJobDescriptions(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const jobDescriptions = await jobDescriptionRepository.findByUserId(
      userId,
      limit,
      offset
    );

    return {
      jobDescriptions,
      pagination: {
        page,
        limit,
        total: jobDescriptions.length,
        totalPages: Math.ceil(jobDescriptions.length / limit),
      },
    };
  }

  async getJobDescriptionById(id: string, userId: string) {
    const jobDescription = await jobDescriptionRepository.findById(id);

    if (!jobDescription) {
      throw new AppError('Job description not found', 404);
    }

    if (jobDescription.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return jobDescription;
  }

  async updateJobDescription(
    id: string,
    userId: string,
    data: {
      title?: string;
      company?: string;
      description?: string;
      requirements?: string[];
      skills?: string[];
    }
  ) {
    const jobDescription = await jobDescriptionRepository.findById(id);

    if (!jobDescription) {
      throw new AppError('Job description not found', 404);
    }

    if (jobDescription.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const updated = await jobDescriptionRepository.update(id, data);

    return updated;
  }

  async deleteJobDescription(id: string, userId: string) {
    const jobDescription = await jobDescriptionRepository.findById(id);

    if (!jobDescription) {
      throw new AppError('Job description not found', 404);
    }

    if (jobDescription.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    await jobDescriptionRepository.delete(id);

    return { message: 'Job description deleted successfully' };
  }
}

export default new JobDescriptionService();
