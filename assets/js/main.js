/* =========================================================
   Dr. David Pires — interações e animações de scroll
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
          gsap.fromTo(mobileMenu, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
        }
      }
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- nav sticky ---------- */
  const nav = document.getElementById('nav');
  function onScrollNav(y) {
    if (nav) nav.classList.toggle('is-stuck', y > 40);
  }
  onScrollNav(window.scrollY);

  /* ---------- barra de progresso ---------- */
  const progressBar = document.querySelector('.scroll-progress span');
  function setProgress(y) {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
  }

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined' && !reduced) {
    lenis = new Lenis({
      duration: 1.1,
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
        lenis.scrollTo(target, { offset: -84, duration: 1.2 });
      } else {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 84,
          behavior: reduced ? 'auto' : 'smooth'
        });
      }
    });
  });

  /* ---------- split em palavras, preservando <em> ---------- */
  function wrapWords(text, emphasis) {
    return text
      .split(/(\s+)/)
      .map((chunk) => {
        if (!chunk.trim()) return chunk;
        const inner = emphasis ? '<em>' + chunk + '</em>' : chunk;
        return '<span class="word-wrap"><span class="word">' + inner + '</span></span>';
      })
      .join('');
  }

  function splitHeading(el) {
    if (el.dataset.splitDone) return;
    let html = '';
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        html += wrapWords(node.textContent, false);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        html += wrapWords(node.textContent, node.tagName === 'EM' || node.tagName === 'I');
      }
    });
    el.innerHTML = html;
    el.classList.add('split');
    el.querySelectorAll('.word-wrap').forEach((w) => {
      w.style.display = 'inline-block';
      w.style.overflow = 'hidden';
      w.style.verticalAlign = 'bottom';
      w.style.paddingBottom = '.08em';
      w.style.marginBottom = '-.08em';
    });
    el.dataset.splitDone = '1';
  }

  /* =========================================================
     ANIMAÇÕES
     ========================================================= */
  if (hasGSAP && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    /* títulos: palavras sobem sob máscara */
    document.querySelectorAll('[data-split]').forEach((el) => {
      splitHeading(el);
      gsap.from(el.querySelectorAll('.word'), {
        yPercent: 108,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.032,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* sobrancelhas: o fio se desenha */
    document.querySelectorAll('.eyebrow').forEach((el) => {
      gsap.from(el, {
        opacity: 0, x: -8, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });

    /* elementos simples */
    document.querySelectorAll('[data-reveal]:not([data-stagger]):not(.eyebrow)').forEach((el) => {
      gsap.from(el, {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });

    /* grupos com stagger */
    const groups = new Map();
    document.querySelectorAll('[data-stagger]').forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach((items, parent) => {
      gsap.from(items, {
        y: 22,
        opacity: 0,
        duration: 0.75,
        ease: 'power2.out',
        stagger: 0.075,
        scrollTrigger: { trigger: parent, start: 'top 86%', once: true }
      });
    });

    /* fotos: cortina abrindo de baixo para cima */
    document.querySelectorAll('.about__frame, .cta__arch').forEach((el) => {
      gsap.from(el, {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.25,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    /* parallax */
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        y: parseFloat(el.dataset.parallax),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });

    /* entrada do hero */
    gsap.timeline({ delay: 0.12 })
      .from('.nav__inner', { y: -18, opacity: 0, duration: 0.8, ease: 'power2.out' })
      .from('.hero__arch', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut' }, 0.12)
      .from('.hero__arch img', { scale: 1.12, duration: 1.6, ease: 'power3.out' }, 0.12);

    /* flutuação discreta */
    document.querySelectorAll('[data-float]').forEach((el) => {
      gsap.to(el, {
        y: -7, duration: 3.2, ease: 'sine.inOut',
        yoyo: true, repeat: -1, delay: 1.6
      });
    });

    /* marquee infinito */
    const track = document.getElementById('marqueeTrack');
    if (track) {
      const group = track.querySelector('.marquee__group');
      for (let i = 0; i < 3; i++) track.appendChild(group.cloneNode(true));
      gsap.to(track, { xPercent: -25, duration: 34, ease: 'none', repeat: -1 });
    }

    /* painel naval entra com leve escala */
    const panel = document.querySelector('.services__panel');
    if (panel) {
      gsap.from(panel, {
        scale: 0.975, opacity: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: panel, start: 'top 90%', once: true }
      });
    }

    /* botões magnéticos (bem discretos) */
    if (window.matchMedia('(hover:hover)').matches) {
      document.querySelectorAll('.magnetic').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          gsap.to(btn, {
            x: (e.clientX - r.left - r.width / 2) * 0.16,
            y: (e.clientY - r.top - r.height / 2) * 0.16,
            duration: 0.5, ease: 'power3.out'
          });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.45)' });
        });
      });
    }

    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    document.querySelectorAll('[data-reveal],[data-stagger]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

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
        {
          height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out',
          onComplete: () => {
            gsap.set(body, { height: 'auto' });
            if (window.ScrollTrigger) ScrollTrigger.refresh();
          }
        }
      );
    });
  });

  /* ---------- FAB do WhatsApp ---------- */
  const fab = document.querySelector('.wa-fab');
  if (fab) {
    const toggleFab = (y) => fab.classList.toggle('is-in', y > 560);
    if (lenis) lenis.on('scroll', (e) => toggleFab(e.scroll));
    else window.addEventListener('scroll', () => toggleFab(window.scrollY), { passive: true });
    toggleFab(window.scrollY);
  }
})();
