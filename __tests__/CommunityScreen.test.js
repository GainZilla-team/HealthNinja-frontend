import express from 'express';
import request from 'supertest';

// Import your route handlers (adjust paths as needed)
import commentRoutes from '../routes/commentRoute.js';
import postRoutes from '../routes/postRoute.js';

// Mock Mongoose models
jest.mock('../models/user.model.js');
jest.mock('../models/post.model.js');

import Post from '../models/post.model.js';

// Setup Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware to always pass and inject a mock user
const authenticateUser = (req, res, next) => {
  req.user = { _id: 'user123', email: 'testuser@example.com' };
  next();
};

// Mount routes with mocked auth middleware
app.use('/api/posts', authenticateUser, postRoutes);
app.use('/api/comments', authenticateUser, commentRoutes);

describe('Community Post and Comment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Create a new post successfully', async () => {
    const mockPost = {
      _id: 'post123',
      content: 'Hello world!',
      email: 'testuser@example.com',
      createdAt: new Date(),
      comments: [],
      save: jest.fn().mockResolvedValue(true),
    };
    
    Post.mockImplementation(() => mockPost);
    Post.prototype.save = jest.fn().mockResolvedValue(mockPost);

    // Mock Post.create or new Post
    Post.create = jest.fn().mockResolvedValue(mockPost);

    // Mock Post.find for fetching posts
    Post.find = jest.fn().mockResolvedValue([mockPost]);

    // Mock Post.findById for comment routes
    Post.findById = jest.fn().mockResolvedValue(mockPost);

    // Simulate POST /api/posts
    const res = await request(app)
      .post('/api/posts')
      .send({ content: 'Hello world!' })
      .set('Authorization', 'Bearer faketoken');

    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe('Hello world!');
    expect(res.body.email).toBe('testuser@example.com');
  });

  test('Add a comment to a post', async () => {
    const mockPost = {
      _id: 'post123',
      content: 'Hello world!',
      email: 'testuser@example.com',
      createdAt: new Date(),
      comments: [],
      save: jest.fn().mockResolvedValue(true),
      comments: {
        push: jest.fn(),
        length: 0,
      }
    };

    Post.findById = jest.fn().mockResolvedValue(mockPost);

    const res = await request(app)
      .post('/api/comments/post123')
      .send({ content: 'Nice post!' })
      .set('Authorization', 'Bearer faketoken');

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(mockPost.comments.push).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Nice post!',
        email: 'testuser@example.com',
      })
    );
    expect(res.statusCode).toBe(201);
  });

  test('Delete a comment from a post', async () => {
    // Setup a mock comment subdocument
    const mockComment = {
      _id: 'comment123',
      content: 'Nice post!',
      email: 'testuser@example.com',
      remove: jest.fn(),
    };

    const mockPost = {
      _id: 'post123',
      comments: {
        id: jest.fn(() => mockComment),
      },
      save: jest.fn().mockResolvedValue(true),
    };

    Post.findById = jest.fn().mockResolvedValue(mockPost);

    const res = await request(app)
      .delete('/api/comments/post123/comment123')
      .set('Authorization', 'Bearer faketoken');

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(mockPost.comments.id).toHaveBeenCalledWith('comment123');
    expect(mockComment.remove).toHaveBeenCalled();
    expect(mockPost.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Comment deleted successfully');
  });

  // You can add more tests like unauthorized access, invalid input etc.
});
