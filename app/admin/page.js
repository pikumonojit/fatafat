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

function emptyRows() {
  return rounds.map((r, i) => ({ ...r, result: '', result_time: defaultTimes[i], published: false }))
}

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }))
  const [rows, setRows] = useState(emptyRows())
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDate, setLoadingDate] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadExistingResults(date)
  }, [session, date])

  async function loadExistingResults(selectedDate) {
    setLoadingDate(true)
    setMessage('')
    const { data, error } = await supabase
      .from('results')
      .select('round_number,round_name,result,result_time,status')
      .eq('result_date', selectedDate)
      .eq('status', 'published')
      .order('round_number')

    const nextRows = emptyRows()
    ;(data || []).forEach((item) => {
      const index = Number(item.round_number) - 1
      if (index >= 0 && index < nextRows.length) {
        nextRows[index] = {
          ...nextRows[index],
          name: item.round_name || nextRows[index].name,
          result: item.result || '',
          result_time: item.result_time || defaultTimes[index],
          published: true,
        }
      }
    })
    setRows(nextRows)
    setLoadingDate(false)
    if (error) setMessage(error.message)
  }

  async function login(e) {
    e.preventDefault(); setLoading(true); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false); setMessage(error ? error.message : 'Logged in successfully.')
  }

  async function publish() {
    if (!session) return
    setLoading(true); setMessage('')
    const payload = rows.filter((r) => r.result.trim()).map((r) => ({ result_date: date, round_number: r.number, round_name: r.name, result_time: r.result_time || defaultTimes[r.number - 1], result: r.result.trim(), status: 'published', published_at: new Date().toISOString() }))
    if (!payload.length) { setLoading(false); return setMessage('Enter at least one result before publishing.') }
    const { error } = await supabase.from('results').upsert(payload, { onConflict: 'result_date,round_number' })
    setLoading(false)
    if (error) return setMessage(error.message)
    setRows((current) => current.map((row) => row.result.trim() ? { ...row, published: true } : row))
    setMessage('Results published successfully. Existing results are kept and shown above.')
    await loadExistingResults(date)
  }

  async function logout() { await supabase.auth.signOut(); setSession(null) }
  const filled = rows.filter(r => r.result.trim()).length

  if (!session) return (
    <main className="admin-shell admin-auth-shell">
      <section className="admin-auth-card">
        <div className="admin-logo"><span>♛</span><div><strong>MATKA KING <i>FATAFAT</i></strong><small>ADMINISTRATION</small></div></div>
        <div className="admin-auth-icon">🔐</div>
        <h1>Welcome Back</h1>
        <p>Sign in to manage and publish daily informational results.</p>
        <form onSubmit={login} className="admin-auth-form">
          <label>Email Address<input type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In to Dashboard →'}</button>
        </form>
        {message && <div className="admin-alert">{message}</div>}
        <div className="admin-auth-foot">🔒 Secure Supabase authentication</div>
      </section>
    </main>
  )

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a href="/" className="admin-brand"><span>♛</span><div><strong>MATKA KING <i>FATAFAT</i></strong><small>ADMIN PANEL</small></div></a>
        <div className="admin-actions"><a href="/">↗ Public Site</a><button onClick={logout}>⇥ Logout</button></div>
      </header>
      <section className="admin-welcome">
        <div><span className="admin-kicker">DASHBOARD</span><h1>Publish Daily Results</h1><p>Existing published results are automatically loaded when you select a date.</p></div>
        <div className="admin-secure">● SECURE ADMIN AREA</div>
      </section>
      <section className="admin-content">
        <div className="admin-stats">
          <div><span>📅</span><div><small>SELECTED DATE</small><b>{date}</b></div></div>
          <div><span>✓</span><div><small>ROUNDS ENTERED</small><b>{filled} / 8</b></div></div>
          <div><span>ℹ</span><div><small>MODE</small><b>Informational Only</b></div></div>
        </div>
        <section className="admin-card">
          <div className="admin-card-head"><div><span>DAILY RESULTS</span><h2>Result Management</h2></div><label>Result Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div>
          {loadingDate && <div className="admin-alert">Loading existing published results…</div>}
          <div className="admin-table-head"><span>ROUND</span><span>PATTI RESULT</span><span>SINGLE DIGIT</span><span>TIME</span></div>
          <div className="admin-rounds">
            {rows.map((row, i) => <div className="admin-round" key={row.number}>
              <div className="round-name"><b>{String(row.number).padStart(2,'0')}</b><div><strong>{row.name}</strong><small>{row.published ? 'Published' : `Round ${row.number}`}</small></div></div>
              <input className="result-input" aria-label={`${row.name} result`} placeholder="000" inputMode="numeric" maxLength={3} value={row.result} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, result: e.target.value.replace(/\D/g, '').slice(0, 3), published: false } : x))} />
              <div className="digit-box">{pattiSingleDigit(row.result) || '—'}</div>
              <input className="time-input" aria-label={`${row.name} time`} value={row.result_time} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, result_time: e.target.value } : x))} />
            </div>)}
          </div>
          <div className="admin-card-foot"><p>ℹ Results are published for informational purposes only. No betting, wagering, deposits or payment services are provided.</p><button className="publish-button" onClick={publish} disabled={loading || loadingDate}>{loading ? 'Publishing…' : '✓ Publish Results'}</button></div>
          {message && <div className="admin-alert">{message}</div>}
        </section>
      </section>
    </main>
  )
}
