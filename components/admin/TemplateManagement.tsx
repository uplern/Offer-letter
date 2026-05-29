'use client'

import { useState, useEffect } from 'react'
import { hybridFetch } from '@/lib/supabase-hybrid'
import { supabase } from '@/lib/supabase'
import { ROLE_TENURE_MAPPING, getTemplateCode } from '@/lib/role-tenure-mapping'
import { FileText, Upload, Download, Trash2, Plus } from 'lucide-react'

interface Template {
  id: string
  title: string
  filename: string
  type: string
  active: boolean
  created_at: string
}

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      console.log('🔍 Fetching templates with hybrid approach...')
      
      // Use hybrid fetch to get around RLS issues
      const { data, error } = await hybridFetch('templates', '*')

      console.log('📊 Hybrid templates response:', { data: data?.length || 0, error: error?.message })

      if (error) {
        console.error('❌ Hybrid templates error:', error)
        // Fallback to empty array but don't throw
        setTemplates([])
      } else {
        setTemplates(data || [])
        console.log('✅ Templates set via hybrid:', data?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Remove from local state after successful database deletion
      setTemplates(templates.filter(t => t.id !== id))
      alert('Template deleted successfully!')
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template. Please try again.')
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.docx')) {
      alert('Please upload a DOCX file only')
      return
    }

    setUploading(true)
    try {
      // Insert template into database
      const { data, error } = await supabase
        .from('templates')
        .insert([{
          title: file.name.replace('.docx', ''),
          filename: file.name,
          type: 'docx',
          active: true
        }])
        .select()
        .single()

      if (error) throw error

      // Add to local state after successful database insertion
      setTemplates([data, ...templates])
      setShowUploadModal(false)
      alert('Template uploaded successfully!')
    } catch (error) {
      console.error('Error uploading template:', error)
      alert('Failed to upload template. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const toggleTemplateStatus = async (id: string) => {
    try {
      const template = templates.find(t => t.id === id)
      if (!template) return

      const newStatus = !template.active
      
      // Update in database
      const { error } = await supabase
        .from('templates')
        .update({ active: newStatus })
        .eq('id', id)

      if (error) throw error

      // Update local state after successful database update
      setTemplates(templates.map(t => 
        t.id === id ? { ...t, active: newStatus } : t
      ))
      
      alert(`Template ${newStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error updating template status:', error)
      alert('Failed to update template status. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Template Management</h2>
          <p className="text-slate-400">Manage DOCX offer letter templates</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Template</span>
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="professional-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-teal-500" />
                        <span className="text-slate-200">{template.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        DOCX
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer hover:opacity-80 ${
                          template.active 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                        }`}
                      >
                        {template.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <span className="text-slate-400">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {templates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No templates found</p>
                <p className="text-slate-500 text-sm">Upload your first DOCX template to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-50">Upload Template</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  Select DOCX Template
                </label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700 transition-colors disabled:opacity-50"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Upload DOCX files with {`{{Name}}`} and {`{{Date}}`} placeholders
                </p>
              </div>
              
              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-slate-400">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
