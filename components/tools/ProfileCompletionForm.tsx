'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const ROLES: { value: string; label: string }[] = [
  { value: 'home_cook',     label: 'Home cook' },
  { value: 'home_business', label: 'Home business' },
  { value: 'caterer',       label: 'Caterer' },
  { value: 'restaurant',    label: 'Restaurant / café' },
]

export default function ProfileCompletionForm({
  userId, initialLastName,
}: { userId: string; initialLastName: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [lastName, setLastName] = useState(initialLastName)
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!lastName.trim() || !role) { toast.error('Please fill in both fields'); return }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_name: lastName.trim(), role })
        .eq('id', userId)
      if (error) throw error
      toast.success('Profile completed!')
      router.refresh()
    } catch {
      toast.error('Could not save — try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5">
      <p className="text-[13px] font-bold text-ink mb-1">Complete your profile</p>
      <p className="text-[12px] text-muted mb-4">Helps us tailor Salt Theory to how you work.</p>
      <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Last name</label>
      <input className="input mb-4" type="text" placeholder="Your last name"
        value={lastName} onChange={e => setLastName(e.target.value)} />
      <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">You're mainly cooking as a…</label>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ROLES.map(r => (
          <button key={r.value} type="button" onClick={() => setRole(r.value)}
            className={`chip ${role === r.value ? 'active' : ''}`}>
            {r.label}
          </button>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving}
        className="btn-primary py-2.5 px-6 text-[13px] disabled:opacity-50">
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  )
}
