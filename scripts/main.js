/* Site behavior: theme toggle, mobile nav, scroll reveal, nav border,
   footer year, Asite tenure. No dependencies.
   Theme is pre-applied in the <head> to avoid flashing. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var interactive = !reduceMotion && finePointer;

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    // Close the menu after tapping a link
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Nav glass on scroll + floating back-to-top ---------- */
  var nav = document.querySelector(".nav");
  var toTop = document.getElementById("to-top");
  if (nav || toTop) {
    var onScroll = function () {
      var y = window.scrollY;
      if (nav) nav.classList.toggle("scrolled", y > 8);
      if (toTop) toTop.classList.toggle("show", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  if (toTop) {
    toTop.addEventListener("click", function () {
      var behavior = reduceMotion ? "auto" : "smooth";
      window.scrollTo({ top: 0, behavior: behavior });
    });
  }

  /* ---------- Gentle scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Asite tenure: "(X yrs Y mos)" from a fixed start ---------- */
  var durationEl = document.getElementById("asite-duration");
  if (durationEl) {
    var start = new Date(2023, 5, 1); // June 2023 (months are 0-indexed)
    var now = new Date();
    var months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months -= 1;
    if (months < 0) months = 0;
    var years = Math.floor(months / 12);
    var rem = months % 12;
    var parts = [];
    if (years) parts.push(years + " yr" + (years > 1 ? "s" : ""));
    if (rem) parts.push(rem + " mo" + (rem > 1 ? "s" : ""));
    if (parts.length) durationEl.textContent = "· " + parts.join(" ");
  }

  /* ---------- Count-up stat counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var dur = 1100, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { el.textContent = "0"; cio.observe(el); });
    }
  }

  if (!interactive) return; // pointer effects below are desktop + motion-OK only

  /* ---------- Pointer-reactive specular (nav + feature cards) ---------- */
  function trackSpecular(el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100) + "%");
      el.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  }
  var navInner = document.querySelector(".nav-inner");
  if (navInner) trackSpecular(navInner);

  /* ---------- Featured card tilt + specular ---------- */
  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    trackSpecular(card);
    var raf = null;
    card.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        var max = 5; // degrees
        card.style.transform =
          "perspective(1200px) rotateY(" + (px * max) + "deg) rotateX(" + (-py * max) + "deg) translateY(-3px)";
      });
    });
    card.addEventListener("pointerleave", function () {
      card.style.transform = "";
    });
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
    btn.addEventListener("pointermove", function (e) {
      var r = btn.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.25;
      var y = (e.clientY - r.top - r.height / 2) * 0.4;
      btn.style.transform = "translate(" + x + "px," + y + "px)";
    });
    btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
  });
})();
