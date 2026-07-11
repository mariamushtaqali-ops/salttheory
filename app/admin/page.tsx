'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; published: boolean; created_at: string
}
interface User {
  id: string; email: string; first_name: string; tier: string; recipe_count: number; costing_count: number; created_at: string
}
interface Subscriber {
  email: string; source: string; created_at: string
}
interface AssetFile {
  name: string; size: number; created_at: string; url: string
}

type Tab = 'posts' | 'new-post' | 'users' | 'subscribers' | 'assets'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [assets, setAssets] = useState<AssetFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  // New post form
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) { router.push('/dashboard'); return }

      const [p, u, s] = await Promise.all([
        supabase.from('blog_posts').select('id,title,slug,excerpt,published,created_at').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id,email,first_name,tier,recipe_count,costing_count,created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('subscribers').select('email,source,created_at').order('created_at', { ascending: false }).limit(100),
      ])
      setPosts(p.data || [])
      setUsers(u.data || [])
      setSubscribers(s.data || [])
      setLoading(false)
    }
    load()
  }, [])

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handlePublish() {
    if (!title || !slug || !body) { toast.error('Title, slug and body are required'); return }
    setPublishing(true)
    try {
      const res = await fetch('/api/blog', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, title, slug, excerpt, body } : { title, slug, excerpt, body }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success(editingId ? 'Post updated' : 'Post published and newsletter sent!')
      setTitle(''); setSlug(''); setExcerpt(''); setBody(''); setEditingId(null)
      // Reload posts
      const { data } = await supabase.from('blog_posts').select('id,title,slug,excerpt,published,created_at').order('created_at', { ascending: false })
      setPosts(data || [])
      setTab('posts')
    } catch (e: any) {
      toast.error(e.message || 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  async function handleEditClick(postId: string) {
    const { data, error } = await supabase.from('blog_posts').select('id,title,slug,excerpt,body').eq('id', postId).single()
    if (error || !data) { toast.error('Could not load post'); return }
    setEditingId(data.id)
    setTitle(data.title)
    setSlug(data.slug)
    setExcerpt(data.excerpt || '')
    setBody(data.body)
    setTab('new-post')
  }

  function handleCancelForm() {
    setTitle(''); setSlug(''); setExcerpt(''); setBody(''); setEditingId(null)
    setTab('posts')
  }

  async function loadAssets() {
    try {
      const res = await fetch('/api/admin/assets')
      const data = await res.json()
      if (res.ok) setAssets(data.files || [])
    } catch {
      toast.error('Could not load assets')
    }
  }

  async function handleUploadAsset(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/assets', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      toast.success('Uploaded — link ready to copy')
      await loadAssets()
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleCopyLink(url: string) {
    navigator.clipboard.writeText(url)
    toast.success('Link copied')
  }

  async function handleDeleteAsset(name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone, and any links to it will break.`)) return
    try {
      const res = await fetch('/api/admin/assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Deleted')
      setAssets(prev => prev.filter(a => a.name !== name))
    } catch {
      toast.error('Delete failed')
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleUpgrade(userId: string) {
    const res = await fetch('/api/admin/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': 'SaltTheoryAdmin2026' },
      body: JSON.stringify({ userId, tier: 'pro' }),
    })
    if (res.ok) {
      toast.success('User upgraded to Pro')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: 'pro' } : u))
    } else {
      toast.error('Upgrade failed')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-muted text-[14px]">Loading admin...</p>
    </div>
  )

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'posts',       label: 'Blog posts',  count: posts.length },
    { id: 'new-post',    label: '+ New post' },
    { id: 'assets',      label: 'Assets',      count: assets.length },
    { id: 'users',       label: 'Users',       count: users.length },
    { id: 'subscribers', label: 'Subscribers', count: subscribers.length },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-light border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted mb-0.5">Salt Theory</p>
          <h1 className="font-serif text-[22px] text-ink">Admin Dashboard</h1>
        </div>
        <a href="/dashboard" className="text-[12px] text-muted hover:text-orange">← Back to app</a>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-light px-6 flex gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'assets') loadAssets() }}
            className={`px-4 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px
              ${tab === t.id
                ? 'border-orange text-orange'
                : 'border-transparent text-muted hover:text-ink'}`}>
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 text-[10px] bg-border rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-6">

        {/* BLOG POSTS */}
        {tab === 'posts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-[20px]">Blog posts</h2>
              <button onClick={() => setTab('new-post')}
                className="btn-primary px-4 py-2 text-[13px]">+ New post</button>
            </div>
            {posts.length === 0 ? (
              <div className="card border-dashed p-10 text-center">
                <p className="font-serif text-[18px] mb-2">No posts yet</p>
                <p className="text-[13px] text-muted mb-4">Write your first blog post — it will be published instantly and sent to your newsletter subscribers.</p>
                <button onClick={() => setTab('new-post')} className="btn-primary px-5 py-2.5 text-[13px]">Write first post</button>
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map(post => (
                  <div key={post.id} className="card p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">{post.title}</p>
                      <p className="text-[11px] text-muted mt-0.5">/journal/{post.slug} · {new Date(post.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                        ${post.published ? 'bg-green/10 text-green' : 'bg-border text-muted'}`}>
                        {post.published ? 'Live' : 'Draft'}
                      </span>
                      <a href={`/journal/${post.slug}`} target="_blank"
                        className="text-[12px] text-orange hover:underline">View →</a>
                      <button onClick={() => handleEditClick(post.id)}
                        className="text-[12px] text-muted hover:text-ink hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NEW POST */}
        {tab === 'new-post' && (
          <div>
            <h2 className="font-serif text-[20px] mb-4">{editingId ? 'Edit post' : 'Write a new post'}</h2>
            <p className="text-[13px] text-muted mb-5 leading-relaxed">
              {editingId
                ? 'Saving changes updates the live post. This will not re-send the newsletter.'
                : 'Posts are published instantly and automatically sent to all newsletter subscribers via Beehiiv.'}
            </p>
            <div className="space-y-3">
              <div className="card p-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-2">Title</label>
                  <input className="input text-[15px]" type="text"
                    placeholder="e.g. How to price your home food business in Pakistan"
                    value={title}
                    onChange={e => { setTitle(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)) }} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-2">
                    Slug <span className="font-normal normal-case tracking-normal text-muted">(URL — auto-generated)</span>
                  </label>
                  <input className="input font-mono text-[13px]" type="text"
                    placeholder="how-to-price-your-home-food-business"
                    value={slug} onChange={e => setSlug(e.target.value)} />
                  <p className="text-[11px] text-muted mt-1">salttheorylab.com/journal/{slug || 'your-post-slug'}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-2">
                    Excerpt <span className="font-normal normal-case tracking-normal text-muted">(shown on blog index)</span>
                  </label>
                  <input className="input" type="text"
                    placeholder="A short description of what this post is about"
                    value={excerpt} onChange={e => setExcerpt(e.target.value)} />
                </div>
              </div>

              <div className="card p-5">
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted mb-2">
                  Body <span className="font-normal normal-case tracking-normal text-muted">(HTML supported — use &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;strong&gt;)</span>
                </label>
                <textarea className="input font-mono text-[13px] leading-relaxed resize-y"
                  rows={16}
                  placeholder={`<p>Start writing your post here...</p>\n\n<h2>Section heading</h2>\n<p>More content...</p>`}
                  value={body} onChange={e => setBody(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handlePublish} disabled={publishing}
                  className="btn-primary flex-1 py-3.5 text-[14px] disabled:opacity-60">
                  {publishing
                    ? (editingId ? 'Saving…' : 'Publishing & sending newsletter…')
                    : (editingId ? 'Save changes' : '✦ Publish post & send newsletter')}
                </button>
                <button onClick={handleCancelForm}
                  className="border border-border rounded-full px-6 py-3.5 text-[13px] font-semibold text-muted hover:border-ink hover:text-ink transition-colors">
                  Cancel
                </button>
              </div>

              <p className="text-[11px] text-muted text-center">
                {editingId
                  ? `This will update /journal/${slug || '...'} — no newsletter will be sent.`
                  : `This will publish to /journal/${slug || '...'} and send to all Beehiiv subscribers immediately.`}
              </p>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <h2 className="font-serif text-[20px] mb-4">Users ({users.length})</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-light">
                      {['Email', 'Name', 'Tier', 'Recipes', 'Costings', 'Joined', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-border last:border-none hover:bg-light">
                        <td className="px-4 py-3 text-ink">{u.email}</td>
                        <td className="px-4 py-3 text-muted">{u.first_name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                            ${u.tier === 'pro' ? 'bg-orange/10 text-orange' : 'bg-green/10 text-green'}`}>
                            {u.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">{u.recipe_count}</td>
                        <td className="px-4 py-3 text-muted">{u.costing_count}</td>
                        <td className="px-4 py-3 text-muted">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3">
                          {u.tier === 'free' && (
                            <button onClick={() => handleUpgrade(u.id)}
                              className="text-[11px] font-bold text-orange hover:underline">
                              Upgrade to Pro →
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIBERS */}
        {tab === 'subscribers' && (
          <div>
            <h2 className="font-serif text-[20px] mb-4">Newsletter subscribers ({subscribers.length})</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-light">
                      {['Email', 'Source', 'Signed up'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-muted">No subscribers yet</td></tr>
                    ) : subscribers.map((s, i) => (
                      <tr key={i} className="border-b border-border last:border-none hover:bg-light">
                        <td className="px-4 py-3 text-ink">{s.email}</td>
                        <td className="px-4 py-3 text-muted">{s.source}</td>
                        <td className="px-4 py-3 text-muted">{new Date(s.created_at).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ASSETS */}
        {tab === 'assets' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-serif text-[20px]">Assets</h2>
                <p className="text-[13px] text-muted mt-1">
                  Upload PDFs, images, or any file — get a shareable link for blog posts, social, or WhatsApp.
                </p>
              </div>
              <label className="btn-primary px-4 py-2 text-[13px] cursor-pointer">
                {uploading ? 'Uploading…' : '+ Upload file'}
                <input type="file" className="hidden" onChange={handleUploadAsset} disabled={uploading} />
              </label>
            </div>

            {assets.length === 0 ? (
              <div className="card border-dashed p-10 text-center">
                <p className="font-serif text-[18px] mb-2">No assets yet</p>
                <p className="text-[13px] text-muted mb-4">Upload your first file — a lead magnet PDF, an image, anything you want a public link for.</p>
                <label className="btn-primary px-5 py-2.5 text-[13px] cursor-pointer inline-block">
                  Upload a file
                  <input type="file" className="hidden" onChange={handleUploadAsset} disabled={uploading} />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {assets.map(a => (
                  <div key={a.name} className="card p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-ink truncate">{a.name}</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {formatSize(a.size)} · {new Date(a.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => handleCopyLink(a.url)}
                        className="text-[12px] text-orange hover:underline">Copy link</button>
                      <a href={a.url} target="_blank"
                        className="text-[12px] text-muted hover:text-ink hover:underline">View →</a>
                      <button onClick={() => handleDeleteAsset(a.name)}
                        className="text-[12px] text-muted hover:text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
