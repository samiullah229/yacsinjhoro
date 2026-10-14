/* =====================================================================
   YOUTH ACTION COMMITTEE — SINJHORO
   main.js — shared behaviour across all pages
   Vanilla JavaScript only, no frameworks/dependencies.
===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     MOBILE NAVIGATION
     Handles opening and closing the responsive navigation menu,
     plus the sticky navbar shrink/shadow-on-scroll effect and the
     active-page link indicator.
  =========================== */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu after a link is tapped
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Mark the current page's nav link as active
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .footer-col a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  /* ===========================
     SCROLL EFFECTS
     Shrinks the navbar, shows a scroll-progress bar, and reveals
     the "back to top" button once the user scrolls down.
  =========================== */
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const scrollY = window.scrollY;

    if (navbar) navbar.classList.toggle('scrolled', scrollY > 40);
    if (backToTop) backToTop.classList.toggle('show', scrollY > 500);

    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===========================
     SCROLL REVEAL ANIMATIONS
     Uses IntersectionObserver so elements fade/slide/scale into
     view only when they enter the viewport — keeps things smooth
     and avoids unnecessary processing off-screen.
  =========================== */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: just show everything if IntersectionObserver isn't supported
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ===========================
     IMPACT COUNTERS
     Animates numbers counting up once the impact section scrolls
     into view. Skips straight to the final value for users who
     prefer reduced motion.
  =========================== */
  const counters = document.querySelectorAll('.impact-item .num[data-count]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';

        if (prefersReducedMotion || isNaN(target)) {
          el.textContent = (isNaN(target) ? el.textContent : target) + suffix;
        } else {
          let current = 0;
          const duration = 1200;
          const stepTime = 16;
          const steps = duration / stepTime;
          const increment = target / steps;

          const tick = () => {
            current += increment;
            if (current >= target) {
              el.textContent = target + suffix;
            } else {
              el.textContent = Math.floor(current) + suffix;
              requestAnimationFrame(() => setTimeout(tick, stepTime));
            }
          };
          tick();
        }
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => countObserver.observe(el));
  }

  /* ===========================
     CAROUSELS (generic)
     Powers any element with class "carousel-generic" on the page —
     used for the full-screen homepage hero carousel and the About
     page's 3-slide feature carousel. Auto-advances, pauses on
     hover/focus, and is skipped for users who prefer reduced motion.
  =========================== */
  document.querySelectorAll('.carousel-generic').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    if (!track || !slides.length) return;

    let index = 0;
    let autoTimer;

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
        dotsWrap.appendChild(dot);
      });
    }
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.carousel-dot') : [];

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    }

    function startAuto() {
      if (prefersReducedMotion) return;
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(index + 1), 5000);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(index - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(index + 1); startAuto(); });
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAuto);

    startAuto();
  });

  /* ===========================
     GALLERY FILTERS
  =========================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.masonry-item');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
          const match = filter === 'all' || item.dataset.cat === filter;
          item.classList.toggle('hide', !match);
        });
      });
    });
  }

  /* ===========================
     GALLERY LIGHTBOX
     Fullscreen preview with next/previous navigation and keyboard
     support (Escape to close, arrow keys to navigate).
  =========================== */
  const lightbox = document.getElementById('lightbox');

  if (lightbox && galleryItems.length) {
    const lightboxInner = lightbox.querySelector('.lightbox-content');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    let currentIndex = 0;
    let visibleItems = [];

    const getVisibleItems = () =>
      Array.from(galleryItems).filter(item => !item.classList.contains('hide'));

    const renderLightbox = () => {
      const item = visibleItems[currentIndex];
      if (!item) return;
      const placeholder = item.querySelector('.image-placeholder');
      lightboxInner.querySelectorAll('.lb-media').forEach(el => el.remove());
      const clone = placeholder.cloneNode(true);
      clone.classList.add('lb-media');
      clone.style.borderRadius = '0';
      lightboxInner.insertBefore(clone, lightboxCaption);
      lightboxCaption.textContent = item.dataset.caption || '';
    };

    const openLightbox = (index) => {
      visibleItems = getVisibleItems();
      currentIndex = index;
      renderLightbox();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    };
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
    };
    const showNext = () => {
      currentIndex = (currentIndex + 1) % visibleItems.length;
      renderLightbox();
    };
    const showPrev = () => {
      currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      renderLightbox();
    };

    galleryItems.forEach((item) => {
      item.addEventListener('click', () => {
        visibleItems = getVisibleItems();
        const idx = visibleItems.indexOf(item);
        openLightbox(idx >= 0 ? idx : 0);
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-nav.next').addEventListener('click', showNext);
    lightbox.querySelector('.lightbox-nav.prev').addEventListener('click', showPrev);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });
  }

  /* ===========================
     EVENT GALLERIES (events page)
     Each event card has its own set of photos. Clicking any photo
     opens a fullscreen lightbox that cycles through only that
     event's pictures — next/previous, keyboard support included.
  =========================== */
  const eventLightbox = document.getElementById('eventLightbox');
  const eventCards = document.querySelectorAll('.event-card[data-event]');

  if (eventLightbox && eventCards.length) {
    const elInner = eventLightbox.querySelector('.lightbox-content');
    const elCaption = eventLightbox.querySelector('.lightbox-caption');
    let activeEvent = null;
    let activeIndex = 0;

    const renderEventLightbox = () => {
      if (!activeEvent) return;
      const thumbs = activeEvent.querySelectorAll('.event-thumb');
      const thumb = thumbs[activeIndex];
      elInner.querySelectorAll('.lb-media').forEach(el => el.remove());
      const clone = thumb.querySelector('.image-placeholder').cloneNode(true);
      clone.classList.add('lb-media');
      clone.style.borderRadius = '0';
      elInner.insertBefore(clone, elCaption);
      const eventTitle = activeEvent.dataset.eventTitle || 'Event';
      elCaption.textContent = `${eventTitle} — Photo ${activeIndex + 1} of ${thumbs.length}`;
    };

    const openEventLightbox = (card, index) => {
      activeEvent = card;
      activeIndex = index;
      renderEventLightbox();
      eventLightbox.classList.add('open');
      eventLightbox.setAttribute('aria-hidden', 'false');
    };
    const closeEventLightbox = () => {
      eventLightbox.classList.remove('open');
      eventLightbox.setAttribute('aria-hidden', 'true');
    };
    const nextEventPhoto = () => {
      if (!activeEvent) return;
      const total = activeEvent.querySelectorAll('.event-thumb').length;
      activeIndex = (activeIndex + 1) % total;
      renderEventLightbox();
    };
    const prevEventPhoto = () => {
      if (!activeEvent) return;
      const total = activeEvent.querySelectorAll('.event-thumb').length;
      activeIndex = (activeIndex - 1 + total) % total;
      renderEventLightbox();
    };

    eventCards.forEach(card => {
      card.querySelectorAll('.event-thumb').forEach((thumb, i) => {
        thumb.addEventListener('click', () => openEventLightbox(card, i));
      });
    });

    eventLightbox.querySelector('.lightbox-close').addEventListener('click', closeEventLightbox);
    eventLightbox.querySelector('.lightbox-nav.next').addEventListener('click', nextEventPhoto);
    eventLightbox.querySelector('.lightbox-nav.prev').addEventListener('click', prevEventPhoto);
    eventLightbox.addEventListener('click', (e) => { if (e.target === eventLightbox) closeEventLightbox(); });

    document.addEventListener('keydown', (e) => {
      if (!eventLightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeEventLightbox();
      if (e.key === 'ArrowRight') nextEventPhoto();
      if (e.key === 'ArrowLeft') prevEventPhoto();
    });
  }

  /* ===========================
     JOIN FORM (placeholder submission)
     No backend is connected yet — this simply confirms receipt
     to the user. See the HTML comment on the form for how to wire
     it up to a real service later.
  =========================== */
  const joinForm = document.getElementById('joinForm');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const confirmation = document.getElementById('formConfirmation');
      joinForm.reset();
      if (confirmation) {
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

});


/*principle rules*/
const principleData = {
  unity: {
    tag: "Principle 01",
    title: "Unity",
    icon: "fa-solid fa-users",
    desc: "We bring together the youth and citizens of Sinjhoro regardless of background. Together we are stronger, every voice matters, and collective action brings real change."
  },
  discipline: {
    tag: "Principle 02",
    title: "Discipline",
    icon: "fa-solid fa-shield-halved",
    desc: "Discipline turns intentions into consistent action. We adhere strictly to ethical standards, punctual execution, and structured reporting in all community work."
  },
  faith: {
    tag: "Principle 03",
    title: "Faith",
    icon: "fa-solid fa-heart",
    desc: "Faith grounds our purpose and shapes how we serve others with integrity, hope, and unconditional respect for humanity."
  },
  service: {
    tag: "Principle 04",
    title: "Service",
    icon: "fa-solid fa-hand-holding-heart",
    desc: "Dedicated, selfless support for those in need. From poor relief to local social causes, service to Sinjhoro is our top priority."
  },
  responsibility: {
    tag: "Principle 05",
    title: "Responsibility",
    icon: "fa-solid fa-clipboard-check",
    desc: "Every member is assigned specific neighborhood duties. We hold ourselves strictly accountable through weekly updates and monthly transparent reviews."
  },
  leadership: {
    tag: "Principle 06",
    title: "Leadership",
    icon: "fa-solid fa-crown",
    desc: "Building future leaders from Sinjhoro by providing platforms for students and youth to lead campaigns, organize events, and solve city issues."
  },
  development: {
    tag: "Principle 07",
    title: "Community Development",
    icon: "fa-solid fa-city",
    desc: "Long-term civic improvement focusing on modern Science & IT education, clean city initiatives, road safety awareness, and youth-led progress."
  }
};

document.querySelectorAll('.principle-btn').forEach(button => {
  button.addEventListener('click', function() {
    document.querySelectorAll('.principle-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');

    const key = this.getAttribute('data-id');
    const data = principleData[key];
    const detailBox = document.getElementById('principleDetailBox');

    detailBox.style.opacity = '0';
    detailBox.style.transform = 'translateY(10px)';

    setTimeout(() => {
      document.getElementById('detailTag').textContent = data.tag;
      document.getElementById('detailTitle').textContent = data.title;
      document.getElementById('detailDesc').textContent = data.desc;
      document.getElementById('detailIcon').className = data.icon;

      detailBox.style.opacity = '1';
      detailBox.style.transform = 'translateY(0)';
    }, 200);
  });
});





/* YAC Sinjhoro — Homepage scroll animations */

document.addEventListener("DOMContentLoaded", () => {
  const revealItems = document.querySelectorAll(
    ".yac-home .yac-reveal"
  );

  // Show everything when reduced motion is preferred
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => {
      item.classList.add("yac-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("yac-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealItems.forEach((item) => {
    observer.observe(item);
  });
});


