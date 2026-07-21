import prisma from '../config/database';

export class ResumeRepository {
  async findById(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: {
        user: true,
        scans: true,
      },
    });
  }

  async findByUserId(userId: string, limit: number = 10, offset: number = 0) {
    return prisma.resume.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async create(data: {
    userId: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    parsedName?: string;
    parsedEmail?: string;
    parsedPhone?: string;
    parsedSkills?: any;
    parsedExperience?: any;
    parsedEducation?: any;
    parsedProjects?: any;
    parsedCertifications?: any;
    parsedLanguages?: any;
  }) {
    return prisma.resume.create({
      data: data as any,
      include: {
        user: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.resume.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.resume.delete({
      where: { id },
    });
  }

  async countByUserId(userId: string) {
    return prisma.resume.count({
      where: { userId },
    });
  }

  async count() {
    return prisma.resume.count();
  }
}

export default new ResumeRepository();
