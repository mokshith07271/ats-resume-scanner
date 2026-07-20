import prisma from '../config/database';

export class ScanRepository {
  async findById(id: string) {
    return prisma.scan.findUnique({
      where: { id },
      include: {
        resume: true,
        jobDescription: true,
        scanHistory: true,
      },
    });
  }

  async findByResumeId(resumeId: string, limit: number = 10, offset: number = 0) {
    return prisma.scan.findMany({
      where: { resumeId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        jobDescription: true,
      },
    });
  }

  async findByUserId(userId: string, limit: number = 10, offset: number = 0) {
    return prisma.scan.findMany({
      where: {
        resume: { userId },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        resume: true,
        jobDescription: true,
      },
    });
  }

  async create(data: {
    resumeId: string;
    jobDescriptionId?: string;
    status?: string;
    overallScore?: number;
    formattingScore?: number;
    keywordScore?: number;
    skillScore?: number;
    experienceScore?: number;
    educationScore?: number;
    achievementsScore?: number;
    missingKeywords?: any;
    weakBulletPoints?: any;
    grammarSuggestions?: any;
    resumeSummary?: string;
    improvedBulletPoints?: any;
    atsRecommendations?: any;
    matchPercentage?: number;
    matchReasons?: any;
    missingSkills?: any;
    matchingSkills?: any;
  }) {
    const stringifyIfNeeded = (val: any) =>
      val !== undefined && val !== null ? (typeof val === 'string' ? val : JSON.stringify(val)) : null;

    const formattedData = {
      ...data,
      missingKeywords: stringifyIfNeeded(data.missingKeywords),
      weakBulletPoints: stringifyIfNeeded(data.weakBulletPoints),
      grammarSuggestions: stringifyIfNeeded(data.grammarSuggestions),
      improvedBulletPoints: stringifyIfNeeded(data.improvedBulletPoints),
      atsRecommendations: stringifyIfNeeded(data.atsRecommendations),
      matchReasons: stringifyIfNeeded(data.matchReasons),
      missingSkills: stringifyIfNeeded(data.missingSkills),
      matchingSkills: stringifyIfNeeded(data.matchingSkills),
    };

    return prisma.scan.create({
      data: formattedData as any,
      include: {
        resume: true,
        jobDescription: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.scan.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.scan.delete({
      where: { id },
    });
  }

  async getAverageScore(userId?: string) {
    const where = userId ? { resume: { userId } } : {};
    const scans = await prisma.scan.findMany({
      where,
      select: { overallScore: true },
    });

    if (scans.length === 0) return 0;

    const total = scans.reduce((sum, scan) => sum + (scan.overallScore || 0), 0);
    return total / scans.length;
  }

  async count() {
    return prisma.scan.count();
  }
}

export default new ScanRepository();
