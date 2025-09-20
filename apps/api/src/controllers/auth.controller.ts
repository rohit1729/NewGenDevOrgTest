import { Request, Response } from 'express';
import { config } from '../config';
import { invalidateUserCache } from '../middleware/cache';
import { AuthService, signJWT } from '../services/auth.service';
import { HttpError } from '../utils/errors';
import { sendSuccess } from '../utils/response';

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const user = await AuthService.register(req.body);
      const token = signJWT(user.id);
      
      res.cookie(config.cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProd,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      sendSuccess(res, user, 'User registered successfully');
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Registration failed');
    }
  },

  async login(req: Request, res: Response) {
    try {
      const user = await AuthService.login(req.body);
      const token = signJWT(user.id);
      
      res.cookie(config.cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.isProd,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      sendSuccess(res, user, 'Login successful');
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Login failed');
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(config.cookieName);
    sendSuccess(res, undefined, 'Logged out successfully');
  },

  async me(req: Request, res: Response) {
    try {
      const me = await AuthService.me((req as any).user.id);
      sendSuccess(res, me);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to get user data');
    }
  },

  async stats(req: Request, res: Response) {
    try {
      const stats = await AuthService.getStats((req as any).user.id);
      sendSuccess(res, stats);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to get user stats');
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await AuthService.updateProfile(userId, req.body);
      
      invalidateUserCache(userId);
      
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to update profile');
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await AuthService.changePassword(userId, req.body);
      
      sendSuccess(res, undefined, 'Password changed successfully');
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw HttpError.internalServerError('Failed to change password');
    }
  },
};