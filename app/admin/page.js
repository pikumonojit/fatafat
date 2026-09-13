'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://pselksqspkulqkfrnioi.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
const defaultTimes = ['10:30 AM','12:00 PM','01:30 PM','03:00 PM','04:30 PM','06:00 PM','07:30 PM','09:00 PM']

const rounds = [
  { number: 1, name: 'Morning' }, { number: 2, name: 'Noon' }, { number: 3, name: 'Afternoon' }, { number: 4, name: 'Evening' },
  { number: 5, name: 'Night' }, { number: 6, name: 'Late Night' }, { number: 7, name: 'Special 1' }, { number: 8, name: 'Special 2' },
]

function pattiSingleDigit(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length !== 3) return ''
  return String(digits.split('').reduce((sum, digit) => sum + Number(digit), 0) % 10)
}

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }))
  const [rows, setRows] = useState(rounds.map((r, i) => ({ ...r, result: '', result_time: defaultTimes[i] })))
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function login(e) {
    e.preventDefault(); setLoading(true); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false); setMessage(error ? error.message : 'Logged in.')
  }

  async function publish() {
    if (!session) return
    setLoading(true); setMessage('')
    const payload = rows.filter((r) => r.result.trim()).map((r) => ({ result_date: date, round_number: r.number, round_name: r.name, result_time: r.result_time || defaultTimes[r.number - 1], result: r.result.trim(), status: 'published', published_at: new Date().toISOString() }))
    if (!payload.length) { setLoading(false); return setMessage('Enter at least one result before publishing.') }
    const { error } = await supabase.from('results').upsert(payload, { onConflict: 'result_date,round_number' })
    setLoading(false); setMessage(error ? error.message : 'Results published successfully.')
  }

  async function logout() { await supabase.auth.signOut(); setSession(null) }

  if (!session) return <main className="page"><section className="card admin-login"><h1>Admin Login</h1><p className="muted">Sign in to publish informational daily results.</p><form onSubmit={login} className="admin-form"><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form>{message && <p className="status">{message}</p>}</section></main>

  return <main className="page"><header><div className="brand">MATKA KING <span>FATAFAT</span></div><nav><a href="/">Public Site</a><button className="link-button" onClick={logout}>Logout</button></nav></header><section className="hero"><p>ADMIN PANEL</p><h1>Publish Daily Results</h1><div className="date">Informational results only — no betting or wagering.</div></section><section className="card"><div className="cardhead"><h2>Results</h2><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div><div className="admin-grid">{rows.map((row, i) => <div className="admin-row" key={row.number}><div><b>{row.name}</b><small>Round {row.number}</small></div><input placeholder="3-digit Patti" inputMode="numeric" maxLength={3} value={row.result} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, result: e.target.value.replace(/\D/g, '').slice(0, 3) } : x))} /><div className="single-preview"><small>Single Digit</small><strong>{pattiSingleDigit(row.result) || '—'}</strong></div><input placeholder="Time" value={row.result_time} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, result_time: e.target.value } : x))} /></div>)}</div><p className="muted">Schedule: 10:30 AM, then every 1 hour 30 minutes through Bazi 8 at 09:00 PM.</p><button className="publish-button" onClick={publish} disabled={loading}>{loading ? 'Publishing…' : 'Publish Results'}</button>{message && <p className="status">{message}</p>}</section></main>
}
