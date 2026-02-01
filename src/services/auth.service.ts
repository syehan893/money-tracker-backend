/**
 * Auth Service
 * Handles business logic for authentication
 */

import { authRepository } from '../repositories/auth.repository';
import {
  AppError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';
import type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponse,
} from '../types/api.types';
import type { Profile, ProfileUpdate } from '../types/database.types';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const { email, password, fullName } = data;

    const supabase = authRepository.getAdminClient();

    // Create user in Supabase Auth
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('already registered')) {
        throw new ConflictError('An account with this email already exists');
      }
      throw new AppError(
        error.message || 'Registration failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT
      );
    }

    if (!authData.user || !authData.session) {
      throw new AppError(
        'Registration failed. Please try again.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR
      );
    }

    // Profile is automatically created by database trigger
    // Wait a moment for the trigger to complete
    const profile = await this.waitForProfile(authData.user.id);

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: profile?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
      },
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    };
  }

  /**
   * Login a user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    const supabase = authRepository.getAdminClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!authData.user || !authData.session) {
      throw new UnauthorizedError('Login failed');
    }

    // Get profile
    const profile = await authRepository.getProfileById(authData.user.id);

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: profile?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
      },
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    };
  }

  /**
   * Logout a user
   */
  async logout(accessToken: string): Promise<void> {
    const supabase = authRepository.getAuthenticatedClient(accessToken);

    const { error } = await supabase.auth.signOut();

    if (error) {
      // Log error but don't throw - user can still be considered logged out
      console.error('Logout error:', error.message);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<Profile> {
    const profile = await authRepository.getProfileById(userId);

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    return profile;
  }

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const { email } = data;

    const supabase = authRepository.getAdminClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      // Don't reveal if email exists or not for security
      console.error('Password reset error:', error.message);
    }

    // Always return success to prevent email enumeration
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const { password } = data;

    const supabase = authRepository.getAdminClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new AppError(
        'Failed to reset password. The link may have expired.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TOKEN_EXPIRED
      );
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<{ fullName: string; avatarUrl: string }>,
    accessToken: string
  ): Promise<Profile> {
    const profileUpdate: ProfileUpdate = {};

    if (updates.fullName !== undefined) {
      profileUpdate.full_name = updates.fullName;
    }

    if (updates.avatarUrl !== undefined) {
      profileUpdate.avatar_url = updates.avatarUrl;
    }

    return authRepository.updateProfile(userId, profileUpdate, accessToken);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const supabase = authRepository.getAdminClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  /**
   * Wait for profile to be created by trigger
   * Retries a few times in case of race condition
   */
  private async waitForProfile(userId: string, maxRetries = 3): Promise<Profile | null> {
    for (let i = 0; i < maxRetries; i++) {
      const profile = await authRepository.getProfileById(userId);
      if (profile) {
        return profile;
      }
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return null;
  }
}

export const authService = new AuthService();
