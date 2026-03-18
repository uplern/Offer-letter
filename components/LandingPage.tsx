'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, Role, Tenure } from '@/lib/supabase'
import { GraduationCap, Briefcase, Clock, Award, Users, TrendingUp, Shield, Globe, Settings, CheckCircle, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

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
        { id: '1', name: 'Sales & Marketing', code: 'SM', created_at: new Date().toISOString() },
        { id: '2', name: 'Talent Acquisition', code: 'TA', created_at: new Date().toISOString() },
        { id: '3', name: 'Talent Acquisition Sales & Marketing Combined', code: 'TASM', created_at: new Date().toISOString() }
      ])
      setTenures([
        { id: '1', label: '1 Month', months: 1, created_at: new Date().toISOString() },
        { id: '2', label: '2 Months', months: 2, created_at: new Date().toISOString() },
        { id: '3', label: '4 Months', months: 4, created_at: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navbar merged with hero */}
      <nav className="relative z-10 w-full py-3 lg:py-4 px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="relative w-28 sm:w-36 lg:w-40 h-10 lg:h-12 min-w-0">
            <Image
              src="/logo.png"
              alt="Uplern Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 144px, (max-width: 1024px) 160px, 160px"
            />
          </div>

          {/* Admin Login Icon */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/login')}
              className="group p-2.5 text-slate-500 hover:text-[#4f46e5] transition-all duration-300 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center space-x-2"
              title="Admin Login"
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline-block">Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 min-h-screen flex items-center pt-16 sm:pt-20 md:pt-8 -mt-10 lg:mt-0">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center overflow-hidden min-w-0">
            {/* Left Side - Content */}
            <motion.div
              className="space-y-8 min-w-0"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div className="space-y-6 break-words" variants={fadeInUp}>
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight"
                  variants={fadeInUp}
                >
                  Elevate Your Career with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#4f46e5]">
                    Uplern
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-slate-500 font-light leading-relaxed max-w-xl break-words"
                  variants={fadeInUp}
                >
                  Unlock your potential through our industry-leading internship
                  and professional growth initiatives. Master the essential skills
                  sought by global leaders through hands-on mentorship.
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <button
                  onClick={() => router.push('/apply')}
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#ef4444] to-[#4f46e5] hover:from-[#dc2626] hover:to-[#4338ca] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[rgba(79,70,229,0.25)] flex items-center justify-center"
                >
                  <span>Offer Letter</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
              className="relative w-full h-[300px] sm:h-[440px] lg:h-[800px] flex items-center justify-center min-w-0"
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
            >
              <Image
                src="/lp1.svg"
                alt="Professional workspace - Join Uplern career development"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <motion.section
        id="about"
        className="py-24 px-4 bg-slate-50/50 will-change-transform"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-w-0">
            <motion.div
              className="space-y-6 min-w-0"
              variants={staggerContainer}
            >


              <motion.h2
                className="text-3xl md:text-4xl font-bold text-slate-900"
                variants={fadeInUp}
              >
                Pioneering Professional Excellence for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#4f46e5]">
                  Future Leaders
                </span>
              </motion.h2>

              <motion.p
                className="text-lg text-slate-500 font-light leading-relaxed"
                variants={fadeInUp}
              >
                Uplern serves as the vital bridge between academic foundations and
                corporate success. Our ecosystem is meticulously designed to
                provide the practical insights today&apos;s digital economy demands.
              </motion.p>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
              >
                <motion.div
                  className="flex items-start space-x-3"
                  variants={fadeInLeft}
                >
                  <div className="w-6 h-6 bg-[#4f46e5] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Industry-Relevant Training</h4>
                    <p className="text-slate-500">Learn skills that are in high demand across various industries</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  variants={fadeInLeft}
                >
                  <div className="w-6 h-6 bg-[#4f46e5] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Expert Mentorship</h4>
                    <p className="text-slate-500">Get guidance from experienced professionals in your field</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3"
                  variants={fadeInLeft}
                >
                  <div className="w-6 h-6 bg-[#4f46e5] rounded-full flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Career Placement Support</h4>
                    <p className="text-slate-500">Comprehensive support to help you land your dream job</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-6 min-w-0"
              variants={staggerContainer}
            >
              <motion.div
                className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
                <div className="text-slate-500">Professionals Trained</div>
              </motion.div>
              <motion.div
                className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-slate-900 mb-2">95%</div>
                <div className="text-slate-500">Success Rate</div>
              </motion.div>
              <motion.div
                className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-slate-900 mb-2">50+</div>
                <div className="text-slate-500">Partner Companies</div>
              </motion.div>
              <motion.div
                className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                variants={scaleIn}
              >
                <div className="text-3xl font-bold text-slate-900 mb-2">24/7</div>
                <div className="text-slate-500">Support Available</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Available Positions */}
      <motion.section
        id="programs"
        className="py-20 px-4 will-change-transform"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16 break-words"
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Strategic Opportunities
            </h2>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
              Select a specialized track tailored to your professional trajectory
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-w-0"
              variants={staggerContainer}
            >
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  className="bg-white border border-slate-100 rounded-3xl p-8 hover:border-[#4f46e5]/30 transition-all duration-500 flex flex-col items-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
                  variants={scaleIn}
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left w-full mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#ef4444] to-[#4f46e5] rounded-2xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 flex-shrink-0 shadow-md shadow-[#4f46e5]/20">
                      {index === 0 && <Briefcase className="w-8 h-8 text-white" />}
                      {index === 1 && <TrendingUp className="w-8 h-8 text-white" />}
                      {index === 2 && <Globe className="w-8 h-8 text-white" />}
                      {index > 2 && <Award className="w-8 h-8 text-white" />}
                    </div>
                    <div className="flex flex-col justify-center min-h-[4rem]">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {role.name}
                      </h3>
                      <p className="text-slate-400 text-sm">Position Code: {role.code}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 w-full text-left">
                    <div className="flex items-center text-slate-600">
                      <Clock className="w-5 h-5 mr-3 text-[#ef4444] flex-shrink-0" />
                      <span className="text-sm sm:text-base">Flexible Duration Options</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Users className="w-5 h-5 mr-3 text-[#ef4444] flex-shrink-0" />
                      <span className="text-sm sm:text-base">Collaborative Environment</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <GraduationCap className="w-5 h-5 mr-3 text-[#4f46e5] flex-shrink-0" />
                      <span className="text-sm sm:text-base">Professional Mentorship</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Award className="w-5 h-5 mr-3 text-[#4f46e5] flex-shrink-0" />
                      <span className="text-sm sm:text-base">Industry Recognition</span>
                    </div>
                  </div>

                  <div className="mt-auto w-full">
                    <button
                      onClick={() => router.push('/apply')}
                      className="w-full py-3.5 bg-slate-50 border border-slate-100 text-slate-900 font-semibold rounded-2xl transition-all duration-300 hover:bg-[#4f46e5] hover:border-[#4f46e5] hover:text-white"
                    >
                      Apply Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Program Durations */}
      <motion.section
        id="durations"
        className="py-24 px-4 bg-white will-change-transform"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div className="min-w-0" variants={staggerContainer}>
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight"
                variants={fadeInLeft}
              >
                Program <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#4f46e5]">Durations</span>
              </motion.h3>
              <motion.p
                className="text-slate-500 font-light mb-8 max-w-xl"
                variants={fadeInLeft}
              >
                Pick a duration that fits your schedule. All options include mentorship, deliverables, and a completion letter.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3 mb-8"
                variants={staggerContainer}
              >
                {tenures.map((tenure) => (
                  <motion.div
                    key={tenure.id}
                    className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-slate-600 hover:border-[#4f46e5]/30 hover:text-[#4f46e5] transition-colors"
                    variants={scaleIn}
                  >
                    {tenure.label}
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-600"
                  variants={scaleIn}
                >
                  <div className="text-slate-900 font-semibold mb-1">Guided</div>
                  <div className="text-sm">Weekly mentor check-ins</div>
                </motion.div>
                <motion.div
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-600"
                  variants={scaleIn}
                >
                  <div className="text-slate-900 font-semibold mb-1">Hands-on</div>
                  <div className="text-sm">Real deliverables to ship</div>
                </motion.div>
                <motion.div
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-600"
                  variants={scaleIn}
                >
                  <div className="text-slate-900 font-semibold mb-1">Certificate</div>
                  <div className="text-sm">Letter upon completion</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
              className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center min-w-0"
              variants={fadeInRight}
            >
              <Image
                src="/lp2.svg"
                alt="Program durations"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Removed Call to Action section as requested */}

      {/* Removed Contact section as requested */}

    </div>
  )
}
