'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { API_CATEGORIES, AUTH_TYPES, slugify, HTTP_METHODS } from '@/lib/utils'
import {
  Plus, X, Trash2, ChevronDown, ChevronUp,
  Globe, Lock, AlertCircle, CheckCircle2, Zap
} from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type ApiInsert = Database['public']['Tables']['apis']['Insert']
type EndpointInsert = Omit<Database['public']['Tables']['api_endpoints']['Insert'], 'api_id'>

interface EndpointForm extends EndpointInsert {
  tempId: string
  expanded: boolean
}

interface ApiFormProps {
  userId: string
  initialData?: any
  mode: 'create' | 'edit'
}

export function ApiForm({ userId, initialData, mode }: ApiFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [longDescription, setLongDescription] = useState(initialData?.long_description ?? '')
  const [category, setCategory] = useState(initialData?.category ?? API_CATEGORIES[0])
  const [baseUrl, setBaseUrl] = useState(initialData?.base_url ?? '')
  const [authType, setAuthType] = useState<string>(initialData?.auth_type ?? 'none')
  const [authHeader, setAuthHeader] = useState(initialData?.auth_header ?? '')
  const [version, setVersion] = useState(initialData?.version ?? '1.0.0')
  const [documentationUrl, setDocumentationUrl] = useState(initialData?.documentation_url ?? '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [endpoints, setEndpoints] = useState<EndpointForm[]>(
    initialData?.api_endpoints?.map((e: any) => ({
      ...e,
      tempId: e.id,
      expanded: false,
    })) ?? []
  )

  function handleNameChange(value: string) {
    setName(value)
    if (mode === 'create') {
      setSlug(slugify(value))
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  function addEndpoint() {
    setEndpoints([
      ...endpoints,
      {
        tempId: Math.random().toString(36).slice(2),
        method: 'GET',
        path: '/',
        summary: '',
        description: null,
        request_body: null,
        response_example: null,
        parameters: null,
        expanded: true,
      },
    ])
  }

  function removeEndpoint(tempId: string) {
    setEndpoints(endpoints.filter((e) => e.tempId !== tempId))
  }

  function updateEndpoint(tempId: string, field: string, value: any) {
    setEndpoints(
      endpoints.map((e) =>
        e.tempId === tempId ? { ...e, [field]: value } : e
      )
    )
  }

  function toggleEndpoint(tempId: string) {
    setEndpoints(
      endpoints.map((e) =>
        e.tempId === tempId ? { ...e, expanded: !e.expanded } : e
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const apiData: ApiInsert = {
        owner_id: userId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        long_description: longDescription.trim() || null,
        category,
        tags,
        base_url: baseUrl.trim(),
        auth_type: authType as any,
        auth_header: authHeader.trim() || null,
        version: version.trim(),
        documentation_url: documentationUrl.trim() || null,
        is_public: isPublic,
        endpoint_count: endpoints.length,
        updated_at: new Date().toISOString(),
      }

      let apiId: string

      if (mode === 'create') {
        const { data, error: insertError } = await supabase
          .from('apis')
          .insert(apiData)
          .select('id')
          .single()

        if (insertError) throw insertError
        apiId = data.id
      } else {
        const { error: updateError } = await supabase
          .from('apis')
          .update(apiData)
          .eq('id', initialData.id)
          .eq('owner_id', userId)

        if (updateError) throw updateError
        apiId = initialData.id

        // Delete existing endpoints and re-insert
        await supabase.from('api_endpoints').delete().eq('api_id', apiId)
      }

      // Insert endpoints
      if (endpoints.length > 0) {
        const endpointsToInsert = endpoints.map(({ tempId, expanded, ...ep }) => ({
          ...ep,
          api_id: apiId,
        }))
        const { error: epError } = await supabase
          .from('api_endpoints')
          .insert(endpointsToInsert)
        if (epError) throw epError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/apis/${slug.trim()}`)
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] px-3.5 py-3">
          <AlertCircle size={15} className="text-[#f87171] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#f87171]">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-lg border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] px-3.5 py-3">
          <CheckCircle2 size={15} className="text-[#4ade80]" />
          <p className="text-sm text-[#4ade80]">API {mode === 'create' ? 'created' : 'updated'} successfully! Redirecting...</p>
        </div>
      )}

      {/* Section: Basic Info */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Basic Information</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-name">
                API Name *
              </label>
              <Input
                id="api-name"
                placeholder="My Awesome API"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-slug">
                Slug *
              </label>
              <Input
                id="api-slug"
                placeholder="my-awesome-api"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                required
                className="font-mono text-xs"
              />
              <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                URL: /apis/{slug || 'your-slug'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-description">
              Short Description
            </label>
            <Input
              id="api-description"
              placeholder="A brief one-line description of your API"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-long-description">
              Full Documentation
            </label>
            <Textarea
              id="api-long-description"
              placeholder="Detailed description, usage instructions, examples..."
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-category">
                Category *
              </label>
              <Select
                id="api-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {API_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-version">
                Version
              </label>
              <Input
                id="api-version"
                placeholder="1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Visibility
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border h-9 text-xs font-medium transition-all ${isPublic ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[rgba(255,255,255,0.1)]'}`}
                >
                  <Globe size={12} />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border h-9 text-xs font-medium transition-all ${!isPublic ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[rgba(255,255,255,0.1)]'}`}
                >
                  <Lock size={12} />
                  Private
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag() }
                  if (e.key === ',') { e.preventDefault(); addTag() }
                }}
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="md" onClick={addTag} disabled={tags.length >= 8}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--foreground)]"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-[var(--muted-foreground)] hover:text-[#f87171] transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section: Technical */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Technical Details</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-base-url">
              Base URL *
            </label>
            <Input
              id="api-base-url"
              placeholder="https://api.example.com/v1"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
              className="font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-auth-type">
                Authentication
              </label>
              <Select
                id="api-auth-type"
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
              >
                <option value="none">No Authentication</option>
                <option value="api_key">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="oauth2">OAuth 2.0</option>
              </Select>
            </div>
            {authType !== 'none' && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-auth-header">
                  Auth Header Name
                </label>
                <Input
                  id="api-auth-header"
                  placeholder={authType === 'api_key' ? 'X-API-Key' : 'Authorization'}
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5" htmlFor="api-docs-url">
              Documentation URL
            </label>
            <Input
              id="api-docs-url"
              placeholder="https://docs.example.com"
              value={documentationUrl}
              onChange={(e) => setDocumentationUrl(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Section: Endpoints */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-raised)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Endpoints</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} defined</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addEndpoint} className="gap-1.5">
            <Plus size={13} />
            Add Endpoint
          </Button>
        </div>

        <div className="p-5 space-y-3">
          {endpoints.length === 0 && (
            <p className="text-center py-8 text-xs text-[var(--muted-foreground)]">
              No endpoints yet. Click "Add Endpoint" to document your API routes.
            </p>
          )}

          {endpoints.map((ep) => (
            <div key={ep.tempId} className="rounded-lg border border-[var(--border)] overflow-hidden">
              {/* Endpoint header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface-raised)] cursor-pointer" onClick={() => toggleEndpoint(ep.tempId)}>
                <Select
                  value={ep.method}
                  onChange={(e) => updateEndpoint(ep.tempId, 'method', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={`h-7 w-24 text-xs font-mono font-semibold border-0 bg-transparent p-0 ${
                    ep.method === 'GET' ? 'text-[#4ade80]' :
                    ep.method === 'POST' ? 'text-[#60a5fa]' :
                    ep.method === 'PUT' ? 'text-[#fbbf24]' :
                    ep.method === 'PATCH' ? 'text-[#c084fc]' :
                    'text-[#f87171]'
                  }`}
                >
                  {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
                <Input
                  value={ep.path}
                  onChange={(e) => updateEndpoint(ep.tempId, 'path', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="/path"
                  className="flex-1 h-7 text-xs font-mono border-0 bg-transparent px-0 focus:ring-0"
                />
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeEndpoint(ep.tempId) }}
                    className="p-1 text-[var(--muted-foreground)] hover:text-[#f87171] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  {ep.expanded ? <ChevronUp size={14} className="text-[var(--muted-foreground)]" /> : <ChevronDown size={14} className="text-[var(--muted-foreground)]" />}
                </div>
              </div>

              {ep.expanded && (
                <div className="p-4 space-y-3 border-t border-[var(--border)]">
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">Summary</label>
                    <Input
                      placeholder="Brief description of this endpoint"
                      value={ep.summary ?? ''}
                      onChange={(e) => updateEndpoint(ep.tempId, 'summary', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">Response Example (JSON)</label>
                    <Textarea
                      placeholder='{"key": "value"}'
                      value={ep.response_example ? JSON.stringify(ep.response_example, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          updateEndpoint(ep.tempId, 'response_example', JSON.parse(e.target.value))
                        } catch {
                          // allow typing invalid JSON
                        }
                      }}
                      rows={4}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} size="lg" className="gap-2">
          <Zap size={15} />
          {mode === 'create' ? 'Publish API' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
