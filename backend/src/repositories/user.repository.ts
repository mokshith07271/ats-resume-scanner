import prisma from '../config/database';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        resumes: true,
        jobDescriptions: true,
        scanHistory: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async create(data: {
    email: string;
    name?: string;
    firebaseUid?: string;
    photo?: string;
    role?: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; photo?: string; skills?: string[]; role?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async findAll(limit: number = 10, offset: number = 0) {
    return prisma.user.findMany({
      take: limit,
      skip: offset,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async count() {
    return prisma.user.count();
  }

  async findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }
}

export default new UserRepository();
