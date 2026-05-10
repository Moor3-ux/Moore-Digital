import { useState, useEffect } from "react";

/* ─────────────────────────────────────────
   INJECT FONTS + GLOBAL STYLES
───────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --bg:      #0a0a0a;
      --bg2:     #101010;
      --bg3:     #161616;
      --bg4:     #1c1c1c;
      --border:  rgba(255,255,255,0.07);
      --border2: rgba(255,255,255,0.12);
      --text:    #ffffff;
      --muted:   #888899;
      --dim:     #555566;
      --amber:   #2563EB;
      --amber-l: #60A5FA;
      --amber-d: #1D4ED8;
      --amber-bg:rgba(37,99,235,0.08);
      --amber-glow:rgba(37,99,235,0.25);
      --green:   #22C55E;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--amber); border-radius: 2px; }

    .dot-grid {
      background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 32px 32px;
    }

    .hero-glow {
      position: absolute;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%);
      border-radius: 50%;
      pointer-events: none;
    }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    .animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    .animate-fade-in { animation: fade-in 0.6s ease both; }

    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }
    .delay-6 { animation-delay: 0.6s; }

    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal.in { opacity: 1; transform: translateY(0); }
    .reveal-l {
      opacity: 0;
      transform: translateX(-24px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal-l.in { opacity: 1; transform: translateX(0); }

    .btn-amber {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--amber);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.01em;
      padding: 16px 32px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      position: relative;
      overflow: hidden;
      transition: background 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
    }
    .btn-amber:hover {
      background: var(--amber-l);
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(37,99,235,0.4);
    }
    .btn-amber:active { transform: translateY(0); }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      color: rgba(255,255,255,0.65);
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 500;
      padding: 16px 28px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s, border-color 0.2s, background 0.2s;
    }
    .btn-ghost:hover {
      color: #fff;
      border-color: rgba(255,255,255,0.35);
      background: rgba(255,255,255,0.04);
    }

    .service-card {
      background: var(--bg3);
      border: 1px solid var(--border);
      padding: 36px 32px;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s, background 0.3s, transform 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .service-card::before {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      background: var(--amber);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
    }
    .service-card:hover {
      border-color: rgba(37,99,235,0.2);
      background: var(--bg4);
      transform: translateY(-4px);
    }
    .service-card:hover::before { transform: scaleX(1); }

    .proof-card {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.3s, transform 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .proof-card:hover {
      border-color: rgba(37,99,235,0.2);
      transform: translateY(-4px);
    }

    .text-amber { color: var(--amber); }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .section-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--amber);
    }
    .section-label::before {
      content: '';
      display: inline-block;
      width: 20px;
      height: 1px;
      background: var(--amber);
      opacity: 0.6;
    }

    .pain-item {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 24px 0;
      border-bottom: 1px solid var(--border);
      transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
      cursor: default;
      position: relative;
    }
    .pain-item::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 0;
      background: linear-gradient(90deg, rgba(37,99,235,0.06), transparent);
      transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
    }
    .pain-item:first-child { border-top: 1px solid var(--border); }
    .pain-item:hover { padding-left: 12px; }
    .pain-item:hover::before { width: 100%; }

    .proc-step {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 40px 36px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s;
    }
    .proc-step:hover { border-color: rgba(37,99,235,0.2); }

    .stat-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--amber), var(--amber-l));
      border-radius: 2px;
      transition: width 1.5s cubic-bezier(0.16,1,0.3,1);
    }

    .nav-scrolled {
      background: rgba(10,10,10,0.92) !important;
      backdrop-filter: blur(20px) saturate(1.5);
      border-bottom: 1px solid var(--border) !important;
    }

    .scanlines {
      background-image: repeating-linear-gradient(
        0deg, transparent, transparent 2px,
        rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px
      );
    }

    .amber-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(37,99,235,0.1);
      border: 1px solid rgba(37,99,235,0.3);
      color: var(--amber);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 100px;
    }
    .amber-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--amber);
      animation: pulse-dot 2s ease infinite;
    }

    .trust-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,0.7);
      transition: border-color 0.2s, color 0.2s;
    }
    .trust-pill:hover { border-color: rgba(37,99,235,0.25); color: #fff; }

    .result-metric {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: clamp(44px, 5vw, 68px);
      line-height: 1;
      letter-spacing: -0.04em;
      color: var(--amber);
    }

    .gradient-text {
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .cta-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(37,99,235,0.08), transparent 65%);
      pointer-events: none;
    }

    .quick-process-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--border);
    }

    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px; height: 36px;
      cursor: pointer;
      background: transparent;
      border: none;
      padding: 0;
      flex-shrink: 0;
    }
    .hamburger span {
      display: block;
      width: 22px; height: 2px;
      background: #fff;
      border-radius: 2px;
      transition: transform 0.25s, opacity 0.25s;
    }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    .mobile-menu {
      display: none;
      position: fixed;
      top: 68px; left: 0; right: 0;
      background: rgba(10,10,10,0.97);
      backdrop-filter: blur(24px);
      border-bottom: 1px solid var(--border);
      padding: 8px 24px 28px;
      flex-direction: column;
      z-index: 699;
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu a {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      padding: 18px 0;
      border-bottom: 1px solid var(--border);
      transition: color 0.2s;
      letter-spacing: -0.02em;
    }
    .mobile-menu a:last-child { border-bottom: none; }
    .mobile-menu a:active { color: var(--amber); }

    /* Pricing card */
    .pricing-card {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 40px 36px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s, transform 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .pricing-card.featured {
      border-color: rgba(37,99,235,0.4);
      background: linear-gradient(160deg, rgba(37,99,235,0.06) 0%, var(--bg3) 60%);
    }
    .pricing-card:hover {
      border-color: rgba(37,99,235,0.25);
      transform: translateY(-4px);
    }
    .pricing-card.featured:hover { border-color: rgba(37,99,235,0.6); }

    @media (max-width: 860px) {
      .main-nav  { padding: 0 20px !important; }
      .nav-links { display: none !important; }
      .nav-cta   { display: none !important; }
      .hamburger { display: flex !important; }

      .hero-section  { padding: 100px 20px 60px !important; }
      .section-pad   { padding: 72px 20px !important; }
      .quick-process-wrap { padding: 60px 20px 0 !important; }
      .quick-cta-inner    { padding: 48px 20px !important; }
      .contact-pad   { padding: 72px 20px !important; }
      .footer-pad    { padding: 40px 20px 24px !important; }
      .form-box      { padding: 36px 24px !important; }

      .grid-2col  { grid-template-columns: 1fr !important; gap: 40px !important; }
      .grid-3col  { grid-template-columns: 1fr !important; }
      .grid-4col  { grid-template-columns: 1fr 1fr !important; }
      .form-2col  { grid-template-columns: 1fr !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }

      .sticky-col   { position: static !important; top: auto !important; }
      .process-line { display: none !important; }
      .results-row  { grid-template-columns: 1fr !important; }

      .quick-process-grid { grid-template-columns: 1fr !important; }
      .proc-step { padding: 32px 24px !important; }
      .service-card { padding: 28px 24px !important; }
      .pricing-card { padding: 32px 24px !important; }
      .pain-item { padding: 20px 0 !important; }

      .result-metric { font-size: clamp(36px, 10vw, 52px) !important; }
    }

    @media (max-width: 540px) {
      .grid-4col { grid-template-columns: 1fr !important; }
      .footer-grid { grid-template-columns: 1fr !important; }
    }

    .form-input {
      width: 100%;
      background: var(--bg3);
      border: 1px solid var(--border2);
      border-radius: 4px;
      padding: 14px 18px;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: #fff;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input::placeholder { color: var(--dim); }
    .form-input:focus {
      border-color: rgba(37,99,235,0.45);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
    }
  `}</style>
);

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-l");
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }); },
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────
   NAV
───────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Services", href: "#services" },
    { label: "Results",  href: "#results"  },
    { label: "Pricing",  href: "#pricing"  },
    { label: "Contact",  href: "#contact"  },
  ];
  const close = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`main-nav${scrolled ? " nav-scrolled" : ""}`}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 700,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 48px", height: "68px",
          transition: "background 0.3s, border-color 0.3s",
          borderBottom: "1px solid transparent",
        }}
      >
        <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src="/logo.png" alt="Moore Digital Solutions" style={{ height: "56px", width: "auto" }} />
        </a>

        <ul className="nav-links" style={{ display: "flex", gap: "32px", listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href}
                style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
              >{l.label}</a>
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="#contact" className="btn-amber nav-cta" style={{ padding: "10px 22px", fontSize: "13px" }}>
            Get a Free Audit &#8594;
          </a>
          <button className={`hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {links.map((l) => <a key={l.label} href={l.href} onClick={close}>{l.label}</a>)}
        <a href="#contact" onClick={close} style={{ color: "var(--amber)" }}>Get a Free Audit &#8594;</a>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero() {
  return (
    <section
      id="hero"
      className="dot-grid scanlines hero-section"
      style={{
        minHeight: "100svh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "120px 48px 80px",
        position: "relative", overflow: "hidden",
        background: "var(--bg)", textAlign: "center",
      }}
    >
      <div className="hero-glow" style={{ top: "30%", left: "50%", transform: "translate(-50%,-50%)" }} />
      <div className="hero-glow" style={{ top: "75%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "500px", opacity: 0.4 }} />

      <div style={{ maxWidth: "920px", width: "100%", position: "relative", zIndex: 2 }}>

        <div className="animate-fade-up delay-1" style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}>
          <span className="amber-badge">
            <span className="amber-badge-dot" />
            Lead Infrastructure for Contractors &nbsp;&#183;&nbsp; Now Accepting Clients
          </span>
        </div>

        <h1
          className="animate-fade-up delay-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(38px, 6.5vw, 96px)",
            fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em",
            color: "#fff", marginBottom: "28px",
          }}
        >
          We Deploy the Systems<br />
          That <span style={{ color: "var(--amber)" }}>Fill Your Pipeline</span><br />
          <span style={{ color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.22)" }}>— Automatically.</span>
        </h1>

        <p
          className="animate-fade-up delay-3"
          style={{
            fontSize: "clamp(16px, 1.8vw, 20px)", fontWeight: 300,
            color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
            maxWidth: "600px", margin: "0 auto 44px",
          }}
        >
          Automated lead capture, real-time dashboards, and operational infrastructure
          built for{" "}
          <strong style={{ color: "#fff", fontWeight: 600 }}>contractors, builders, and high-ticket local businesses.</strong>
        </p>

        <div className="animate-fade-up delay-4" style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginBottom: "56px" }}>
          <a href="#contact" className="btn-amber" style={{ fontSize: "16px", padding: "18px 40px" }}>
            Deploy My Lead System &#8594;
          </a>
          <a href="#services" className="btn-ghost" style={{ fontSize: "16px", padding: "18px 32px" }}>
            See What We Build
          </a>
        </div>

        <div className="animate-fade-up delay-5" style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "&#9889;", text: "48hr Deployment" },
            { icon: "&#128200;", text: "Real-Time Lead Visibility" },
            { icon: "&#127959;", text: "Contractor-Focused" },
            { icon: "&#9989;", text: "Always-On Infrastructure" },
          ].map((t) => (
            <div key={t.text} className="trust-pill">
              <span dangerouslySetInnerHTML={{ __html: t.icon }} />
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
function QuickProcessSection() {
  const steps = [
    {
      icon: "&#128269;",
      num: "01",
      title: "We Audit Your Lead Flow",
      desc: "We map exactly where leads enter, where they leak, and what's costing you jobs. Free, 30 minutes.",
    },
    {
      icon: "&#9889;",
      num: "02",
      title: "We Deploy Your Infrastructure",
      desc: "Lead capture, admin dashboard, and automated notifications go live in 48 hours. We handle everything.",
    },
    {
      icon: "&#128200;",
      num: "03",
      title: "You See Every Lead",
      desc: "Real-time visibility into every inquiry. Know exactly where your next job is coming from.",
    },
  ];

  return (
    <section className="quick-process-wrap" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", padding: "96px 48px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: "16px" }}>How It Works</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.92, color: "#fff",
          }}>
            Audit. Deploy. <span style={{ color: "var(--amber)" }}>Dominate.</span>
          </h2>
        </div>

        <div className="quick-process-grid">
          {steps.map((s, i) => (
            <div key={s.num} className="reveal" style={{ background: "var(--bg3)", padding: "48px 40px", position: "relative", textAlign: "center" }}>
              {i < 2 && (
                <div style={{
                  position: "absolute", top: "52px", right: "-13px", zIndex: 2,
                  width: "26px", height: "26px",
                  background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", color: "var(--amber)",
                }}>&#8594;</div>
              )}
              <div style={{
                width: "64px", height: "64px",
                background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", margin: "0 auto 20px",
              }} dangerouslySetInnerHTML={{ __html: s.icon }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>Step {s.num}</div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: "12px" }}>{s.title}</h3>
              <p style={{ fontSize: "15px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "260px", margin: "0 auto" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="reveal quick-cta-inner" style={{
        maxWidth: "780px", margin: "72px auto 0", padding: "64px 48px", textAlign: "center", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(37,99,235,0.06), transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
          letterSpacing: "-0.03em", color: "#fff", marginBottom: "28px", position: "relative", zIndex: 1,
        }}>
          Stop Losing Leads. Start Capturing Them.
        </h2>
        <a href="#contact" className="btn-amber" style={{ fontSize: "16px", padding: "18px 48px", position: "relative", zIndex: 1 }}>
          Get My Free Lead Audit &#8594;
        </a>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   PROBLEM SECTION
───────────────────────────────────────── */
function ProblemSection() {
  const pains = [
    {
      num: "01",
      title: "You have no idea where your leads actually go",
      desc: "A form submits, a notification maybe gets sent, and then&#8230; silence. No dashboard. No confirmation. No visibility. Just hope.",
      impact: "Most contractors have no idea how many leads they&#8217;ve lost to a broken form.",
    },
    {
      num: "02",
      title: "You follow up hours later — when they&#8217;ve already called someone else",
      desc: "High-ticket buyers reach out to 3&#8211;5 businesses at once. The first one to respond wins the job. Without a real-time system, that&#8217;s never you.",
      impact: "78% of jobs go to the first business that responds within 5 minutes.",
    },
    {
      num: "03",
      title: "You can&#8217;t tell which marketing is generating real work",
      desc: "Google Ads, yard signs, referrals &#8212; you&#8217;re spending money everywhere but have no data on what&#8217;s actually closing. A lead system fixes that.",
      impact: "Without source tracking, 60&#8211;80% of marketing spend is invisible.",
    },
    {
      num: "04",
      title: "One slow week and you don&#8217;t know if it&#8217;s slow season or a broken system",
      desc: "When your lead system has no monitoring, a broken form looks exactly like a slow week. You only find out when a customer tells you.",
      impact: "Unmonitored systems fail silently. Diagnostics prevent this.",
    },
  ];

  return (
    <section id="problem" className="section-pad" style={{ background: "var(--bg2)", padding: "120px 48px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "80px", alignItems: "start" }}>

          <div className="reveal-l sticky-col" style={{ position: "sticky", top: "100px" }}>
            <div className="section-label" style={{ marginBottom: "20px" }}>The Problem</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(42px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff", marginBottom: "24px",
            }}>
              Your Lead System<br />
              Is a <span style={{ color: "var(--amber)" }}>Black Hole</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>Losing Jobs</span>
            </h2>
            <p style={{ fontSize: "16px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: "32px" }}>
              Every day without a real lead infrastructure is a day your competitors are capturing the jobs you should be closing.
            </p>
            <div style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: "8px", padding: "20px 24px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--amber)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Bottom Line</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "#fff", lineHeight: 1.6 }}>
                A bad lead system isn&#8217;t just inefficient &#8212; it&#8217;s silently handing jobs to whoever built theirs first.
              </div>
            </div>
          </div>

          <div className="reveal">
            {pains.map((p) => (
              <div key={p.num} className="pain-item">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "var(--amber)", flexShrink: 0, paddingTop: "3px", opacity: 0.7 }}>{p.num}</div>
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "-0.01em" }}
                    dangerouslySetInnerHTML={{ __html: p.title }} />
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "12px" }}
                    dangerouslySetInnerHTML={{ __html: p.desc }} />
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
                    color: "rgba(239,68,35,0.9)", background: "rgba(239,68,35,0.08)",
                    border: "1px solid rgba(239,68,35,0.2)", padding: "4px 10px", borderRadius: "4px",
                  }} dangerouslySetInnerHTML={{ __html: "&#9888; " + p.impact }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   SERVICES
───────────────────────────────────────── */
function ServicesSection() {
  const services = [
    {
      icon: "&#128200;",
      label: "Core System",
      name: "Lead Capture & Database",
      desc: "A deployed lead form connected to a real database. Every submission is captured, timestamped, and stored &#8212; no email-or-nothing approach.",
      outcome: "Every lead is captured, stored, and visible. Nothing falls through the cracks.",
      badge: "Foundation",
    },
    {
      icon: "&#128panel;",
      label: "Operational Visibility",
      name: "Admin Dashboard",
      desc: "A real-time dashboard where you see every lead, update their status, add notes, and export your pipeline &#8212; from any device.",
      outcome: "Full visibility into your pipeline. Know exactly where every inquiry stands.",
      badge: null,
    },
    {
      icon: "&#128640;",
      label: "Lead Generation",
      name: "Landing Page Deployment",
      desc: "A high-converting, industry-focused page built around your services and local market. Deployed in 48 hours.",
      outcome: "A page built to close, not just exist. Optimized for your specific industry.",
      badge: null,
    },
    {
      icon: "&#9889;",
      label: "Performance",
      name: "Speed & Mobile Optimization",
      desc: "Sub-2-second load times, 90+ PageSpeed scores, flawless mobile layouts. Built into every deployment &#8212; not an afterthought.",
      outcome: "Faster pages rank higher, load better, and convert more visitors into leads.",
      badge: null,
    },
    {
      icon: "&#128293;",
      label: "Always-On",
      name: "Diagnostics & Monitoring",
      desc: "Automated health checks on your lead system. We know if your form breaks before you &#8212; or your customers &#8212; do.",
      outcome: "Know your system works. Before a customer tells you it doesn&#8217;t.",
      badge: "Critical",
    },
    {
      icon: "&#128279;",
      label: "Custom",
      name: "Integrations & Automation",
      desc: "CRM connections, scheduling tools, email marketing, webhook pipelines &#8212; we wire your lead system into your existing workflow.",
      outcome: "Your lead system becomes your operational hub, not an isolated tool.",
      badge: null,
    },
  ];

  return (
    <section id="services" className="section-pad" style={{ padding: "120px 48px", background: "var(--bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "56px", flexWrap: "wrap", gap: "24px" }}>
          <div className="reveal">
            <div className="section-label" style={{ marginBottom: "16px" }}>02 / What We Build</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff",
            }}>
              Infrastructure That<br />
              <span style={{ color: "var(--amber)" }}>Works While</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>You Work</span>
            </h2>
          </div>
          <a href="#contact" className="btn-amber reveal" style={{ alignSelf: "flex-end", flexShrink: 0 }}>
            Deploy Mine &#8594;
          </a>
        </div>

        <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)" }}>
          {services.map((s, i) => (
            <div key={s.name} className="service-card reveal" style={{ borderRadius: 0, animationDelay: `${i * 0.08}s` }}>
              {s.badge && (
                <div style={{
                  position: "absolute", top: "18px", right: "18px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 500,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "rgba(37,99,235,0.12)", color: "var(--amber)",
                  border: "1px solid rgba(37,99,235,0.25)", padding: "3px 10px", borderRadius: "4px",
                }}>{s.badge}</div>
              )}
              <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "48px", height: "48px",
                  background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                }} dangerouslySetInnerHTML={{ __html: s.icon }} />
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)" }}>{s.label}</div>
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: "10px" }}>{s.name}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "20px" }}
                dangerouslySetInnerHTML={{ __html: s.desc }} />
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", fontSize: "13px", fontWeight: 600, color: "var(--amber)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ marginTop: "1px", flexShrink: 0 }}>&#10140;</span>
                <span dangerouslySetInnerHTML={{ __html: s.outcome }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   RESULTS
───────────────────────────────────────── */
function ResultsSection() {
  const cases = [
    {
      industry: "Roofing Contractor",
      type: "Lead Capture + Dashboard Deployment",
      before: {
        points: ["Leads tracked in a notebook", "3-day average response time", "No source tracking", "Estimated 20–30% loss rate"],
      },
      after: {
        points: ["34 leads captured, month one", "Under 2-hour average response", "Full referral source visibility", "3 jobs closed from dashboard data"],
      },
      metric: "34",
      metricLabel: "Leads Captured Month 1",
      quote: "I had no idea how many people were reaching out and not hearing back. The dashboard showed me leads I never even knew about. We closed three jobs in the first week.",
      source: "&#8212; Roofing contractor, Colorado",
    },
    {
      industry: "HVAC Company",
      type: "Landing Page + Lead System",
      before: {
        points: ["Generic website, no lead form", "All inquiries through phone only", "Couldn&#8217;t handle off-hours leads", "No marketing attribution"],
      },
      after: {
        points: ["Dedicated service landing page", "24/7 automated lead capture", "Instant owner notification", "47% increase in qualified inquiries"],
      },
      metric: "+47%",
      metricLabel: "Qualified Inquiries",
      quote: "We were losing people who found us at 10pm and didn&#8217;t want to leave a voicemail. The form captures them immediately and I get an email within seconds.",
      source: "&#8212; HVAC owner, Texas",
    },
    {
      industry: "Metal Building Dealer",
      type: "Full Infrastructure Deployment",
      before: {
        points: ["Website with no database backend", "Spreadsheet-based lead tracking", "No follow-up system", "Leads lost after 48 hours"],
      },
      after: {
        points: ["Automated capture + admin dashboard", "Every lead stored and timestamped", "Status tracking through pipeline", "Full operational visibility"],
      },
      metric: "100%",
      metricLabel: "Lead Visibility",
      quote: "Before this, leads would come in and I&#8217;d forget about them. Now I open the dashboard and see exactly where everything is. It changed how I run the business.",
      source: "&#8212; Metal building dealer, Wyoming",
    },
  ];

  return (
    <section id="results" className="section-pad" style={{ padding: "120px 48px", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "72px" }}>
          <div className="section-label" style={{ marginBottom: "16px", justifyContent: "center" }}>03 / Results</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff", marginBottom: "20px",
          }}>
            Real Systems.<br />
            <span style={{ color: "var(--amber)" }}>Real Leads.</span>
          </h2>
          <p style={{ fontSize: "17px", fontWeight: 300, color: "rgba(255,255,255,0.5)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.75 }}>
            What happens when contractors stop guessing and start operating with infrastructure.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)" }}>
          {cases.map((cs) => (
            <div key={cs.industry} className="proof-card reveal" style={{ borderRadius: 0 }}>
              <div className="results-row" style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr auto", gap: "0", alignItems: "stretch" }}>
                <div style={{ background: "var(--bg4)", padding: "36px 28px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "10px" }}>{cs.industry}</div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{cs.type}</div>
                  </div>
                </div>
                <div style={{ padding: "36px 32px", borderRight: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(239,68,35,0.8)", marginBottom: "16px" }}>&#9888; Before</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {cs.before.points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                        <span style={{ color: "rgba(239,68,35,0.7)", flexShrink: 0, marginTop: "1px" }}>&#215;</span>
                        <span dangerouslySetInnerHTML={{ __html: pt }} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: "36px 32px", borderRight: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: "16px" }}>&#10003; After MDS</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {cs.after.points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--green)", flexShrink: 0, marginTop: "1px" }}>&#10003;</span>
                        <span dangerouslySetInnerHTML={{ __html: pt }} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: "36px 36px", minWidth: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div className="result-metric">{cs.metric}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>{cs.metricLabel}</div>
                  </div>
                  <div style={{ marginTop: "24px" }}>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, fontStyle: "italic", marginBottom: "8px" }}
                      dangerouslySetInnerHTML={{ __html: "“" + cs.quote + "”" }} />
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--amber)", letterSpacing: "0.04em" }}
                      dangerouslySetInnerHTML={{ __html: cs.source }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reveal grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--border)", marginTop: "1px", borderTop: "1px solid var(--border)" }}>
          {[
            { n: "48hrs", label: "Avg Deployment Time",  sub: "From audit to live system" },
            { n: "100%", label: "Lead Capture Rate",     sub: "Zero submissions lost" },
            { n: "< 2s",  label: "Notification Speed",   sub: "Owner alert on submission" },
            { n: "3.4x",  label: "Avg Pipeline Clarity",  sub: "Leads tracked vs. before" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--bg3)", padding: "40px 32px", textAlign: "center" }}>
              <div className="result-metric" style={{ fontSize: "clamp(36px,4vw,52px)" }}>{s.n}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.02em", textTransform: "uppercase", marginTop: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   PROCESS
───────────────────────────────────────── */
function ProcessSection() {
  const steps = [
    {
      n: "01",
      time: "Free · 30 minutes",
      title: "Lead Audit",
      desc: "We review your current situation &#8212; your site, your lead flow, your follow-up system &#8212; and identify exactly what&#8217;s leaking.",
      detail: "You get a written breakdown with specific recommendations. No obligation.",
    },
    {
      n: "02",
      time: "We handle everything",
      title: "Infrastructure Deployment",
      desc: "We build and deploy your lead capture form, backend database, admin dashboard, and notification system in 48 hours.",
      detail: "You get a preview before anything goes live. We handle AWS, code, and configuration.",
    },
    {
      n: "03",
      time: "Ongoing operations",
      title: "Monitor & Scale",
      desc: "Your system runs 24/7 with automated diagnostics. We monitor for issues and expand your infrastructure as your business grows.",
      detail: "30 days of priority support included. Most clients stay on a monthly retainer.",
    },
  ];

  return (
    <section id="process" className="section-pad" style={{ padding: "120px 48px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "end", marginBottom: "72px" }}>
          <div className="reveal">
            <div className="section-label" style={{ marginBottom: "16px" }}>04 / Deployment Process</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff",
            }}>
              From Audit to<br />
              <span style={{ color: "var(--amber)" }}>Live System</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>in 48 Hours</span>
            </h2>
          </div>
          <p className="reveal" style={{ fontSize: "17px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, alignSelf: "flex-end" }}>
            No lengthy discovery phases. No back-and-forth. We audit, we build, we deploy. Your system is live before most agencies finish their kickoff call.
          </p>
        </div>

        <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", position: "relative" }}>
          <div className="process-line" style={{
            position: "absolute", top: "68px",
            left: "calc(16.6% + 12px)", right: "calc(16.6% + 12px)",
            height: "1px", background: "linear-gradient(90deg, var(--amber) 0%, rgba(37,99,235,0.15) 100%)", zIndex: 0,
          }} />
          {steps.map((s) => (
            <div key={s.n} className="proc-step reveal" style={{ borderRadius: 0, position: "relative", zIndex: 1 }}>
              <div style={{
                width: "56px", height: "56px", background: "var(--bg4)", border: "1px solid var(--amber)", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 500, color: "var(--amber)",
                marginBottom: "28px", boxShadow: "0 0 24px rgba(37,99,235,0.2)",
              }}>{s.n}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(37,99,235,0.65)", marginBottom: "12px" }}>{s.time}</div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: "12px" }}>{s.title}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "20px" }}
                dangerouslySetInnerHTML={{ __html: s.desc }} />
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5, borderTop: "1px solid var(--border)", paddingTop: "16px", fontStyle: "italic" }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   PRICING
───────────────────────────────────────── */
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      setup: "$750",
      monthly: "$200/mo",
      desc: "Everything you need to start capturing leads and never miss an inquiry again.",
      features: [
        "Landing page deployment",
        "Lead capture form + database",
        "Automated owner notifications",
        "Mobile-first, sub-2s load time",
        "30 days of support",
      ],
      cta: "Get Started",
      featured: false,
    },
    {
      name: "Standard",
      setup: "$1,500",
      monthly: "$350/mo",
      desc: "Full lead infrastructure with real-time visibility and operational monitoring.",
      features: [
        "Everything in Starter",
        "Admin dashboard (all leads, status, export)",
        "Diagnostics & uptime monitoring",
        "Lead source tracking",
        "Priority support",
        "Monthly performance report",
      ],
      cta: "Deploy Standard",
      featured: true,
    },
    {
      name: "Premium",
      setup: "From $5,000",
      monthly: "Custom retainer",
      desc: "Custom operational systems for businesses that need more than a standard deployment.",
      features: [
        "Multi-page site or app",
        "Advanced integrations (CRM, scheduling)",
        "Custom operational dashboards",
        "Dedicated deployment pipeline",
        "SLA-backed monitoring",
        "Ongoing development retainer",
      ],
      cta: "Let's Talk",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="section-pad" style={{ padding: "120px 48px", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: "16px" }}>05 / Pricing</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff", marginBottom: "20px",
          }}>
            Transparent.<br />
            <span style={{ color: "var(--amber)" }}>Scalable.</span>
          </h2>
          <p style={{ fontSize: "17px", fontWeight: 300, color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.75 }}>
            One setup fee. One monthly retainer. No hourly billing, no surprise invoices.
          </p>
        </div>

        <div className="pricing-grid reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)" }}>
          {plans.map((p) => (
            <div key={p.name} className={`pricing-card${p.featured ? " featured" : ""}`} style={{ borderRadius: 0, display: "flex", flexDirection: "column" }}>
              {p.featured && (
                <div style={{
                  position: "absolute", top: "0", left: "0", right: "0",
                  height: "2px", background: "linear-gradient(90deg, transparent, var(--amber), transparent)",
                }} />
              )}
              {p.featured && (
                <div style={{
                  display: "inline-block", marginBottom: "16px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase",
                  background: "rgba(37,99,235,0.15)", color: "var(--amber)", border: "1px solid rgba(37,99,235,0.3)",
                  padding: "4px 12px", borderRadius: "4px", width: "fit-content",
                }}>Most Popular</div>
              )}

              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "12px" }}>{p.name}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>{p.setup}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>setup &nbsp;+&nbsp; {p.monthly}</div>
              </div>

              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "28px", marginTop: "16px" }}>{p.desc}</p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--green)", flexShrink: 0, marginTop: "1px", fontSize: "13px" }}>&#10003;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a href="#contact" className={p.featured ? "btn-amber" : "btn-ghost"} style={{ justifyContent: "center", fontSize: "14px" }}>
                {p.cta} &#8594;
              </a>
            </div>
          ))}
        </div>

        <div className="reveal" style={{ textAlign: "center", marginTop: "36px" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
            Not sure which tier fits? &nbsp;&#183;&nbsp; Start with the free audit and we&#8217;ll tell you exactly what you need.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CTA SECTION
───────────────────────────────────────── */
function CTASection() {
  return (
    <section className="section-pad" style={{
      background: "var(--bg)", padding: "120px 48px",
      borderTop: "1px solid var(--border)", position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div className="cta-glow" />
      <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none" }} />
      <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="reveal">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <span className="amber-badge">
              <span className="amber-badge-dot" />
              Free Audit Available This Week
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(48px, 7vw, 100px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.87, color: "#fff", marginBottom: "28px",
          }}>
            Stop Losing<br />
            <span style={{ color: "var(--amber)" }}>Jobs to a</span><br />
            <span style={{ color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.22)" }}>Broken System</span>
          </h2>
          <p style={{ fontSize: "18px", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: "44px" }}>
            Every day without a real lead system is a day your competitors are filling their pipeline while yours leaks. We&#8217;ll fix that in 48 hours.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            <a href="#contact" className="btn-amber" style={{ fontSize: "16px", padding: "20px 44px" }}>
              Get My Free Lead Audit &#8594;
            </a>
            <a href="tel:4129446450" className="btn-ghost" style={{ fontSize: "16px", padding: "20px 28px" }}>
              &#128222; Call Now
            </a>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
            Free audit &nbsp;&#183;&nbsp; No commitment &nbsp;&#183;&nbsp; Deployed in 48 hours
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CONTACT SECTION
───────────────────────────────────────── */
function ContactSection() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", company: "", industry: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const apiBase = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiBase}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email:    form.email,
          phone:    form.phone,
          company:  form.company,
          category: form.industry,
          message:  form.message,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly at info@mooreds.net.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-pad" style={{ padding: "120px 48px", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "80px", alignItems: "start" }}>

          <div className="reveal-l">
            <div className="section-label" style={{ marginBottom: "20px" }}>06 / Contact</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 4.5vw, 68px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#fff", marginBottom: "24px",
            }}>
              Start With a<br />
              Free <span style={{ color: "var(--amber)" }}>Lead Audit</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>Today</span>
            </h2>
            <p style={{ fontSize: "16px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: "44px" }}>
              Tell us where you are now. We&#8217;ll show you exactly what&#8217;s missing and what it would take to deploy a real lead system for your business.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { icon: "&#9993;",  label: "Email",        val: "info@mooreds.net"   },
                { icon: "&#128222;",label: "Phone",        val: "(412)-944-6450"     },
                { icon: "&#9889;",  label: "Response",     val: "Within 2 hours"     },
                { icon: "&#127759;",label: "Deployments",  val: "Nationwide — Remote" },
              ].map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{
                    width: "40px", height: "40px", background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.15)",
                    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0,
                  }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "2px" }}>{c.label}</div>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: "#fff" }}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal form-box" style={{
            background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "8px",
            padding: "52px 48px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: "32px", right: "32px", height: "2px", background: "linear-gradient(90deg, transparent, var(--amber), transparent)", opacity: 0.6 }} />

            {sent ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>&#9989;</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "28px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Audit Request Received</h3>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                  We&#8217;ll review your situation and respond within 2 hours with a clear breakdown and next steps. Check your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                  Get a Free Lead Audit
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "36px" }}>
                  Tell us where your leads are coming from &#8212; and where they&#8217;re going. We&#8217;ll show you what&#8217;s leaking, free.
                </p>

                <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Full Name *</label>
                    <input type="text" required placeholder="Your Name" className="form-input"
                      value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Email *</label>
                    <input type="email" required placeholder="you@company.com" className="form-input"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Phone *</label>
                    <input type="tel" required placeholder="(555) 000-0000" className="form-input"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Business Name</label>
                    <input type="text" placeholder="Your Business" className="form-input"
                      value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Industry</label>
                  <select className="form-input" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} style={{ cursor: "pointer", appearance: "none" }}>
                    <option value="">Select your industry...</option>
                    <option>Roofing</option>
                    <option>HVAC</option>
                    <option>General Contracting</option>
                    <option>Metal Buildings</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Landscaping</option>
                    <option>Garage &amp; Doors</option>
                    <option>Other Local Service</option>
                  </select>
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>What does your current lead situation look like? *</label>
                  <textarea required rows={4} placeholder="Where do leads come from now? How do you track them? What's not working?" className="form-input"
                    style={{ resize: "vertical", minHeight: "100px" }}
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>

                <button type="submit" className="btn-amber" disabled={loading}
                  style={{ width: "100%", justifyContent: "center", fontSize: "15px", padding: "18px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Sending…" : "Request My Free Lead Audit ↗"}
                </button>

                {error && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#f87171", textAlign: "center", marginTop: "12px", letterSpacing: "0.03em" }}>{error}</p>
                )}
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "14px", letterSpacing: "0.04em" }}>
                  &#128274; 100% Private &nbsp;&#183;&nbsp; No Spam &nbsp;&#183;&nbsp; Reply Within 2 Hours
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer-pad" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "52px 48px 36px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="footer-grid grid-4col" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "48px", paddingBottom: "48px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ marginBottom: "16px" }}>
              <img src="/logo.png" alt="Moore Digital Solutions" style={{ height: "64px", width: "auto" }} />
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "260px", marginBottom: "24px", fontWeight: 300 }}>
              Lead infrastructure and operational systems for contractors and high-ticket local businesses. Deployed in 48 hours.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["fb", "in", "ig", "X"].map((s) => (
                <a key={s} href="#" style={{
                  width: "32px", height: "32px", border: "1px solid var(--border2)", borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500,
                  color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "border-color 0.2s, color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)"; e.currentTarget.style.color = "var(--amber)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                >{s}</a>
              ))}
            </div>
          </div>

          {[
            {
              title: "What We Build",
              links: ["Lead Capture Systems", "Admin Dashboards", "Landing Pages", "Diagnostics & Monitoring", "Custom Integrations"],
            },
            {
              title: "Industries",
              links: ["Roofing", "HVAC", "General Contracting", "Metal Buildings", "Local Services"],
            },
            {
              title: "Contact",
              links: ["info@mooreds.net", "(412)-944-6450", "Free Lead Audit", "Pricing"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "16px" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 300, transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#fff"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "28px", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em" }}>
            &#169; 2026 Moore Digital Solutions. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)" }} />
            All systems operational &nbsp;&#183;&nbsp; Accepting new clients
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
export default function App() {
  useReveal();

  useEffect(() => {
    const bar = document.getElementById("scroll-bar");
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (bar) bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <GlobalStyles />
      <div id="scroll-bar" style={{
        position: "fixed", top: 0, left: 0, height: "2px",
        background: "var(--amber)", zIndex: 9800,
        transition: "width 0.1s linear", width: "0%", pointerEvents: "none",
      }} />
      <Nav />
      <main>
        <Hero />
        <QuickProcessSection />
        <ProblemSection />
        <ServicesSection />
        <ResultsSection />
        <ProcessSection />
        <PricingSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
