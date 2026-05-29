'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleDbTest() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('')

    try {
      console.log('Testing Supabase connection...')

      // First test basic connectivity
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      setResult(`🔍 Testing connection to: ${supabaseUrl}`)

      // Test 1: Simple query with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      )

      const rolesPromise = supabase.from('roles').select('*')

      const { data: roles, error: rolesError } = await Promise.race([
        rolesPromise,
        timeoutPromise
      ]) as any

      if (rolesError) {
        setResult(`❌ Roles Error: ${rolesError.message}\n\nFull error: ${JSON.stringify(rolesError, null, 2)}`)
        console.error('Roles error:', rolesError)
        return
      }

      const { data: tenures, error: tenuresError } = await supabase
        .from('tenures')
        .select('*')

      if (tenuresError) {
        setResult(`❌ Tenures Error: ${tenuresError.message}`)
        console.error('Tenures error:', tenuresError)
        return
      }

      const { data: templates, error: templatesError } = await supabase
        .from('templates')
        .select('*')

      if (templatesError) {
        setResult(`❌ Templates Error: ${templatesError.message}`)
        console.error('Templates error:', templatesError)
        return
      }

      setResult(`✅ Connection Success!
📊 Data Found:
- Roles: ${roles?.length || 0}
- Tenures: ${tenures?.length || 0} 
- Templates: ${templates?.length || 0}

🔍 Roles Data: ${JSON.stringify(roles, null, 2)}
🔍 Tenures Data: ${JSON.stringify(tenures, null, 2)}`)

    } catch (error: any) {
      setResult(`❌ Connection Failed: ${error.message}`)
      console.error('Connection error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-slate-800/50 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Database Connection Test</h3>

      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test DB Connection'}
      </button>

      {result && (
        <pre className="mt-4 p-4 bg-slate-900/50 rounded text-sm text-green-400 whitespace-pre-wrap overflow-auto max-h-96">
          {result}
        </pre>
      )}
    </div>
  )
}
