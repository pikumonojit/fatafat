import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient('https://pselksqspkulqkfrnioi.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
const defaultTimes = ['10:00 AM','11:30 AM','01:00 PM','02:30 PM','04:00 PM','05:30 PM','07:00 PM','08:30 PM']

function formatDate(date) { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00+05:30`)) }
function indiaToday() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()) }
function pattiSingleDigit(value) { const digits = String(value || '').replace(/\D/g, ''); if (digits.length !== 3) return '—'; return String(digits.split('').reduce((sum, digit) => sum + Number(digit), 0) % 10) }
function groupByDate(results) { const groups = {}; for (const row of results) { if (!groups[row.result_date]) groups[row.result_date] = Array(8).fill(null); groups[row.result_date][row.round_number - 1] = row } return groups }
function isSunday(date) { return new Date(`${date}T00:00:00+05:30`).getDay() === 0 }

function ClassicResult({ date, rows, today = false }) {
  const count = isSunday(date) ? 4 : 8
  const cells = (rows || Array(8).fill(null)).slice(0, count)
  return <div className="classic-result">
    <div className="classic-date">{formatDate(date)}{today ? <span className="today-badge">TODAY</span> : null}</div>
    <div className="classic-head">{cells.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
    <div className="classic-numbers">{cells.map((row, i) => <div key={i}>{row?.result || '—'}</div>)}</div>
    <div className="classic-single">{cells.map((row, i) => <div key={i}>{pattiSingleDigit(row?.result)}</div>)}</div>
    <div className="classic-times">{cells.map((row, i) => <div key={i}>{row?.result_time || defaultTimes[i]}</div>)}</div>
  </div>
}

export default async function Home() {
  const { data: results, error } = await supabase.from('results').select('id,result_date,round_number,round_name,result_time,result,status').eq('status', 'published').order('result_date', { ascending: false }).order('round_number')
  const grouped = groupByDate(results || [])
  const today = indiaToday()
  const dates = Object.keys(grouped).filter((d) => d <= today)
  const todayRows = grouped[today] || Array(8).fill(null)
  const oldDates = dates.filter((d) => d !== today).slice(0, 30)

  return <main className="page">
    <header className="topbar"><div className="top-inner"><a className="logo" href="/"><span className="crown">♛</span><span><b>MATKA KING <em>FATAFAT</em></b><small>FAST&nbsp;&nbsp;|&nbsp;&nbsp;CLEAR&nbsp;&nbsp;|&nbsp;&nbsp;INFORMATION</small></span></a><nav><a className="active" href="/">Home</a><a href="#today">Today Result</a><a href="#old">Old Result</a><a href="#patti">Patti List</a><a href="#chart">Chart</a><a href="#about">About</a><a href="#contact">Contact</a></nav></div></header>
    <section className="hero-banner"><img className="hero-image" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Howrah_Bridge_at_Night.jpg/1280px-Howrah_Bridge_at_Night.jpg" alt="Howrah Bridge at night in Kolkata"/><div className="hero-overlay"></div><div className="hero-city left">✦ ✦ ✦</div><div className="hero-copy"><div className="welcome">WELCOME TO</div><h1>MATKA KING FATAFAT</h1><div className="ribbon">DAILY PUBLISHED RESULTS</div><div className="hero-note">Information only • No betting or wagering services</div></div><div className="hero-city right">✦ ✦ ✦</div></section>
    <section className="notice-strip">👉 Results are published for information only. This website does not provide betting, wagering, deposits or payment services.</section>
    <div className="dashboard">
      <aside className="sidebar"><div className="side-menu"><a className="selected" href="/">⌂ <span>Home</span></a><a href="#today">▣ <span>Today Result</span></a><a href="#old">◷ <span>Old Result</span></a><a href="#patti">☷ <span>Patti List</span></a><a href="#chart">▥ <span>Chart</span></a><a href="#about">ⓘ <span>About Us</span></a><a href="#contact">✉ <span>Contact Us</span></a></div><div className="side-card" id="chart"><h3>◷ GAME TIMINGS</h3>{defaultTimes.map((time, i) => <div className="timing" key={time}><span>Bazi {i + 1}</span><b>{time}</b></div>)}</div><div className="side-card responsible"><div className="side-crown">♛</div><div><h3>INFORMATION ONLY</h3><p>Results are provided for informational purposes.</p></div></div></aside>
      <main className="main-column">
        <section className="panel today-panel" id="today"><div className="panel-title"><span>▣ &nbsp; TODAY'S RESULT</span><b>{formatDate(today)}</b></div>{error ? <div className="empty">Unable to load results right now.</div> : <ClassicResult date={today} rows={todayRows} today />}</section>
        <section className="panel recent-panel" id="old"><div className="section-heading"><span>▥ &nbsp; ONE MONTH RESULTS</span><b>{oldDates.length} previous result days</b></div><div className="old-result-list">{oldDates.map(date => <div className="old-result-item" key={date}><ClassicResult date={date} rows={grouped[date]} /></div>)}</div></section>
      </main>
      <aside className="rightbar"><div className="quick panel" id="patti"><div className="quick-title">🔗 QUICK LINKS</div><a href="#today">▣ &nbsp; Today Result</a><a href="#old">◷ &nbsp; Old Result</a><a href="#patti">☷ &nbsp; Patti List</a><a href="#chart">▥ &nbsp; Game Chart</a></div><div className="right-notice"><h3>🔔 NOTICE</h3><ul><li>Results are updated when published.</li><li>This website is for informational purposes only.</li><li>No gambling, betting or wagering services are offered.</li><li>Please use information responsibly.</li></ul></div><div className="brand-card"><div>♛</div><b>MATKA KING<br/><span>FATAFAT</span></b><small>FAST • CLEAR • INFORMATION</small></div></aside>
    </div>
    <footer id="about"><div><b>♛ MATKA KING <span>FATAFAT</span></b><small>FAST • CLEAR • INFORMATION</small><p>Published results and historical information.</p></div><div><b>Quick Links</b><p>Home<br/>Today Result<br/>Old Result<br/>Patti List<br/>Chart</p></div><div id="contact"><b>Support</b><p>About Us<br/>Contact Us<br/>Disclaimer<br/>Privacy Policy<br/>Terms &amp; Conditions</p></div><div><b>Follow Us</b><p className="social">● &nbsp; ● &nbsp; ● &nbsp; ●</p></div><small className="copyright">© {new Date().getFullYear()} Matka King Fatafat. Results information only.</small></footer>
  </main>
}
