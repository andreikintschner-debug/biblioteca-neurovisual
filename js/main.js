/* =============================================================
   Biblioteca Neuro Visual — JavaScript (vanilla)
   Config lida de window.NEURO_CONFIG (definido no index.html)
   ============================================================= */
(function () {
  "use strict";

  var CFG = window.NEURO_CONFIG || {};
  var CHECKOUT_BASICO = CFG.CHECKOUT_URL_BASICO || "";
  var CHECKOUT_COMPLETO = CFG.CHECKOUT_URL_COMPLETO || "";

  // Marca que o JS está ativo (o reveal só esconde elementos quando há JS;
  // sem JS, tudo fica visível — ver css/styles.css).
  document.documentElement.classList.add("js");

  /* ---------------------------------------------------------
     0. Entrada fluida on-scroll (design "liquid")
        Revela elementos [data-reveal] à medida que entram no ecrã.
     --------------------------------------------------------- */
  (function reveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("reveal-in"); });
      return;
    }
    var rObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("reveal-in");
            rObs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (el) { rObs.observe(el); });
  })();

  /* ---------------------------------------------------------
     Helpers de tracking (disparam só se o pixel/GA existir)
     --------------------------------------------------------- */
  function fbTrack(event) {
    if (typeof window.fbq === "function") {
      try { window.fbq("track", event); } catch (e) {}
    }
  }
  function gaEvent(name) {
    if (typeof window.gtag === "function") {
      try { window.gtag("event", name); } catch (e) {}
    }
  }

  /* ---------------------------------------------------------
     1. CTAs — disparam o evento InitiateCheckout.
        Cada botão de compra (data-plan) aponta para o
        checkout do respetivo plano; os restantes CTAs fazem
        scroll suave até à secção de planos (href="#planos").
     --------------------------------------------------------- */
  // Qualquer clique num CTA dispara o evento InitiateCheckout.
  document.querySelectorAll("[data-cta]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fbTrack("InitiateCheckout");
      gaEvent("initiate_checkout");
    });
  });

  // Botões de COMPRA (por plano): apontam para o checkout correspondente.
  document.querySelectorAll("[data-plan]").forEach(function (buyBtn) {
    var url = buyBtn.getAttribute("data-plan") === "completo" ? CHECKOUT_COMPLETO : CHECKOUT_BASICO;
    if (url) {
      buyBtn.setAttribute("href", url);
      buyBtn.setAttribute("target", "_blank");
      buyBtn.setAttribute("rel", "noopener");
    } else {
      // Sem checkout definido: leva para a secção de planos.
      buyBtn.setAttribute("href", "#planos");
    }
  });

  /* ---------------------------------------------------------
     2. Contadores animados (categorias) — count-up on scroll
     --------------------------------------------------------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = Math.floor(p * target);
      el.textContent = prefix + val.toLocaleString("pt-PT") + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString("pt-PT") + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var cObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            animateCount(en.target);
            cObs.unobserve(en.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (c) { cObs.observe(c); });
  }

  /* ---------------------------------------------------------
     3. ViewContent — dispara ao ver a secção de planos
     --------------------------------------------------------- */
  var planos = document.getElementById("planos");
  if (planos && "IntersectionObserver" in window) {
    var fired = false;
    var pObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !fired) {
            fired = true;
            fbTrack("ViewContent");
            gaEvent("view_content");
            pObs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    pObs.observe(planos);
  }

  /* ---------------------------------------------------------
     3b. Data da oferta na top bar — atualiza para o dia atual
     --------------------------------------------------------- */
  (function offerDate() {
    var el = document.getElementById("offer-date");
    if (!el) return;
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var yyyy = d.getFullYear();
    el.textContent = dd + "/" + mm + "/" + yyyy; // DD/MM/AAAA
  })();

  /* ---------------------------------------------------------
     4. Countdown de urgência (por sessão, 15 minutos)
     --------------------------------------------------------- */
  (function countdown() {
    var minEl = document.getElementById("cd-min");
    var secEl = document.getElementById("cd-sec");
    if (!minEl || !secEl) return;

    var TOTAL = 15 * 60; // 15 minutos em segundos
    var key = "nv_deadline";
    var deadline = sessionStorage.getItem(key);
    if (!deadline) {
      deadline = Date.now() + TOTAL * 1000;
      try { sessionStorage.setItem(key, deadline); } catch (e) {}
    } else {
      deadline = parseInt(deadline, 10);
    }

    function tick() {
      var remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      minEl.textContent = String(m).padStart(2, "0");
      secEl.textContent = String(s).padStart(2, "0");
      if (remaining > 0) setTimeout(tick, 1000);
    }
    tick();
  })();

  /* ---------------------------------------------------------
     4b. Carrosséis infinitos (marquee) — pausa ao tocar/segurar
        (o pause com o rato é feito por CSS :hover)
     --------------------------------------------------------- */
  (function marqueeTouch() {
    document.querySelectorAll(".marquee").forEach(function (mq) {
      var pause = function () { mq.classList.add("is-paused"); };
      var resume = function () { mq.classList.remove("is-paused"); };
      mq.addEventListener("touchstart", pause, { passive: true });
      mq.addEventListener("touchend", resume, { passive: true });
      mq.addEventListener("touchcancel", resume, { passive: true });
    });
  })();

  /* ---------------------------------------------------------
     4c. Depoimentos — slide único com auto-avanço (crossfade)
        Loop infinito e contínuo; pausa no hover e no toque.
     --------------------------------------------------------- */
  (function testimonialsSlider() {
    var slider = document.getElementById("tst-slider");
    if (!slider) return;
    var slides = [].slice.call(slider.querySelectorAll(".tst-slide"));
    if (!slides.length) return;
    var i = 0;
    var timer = null;
    var DELAY = 3500; // tempo em cada slide

    function show(n) {
      slides[i].classList.remove("opacity-100");
      slides[i].classList.add("opacity-0");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("opacity-100");
      slides[i].classList.remove("opacity-0");
    }
    function play() { if (!timer) timer = setInterval(function () { show(i + 1); }, DELAY); }
    function pause() { clearInterval(timer); timer = null; }
    function goto(n) { show(n); pause(); play(); } // navega e reinicia o temporizador

    // Setas anterior/seguinte
    var prev = document.getElementById("tst-prev");
    var next = document.getElementById("tst-next");
    if (prev) prev.addEventListener("click", function () { goto(i - 1); });
    if (next) next.addEventListener("click", function () { goto(i + 1); });

    slider.addEventListener("mouseenter", pause);
    slider.addEventListener("mouseleave", play);
    slider.addEventListener("touchstart", pause, { passive: true });
    slider.addEventListener("touchend", play, { passive: true });
    slider.addEventListener("touchcancel", play, { passive: true });
    play();
  })();

  /* ---------------------------------------------------------
     4d. Barra CTA fixa (mobile) — aparece após passar o hero
     --------------------------------------------------------- */
  (function stickyCta() {
    var bar = document.getElementById("sticky-cta");
    var hero = document.getElementById("hero");
    if (!bar || !hero) return;
    if (!("IntersectionObserver" in window)) { bar.classList.add("is-visible"); return; }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          // esconde enquanto o hero está visível; mostra quando já passou
          bar.classList.toggle("is-visible", !en.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    obs.observe(hero);
  })();

  /* ---------------------------------------------------------
     5. FAQ accordion (acessível por teclado)
     --------------------------------------------------------- */
  document.querySelectorAll(".js-faq").forEach(function (btn) {
    var panel = btn.parentElement.querySelector(".js-faq-panel");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (panel) panel.classList.toggle("hidden", open);
    });
  });

  /* ---------------------------------------------------------
     6. Lightbox da galeria — abrir/fechar + anterior/seguinte
     --------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightbox-img");
  var lbClose = document.getElementById("lightbox-close");
  var lbPrev = document.getElementById("lightbox-prev");
  var lbNext = document.getElementById("lightbox-next");
  var lastFocused = null;
  var currentIndex = 0;

  var galleryItems = [].slice.call(document.querySelectorAll(".js-gallery"));
  var gallery = galleryItems.map(function (it) {
    var img = it.querySelector("img");
    return {
      src: it.getAttribute("data-full") || (img ? img.getAttribute("src") : ""),
      alt: img ? img.alt : "",
    };
  });

  function renderLightbox() {
    if (!gallery.length) return;
    lbImg.setAttribute("src", gallery[currentIndex].src);
    lbImg.setAttribute("alt", gallery[currentIndex].alt || "");
  }
  function openLightbox(index) {
    if (!lightbox || !gallery.length) return;
    currentIndex = index;
    lastFocused = document.activeElement;
    renderLightbox();
    lightbox.classList.remove("hidden");
    lightbox.classList.add("flex");
    document.body.classList.add("modal-open");
    if (lbClose) lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add("hidden");
    lightbox.classList.remove("flex");
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }
  function nextImg() { currentIndex = (currentIndex + 1) % gallery.length; renderLightbox(); }
  function prevImg() { currentIndex = (currentIndex - 1 + gallery.length) % gallery.length; renderLightbox(); }

  galleryItems.forEach(function (item, i) {
    item.addEventListener("click", function () { openLightbox(i); });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbNext) lbNext.addEventListener("click", function (e) { e.stopPropagation(); nextImg(); });
  if (lbPrev) lbPrev.addEventListener("click", function (e) { e.stopPropagation(); prevImg(); });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ---------------------------------------------------------
     7. Tecla ESC fecha qualquer modal aberto
     --------------------------------------------------------- */
  document.addEventListener("keydown", function (e) {
    var lbOpen = lightbox && !lightbox.classList.contains("hidden");
    if (e.key === "Escape") {
      if (lbOpen) closeLightbox();
    } else if (lbOpen && e.key === "ArrowRight") {
      nextImg();
    } else if (lbOpen && e.key === "ArrowLeft") {
      prevImg();
    }
  });
})();
