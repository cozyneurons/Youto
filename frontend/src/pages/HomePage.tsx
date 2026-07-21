import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/common/Navbar';

/* ── data ──────────────────────────────────────────────────────────────────── */
interface Incident {
  id: number;
  title: string;
  category: string;
  categoryLabel: string;
  duration: string;
  severity: string;
  summary: string;
  issue: string;
  action: string;
  system: string;
  icon: string;
  color: string;
}

const incidents: Incident[] = [
  { id: 1, title: 'The Recommendation Feed', category: 'distraction', categoryLabel: 'Distraction', duration: 'Several avoidable hours', severity: 'High severity', summary: 'The user forgot the primary objective after encountering recommended videos.', issue: 'The user entered an environment designed to eliminate focus and temporarily abandoned the tutorial.', action: 'Convert to a structured course, maintain progress accountability, and enforce a strict learning path.', system: 'Automated deadline alerts', icon: '⏱', color: '#ffd84d' },
  { id: 2, title: 'The Clickbait Thumbnail', category: 'blocker', categoryLabel: 'Risk-management failure', duration: 'One wasted session', severity: 'Critical severity', summary: 'An unvetted video became a 20-minute time sink.', issue: 'The user clicked an unknown video without conducting reconnaissance or respecting obvious clickbait signals.', action: 'Use Gemini AI summaries first to document the content and avoid wasting time.', system: 'Pre-entry risk checklist', icon: '⚠', color: '#ff9d57' },
  { id: 3, title: 'The Shorts Feed', category: 'failure', categoryLabel: 'Attention failure', duration: 'Focus nearly reached', severity: 'Critical severity', summary: 'The user opened a critical distraction because the UI made it too easy.', issue: 'An endless scrolling resource was left beside a bored and susceptible learner.', action: 'Identify the asset, explain its purpose, and implement focus controls before going to sleep.', system: 'Role-based access control', icon: '🔐', color: '#8cbcff' },
  { id: 4, title: "The Comment Section", category: 'distraction', categoryLabel: 'Scope creep', duration: 'Approximately one hour', severity: 'High severity', summary: 'A quick scroll turned into a year-long argument.', issue: 'After watching the tutorial, the learner remained at a comfortable detour reading internet drama.', action: 'Close the tab, restore focus, record notes, and immediately return to the original learning roadmap.', system: 'Calendar-based escalation', icon: '📆', color: '#ff9fca' },

  { id: 6, title: 'Tutorial Hell', category: 'blocker', categoryLabel: 'Forced trade-off', duration: 'One catastrophic binge', severity: 'Unavoidable severity', summary: 'The route offered two bad options: out-of-date tutorials or 10-hour bootcamps.', issue: 'This was a genuine strategic constraint. Every choice involved measurable time loss.', action: 'Evaluate both risks, extract the transcript, and let AI summarize the key points.', system: 'Decision-impact matrix', icon: '⚖', color: '#a9e76c' },
  { id: 7, title: 'The Auto-Play Feature', category: 'blocker', categoryLabel: 'Platform-level blocker', duration: 'Seven hours', severity: 'Maximum severity', summary: 'The learning remained blocked for seven hours before intervention.', issue: 'The user was unable to leave, yet the issue remained unresolved until sleep deprivation finally intervened.', action: 'Turn off auto-play immediately, convert to a Youto course, and do not allow a single video to age into a binge session.', system: 'Automatic blocker escalation', icon: '📣', color: '#ff9fca' },
];

type Filter = 'all' | 'distraction' | 'blocker' | 'failure';

