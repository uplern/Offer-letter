'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase, Role, Tenure } from '@/lib/supabase'
import {
  GraduationCap,
  Briefcase,
  Clock,
  Award,
  Users,
  TrendingUp,
  Shield,
  ChevronRight,
  Zap,
  Flame
} from 'lucide-react'

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
    <div className="min-h-screen w-full bg-[#050505] text-white relative overflow-hidden font-sans selection:bg-orange-500/30 selection:text-orange-200">

      {/* Required SVG Color Matrix Filter for Uiverse Glow Button Effects */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter width="3000%" x="-1000%" height="3000%" y="-1000%" id="unopaq">
          <feColorMatrix
            values="1 0 0 0 0 
                    0 1 0 0 0 
                    0 0 1 0 0 
                    0 0 0 3 0"
          />
        </filter>
      </svg>

      {/* Background Radial Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/20 via-orange-950/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navigation Header - Seamlessly Merged into Hero Canvas */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-transparent py-5 px-4 sm:px-6 md:px-8 lg:px-16 absolute top-0 left-0 z-50 transition-all"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Real Uplern Logo */}
            <div className="relative w-36 sm:w-44 h-9 sm:h-11 min-w-0 flex items-center">
              <Image
                src="/logo.png"
                alt="Uplern Logo"
                fill
                className="object-contain filter brightness-110"
                priority
                sizes="(max-width: 768px) 144px, 176px"
              />
            </div>
          </div>
        </motion.nav>


        {/* Hero Section - Pure 100% Opacity Background Image */}
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 pt-28 pb-16">
          {/* 100% Pure Untouched Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/bgimg1.jpg"
              alt="Hero Background"
              fill
              className="object-cover object-center opacity-100"
              priority
              sizes="100vw"
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto w-full text-center">


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Large Grand Title */}
              <h1 className="font-space-grotesk text-5xl sm:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.05] tracking-tight max-w-5xl mx-auto"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                Transform Your Career with <span className="text-[#ff6600]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Elite Industry Sprints</span>
              </h1>

              {/* Sleek Subtitle */}
              <p className="font-dm-sans text-xl sm:text-2xl text-white/90 font-medium leading-relaxed max-w-3xl mx-auto tracking-wide"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                Step into an immersive professional ecosystem. Master industry-demanded skills, execute real projects, and secure official credentials with top mentors.
              </p>






              {/* Hero Dexter Corner-Drawer Orange Glow CTA */}
              <div className="flex justify-center items-center pt-8 pb-4">
                <div
                  className="dexter-btn-container"
                  onClick={() => router.push('/apply')}
                >
                  <div className="btn-drawer transition-top">Official Document</div>
                  <div className="btn-drawer transition-bottom">expire in 4 Hrs</div>

                  <button className="btn">
                    <span className="btn-text flex items-center">
                      Get Offer Letter
                      <ChevronRight className="w-5 h-5 ml-1.5 text-white" />
                    </span>
                  </button>

                  <svg className="btn-corner" xmlns="http://www.w3.org/2000/svg" viewBox="-1 1 32 32">
                    <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                  </svg>
                  <svg className="btn-corner" xmlns="http://www.w3.org/2000/svg" viewBox="-1 1 32 32">
                    <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                  </svg>
                  <svg className="btn-corner" xmlns="http://www.w3.org/2000/svg" viewBox="-1 1 32 32">
                    <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                  </svg>
                  <svg className="btn-corner" xmlns="http://www.w3.org/2000/svg" viewBox="-1 1 32 32">
                    <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z" />
                  </svg>
                </div>
              </div>
            </motion.div>

          </div>
        </section>


        {/* Corporate Metrics Section */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="py-14 px-4 relative z-10 bg-zinc-950 border-y border-zinc-800/80"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
              <div className="flex flex-col items-center p-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3 text-orange-500">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-light text-white mb-0.5 orange-glow-text">500+</div>
                <div className="text-zinc-400 font-light text-xs sm:text-sm tracking-wide">Global Operators Trained</div>
              </div>
              <div className="flex flex-col items-center p-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3 text-orange-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-light text-white mb-0.5 orange-glow-text">95%</div>
                <div className="text-zinc-400 font-light text-xs sm:text-sm tracking-wide">Placement Success Rate</div>
              </div>
              <div className="flex flex-col items-center p-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3 text-orange-500">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-light text-white mb-0.5 orange-glow-text">50+</div>
                <div className="text-zinc-400 font-light text-xs sm:text-sm tracking-wide">Enterprise Hiring Partners</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Strategic Tracks Section */}
        <section id="tracks-section" className="py-20 px-4 relative z-10 bg-[#050505]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14 break-words"
            >
              <div className="inline-flex items-center space-x-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-0.5 text-[11px] font-light uppercase tracking-widest text-orange-400 mb-3">
                <Zap className="w-3 h-3 text-orange-500" />
                <span>Specialized Paths</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-light text-white mb-3 tracking-tight">
                Strategic Career Tracks
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xl mx-auto tracking-wide">
                Select a high-impact trajectory engineered to accelerate your authority and hands-on expertise.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {roles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.12 }}
                    whileHover={{ y: -4 }}
                    className="glass-panel-light p-6 md:p-8 flex flex-col items-start relative overflow-hidden group cursor-default"
                  >
                    <div className="w-12 h-12 bg-zinc-900 border border-orange-500/30 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-orange-600 group-hover:border-orange-500 transition-all duration-300">
                      {index === 0 ? (
                        <Users className="w-5 h-5 text-orange-400 group-hover:text-white transition-colors" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-orange-400 group-hover:text-white transition-colors" />
                      )}
                    </div>

                    <h3 className="text-xl font-normal text-white mb-1 group-hover:text-orange-400 transition-colors">
                      {role.name}
                    </h3>
                    <p className="text-orange-500/80 text-[10px] font-light tracking-widest mb-6 uppercase">Track Code: {role.code}</p>

                    <div className="space-y-3 mb-8 w-full text-left flex-grow font-light">
                      <div className="flex items-center text-zinc-300 text-xs sm:text-sm">
                        <Clock className="w-4 h-4 mr-2.5 text-orange-500" />
                        <span>Accelerated Intensive Sprint</span>
                      </div>
                      <div className="flex items-center text-zinc-300 text-xs sm:text-sm">
                        <GraduationCap className="w-4 h-4 mr-2.5 text-orange-500" />
                        <span>1-on-1 Senior Executive Mentorship</span>
                      </div>
                      <div className="flex items-center text-zinc-300 text-xs sm:text-sm">
                        <Award className="w-4 h-4 mr-2.5 text-orange-500" />
                        <span>Verified Credentials & Official LOR</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push('/apply')}
                      className="uiverse-btn w-full py-3 text-xs sm:text-sm font-normal tracking-wide"
                    >
                      <div className="a l" />
                      <div className="a r" />
                      <div className="a t" />
                      <div className="a b" />
                      <div className="text flex items-center justify-center">
                        <span>Select Track & Apply</span>
                        <ChevronRight className="w-4 h-4 ml-1.5 text-orange-400" />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Program Duration & Footer Footnote */}
        <section className="py-14 px-4 bg-zinc-950 relative z-10 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto text-center font-light">
            <h3 className="text-lg font-normal text-white mb-5">Program Structure & Duration</h3>
            <div className="flex flex-wrap justify-center gap-2.5 mb-5">
              {tenures.map((tenure) => (
                <div
                  key={tenure.id}
                  className="px-4 py-1.5 bg-black border border-zinc-800 rounded-full text-zinc-300 text-xs tracking-wide hover:border-orange-500/50 hover:text-orange-400 transition-colors"
                >
                  {tenure.label} Sprint
                </div>
              ))}
            </div>
            <p className="text-zinc-400 text-xs max-w-xl mx-auto leading-relaxed">
              All programs are engineered to deliver industry-recognized experience through intensive execution and direct mentorship.
            </p>

            {/* Bottom Footer Admin Access Icon */}
            <div className="mt-8 pt-6 border-t border-zinc-900/80 flex items-center justify-center">
              <button
                onClick={() => router.push('/admin/login')}
                className="p-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-500 transition-all duration-300 hover:border-orange-500/50 hover:text-orange-400 hover:bg-black hover:shadow-[0_0_15px_rgba(255,102,0,0.2)] group"
                title="Admin Access"
                aria-label="Admin Access"
              >
                <Shield className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
              </button>
            </div>
          </div>
        </section>


      </div>
    </div>
  )
}
