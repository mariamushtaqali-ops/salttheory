import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'assets'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { supabase }
}

function sanitizeFilename(name: string) {
  const dot = name.lastIndexOf('.')
  const base = dot > -1 ? name.slice(0, dot) : name
  const ext = dot > -1 ? name.slice(dot) : ''
  const cleanBase = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${cleanBase}${ext.toLowerCase()}`
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth

  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const files = (data || [])
    .filter(f => f.name !== '.emptyFolderPlaceholder')
    .map(f => {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
      return {
        name: f.name,
        size: f.metadata?.size ?? 0,
        created_at: f.created_at,
        url: pub.publicUrl,
      }
    })

  return NextResponse.json({ files })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const filename = sanitizeFilename(file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return NextResponse.json({ success: true, name: filename, url: pub.publicUrl })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { supabase } = auth

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const { error } = await supabase.storage.from(BUCKET).remove([name])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
