/* =========================================================
   tsgereda Hotel â€” Interactions & Animations
   High-End Production JavaScript
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Loader ---------- */
  window.addEventListener("load", () => {
    const loader = $("#pageLoader");
    if (loader) setTimeout(() => loader.classList.add("is-hidden"), 350);
  });

  /* ---------- Nav Scroll ---------- */
  const nav = $("#habNav");
  const onScroll = () => { if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile Nav ---------- */
  const navToggle = $("#habNavToggle");
  const navLinks = $("#habNavLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Reveal on Scroll ---------- */
  const revealEls = $$(".hab-reveal");
  revealEls.forEach((el) => {
    const d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d + "ms");
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Hero Transition â€” Petals & Silhouette Swap ---------- */
  const silhouette = $(".hab-hero__silhouette");
  const coat = $(".hab-hero__silhouette--coat");
  const fedora = $(".hab-hero__silhouette--fedora");
  const vest = $(".hab-hero__silhouette--vest");
  const tibeb = $(".hab-hero__silhouette--tibeb");
  const petalsContainer = $(".hab-petals");

  function spawnPetal() {
    if (!petalsContainer) return;
    const petal = document.createElement("div");
    petal.className = "hab-petal";
    petal.style.left = Math.random() * 100 + "%";
    petal.style.top = -(Math.random() * 60 + 20) + "px";
    petal.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
    petal.style.setProperty("--dy", (Math.random() * 200 + 200) + "px");
    petal.style.setProperty("--rot", (Math.random() * 720 + 360) + "deg");
    petal.style.animationDuration = (Math.random() * 3 + 4) + "s";
    petalsContainer.appendChild(petal);
    setTimeout(() => petal.remove(), 8000);
  }

  function transitionToModern() {
    if (coat) coat.style.opacity = "0";
    if (fedora) {
      fedora.style.opacity = "0";
      fedora.style.transform = "translateX(-50%) translateY(-40px) rotate(-20deg)";
    }
    const petalInterval = setInterval(spawnPetal, 120);
    setTimeout(() => clearInterval(petalInterval), 3000);
    setTimeout(() => {
      if (vest) vest.style.opacity = "1";
      if (tibeb) tibeb.style.opacity = "0.6";
    }, 1200);
  }

  setTimeout(transitionToModern, 3500);

  /* ---------- Hero Logo Scroll Behavior ---------- */
  const heroLogo = $("#habHeroLogo");
  const scrollLogo = $("#habScrollLogo");
  let lastScrollY = 0;
  
  function handleLogoScroll() {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;
    const triggerPoint = heroHeight * 0.3;
    
    if (scrollY > triggerPoint) {
      if (heroLogo && !heroLogo.classList.contains("is-hidden")) {
        heroLogo.classList.add("is-hidden");
      }
      if (scrollLogo && !scrollLogo.classList.contains("is-visible")) {
        scrollLogo.classList.add("is-visible");
      }
    } else {
      if (heroLogo && heroLogo.classList.contains("is-hidden")) {
        heroLogo.classList.remove("is-hidden");
      }
      if (scrollLogo && scrollLogo.classList.contains("is-visible")) {
        scrollLogo.classList.remove("is-visible");
      }
    }
    lastScrollY = scrollY;
  }
  
  window.addEventListener("scroll", handleLogoScroll, { passive: true });
  handleLogoScroll();

  /* ---------- Gallery Filter ---------- */
  const filterButtons = $$(".hab-gallery-filter");
  const galleryItems = $$(".hab-gallery-item");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("hab-gallery-filter--active"));
      btn.classList.add("hab-gallery-filter--active");
      const filter = btn.dataset.filter;
      galleryItems.forEach((item) => {
        if (filter === "all" || item.dataset.category === filter) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  /* ---------- Contact Form ---------- */
  const reviewForm = $("#habReviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(reviewForm);
      const name = formData.get("name");
      const rating = formData.get("rating");
      const text = formData.get("text");

      if (!name || !rating || !text) {
        alert("Please fill in all fields.");
        return;
      }

      fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, text }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            const reviewsList = $("#habReviewsList");
            if (reviewsList) {
              const reviewCard = document.createElement("div");
              reviewCard.className = "hab-review-card";
              reviewCard.style.animation = "fadeInUp 0.6s var(--hab-ease)";
              reviewCard.innerHTML = `
                <div class="hab-review-header">
                  <div class="hab-review-avatar">${name.charAt(0).toUpperCase()}</div>
                  <div class="hab-review-meta">
                    <span class="hab-review-name">${escapeHTML(name)}</span>
                    <span class="hab-review-date">Just now (pending)</span>
                  </div>
                  <div class="hab-review-rating">${"â˜…".repeat(rating)}${"â˜†".repeat(5 - rating)}</div>
                </div>
                <p class="hab-review-text">${escapeHTML(text)}</p>
                <div class="hab-review-categories">
                  <span class="hab-review-cat">Rating: ${rating}/5</span>
                </div>
              `;
              reviewsList.insertBefore(reviewCard, reviewsList.firstChild);
            }
            reviewForm.reset();
            alert("Thank you for your review! It will be published after moderation.");
          } else {
            alert(data.message || "Failed to submit review.");
          }
        })
        .catch(() => alert("Network error. Please try again."));
    });
  }

  /* ---------- Reservation Form ---------- */
  const reservationForm = $("#habReservationForm");
  const reservationStatus = $("#reservationStatus");
  if (reservationForm) {
    reservationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(reservationForm);
      const data = Object.fromEntries(formData.entries());

      if (!data.name || !data.email || !data.date || !data.time || !data.guests) {
        showStatus(reservationStatus, "Please fill in all required fields.", "err");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showStatus(reservationStatus, "Please enter a valid email address.", "err");
        return;
      }

      const submitBtn = reservationForm.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.ok) {
            showStatus(reservationStatus, result.message, "ok");
            reservationForm.reset();
          } else {
            showStatus(reservationStatus, result.message || "Failed to submit reservation.", "err");
          }
        })
        .catch(() => showStatus(reservationStatus, "Network error. Please try again.", "err"))
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Reserve Table";
        });
    });
  }

  /* ---------- Load Approved Reviews ---------- */
  function loadReviews() {
    fetch("/api/reviews?status=approved")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.reviews && data.reviews.length > 0) {
          const reviewsList = $("#habReviewsList");
          if (reviewsList) {
            reviewsList.innerHTML = "";
            data.reviews.forEach((review) => {
              const reviewCard = document.createElement("div");
              reviewCard.className = "hab-review-card";
              reviewCard.innerHTML = `
                <div class="hab-review-header">
                  <div class="hab-review-avatar">${review.name.charAt(0).toUpperCase()}</div>
                  <div class="hab-review-meta">
                    <span class="hab-review-name">${escapeHTML(review.name)}</span>
                    <span class="hab-review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div class="hab-review-rating">${"â˜…".repeat(review.rating)}${"â˜†".repeat(5 - review.rating)}</div>
                </div>
                <p class="hab-review-text">${escapeHTML(review.text)}</p>
              `;
              reviewsList.appendChild(reviewCard);
            });
          }
        }
      })
      .catch(() => console.log("Could not load reviews from server."));
  }
  loadReviews();

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  $$("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = $(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Footer Year ---------- */
  const yearEl = $("#habYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Helpers ---------- */
  function showStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = "hab-form-status " + (type === "ok" ? "is-ok" : type === "err" ? "is-err" : "");
  }

  function escapeHTML(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();


