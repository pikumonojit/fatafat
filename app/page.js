import { createClient } from '@supabase/supabase-js'

export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  let results = []
  if (url && key) {
    const supabase = createClient(url, key)
    const { data } = await supabase.from('results').select('*').eq('status','published').order('round_number')
    results = data || []
  }
  return <main className="page"><header><div className="brand">MATKA KING <span>FATAFAT</span></div><nav><a href="#today">Today's Results</a><a href="#old">Old Results</a><a href="/admin">Admin</a></nav></header><section className="hero"><p>DAILY RESULTS</p><h1>Matka King Fatafat</h1><div className="date">Today's published results</div></section><section id="today" className="card"><div className="cardhead"><h2>Today's Results</h2><span className="live">● LIVE</span></div><div className="grid">{results.length ? results.map(r => <div className="result" key={r.id}><div><b>{r.round_name}</b><small>{r.result_time}</small></div><strong>{r.result || '—'}</strong></div>) : <div className="empty">No results published yet.</div>}</div></section><section id="old" className="card"><h2>Old Results</h2><p className="muted">Historical results will appear here as they are published.</p></section><footer>© {new Date().getFullYear()} Matka King Fatafat · Results information only</footer></main>
}
