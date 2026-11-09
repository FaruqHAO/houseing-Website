import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, House, Menu, X } from 'lucide-react';
import './styles.css';

const base = 'https://cdn.sceneai.art/';
const heroImage = base + 'Bg%20images/1dd58514-cedb-4f70-9aee-709c3f887808.png';
const videoSource = base + 'Hero%20Section%20Video/adec243d-ffda-48cf-a8a8-26e6d6bcbe9b.mp4';
const houses = [
  'c789ac4d-f2c8-463a-93f6-1f8c6fa09f9a',
  'bf2e3004-db02-48a1-8e15-c6a58c158b5c',
  'dce07180-2db9-45fe-889a-7a11657c6234',
];

function Words({ lines, start = 0, step = .06, duration = .7 }) {
  let index = 0;
  return lines.map(line => (
    <span className="word-line" key={line} aria-hidden="true">
      {line.split(' ').map((word, position) => (
        <React.Fragment key={position}>
          {position > 0 && ' '}
          <span className="word" style={{ '--delay': `${start + index++ * step}s`, '--duration': `${duration}s` }}>{word}</span>
        </React.Fragment>
      ))}
    </span>
  ));
}

const navigation = [
  ['HOME', '#home', .2], ['PROPERTIES', '#properties', .28],
  ['AGENT', '#agent', .36], ['PARTNER', '#partner', .44],
];

function NavLinks({ onNavigate, showInfo }) {
  return navigation.map(([label, href, delay], index) => (
    <a key={label} className={index === 0 ? 'pill home' : 'pill glass'} href={href}
      style={{ '--delay': `${delay}s` }} aria-current={index === 0 ? 'page' : undefined}
      onClick={event => {
        onNavigate?.();
        if (index > 1) {
          event.preventDefault();
          showInfo(label);
        }
      }}>
      {index === 0 && <House size={15} aria-hidden="true" />}{label}
    </a>
  ));
}

function Header() {
  const [language, setLanguage] = useState('EN');
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState('');
  const menuButton = useRef(null);
  const dialog = useRef(null);

  function showInfo(label) {
    setInfo(label);
    dialog.current.showModal();
  }

  return (
    <header className="header" onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        menuButton.current.focus();
      }
    }}>
      <a className="logo nav-in" href="#home" aria-label="Sabrina Residences home" style={{ '--delay': '.1s' }}>
        <svg viewBox="0 0 40 30" width="40" height="30" fill="none" aria-hidden="true">
          <path d="M2 27V14L15 3l10 8.5M15 27V14L28 3l10 8.5V27H2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation"><NavLinks showInfo={showInfo} /></nav>
      <div className="header-actions">
        <div className="language glass nav-in" aria-label="Language preference" role="group" style={{ '--delay': '.52s' }}>
          {['BA', 'EN'].map(option => (
            <button key={option} type="button" aria-pressed={language === option} onClick={() => setLanguage(option)}>{option}</button>
          ))}
        </div>
        <button type="button" className="pill sign-in nav-in" style={{ '--delay': '.6s' }} onClick={() => showInfo('SIGN IN')}>SIGN IN</button>
        <button ref={menuButton} type="button" className="menu glass nav-in" style={{ '--delay': '.65s' }} aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(value => !value)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden={!open}>
        <NavLinks onNavigate={() => setOpen(false)} showInfo={showInfo} />
      </nav>
      <dialog ref={dialog} className="info-dialog" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{info}</h2>
        <p>{info === 'SIGN IN' ? 'Online accounts are not available in this preview.' : 'Explore the current collection of Sabrina Residences homes.'}</p>
        <form method="dialog"><button className="pill" type="submit">Close</button></form>
      </dialog>
    </header>
  );
}

