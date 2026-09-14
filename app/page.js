import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient('https://pselksqspkulqkfrnioi.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
const defaultTimes = ['10:30 AM','12:00 PM','01:30 PM','03:00 PM','04:30 PM','06:00 PM','07:30 PM','09:00 PM']
const pattiRows = [
  ['100','200','300','400','500','600','700','800','900','000'],
  ['678','345','120','789','456','123','890','567','234','127'],
  ['777','444','111','888','555','222','999','666','333','190'],
  ['560','570','580','590','140','150','160','170','180','280'],
  ['470','480','490','130','230','330','340','350','360','370'],
  ['380','390','670','680','690','240','250','260','270','460'],
  ['290','660','238','248','258','268','278','288','450','550'],
  ['119','129','139','149','159','169','179','189','199','235'],
  ['137','237','337','347','357','367','377','116','117','118'],
  ['236','336','157','158','799','448','467','233','469','578'],
  ['146','246','346','456','456','459','459','459','126','145'],
  ['669','679','689','446','267','899','115','125','667','479'],
  ['579','255','355','699','780','178','124','224','478','668'],
  ['399','147','247','455','447','790','223','477','135','299'],
  ['588','228','256','266','366','466','566','990','225','334'],
  ['489','499','166','112','113','358','557','134','144','488'],
  ['245','688','599','356','122','880','368','558','379','389'],
  ['155','778','148','239','177','114','359','369','559','226'],
  ['227','138','788','338','249','556','449','378','289','569'],
  ['344','156','445','257','339','259','269','440','388','677'],
  ['335','110','229','220','889','349','133','279','577','136'],
  ['128','589','779','770','348','457','188','468','568','244']
]

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
    <div className="classic-times">{cells.map((row, i) => <div key={i}>{defaultTimes[i]}</div>)}</div>
  </div>
}

function PattiList() {
  return <section className="panel patti-panel" id="patti-list">
    <div className="section-heading"><span>☷ &nbsp; PATTI LIST CHART</span><b>Informational reference</b></div>
    <div className="patti-wrap">
      <div className="patti-note">Patti numbers are shown as a reference list. This section does not provide predictions, tips or wagering services.</div>
      <div className="patti-table">
        <div className="patti-brand">MATKA KING FATAFAT — PATTI LIST</div>
        <div className="patti-head">{['1','2','3','4','5','6','7','8','9','0'].map((n) => <div key={n}>{n}</div>)}</div>
        {pattiRows.map((row, i) => <div className="patti-row" key={i}>{row.map((value, j) => <div key={`${i}-${j}`}>{value}</div>)}</div>)}
      </div>
    </div>
  </section>
}

