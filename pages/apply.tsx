import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import ApplicationForm from '../components/ApplicationForm'
import { supabase, Role, Tenure } from '../lib/supabase'

export default function ApplyPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [tenures, setTenures] = useState<Tenure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesResponse, tenuresResponse] = await Promise.all([
        supabase.from('roles').select('*').order('name'),
        supabase.from('tenures').select('*').order('months')
      ])

      if (rolesResponse.data) setRoles(rolesResponse.data)
      if (tenuresResponse.data) setTenures(tenuresResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      // Set default data if Supabase fails
      setRoles([
        { id: '1', name: 'Human Resources', code: 'HR', created_at: new Date().toISOString() },
        { id: '2', name: 'Business Development', code: 'BD', created_at: new Date().toISOString() }
      ])
      setTenures([
        { id: '1', label: '2 Months', months: 2, created_at: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    // Redirect to home after successful submission
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-[#f8faf7]">
      {/* Navbar */}
      <nav className="relative z-10 w-full border-b border-teal-900/10 bg-[#f8faf7]/90 py-4 lg:py-5 px-4 sm:px-6 md:px-8 lg:px-16 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="relative w-36 lg:w-40 h-10 lg:h-12">
            <Image
              src="/logo.png"
              alt="Uplern Logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 144px, (max-width: 1024px) 160px, 160px"
              priority
            />
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center rounded-lg border border-teal-900/10 bg-white px-3 py-2 text-slate-600 shadow-sm transition-colors duration-300 hover:text-[#0f766e]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Removed page header per request */}

          {/* Application Form */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white border border-teal-900/10 rounded-xl p-6 md:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <ApplicationForm
                roles={roles}
                tenures={tenures}
                onClose={handleSuccess}
                inline={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
