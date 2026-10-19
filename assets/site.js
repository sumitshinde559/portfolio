(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById('theme-btn');
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    try { return localStorage.getItem('ss-theme'); } catch (e) { return null; }
  }
  function applyTheme() {
    var t = storedTheme();
    var dark = t ? t === 'dark' : darkQuery.matches;
    root.setAttribute('data-theme-resolved', dark ? 'dark' : 'light');
    if (themeBtn) themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme-resolved') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ss-theme', next); } catch (e) {}
      applyTheme();
    });
  }
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', applyTheme);
  applyTheme();

  /* ---------- Header ---------- */
  var header = document.querySelector('.site-header');
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menu-btn');

  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Merge field ---------- */
  var TOKEN = '{{FirstName}}';
  var FALLBACK = 'there';
  var input = document.getElementById('name');
  var sizer = document.querySelector('.merge-sizer');
  var typing = null;

  function fitInput() {
    // The hidden sizer copies the field's type so the field can be sized to its text.
    sizer.className = 'merge-sizer invisible absolute left-0 top-0 whitespace-pre px-[0.16em] ' +
      (input.classList.contains('is-token')
        ? 'font-mono text-[length:0.78em] font-medium tracking-[-0.06em]'
        : 'font-sans text-[length:1em] font-bold tracking-[inherit]');
    sizer.textContent = input.value || input.placeholder || ' ';
    input.style.width = (sizer.getBoundingClientRect().width + 2) + 'px';
  }
  function currentName() {
    var v = input.value.trim();
    return v && v !== TOKEN ? v : FALLBACK;
  }
  function stopTyping() { if (typing) { clearTimeout(typing); typing = null; } }

  function resolveToken() {
    // Show the raw merge field for a moment, then "send" it: the field resolves to a name.
    var target = FALLBACK;
    if (reduceMotion) { input.classList.remove('is-token'); input.value = target; fitInput(); render(); return; }
    var step = function () {
      if (input.value.length && input.classList.contains('is-token')) {
        input.value = input.value.slice(0, -1);
        fitInput();
        typing = setTimeout(step, 34);
        return;
      }
      input.classList.remove('is-token');
      if (input.value.length < target.length) {
        input.value = target.slice(0, input.value.length + 1);
        fitInput();
        typing = setTimeout(step, 85);
      } else {
        typing = null;
        render();
      }
    };
    typing = setTimeout(step, 1100);
  }

  input.addEventListener('focus', function () {
    if (typing || input.classList.contains('is-token')) {
      stopTyping();
      input.classList.remove('is-token');
      input.value = FALLBACK;
      fitInput();
    }
    input.select();
  });
  input.addEventListener('input', function () {
    input.classList.remove('is-token');
    fitInput();
    render();
  });
  input.addEventListener('blur', function () {
    if (!input.value.trim()) { input.value = FALLBACK; fitInput(); render(); }
  });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });

  /* ---------- Email viewer ---------- */
  var emails = {
    vu: {
      from: 'Victoria University',
      subject: 'Here’s the ebook about VU’s Graduate Certificate in Planetary Health, {{Name}}!',
      notes: [
        ['Platform', 'Oracle Eloqua, sent to people who asked for the course ebook.'],
        ['What I built', 'The template, an animated GIF header, the ebook button and a call-back link to a course-specific landing page.'],
        ['Personalisation', 'First name in the subject line and greeting, with a fallback when the field is empty.']
      ]
    },
    uoa: {
      from: 'University of Auckland',
      subject: 'International Open Week webinars start today, {{Name}}!',
      notes: [
        ['Platform', 'Oracle Eloqua, sent on the first day of International Open Week 2022.'],
        ['What I built', 'A card-style template with a full-width banner, a rounded call-to-action button and a contact block for student advisers.'],
        ['Personalisation', 'First name in the subject line and the Kia ora greeting.']
      ]
    }
  };
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.msg'));
  var frame = document.getElementById('email-frame');
  var stage = document.getElementById('stage');
  var reader = document.getElementById('reader');
  var readerSubject = document.getElementById('reader-subject');
  var readerTo = document.getElementById('reader-to');
  var notes = document.getElementById('mail-notes');
  var active = 'vu';
  var renderedKey = '';
  var sourceCache = {};

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function source(id) {
    if (!sourceCache[id]) sourceCache[id] = document.getElementById('email-' + id).textContent.trim();
    return sourceCache[id];
  }
  function subjectFor(id, name) { return emails[id].subject.replace(/\{\{Name\}\}/g, name); }

  function render() {
    var name = currentName();
    tabs.forEach(function (t) {
      var s = t.querySelector('.msg-subject');
      s.textContent = subjectFor(t.dataset.email, name);
    });
    readerSubject.textContent = subjectFor(active, name);
    readerTo.textContent = name === FALLBACK ? 'you' : name;

    var key = active + '|' + name;
    if (key !== renderedKey) {
      renderedKey = key;
      var html = source(active).replace(/\{\{Name\}\}/g, esc(name));
      // Links in the preview open in a new tab rather than inside the frame.
      html = html.replace(/<head>/i, '<head><base target="_blank">');
      frame.srcdoc = html;
    }
  }

  // Size the preview to the email's full height, so phones scroll the page, not a box inside it.
  function fitFrame() {
    try {
      var doc = frame.contentDocument;
      if (!doc || !doc.documentElement) return;
      frame.style.height = '0px';
      var h = Math.max(doc.documentElement.scrollHeight, doc.body ? doc.body.scrollHeight : 0);
      frame.style.height = Math.max(h, 420) + 'px';
    } catch (e) { frame.style.height = ''; }
  }
  frame.addEventListener('load', function () {
    fitFrame();
    try {
      Array.prototype.forEach.call(frame.contentDocument.images, function (img) {
        if (!img.complete) { img.addEventListener('load', fitFrame); img.addEventListener('error', fitFrame); }
      });
    } catch (e) {}
  });
  var fitTimer;
  window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitFrame, 120); });

  function renderNotes() {
    notes.innerHTML = emails[active].notes.map(function (n) {
      return '<div><dt>' + esc(n[0]) + '</dt><dd>' + esc(n[1]) + '</dd></div>';
    }).join('');
  }

  function select(id, focus) {
    active = id;
    tabs.forEach(function (t) {
      var on = t.dataset.email === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) { reader.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); }
    });
    frame.title = 'Preview of the ' + emails[id].from + ' email';
    renderNotes();
    render();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.dataset.email); });
    t.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      select(next.dataset.email, true);
    });
  });

  var deviceBtns = Array.prototype.slice.call(document.querySelectorAll('[data-device]'));
  deviceBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      deviceBtns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      stage.classList.toggle('is-phone', b.dataset.device === 'phone');
      setTimeout(fitFrame, 380);
    });
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copy-btn');
  var copyStatus = document.getElementById('copy-status');
  copyBtn.addEventListener('click', function () {
    var addr = 'sumitshinde559@gmail.com';
    var done = function () { copyStatus.textContent = 'Email address copied.'; copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 2000); };
    var fail = function () { copyStatus.textContent = 'Couldn’t copy. The address is ' + addr + '.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(done, fail);
    else fail();
  });

  /* ---------- Start ---------- */
  fitInput();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitInput);
  window.addEventListener('resize', fitInput);
  select('vu');
  resolveToken();
})();
