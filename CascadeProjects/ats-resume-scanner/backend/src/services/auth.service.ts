import { auth } from '../config/firebase';
import { userRepository } from '../repositories';
import { generateToken } from '../utils';
import { AppError } from '../middleware';
import { logger } from '../config';

export class AuthService {
  async registerWithEmail(email: string, password: string, name?: string) {
    try {
      // Create user in Firebase
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Create user in database
      const user = await userRepository.create({
        email,
        name,
        firebaseUid: firebaseUser.uid,
        role: 'USER',
      });

      // Generate JWT token
      const token = generateToken(user.id, user.role);

      return { user, token };
    } catch (error: any) {
      logger.error('Registration error:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new AppError('Email already exists', 400);
      }
      throw new AppError('Registration failed', 500);
    }
  }

  async loginWithEmail(email: string, password: string) {
    try {
      // Verify with Firebase (in production, use Firebase Client SDK on frontend)
      // For backend, we'll verify the user exists in our database
      const user = await userRepository.findByEmail(email);

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = generateToken(user.id, user.role);

      return { user, token };
    } catch (error) {
      logger.error('Login error:', error);
      throw new AppError('Login failed', 401);
    }
  }

  async loginWithGoogle(idToken: string) {
    try {
      // Verify Google ID token with Firebase
      const decodedToken = await auth.verifyIdToken(idToken);

      // Check if user exists in database
      let user = await userRepository.findByFirebaseUid(decodedToken.uid);

      if (!user) {
        // Create new user
        user = await userRepository.create({
          email: decodedToken.email || '',
          name: decodedToken.name || '',
          firebaseUid: decodedToken.uid,
          photo: decodedToken.picture || '',
          role: 'USER',
        });
      }

      // Generate JWT token
      const token = generateToken(user.id, user.role);

      return { user, token };
    } catch (error) {
      logger.error('Google login error:', error);
      throw new AppError('Google login failed', 401);
    }
  }

  async getUserById(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(userId: string, data: { name?: string; photo?: string }) {
    const user = await userRepository.update(userId, data);
    return user;
  }
}

export default new AuthService();