export default async function Home() {
  const { data: results, error } = await supabase.from('results').select('id,result_date,round_number,round_name,result,result_time,result,status').eq('status', 'published').order('result_date', { ascending: false }).order('round_number')
  const grouped = groupByDate(results || [])
  const today = indiaToday()
  const dates = Object.keys(grouped).filter((d) => d <= today)
  const todayRows = grouped[today] || Array(8).fill(null)
  const oldDates = dates.filter((d) => d !== today).slice(0, 30)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Matka King Fatafat',
    url: 'https://matkakingfatafat-bice.vercel.app',
    description: 'Published daily and historical result information and game timing information.',
    inLanguage: 'en-IN'
  }

  return <main className="page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <header className="topbar"><div className="top-inner"><a className="logo" href="/"><span className="crown">♛</span><span><b>MATKA KING <em>FATAFAT</em></b><small>FAST&nbsp;&nbsp;|&nbsp;&nbsp;CLEAR&nbsp;&nbsp;|&nbsp;&nbsp;INFORMATION</small></span></a><nav><a className="active" href="/">Home</a><a href="/today-result">Today Result</a><a href="/old-results">Old Result</a><a href="/patti-list">Patti List</a><a href="#chart">Chart</a><a href="#about">About</a><a href="#contact">Contact</a></nav></div></header>
    <section className="hero-banner"><img className="hero-image" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Howrah_Bridge_at_Night.jpg/1280px-Howrah_Bridge_at_Night.jpg" alt="Howrah Bridge at night in Kolkata"/><div className="hero-overlay"></div><div className="hero-city left">✦ ✦ ✦</div><div className="hero-copy"><div className="welcome">WELCOME TO</div><h1>MATKA KING FATAFAT</h1><div className="ribbon">DAILY PUBLISHED RESULTS</div><div className="hero-note">Information only • No betting or wagering services</div></div><div className="hero-city right">✦ ✦ ✦</div></section>
    <section className="notice-strip">👉 Results are published for information only. This website does not provide betting, wagering, deposits or payment services.</section>
    <section className="seo-intro" aria-labelledby="about-results"><h2 id="about-results">Matka King Fatafat Daily Results</h2><p>Matka King Fatafat provides a simple reference for published daily results, previous result records, result timing information and a Patti List. Results are displayed by date and round so visitors can quickly review published information.</p></section>
    <div className="dashboard">
      <aside className="sidebar"><div className="side-menu"><a className="selected" href="/">⌂ <span>Home</span></a><a href="/today-result">▣ <span>Today Result</span></a><a href="/old-results">◷ <span>Old Result</span></a><a href="/patti-list">☷ <span>Patti List</span></a><a href="#chart">▥ <span>Chart</span></a><a href="#about">ⓘ <span>About Us</span></a><a href="#contact">✉ <span>Contact Us</span></a></div><div className="side-card" id="chart"><h3>◷ GAME TIMINGS</h3>{defaultTimes.map((time, i) => <div className="timing" key={time}><span>Bazi {i + 1}</span><b>{time}</b></div>)}</div><div className="side-card responsible"><div className="side-crown">♛</div><div><h3>INFORMATION ONLY</h3><p>Results are provided for informational purposes.</p></div></div></aside>
      <main className="main-column">
        <section className="panel today-panel" id="today"><div className="panel-title"><span>▣ &nbsp; TODAY'S RESULT</span><b>{formatDate(today)}</b></div>{error ? <div className="empty">Unable to load results right now.</div> : <ClassicResult date={today} rows={todayRows} today />}</section>
        <section className="panel recent-panel" id="old"><div className="section-heading"><span>▥ &nbsp; ONE MONTH RESULTS</span><b>{oldDates.length} previous result days</b></div><div className="old-result-list">{oldDates.map(date => <div className="old-result-item" key={date}><ClassicResult date={date} rows={grouped[date]} /></div>)}</div></section>
        <PattiList />
      </main>
      <aside className="rightbar"><div className="quick panel"><div className="quick-title">🔗 QUICK LINKS</div><a href="/today-result">▣ &nbsp; Today Result</a><a href="/old-results">◷ &nbsp; Old Result</a><a href="/patti-list">☷ &nbsp; Patti List</a><a href="#chart">▥ &nbsp; Game Chart</a></div><div className="right-notice"><h3>🔔 NOTICE</h3><ul><li>Results are updated when published.</li><li>This website is for informational purposes only.</li><li>No gambling, betting or wagering services are offered.</li><li>Please use information responsibly.</li></ul></div><div className="brand-card"><div>♛</div><b>MATKA KING<br/><span>FATAFAT</span></b><small>FAST • CLEAR • INFORMATION</small></div></aside>
    </div>
    <footer id="about"><div><b>♛ MATKA KING <span>FATAFAT</span></b><small>FAST • CLEAR • INFORMATION</small><p>Published results and historical information.</p></div><div><b>Quick Links</b><p><a href="/">Home</a><br/><a href="/today-result">Today Result</a><br/><a href="/old-results">Old Result</a><br/><a href="/patti-list">Patti List</a><br/><a href="#chart">Chart</a></p></div><div id="contact"><b>Support</b><p>About Us<br/>Contact Us<br/>Disclaimer<br/>Privacy Policy<br/>Terms &amp; Conditions</p></div><div><b>Follow Us</b><p className="social">● &nbsp; ● &nbsp; ● &nbsp; ●</p></div><small className="copyright">© {new Date().getFullYear()} Matka King Fatafat. Results information only.</small></footer>
  </main>
}
