'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { loginAction } from '@/app/actions/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const result = await loginAction(null, formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success && result.admin) {
        // Maintain existing client-side session logic for compatibility
        localStorage.setItem('adminToken', result.admin.id)
        localStorage.setItem('adminEmail', result.admin.email)
        router.push('/admin')
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="w-full py-4 lg:py-6 px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="relative w-36 lg:w-40 h-10 lg:h-12">
            <Image
              src="/logo.png"
              alt="Uplern Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 144px, (max-width: 1024px) 160px, 160px"
            />
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-slate-500 hover:text-[#4f46e5] transition-colors text-sm font-medium"
          >
            Back to Site
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-md w-full bg-white border border-[#4f46e5]/10 rounded-3xl p-8 shadow-[0_8px_30px_rgb(79,70,229,0.04)]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#4f46e5]">Portal</span>
            </h1>
            <p className="text-slate-500 font-light">Secure access for Uplern management</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="admin@uplern.com"
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="input-field w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 shadow-xl shadow-[#4f46e5]/10"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
