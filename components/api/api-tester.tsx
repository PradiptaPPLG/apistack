'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn, getMethodColor } from '@/lib/utils'
import { Play, Copy, CheckCheck, Loader2, AlertCircle } from 'lucide-react'
import type { ApiEndpoint } from '@/lib/supabase/database.types'

interface ApiTesterProps {
  endpoints: ApiEndpoint[]
  baseUrl: string
  authType: string
  authHeader: string | null
}

export function ApiTester({ endpoints, baseUrl, authType, authHeader }: ApiTesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(
    endpoints[0] ?? null
  )
  const [apiKey, setApiKey] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [status, setStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function sendRequest() {
    if (!selectedEndpoint) return
    setLoading(true)
    setError(null)
    setResponse(null)
    setStatus(null)

    try {
      const url = `${baseUrl}${selectedEndpoint.path}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authType !== 'none' && apiKey && authHeader) {
        headers[authHeader] = authType === 'bearer' ? `Bearer ${apiKey}` : apiKey
      }

      const proxyBody = {
        url,
        method: selectedEndpoint.method,
        headers,
        requestBody: ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBody ? requestBody : undefined
      }

      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyBody),
      })
      
      const result = await res.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setStatus(result.status)
      
      if (typeof result.data === 'string') {
        setResponse(result.data)
      } else {
        setResponse(JSON.stringify(result.data, null, 2))
      }
    } catch (err: any) {
      setError(err.message ?? 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function copyResponse() {
    if (response) {
      await navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (endpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <p className="text-sm text-[var(--muted-foreground)]">No endpoints defined for this API.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Endpoint list */}
      <div className="lg:w-64 xl:w-72 flex-shrink-0">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
            <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Endpoints
            </h3>
          </div>
          <div className="p-2 space-y-0.5">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                id={`endpoint-${ep.id}`}
                onClick={() => {
                  setSelectedEndpoint(ep)
                  setResponse(null)
                  setStatus(null)
                  setError(null)
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all',
                  selectedEndpoint?.id === ep.id
                    ? 'bg-[var(--accent-muted)] border border-[rgba(124,58,237,0.2)]'
                    : 'hover:bg-[var(--surface-raised)]'
                )}
              >
                <span className={cn(
                  'text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border flex-shrink-0',
                  getMethodColor(ep.method)
                )}>
                  {ep.method}
                </span>
                <span className={cn(
                  'text-xs font-mono truncate',
                  selectedEndpoint?.id === ep.id
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--foreground)]'
                )}>
                  {ep.path}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tester panel */}
      {selectedEndpoint && (
        <div className="flex-1 space-y-4">
          {/* Request */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
              <span className={cn(
                'text-xs font-bold font-mono px-2 py-0.5 rounded border',
                getMethodColor(selectedEndpoint.method)
              )}>
                {selectedEndpoint.method}
              </span>
              <span className="text-sm font-mono text-[var(--foreground)] truncate flex-1">
                {baseUrl}{selectedEndpoint.path}
              </span>
              <Button
                id="send-request-btn"
                size="sm"
                onClick={sendRequest}
                loading={loading}
                className="gap-1.5 flex-shrink-0"
              >
                <Play size={12} />
                Send
              </Button>
            </div>

            <div className="p-4 space-y-3">
              {selectedEndpoint.summary && (
                <p className="text-xs text-[var(--muted-foreground)]">{selectedEndpoint.summary}</p>
              )}

              {/* Auth */}
              {authType !== 'none' && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
                    {authHeader ?? 'Authorization'}
                  </label>
                  <Input
                    id="api-key-input"
                    type="password"
                    placeholder={authType === 'bearer' ? 'Your bearer token' : 'Your API key'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              )}

              {/* Body */}
              {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
                    Request Body (JSON)
                  </label>
                  <Textarea
                    id="request-body-input"
                    placeholder={
                      selectedEndpoint.request_body
                        ? JSON.stringify(selectedEndpoint.request_body, null, 2)
                        : '{\n  "key": "value"\n}'
                    }
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          {(response || error || loading) && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-[var(--muted-foreground)]">Response</h3>
                  {status !== null && (
                    <span className={cn(
                      'text-xs font-mono font-bold px-2 py-0.5 rounded-full border',
                      status >= 200 && status < 300
                        ? 'bg-[rgba(34,197,94,0.1)] text-[#4ade80] border-[rgba(34,197,94,0.2)]'
                        : 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border-[rgba(239,68,68,0.2)]'
                    )}>
                      {status}
                    </span>
                  )}
                </div>
                {response && (
                  <Button variant="ghost" size="icon-sm" onClick={copyResponse} className="h-7 w-7">
                    {copied ? <CheckCheck size={13} className="text-[#4ade80]" /> : <Copy size={13} />}
                  </Button>
                )}
              </div>

              <div className="p-4">
                {loading && (
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs py-4">
                    <Loader2 size={14} className="animate-spin" />
                    Sending request...
                  </div>
                )}
                {error && (
                  <div className="flex items-start gap-2 text-[#f87171] text-xs">
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {response && (
                  <pre className="text-xs font-mono text-[var(--foreground)] leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-96">
                    {response}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Response example */}
          {selectedEndpoint.response_example && !response && !loading && !error && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
                <h3 className="text-xs font-semibold text-[var(--muted-foreground)]">Example Response</h3>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono text-[var(--muted-foreground)] leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedEndpoint.response_example, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
