import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient('https://pselksqspkulqkfrnioi.supabase.co', 'sb_publishable_Gzhnv-usyah1tQXENwrIhQ_L_uAWYz_')

export default async function Home() {
  const { data: results, error } = await supabase
    .from('results')
    .select('*')
    .eq('status', 'published')
    .order('result_date', { ascending: false })
    .order('round_number')

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const todayResults = (results || []).filter((r) => r.result_date === today)
  const oldResults = (results || []).filter((r) => r.result_date !== today)

  return <main className="page">
    <header><div className="brand">MATKA KING <span>FATAFAT</span></div><nav><a href="#today">Today's Results</a><a href="#old">Old Results</a><a href="/admin">Admin</a></nav></header>
    <section className="hero"><p>DAILY RESULTS</p><h1>Matka King Fatafat</h1><div className="date">Published results · Information only</div></section>
    <section id="today" className="card"><div className="cardhead"><h2>Today's Results</h2><span className="live">● PUBLISHED</span></div><div className="grid">{error ? <div className="empty">Unable to load results. Please try again shortly.</div> : todayResults.length ? todayResults.map(r => <div className="result" key={r.id}><div><b>{r.round_name}</b><small>{r.result_time}</small></div><strong>{r.result || '—'}</strong></div>) : <div className="empty">No results published yet.</div>}</div></section>
    <section id="old" className="card"><h2>Old Results</h2>{oldResults.length ? <div className="grid">{oldResults.map(r => <div className="result" key={r.id}><div><b>{r.round_name}</b><small>{r.result_date} · {r.result_time}</small></div><strong>{r.result || '—'}</strong></div>)}</div> : <p className="muted">Historical results will appear here as they are published.</p>}</section>
    <footer>© {new Date().getFullYear()} Matka King Fatafat · Results information only · No betting or wagering services</footer>
  </main>
}
