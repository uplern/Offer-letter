'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  FileText,
  Briefcase,
  Clock,
  LogOut,
  Settings,
  TrendingUp,
  UserCheck,
  FileCheck,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import UserManagement from './UserManagement'
import TemplateManagement from './TemplateManagement'
import RoleManagement from './RoleManagement'
import SimpleDbTest from './SimpleDbTest'

interface AdminDashboardProps {
  admin?: any
  onLogout?: () => void
}

interface Stats {
  total_users: number
  total_templates: number
  total_offers: number
  pending_users: number
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_templates: 0,
    total_offers: 0,
    pending_users: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersCount, templatesCount, offersCount, pendingCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('templates').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('offer_letters').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        total_users: usersCount.count || 0,
        total_templates: templatesCount.count || 0,
        total_offers: offersCount.count || 0,
        pending_users: pendingCount.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set demo stats if database not available
      setStats({
        total_users: 25,
        total_templates: 7,
        total_offers: 18,
        pending_users: 7
      })
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />
      case 'templates':
        return <TemplateManagement />
      case 'roles':
        return <RoleManagement />
      default:
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-teal-900/10 rounded-xl p-6 shadow-sm text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#f59e0b]/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#f59e0b]" />
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-sm font-medium">Applications</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total_users}</p>
                  </div>
                </div>
                <div className="flex items-center text-slate-400 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span>Candidates database</span>
                </div>
              </div>

              <div className="bg-white border border-teal-900/10 rounded-xl p-6 shadow-sm text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#0f766e]/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#0f766e]" />
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-sm font-medium">Templates</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total_templates}</p>
                  </div>
                </div>
                <div className="flex items-center text-slate-400 text-xs">
                  <FileCheck className="w-3 h-3 mr-1 text-[#0f766e]" />
                  <span>Offer letter layouts</span>
                </div>
              </div>

              <div className="bg-white border border-teal-900/10 rounded-xl p-6 shadow-sm text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-teal-700" />
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-sm font-medium">Generated</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total_offers}</p>
                  </div>
                </div>
                <div className="flex items-center text-slate-400 text-xs">
                  <UserCheck className="w-3 h-3 mr-1 text-teal-600" />
                  <span>Sent offer letters</span>
                </div>
              </div>

              <div className="bg-white border border-teal-900/10 rounded-xl p-6 shadow-sm text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.pending_users}</p>
                  </div>
                </div>
                <div className="flex items-center text-slate-400 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
                  <span>Awaiting review</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-teal-900/10 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveTab('users')}
                  className="group bg-[#f8faf7] border border-teal-900/10 p-6 rounded-xl text-left hover:border-[#0f766e]/30 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-[#f59e0b]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Applications</h4>
                  <p className="text-sm text-slate-500">Review and process candidate applications</p>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  className="group bg-[#f8faf7] border border-teal-900/10 p-6 rounded-xl text-left hover:border-[#0f766e]/30 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-[#0f766e]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-[#0f766e]" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Offer Templates</h4>
                  <p className="text-sm text-slate-500">Manage letter layouts and content</p>
                </button>

                <button
                  onClick={() => setActiveTab('roles')}
                  className="group bg-[#f8faf7] border border-teal-900/10 p-6 rounded-xl text-left hover:border-[#0f766e]/30 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="w-5 h-5 text-teal-700" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Company Setup</h4>
                  <p className="text-sm text-slate-500">Configure roles, tenures, and settings</p>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-teal-900/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="Uplern Logo"
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Uplern Management</h1>
              <p className="text-sm text-slate-400">Welcome back, {admin.name || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-[#f8faf7] border-b border-teal-900/10 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'users', label: 'Applications', icon: Users },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'roles', label: 'Setup', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id
                    ? 'border-[#0f766e] text-[#0f766e] bg-white'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  )
}
