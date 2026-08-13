'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { supabase, Candidate } from '@/lib/supabase'
import { generateOfferLetter, OfferLetterData } from '@/lib/docx-generator'
import {
  Eye,
  FileDown,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText
} from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<Candidate | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(name, code),
          tenure:tenures(label, months)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      await fetchUsers()
      alert(`Status updated to ${status}`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const generateOffer = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user || !user.role || !user.tenure) {
        alert('User data incomplete')
        return
      }

      const generatedDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : undefined

      const data: OfferLetterData = {
        candidateName: `${user.first_name} ${user.last_name}`,
        roleCode: user.role.code,
        tenureMonths: user.tenure.months,
        roleName: user.role.name,
        tenureLabel: user.tenure.label,
        generatedDate,
        userId: user.id
      }

      await generateOfferLetter(data)
      await updateUserStatus(userId, 'offer_generated')

      alert('Offer letter generated and downloaded successfully!')
    } catch (error) {
      console.error('Error generating offer:', error)
      alert('Failed to generate offer letter. Please try again.')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Group users by year and month
  interface GroupedUsers {
    [year: string]: {
      [month: string]: Candidate[]
    }
  }

  const groupedUsers: GroupedUsers = filteredUsers.reduce((acc, user) => {
    const date = new Date(user.created_at)
    const year = date.getFullYear().toString()
    const month = date.toLocaleString('default', { month: 'long' })

    if (!acc[year]) acc[year] = {}
    if (!acc[year][month]) acc[year][month] = []
    acc[year][month].push(user)

    return acc
  }, {} as GroupedUsers)

  // Get current month and year
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear().toString()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' })

  // Initialize expanded groups with current month on first render
  useEffect(() => {
    const currentKey = `${currentYear}-${currentMonth}`
    setExpandedGroups(new Set([currentKey]))
  }, [currentYear, currentMonth])

  const toggleGroup = (year: string, month: string) => {
    const key = `${year}-${month}`
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      case 'offer_generated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0f766e]/10 text-[#0f766e] border border-[#0f766e]/20">
            <FileDown className="w-3 h-3 mr-1" />
            Offer Ready
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            {status}
          </span>
        )
    }
  }

  const detailItems: {
    label: string
    value: string
    valueClassName?: string
    fullWidth?: boolean
  }[] = useMemo(() => {
    if (!selectedUser) return []
    return [
      {
        label: 'Full Name',
        value: `${selectedUser.first_name} ${selectedUser.last_name}`.trim(),
      },
      {
        label: "Father's Name",
        value: selectedUser.father_name || '-',
      },
      {
        label: 'Email',
        value: selectedUser.email,
        valueClassName: 'break-words',
      },
      {
        label: 'Phone',
        value: selectedUser.phone || '-',
      },
      {
        label: 'Position',
        value: selectedUser.role?.name || '-',
      },
      {
        label: 'Duration',
        value: selectedUser.tenure?.label || '-',
      },
      {
        label: 'College / University',
        value: selectedUser.college_name || '-',
      },
      {
        label: 'Address',
        value: selectedUser.address || '-',
        fullWidth: true,
        valueClassName: 'whitespace-pre-wrap',
      },
    ];
  }, [selectedUser]);

  const documentItems: { label: string; url: string | null | undefined }[] = useMemo(() => {
    if (!selectedUser) return []
    return [
      { label: 'Photo', url: selectedUser.photo_url },
      { label: 'Aadhar Front', url: selectedUser.aadhar_front_url },
      { label: 'Aadhar Back', url: selectedUser.aadhar_back_url },
      { label: 'College ID', url: selectedUser.college_id_url },
      { label: '12th Marksheet', url: selectedUser.marksheet_12th_url },
    ];
  }, [selectedUser]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Application Management</h2>
          <p className="text-slate-500 font-light">Review and process Uplern candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-teal-900/10 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-full pl-10 appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="offer_generated">Offer Generated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grouped by Month/Year */}
      <div className="bg-white border border-teal-900/10 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {Object.keys(groupedUsers).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
              <div key={year} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 px-2">{year}</h3>
                {Object.keys(groupedUsers[year]).map(month => {
                  const groupKey = `${year}-${month}`
                  const isExpanded = expandedGroups.has(groupKey)
                  const isCurrentMonth = year === currentYear && month === currentMonth
                  const monthUsers = groupedUsers[year][month]
                  const displayUsers = isExpanded ? monthUsers.slice(startIndex, endIndex) : []

                  return (
                    <div key={month} className="bg-white border border-teal-900/10 rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleGroup(year, month)}
                        className="w-full flex items-center justify-between p-4 bg-[#f8faf7] hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-[#0f766e]" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                          <h4 className="text-lg font-bold text-slate-800">
                            {month}
                            {isCurrentMonth && (
                               <span className="ml-2 text-xs bg-[#0f766e]/10 text-[#0f766e] px-2 py-1 rounded-full border border-[#0f766e]/20 font-medium">
                                Current
                              </span>
                            )}
                          </h4>
                        </div>
                        <span className="text-sm font-medium text-slate-500">
                          {monthUsers.length} {monthUsers.length === 1 ? 'applicant' : 'applicants'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="overflow-x-auto">
                          <table className="professional-table w-full">
                            <thead>
                              <tr>
                                <th className="text-left">Candidate</th>
                                <th className="text-left">Position</th>
                                <th className="text-left hidden md:table-cell">Duration</th>
                                <th className="text-left">Status</th>
                                <th className="text-left hidden sm:table-cell">Applied</th>
                                <th className="text-left">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-[#f8faf7] transition-colors">
                                  <td>
                                    <div>
                                      <div className="font-semibold text-slate-900">
                                        {user.first_name} {user.last_name}
                                      </div>
                                      <div className="text-sm text-slate-500">{user.email}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="text-slate-700 font-medium">
                                      {user.role?.name || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="hidden md:table-cell">
                                    <span className="text-slate-600">
                                      {user.tenure?.label || 'N/A'}
                                    </span>
                                  </td>
                                  <td>{getStatusBadge(user.status)}</td>
                                  <td className="hidden sm:table-cell">
                                    <span className="text-slate-500 text-sm">
                                      {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => setSelectedUser(user)}
                                        className="p-2 text-slate-400 hover:text-[#0f766e] transition-colors rounded-lg hover:bg-[#0f766e]/5"
                                        title="View Details"
                                      >
                                        <Eye className="w-5 h-5" />
                                      </button>
                                      {user.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => updateUserStatus(user.id, 'approved')}
                                            className="p-2 text-slate-400 hover:text-green-500 transition-colors rounded-lg hover:bg-green-50 hidden sm:inline-block"
                                            title="Approve"
                                          >
                                            <CheckCircle className="w-5 h-5" />
                                          </button>
                                          <button
                                            onClick={() => updateUserStatus(user.id, 'rejected')}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 hidden sm:inline-block"
                                            title="Reject"
                                          >
                                            <XCircle className="w-5 h-5" />
                                          </button>
                                        </>
                                      )}
                                      {user.status === 'approved' && (
                                        <button
                                          onClick={() => generateOffer(user.id)}
                                          className="p-2 text-slate-400 hover:text-[#0f766e] transition-colors rounded-lg hover:bg-[#0f766e]/5 hidden sm:inline-block"
                                          title="Generate Offer"
                                        >
                                          <FileDown className="w-5 h-5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {monthUsers.length > pageSize && (
                            <div className="p-4 border-t border-teal-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-slate-500">
                                  Showing <span className="text-slate-900 font-semibold">{startIndex + 1}</span> to{' '}
                                  <span className="text-slate-900 font-semibold">{Math.min(endIndex, monthUsers.length)}</span> of{' '}
                                  <span className="text-slate-900 font-semibold">{monthUsers.length} results</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-500">Show:</label>
                                    <select
                                      value={pageSize}
                                      onChange={(e) => {
                                        setPageSize(Number(e.target.value))
                                        setCurrentPage(1)
                                      }}
                                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#0f766e] focus:outline-none"
                                    >
                                      <option value={10}>10</option>
                                      <option value={25}>25</option>
                                      <option value={50}>50</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                      disabled={currentPage === 1}
                                      className="p-1 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-sm font-medium"
                                    >
                                      Previous
                                    </button>
                                    <button
                                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(monthUsers.length / pageSize), prev + 1))}
                                      disabled={currentPage === Math.ceil(monthUsers.length / pageSize)}
                                      className="p-1 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-sm font-medium"
                                    >
                                      Next
                                    </button>
                                  </div>
                                </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 font-light italic">No applications found matches your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div
            className="bg-white w-full max-w-5xl mx-4 md:mx-auto my-8 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-teal-900/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md flex items-center justify-between p-4 sm:p-6 border-b border-teal-900/10 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Application Review</h3>
                <p className="text-sm text-slate-500">{selectedUser.first_name}&apos;s profile</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-[#0f766e] hover:bg-slate-50 rounded-xl transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-8 space-y-10">
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-teal-900/10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Status</p>
                      <div className="mt-0.5">{getStatusBadge(selectedUser.status)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Submission Date</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(selectedUser.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {detailItems.map((item) => (
                    <div
                      key={item.label}
                      className={`space-y-1.5 ${item.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                        {item.label}
                      </p>
                      <div className="bg-[#f8faf7] border border-teal-900/10 rounded-xl p-4 shadow-sm">
                        <p className={`text-slate-900 font-semibold leading-relaxed ${item.valueClassName || ''}`}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-[#0f766e]" />
                  <h4 className="text-lg font-bold text-slate-900">Verification Documents</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documentItems.map(({ label, url }) => (
                    <div
                      key={label}
                      className="group bg-white border border-teal-900/10 rounded-xl p-4 shadow-sm hover:border-[#0f766e]/30 transition-all"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        {label}
                      </p>
                      {url ? (
                        <div className="space-y-3">
                          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-teal-900/10 shadow-inner group-hover:shadow-md transition-shadow">
                            <Image
                              src={url}
                              alt={label}
                              fill
                              sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 80vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                              onClick={() => window.open(url, '_blank')}
                            />
                          </div>
                          <button
                            onClick={() => window.open(url, '_blank')}
                            className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-[#0f766e] bg-[#0f766e]/5 py-2.5 rounded-xl hover:bg-[#0f766e] hover:text-white transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Preview Full Image</span>
                          </button>
                        </div>
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-300 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                           <AlertCircle className="w-6 h-6 mb-2 opacity-20" />
                          <span className="text-xs">No file uploaded</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-6 border-t border-teal-900/10">
                <div className="flex flex-col sm:flex-row gap-4">
                  {selectedUser.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateUserStatus(selectedUser.id, 'approved')}
                        className="btn-primary flex-1 py-4 flex items-center justify-center space-x-3"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-lg">Approve Application</span>
                      </button>
                      <button
                        onClick={() => updateUserStatus(selectedUser.id, 'rejected')}
                        className="flex-1 py-4 border-2 border-teal-900/10 text-slate-400 font-bold rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center space-x-3"
                      >
                        <XCircle className="w-5 h-5" />
                        <span className="text-lg">Reject</span>
                      </button>
                    </>
                  )}

                  {selectedUser.status === 'approved' && (
                    <button
                      onClick={() => generateOffer(selectedUser.id)}
                      className="btn-primary w-full py-4 flex items-center justify-center space-x-3 shadow-xl shadow-[#0f766e]/20 animate-pulse"
                    >
                      <FileDown className="w-6 h-6" />
                      <span className="text-lg">Generate & Download Offer Letter</span>
                    </button>
                  )}

                  {selectedUser.status === 'offer_generated' && (
                    <button
                      onClick={() => generateOffer(selectedUser.id)}
                      className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl flex items-center justify-center space-x-3 hover:bg-slate-200 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span className="text-lg">Regenerate Offer Letter</span>
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
