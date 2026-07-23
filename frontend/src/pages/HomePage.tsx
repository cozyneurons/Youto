import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import { Link } from 'react-router-dom';

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
  color: string;
}

const incidents: Incident[] = [
  {
    id: 1,
    title: 'The Recommendation Rabbit Hole',
    category: 'distraction',
    categoryLabel: 'Distraction',
    duration: 'Several avoidable hours',
    severity: 'High severity',
    summary: 'User opened one tutorial and ended up watching unrelated videos for hours.',
    issue: 'YouTube\'s recommendation algorithm actively fights your focus — every video ends with bait for the next click.',
    action: 'Convert the playlist into a structured Youto course. A locked learning path removes the sidebar and keeps you on track.',
    system: 'Structured Course Paths',
    color: '#ffd84d',
  },
  {
    id: 2,
    title: 'The 10-Hour Tutorial Trap',
    category: 'blocker',
    categoryLabel: 'Time management failure',
    duration: 'One wasted weekend',
    severity: 'Critical severity',
    summary: 'User started a 10-hour video without knowing if it covered what they needed.',
    issue: 'Long-form YouTube content offers no upfront summary — you only find out it\'s irrelevant 40 minutes in.',
    action: 'Use Youto\'s Gemini AI Summary to get a full breakdown of the video\'s content before committing to watch it.',
    system: 'Gemini AI Video Summaries',
    color: '#ff9d57',
  },
  {
    id: 3,
    title: 'The Abandoned Course',
    category: 'failure',
    categoryLabel: 'Accountability failure',
    duration: 'Weeks of inaction',
    severity: 'Critical severity',
    summary: 'User bookmarked a playlist with good intentions, never returned to it.',
    issue: 'YouTube has no reminders, no progress tracking, and no consequences for quitting.',
    action: 'Set a deadline on your Youto course. You\'ll receive an email reminder if you miss it.',
    system: 'Deadline & Email Reminders',
    color: '#8cbcff',
  },
  {
    id: 4,
    title: 'Lost in the Middle',
    category: 'distraction',
    categoryLabel: 'Progress blindspot',
    duration: 'Recurring every session',
    severity: 'High severity',
    summary: 'User could never remember which video they were on or what they had already covered.',
    issue: 'YouTube watch history is a flat list — it gives no sense of how far you\'ve come or how far is left to go.',
    action: 'Youto\'s animated progress path turns your course into a visual journey, showing exactly where you are and how much is left.',
    system: 'Curvy Progress Path UI',
    color: '#ff9fca',
  },
  {
    id: 6,
    title: 'Learning Alone, Getting Nowhere',
    category: 'blocker',
    categoryLabel: 'Motivation failure',
    duration: 'Ongoing',
    severity: 'High severity',
    summary: 'User lost motivation studying solo with no one to be accountable to.',
    issue: 'Studying in isolation makes it easy to quit — there\'s no social pressure or shared progress to keep you going.',
    action: 'Share your Youto course path with up to 5 friends. Watch each other\'s avatars progress in real time on the same path.',
    system: 'Shared Course Paths',
    color: '#a9e76c',
  },
  {
    id: 7,
    title: 'Notes Disconnected from Video',
    category: 'blocker',
    categoryLabel: 'Learning workflow failure',
    duration: 'Every single session',
    severity: 'Medium severity',
    summary: 'User took notes in a separate app and lost context of which moment in the video they referred to.',
    issue: 'Switching between a video and a notes app breaks focus and disconnects your insights from the exact moment that inspired them.',
    action: 'Take notes directly inside Youto. Type a timestamp like 12:34 and it becomes a clickable button that jumps the video to that exact moment.',
    system: 'In-video Notes with Timestamps',
    color: '#c4b5fd',
  },
];

type Filter = 'all' | 'distraction' | 'blocker' | 'failure';

