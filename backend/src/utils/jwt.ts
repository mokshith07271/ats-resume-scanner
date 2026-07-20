import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string = 'USER'): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
};

export const verifyToken = (token: string): { userId: string; role: string } => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
    userId: string;
    role: string;
  };
};
