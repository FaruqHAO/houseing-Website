import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUpRight, Menu, X, Play, Pause } from 'lucide-react';
import LayoutStudio from './LayoutStudio.jsx';
import './styles.css';

const scene = 'https://cdn.sceneai.art/';
const photo = (id, width) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;
const exterior = photo('photo-1600596542815-ffad4c1539a9', 1800);
const interior = photo('photo-1600607687939-ce8a6c25118c', 1600);
const living = photo('photo-1600210492486-724fe5c67fb0', 1200);
const films = [
  { title: 'A closer look', detail: 'Exterior walkthrough', poster: exterior, src: scene + 'Hero%20Section%20Video/adec243d-ffda-48cf-a8a8-26e6d6bcbe9b.mp4' },
  { title: 'The light within', detail: 'Interior study', poster: interior, src: import.meta.env.BASE_URL + 'media/the-light-within.mp4' },
  { title: 'Room to gather', detail: 'Living room study', poster: living, src: import.meta.env.BASE_URL + 'media/room-to-gather.mp4' },
];
const homes = [
  { name: 'The Courtyard House', type: '01 / Indoor–outdoor living', image: scene + 'Bg%20images/c789ac4d-f2c8-463a-93f6-1f8c6fa09f9a.png', detail: 'A design study organized around a private outdoor room. The courtyard draws daylight into the plan and gives the living spaces an intimate place to open out.' },
  { name: 'The Pavilion', type: '02 / Open-plan living', image: scene + 'Bg%20images/bf2e3004-db02-48a1-8e15-c6a58c158b5c.png', detail: 'A contemporary retreat inspired by long sightlines and simple forms. Generous openings connect the social spaces while sheltered corners offer room to slow down.' },
  { name: 'The Garden Residence', type: '03 / A quieter retreat', image: scene + 'Bg%20images/dce07180-2db9-45fe-889a-7a11657c6234.png', detail: 'A home concept shaped by the landscape around it. Green views, natural textures, and soft light carry a sense of calm from the garden into the interior.' },
];
const nav = [['Residences', '#residences'], ['Design approach', '#approach'], ['Layout studio', '#studio'], ['Films', '#films']];

function Brand() {
  return <a className="brand" href="#top" aria-label="BAOSAT Housing home">
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M3 28V14L13 5l10 9v14H3Zm10 0V14L23 5l8 7v16h-8" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/></svg>
    <span>BAOSAT<small>HOUSING</small></span>
  </a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  return <header className="site-header wrap" onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      toggle.current.focus();
    }
  }}>
    <Brand />
    <button className="menu" type="button" ref={toggle} aria-expanded={open} aria-controls="site-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
      {open ? <X /> : <Menu />}
    </button>
    <nav id="site-nav" className={open ? 'open' : ''} aria-label="Main navigation">
      {nav.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
      <a className="header-cta" href="#residences" onClick={() => setOpen(false)}>Explore the collection <ArrowUpRight size={15} /></a>
    </nav>
  </header>;
}

