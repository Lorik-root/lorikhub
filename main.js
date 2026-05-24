var THEMES = [
  { id: "blue", label: "Синяя" },
  { id: "orange", label: "Оранжевая" }
];

var QUICK_LINKS = [
  {
    href: "index.html",
    label: "Главная",
    desc: "Витрина проекта + быстрый вход в каталог.",
    icon: "⌂"
  },
  {
    href: "scripts.html",
    label: "Каталог скриптов",
    desc: "Список loadstring, фильтры, копирование в 1 клик.",
    icon: "</>"
  },
  {
    href: "injectors.html",
    label: "Инжекторы",
    desc: "Скачать/выбрать инжектор для запуска скриптов.",
    icon: "⚡"
  },
  {
    href: "support.html",
    label: "Поддержка",
    desc: "Связь, помощь и ответы на вопросы.",
    icon: "?"
  }
];

(function () {
  var nav = document.getElementById("mini-nav");
  if (nav) {
    var toggle = nav.querySelector(".mini-nav__toggle");
    var mobile = nav.querySelector(".mini-nav__mobile");

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("mini-nav--open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      mobile.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("mini-nav--open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  var tabsRoot = document.querySelector("[data-catalog-tabs]");
  if (tabsRoot) {
    var tabs = tabsRoot.querySelectorAll(".catalog-tabs__btn");
    var cards = document.querySelectorAll(".script-card[data-category]");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = tab.getAttribute("data-filter");

        tabs.forEach(function (t) {
          t.classList.toggle("catalog-tabs__btn--active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });

        cards.forEach(function (card) {
          var category = card.getAttribute("data-category");
          var show = filter === "all" || category === filter;
          card.classList.toggle("script-card--hidden", !show);
        });
      });
    });
  }

  initThemes();
  initLiveWallpaper();
  initFallingParticles();
  initBottomTicker();
  initGlowCards();
  initShowcase();
  initScrollReveal();
  initAmbientObjects();
  initThemeCursor();
})();

function getAccentRgb() {
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim() ||
    "0, 255, 102"
  );
}

function initThemes() {
  var saved = localStorage.getItem("lorik-hub-theme") || "blue";

  // Миграция со старых тем (green/purple/cyan/rose/white) на новую схему (blue/orange).
  if (saved !== "blue" && saved !== "orange") {
    saved = "blue";
    localStorage.setItem("lorik-hub-theme", saved);
  }

  document.documentElement.setAttribute("data-theme", saved);
}

