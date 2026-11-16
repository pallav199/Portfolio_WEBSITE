/* ============================================================
   Pallav Pradhan — Portfolio · motion & interaction
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    setTimeout(() => pre.classList.add("done"), 500);
  });
  // Fallback so the site is never locked behind the preloader.
  setTimeout(() => document.getElementById("preloader")?.classList.add("done"), 3000);

  /* ---------- Year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + progress bar ---------- */
  const nav = document.getElementById("nav");
  const navProgress = document.getElementById("navProgress");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    navProgress.style.transform = `scaleX(${max ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    navToggle.classList.toggle("open");
  });
  navLinks.querySelectorAll(".nav-link").forEach((l) =>
    l.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
    })
  );

  /* ---------- Active section highlight ---------- */
  const sections = [...document.querySelectorAll("section[id]")];
  const linkBySection = {};
  document.querySelectorAll(".nav-link").forEach((l) => {
    linkBySection[l.dataset.section] = l;
  });
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && linkBySection[e.target.id]) {
          document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
          linkBySection[e.target.id].classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // small stagger for elements that arrive together
        setTimeout(() => entry.target.classList.add("revealed"), (i % 4) * 90);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

  /* ---------- Skill bars animate when in view ---------- */
  const barObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".skill-bar i, .lang .skill-bar i").forEach((bar) => {
          const w = entry.target.dataset.width || bar.closest(".skill, .lang")?.dataset.width;
          bar.style.width = w + "%";
        });
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll("[data-width]").forEach((el) => {
    if (el.classList.contains("skill") || el.classList.contains("lang")) {
      barObserver.observe(el);
    }
  });

  /* ---------- Animated counters ---------- */
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const dur = 1600;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toFixed(decimals);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- 3D tilt on cards ---------- */
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = 6;
    card.addEventListener("mousemove", (e) => {
      if (prefersReduced) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
    });
  });

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (dot && ring && !prefersReduced) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    const targets = "a, button, .chip, .nav-link, .cred-card, .award, input, textarea, .hero-social a";
    document.querySelectorAll(targets).forEach((t) => {
      t.addEventListener("mouseenter", () => document.body.classList.add("hovering"));
      t.addEventListener("mouseleave", () => document.body.classList.remove("hovering"));
    });
  }

  /* ---------- Particle network ---------- */
  const canvas = document.getElementById("particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, pts = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(70, Math.floor((W * H) / 26000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: -999, y: -999 };
    canvas.parentElement.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const linkDist = 130;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        // gentle pull toward mouse
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 160) { p.x += mdx * 0.006; p.y += mdy * 0.006; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(45,212,191,0.7)";
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(129,140,248,${0.12 * (1 - d / linkDist)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    if (!prefersReduced) draw();
  }

  /* ---------- Device detection & contact behavior ----------
     Mobile  -> mail/phone links stay active (open mail app / dialer)
     Desktop -> email & phone are shown as plain text, not clickable */
  const isMobile =
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) /* iPad */ ||
    (matchMedia("(pointer: coarse)").matches && Math.max(screen.width, screen.height) <= 1024);
  document.body.classList.add(isMobile ? "is-mobile" : "is-desktop");

  /* Desktop: mail/phone buttons reveal the number/email on screen
     (click to copy) instead of opening the mail app or dialer */
  if (!isMobile) {
    const tip = document.createElement("div");
    tip.className = "contact-tip";
    let tipTimer;
    const closeTip = () => { clearTimeout(tipTimer); tip.remove(); };

    const showTip = (anchor, value, label) => {
      tip.replaceChildren();
      const strong = document.createElement("strong");
      strong.textContent = label;
      const valEl = document.createElement("span");
      valEl.className = "tip-val";
      valEl.textContent = value;
      tip.append(strong, valEl);
      if (!tip.isConnected) document.body.appendChild(tip);

      const r = anchor.getBoundingClientRect();
      const tr = tip.getBoundingClientRect();
      tip.style.left = Math.max(10, Math.min(r.left, window.innerWidth - tr.width - 10)) + "px";
      let top = r.bottom + 10;
      if (top + tr.height > window.innerHeight - 10) top = r.top - tr.height - 10;
      tip.style.top = top + "px";

      clearTimeout(tipTimer);
      tipTimer = setTimeout(closeTip, 4000);

      valEl.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(value);
          valEl.textContent = "Copied ✓";
          tip.classList.add("copied");
          clearTimeout(tipTimer);
          tipTimer = setTimeout(closeTip, 1800);
        } catch { /* clipboard unavailable — value still visible */ }
      });
    };

    document.querySelectorAll("a[data-contact]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let value, label;
        if (a.dataset.contact === "mail") {
          value = a.getAttribute("href").replace(/^mailto:/, "");
          label = "Email";
        } else {
          const raw = a.getAttribute("href").replace(/^tel:/, "");
          value = raw.replace(/^\+?91(?=\d{10}$)/, "+91 ");
          label = "Phone";
        }
        showTip(a, value, label);
      });
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".contact-tip")) closeTip();
    });
  }

  /* ---------- Contact form ----------
     - When a Web3Forms access key is set: the message is delivered straight
       to RECEIVER from any device (no mail app needed).
     - Without a key: falls back to opening the visitor's mail app via mailto. */
  const RECEIVER = "pallavpradhan@pallav.site";
  const WEB3FORMS_ACCESS_KEY = "736245b2-f157-45d1-80b3-f4acaf3ffc90";

  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const note = document.getElementById("formNote");
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const msg = form.message.value.trim();
      if (!name || !email || !msg) {
        note.style.color = "#f59e0b";
        note.textContent = "Please fill in all fields.";
        return;
      }

      if (WEB3FORMS_ACCESS_KEY) {
        note.style.color = "var(--muted)";
        note.textContent = "Sending your message…";
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              access_key: WEB3FORMS_ACCESS_KEY,
              to: RECEIVER,
              name,
              email,
              message: msg,
              subject: `Portfolio message from ${name}`,
            }),
          });
          const data = await res.json();
          if (data.success) {
            note.style.color = "var(--teal)";
            note.textContent = "Message sent! I'll get back to you soon.";
            form.reset();
          } else {
            note.style.color = "#f59e0b";
            note.textContent = "Something went wrong — please email me directly at " + RECEIVER;
          }
        } catch {
          mailtoFallback(name, email, msg, note);
        }
      } else {
        mailtoFallback(name, email, msg, note);
      }
    });
  }

  function mailtoFallback(name, email, msg, note) {
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Hi Pallav,\n\n${msg}\n\n— ${name}\n${email}`);
    if (note) {
      note.style.color = "var(--teal)";
      note.textContent = "Opening your mail app…";
    }
    window.location.href = `mailto:${RECEIVER}?subject=${subject}&body=${body}`;
  }
})();
