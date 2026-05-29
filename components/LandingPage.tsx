'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, Role, Tenure } from '@/lib/supabase'
import { GraduationCap, Briefcase, Clock, Award, Users, TrendingUp, Shield, Globe, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
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

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 relative overflow-hidden font-sans selection:bg-teal-500/30">
      
      {/* Subtle Professional Background Elements */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <nav className="w-full border-b border-slate-200/60 bg-white/70 py-4 px-4 sm:px-6 md:px-8 lg:px-16 backdrop-blur-xl sticky top-0 z-50 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="relative w-32 sm:w-40 h-10 lg:h-12 min-w-0">
              <Image
                src="/logo.png"
                alt="Uplern Logo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 144px, 160px"
              />
            </div>

            {/* Admin Login Icon */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/login')}
                className="group flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-600 shadow-sm transition-all duration-300 hover:border-teal-500 hover:text-teal-700"
                title="Admin Login"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                <span className="text-sm font-medium hidden sm:inline-block">Admin Access</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-4 flex-grow flex items-center py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
              
              {/* Left Side - Content */}
              <div className="space-y-8 min-w-0 z-10 text-center lg:text-left">
                <div className="space-y-6 break-words">
                  <div className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-700 shadow-sm mx-auto lg:mx-0">
                    Professional Acceleration
                  </div>
                  
                  <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                    Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Future</span> of Work
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Step into an immersive professional ecosystem. Build highly-valued skills, ship real deliverables, and unlock your career potential through our premier accelerator programs.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                  <button
                    onClick={() => router.push('/apply')}
                    className="group relative flex items-center justify-center rounded-xl bg-[#0f766e] px-8 py-4 font-semibold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#115e59] hover:shadow-[0_12px_25px_rgba(15,118,110,0.3)] overflow-hidden w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center text-lg">
                      Generate Offer Letter
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Side - Professional Image Board */}
              <div className="relative w-full h-full min-h-[450px] flex items-center justify-center min-w-0 mt-10 lg:mt-0">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100/50 to-transparent rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-slate-200/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] bg-white p-2">
                  <div className="absolute inset-0 bg-slate-50/50"></div>
                  <Image
                    src="/lp1.svg"
                    alt="Professional workspace - Join Uplern career development"
                    fill
                    className="object-contain p-8 animate-slow-pan"
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Corporate Metrics Section */}
        <section className="py-16 px-4 relative z-10 bg-white border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
                <div className="flex flex-col items-center p-4">
                  <Users className="w-8 h-8 text-teal-600 mb-3" />
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">500+</div>
                  <div className="text-slate-500 font-medium">Global Operators Trained</div>
                </div>
                <div className="flex flex-col items-center p-4">
                  <TrendingUp className="w-8 h-8 text-teal-600 mb-3" />
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">95%</div>
                  <div className="text-slate-500 font-medium">Placement Success Rate</div>
                </div>
                <div className="flex flex-col items-center p-4">
                  <Briefcase className="w-8 h-8 text-teal-600 mb-3" />
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">50+</div>
                  <div className="text-slate-500 font-medium">Hiring Partners</div>
                </div>
             </div>
          </div>
        </section>

        {/* Strategic Tracks Section */}
        <section className="py-24 px-4 relative z-10 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 break-words">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Strategic Tracks
              </h2>
              <p className="text-lg text-slate-500 font-normal max-w-2xl mx-auto">
                Select a specialized path engineered to accelerate your professional trajectory and industry authority.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {roles.map((role, index) => (
                  <div
                    key={role.id}
                    className="glass-panel-light p-8 md:p-10 flex flex-col items-start relative overflow-hidden group cursor-default"
                  >
                    
                    <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-600 transition-all duration-300">
                      {index === 0 ? <Users className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" /> : <TrendingUp className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                      {role.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-bold tracking-widest mb-8 uppercase">Track Code: {role.code}</p>

                    <div className="space-y-4 mb-10 w-full text-left flex-grow">
                      <div className="flex items-center text-slate-600">
                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                          <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium">Accelerated 2-Month Sprint</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                          <GraduationCap className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium">1-on-1 Elite Mentorship</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <div className="w-6 h-6 flex items-center justify-center mr-3">
                          <Award className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium">Verified Credentials & LOR</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push('/apply')}
                      className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-300 hover:bg-slate-50 hover:border-teal-500 hover:text-teal-700 hover:shadow-sm flex justify-center items-center"
                    >
                      Select Track
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Program Durations Footnote */}
        <section className="py-16 px-4 bg-white relative z-10 border-t border-slate-200">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Program Framework</h3>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {tenures.map((tenure) => (
                <div
                  key={tenure.id}
                  className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-600 font-medium tracking-wide"
                >
                  {tenure.label} Sprint
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">
              All tracks are precisely structured to deliver maximum value through intensive, hands-on sprints, engineered for those who demand excellence in their professional journey.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
