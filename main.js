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

  initLiveWallpaper();
  initGlowCards();
  initShowcase();
})();

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
      ctx.fillStyle = "rgba(0, 255, 102, " + a + ")";
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