function applyTheme(themeId) {
  document.documentElement.setAttribute("data-theme", themeId);
  localStorage.setItem("lorik-hub-theme", themeId);

  document.querySelectorAll("[data-theme-pick]").forEach(function (btn) {
    var active = btn.getAttribute("data-theme-pick") === themeId;
    btn.classList.toggle("orbit-picker__dot--active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function initLiveWallpaper() {
  var canvas = document.getElementById("cyber-rain");
  if (!canvas) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.style.display = "none";
    return;
  }

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var pointer = { x: -9999, y: -9999 };
  var fontSize = 13;
  var fallSpeed = 0.28;
  var glitchSpeed = 140;
  var glitchIntensity = 0.008;
  var letters = [];
  var grid = { columns: 0, rows: 0, charWidth: 0, charHeight: 0 };
  var lastGlitch = 0;
  var frameId = 0;
  var width = 0;
  var height = 0;

  function randomBit() {
    return Math.random() > 0.5 ? "1" : "0";
  }

  function alphaAt(x, y) {
    var base = 0.035;
    var dist = Math.hypot(pointer.x - x, pointer.y - y);
    var boost = Math.max(0, 1 - dist / 220) * 0.05;
    return base + boost;
  }

  function setup() {
    if (frameId) cancelAnimationFrame(frameId);

    var dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.font = fontSize + 'px "JetBrains Mono", monospace';
    ctx.textBaseline = "top";

    var metrics = ctx.measureText("0");
    grid.charWidth = metrics.width;
    grid.charHeight = fontSize * 1.35;
    grid.columns = Math.floor(width / grid.charWidth);
    grid.rows = Math.floor(height / grid.charHeight);

    var extendedRows = grid.rows * 2;
    var total = grid.columns * extendedRows;
    letters = [];

    for (var i = 0; i < total; i++) {
      var col = i % grid.columns;
      var row = Math.floor(i / grid.columns);
      letters.push({
        char: randomBit(),
        x: col * grid.charWidth,
        y: row * grid.charHeight - grid.rows * grid.charHeight
      });
    }

    frameId = requestAnimationFrame(animate);
  }

  function animate(timestamp) {
    frameId = requestAnimationFrame(animate);

    if (timestamp - lastGlitch > glitchSpeed) {
      lastGlitch = timestamp;
      var updates = Math.max(1, Math.floor(letters.length * glitchIntensity));
      for (var i = 0; i < updates; i++) {
        var idx = Math.floor(Math.random() * letters.length);
        letters[idx].char = randomBit();
      }
    }

    var fieldHeight = grid.rows * grid.charHeight * 2;
    letters.forEach(function (letter) {
      letter.y += fallSpeed;
      if (letter.y > height) letter.y -= fieldHeight;
    });

    ctx.clearRect(0, 0, width, height);
    ctx.font = fontSize + 'px "JetBrains Mono", monospace';

    letters.forEach(function (letter) {
      var cx = letter.x + grid.charWidth * 0.5;
      var cy = letter.y + grid.charHeight * 0.5;
      var a = alphaAt(cx, cy);
      ctx.fillStyle = "rgba(" + getAccentRgb() + ", " + a + ")";
      ctx.fillText(letter.char, letter.x, letter.y);
    });
  }

  document.addEventListener(
    "pointermove",
    function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", function () {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });

  setup();
}

function initFallingParticles() {
  var host = document.querySelector(".cyber-bg");
  if (!host) return;
  if (host.querySelector(".cyber-bg__particles")) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.createElement("canvas");
  canvas.className = "cyber-bg__particles";
  canvas.setAttribute("aria-hidden", "true");

  var before = host.querySelector(".cyber-bg__grid") || null;
  if (before) host.insertBefore(canvas, before);
  else host.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var pointer = { x: -9999, y: -9999 };
  var width = 0;
  var height = 0;
  var particles = [];
  var raf = 0;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function spawn(i) {
    var r = rand(0.8, 2.4);
    particles[i] = {
      x: Math.random() * width,
      y: rand(-height, height),
      r: r,
      vy: rand(0.35, 1.35) + r * 0.08,
      vx: rand(-0.25, 0.25),
      sway: rand(0.002, 0.007) * (Math.random() > 0.5 ? 1 : -1),
      a: rand(0.06, 0.22)
    };
  }

  function setup() {
    if (raf) cancelAnimationFrame(raf);

    var dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    var targetCount = Math.min(240, Math.max(90, Math.floor((width * height) / 9000)));
    particles = new Array(targetCount);
    for (var i = 0; i < particles.length; i++) spawn(i);

    raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = requestAnimationFrame(tick);

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    var accent = getAccentRgb();
    var wind = pointer.x < 0 ? 0 : (pointer.x / width - 0.5) * 0.35;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx + wind + Math.sin((p.y + i * 13) * p.sway) * 0.4;
      p.y += p.vy;

      if (p.y - p.r > height) {
        p.y = -p.r - rand(0, height * 0.25);
        p.x = Math.random() * width;
      }

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      ctx.beginPath();
      ctx.fillStyle = "rgba(" + accent + ", " + p.a + ")";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  document.addEventListener(
    "pointermove",
    function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", function () {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });

  setup();
}

function getBottomTickerImages() {
  var provided = window.BOTTOM_TICKER_IMAGES;
  if (provided && provided.length) return provided.slice();
  var out = [];
  for (var i = 1; i <= 10; i++) out.push("images/ticker/" + i + ".png");
  return out;
}

function initBottomTicker() {
  var host = document.querySelector(".cyber-bg");
  if (!host) return;
  if (host.querySelector(".bottom-ticker")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var images = getBottomTickerImages();
  if (!images.length) return;

  var root = document.createElement("div");
  root.className = "bottom-ticker";
  root.setAttribute("aria-hidden", "true");

  var track = document.createElement("div");
  track.className = "bottom-ticker__track";

  var count = images.length;
  var duration = Math.max(40, count * 6);
  root.style.setProperty("--ticker-duration", duration + "s");

  function addSet() {
    images.forEach(function (src) {
      var img = document.createElement("img");
      img.className = "bottom-ticker__img";
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = "";
      img.src = src;
      track.appendChild(img);
    });
  }

  addSet();
  addSet();

  root.appendChild(track);

  var before = host.querySelector(".cyber-bg__vignette") || null;
  if (before) host.insertBefore(root, before);
  else host.appendChild(root);
}

function initGlowCards() {
  var cards = document.querySelectorAll("[data-glow-card]");
  if (!cards.length) return;

  function syncGlow(e) {
    cards.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--glow-x", x.toFixed(1) + "%");
      card.style.setProperty("--glow-y", y.toFixed(1) + "%");
      card.style.setProperty("--glow-opacity", "1");
    });
  }

  document.addEventListener("pointermove", syncGlow, { passive: true });

  cards.forEach(function (card) {
    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--glow-opacity", "0");
    });
  });
}

function initShowcase() {
  var codes = document.querySelectorAll(".showcase-card__pre code");
  if (!codes.length) return;

  var luau = {
    keywords: ["loadstring", "game"],
    builtins: ["HttpGet"]
  };

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightLuau(code) {
    var html = escapeHtml(code);
    var strings = [];
    html = html.replace(/"([^"\\]|\\.)*"/g, function (match) {
      var key = "%%STR" + strings.length + "%%";
      strings.push('<span class="tok-string">' + match + "</span>");
      return key;
    });
    luau.keywords.forEach(function (word) {
      html = html.replace(
        new RegExp("\\b" + word + "\\b", "g"),
        '<span class="tok-keyword">' + word + "</span>"
      );
    });
    luau.builtins.forEach(function (word) {
      html = html.replace(
        new RegExp("\\b" + word + "\\b", "g"),
        '<span class="tok-builtin">' + word + "</span>"
      );
    });
    html = html.replace(/(\(|\)|\.)/g, '<span class="tok-punct">$1</span>');
    strings.forEach(function (replacement, index) {
      html = html.replace("%%STR" + index + "%%", replacement);
    });
    return html;
  }

  codes.forEach(function (el) {
    var raw = el.textContent;
    el.setAttribute("data-raw", raw);
    el.innerHTML = highlightLuau(raw);
  });

  document.querySelectorAll(".showcase-card__copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-copy-target");
      var codeEl = document.getElementById(targetId);
      if (!codeEl) return;

      var text = codeEl.getAttribute("data-raw") || codeEl.textContent;

      function onSuccess() {
        btn.classList.add("showcase-card__copy--done");
        setTimeout(function () {
          btn.classList.remove("showcase-card__copy--done");
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
          fallbackCopy(text, onSuccess);
        });
      } else {
        fallbackCopy(text, onSuccess);
      }
    });
  });
}

