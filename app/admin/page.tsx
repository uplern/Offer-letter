'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    setAuthed(true)
    setAdmin({ id: 'admin', email: 'admin@uplern.com', name: 'System Admin' })
    setIsReady(true)
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
        <div className="w-8 h-8 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) return null

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      <AdminDashboard admin={admin} onLogout={handleLogout} />
    </div>
  )
}
