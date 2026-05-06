import { useState, useEffect, useRef } from "react";

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

    /* Scrollbar */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--amber); border-radius: 2px; }

    /* Dot grid background */
    .dot-grid {
      background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 32px 32px;
    }

    /* Amber glow orb */
    .hero-glow {
      position: absolute;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%);
      border-radius: 50%;
      pointer-events: none;
    }

    /* Animations */
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
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes border-spin {
      to { --angle: 360deg; }
    }

    .animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    .animate-fade-in { animation: fade-in 0.6s ease both; }

    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }
    .delay-6 { animation-delay: 0.6s; }

    /* Reveal on scroll */
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal.in {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-l {
      opacity: 0;
      transform: translateX(-24px);
      transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1);
    }
    .reveal-l.in {
      opacity: 1;
      transform: translateX(0);
    }

    /* Amber button */
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

    /* Ghost button */
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

    /* Card hover */
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

    /* Proof card */
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

    /* Amber text */
    .text-amber { color: var(--amber); }

    /* Monospace */
    .mono { font-family: 'JetBrains Mono', monospace; }

    /* Section label */
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

    /* Pain item */
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

    /* Process step */
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

    /* Stats bar */
    .stat-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--amber), var(--amber-l));
      border-radius: 2px;
      transition: width 1.5s cubic-bezier(0.16,1,0.3,1);
    }

    /* Nav */
    .nav-scrolled {
      background: rgba(10,10,10,0.92) !important;
      backdrop-filter: blur(20px) saturate(1.5);
      border-bottom: 1px solid var(--border) !important;
    }

    /* Scanline decor */
    .scanlines {
      background-image: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255,255,255,0.012) 2px,
        rgba(255,255,255,0.012) 4px
      );
    }

    /* Amber badge */
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

    /* Trust pill */
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

    /* Result metric */
    .result-metric {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: clamp(44px, 5vw, 68px);
      line-height: 1;
      letter-spacing: -0.04em;
      color: var(--amber);
    }

    /* Gradient heading */
    .gradient-text {
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* CTA section glow */
    .cta-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(37,99,235,0.08), transparent 65%);
      pointer-events: none;
    }

    /* Quick process grid — responsive */
    .quick-process-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: var(--border);
    }

    /* ── HAMBURGER BUTTON ── */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      cursor: pointer;
      background: transparent;
      border: none;
      padding: 0;
      flex-shrink: 0;
    }
    .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: #fff;
      border-radius: 2px;
      transition: transform 0.25s, opacity 0.25s;
    }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── MOBILE NAV MENU ── */
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

    /* ── RESPONSIVE BREAKPOINTS ── */
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

      .sticky-col   { position: static !important; top: auto !important; }
      .process-line { display: none !important; }
      .results-row  { grid-template-columns: 1fr !important; }

      .quick-process-grid { grid-template-columns: 1fr !important; }
      .proc-step { padding: 32px 24px !important; }
      .service-card { padding: 28px 24px !important; }

      .pain-item { padding: 20px 0 !important; }

      .result-metric { font-size: clamp(36px, 10vw, 52px) !important; }
    }

    @media (max-width: 540px) {
      .grid-4col { grid-template-columns: 1fr !important; }
      .footer-grid { grid-template-columns: 1fr !important; }
    }

    /* Input styles */
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
   SCROLL REVEAL HOOK