function fallbackCopy(text, callback) {
  var area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
  callback();
}

function initFloatingWidgets() {
  if (document.querySelector(".float-widgets")) return;

  var currentTheme = document.documentElement.getAttribute("data-theme") || "blue";
  var themeDots = THEMES.map(function (theme, index) {
    var angle = (360 / THEMES.length) * index;
    return (
      '<button type="button" class="orbit-picker__dot' +
      (theme.id === currentTheme ? " orbit-picker__dot--active" : "") +
      '" data-theme-pick="' +
      theme.id +
      '" style="--angle:' +
      angle +
      'deg" aria-label="' +
      theme.label +
      '" aria-pressed="' +
      (theme.id === currentTheme ? "true" : "false") +
      '" title="' +
      theme.label +
      '"></button>'
    );
  }).join("");

  var navDots = QUICK_LINKS.map(function (link, index) {
    var angle = (360 / QUICK_LINKS.length) * index + 45;
    var page = window.location.pathname.split("/").pop() || "index.html";
    if (!page || page === "/") page = "index.html";
    var isActive = link.href.toLowerCase() === page.toLowerCase();
    return (
      '<a class="orbit-picker__dot orbit-picker__dot--link' +
      (isActive ? " orbit-picker__dot--active" : "") +
      '" href="' +
      link.href +
      '" style="--angle:' +
      angle +
      'deg" title="' +
      link.label +
      '" data-label="' +
      link.label +
      '" data-desc="' +
      link.desc +
      '"><span aria-hidden="true">' +
      link.icon +
      "</span></a>"
    );
  }).join("");

  var root = document.createElement("div");
  root.className = "float-widgets";
  root.innerHTML =
    '<div class="float-deco float-deco--cube" aria-hidden="true">' +
    '<div class="float-deco__shape"></div>' +
    "</div>" +
    '<div class="float-deco float-deco--theme">' +
    '<div class="magic-box" id="magic-box-theme">' +
    '<button type="button" class="magic-box__toggle" aria-expanded="false" aria-controls="magic-panel-theme" aria-label="Открыть выбор темы">' +
    '<span class="magic-box__case">' +
    '<span class="magic-box__lid"></span>' +
    '<span class="magic-box__body-face">◈</span>' +
    "</span>" +
    "</button>" +
    '<div class="magic-box__panel" id="magic-panel-theme" hidden>' +
    '<p class="magic-box__caption">Тема сайта</p>' +
    '<div class="orbit-picker">' +
    '<div class="orbit-picker__hub"></div>' +
    '<div class="orbit-tooltip" aria-hidden="true"></div>' +
    '<div class="orbit-picker__ring orbit-picker__ring--spin">' +
    themeDots +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="float-deco float-deco--nav">' +
    '<div class="magic-box" id="magic-box-nav">' +
    '<button type="button" class="magic-box__toggle" aria-expanded="false" aria-controls="magic-panel-nav" aria-label="Открыть быстрый переход">' +
    '<span class="magic-box__case magic-box__case--alt">' +
    '<span class="magic-box__lid"></span>' +
    '<span class="magic-box__body-face">☰</span>' +
    "</span>" +
    "</button>" +
    '<div class="magic-box__panel" id="magic-panel-nav" hidden>' +
    '<p class="magic-box__caption">Разделы</p>' +
    '<div class="orbit-picker">' +
    '<div class="orbit-picker__hub"></div>' +
    '<div class="orbit-tooltip" aria-hidden="true"></div>' +
    '<div class="orbit-picker__ring orbit-picker__ring--spin orbit-picker__ring--slow">' +
    navDots +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  document.body.appendChild(root);

  setupMagicBox(document.getElementById("magic-box-theme"), "magic-panel-theme");
  setupMagicBox(document.getElementById("magic-box-nav"), "magic-panel-nav");

  root.querySelectorAll("[data-theme-pick]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(btn.getAttribute("data-theme-pick"));
    });
  });

  initOrbitTooltips(root);

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".magic-box")) {
      closeAllMagicBoxes();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllMagicBoxes();
  });
}

function initScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var selectors = [
    ".hero__panel",
    ".bento__header",
    ".bento__grid > *",
    ".showcase__header",
    ".showcase__grid > *",
    ".section-header",
    ".catalog-tabs",
    ".catalog > *",
    ".support-card"
  ];

  var targets = [];
  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      targets.push(el);
    });
  });

  if (!targets.length) return;

  targets.forEach(function (el, index) {
    if (el.classList.contains("reveal")) return;
    el.classList.add("reveal");
    el.classList.add("reveal--delay-" + (((index % 6) + 1) | 0));
  });

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  targets.forEach(function (el) {
    io.observe(el);
  });
}

function setupMagicBox(box, panelId) {
  if (!box) return;

  var toggle = box.querySelector(".magic-box__toggle");
  var panel = document.getElementById(panelId);

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    var willOpen = !box.classList.contains("magic-box--open");
    closeAllMagicBoxes();
    if (willOpen) openMagicBox(box, panel, toggle);
  });
}

function openMagicBox(box, panel, toggle) {
  box.classList.add("magic-box--open");
  panel.hidden = false;
  toggle.setAttribute("aria-expanded", "true");
}

function closeAllMagicBoxes() {
  document.querySelectorAll(".magic-box--open").forEach(function (box) {
    var toggle = box.querySelector(".magic-box__toggle");
    var panel = box.querySelector(".magic-box__panel");
    box.classList.remove("magic-box--open");
    if (panel) panel.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  });
}

