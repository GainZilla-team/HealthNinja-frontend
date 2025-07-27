// __tests__/auth.test.js
import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import User from '../models/user.model.js';
import authRouter from '../routes/authRoute.js';

// Create an express app and use your auth router
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// Mock User model
jest.mock('../models/user.model.js');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and respond with 201', async () => {
      User.findOne.mockResolvedValue(null); // no existing user
      User.prototype.save = jest.fn().mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered!');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(User.prototype.save).toHaveBeenCalled();
    });

    it('should return 409 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      const fakeUser = {
        _id: '1234567890abcdef',
        email: 'test@example.com',
        password: 'hashedpassword',
        save: jest.fn(),
      };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake-jwt-token');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBe('fake-jwt-token');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '1234567890abcdef', email: 'test@example.com' },
        expect.any(String)
      );
    });

    it('should return 404 if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('should return 401 if password is incorrect', async () => {
      const fakeUser = {
        _id: '1234567890abcdef',
        email: 'test@example.com',
        password: 'hashedpassword',
      };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