───────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-l");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el, i) => {
      if (el.dataset.delay) {
        // handled inline
      }
      observer.observe(el);
    });
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
    { label: "Results", href: "#results" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ];

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`main-nav${scrolled ? " nav-scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          height: "68px",
          transition: "background 0.3s, border-color 0.3s",
          borderBottom: "1px solid transparent",
        }}
      >
        {/* Logo */}
        <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src="/logo.png" alt="Moore Digital Solutions" style={{ height: "56px", width: "auto" }} />
        </a>

        {/* Desktop links */}
        <ul className="nav-links" style={{ display: "flex", gap: "32px", listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
              >{l.label}</a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="#contact" className="btn-amber nav-cta" style={{ padding: "10px 22px", fontSize: "13px" }}>
            Get a Free Audit &#8594;
          </a>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {links.map((l) => (
          <a key={l.label} href={l.href} onClick={close}>{l.label}</a>
        ))}
        <a href="#contact" onClick={close} style={{ color: "var(--amber)" }}>
          Get a Free Audit &#8594;
        </a>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────── */
function Hero() {
  return (
    <section
      id="hero"
      className="dot-grid scanlines hero-section"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 48px 80px",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg)",
        textAlign: "center",
      }}
    >
      {/* Ambient glow */}
      <div className="hero-glow" style={{ top: "30%", left: "50%", transform: "translate(-50%,-50%)" }} />
      <div className="hero-glow" style={{ top: "75%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "500px", opacity: 0.4 }} />

      <div style={{ maxWidth: "900px", width: "100%", position: "relative", zIndex: 2 }}>

        {/* Eyebrow */}
        <div className="animate-fade-up delay-1" style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}>
          <span className="amber-badge">
            <span className="amber-badge-dot" />
            &#9889; 24&#8211;48 Hour Turnaround &#183; Now Accepting Projects
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(40px, 7vw, 100px)",
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            color: "#fff",
            marginBottom: "28px",
          }}
        >
          We Fix and Build Websites That<br />
          <span style={{ color: "var(--amber)" }}>Bring You More Customers</span><br />
          <span style={{ color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.22)" }}>— In 24 Hours.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-up delay-3"
          style={{
            fontSize: "clamp(16px, 1.8vw, 20px)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: "580px",
            margin: "0 auto 44px",
          }}
        >
          Outdated site? Slow load times? Losing customers? We fix it fast so you can{" "}
          <strong style={{ color: "#fff", fontWeight: 600 }}>focus on your business.</strong>
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-4" style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginBottom: "56px" }}>
          <a href="#contact" className="btn-amber" style={{ fontSize: "16px", padding: "18px 40px" }}>
            Get Your Site Fixed Today &#8594;
          </a>
          <a href="#services" className="btn-ghost" style={{ fontSize: "16px", padding: "18px 32px" }}>
            View What We Do
          </a>
        </div>

        {/* Trust pills */}
        <div className="animate-fade-up delay-5" style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "&#9889;", text: "24hr Delivery" },
            { icon: "&#128241;", text: "Mobile-First" },
            { icon: "&#127919;", text: "Conversion-Optimized" },
            { icon: "&#9989;", text: "Fixed Price" },
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
   NEW PROCESS SECTION
───────────────────────────────────────── */
function QuickProcessSection() {
  const steps = [
    {
      icon: "&#128279;",
      num: "01",
      title: "Send Your Website",
      desc: "We review your current site and identify what's costing you customers.",
    },
    {
      icon: "&#9889;",
      num: "02",
      title: "We Fix It in 24–48 Hours",
      desc: "Speed, mobile optimization, and clean design — done fast.",
    },
    {
      icon: "&#128200;",
      num: "03",
      title: "You Get More Customers",
      desc: "Better experience = more calls, bookings, and sales.",
    },
  ];

  return (
    <section className="quick-process-wrap" style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", padding: "96px 48px 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <div className="section-label" style={{ justifyContent: "center", marginBottom: "16px" }}>How It Works</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            color: "#fff",
          }}>
            Simple. Fast. <span style={{ color: "var(--amber)" }}>Effective.</span>
          </h2>
        </div>

        {/* Steps grid */}
        <div className="quick-process-grid">
          {steps.map((s, i) => (
            <div key={s.num} className="reveal" style={{
              background: "var(--bg3)",
              padding: "48px 40px",
              position: "relative",
              textAlign: "center",
              animationDelay: `${i * 0.1}s`,
            }}>
              {/* Connector arrow — hidden on last */}
              {i < 2 && (
                <div style={{
                  position: "absolute",
                  top: "52px",
                  right: "-13px",
                  zIndex: 2,
                  width: "26px",
                  height: "26px",
                  background: "var(--bg2)",
                  border: "1px solid var(--border2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  color: "var(--amber)",
                }}>&#8594;</div>
              )}

              {/* Icon circle */}
              <div style={{
                width: "64px", height: "64px",
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.2)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px",
                margin: "0 auto 20px",
              }} dangerouslySetInnerHTML={{ __html: s.icon }} />

              {/* Step number */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--amber)",
                marginBottom: "12px",
              }}>Step {s.num}</div>

              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#fff",
                marginBottom: "12px",
              }}>{s.title}</h3>

              <p style={{
                fontSize: "15px",
                fontWeight: 300,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
                maxWidth: "260px",
                margin: "0 auto",
              }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <div className="reveal quick-cta-inner" style={{
        maxWidth: "780px",
        margin: "72px auto 0",
        padding: "64px 48px",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(37,99,235,0.06), transparent 70%)",
          pointerEvents: "none",
        }} />
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#fff",
          marginBottom: "28px",
          position: "relative",
          zIndex: 1,
        }}>
          Get Your Website Fixed Today
        </h2>
        <a href="#contact" className="btn-amber" style={{ fontSize: "16px", padding: "18px 48px", position: "relative", zIndex: 1 }}>
          Start Now &#8594;
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
      title: "Your website looks like it was built in 2014",
      desc: "Outdated design loses trust in seconds. If your site looks old, customers assume you&#8217;re out of business.",
      impact: "68% of users won&#8217;t return after a bad first impression.",
    },
    {
      num: "02",
      title: "It loads so slowly people leave before seeing anything",
      desc: "Every second of load time costs you customers. Slow sites don&#8217;t get second chances.",
      impact: "53% of mobile users abandon sites that take over 3 seconds.",
    },
    {
      num: "03",
      title: "On mobile it looks completely broken",
      desc: "Over 60% of your traffic is on a phone. A broken mobile site means lost customers before they read a word.",
      impact: "61% of mobile users won&#8217;t return to a site with mobile issues.",
    },
    {
      num: "04",
      title: "There&#8217;s no clear reason to contact you",
      desc: "No clear call-to-action means visitors leave without contacting you. Your site needs to sell, not just sit there.",
      impact: "Websites without a clear CTA lose up to 40% of potential leads.",
    },
  ];

  return (
    <section
      id="problem"
      className="section-pad"
      style={{
        background: "var(--bg2)",
        padding: "120px 48px",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="grid-2col" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "80px",
          alignItems: "start",
        }}>
          {/* Left */}
          <div className="reveal-l sticky-col" style={{ position: "sticky", top: "100px" }}>
            <div className="section-label" style={{ marginBottom: "20px" }}>The Problem</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(42px, 5vw, 72px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              color: "#fff",
              marginBottom: "24px",
            }}>
              Your Website Is Costing You<br />
              <span style={{ color: "var(--amber)" }}>Customers</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>Every Day</span>
            </h2>
            <p style={{ fontSize: "16px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: "32px" }}>
              Your site is either making you money or costing you customers. There&#8217;s no middle ground.
            </p>
            <div style={{
              background: "rgba(37,99,235,0.07)",
              border: "1px solid rgba(37,99,235,0.2)",
              borderRadius: "8px",
              padding: "20px 24px",
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--amber)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Bottom Line</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "#fff", lineHeight: 1.6 }}>
                A bad website isn&#8217;t just embarrassing &#8212; it&#8217;s sending customers straight to your competitors.
              </div>
            </div>
          </div>

          {/* Right — pain items */}
          <div className="reveal">
            {pains.map((p) => (
              <div key={p.num} className="pain-item">
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  color: "var(--amber)",
                  flexShrink: 0,
                  paddingTop: "3px",
                  opacity: 0.7,
                }}>{p.num}</div>
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                  <h3 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                  }} dangerouslySetInnerHTML={{ __html: p.title }} />
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "12px" }}
                    dangerouslySetInnerHTML={{ __html: p.desc }} />
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: "rgba(239,68,35,0.9)",
                    background: "rgba(239,68,35,0.08)",
                    border: "1px solid rgba(239,68,35,0.2)",
                    padding: "4px 10px",
                    borderRadius: "4px",
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
      icon: "&#9889;",
      label: "24-Hour Fix",
      name: "Website Fixes & Repairs",
      desc: "Something&#8217;s broken and it&#8217;s costing you customers. We find it, fix it, and hand it back by tomorrow.",
      outcome: "Stop losing customers to a broken site. Fixed in 24 hours, guaranteed.",
      badge: "Most Popular",
    },
    {
      icon: "&#128640;",
      label: "48-Hour Build",
      name: "Landing Page Builds",
      desc: "A focused page built to turn visitors into leads &#8212; done in 48 hours.",
      outcome: "A page that actually converts visitors into paying customers.",
      badge: null,
    },
    {
      icon: "&#128241;",
      label: "Mobile & Speed",
      name: "Mobile Optimization",
      desc: "We make your site look perfect on every phone and device. No exceptions.",
      outcome: "60% of your traffic is on mobile. Now it won&#8217;t leave.",
      badge: null,
    },
    {
      icon: "&#9889;&#65039;",
      label: "Performance",
      name: "Speed Optimization",
      desc: "We make your site load in under 2 seconds. Faster sites rank higher and close more.",
      outcome: "Faster site, better rankings, more conversions.",
      badge: null,
    },
    {
      icon: "&#127919;",
      label: "Lead Systems",
      name: "Lead Generation Setup",
      desc: "We set up forms and capture systems so your site brings in leads automatically.",
      outcome: "Wake up to new leads in your inbox. Automated, 24/7.",
      badge: null,
    },
    {
      icon: "&#128269;",
      label: "Full Audit",
      name: "Website Audit & Strategy",
      desc: "We review your site and tell you exactly what&#8217;s hurting your business &#8212; free.",
      outcome: "A clear action plan. Know what to fix and in what order.",
      badge: "Free Intro Offer",
    },
  ];

  return (
    <section id="services" className="section-pad" style={{ padding: "120px 48px", background: "var(--bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "56px", flexWrap: "wrap", gap: "24px" }}>
          <div className="reveal">
            <div className="section-label" style={{ marginBottom: "16px" }}>02 / Services</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 5vw, 72px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              color: "#fff",
            }}>
              Everything Your<br />
              <span style={{ color: "var(--amber)" }}>Website Needs</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>to Perform</span>
            </h2>
          </div>
          <a href="#contact" className="btn-amber reveal" style={{ alignSelf: "flex-end", flexShrink: 0 }}>
            Get Started &#8594;
          </a>
        </div>

        {/* Grid */}
        <div className="grid-3col" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px",
          background: "var(--border)",
        }}>
          {services.map((s, i) => (
            <div key={s.name} className="service-card reveal" style={{ borderRadius: 0, animationDelay: `${i * 0.08}s` }}>
              {s.badge && (
                <div style={{
                  position: "absolute", top: "18px", right: "18px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 500,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "rgba(37,99,235,0.12)", color: "var(--amber)",
                  border: "1px solid rgba(37,99,235,0.25)",
                  padding: "3px 10px", borderRadius: "4px",
                }}>{s.badge}</div>
              )}
              <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "48px", height: "48px",
                  background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.15)",
                  borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px",
                  transition: "background 0.25s, border-color 0.25s",
                }} dangerouslySetInnerHTML={{ __html: s.icon }} />
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)" }}>{s.label}</div>
              </div>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "20px", fontWeight: 700,
                letterSpacing: "-0.02em", color: "#fff", marginBottom: "10px",
              }}>{s.name}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "20px" }}
                dangerouslySetInnerHTML={{ __html: s.desc }} />
              <div style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--amber)",
                display: "flex", alignItems: "flex-start", gap: "8px",
              }}>
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
   RESULTS / PROOF
───────────────────────────────────────── */
function ResultsSection() {
  const caseStudies = [
    {
      industry: "Local Service Business",
      type: "Website Fix + Landing Page",
      before: {
        headline: "The Before",
        points: ["7-second load time", "No mobile optimization", "Zero lead capture", "2.1% bounce-back rate"],
      },
      after: {
        headline: "After Moore Digital",
        points: ["1.4s load time", "Perfect mobile score", "42 leads in first month", "3.8% conversion rate"],
      },
      metric: "19x",
      metricLabel: "More Leads Generated",
      quote: "Our phone hasn&#8217;t stopped ringing since the new site went live. We had more inquiries in the first week than the entire previous quarter.",
      source: "&#8212; Roofing contractor, Texas",
    },
    {
      industry: "E-Commerce Brand",
      type: "Speed Optimization",
      before: {
        headline: "The Before",
        points: ["5.8s average load", "42 PageSpeed score", "High cart abandonment", "Page rank dropping"],
      },
      after: {
        headline: "After Moore Digital",
        points: ["1.8s average load", "94 PageSpeed score", "Cart recovery up 31%", "Page rank climbing"],
      },
      metric: "+47%",
      metricLabel: "Revenue Increase",
      quote: "I didn&#8217;t realize how much money I was leaving on the table with a slow site. The ROI on this was obvious within two weeks.",
      source: "&#8212; Apparel brand founder, Nashville",
    },
    {
      industry: "Professional Services",
      type: "Full Site Rebuild",
      before: {
        headline: "The Before",
        points: ["Desktop-only layout", "No contact forms", "Outdated 2016 design", "0 organic leads monthly"],
      },
      after: {
        headline: "After Moore Digital",
        points: ["Fully responsive", "Multi-step intake form", "Modern, trust-building", "23 leads in month one"],
      },
      metric: "23",
      metricLabel: "New Clients Month 1",
      quote: "My old site made us look like a small operation. The new one makes us look like the firm we actually are. Closing rates on calls went up immediately.",
      source: "&#8212; Law firm, Atlanta",
    },
  ];

  return (
    <section id="results" className="section-pad" style={{ padding: "120px 48px", background: "var(--bg2)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "72px" }}>
          <div className="section-label" style={{ marginBottom: "16px", justifyContent: "center" }}>03 / Results</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(40px, 5vw, 72px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            color: "#fff",
            marginBottom: "20px",
          }}>
            Real Transformations.<br />
            <span style={{ color: "var(--amber)" }}>Measurable Results.</span>
          </h2>
          <p style={{ fontSize: "17px", fontWeight: 300, color: "rgba(255,255,255,0.5)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.75 }}>
            Real results from real businesses. No fluff.
          </p>
        </div>

        {/* Case studies */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--border)" }}>
          {caseStudies.map((cs, i) => (
            <div key={cs.industry} className="proof-card reveal" style={{ borderRadius: 0 }}>
              <div className="results-row" style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr 1fr auto",
                gap: "0",
                alignItems: "stretch",
              }}>
                {/* Label col */}
                <div style={{
                  background: "var(--bg4)",
                  padding: "36px 28px",
                  borderRight: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "10px" }}>
                      {cs.industry}
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{cs.type}</div>
                  </div>
                </div>

                {/* Before */}
                <div style={{ padding: "36px 32px", borderRight: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(239,68,35,0.8)", marginBottom: "16px" }}>
                    &#9888; Before
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {cs.before.points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                        <span style={{ color: "rgba(239,68,35,0.7)", flexShrink: 0, marginTop: "1px" }}>&#215;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* After */}
                <div style={{ padding: "36px 32px", borderRight: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: "16px" }}>
                    &#10003; After Moore Digital
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {cs.after.points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--green)", flexShrink: 0, marginTop: "1px" }}>&#10003;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metric + quote */}
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

        {/* Stats row */}
        <div className="reveal grid-4col" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px",
          background: "var(--border)",
          marginTop: "1px",
          borderTop: "1px solid var(--border)",
        }}>
          {[
            { n: "24hrs", label: "Average Fix Time", sub: "From submit to delivered" },
            { n: "94%", label: "Client Retention", sub: "Come back for more" },
            { n: "3.2s", label: "Avg Load Improvement", sub: "After speed optimization" },
            { n: "2.8x", label: "Avg Conversion Lift", sub: "After site improvements" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--bg3)",
              padding: "40px 32px",
              textAlign: "center",
            }}>
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
      time: "Takes you 5 minutes",
      title: "Send Us Your Website",
      desc: "Fill out a quick form with your URL and what needs fixing. No calls, no questionnaires.",
      detail: "We review your site within 2 hours and confirm scope + price.",
    },
    {
      n: "02",
      time: "We handle everything",
      title: "We Fix or Build It Fast",
      desc: "We get to work immediately. Fixes in 24 hours. Full builds in 48 hours. No check-ins needed.",
      detail: "You get a preview before anything goes live.",
    },
    {
      n: "03",
      time: "Your business grows",
      title: "You Get More Customers",
      desc: "Your site goes live &#8212; faster, cleaner, and built to bring in customers.",
      detail: "30 days of support included after delivery.",
    },
  ];

  return (
    <section id="process" className="section-pad" style={{ padding: "120px 48px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "end", marginBottom: "72px" }}>
          <div className="reveal">
            <div className="section-label" style={{ marginBottom: "16px" }}>04 / Process</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 5vw, 72px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              color: "#fff",
            }}>
              3 Steps to a<br />
              <span style={{ color: "var(--amber)" }}>Website</span> That<br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>Converts</span>
            </h2>
          </div>
          <p className="reveal" style={{
            fontSize: "17px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, alignSelf: "flex-end",
          }}>
            No lengthy contracts. No back-and-forth. Just fast execution and a working site.
          </p>
        </div>

        {/* Steps */}
        <div className="grid-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", position: "relative" }}>
          {/* Connecting line */}
          <div className="process-line" style={{
            position: "absolute",
            top: "68px",
            left: "calc(16.6% + 12px)",
            right: "calc(16.6% + 12px)",
            height: "1px",
            background: "linear-gradient(90deg, var(--amber) 0%, rgba(37,99,235,0.15) 100%)",
            zIndex: 0,
          }} />

          {steps.map((s, i) => (
            <div key={s.n} className="proc-step reveal" style={{ borderRadius: 0, position: "relative", zIndex: 1 }}>
              <div style={{
                width: "56px", height: "56px",
                background: "var(--bg4)",
                border: "1px solid var(--amber)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 500,
                color: "var(--amber)",
                marginBottom: "28px",
                boxShadow: "0 0 24px rgba(37,99,235,0.2)",
              }}>{s.n}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(37,99,235,0.65)", marginBottom: "12px" }}>
                {s.time}
              </div>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "22px", fontWeight: 700,
                letterSpacing: "-0.02em", color: "#fff", marginBottom: "12px",
              }}>{s.title}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: "20px" }}
                dangerouslySetInnerHTML={{ __html: s.desc }} />
              <div style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1.5,
                borderTop: "1px solid var(--border)",
                paddingTop: "16px",
                fontStyle: "italic",
              }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FINAL CTA SECTION
───────────────────────────────────────── */
function CTASection() {
  return (
    <section className="section-pad" style={{
      background: "var(--bg2)",
      padding: "120px 48px",
      borderTop: "1px solid var(--border)",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
    }}>
      <div className="cta-glow" />
      {/* Grid overlay */}
      <div className="dot-grid" style={{
        position: "absolute", inset: 0, opacity: 0.3, pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="reveal">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <span className="amber-badge">
              <span className="amber-badge-dot" />
              Limited Spots Available This Week
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(48px, 7vw, 100px)",
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 0.87,
            color: "#fff",
            marginBottom: "28px",
          }}>
            Get Your Site<br />
            <span style={{ color: "var(--amber)" }}>Fixed in 24</span><br />
            <span style={{ color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.22)" }}>Hours</span>
          </h2>

          <p style={{
            fontSize: "18px", fontWeight: 300, color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75, marginBottom: "44px",
          }}>
            Don&#8217;t lose another customer to a bad website. Send it to us today &#8212; we&#8217;ll fix it by tomorrow.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            <a href="#contact" className="btn-amber" style={{ fontSize: "16px", padding: "20px 44px" }}>
              Fix My Website Now &#8594;
            </a>
            <a href="tel:4129446450" className="btn-ghost" style={{ fontSize: "16px", padding: "20px 28px" }}>
              &#128222; Call Now
            </a>
          </div>

          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
            No commitment &nbsp;&#183;&nbsp; Free initial audit &nbsp;&#183;&nbsp; Fixed price, no surprises
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
  const [form, setForm] = useState({ name: "", email: "", business: "", website: "", service: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          business: form.business,
          website: form.website,
          message: `Service: ${form.service || "Not specified"}\n\n${form.message}`,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-pad" style={{ padding: "120px 48px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "80px", alignItems: "start" }}>

          {/* Left */}
          <div className="reveal-l">
            <div className="section-label" style={{ marginBottom: "20px" }}>05 / Contact</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 4.5vw, 68px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              color: "#fff",
              marginBottom: "24px",
            }}>
              Let&#8217;s Fix<br />
              Your <span style={{ color: "var(--amber)" }}>Website</span><br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>Today</span>
            </h2>
            <p style={{ fontSize: "16px", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: "44px" }}>
              Tell us what&#8217;s broken. We respond within 2 hours with a fixed price &#8212; no vague quotes, no surprises.
            </p>

            {/* Contact items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { icon: "&#9993;", label: "Email", val: "info@mooreds.net" },
                { icon: "&#128222;", label: "Phone", val: "(412)-944-6450" },
                { icon: "&#9889;", label: "Response", val: "Within 2 hours" },
                { icon: "&#127758;", label: "Service Area", val: "Worldwide — Remote" },
              ].map((c) => (
                <div key={c.label} style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "18px 0",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: "40px", height: "40px",
                    background: "rgba(37,99,235,0.07)",
                    border: "1px solid rgba(37,99,235,0.15)",
                    borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", flexShrink: 0,
                  }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "2px" }}>{c.label}</div>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: "#fff" }}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="reveal form-box" style={{
            background: "var(--bg3)",
            border: "1px solid var(--border2)",
            borderRadius: "8px",
            padding: "52px 48px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: "32px", right: "32px", height: "2px", background: "linear-gradient(90deg, transparent, var(--amber), transparent)", opacity: 0.6 }} />

            {sent ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>&#9989;</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "28px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>We Got It!</h3>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                  Expect a response from us within 2 hours with a clear plan and fixed price. Keep an eye on your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "24px", fontWeight: 700,
                  color: "#fff", letterSpacing: "-0.02em", marginBottom: "8px",
                }}>Get a Free Website Audit</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "36px" }}>
                  We&#8217;ll review your site and send you a full breakdown of exactly what to fix &#8212; free, no strings.
                </p>

                <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Name *</label>
                    <input type="text" required placeholder="Your Name" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Email *</label>
                    <input type="email" required placeholder="you@company.com" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                <div className="form-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Business Name</label>
                    <input type="text" placeholder="Your Business" className="form-input" value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>Website URL *</label>
                    <input type="url" required placeholder="https://yoursite.com" className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>What Do You Need?</label>
                  <select className="form-input" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={{ cursor: "pointer", appearance: "none" }}>
                    <option value="">Select a service...</option>
                    <option>Website Fix (24hr)</option>
                    <option>Landing Page Build</option>
                    <option>Mobile Optimization</option>
                    <option>Speed Optimization</option>
                    <option>Lead Generation Setup</option>
                    <option>Free Audit + Strategy</option>
                    <option>Not sure yet</option>
                  </select>
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>What&#8217;s the main problem?</label>
                  <textarea rows={3} placeholder="Describe what's broken or what you want to improve..." className="form-input" style={{ resize: "vertical", minHeight: "90px" }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>

                <button type="submit" className="btn-amber" disabled={loading} style={{ width: "100%", justifyContent: "center", fontSize: "15px", padding: "18px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Sending…" : "Send My Free Audit Request ↗"}
                </button>
                {error && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#f87171", textAlign: "center", marginTop: "12px", letterSpacing: "0.03em" }}>
                    {error}
                  </p>
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
    <footer className="footer-pad" style={{
      background: "var(--bg)",
      borderTop: "1px solid var(--border)",
      padding: "52px 48px 36px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="footer-grid grid-4col" style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: "48px",
          paddingBottom: "48px",
          borderBottom: "1px solid var(--border)",
        }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <img src="/logo.png" alt="Moore Digital Solutions" style={{ height: "64px", width: "auto" }} />
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "260px", marginBottom: "24px", fontWeight: 300 }}>
              Fast, high-converting websites for businesses that can&#8217;t afford to wait. Fixes in 24 hours. Builds in 48. Results guaranteed.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["fb", "in", "ig", "X"].map((s) => (
                <a key={s} href="#" style={{
                  width: "32px", height: "32px",
                  border: "1px solid var(--border2)",
                  borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500,
                  color: "rgba(255,255,255,0.35)",
                  textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)"; e.currentTarget.style.color = "var(--amber)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                >{s}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Services",
              links: ["Website Fixes", "Landing Pages", "Mobile Optimization", "Speed Optimization", "Lead Generation"],
            },
            {
              title: "Company",
              links: ["Portfolio", "Process", "Results", "FAQ", "Contact"],
            },
            {
              title: "Contact",
              links: ["info@mooreds.net", "(412)-944-6450", "Free Audit", "Book a Call"],
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

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: "28px", flexWrap: "wrap", gap: "12px",
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em" }}>
            &#169; 2025 Moore Digital Solutions. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)" }} />
            All systems operational &nbsp;&#183;&nbsp; Taking new projects
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

  // Scroll progress bar
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
      {/* Scroll progress */}
      <div id="scroll-bar" style={{
        position: "fixed", top: 0, left: 0, height: "2px",
        background: "var(--amber)", zIndex: 9800,
        transition: "width 0.1s linear", width: "0%",
        pointerEvents: "none",
      }} />
      <Nav />
      <main>
        <Hero />
        <QuickProcessSection />
        <ProblemSection />
        <ServicesSection />
        <ResultsSection />
        <ProcessSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

