import prisma from '../config/database';

export class JobDescriptionRepository {
  async findById(id: string) {
    return prisma.jobDescription.findUnique({
      where: { id },
      include: {
        user: true,
        scans: true,
      },
    });
  }

  async findByUserId(userId: string, limit: number = 10, offset: number = 0) {
    return prisma.jobDescription.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    company?: string;
    description: string;
    requirements?: string[];
    skills?: string[];
  }) {
    return prisma.jobDescription.create({
      data: data as any,
      include: {
        user: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.jobDescription.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.jobDescription.delete({
      where: { id },
    });
  }
}

export default new JobDescriptionRepository();
