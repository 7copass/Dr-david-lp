/* =========================================================
   Dr. David Pires — VERSÃO CLÁSSICA (azul)
   Libs: Lenis (smooth scroll) + GSAP + ScrollTrigger
   ========================================================= */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- menu mobile ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.style.display = 'none';
    mobileMenu.hidden = true;
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      if (open) {
        closeMenu();
      } else {
        burger.setAttribute('aria-expanded', 'true');
        mobileMenu.hidden = false;
        mobileMenu.style.display = 'flex';
        if (hasGSAP && !reduced) {
          gsap.fromTo(mobileMenu, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
        }
      }
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- nav sticky ---------- */
  const nav = document.getElementById('nav');
  function onScrollNav(y) {
    if (!nav) return;
    nav.classList.toggle('is-stuck', y > 40);
  }
  onScrollNav(window.scrollY);

  /* ---------- barra de progresso ---------- */
  const progressBar = document.querySelector('.scroll-progress span');
  function setProgress(y) {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(y / max, 1) : 0;
    progressBar.style.transform = 'scaleX(' + p + ')';
  }

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined' && !reduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6
    });

    lenis.on('scroll', (e) => {
      onScrollNav(e.scroll);
      setProgress(e.scroll);
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.update();
    });

    if (hasGSAP) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else {
    window.addEventListener('scroll', () => {
      onScrollNav(window.scrollY);
      setProgress(window.scrollY);
    }, { passive: true });
  }

  /* ---------- âncoras ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: -90, duration: 1.25 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  });

  /* ---------- split de texto em palavras ---------- */
  function splitHeading(el) {
    if (el.dataset.splitDone) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => '<span class="word-wrap"><span class="word">' + w + '</span></span>')
      .join(' ');
    el.querySelectorAll('.word-wrap').forEach((w) => {
      w.style.display = 'inline-block';
      w.style.overflow = 'hidden';
      w.style.verticalAlign = 'top';
      w.style.paddingBottom = '.06em';
    });
    el.dataset.splitDone = '1';
  }

  /* =========================================================
     ANIMAÇÕES
     ========================================================= */
  if (hasGSAP && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    /* --- headings com split --- */
    document.querySelectorAll('[data-split]').forEach((el) => {
      splitHeading(el);
      gsap.from(el.querySelectorAll('.word'), {
        yPercent: 118,
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    /* --- elementos simples --- */
    document.querySelectorAll('[data-reveal]:not([data-stagger])').forEach((el) => {
      gsap.from(el, {
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    /* --- grupos com stagger --- */
    const groups = new Map();
    document.querySelectorAll('[data-stagger]').forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach((items, parent) => {
      gsap.from(items, {
        y: 38,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: { trigger: parent, start: 'top 85%', once: true }
      });
    });

    /* --- parallax em imagens --- */
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        y: parseFloat(el.dataset.parallax),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });

    /* --- entrada do hero --- */
    const heroTl = gsap.timeline({ delay: 0.15 });
    heroTl
      .from('.nav__inner', { y: -24, opacity: 0, duration: 0.8, ease: 'power2.out' })
      .from('.hero__blob', { y: 34, opacity: 0, scale: 0.94, duration: 1.2, ease: 'power3.out' }, 0.1)
      .from('.hero__blob img', { scale: 1.14, duration: 1.6, ease: 'power3.out' }, 0.1)
      .from('.float-card', { y: 24, opacity: 0, duration: 0.7, stagger: 0.14, ease: 'back.out(1.6)' }, 0.65);

    /* --- flutuação contínua dos cards --- */
    document.querySelectorAll('[data-float]').forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? -10 : 10,
        duration: 2.6 + i * 0.35,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.4 + i * 0.2
      });
    });

    /* --- marquee infinito --- */
    const track = document.getElementById('marqueeTrack');
    if (track) {
      const group = track.querySelector('.marquee__group');
      for (let i = 0; i < 3; i++) track.appendChild(group.cloneNode(true));
      gsap.to(track, {
        xPercent: -25,
        duration: 26,
        ease: 'none',
        repeat: -1
      });
    }

    /* --- painéis azuis: leve escala na entrada --- */
    ['.services__panel', '.cta__panel'].forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      gsap.from(el, {
        scale: 0.96,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* --- botões magnéticos --- */
    if (window.matchMedia('(hover:hover)').matches) {
      document.querySelectorAll('.magnetic').forEach((btn) => {
        const strength = 0.3;
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - r.left - r.width / 2) * strength,
            y: (e.clientY - r.top - r.height / 2) * strength,
            duration: 0.5,
            ease: 'power3.out'
          });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
        });
      });
    }

    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    /* fallback sem GSAP / movimento reduzido */
    document.querySelectorAll('[data-reveal],[data-stagger]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ---------- brilho que segue o mouse nos cards de serviço ---------- */
  document.querySelectorAll('.scard').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  /* ---------- FAQ: acordeão com altura animada e exclusivo ---------- */
  const faqItems = Array.from(document.querySelectorAll('.qa'));
  faqItems.forEach((item) => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.qa__body');

    summary.addEventListener('click', (e) => {
      if (reduced || !hasGSAP) return;
      e.preventDefault();

      if (item.open) {
        gsap.to(body, {
          height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut',
          onComplete: () => { item.open = false; gsap.set(body, { height: 'auto' }); }
        });
        return;
      }

      faqItems.forEach((other) => {
        if (other !== item && other.open) {
          const ob = other.querySelector('.qa__body');
          gsap.to(ob, {
            height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut',
            onComplete: () => { other.open = false; gsap.set(ob, { height: 'auto' }); }
          });
        }
      });

      item.open = true;
      gsap.fromTo(body,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out',
          onComplete: () => { gsap.set(body, { height: 'auto' }); if (window.ScrollTrigger) ScrollTrigger.refresh(); } }
      );
    });
  });

  /* ---------- FAB do WhatsApp ---------- */
  const fab = document.querySelector('.wa-fab');
  if (fab) {
    const toggleFab = (y) => fab.classList.toggle('is-in', y > 520);
    if (lenis) {
      lenis.on('scroll', (e) => toggleFab(e.scroll));
    } else {
      window.addEventListener('scroll', () => toggleFab(window.scrollY), { passive: true });
    }
    toggleFab(window.scrollY);
  }
})();
