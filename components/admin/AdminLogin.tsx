'use client'

import { useState } from 'react'
import { AuthService } from '@/lib/auth'
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface AdminLoginProps {
  onLogin: (admin: any) => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await AuthService.authenticateAdmin(formData.email, formData.password)

      if (result.success && result.admin) {
        onLogin(result.admin)
      } else {
        throw new Error(result.error || 'Invalid email or password')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="Uplern Logo"
              fill
              className="object-contain"
              style={{ filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.2))' }}
              sizes="64px"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Admin Login</h2>
          <p className="text-slate-400">Uplern Admin Panel</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-200 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="admin@system.com"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field w-full pr-12"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Login to Admin Panel</span>
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  )
}
