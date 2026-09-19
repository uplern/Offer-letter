import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { ArrowLeft, FileText, ShieldCheck, Clock, Star, CheckCircle2, Zap } from 'lucide-react'
import ApplicationForm from '../components/ApplicationForm'
import { supabase, Role, Tenure } from '../lib/supabase'

export default function ApplyPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [tenures, setTenures] = useState<Tenure[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)

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
        { id: '1', name: 'Recruitment Specialist and Business Partnership Executive', code: 'RSBPE', created_at: new Date().toISOString() }
      ])
      setTenures([
        { id: '1', label: '65 Days', months: 65, created_at: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setTimeout(() => { router.push('/') }, 3000)
  }

  const highlights = [
    { icon: FileText, label: 'Instant Document', desc: 'Generated & downloaded immediately' },
    { icon: ShieldCheck, label: 'Verified & Secure', desc: 'Encrypted data, no third-party sharing' },
    { icon: Clock, label: 'Takes ~3 minutes', desc: 'Quick, structured enrollment process' },
    { icon: Star, label: 'Industry Recognised', desc: 'Accepted by leading organizations' },
  ]

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col lg:flex-row">

      {/* ── LEFT PANEL — Brand Sidebar ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col justify-between bg-gradient-to-b from-zinc-900 via-[#0a0a0a] to-black border-r border-zinc-800/60 p-10 xl:p-12 sticky top-0 h-screen overflow-hidden">

        {/* Decorative orange glow orb */}
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] bg-orange-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div
            className="relative w-36 h-10 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Image
              src="/logo.png"
              alt="Uplern"
              fill
              className="object-contain filter brightness-110"
              priority
              sizes="144px"
            />
          </div>
        </div>

        {/* Main sidebar content */}
        <div className="relative z-10 space-y-8">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-orange-400">
            <Zap className="w-3 h-3" />
            Offer Letter Portal
          </div>

          <div>
            <h1
              className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Your Career<br />
              <span className="text-[#ff6600]">Document</span><br />
              Awaits.
            </h1>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-xs">
              Fill in your details once. Get an official, employer-ready offer letter generated instantly — no waiting, no follow-up needed.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            {highlights.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-zinc-500 text-xs font-light mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom of sidebar */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
            <span className="text-zinc-400 text-xs">Secure 256-bit encryption</span>
          </div>
          <p className="text-zinc-700 text-[11px] font-light">
            © Uplern. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form Area ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

        {/* Top bar (mobile + desktop) */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-zinc-900 bg-[#050505]/90 backdrop-blur sticky top-0 z-20">
          {/* Mobile logo */}
          <div className="lg:hidden relative w-28 h-8">
            <Image src="/logo.png" alt="Uplern" fill className="object-contain filter brightness-110" sizes="112px" />
          </div>
          <div className="hidden lg:block" />

          <button
            onClick={() => router.back()}
            className="group flex items-center gap-1.5 text-zinc-500 text-sm font-medium hover:text-orange-400 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back
          </button>
        </div>

        <div className="px-5 sm:px-8 xl:px-12 pt-8 pb-2">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-orange-500 text-xs font-semibold uppercase tracking-widest">Step {step} of 2</span>
              <span className="text-zinc-700 text-xs">•</span>
              <span className="text-zinc-500 text-xs">{step === 1 ? 'Identity Verification' : 'Enrollment Details'}</span>
            </div>
            <div className="w-full h-0.5 bg-zinc-900 rounded-full mt-2">
              <div
                className="h-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-700"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 px-5 sm:px-8 xl:px-12 py-6">
          <div className="max-w-2xl">

            {/* Section header */}
            <div className="mb-6">
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Access Your Letter
              </h2>
              <p className="text-zinc-400 text-sm font-light">
                Enter your registered email to retrieve an existing document, or proceed to enroll for a new one.
              </p>
            </div>

            {/* Form card */}
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-zinc-600 text-sm">Preparing your portal...</span>
              </div>
            ) : (
              <div className="bg-zinc-950/80 border border-zinc-800/70 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden relative">
                {/* Slim vibrant top glowing hairline */}
                <div className="h-[2px] bg-gradient-to-r from-orange-600 via-orange-400 to-amber-500" />
                {/* orange top accent line */}
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
                <div className="p-5 sm:p-7">
                  <ApplicationForm
                    roles={roles}
                    tenures={tenures}
                    onClose={handleSuccess}
                    inline={true}
                    onStepChange={setStep}
                  />
                </div>
              </div>
            )}

            {/* Trust badges below form */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Data never sold</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
                <FileText className="w-3.5 h-3.5 text-zinc-700" />
                <span>PDF auto-generated</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
                <Clock className="w-3.5 h-3.5 text-zinc-700" />
                <span>Instant delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
