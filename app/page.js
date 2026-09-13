import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient('https://pselksqspkulqkfrnioi.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${date}T00:00:00+05:30`))
}

function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

function groupByDate(results) {
  const groups = {}
  for (const row of results) {
    if (!groups[row.result_date]) groups[row.result_date] = Array(8).fill(null)
    groups[row.result_date][row.round_number - 1] = row
  }
  return groups
}

export default async function Home() {
  const { data: results, error } = await supabase.from('results').select('id,result_date,round_number,round_name,result_time,result,status').eq('status', 'published').order('result_date', { ascending: false }).order('round_number')
  const grouped = groupByDate(results || [])
  const today = indiaToday()
  const dates = Object.keys(grouped)

  return <main className="page">
    <header><div className="brand">MATKA KING <span>FATAFAT</span></div><nav><a href="#today">Today's Result</a><a href="#old">Old Result</a><a href="/admin">Admin</a></nav></header>
    <section className="hero"><p>DAILY RESULTS</p><h1>Matka King Fatafat</h1><div className="date">Published results · Information only</div></section>
    <section className="notice">👉 Results are published for information only. No betting, wagering, deposits or payment services are provided.</section>
    <section id="today" className="results-wrap">
      {error ? <div className="card"><div className="empty">Unable to load results right now.</div></div> : dates.length ? dates.map(date => {
        const rows = grouped[date]
        return <div className="result-day" key={date}>
          <div className="result-date">{formatDate(date)}{date === today ? <span className="today-badge">TODAY</span> : null}</div>
          <div className="result-table">
            <div className="result-row result-numbers">{rows.map((row, i) => <div className="result-cell" key={`n-${i}`}>{row?.result || '—'}</div>)}</div>
            <div className="result-row result-single">{rows.map((row, i) => <div className="result-cell" key={`s-${i}`}>{row?.result ? row.result.slice(-1) : '—'}</div>)}</div>
          </div>
          <div className="result-times">{rows.map((row, i) => <div key={i}>{row?.result_time || ''}</div>)}</div>
        </div>
      }) : <div className="card"><div className="empty">No results published yet.</div></div>}
    </section>
    <section id="old" className="old-label">OLD RESULTS</section>
    <footer>© {new Date().getFullYear()} Matka King Fatafat · Results information only · No betting or wagering services</footer>
  </main>
}