function VideoCard() {
  const video = useRef(null);
  const [segment, setSegment] = useState(0);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = video.current;
    if (paused) {
      media.pause();
      return;
    }

    media.muted = true;
    let pending = false;
    const resume = async () => {
      if (pending || (!media.paused && !media.ended && media.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA)) return;
      pending = true;
      try {
        await media.play();
      } catch {
        // The next user gesture or timer can retry if autoplay is restricted.
      } finally {
        pending = false;
      }
    };
    const update = () => {
      if (Number.isFinite(media.duration) && media.duration > 0) {
        setSegment(Math.min(3, Math.floor(media.currentTime / media.duration * 4)));
      }
    };
    const retryEvents = ['pause', 'ended', 'stalled', 'canplay'];
    retryEvents.forEach(event => media.addEventListener(event, resume));
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pointerup', resume, { once: true });
    media.addEventListener('timeupdate', update);
    const timer = window.setInterval(resume, 1000);
    resume();

    return () => {
      retryEvents.forEach(event => media.removeEventListener(event, resume));
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('pointerup', resume);
      media.removeEventListener('timeupdate', update);
      window.clearInterval(timer);
    };
  }, [paused]);

  function seek(index) {
    const media = video.current;
    if (Number.isFinite(media.duration) && media.duration > 0) {
      media.currentTime = media.duration * index / 4;
      setSegment(index);
    }
  }

  return (
    <aside className="video-card" aria-label="Featured property video">
      <div className="video-box">
        <video ref={video} src={videoSource} autoPlay={!paused} muted loop playsInline preload="metadata" />
        <button className="video-toggle" type="button" onClick={() => setPaused(value => !value)}>
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
      <p className="caption">
        <span className="sr-only">Find a home that fits your lifestyle</span>
        <Words lines={['Find a home that fits', 'your lifestyle']} start={2.15} />
      </p>
      <div className="video-progress" role="group" aria-label="Video chapters">
        {[0, 1, 2, 3].map(index => <button key={index} type="button" aria-label={`Jump to video part ${index + 1}`} aria-pressed={segment === index} onClick={() => seek(index)} />)}
      </div>
    </aside>
  );
}

function LatestHouses() {
  const section = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: .15 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={section} id="properties" className={`latest${revealed ? ' revealed' : ''}`} aria-labelledby="latest-title">
      <h2 id="latest-title" aria-label="Our Latest Houses"><Words lines={['OUR', 'LATEST', 'Houses']} step={.15} duration={.9} /></h2>
      <div className="gallery" role="region" aria-label="Latest house photos" tabIndex={0}>
        {houses.map((id, index) => (
          <figure className="house-card" key={id} style={{ '--delay': `${.2 + index * .15}s` }}>
            <img src={base + `Bg%20images/${id}.png`} alt={`Exterior of featured home ${index + 1}`} loading="lazy" decoding="async" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function App() {
  return (
    <main className="page">
      <div className="grid-lines" aria-hidden="true">
        {[4.8, 35.45, 64.7, 95.2].map((left, index) => <i key={left} style={{ left: `${left}%`, '--delay': `${index * .1}s` }} />)}
      </div>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <img className="hero-house" src={heroImage} alt="" fetchPriority="high" />
        <Header />
        <div className="hero-copy">
          <h1 id="hero-title" aria-label="Sabrina Residences House"><Words lines={['SABRINA', 'RESIDENCES', 'HOUSE']} start={.55} step={.2} duration={1} /></h1>
          <p className="tagline">
            <span className="sr-only">Trusted real estate experts for a smoother, smarter property journey.</span>
            <Words lines={['TRUSTED REAL ESTATE', 'EXPERTS FOR A SMOOTHER, SMARTER', 'PROPERTY JOURNEY.']} start={1.15} />
          </p>
        </div>
        <div className="explore-row">
          <a className="explore" href="#properties" aria-label="Explore properties">
            <Words lines={['EXPLORE PROPERTIES']} start={1.85} duration={.8} />
            <ArrowUpRight size={18} className="word" style={{ '--delay': '1.97s', '--duration': '.8s' }} aria-hidden="true" />
          </a>
        </div>
        <VideoCard />
      </section>
      <LatestHouses />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