function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!('IntersectionObserver' in window)) return;
    element.dataset.reveal = 'pending';
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.reveal = 'visible';
        observer.disconnect();
      }
    }, { threshold: .08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

function HeroBackdrop() {
  const video = useRef(null);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = event => {
      setReduced(event.matches);
      setStarted(false);
      setPlaying(false);
    };
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  return <>
    <img className="hero-image" src={exterior} alt="" fetchPriority="high" />
    {!reduced && <video
      className={`hero-video${started ? ' visible' : ''}`}
      ref={video}
      src={import.meta.env.BASE_URL + 'media/baosat-hero.mp4'}
      autoPlay muted loop playsInline preload="metadata" aria-hidden="true"
      onPlaying={() => { setStarted(true); setPlaying(true); }}
      onPause={() => setPlaying(false)}
      onError={() => { setStarted(false); setPlaying(false); }}
    />}
    {!reduced && started && <button type="button" className="hero-motion"
      aria-label={playing ? 'Pause background video' : 'Play background video'}
      onClick={() => {
        const media = video.current;
        if (media.paused) media.play().catch(() => setPlaying(false));
        else media.pause();
      }}>
      {playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
    </button>}
  </>;
}

function Hero() {
  const lines = [['Room', 'to'], ['live', 'well.']];
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <HeroBackdrop />
    <Header />
    <div className="wrap hero-content">
      <p className="eyebrow"><span /> A collection of contemporary homes</p>
      <h1 id="hero-title" aria-label="Room to live well.">{lines.map((line, row) => <span className="hero-line" key={line[0]} aria-hidden="true">{line.map((word, index) => <span className="hero-word" key={word} style={{ '--order': row * 2 + index }}>{word}{index === 0 ? ' ' : ''}</span>)}</span>)}</h1>
      <p>Considered architecture, generous light, and spaces that make everyday life feel a little more open.</p>
      <div className="hero-actions">
        <a className="button button-light" href="#residences">Discover residences <ArrowUpRight size={18}/></a>
        <a className="film-link" href="#films"><Play size={17}/> View the films</a>
      </div>
    </div>
    <div className="hero-bottom wrap"><span>BAOSAT HOUSING / RESIDENTIAL COLLECTION</span><a href="#residences" aria-label="Scroll to residences"><ArrowDown size={19}/></a><span>01 — 03 / DESIGN STUDIES</span></div>
  </section>;
}

function Collection() {
  const dialog = useRef(null);
  const [selected, setSelected] = useState(null);
  return <section id="residences" className="collection wrap" aria-labelledby="collection-title">
    <Reveal className="section-intro">
      <div><p className="eyebrow"><span /> 01 / THE COLLECTION</p><h2 id="collection-title">A place of your own.</h2></div>
      <p>Three residential concepts, each with a different relationship to light, landscape, and the way we spend time at home.</p>
    </Reveal>
    <Reveal className="cards">
      {homes.map(home => <article className="home-card" key={home.name}>
        <button type="button" onClick={() => { setSelected(home); dialog.current.showModal(); }} aria-label={`Explore ${home.name}`}>
          <img src={home.image} alt="" loading="lazy" decoding="async" />
          <span className="card-content"><span><small>{home.type}</small><strong>{home.name}</strong></span><ArrowUpRight size={20}/></span>
        </button>
      </article>)}
    </Reveal>
    <dialog ref={dialog} className="home-dialog" aria-labelledby="home-title">
      {selected && <><img src={selected.image} alt="" /><div><p className="eyebrow">{selected.type}</p><h2 id="home-title">{selected.name}</h2><p>{selected.detail}</p><small>Illustrative design concept.</small></div></>}
      <form method="dialog"><button type="submit" aria-label="Close residence details"><X size={22}/></button></form>
    </dialog>
  </section>;
}

function Approach() {
  return <section className="approach" id="approach" aria-labelledby="approach-title">
    <div className="wrap approach-layout">
      <Reveal className="approach-image"><img src={living} alt="Warm contemporary living room with natural textures" loading="lazy" decoding="async" /></Reveal>
      <Reveal className="approach-copy">
        <p className="eyebrow"><span /> 02 / THE DESIGN APPROACH</p>
        <h2 id="approach-title">Details you feel every day.</h2>
        <p>Good design shows up in the morning light, the way rooms connect, and the places you naturally want to sit.</p>
        <dl>
          <div><dt>01</dt><dd><strong>Light first</strong><span>Openings and sightlines that bring daylight deeper into the home.</span></dd></div>
          <div><dt>02</dt><dd><strong>Honest materials</strong><span>Warm timber, quiet stone, and textures that give rooms depth.</span></dd></div>
          <div><dt>03</dt><dd><strong>Room to gather</strong><span>Shared spaces with a natural flow between indoors and out.</span></dd></div>
        </dl>
      </Reveal>
    </div>
    <div className="wrap approach-ideas">
      <Reveal className="approach-ideas-intro">
        <div><p className="eyebrow"><span /> DESIGN DIRECTIONS</p><h3>Start with how you live.</h3></div>
        <a className="button button-light" href="#studio">Try the layout studio <ArrowUpRight size={18}/></a>
      </Reveal>
      <Reveal className="approach-directions">
        <article><img src={interior} alt="" loading="lazy" decoding="async"/><div><small>01 / OPEN PLAN</small><h4>Connected living</h4><p>Group the kitchen, dining, and living areas for easy conversation and flexible gatherings.</p></div></article>
        <article><img src={living} alt="" loading="lazy" decoding="async"/><div><small>02 / PRIVATE RETREAT</small><h4>Room for quiet</h4><p>Keep bedrooms and reading corners away from the busiest rooms so different routines can coexist.</p></div></article>
        <article><img src={exterior} alt="" loading="lazy" decoding="async"/><div><small>03 / INDOOR–OUTDOOR</small><h4>Living beyond walls</h4><p>Place a terrace beside the living area to extend where you eat, unwind, or entertain.</p></div></article>
      </Reveal>
    </div>
  </section>;
}

function Film({ film }) {
  const media = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  return <figure className="film">
    <div className="film-frame">
      <video ref={media} poster={film.poster} src={film.src} preload="none" playsInline muted loop
        aria-label={film.title} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
      {!failed && <button type="button" aria-label={`${playing ? 'Pause' : 'Play'} ${film.title}`} onClick={() => {
        if (media.current.paused) media.current.play().catch(() => setFailed(true));
        else media.current.pause();
      }}>{playing ? <Pause size={20}/> : <Play size={20}/>}</button>}
    </div>
    <figcaption><strong>{film.title}</strong><span>{failed ? 'Video unavailable' : film.detail}</span></figcaption>
  </figure>;
}

function App() {
  return <>
    <a className="skip-link" href="#residences">Skip to residences</a>
    <main><Hero /><Collection /><Approach /><LayoutStudio />
      <section className="films wrap" id="films" aria-labelledby="films-title">
        <Reveal className="section-intro"><div><p className="eyebrow"><span /> 04 / IN MOTION</p><h2 id="films-title">Spaces in motion.</h2></div><p>See how light, texture, and perspective change as you move through a home.</p></Reveal>
        <Reveal className="film-grid">{films.map(film => <Film key={film.title} film={film} />)}</Reveal>
      </section>
    </main>
    <footer className="footer"><div className="wrap footer-inner"><Brand /><p>Contemporary residential design studies.</p><a href="#top">Back to top <ArrowUpRight size={17}/></a></div></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
