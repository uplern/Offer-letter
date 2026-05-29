'use client'

import { useState, useEffect } from 'react'
import { supabase, Role, Tenure } from '@/lib/supabase'
import { Briefcase, Clock, Plus, Trash2, Edit } from 'lucide-react'

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [tenures, setTenures] = useState<Tenure[]>([])
  const [loading, setLoading] = useState(true)

  const addRole = async () => {
    const name = prompt('Enter role name:')
    const code = prompt('Enter role code (e.g., HR, BD):')
    if (name && code) {
      try {
        const { data, error } = await supabase
          .from('roles')
          .insert([{
            name,
            code: code.toUpperCase(),
            description: `${name} role`
          }])
          .select()
          .single()

        if (error) throw error

        setRoles([...roles, data])
        alert('Role added successfully!')
      } catch (error) {
        console.error('Error adding role:', error)
        alert('Failed to add role. Please try again.')
      }
    }
  }

  const deleteRole = async (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        const { error } = await supabase
          .from('roles')
          .delete()
          .eq('id', id)

        if (error) throw error

        setRoles(roles.filter(r => r.id !== id))
        alert('Role deleted successfully!')
      } catch (error) {
        console.error('Error deleting role:', error)
        alert('Failed to delete role. Please try again.')
      }
    }
  }

  const addTenure = async () => {
    const label = prompt('Enter tenure label (e.g., "3 Months"):')
    const monthsStr = prompt('Enter number of months:')
    if (label && monthsStr) {
      const months = parseInt(monthsStr)
      if (isNaN(months) || months <= 0) {
        alert('Please enter a valid number of months')
        return
      }
      try {
        const { data, error } = await supabase
          .from('tenures')
          .insert([{
            label,
            months
          }])
          .select()
          .single()

        if (error) throw error

        setTenures([...tenures, data])
        alert('Tenure added successfully!')
      } catch (error) {
        console.error('Error adding tenure:', error)
        alert('Failed to add tenure. Please try again.')
      }
    }
  }

  const deleteTenure = async (id: string) => {
    if (confirm('Are you sure you want to delete this tenure?')) {
      try {
        const { error } = await supabase
          .from('tenures')
          .delete()
          .eq('id', id)

        if (error) throw error

        setTenures(tenures.filter(t => t.id !== id))
        alert('Tenure deleted successfully!')
      } catch (error) {
        console.error('Error deleting tenure:', error)
        alert('Failed to delete tenure. Please try again.')
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('Fetching roles and tenures...')
      const [rolesResponse, tenuresResponse] = await Promise.all([
        supabase.from('roles').select('*').order('name'),
        supabase.from('tenures').select('*').order('months')
      ])

      console.log('Roles response:', rolesResponse)
      console.log('Tenures response:', tenuresResponse)

      if (rolesResponse.error) {
        console.error('Roles error:', rolesResponse.error)
      } else {
        setRoles(rolesResponse.data || [])
      }

      if (tenuresResponse.error) {
        console.error('Tenures error:', tenuresResponse.error)
      } else {
        setTenures(tenuresResponse.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setRoles([])
      setTenures([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-50">Roles & Tenures Management</h2>
        <p className="text-slate-400">Manage available positions and duration options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-50 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-teal-500" />
              Roles
            </h3>
            <button 
              onClick={addRole}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Role</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-200">{role.name}</div>
                    <div className="text-sm text-slate-400">Code: {role.code}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">
                      {new Date(role.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {roles.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No roles configured
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tenures Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-50 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-teal-500" />
              Tenures
            </h3>
            <button 
              onClick={addTenure}
              className="btn-secondary flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tenure</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {tenures.map((tenure) => (
                <div key={tenure.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-200">{tenure.label}</div>
                    <div className="text-sm text-slate-400">{tenure.months} months</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">
                      {new Date(tenure.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteTenure(tenure.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Tenure"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {tenures.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No tenures configured
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