/* ── component ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [dreamMode, setDreamMode] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const auditTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = incidents.filter(i => filter === 'all' || i.category === filter);
  const selected = incidents.find(i => i.id === selectedId) ?? incidents[0];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const handleFilter = (f: Filter) => {
    setFilter(f);
    const vis = incidents.filter(i => f === 'all' || i.category === f);
    if (vis.length && !vis.some(i => i.id === selectedId)) {
      setSelectedId(vis[0].id);
    }
  };

  const handleNext = () => {
    const idx = visible.findIndex(i => i.id === selectedId);
    const next = idx === -1 ? 0 : (idx + 1) % visible.length;
    setSelectedId(visible[next].id);
  };

  const handleDream = () => setDreamMode(d => !d);
  const handleCopyReport = async () => {
    const report = [
      'YOUTO LEARNING POSTMORTEM', '',
      `Incident: ${selected.title}`,
      `Category: ${selected.categoryLabel}`,
      `Duration: ${selected.duration}`, '',
      `What happened: ${selected.issue}`, '',
      `Recommended response: ${selected.action}`, '',
      `System required: ${selected.system}`, '',
      'Final assessment: Legendary procrastinator. Questionable focus.'
    ].join('\n');
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = report; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    showToast('Postmortem copied.');
  };

  useEffect(() => {
    return () => {
      if (auditTimer.current) clearInterval(auditTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const heroTitle = dreamMode ? <>Was Learning <span>Ever Real?</span></> : <>YouTube to <span>Structured Course</span></>;
  const heroDesc = dreamMode
    ? 'Perhaps the endless recommended videos and shorts weren\'t distractions at all—but symbols inside one extremely persuasive algorithm.'
    : 'A routine tutorial search became a three-hour rabbit hole involving cat videos, clickbait, and one extremely persuasive algorithm.';
  const eyebrow = dreamMode ? 'Procrastination Mode · Doomscrolling Hypothesis' : 'Youto Operations · Conversion Postmortem';
  const symbolLabel = dreamMode ? 'Focus status unknown' : 'Learning overdue';
  const finalAssessment = dreamMode ? 'Legendary procrastinator. Possibly unconscious learner.' : 'Legendary procrastinator. Questionable focus.';

  return (
    <>
      <Navbar />
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap");
        .hp2 { --ink:#171717;--paper:#f4efe4;--white:#fffdf8;--yellow:#ffd84d;--blue:#8cbcff;--pink:#ff9fca;--green:#a9e76c;--purple:#b99cff;--orange:#ff9d57;--border:3px solid var(--ink);--shadow:7px 7px 0 var(--ink);--small-shadow:4px 4px 0 var(--ink); box-sizing:border-box;min-height:100vh;color:var(--ink);background:radial-gradient(circle at 10% 15%,rgba(255,216,77,.35),transparent 25%),radial-gradient(circle at 90% 12%,rgba(140,188,255,.35),transparent 27%),var(--paper);font-family:"Space Grotesk",sans-serif;transition:background 400ms ease,color 400ms ease; }
        .hp2.dream{background:radial-gradient(circle at 20% 15%,rgba(185,156,255,.5),transparent 28%),radial-gradient(circle at 80% 20%,rgba(255,159,202,.42),transparent 30%),#221b35;}
        .hp2 *{box-sizing:border-box;}
        .hp2 button{color:inherit;font:inherit;}
        .hp2 button:focus-visible{outline:4px solid var(--purple);outline-offset:4px;}
        .hp2-shell{width:min(1440px,calc(100% - 32px));margin:0 auto;padding:28px 0 60px;}
        .hp2-card{border:var(--border);border-radius:22px;background:var(--white);box-shadow:var(--shadow);}
        .hp2-eyebrow{margin:0 0 10px;font-family:"DM Mono",monospace;font-size:.76rem;font-weight:500;letter-spacing:.08em;line-height:1.4;text-transform:uppercase;}
        /* hero */
        .hp2-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,.7fr);min-height:510px;overflow:hidden;}
        .hp2-hero::before{position:absolute;right:30%;bottom:-130px;width:260px;height:260px;border:var(--border);border-radius:50%;background:var(--pink);content:"";}
        .hp2-hero-copy{position:relative;z-index:2;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-width:0;padding:clamp(32px,6vw,80px);}
        .hp2-hero-copy h1{max-width:760px;margin:0;font-size:clamp(3.4rem,9vw,8.5rem);font-weight:700;letter-spacing:-.075em;line-height:.82;}
        .hp2-hero-copy h1 span{display:block;color:#d75d35;-webkit-text-stroke:2px var(--ink);text-shadow:4px 4px 0 var(--yellow);}
        .hp2-hero-desc{max-width:680px;margin:30px 0 0;font-size:clamp(1rem,1.7vw,1.24rem);line-height:1.65;}
        .hp2-hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px;}
        .hp2-btn-primary,.hp2-btn-secondary,.hp2-filter,.hp2-text-btn{cursor:pointer;border:var(--border);font-weight:700;transition:transform 150ms ease,box-shadow 150ms ease,background 150ms ease;}
        .hp2-btn-primary,.hp2-btn-secondary{min-height:52px;padding:0 20px;border-radius:14px;}
        .hp2-btn-primary{display:inline-flex;gap:22px;align-items:center;justify-content:space-between;background:var(--yellow);box-shadow:var(--small-shadow);}
        .hp2-btn-secondary{background:var(--white);}
        .hp2-btn-primary:hover,.hp2-btn-secondary:hover,.hp2-filter:hover,.hp2-text-btn:hover{transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--ink);}
        .hp2-btn-primary:active,.hp2-btn-secondary:active,.hp2-filter:active,.hp2-text-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink);}
        .hp2-btn-primary:disabled{cursor:progress;opacity:.65;}
        .hp2-hero-symbol{position:relative;z-index:1;display:grid;place-items:center;padding:34px;border-left:var(--border);background:var(--blue);}
        .hp2.dream .hp2-hero-symbol{background:var(--purple);}
        .hp2-hero-symbol p{position:absolute;right:20px;bottom:16px;left:20px;margin:0;font-family:"DM Mono",monospace;font-size:.74rem;font-weight:500;letter-spacing:.08em;text-align:center;text-transform:uppercase;}
        .hp2-sun{position:relative;display:grid;width:min(280px,75%);aspect-ratio:1;place-items:center;border:var(--border);border-radius:50%;background:repeating-conic-gradient(from 0deg,var(--yellow) 0deg 8deg,transparent 8deg 16deg);animation:hp2-rotateSun 24s linear infinite;}
        .hp2.dream .hp2-sun{animation-duration:8s;}
        .hp2-sun::after{position:absolute;inset:34px;border:var(--border);border-radius:50%;background:var(--orange);content:"";}
        .hp2-ship{position:relative;z-index:2;width:130px;height:120px;animation:hp2-counterRotate 24s linear infinite;}
        .hp2-mast{position:absolute;top:10px;left:63px;width:5px;height:77px;border:2px solid var(--ink);background:var(--ink);}
        .hp2-sail{position:absolute;top:15px;left:18px;width:48px;height:62px;border:var(--border);border-radius:50% 8px 8px 50%;background:var(--white);transform:skewY(-8deg);}
        .hp2-hull{position:absolute;bottom:18px;left:10px;width:112px;height:34px;border:var(--border);border-radius:4px 4px 55px 55px;background:var(--ink);}
        @keyframes hp2-rotateSun{to{transform:rotate(360deg);}}
        @keyframes hp2-counterRotate{to{transform:rotate(-360deg);}}
        /* stats */
        .hp2-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:26px;}
        .hp2-stat{display:flex;flex-direction:column;min-width:0;min-height:220px;padding:26px;}
        .hp2-stat.yellow{background:var(--yellow);}.hp2-stat.blue{background:var(--blue);}.hp2-stat.pink{background:var(--pink);}.hp2-stat.green{background:var(--green);}
        .hp2-stat p{margin:0;font-family:"DM Mono",monospace;font-size:.72rem;letter-spacing:.07em;text-transform:uppercase;}
        .hp2-stat strong{margin-top:auto;font-size:clamp(4rem,7vw,6.4rem);letter-spacing:-.08em;line-height:.9;}
        .hp2-stat span{margin-top:12px;font-weight:600;line-height:1.35;}
        /* audit */
        .hp2-audit{margin-top:26px;padding:clamp(26px,5vw,48px);}
        .hp2-audit-head,.hp2-audit-result,.hp2-section-head,.hp2-inspector-top,.hp2-footer{display:flex;align-items:center;justify-content:space-between;gap:22px;}
        .hp2-audit-head h2,.hp2-section-head h2,.hp2-footer h2{margin:0;font-size:clamp(1.8rem,4vw,3.6rem);letter-spacing:-.055em;line-height:1;}
        .hp2-grade{display:grid;flex:0 0 auto;width:90px;aspect-ratio:1;place-items:center;border:var(--border);border-radius:50%;background:var(--pink);box-shadow:var(--small-shadow);font-size:2.4rem;}
        .hp2-meter{height:34px;margin-top:32px;overflow:hidden;border:var(--border);border-radius:999px;background:repeating-linear-gradient(-45deg,var(--paper) 0 12px,var(--white) 12px 24px);}
        .hp2-meter span{display:block;width:0;height:100%;border-right:var(--border);background:var(--green);transition:width 120ms linear;}
        .hp2-audit-result{margin-top:20px;}
        .hp2-audit-result p{max-width:820px;margin:0;line-height:1.55;}
        .hp2-audit-result span{flex:0 0 auto;font-family:"DM Mono",monospace;font-size:1.2rem;font-weight:700;}
        /* incidents */
        .hp2-incidents{margin-top:68px;}
        .hp2-section-head{align-items:flex-end;margin-bottom:24px;}
        .hp2-filters{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;}
        .hp2-filter{padding:10px 14px;border-radius:999px;background:var(--white);box-shadow:3px 3px 0 var(--ink);font-size:.82rem;}
        .hp2-filter.active{background:var(--yellow);}
        .hp2-workspace{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(320px,.75fr);gap:26px;align-items:start;}
        .hp2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;min-width:0;}
        .hp2-icard{position:relative;min-width:0;min-height:250px;padding:24px;overflow:hidden;cursor:pointer;border:var(--border);border-radius:20px;background:var(--white);box-shadow:var(--small-shadow);text-align:left;transition:transform 170ms ease,box-shadow 170ms ease,background 170ms ease;}
        .hp2-icard::after{position:absolute;right:-25px;bottom:-25px;width:90px;height:90px;border:var(--border);border-radius:50%;background:var(--card-c,var(--yellow));content:"";}
        .hp2-icard:hover,.hp2-icard.sel{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--ink);}
        .hp2-icard.sel{background:var(--card-c,var(--yellow));}
        .hp2-icard-top{display:flex;justify-content:space-between;gap:18px;}
        .hp2-icard-idx,.hp2-icard-dur{font-family:"DM Mono",monospace;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;}
        .hp2-icard h3{max-width:85%;margin:52px 0 12px;font-size:clamp(1.5rem,3vw,2.4rem);letter-spacing:-.045em;line-height:1;}
        .hp2-icard p{max-width:86%;margin:0;line-height:1.5;}
        .hp2-icard.hidden{display:none;}
        /* inspector */
        .hp2-inspector{position:sticky;top:18px;min-width:0;padding:28px;background:var(--ink);color:var(--white);}
        .hp2-badge{padding:8px 11px;border:2px solid var(--white);border-radius:999px;background:var(--pink);color:var(--ink);font-family:"DM Mono",monospace;font-size:.68rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
        .hp2-inc-num,.hp2-detail-cat{font-family:"DM Mono",monospace;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;}
        .hp2-detail-cat{margin:44px 0 10px;color:var(--yellow);}
        .hp2-inspector h3{margin:0;font-size:clamp(2rem,4vw,4rem);letter-spacing:-.055em;line-height:.95;}
        .hp2-detail-block{margin-top:32px;}
        .hp2-detail-block span,.hp2-rec-box span{font-family:"DM Mono",monospace;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;}
        .hp2-detail-block p{margin:9px 0 0;color:inherit;opacity:0.85;line-height:1.55;}
        .hp2-rec-box{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:32px;padding:18px;border:2px solid var(--white);border-radius:16px;background:var(--purple);color:var(--ink);}
        .hp2-rec-box strong{display:block;margin-top:6px;line-height:1.3;}
        .hp2-sys-icon{display:grid;flex:0 0 auto;width:50px;aspect-ratio:1;place-items:center;border:2px solid var(--ink);border-radius:50%;background:var(--white);font-size:1.4rem;}
        .hp2-inspector-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;}
        .hp2-dark-btn{border-color:var(--white);background:var(--yellow);color:var(--ink);}
        .hp2-text-btn{padding:0 4px;border:none;border-color:transparent;background:transparent;color:var(--white);text-decoration:underline;text-underline-offset:4px;font-weight:700;}
        .hp2-text-btn:hover{box-shadow:none;transform:none;}
        /* remediation */
        .hp2-remediation{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:68px;}
        .hp2-rcard{position:relative;min-width:0;min-height:340px;padding:30px;overflow:hidden;}
        .hp2-rcard:nth-child(1){background:var(--blue);}.hp2-rcard:nth-child(2){background:var(--yellow);}.hp2-rcard:nth-child(3){background:var(--pink);}
        .hp2-rnum{position:absolute;top:15px;right:22px;color:rgba(23,23,23,.17);font-size:5rem;font-weight:700;letter-spacing:-.08em;}
        .hp2-rcard h3{margin:90px 0 20px;font-size:clamp(1.7rem,3.3vw,3rem);letter-spacing:-.05em;line-height:1;}
        .hp2-rcard>p:last-child{margin:0;line-height:1.6;}
        /* footer */
        .hp2-footer{margin-top:26px;padding:clamp(28px,5vw,48px);background:var(--green);}
        .hp2-footer>p{margin:0;font-family:"DM Mono",monospace;font-size:.78rem;line-height:1.7;text-align:right;text-transform:uppercase;}
        /* toast */
        .hp2-toast{position:fixed;right:24px;bottom:24px;z-index:20;padding:14px 18px;border:var(--border);border-radius:12px;background:var(--yellow);box-shadow:var(--small-shadow);font-weight:700;opacity:0;pointer-events:none;transform:translateY(20px);transition:opacity 200ms ease,transform 200ms ease;}
        .hp2-toast.vis{opacity:1;transform:translateY(0);}
        @media(max-width:1050px){.hp2-hero{grid-template-columns:1fr;}.hp2-hero-symbol{min-height:330px;border-top:var(--border);border-left:0;}.hp2-stats{grid-template-columns:repeat(2,minmax(0,1fr));}.hp2-workspace{grid-template-columns:1fr;}.hp2-inspector{position:relative;top:auto;}}
        @media(max-width:760px){.hp2-shell{width:min(100% - 22px,1440px);padding-top:14px;}.hp2-card{border-radius:17px;box-shadow:5px 5px 0 var(--ink);}.hp2-hero{min-height:auto;}.hp2-hero-copy{padding:32px 24px 40px;}.hp2-hero-copy h1{font-size:clamp(3.2rem,18vw,5.6rem);}.hp2-hero::before{display:none;}.hp2-hero-symbol{min-height:280px;}.hp2-stats,.hp2-grid,.hp2-remediation{grid-template-columns:1fr;}.hp2-stat{min-height:185px;}.hp2-audit-head,.hp2-audit-result,.hp2-section-head,.hp2-footer{align-items:flex-start;flex-direction:column;}.hp2-grade{width:72px;}.hp2-filters{justify-content:flex-start;}.hp2-filter{font-size:.75rem;}.hp2-icard{min-height:225px;}.hp2-icard h3{margin-top:40px;}.hp2-inspector{padding:24px;}.hp2-footer>p{text-align:left;}.hp2-toast{right:12px;bottom:12px;left:12px;text-align:center;}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important;}}
      `}</style>

      <div className={`hp2${dreamMode ? ' dream' : ''}`}>
        <main className="hp2-shell">
          {/* ── hero ── */}
          <header className="hp2-hero hp2-card">
            <div className="hp2-hero-copy">
              <p className="hp2-eyebrow">{eyebrow}</p>
              <h1>{heroTitle}</h1>
              <p className="hp2-hero-desc">{heroDesc}</p>
              <div className="hp2-hero-actions">

                <button className="hp2-btn-secondary" onClick={handleDream} aria-pressed={dreamMode} type="button">
                  Dream theory: {dreamMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="hp2-hero-symbol" aria-hidden="true">
              <div className="hp2-sun">
                <div className="hp2-ship">
                  <span className="hp2-sail" />
                  <span className="hp2-mast" />
                  <span className="hp2-hull" />
                </div>
              </div>
              <p>{symbolLabel}</p>
            </div>
          </header>

          {/* ── stats ── */}
          <section className="hp2-stats" aria-label="Project statistics">
            {[
              { cls: 'yellow', label: 'Total lost time', val: '20', sub: 'hours lost to recommended videos' },
              { cls: 'blue', label: 'Actual learning', val: '10', sub: 'minutes of actual tutorial watched' },
              { cls: 'pink', label: 'Longest distraction', val: '7', sub: 'hours spent on YouTube Shorts' },
              { cls: 'green', label: 'Focus deployed', val: '1', sub: 'course successfully converted' },
            ].map(s => (
              <article key={s.label} className={`hp2-stat hp2-card ${s.cls}`}>
                <p className="hp2-eyebrow">{s.label}</p>
                <strong>{s.val}</strong>
                <span>{s.sub}</span>
              </article>
            ))}
          </section>

          {/* ── incidents ── */}
          <section className="hp2-incidents">
            <div className="hp2-section-head">
              <div>
                <p className="hp2-eyebrow">Incident registry</p>
                <h2>Where the journey went wrong</h2>
              </div>
              <div className="hp2-filters" aria-label="Incident filters">
                {(['all', 'distraction', 'blocker', 'failure'] as Filter[]).map(f => (
                  <button
                    key={f}
                    className={`hp2-filter${filter === f ? ' active' : ''}`}
                    type="button"
                    onClick={() => handleFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'distraction' ? 'Distractions' : f === 'blocker' ? 'Blockers' : 'Team failures'}
                  </button>
                ))}
              </div>
            </div>

            <div className="hp2-workspace">
              <div className="hp2-grid">
                {incidents.map(inc => {
                  const hidden = filter !== 'all' && inc.category !== filter;
                  return (
                    <button
                      key={inc.id}
                      className={`hp2-icard${inc.id === selectedId ? ' sel' : ''}${hidden ? ' hidden' : ''}`}
                      type="button"
                      style={{ '--card-c': inc.color } as React.CSSProperties}
                      onClick={() => setSelectedId(inc.id)}
                      aria-label={`View ${inc.title} incident`}
                    >
                      <div className="hp2-icard-top">
                        <span className="hp2-icard-idx">Incident {String(inc.id).padStart(2, '0')}</span>
                        <span className="hp2-icard-dur">{inc.duration}</span>
                      </div>
                      <h3>{inc.title}</h3>
                      <p>{inc.summary}</p>
                    </button>
                  );
                })}
              </div>

              <aside className="hp2-inspector hp2-card" aria-live="polite">
                <div className="hp2-inspector-top">
                  <span className="hp2-badge" style={{ background: selected.color }}>{selected.severity}</span>
                  <span className="hp2-inc-num">Incident {String(selected.id).padStart(2, '0')}</span>
                </div>
                <p className="hp2-detail-cat">{selected.categoryLabel}</p>
                <h3>{selected.title}</h3>
                <div className="hp2-detail-block">
                  <span>What happened</span>
                  <p>{dreamMode ? `Possible dream symbol: ${selected.issue}` : selected.issue}</p>
                </div>
                <div className="hp2-detail-block">
                  <span>What should have been done</span>
                  <p>{selected.action}</p>
                </div>
                <div className="hp2-rec-box">
                  <div>
                    <span>Recommended system</span>
                    <strong>{selected.system}</strong>
                  </div>
                  <span className="hp2-sys-icon" aria-hidden="true">{selected.icon}</span>
                </div>
                <div className="hp2-inspector-actions">
                  <button className="hp2-btn-secondary hp2-dark-btn" onClick={handleNext} type="button">Next incident</button>
                  <button className="hp2-text-btn" onClick={handleCopyReport} type="button">Copy postmortem</button>
                </div>
              </aside>
            </div>
          </section>

          {/* ── remediation ── */}
          <section className="hp2-remediation">
            {[
              { eyebrow: 'Convert', title: 'Stop personally watching every 10-hour tutorial.', body: 'Let Gemini 3.1 Flash Lite summarize the transcript and extract the key learning points.' },
              { eyebrow: 'Structure', title: 'Replace endless scrolling with repeatable systems.', body: 'Use visual course paths, per-lesson notes, and automatic progress tracking.' },
              { eyebrow: 'Share', title: 'Do not wait seven years to learn something new.', body: 'Share your structured course path with up to 5 friends and track progress together.' },
            ].map((r, i) => (
              <article key={i} className="hp2-rcard hp2-card">
                <span className="hp2-rnum">0{i + 1}</span>
                <p className="hp2-eyebrow">{r.eyebrow}</p>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </article>
            ))}
          </section>

          {/* ── footer ── */}
          <footer className="hp2-footer hp2-card">
            <div>
              <p className="hp2-eyebrow">Final assessment</p>
              <h2>{finalAssessment}</h2>
            </div>
            <p>Project: Youto Conversion<br />Status: Eventually delivered</p>
          </footer>
        </main>

        {/* ── toast ── */}
        <div className={`hp2-toast${toastVisible ? ' vis' : ''}`} role="status" aria-live="polite">{toast}</div>
      </div>
    </>
  );
}
