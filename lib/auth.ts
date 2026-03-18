import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface AuthResult {
  success: boolean
  admin?: any
  error?: string
}

export class AuthService {
  private static readonly SESSION_KEY = 'admin_session'
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  static async authenticateAdmin(email: string, password: string): Promise<AuthResult> {
    try {
      // Try database authentication
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !admin) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify the hashed password securely
      const match = await bcrypt.compare(password, admin.password_hash)
      if (!match) {
        return { success: false, error: 'Invalid email or password' }
      }

      return { success: true, admin }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  static setSession(admin: any): void {
    const session = {
      admin,
      expires: Date.now() + this.SESSION_DURATION,
      timestamp: Date.now()
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    }
  }

  static getSession(): { admin: any; valid: boolean } {
    if (typeof window === 'undefined') {
      return { admin: null, valid: false }
    }

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) {
        return { admin: null, valid: false }
      }

      const session = JSON.parse(sessionData)
      const isValid = session.expires > Date.now()

      if (!isValid) {
        this.clearSession()
        return { admin: null, valid: false }
      }

      return { admin: session.admin, valid: true }
    } catch (error) {
      this.clearSession()
      return { admin: null, valid: false }
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession().valid
  }
}