function initOrbitTooltips(root) {
  if (!root) return;

  root.querySelectorAll(".orbit-picker").forEach(function (picker) {
    var tooltip = picker.querySelector(".orbit-tooltip");
    if (!tooltip) return;

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function show(label, desc, rect) {
      var safeLabel = escapeHtml(label || "");
      var safeDesc = desc ? escapeHtml(desc) : "";
      tooltip.innerHTML =
        '<div class="orbit-tooltip__label">' +
        safeLabel +
        "</div>" +
        (safeDesc ? '<div class="orbit-tooltip__desc">' + safeDesc + "</div>" : "");
      tooltip.classList.add("orbit-tooltip--visible");
      tooltip.style.left = rect.left + rect.width / 2 + "px";
      tooltip.style.top = rect.top + "px";
    }

    function hide() {
      tooltip.classList.remove("orbit-tooltip--visible");
    }

    picker.querySelectorAll(".orbit-picker__dot").forEach(function (dot) {
      var label =
        dot.getAttribute("aria-label") ||
        dot.getAttribute("data-label") ||
        dot.getAttribute("title") ||
        "";
      var desc = dot.getAttribute("data-desc") || "";

      dot.addEventListener("mouseenter", function () {
        var r = dot.getBoundingClientRect();
        show(label, desc, r);
      });
      dot.addEventListener("mouseleave", hide);
      dot.addEventListener("focus", function () {
        var r = dot.getBoundingClientRect();
        show(label, desc, r);
      });
      dot.addEventListener("blur", hide);
    });
  });
}

