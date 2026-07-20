import { AuthService } from './auth.service';
import { userRepository } from '../repositories';
import jwt from 'jsonwebtoken';

jest.mock('../repositories');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: userData.email,
        name: userData.name,
        role: 'USER'
      });
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.register(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: userData.email
      });

      await expect(authService.register(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: loginData.email,
        password: 'hashed-password',
        role: 'USER'
      });
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password'
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });
});
