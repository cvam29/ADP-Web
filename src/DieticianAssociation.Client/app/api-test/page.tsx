"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDieticianAssociationAPI } from "@/services/generated"
// Using direct generated client instead of deprecated '@/lib/services'
const api = getDieticianAssociationAPI()

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [networkLogs, setNetworkLogs] = useState<any[]>([])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5258/api'

  const logNetworkCall = (apiName: string, url: string, method: string, status?: string) => {
    const log = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID to avoid hydration issues
      apiName,
      url,
      method,
      status,
      timestamp: new Date().toISOString(),
    }
    setNetworkLogs(prev => [log, ...prev.slice(0, 9)]) // Keep last 10 logs
  }

  const testDirectApiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    const apiName = endpoint.split('/').pop() || endpoint
    setLoading(true)
    
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    try {
      //console.log(`🔍 Making direct API call to: ${url}`)
      logNetworkCall(apiName, url, method, 'pending')
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) })
      })
      
      //console.log(`📡 Response received: ${response.status}`)
      logNetworkCall(apiName, url, method, `${response.status}`)
      
      let data
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }
      
      setResults((prev: any) => ({ 
        ...prev, 
        [apiName]: { 
          data, 
          status: response.ok ? 'success' : 'error',
          httpStatus: response.status,
          url,
          method,
          timestamp: new Date().toISOString()
        } 
      }))
    } catch (error: any) {
      console.error(`❌ API call failed:`, error)
      logNetworkCall(apiName, url, method, 'error')
      setResults((prev: any) => ({ 
        ...prev, 
        [apiName]: { 
          error: error.message, 
          status: 'error',
          url,
          method,
          timestamp: new Date().toISOString()
        } 
      }))
    }
    setLoading(false)
  }

  const testApi = async (apiName: string, apiCall: () => Promise<any>) => {
    setLoading(true)
    try {
      //console.log(`🔍 Testing ${apiName} API...`)
      const data = await apiCall()
      setResults((prev: any) => ({ ...prev, [apiName]: { data, status: 'success' } }))
    } catch (error: any) {
      console.error(`❌ ${apiName} API failed:`, error)
      setResults((prev: any) => ({ ...prev, [apiName]: { error: error.message, status: 'error' } }))
    }
    setLoading(false)
  }

  const runAllTests = async () => {
    await testApi('health', async () => (await api.getApiHealth()).data)
    await testApi('blog', async () => (await api.postApiBlogPaginated({ page: 1, pageSize: 10 })).data)
    await testApi('events', async () => (await api.postApiEventsPaginated({ page: 1, pageSize: 10 })).data)
    await testApi('resources', async () => (await api.postApiResourcesPaginated({ page: 1, pageSize: 10 })).data)
  }

  const runDirectApiTests = async () => {
    //console.log('🎯 Running direct API calls for network monitoring...')
    await testDirectApiCall('/health', 'GET')
    await testDirectApiCall('/auth/register', 'POST', {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User'
    })
    await testDirectApiCall('/blog', 'GET')
    await testDirectApiCall('/events', 'GET')
    await testDirectApiCall('http://localhost:8108/health', 'GET')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🔍 API Network Testing Dashboard</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 Network Monitoring Instructions:</h2>
          <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
            <li><strong>Open Developer Tools:</strong> Press F12 or right-click → &ldquo;Inspect&rdquo;</li>
            <li><strong>Go to Network Tab:</strong> Click the &ldquo;Network&rdquo; tab in DevTools</li>
            <li><strong>Clear existing requests:</strong> Click the clear button (🗑️) in Network tab</li>
            <li><strong>Run API tests:</strong> Click buttons below and watch the network requests appear!</li>
            <li><strong>Filter by XHR/Fetch:</strong> Use filters to see only API calls</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button onClick={runDirectApiTests} disabled={loading} className="h-12">
            {loading ? '🔄 Testing...' : '🎯 Direct API Tests (Best for Network Monitoring)'}
          </Button>
          <Button onClick={runAllTests} disabled={loading} variant="outline" className="h-12">
            {loading ? '🔄 Testing...' : '📦 Service Layer Tests'}
          </Button>
        </div>
      </div>

      {/* Network Logs Section */}
      {networkLogs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🌐 Recent Network Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {networkLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  <Badge variant={log.status === 'error' ? 'destructive' : log.status?.startsWith('2') ? 'default' : 'secondary'}>
                    {log.method}
                  </Badge>
                  <span className="flex-1 font-mono text-xs">{log.url}</span>
                  <span className="text-gray-500">{log.status}</span>
                  <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(results).map(([apiName, result]: [string, any]) => (
          <Card key={apiName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {apiName.toUpperCase()} API
                <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                  {result.status}
                </Badge>
                {result.httpStatus && (
                  <Badge variant="outline">
                    {result.httpStatus}
                  </Badge>
                )}
              </CardTitle>
              {result.url && (
                <p className="text-sm text-gray-500 font-mono">{result.method} {result.url}</p>
              )}
              {result.timestamp && (
                <p className="text-xs text-gray-400">Called at: {new Date(result.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              )}
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-48">
                {result.error ? result.error : JSON.stringify(result.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Endpoints Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📡 Available API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Backend API ({API_BASE_URL}):</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• GET /health - Health check</li>
                <li>• POST /auth/register - User registration</li>
                <li>• POST /auth/login - User login</li>
                <li>• GET /blog - Get blog posts</li>
                <li>• GET /events - Get events</li>
                <li>• GET /resources - Get resources</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