/* ── component ──────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [dreamMode, setDreamMode] = useState(true);

  const auditTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = incidents.find(i => i.id === selectedId) ?? incidents[0];


  const handleFilter = (f: Filter) => {
    setFilter(f);
    const vis = incidents.filter(i => f === 'all' || i.category === f);
    if (vis.length && !vis.some(i => i.id === selectedId)) {
      setSelectedId(vis[0].id);
    }
  };

  const handleDream = () => setDreamMode(d => !d);

  useEffect(() => {
    return () => {
      if (auditTimer.current) clearInterval(auditTimer.current);
    };
  }, []);

  const heroTitle = dreamMode ? <>Down the <span>Rabbit Hole</span></> : <>YouTube to <span>Structured Course</span></>;
  const heroDesc = dreamMode
    ? 'Hours lost to the algorithm. Countless recommended videos watched. Zero original goals accomplished. Welcome to the doomscrolling state.'
    : 'A routine tutorial search became a three-hour rabbit hole involving cat videos, clickbait, and one extremely persuasive algorithm.';
  const eyebrow = dreamMode ? 'Algorithm Hypothesis · The Doomscrolling State' : 'Youto Operations · Conversion Postmortem';
  const symbolLabel = dreamMode ? 'Focus status: LOST' : 'Learning overdue';

  return (
    <>
      <Navbar />
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap");
        .hp2 { --ink:#171717;--paper:#FAF6EA;--white:#FAF6EA;--yellow:#ffd84d;--blue:#8cbcff;--pink:#ff9fca;--green:#a9e76c;--purple:#b99cff;--orange:#ff9d57;--border:3px solid var(--ink);--shadow:7px 7px 0 var(--ink);--small-shadow:4px 4px 0 var(--ink); box-sizing:border-box;min-height:100vh;color:var(--ink);background:radial-gradient(circle at 90% 12%,rgba(140,188,255,.25),transparent 27%),var(--paper);font-family:"Space Grotesk",sans-serif;transition:background 400ms ease,color 400ms ease; }
        .hp2.dream{background:radial-gradient(circle at 20% 15%,rgba(185,156,255,.5),transparent 28%),radial-gradient(circle at 80% 20%,rgba(255,159,202,.42),transparent 30%),#221b35;}
        .hp2 *{box-sizing:border-box;}
        .hp2 button{color:inherit;font:inherit;}
        .hp2 button:focus-visible{outline:4px solid var(--purple);outline-offset:4px;}
        .hp2-shell{width:min(1440px,calc(100% - 32px));margin:0 auto;padding:28px 0 60px;}
        .hp2-card{border:var(--border);border-radius:22px;background:var(--white);box-shadow:var(--shadow);}
        .hp2-eyebrow{margin:0 0 10px;font-family:"DM Mono",monospace;font-size:.76rem;font-weight:500;letter-spacing:.08em;line-height:1.4;text-transform:uppercase;}
        /* hero */
        .hp2-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,1fr);min-height:510px;overflow:hidden;background:#FAF6EA;}
        .hp2-hero::before{position:absolute;right:-130px;bottom:-100px;width:280px;height:280px;border:var(--border);border-radius:50%;background:var(--pink);content:"";z-index:3;}
        .hp2-hero-copy{position:relative;z-index:2;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-width:0;padding:clamp(32px,6vw,80px);}
        .hp2-hero-copy h1{max-width:760px;margin:0;font-size:clamp(2.4rem,4.5vw,4.8rem);font-weight:700;letter-spacing:-.055em;line-height:.95;}
        .hp2-hero-copy h1 span{display:block;color:#d75d35;-webkit-text-stroke:2px var(--ink);text-shadow:4px 4px 0 var(--yellow);}
        .hp2-hero-desc{max-width:680px;margin:30px 0 0;font-size:clamp(1rem,1.7vw,1.24rem);line-height:1.65;}
        .hp2-hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px;}
        .hp2-btn-primary,.hp2-btn-secondary,.hp2-filter,.hp2-text-btn{cursor:pointer;border:var(--border);font-weight:700;transition:transform 150ms ease,box-shadow 150ms ease,background 150ms ease;}
        .hp2-btn-primary,.hp2-btn-secondary{min-height:52px;padding:0 20px;border-radius:14px;}
        .hp2-btn-primary{display:inline-flex;gap:22px;align-items:center;justify-content:space-between;background:var(--yellow);box-shadow:var(--small-shadow);text-decoration:none;color:inherit;}
        .hp2-btn-secondary{background:var(--white);}
        .hp2-btn-primary:hover,.hp2-btn-secondary:hover,.hp2-filter:hover,.hp2-text-btn:hover{transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--ink);}
        .hp2-btn-primary:active,.hp2-btn-secondary:active,.hp2-filter:active,.hp2-text-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink);}
        .hp2-btn-primary:disabled{cursor:progress;opacity:.65;}
        .hp2-hero-symbol{position:relative;z-index:1;overflow:visible;display:flex;align-items:center;justify-content:center;min-height:540px;background:#FAF6EA;}
        .hp2.dream .hp2-hero, .hp2.dream .hp2-hero-symbol{background:#ede8f7;}
        .hp2-hero-symbol p{position:absolute;right:20px;bottom:16px;left:20px;margin:0;font-family:"DM Mono",monospace;font-size:.74rem;font-weight:500;letter-spacing:.08em;text-align:center;text-transform:uppercase;color:var(--ink);}
        .hp2-illus{width:100%;height:100%;display:block;}

        /* stats hanging thread */
        .hp2-stats-thread{position:absolute;top:-44px;left:0;right:0;height:100px;pointer-events:none;z-index:2;}
        .hp2-thread-svg{width:100%;height:100%;display:block;overflow:visible;}
        .hp2-stats{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:55px;}
        .hp2-stat{position:relative;display:flex;flex-direction:column;min-width:0;min-height:125px;padding:22px 16px 16px;transition:transform 250ms ease,box-shadow 250ms ease;}
        .hp2-stat:nth-of-type(1){margin-top:15px;}
        .hp2-stat:nth-of-type(2){margin-top:5px;}
        .hp2-stat:nth-of-type(3){margin-top:25px;}
        .hp2-stat:nth-of-type(4){margin-top:0px;}
        .hp2-stat::before{content:"";position:absolute;top:-24px;bottom:100%;left:50%;transform:translateX(-50%);width:2px;background:var(--ink);z-index:1;}
        .hp2-stat::after{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:12px;height:12px;border:2.5px solid var(--ink);border-radius:50%;background:var(--paper);z-index:3;box-shadow:inset 1px 1px 2px rgba(0,0,0,0.18);}
        .hp2-stat:hover{transform:translateY(-4px);box-shadow:10px 10px 0 var(--ink);}
        .hp2-stat.yellow{background:var(--yellow);}.hp2-stat.blue{background:var(--blue);}.hp2-stat.pink{background:var(--pink);}.hp2-stat.green{background:var(--green);}
        .hp2-stat p{margin:0;font-family:"DM Mono",monospace;font-size:.72rem;letter-spacing:.07em;text-transform:uppercase;}
        .hp2-stat strong{margin-top:auto;font-size:clamp(2.6rem,4vw,3.6rem);letter-spacing:-.08em;line-height:1;}
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
        .hp2-workspace{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,0.9fr);gap:22px;align-items:start;}
        .hp2-grid{position:relative;display:grid;grid-template-columns:1fr;gap:16px;min-width:0;padding-left:36px;}
        .hp2-grid::before{content:"";position:absolute;top:10px;bottom:10px;left:14px;width:4px;background:var(--ink);border-radius:4px;}
        .hp2-timeline-item{position:relative;}
        .hp2-timeline-item.hidden{display:none;}
        .hp2-timeline-dot{position:absolute;top:24px;left:-36px;width:20px;height:20px;border:3px solid var(--ink);border-radius:50%;z-index:2;transition:transform 200ms ease;}
        .hp2-timeline-dot::after{content:"";position:absolute;top:50%;left:100%;width:14px;height:4px;background:var(--ink);transform:translateY(-50%);}
        .hp2-timeline-item:hover .hp2-timeline-dot{transform:scale(1.2);}
        .hp2-icard{position:relative;width:100%;min-width:0;min-height:140px;padding:18px 20px;overflow:hidden;cursor:pointer;border:var(--border);border-radius:18px;background:var(--white);box-shadow:var(--small-shadow);text-align:left;transition:transform 300ms ease,box-shadow 300ms ease,background 170ms ease;}
        .hp2-icard::after{position:absolute;right:-25px;bottom:-25px;width:80px;height:80px;border:var(--border);border-radius:50%;background:var(--card-c,var(--yellow));content:"";}
        .hp2-icard:hover{transform:scale(0.95);box-shadow:2px 2px 0 var(--ink);}
        .hp2-icard.sel{background:var(--card-c,var(--yellow));}
        .hp2-icard-top{display:flex;justify-content:space-between;gap:18px;}
        .hp2-icard-idx,.hp2-icard-dur{font-family:"DM Mono",monospace;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;}
        .hp2-icard h3{max-width:90%;margin:20px 0 8px;font-size:clamp(1.2rem,2.2vw,1.75rem);letter-spacing:-.045em;line-height:1.1;}
        .hp2-icard p{max-width:90%;margin:0;font-size:.92rem;line-height:1.45;}
        /* inspector */
        .hp2-inspector{position:sticky;top:88px;min-width:0;padding:28px;background:var(--ink);color:var(--white);}
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

        @media(max-width:1050px){.hp2-hero{grid-template-columns:1fr;}.hp2-hero-symbol{min-height:330px;border-top:var(--border);border-left:0;}.hp2-stats{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:26px;}.hp2-stats-thread{display:none;}.hp2-stat{transform:none!important;margin-top:0!important;}.hp2-workspace{grid-template-columns:1fr;}.hp2-inspector{position:relative;top:auto;}}
        @media(max-width:760px){.hp2-shell{width:min(100% - 22px,1440px);padding-top:14px;}.hp2-card{border-radius:17px;box-shadow:5px 5px 0 var(--ink);}.hp2-hero{min-height:auto;}.hp2-hero-copy{padding:32px 24px 40px;}.hp2-hero-copy h1{font-size:clamp(3.2rem,18vw,5.6rem);}.hp2-hero::before{display:none;}.hp2-hero-symbol{min-height:280px;}.hp2-stats,.hp2-grid,.hp2-remediation{grid-template-columns:1fr;}.hp2-stat{min-height:120px;}.hp2-audit-head,.hp2-audit-result,.hp2-section-head,.hp2-footer{align-items:flex-start;flex-direction:column;}.hp2-grade{width:72px;}.hp2-filters{justify-content:flex-start;}.hp2-filter{font-size:.75rem;}.hp2-icard{min-height:225px;}.hp2-icard h3{margin-top:40px;}.hp2-inspector{padding:24px;}.hp2-footer>p{text-align:left;}}
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
                <Link to="/discover" className="hp2-btn-primary">
                  Discover Courses
                </Link>
                <button className="hp2-btn-secondary" onClick={handleDream} aria-pressed={dreamMode} type="button">
                  Doomscroll Mode: {dreamMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="hp2-hero-symbol" aria-hidden="true">
              <svg className="hp2-illus" viewBox="210 0 635 440" xmlns="http://www.w3.org/2000/svg" fontFamily="Poppins, sans-serif" preserveAspectRatio="xMidYMid meet">
                <g id="cubes">
                  <path d="M 300.0 276.0 L 332.0 260.0 L 332.0 306.0 L 300.0 322.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 268.0 260.0 L 300.0 276.0 L 300.0 322.0 L 268.0 306.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 300.0 244.0 L 332.0 260.0 L 300.0 276.0 L 268.0 260.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 268.0 292.0 L 300.0 276.0 L 300.0 322.0 L 268.0 338.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 236.0 276.0 L 268.0 292.0 L 268.0 338.0 L 236.0 322.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 268.0 260.0 L 300.0 276.0 L 268.0 292.0 L 236.0 276.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 332.0 292.0 L 364.0 276.0 L 364.0 322.0 L 332.0 338.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 300.0 276.0 L 332.0 292.0 L 332.0 338.0 L 300.0 322.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 332.0 260.0 L 364.0 276.0 L 332.0 292.0 L 300.0 276.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 300.0 308.0 L 332.0 292.0 L 332.0 338.0 L 300.0 354.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 268.0 292.0 L 300.0 308.0 L 300.0 354.0 L 268.0 338.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 300.0 276.0 L 332.0 292.0 L 300.0 308.0 L 268.0 292.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 364.0 308.0 L 396.0 292.0 L 396.0 338.0 L 364.0 354.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 332.0 292.0 L 364.0 308.0 L 364.0 354.0 L 332.0 338.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 364.0 276.0 L 396.0 292.0 L 364.0 308.0 L 332.0 292.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 332.0 324.0 L 364.0 308.0 L 364.0 354.0 L 332.0 370.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 300.0 308.0 L 332.0 324.0 L 332.0 370.0 L 300.0 354.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 332.0 292.0 L 364.0 308.0 L 332.0 324.0 L 300.0 308.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 396.0 324.0 L 428.0 308.0 L 428.0 354.0 L 396.0 370.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 364.0 308.0 L 396.0 324.0 L 396.0 370.0 L 364.0 354.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 396.0 292.0 L 428.0 308.0 L 396.0 324.0 L 364.0 308.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 364.0 340.0 L 396.0 324.0 L 396.0 370.0 L 364.0 386.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 332.0 324.0 L 364.0 340.0 L 364.0 386.0 L 332.0 370.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 364.0 308.0 L 396.0 324.0 L 364.0 340.0 L 332.0 324.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 396.0 310.0 L 428.0 294.0 L 428.0 340.0 L 396.0 356.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 364.0 294.0 L 396.0 310.0 L 396.0 356.0 L 364.0 340.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 396.0 278.0 L 428.0 294.0 L 396.0 310.0 L 364.0 294.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 428.0 280.0 L 460.0 264.0 L 460.0 310.0 L 428.0 326.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 396.0 264.0 L 428.0 280.0 L 428.0 326.0 L 396.0 310.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 428.0 248.0 L 460.0 264.0 L 428.0 280.0 L 396.0 264.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 460.0 250.0 L 492.0 234.0 L 492.0 280.0 L 460.0 296.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 428.0 234.0 L 460.0 250.0 L 460.0 296.0 L 428.0 280.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 460.0 218.0 L 492.0 234.0 L 460.0 250.0 L 428.0 234.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 492.0 220.0 L 524.0 204.0 L 524.0 250.0 L 492.0 266.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 460.0 204.0 L 492.0 220.0 L 492.0 266.0 L 460.0 250.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 492.0 188.0 L 524.0 204.0 L 492.0 220.0 L 460.0 204.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 220.0 L 588.0 204.0 L 588.0 250.0 L 556.0 266.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 524.0 204.0 L 556.0 220.0 L 556.0 266.0 L 524.0 250.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 188.0 L 588.0 204.0 L 556.0 220.0 L 524.0 204.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 524.0 236.0 L 556.0 220.0 L 556.0 266.0 L 524.0 282.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 492.0 220.0 L 524.0 236.0 L 524.0 282.0 L 492.0 266.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 524.0 204.0 L 556.0 220.0 L 524.0 236.0 L 492.0 220.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 236.0 L 620.0 220.0 L 620.0 266.0 L 588.0 282.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 220.0 L 588.0 236.0 L 588.0 282.0 L 556.0 266.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 204.0 L 620.0 220.0 L 588.0 236.0 L 556.0 220.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 492.0 252.0 L 524.0 236.0 L 524.0 282.0 L 492.0 298.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 460.0 236.0 L 492.0 252.0 L 492.0 298.0 L 460.0 282.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 492.0 220.0 L 524.0 236.0 L 492.0 252.0 L 460.0 236.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 252.0 L 588.0 236.0 L 588.0 282.0 L 556.0 298.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 524.0 236.0 L 556.0 252.0 L 556.0 298.0 L 524.0 282.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 220.0 L 588.0 236.0 L 556.0 252.0 L 524.0 236.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 620.0 252.0 L 652.0 236.0 L 652.0 282.0 L 620.0 298.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 236.0 L 620.0 252.0 L 620.0 298.0 L 588.0 282.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 620.0 220.0 L 652.0 236.0 L 620.0 252.0 L 588.0 236.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 524.0 268.0 L 556.0 252.0 L 556.0 298.0 L 524.0 314.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 492.0 252.0 L 524.0 268.0 L 524.0 314.0 L 492.0 298.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 524.0 236.0 L 556.0 252.0 L 524.0 268.0 L 492.0 252.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 268.0 L 620.0 252.0 L 620.0 298.0 L 588.0 314.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 252.0 L 588.0 268.0 L 588.0 314.0 L 556.0 298.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 236.0 L 620.0 252.0 L 588.0 268.0 L 556.0 252.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 652.0 268.0 L 684.0 252.0 L 684.0 298.0 L 652.0 314.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 620.0 252.0 L 652.0 268.0 L 652.0 314.0 L 620.0 298.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 652.0 236.0 L 684.0 252.0 L 652.0 268.0 L 620.0 252.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 284.0 L 588.0 268.0 L 588.0 314.0 L 556.0 330.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 524.0 268.0 L 556.0 284.0 L 556.0 330.0 L 524.0 314.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 252.0 L 588.0 268.0 L 556.0 284.0 L 524.0 268.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 620.0 284.0 L 652.0 268.0 L 652.0 314.0 L 620.0 330.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 268.0 L 620.0 284.0 L 620.0 330.0 L 588.0 314.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 620.0 252.0 L 652.0 268.0 L 620.0 284.0 L 588.0 268.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 300.0 L 620.0 284.0 L 620.0 330.0 L 588.0 346.0 Z" fill="#7FA3E0" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 556.0 284.0 L 588.0 300.0 L 588.0 346.0 L 556.0 330.0 Z" fill="#A9C3F2" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 588.0 268.0 L 620.0 284.0 L 588.0 300.0 L 556.0 284.0 Z" fill="#C9DBF7" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 652.0 254.0 L 684.0 238.0 L 684.0 284.0 L 652.0 300.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 620.0 238.0 L 652.0 254.0 L 652.0 300.0 L 620.0 284.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 652.0 222.0 L 684.0 238.0 L 652.0 254.0 L 620.0 238.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 684.0 224.0 L 716.0 208.0 L 716.0 254.0 L 684.0 270.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 652.0 208.0 L 684.0 224.0 L 684.0 270.0 L 652.0 254.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 684.0 192.0 L 716.0 208.0 L 684.0 224.0 L 652.0 208.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 178.0 L 780.0 162.0 L 780.0 208.0 L 748.0 224.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 162.0 L 748.0 178.0 L 748.0 224.0 L 716.0 208.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 146.0 L 780.0 162.0 L 748.0 178.0 L 716.0 162.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 132.0 L 780.0 116.0 L 780.0 162.0 L 748.0 178.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 116.0 L 748.0 132.0 L 748.0 178.0 L 716.0 162.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 100.0 L 780.0 116.0 L 748.0 132.0 L 716.0 116.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 86.0 L 780.0 70.0 L 780.0 116.0 L 748.0 132.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 70.0 L 748.0 86.0 L 748.0 132.0 L 716.0 116.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 54.0 L 780.0 70.0 L 748.0 86.0 L 716.0 70.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 194.0 L 748.0 178.0 L 748.0 224.0 L 716.0 240.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 684.0 178.0 L 716.0 194.0 L 716.0 240.0 L 684.0 224.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 162.0 L 748.0 178.0 L 716.0 194.0 L 684.0 178.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 780.0 194.0 L 812.0 178.0 L 812.0 224.0 L 780.0 240.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 178.0 L 780.0 194.0 L 780.0 240.0 L 748.0 224.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 780.0 162.0 L 812.0 178.0 L 780.0 194.0 L 748.0 178.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 148.0 L 748.0 132.0 L 748.0 178.0 L 716.0 194.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 684.0 132.0 L 716.0 148.0 L 716.0 194.0 L 684.0 178.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 116.0 L 748.0 132.0 L 716.0 148.0 L 684.0 132.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 780.0 148.0 L 812.0 132.0 L 812.0 178.0 L 780.0 194.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 132.0 L 780.0 148.0 L 780.0 194.0 L 748.0 178.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 780.0 116.0 L 812.0 132.0 L 780.0 148.0 L 748.0 132.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 684.0 210.0 L 716.0 194.0 L 716.0 240.0 L 684.0 256.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 652.0 194.0 L 684.0 210.0 L 684.0 256.0 L 652.0 240.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 684.0 178.0 L 716.0 194.0 L 684.0 210.0 L 652.0 194.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 210.0 L 780.0 194.0 L 780.0 240.0 L 748.0 256.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 194.0 L 748.0 210.0 L 748.0 256.0 L 716.0 240.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 178.0 L 780.0 194.0 L 748.0 210.0 L 716.0 194.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 164.0 L 780.0 148.0 L 780.0 194.0 L 748.0 210.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 148.0 L 748.0 164.0 L 748.0 210.0 L 716.0 194.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 748.0 132.0 L 780.0 148.0 L 748.0 164.0 L 716.0 148.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 226.0 L 748.0 210.0 L 748.0 256.0 L 716.0 272.0 Z" fill="#D0BD86" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 684.0 210.0 L 716.0 226.0 L 716.0 272.0 L 684.0 256.0 Z" fill="#E4D4A8" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 716.0 194.0 L 748.0 210.0 L 716.0 226.0 L 684.0 210.0 Z" fill="#F3E9CE" stroke="#17140F" strokeWidth="2.5" strokeLinejoin="round" />
                </g>
                <g id="people">
                  <g transform="translate(332.0 274.0) scale(1)">
                    <ellipse cx="0" cy="2" rx="14" ry="4" fill="#17140F22" />
                    <rect x="-6" y="-40" width="12" height="24" rx="4" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-9" y="-16" width="7" height="16" rx="2" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="2" y="-16" width="7" height="16" rx="2" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-10" y="-62" width="20" height="26" rx="7" fill="#FFFFFF" stroke="#17140F" strokeWidth="2.5" />
                    <circle cx="0" cy="-72" r="10" fill="#E8B98C" stroke="#17140F" strokeWidth="2.5" />
                  </g>
                  <g transform="translate(364.0 330.0) scale(0.9)">
                    <circle cx="0" cy="-20" r="20" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <path d="M -7 -28 L -7 -12 L 9 -20 Z" fill="#FAF6EA" stroke="#17140F" strokeWidth="2" strokeLinejoin="round" />
                  </g>
                  <g transform="translate(588.0 218.0) scale(1)">
                    <ellipse cx="0" cy="2" rx="14" ry="4" fill="#17140F22" />
                    <rect x="-6" y="-40" width="12" height="24" rx="4" fill="#17140F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-9" y="-16" width="7" height="16" rx="2" fill="#17140F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="2" y="-16" width="7" height="16" rx="2" fill="#17140F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-10" y="-62" width="20" height="26" rx="7" fill="#FFFFFF" stroke="#17140F" strokeWidth="2.5" />
                    <circle cx="0" cy="-72" r="10" fill="#E8B98C" stroke="#17140F" strokeWidth="2.5" />
                  </g>
                  <g transform="translate(556.0 266.0) scale(0.9)">
                    <ellipse cx="0" cy="2" rx="14" ry="4" fill="#17140F22" />
                    <rect x="-6" y="-40" width="12" height="24" rx="4" fill="#17140F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-9" y="-16" width="7" height="16" rx="2" fill="#17140F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="2" y="-16" width="7" height="16" rx="2" fill="#17140F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-10" y="-62" width="20" height="26" rx="7" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <circle cx="0" cy="-72" r="10" fill="#E8B98C" stroke="#17140F" strokeWidth="2.5" />
                  </g>
                  <g transform="translate(748.0 100.0) scale(1)">
                    <ellipse cx="0" cy="2" rx="14" ry="4" fill="#17140F22" />
                    <rect x="-6" y="-40" width="12" height="24" rx="4" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-9" y="-16" width="7" height="16" rx="2" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="2" y="-16" width="7" height="16" rx="2" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <rect x="-10" y="-62" width="20" height="26" rx="7" fill="#FFFFFF" stroke="#17140F" strokeWidth="2.5" />
                    <circle cx="0" cy="-72" r="10" fill="#E8B98C" stroke="#17140F" strokeWidth="2.5" />
                  </g>
                  <g transform="translate(748.0 76.0) scale(0.8)">
                    <circle cx="0" cy="-20" r="20" fill="#C1673F" stroke="#17140F" strokeWidth="2.5" />
                    <path d="M -7 -28 L -7 -12 L 9 -20 Z" fill="#FAF6EA" stroke="#17140F" strokeWidth="2" strokeLinejoin="round" />
                  </g>
                </g>
                <g id="labels">
                  <g transform="translate(266.8 228.0)">
                    <rect width="130.4" height="34" rx="17.0" fill="#EFE6D2" stroke="#17140F" strokeWidth="2.5" />
                    <text x="65.2" y="22.0" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="14" fill="#17140F">Video Import</text>
                  </g>
                  <g transform="translate(304.7 330.0)">
                    <rect width="138.6" height="34" rx="17.0" fill="#EFE6D2" stroke="#17140F" strokeWidth="2.5" />
                    <text x="69.3" y="22.0" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="14" fill="#17140F">Auto-Chapters</text>
                  </g>
                  <g transform="translate(502.3 100.0)">
                    <rect width="171.4" height="34" rx="17.0" fill="#DCE9FB" stroke="#17140F" strokeWidth="2.5" />
                    <text x="85.7" y="22.0" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="14" fill="#17140F">Structured Course</text>
                  </g>

                  <g transform="translate(662.3 12.0)">
                    <rect width="171.4" height="34" rx="17.0" fill="#EFE6D2" stroke="#17140F" strokeWidth="2.5" />
                    <text x="85.7" y="22.0" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="14" fill="#17140F">Progress Tracking</text>
                  </g>
                </g>
              </svg>
              <p>{symbolLabel}</p>
            </div>
          </header>

          {/* ── stats ── */}
          <section className="hp2-stats" aria-label="Project statistics">
            <div className="hp2-stats-thread" aria-hidden="true">
              <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="hp2-thread-svg">
                <path d="M -20,30 C 50,30 80,35 125,35 C 225,35 275,25 375,25 C 475,25 525,45 625,45 C 725,45 775,20 875,20 C 950,20 980,15 1020,15" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
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
                <h2 style={{ color: dreamMode ? 'var(--accent-hover)' : 'inherit', transition: 'color 0.3s' }}>Where the journey went wrong</h2>
              </div>
              <div className="hp2-filters" aria-label="Incident filters">
                {(['all', 'distraction', 'blocker', 'failure'] as Filter[]).map(f => (
                  <button
                    key={f}
                    className={`hp2-filter${filter === f ? ' active' : ''}`}
                    type="button"
                    onClick={() => handleFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'distraction' ? 'Distractions' : f === 'blocker' ? 'Blockers' : 'Drop-offs'}
                  </button>
                ))}
              </div>
            </div>

            <div className="hp2-workspace">
              <div className="hp2-grid">
                {incidents.map(inc => {
                  const hidden = filter !== 'all' && inc.category !== filter;
                  return (
                    <div key={inc.id} className={`hp2-timeline-item${hidden ? ' hidden' : ''}`}>
                      <div className="hp2-timeline-dot" style={{ backgroundColor: inc.color }} aria-hidden="true" />
                      <button
                        className={`hp2-icard${inc.id === selectedId ? ' sel' : ''}`}
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
                    </div>
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
                  <p>{dreamMode ? `Algorithm Trap: ${selected.issue}` : selected.issue}</p>
                </div>
                <div className="hp2-detail-block">
                  <span>What should have been done</span>
                  <p>{selected.action}</p>
                </div>
                <div className="hp2-rec-box">
                  <div>
                    <span>Preventative measure</span>
                    <strong>{selected.system}</strong>
                  </div>
                </div>
              </aside>
            </div>
          </section>



        </main>


      </div>
    </>
  );
}
