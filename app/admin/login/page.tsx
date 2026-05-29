'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value || ''
      const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement)?.value || ''
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const result = await response.json()

      if (!response.ok || result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push('/admin')
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      <nav className="w-full border-b border-teal-900/10 bg-[#f8faf7]/90 py-4 lg:py-5 px-4 sm:px-6 md:px-8 lg:px-16 backdrop-blur">
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
            className="rounded-lg border border-teal-900/10 bg-white px-3 py-2 text-sm font-medium text-slate-500 shadow-sm transition-colors hover:text-[#0f766e]"
          >
            Back to Site
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-md w-full bg-white border border-teal-900/10 rounded-xl p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 w-fit rounded-md bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Uplern HQ</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Admin <span className="text-[#0f766e]">Portal</span>
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
              className="btn-primary w-full flex items-center justify-center space-x-2 shadow-xl shadow-[#0f766e]/10"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
