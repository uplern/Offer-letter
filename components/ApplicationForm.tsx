'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase, Role, Tenure } from '@/lib/supabase'
import { getAvailableTenuresForRole } from '@/lib/role-tenure-mapping'
import { ServerFileUpload } from '@/lib/server-file-upload'
import { X, Send, CheckCircle, AlertCircle, Download, Loader2, Mail, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react'
import { generateOfferLetter } from '@/lib/docx-generator'

interface ApplicationFormProps {
  roles: Role[]
  tenures: Tenure[]
  onClose?: () => void
  inline?: boolean
  onStepChange?: (step: number) => void
}

interface FormData {
  first_name: string
  last_name: string
  father_name: string
  college_name: string
  address: string
  email: string
  phone: string
  role_id: string
  tenure_id: string
  // File uploads
  aadhar_front: File | null
  aadhar_back: File | null
  photo: File | null
  college_id: File | null
  marksheet_12th: File | null
}

export default function ApplicationForm({ roles, tenures, onClose, inline, onStepChange }: ApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    father_name: '',
    college_name: '',
    address: '',
    email: '',
    phone: '',
    role_id: '',
    tenure_id: '',
    // File uploads
    aadhar_front: null,
    aadhar_back: null,
    photo: null,
    college_id: null,
    marksheet_12th: null
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [availableTenures, setAvailableTenures] = useState<Tenure[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({})
  const [missingFiles, setMissingFiles] = useState<string[]>([])

  // Email verification states
  const [showEmailCheckModal, setShowEmailCheckModal] = useState(true)
  const [checkEmail, setCheckEmail] = useState('')
  const [checkLoading, setCheckLoading] = useState(false)
  const [existingUser, setExistingUser] = useState<any>(null)
  const [checkError, setCheckError] = useState('')
  const [downloadingLetter, setDownloadingLetter] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkEmail || !/.+@.+\..+/.test(checkEmail)) {
      setCheckError('Please enter a valid email address.')
      return
    }
    setCheckLoading(true)
    setCheckError('')
    setExistingUser(null)

    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', checkEmail.trim().toLowerCase())

      if (queryError) {
        throw new Error(queryError.message || 'Failed to verify email.')
      }

      if (data && data.length > 0) {
        setExistingUser(data[0])
      } else {
        // User does not exist, close modal and prefill email in form
        setFormData(prev => ({ ...prev, email: checkEmail.trim().toLowerCase() }))
        setShowEmailCheckModal(false)
        if (onStepChange) onStepChange(2)
      }
    } catch (err: any) {
      setCheckError(err.message || 'Something went wrong while verifying email.')
    } finally {
      setCheckLoading(false)
    }
  }

  const handleDownloadExistingOffer = async () => {
    if (!existingUser) return
    setDownloadingLetter(true)
    setDownloadError('')
    setDownloadSuccess(false)

    try {
      const selectedRole = roles.find(r => r.id === existingUser.role_id)
      const selectedTenure = tenures.find(t => t.id === existingUser.tenure_id)

      if (!selectedRole || !selectedTenure) {
        throw new Error('Associated position or duration not found.')
      }

      const generatedDate = existingUser.created_at
        ? new Date(existingUser.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : undefined

      await generateOfferLetter({
        candidateName: `${existingUser.first_name} ${existingUser.last_name}`.trim(),
        roleCode: selectedRole.code,
        tenureMonths: selectedTenure.months,
        roleName: selectedRole.name,
        tenureLabel: selectedTenure.label,
        generatedDate,
        userId: existingUser.id
      })

      setDownloadSuccess(true)
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to download offer letter. Please try again.')
    } finally {
      setDownloadingLetter(false)
    }
  }

  // Generate a STABLE session ID once when the form mounts.
  // Using this instead of a timestamp-at-submit means retries overwrite the same files.
  const formSessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  const errorRef = useRef<HTMLDivElement>(null)
  const documentsRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: value
      }

      if (name === 'role_id') {
        return {
          ...next,
          tenure_id: ''
        }
      }

      return next
    })

    // Update available tenures when role changes
    if (name === 'role_id') {
      const selectedRole = roles.find(role => role.id === value)
      if (selectedRole) {
        const availableMonths = getAvailableTenuresForRole(selectedRole.code)
        const filteredTenures = tenures.filter(tenure => availableMonths.includes(tenure.months))
        setAvailableTenures(filteredTenures)
      } else {
        setAvailableTenures([])
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]

      // Validate file
      const validation = ServerFileUpload.validateFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        e.target.value = '' // Clear the invalid file from the input visually
        return
      }

      setFormData(prev => ({
        ...prev,
        [name]: file
      }))
      setMissingFiles(prev => prev.filter(f => f !== name))
      setError('') // Clear any previous errors
    }
  }

  const scrollToError = useCallback(() => {
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMissingFiles([])
    
    try {
      // Mandatory field validation
      const requiredText = [
        'first_name', 'last_name', 'father_name', 'college_name', 'address', 'email', 'phone'
      ] as const
      for (const key of requiredText) {
        // @ts-ignore
        if (!formData[key] || String(formData[key]).trim() === '') {
          throw new Error('Please fill in all required fields before submitting.')
        }
      }

      if (!formData.role_id || !formData.tenure_id) {
        throw new Error('Please select both Position and Duration.')
      }

      // Basic format checks
      const emailOk = /.+@.+\..+/.test(formData.email)
      if (!emailOk) throw new Error('Please enter a valid email address.')
      const phoneOk = /[0-9]{7,}/.test(formData.phone.replace(/\D/g, ''))
      if (!phoneOk) throw new Error('Please enter a valid phone number.')

      // File checks (all required) – collect missing names for helpful feedback
      const fileChecks = [
        { key: 'aadhar_front', label: 'Aadhar Card (Front)' },
        { key: 'aadhar_back', label: 'Aadhar Card (Back)' },
        { key: 'photo', label: 'Candidate Photo' },
        { key: 'college_id', label: 'College ID Card' },
        { key: 'marksheet_12th', label: '12th Marksheet' },
      ] as const
      const missing = fileChecks.filter(f => !formData[f.key as keyof FormData]).map(f => f.label)
      if (missing.length > 0) {
        setMissingFiles(missing.map(l => fileChecks.find(f => f.label === l)!.key))
        setTimeout(() => {
          documentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
        throw new Error(`Please upload the following required documents: ${missing.join(', ')}.`)
      }

      // Use the stable session ID — retries will overwrite the same files
      const tempUserId = formSessionId.current

      // Upload files to Supabase Storage
      const fileUploads = [
        { file: formData.aadhar_front, folder: 'aadhar_front', key: 'aadhar_front_url' },
        { file: formData.aadhar_back, folder: 'aadhar_back', key: 'aadhar_back_url' },
        { file: formData.photo, folder: 'photos', key: 'photo_url' },
        { file: formData.college_id, folder: 'college_ids', key: 'college_id_url' },
        { file: formData.marksheet_12th, folder: 'marksheets', key: 'marksheet_12th_url' },
      ]

      const fileUrls: { [key: string]: string | null } = {}

      setUploadProgress(prev => ({
        ...prev,
        ...Object.fromEntries(fileUploads.map(u => [u.key, !!u.file]))
      }))

      await Promise.all(
        fileUploads.map(async (upload) => {
          if (!upload.file) {
            fileUrls[upload.key] = null
            return
          }

          try {
            const result = await ServerFileUpload.uploadFile(
              upload.file,
              upload.folder,
              tempUserId,
              formData.phone.trim()
            )

            if (result.error) {
              throw new Error(result.error)
            }

            fileUrls[upload.key] = result.url
          } catch (e: any) {
            throw new Error(`Failed to upload ${upload.folder}: ${e?.message || 'Upload failed'}`)
          } finally {
            setUploadProgress(prev => ({ ...prev, [upload.key]: false }))
          }
        })
      )

      // Prepare data for database
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        father_name: formData.father_name,
        college_name: formData.college_name,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        role_id: formData.role_id,
        tenure_id: formData.tenure_id,
        status: 'pending',
        ...fileUrls
      }

      // Check if user already exists with this email
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)

      if (checkError) {
        throw new Error(checkError.message || 'Failed to verify existing application status.')
      }

      let newUser

      if (existingUsers && existingUsers.length > 0) {
        // User already exists (e.g., previous try inserted the data but failed to generate the PDF).
        // Reuse the existing record to generate/regenerate the offer letter.
        newUser = existingUsers[0]
      } else {
        // Insert new user into database
        const { data: newUsers, error: insertError } = await supabase
          .from('users')
          .insert([submitData])
          .select()

        if (insertError) {
          throw new Error(insertError.message || 'An error occurred while saving your details.')
        }

        if (!newUsers || newUsers.length === 0) {
          throw new Error('Application submitted but failed to retrieve reference ID')
        }

        newUser = newUsers[0]
      }

      // Generate Offer Letter immediately using selected Role & Tenure
      const selectedRole = roles.find(r => r.id === formData.role_id)
      const selectedTenure = tenures.find(t => t.id === formData.tenure_id)
      if (!selectedRole || !selectedTenure) {
        throw new Error('Unable to generate offer letter: role or tenure not found')
      }

      const generatedDate = newUser.created_at
        ? new Date(newUser.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : undefined

      await generateOfferLetter({
        candidateName: `${formData.first_name} ${formData.last_name}`.trim(),
        roleCode: selectedRole.code,
        tenureMonths: selectedTenure.months,
        roleName: selectedRole.name,
        tenureLabel: selectedTenure.label,
        generatedDate,
        userId: newUser.id
      })



      setSuccess(true)
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your application')
      scrollToError()
    } finally {
      setLoading(false)
      setUploadProgress({})
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (inline) return
    if (e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <div className={inline ? "w-full" : "modal-overlay"} onClick={handleOverlayClick}>
      <div className={inline ? "w-full" : "bg-zinc-950 border border-zinc-800 w-full max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-4 md:p-6 relative rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.9)]"}>

        {/* Close Button */}
        {!inline && (
          <button
            onClick={onClose}
            className="absolute top-4 md:top-6 right-4 md:right-6 text-zinc-500 hover:text-orange-400 transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        {showEmailCheckModal ? (
          <div className="py-1 space-y-5">
            {/* Sleek Top Pill & Security Indicator */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-mono font-semibold uppercase tracking-widest text-orange-400">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Access Verification
              </div>
              <div className="flex items-center gap-1 text-zinc-500 text-[11px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400/80" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-display mb-1">Check Your Access</h2>
              <p className="text-zinc-400 text-xs font-normal leading-relaxed">
                Enter registered email to retrieve your offer letter or start enrollment.
              </p>
            </div>

            {checkError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center">
                <AlertCircle className="w-4 h-4 text-red-400 mr-2.5 flex-shrink-0" />
                <span className="text-red-400 text-xs">{checkError}</span>
              </div>
            )}

            {!existingUser ? (
              <form onSubmit={handleEmailCheck} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-[11px] font-mono uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-orange-400 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={checkEmail}
                      onChange={(e) => setCheckEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg text-zinc-100 placeholder:text-zinc-500 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 focus:bg-zinc-900 focus:outline-none transition-all"
                      placeholder="professional@email.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkLoading}
                  className="w-full h-10 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(255,102,0,0.3)] hover:shadow-[0_0_30px_rgba(255,102,0,0.5)] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {checkLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5 text-center">
                <div className="bg-zinc-900 border border-orange-500/20 rounded-2xl p-5 text-left space-y-3">
                  <div className="flex items-center space-x-2.5 text-orange-400 font-semibold">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Document Located!</span>
                  </div>
                  <div className="text-sm text-zinc-300 space-y-1.5 pt-1">
                    <p><strong>Name:</strong> {existingUser.first_name} {existingUser.last_name}</p>
                    <p><strong>Email:</strong> {existingUser.email}</p>
                    <p><strong>Status:</strong> <span className="capitalize ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/20">{existingUser.status}</span></p>
                  </div>
                </div>

                {downloadError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center text-left">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <span className="text-red-400 text-sm">{downloadError}</span>
                  </div>
                )}

                {downloadSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center text-left">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <span className="text-emerald-400 text-sm">Offer letter downloaded successfully!</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownloadExistingOffer}
                    disabled={downloadingLetter}
                    className="flex-1 relative group overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-[1px] font-semibold text-white transition-all duration-300 shadow-[0_4px_20px_rgba(255,102,0,0.25)] hover:shadow-[0_6px_30px_rgba(255,102,0,0.5)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2 py-3 px-5 rounded-[11px] bg-zinc-950/20 group-hover:bg-transparent transition-all">
                      {downloadingLetter ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span className="font-semibold text-sm text-white">Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-white" />
                          <span className="font-semibold text-sm text-white">Download Document</span>
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setExistingUser(null)
                      setCheckEmail('')
                      setCheckError('')
                      setDownloadError('')
                      setDownloadSuccess(false)
                    }}
                    className="px-5 py-3 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:text-white transition-all"
                  >
                    Check Another Email
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-1.5">Enrollment Details</h2>
              <p className="text-zinc-400 text-sm font-light">Fill in the fields below accurately for your offer letter.</p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                <span className="text-emerald-400">Application submitted successfully! Our HR team will contact you shortly.</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div ref={errorRef} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Parent Name */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">{"Father's Name"}</label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Father's name"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field w-full opacity-60 cursor-not-allowed"
                    placeholder="professional@email.com"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                    placeholder="Contact number"
                  />
                </div>
              </div>

              {/* College / University */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">College / University</label>
                <input
                  type="text"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter college or university name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="input-field w-full"
                  placeholder="Enter full address"
                />
              </div>

              {/* Position and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Position</label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    required
                    className="input-field w-full"
                  >
                    <option value="">Select Position</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">Duration</label>
                  <select
                    name="tenure_id"
                    value={formData.tenure_id}
                    onChange={handleChange}
                    required
                    disabled={!formData.role_id}
                    className="input-field w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.role_id ? 'Select Role First' : 'Select Duration'}
                    </option>
                    {availableTenures.map((tenure) => (
                      <option key={tenure.id} value={tenure.id}>
                        {tenure.label}
                      </option>
                    ))}
                  </select>
                  {formData.role_id && availableTenures.length === 0 && (
                    <p className="text-xs text-amber-400 mt-1">No tenures available for selected role</p>
                  )}
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4" ref={documentsRef}>
                <h3 className="text-base font-semibold text-white">
                  Required Documents
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      Aadhar Card (Front) <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="file"
                      name="aadhar_front"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                      className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:text-xs file:font-medium hover:file:bg-orange-500 transition-colors cursor-pointer ${missingFiles.includes('aadhar_front') ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-zinc-800'}`}
                    />
                    <p className="text-xs text-zinc-600 mt-1">Upload a clear image (JPG/PNG)</p>
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      Aadhar Card (Back) <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="file"
                      name="aadhar_back"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                      className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:text-xs file:font-medium hover:file:bg-orange-500 transition-colors cursor-pointer ${missingFiles.includes('aadhar_back') ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-zinc-800'}`}
                    />
                    <p className="text-xs text-zinc-600 mt-1">Upload a clear image (JPG/PNG)</p>
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      Candidate Photo <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="file"
                      name="photo"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                      className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:text-xs file:font-medium hover:file:bg-orange-500 transition-colors cursor-pointer ${missingFiles.includes('photo') ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-zinc-800'}`}
                    />
                    <p className="text-xs text-zinc-600 mt-1">Passport size photo (JPG/PNG)</p>
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      College ID Card <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="file"
                      name="college_id"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                      className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:text-xs file:font-medium hover:file:bg-orange-500 transition-colors cursor-pointer ${missingFiles.includes('college_id') ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-zinc-800'}`}
                    />
                    <p className="text-xs text-zinc-600 mt-1">Student ID card image (JPG/PNG)</p>
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-sm font-medium mb-2">
                      12th Marksheet <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="file"
                      name="marksheet_12th"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                      className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:text-xs file:font-medium hover:file:bg-orange-500 transition-colors cursor-pointer ${missingFiles.includes('marksheet_12th') ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-zinc-800'}`}
                    />
                    <p className="text-xs text-zinc-600 mt-1">Class 12 certificate image (JPG/PNG)</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-[1px] font-semibold text-white transition-all duration-300 shadow-[0_4px_20px_rgba(255,102,0,0.25)] hover:shadow-[0_6px_30px_rgba(255,102,0,0.5)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-live="polite"
                  aria-busy={loading}
                >
                  <div className="flex items-center justify-center space-x-2 py-3.5 px-6 rounded-[11px] bg-zinc-950/20 group-hover:bg-transparent transition-all">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" aria-hidden="true" />
                        <span className="font-semibold tracking-wide text-white">Generating Offer Letter...</span>
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-white" />
                        <span className="font-semibold text-white">Letter Generated!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        <span className="font-semibold tracking-wide text-white">Generate My Letter</span>
                        <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