function initAmbientObjects() {
  if (document.querySelector(".ambient-objects")) return;

  var root = document.createElement("div");
  root.className = "ambient-objects";

  // Набор «вкусных» объектов (можно расширять).
  var objects = [
    { type: "square", x: 0.12, y: 0.22, size: 26 },
    { type: "square", x: 0.9, y: 0.26, size: 20 },
    { type: "diamond", x: 0.18, y: 0.78, size: 18 },
    { type: "diamond", x: 0.82, y: 0.74, size: 22 },
    { type: "ring", x: 0.5, y: 0.16, size: 16 },
    { type: "ring", x: 0.5, y: 0.86, size: 16 },
    { type: "triangle", x: 0.08, y: 0.55, size: 18 },
    { type: "triangle", x: 0.92, y: 0.58, size: 18 },
    { type: "square", x: 0.3, y: 0.12, size: 16 },
    { type: "diamond", x: 0.7, y: 0.9, size: 16 },
    { type: "square", x: 0.62, y: 0.52, size: 34 }
  ];

  objects.forEach(function (o, i) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "ambient-object ambient-object--" + o.type;
    el.style.left = Math.round(o.x * 1000) / 10 + "%";
    el.style.top = Math.round(o.y * 1000) / 10 + "%";
    el.style.setProperty("--size", o.size + "px");
    el.style.setProperty("--delay", (i % 5) * 0.2 + "s");
    // Разные скорости вращения для “живости”.
    el.style.setProperty("--spin", 8 + (i % 7) * 1.4 + "s");
    el.style.setProperty("--spin-dir", i % 2 ? "normal" : "reverse");
    el.setAttribute("aria-label", "Декоративный объект");
    el.dataset.index = String(i);
    root.appendChild(el);
  });

  var host = document.querySelector(".float-widgets") || document.body;
  host.appendChild(root);

  // Взаимодействие: hover-подсветка, click-пульс, drag-перетаскивание.
  var drag = { active: false, el: null, startX: 0, startY: 0, dx: 0, dy: 0 };

  function onDown(e) {
    var el = e.target.closest(".ambient-object");
    if (!el) return;
    drag.active = true;
    drag.el = el;
    el.classList.add("is-dragging");
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.dx = 0;
    drag.dy = 0;
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {}
  }

  function onMove(e) {
    if (!drag.active || !drag.el) return;
    drag.dx = e.clientX - drag.startX;
    drag.dy = e.clientY - drag.startY;
    drag.el.style.setProperty("--drag-x", drag.dx + "px");
    drag.el.style.setProperty("--drag-y", drag.dy + "px");
  }

  function onUp(e) {
    if (!drag.active || !drag.el) return;
    drag.el.classList.remove("is-dragging");
    drag.el.style.setProperty("--drag-x", "0px");
    drag.el.style.setProperty("--drag-y", "0px");
    drag.active = false;
    drag.el = null;
  }

  root.addEventListener("pointerdown", onDown);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);

  root.querySelectorAll(".ambient-object").forEach(function (el) {
    el.addEventListener("click", function () {
      el.classList.remove("is-pulse");
      // принудительный reflow для перезапуска анимации
      void el.offsetWidth;
      el.classList.add("is-pulse");
      setTimeout(function () {
        el.classList.remove("is-pulse");
      }, 650);
    });
  });
}

function initThemeCursor() {
  if (document.querySelector(".theme-cursor")) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  var cursor = document.createElement("div");
  cursor.className = "theme-cursor";
  cursor.innerHTML =
    '<div class="theme-cursor__ring" aria-hidden="true"></div>' +
    '<div class="theme-cursor__dot" aria-hidden="true"></div>';
  document.body.appendChild(cursor);
  document.body.classList.add("has-theme-cursor");

  var target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var current = { x: target.x, y: target.y };
  var raf = 0;

  function tick() {
    raf = requestAnimationFrame(tick);
    // лёгкая “инерция” для кольца
    current.x += (target.x - current.x) * 0.18;
    current.y += (target.y - current.y) * 0.18;
    cursor.style.left = current.x + "px";
    cursor.style.top = current.y + "px";
  }

  document.addEventListener(
    "pointermove",
    function (e) {
      target.x = e.clientX;
      target.y = e.clientY;
      cursor.classList.add("theme-cursor--visible");
      cursor.classList.toggle(
        "theme-cursor--pointer",
        !!e.target.closest('a, button, input, textarea, select, label, [role="button"], [role="link"]')
      );
      if (!raf) tick();
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerdown",
    function () {
      cursor.classList.add("theme-cursor--down");
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerup",
    function () {
      cursor.classList.remove("theme-cursor--down");
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", function () {
    cursor.classList.remove("theme-cursor--visible");
    cursor.classList.remove("theme-cursor--pointer");
    cursor.classList.remove("theme-cursor--down");
  });
}
