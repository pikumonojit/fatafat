import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata = {
  title: 'All Old Results History – Matka King Fatafat',
  description: 'Browse all available published historical result information by date.'
}

const supabase = createClient(
  'https://pselksqspkulqkfrnioi.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

const times = ['10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM', '09:00 PM']

function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(`${date}T00:00:00+05:30`))
}

function singleDigit(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length === 3
    ? String(digits.split('').reduce((sum, digit) => sum + Number(digit), 0) % 10)
    : '—'
}

function isSunday(date) {
  return new Date(`${date}T12:00:00+05:30`).getDay() === 0
}

function groupByDate(results) {
  const groups = {}
  for (const row of results) {
    if (!groups[row.result_date]) groups[row.result_date] = Array(8).fill(null)
    groups[row.result_date][row.round_number - 1] = row
  }
  return groups
}

function ResultChart({ date, rows }) {
  const count = isSunday(date) ? 4 : 8
  const cells = rows.slice(0, count)

  return (
    <div className="old-result-item">
      <div className="classic-result">
        <div className="classic-date">{formatDate(date)}</div>
        <div className="classic-head">
          {cells.map((_, index) => <div key={index}>{index + 1}</div>)}
        </div>
        <div className="classic-numbers">
          {cells.map((row, index) => <div key={index}>{row?.result || '—'}</div>)}
        </div>
        <div className="classic-single">
          {cells.map((row, index) => <div key={index}>{singleDigit(row?.result)}</div>)}
        </div>
        <div className="classic-times">
          {cells.map((row, index) => <div key={index}>{row?.result_time || times[index]}</div>)}
        </div>
      </div>
    </div>
  )
}

export default async function AllResults() {
  const { data, error } = await supabase
    .from('results')
    .select('result_date,round_number,result,result_time')
    .eq('status', 'published')
    .order('result_date', { ascending: false })
    .order('round_number', { ascending: true })

  const groups = groupByDate(data || [])
  const dates = Object.keys(groups)

  return (
    <main className="page">
      <header className="topbar">
        <div className="top-inner">
          <a className="logo" href="/">
            <span className="crown">♛</span>
            <span><b>MATKA KING <em>FATAFAT</em></b><small>FAST | CLEAR | INFORMATION</small></span>
          </a>
          <nav>
            <a href="/">Home</a>
            <a href="/today-result">Today Result</a>
            <a href="/old-results">Old Result</a>
            <a className="active" href="/all-results">All History</a>
            <a href="/patti-list">Patti List</a>
          </nav>
        </div>
      </header>

      <section className="panel recent-panel" style={{ margin: '28px auto', maxWidth: 1100 }}>
        <div className="section-heading">
          <span>▥ &nbsp; ALL OLD RESULTS HISTORY</span>
          <b>{dates.length} result days</b>
        </div>
        <div className="patti-note">All available published historical information is shown below, newest date first. This page is informational only.</div>
        {error ? <div className="empty">Unable to load historical results right now.</div> : null}
        {!error && dates.length === 0 ? <div className="empty">No published historical results available.</div> : null}
        <div className="old-result-list">
          {dates.map(date => <ResultChart key={date} date={date} rows={groups[date]} />)}
        </div>
      </section>

      <footer>
        <p><a href="/">Matka King Fatafat</a> · <a href="/today-result">Today Result</a> · <a href="/old-results">Old Result</a> · <a href="/patti-list">Patti List</a></p>
      </footer>
    </main>
  )
}
