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
 
/* =========================================
   CAROUSEL CONTROLLER
   Auto-slide: every 4 seconds
   Manual navigation: stops autoplay
========================================= */

document
  .querySelectorAll(".carousel-generic")
  .forEach((carousel) => {
    // Prevent duplicate initialization
    if (carousel.dataset.carouselReady === "true") return;
    carousel.dataset.carouselReady = "true";

    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(
      carousel.querySelectorAll(".carousel-slide")
    );
    const dotsWrap = carousel.querySelector(".carousel-dots");
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let autoTimer = null;
    let manuallyPaused = false;
    let startX = 0;
    let startY = 0;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    // Create pagination dots
    let dots = [];

    if (dotsWrap) {
      dotsWrap.replaceChildren();

      slides.forEach((slide, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute(
          "aria-label",
          `Go to slide ${index + 1}`
        );

        dot.addEventListener("click", () => {
          pauseAfterInteraction();
          showSlide(index);
        });

        dotsWrap.appendChild(dot);
      });

      dots = Array.from(
        dotsWrap.querySelectorAll(".carousel-dot")
      );
    }

    // Display a slide
    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      track.style.transform =
        `translate3d(-${currentIndex * 100}%, 0, 0)`;

      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;

        slide.setAttribute(
          "aria-hidden",
          String(!isActive)
        );
      });

      dots.forEach((dot, i) => {
        const isActive = i === currentIndex;

        dot.classList.toggle("active", isActive);

        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    // Stop the timer
    function stopAuto() {
      if (autoTimer !== null) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    // Start automatic sliding
    function startAuto() {
      stopAuto();

      if (
        manuallyPaused ||
        reducedMotion.matches ||
        document.hidden ||
        slides.length < 2 ||
        carousel.matches(":hover") ||
        carousel.contains(document.activeElement)
      ) {
        return;
      }

      autoTimer = setInterval(() => {
        showSlide(currentIndex + 1);
      }, 4000);
    }

    // A manual action pauses autoplay until the page reloads
    function pauseAfterInteraction() {
      manuallyPaused = true;
      stopAuto();
    }

    // Previous button
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        pauseAfterInteraction();
        showSlide(currentIndex - 1);
      });
    }

    // Next button
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        pauseAfterInteraction();
        showSlide(currentIndex + 1);
      });
    }

    // Pause while the pointer is over the carousel
    carousel.addEventListener("mouseenter", stopAuto);

    carousel.addEventListener("mouseleave", startAuto);

    // Pause while a keyboard user is interacting
    carousel.addEventListener("focusin", stopAuto);

    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) {
        startAuto();
      }
    });

    // Stop when the browser tab is hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAuto();
      } else {
        startAuto();
      }
    });

    // Mobile swipe support
    carousel.addEventListener(
      "touchstart",
      (event) => {
        startX = event.changedTouches[0].clientX;
        startY = event.changedTouches[0].clientY;
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchend",
      (event) => {
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Ignore vertical scrolling and small movements
        if (
          Math.abs(deltaX) > 50 &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {
          pauseAfterInteraction();

          showSlide(
            currentIndex + (deltaX < 0 ? 1 : -1)
          );
        }
      },
      { passive: true }
    );

    // Respond to reduced-motion preference changes
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener("change", startAuto);
    }

    // Initialize
    showSlide(0);
    startAuto();
  });



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


