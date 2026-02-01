/**
 * Auth Repository
 * Handles database operations for authentication and profiles
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin, getSupabaseClientWithAuth } from '../config/database';
import type { Database, Profile, ProfileUpdate } from '../types/database.types';
import { parseSupabaseError, DatabaseError } from '../middleware/error.middleware';

export class AuthRepository {
  /**
   * Get profile by user ID
   */
  async getProfileById(userId: string): Promise<Profile | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw parseSupabaseError(error);
    }

    return data;
  }

  /**
   * Get profile by email
   */
  async getProfileByEmail(email: string): Promise<Profile | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.from('profiles').select('*').eq('email', email).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw parseSupabaseError(error);
    }

    return data;
  }

  /**
   * Update profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate,
    accessToken: string
  ): Promise<Profile> {
    const supabase = getSupabaseClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as unknown as never)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    if (!data) {
      throw new DatabaseError('Failed to update profile');
    }

    return data;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const profile = await this.getProfileByEmail(email);
    return profile !== null;
  }

  /**
   * Get Supabase admin client for auth operations
   */
  getAdminClient(): SupabaseClient<Database> {
    return getSupabaseAdmin();
  }

  /**
   * Get Supabase client with user auth
   */
  getAuthenticatedClient(accessToken: string): SupabaseClient<Database> {
    return getSupabaseClientWithAuth(accessToken);
  }
}

export const authRepository = new AuthRepository();
