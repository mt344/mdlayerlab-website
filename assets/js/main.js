(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentLang = 'de';

  /* ---------------- Intro layer-build animation ---------------- */
  function runIntro() {
    var intro = document.getElementById('intro');
    var stack = document.getElementById('introStack');
    if (!intro) return;

    if (reduceMotion) {
      intro.classList.add('is-done');
      return;
    }

    var colors = ['#0d1b30', '#15294a', '#74c927', '#8fe23a', '#ffffff', '#8fe23a'];
    var count = colors.length;
    colors.forEach(function (color, i) {
      var layer = document.createElement('div');
      layer.className = 'intro-layer';
      layer.style.background = color;
      layer.style.bottom = (i * (100 / count)) + '%';
      layer.style.animationDelay = (i * 0.09) + 's';
      stack.appendChild(layer);
    });

    var totalDelay = count * 90 + 550 + 700;
    var finish = window.setTimeout(function () {
      intro.classList.add('is-done');
    }, totalDelay);

    intro.addEventListener('click', function () {
      window.clearTimeout(finish);
      intro.classList.add('is-done');
    });
  }

  /* ---------------- Mobile nav ---------------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Hero video, scroll-synced ---------------- */
  function initHeroVideo() {
    var video = document.getElementById('heroVideo');
    var track = document.querySelector('.hero-track');
    var pin = document.querySelector('.hero-pin');
    var header = document.getElementById('siteHeader');
    if (!video || !track || !pin) return;

    if (reduceMotion) {
      video.setAttribute('controls', '');
      if (header) header.classList.remove('is-transparent');
      return;
    }

    var duration = 0;
    function captureDuration() {
      if (video.duration && !isNaN(video.duration)) duration = video.duration;
    }
    video.addEventListener('loadedmetadata', captureDuration);
    video.addEventListener('durationchange', captureDuration);
    // Metadata can finish loading (especially for local/cached files) before
    // this script attaches its listeners above, so check directly too.
    captureDuration();

    // Mobile Safari (iOS) won't paint any seeked frame of a video that has
    // never actually played, even if you only ever set .currentTime by
    // script. A muted+playsinline video is allowed to autoplay there, so
    // briefly play then immediately pause it once to "unlock" frame
    // rendering before we start scrubbing it via scroll.
    var unlocked = false;
    function unlockVideoFrame() {
      if (unlocked) return;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          video.pause();
          unlocked = true;
        }).catch(function () {
          // Autoplay blocked — try again on the first real user interaction.
        });
      } else {
        try { video.pause(); } catch (e) {}
        unlocked = true;
      }
    }
    if (video.readyState >= 1) unlockVideoFrame();
    video.addEventListener('loadedmetadata', unlockVideoFrame, { once: true });
    ['scroll', 'touchstart'].forEach(function (evt) {
      window.addEventListener(evt, unlockVideoFrame, { once: true, passive: true });
    });

    function computeProgress() {
      // Video is pinned (position: sticky) inside a track that's taller than
      // the viewport on desktop. On mobile there's no extra height, so the
      // track and pin are the same size and it just plays across the single
      // screen as that screen scrolls by instead of staying pinned.
      var trackRect = track.getBoundingClientRect();
      var pinnable = track.offsetHeight - pin.offsetHeight;
      if (pinnable <= 0) pinnable = track.offsetHeight;
      var scrolledIntoTrack = -trackRect.top;
      return Math.max(0, Math.min(1, scrolledIntoTrack / pinnable));
    }

    var ticking = false;
    function updateScrub() {
      ticking = false;
      if (header) {
        var trackRect = track.getBoundingClientRect();
        header.classList.toggle('is-transparent', trackRect.bottom > 90);
      }
      if (!duration) return;
      var progress = computeProgress();
      var target = progress * duration;
      if (Math.abs(video.currentTime - target) > 0.03) {
        try { video.currentTime = target; } catch (e) {}
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateScrub);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      window.requestAnimationFrame(updateScrub);
    }, { passive: true });

    updateScrub();
  }

  /* ---------------- Materials & colors data ---------------- */
  var materialsData = [
    {
      id: 'pla-basic',
      tab: { de: 'PLA Basic', en: 'PLA Basic' },
      name: { de: 'PLA Basic', en: 'PLA Basic' },
      tagline: { de: 'Hart & formstabil', en: 'Rigid & dimensionally stable' },
      price: 'ca. 0,20–0,30 €/cm³',
      desc: {
        de: 'Pflanzenbasierter Kunststoff mit stabiler, formtreuer Struktur und leicht glänzender Oberfläche. Ideal für Deko, Gehäuse und Alltagsobjekte im Innenbereich.',
        en: 'Plant-based plastic with a stable, dimensionally accurate structure and a slightly glossy surface. Ideal for decor, housings and everyday indoor objects.'
      },
      colors: [
        { name: { de: 'Jade White', en: 'Jade White' }, hex: '#F0E9DC', img: 'jade-white', desc: { de: 'Sanftes, leicht warmes Weiß – elegant und vielseitig einsetzbar.', en: 'Soft, slightly warm white — elegant and versatile.' } },
        { name: { de: 'Cocoa Brown', en: 'Cocoa Brown' }, hex: '#9C4A2B', img: 'cocoa-brown', desc: { de: 'Tiefes, sattes Braun – natürlich und hochwertig wirkend.', en: 'Deep, rich brown — natural and premium-looking.' } },
        { name: { de: 'Gray', en: 'Gray' }, hex: '#9EA3A8', img: 'vase-grey', desc: { de: 'Klassisches Grau – schlicht, modern und technisch.', en: 'Classic grey — simple, modern and technical.' } },
        { name: { de: 'Sakura Pink', en: 'Sakura Pink' }, hex: '#E9AFC0', img: 'vase-pink', desc: { de: 'Zartes Rosa – weich und freundlich.', en: 'Delicate pink — soft and friendly.' } },
        { name: { de: 'Candy', en: 'Candy' }, hex: '#F2A0C0', img: 'candy', desc: { de: 'Heller Pastellton – süß und verspielt.', en: 'Light pastel tone — sweet and playful.' } },
        { name: { de: 'Lavender Purple', en: 'Lavender Purple' }, hex: '#A995D9', img: 'vase-purple', desc: { de: 'Sanftes Violett – elegant und verspielt.', en: 'Gentle purple — elegant and playful.' } },
        { name: { de: 'Pastellblau', en: 'Pastel Blue' }, hex: '#B6D3EC', img: 'pastellblau', desc: { de: 'Helles Blau – weich und beruhigend.', en: 'Light blue — soft and calming.' } },
        { name: { de: 'Sapphire Blue', en: 'Sapphire Blue' }, hex: '#2E6BDD', img: 'sapphire-blue', desc: { de: 'Kräftiges Blau – modern und ausdrucksstark.', en: 'Bold blue — modern and expressive.' } },
        { name: { de: 'Charcoal Black', en: 'Charcoal Black' }, hex: '#19191B', img: 'vase-black', desc: { de: 'Dunkles Graphitschwarz – modern und technisch.', en: 'Dark graphite black — modern and technical.' } }
      ]
    },
    {
      id: 'pla-matt',
      tab: { de: 'PLA Matt', en: 'PLA Matt' },
      name: { de: 'PLA Matt', en: 'PLA Matt' },
      tagline: { de: 'Hart & formstabil, matte Oberfläche', en: 'Rigid & stable, matte finish' },
      price: 'ca. 0,20–0,30 €/cm³',
      desc: {
        de: 'Ebenfalls auf pflanzlichen Rohstoffen basierend, jedoch mit hochwertiger matter Oberfläche – Layerlines sind kaum sichtbar. Perfekt für Designobjekte, bei denen die Optik im Vordergrund steht.',
        en: 'Also plant-based, but with a premium matte surface — layer lines are barely visible. Perfect for design pieces where the look matters most.'
      },
      colors: [
        { name: { de: 'Caramel', en: 'Caramel' }, hex: '#B97A4B', img: 'vase-tan', desc: { de: 'Warmes Braun – dezent und zeitlos.', en: 'Warm brown — subtle and timeless.' } },
        { name: { de: 'Mandarin Orange', en: 'Mandarin Orange' }, hex: '#E5601A', img: 'mandarin-orange', desc: { de: 'Leuchtendes Orange – auffällig und energiegeladen.', en: 'Bright orange — bold and energetic.' } },
        { name: { de: 'Dark Blue', en: 'Dark Blue' }, hex: '#1B2A52', img: 'vase-navy', desc: { de: 'Tiefes Blau – elegant, ruhig und hochwertig.', en: 'Deep blue — elegant, calm and premium.' } },
        { name: { de: 'Apple Green', en: 'Apple Green' }, hex: '#8DC63F', img: 'vase-lime', desc: { de: 'Frisches, helles Grün – lebendig und modern.', en: 'Fresh, bright green — vivid and modern.' } },
        { name: { de: 'Grass Green', en: 'Grass Green' }, hex: '#2E9E4F', img: 'vase-green', desc: { de: 'Natürliches Grün – kräftig und harmonisch.', en: 'Natural green — bold and harmonious.' } },
        { name: { de: 'Dark Green', en: 'Dark Green' }, hex: '#22432B', img: 'dark-green', desc: { de: 'Sattes Dunkelgrün – edel und natürlich.', en: 'Rich dark green — refined and natural.' } },
        { name: { de: 'White', en: 'White' }, hex: '#FFFFFF', img: 'vase-white', desc: { de: 'Reines Weiß – minimalistisch und hochwertig.', en: 'Pure white — minimalist and premium.' } },
        { name: { de: 'Black', en: 'Black' }, hex: '#111113', img: 'vase-black', desc: { de: 'Tiefes Schwarz – edel und modern.', en: 'Deep black — refined and modern.' } }
      ]
    },
    {
      id: 'petg',
      tab: { de: 'PETG', en: 'PETG' },
      name: { de: 'PETG Basic', en: 'PETG Basic' },
      tagline: { de: 'UV- & wasserbeständig', en: 'UV & water resistant' },
      price: 'ca. 0,25–0,35 €/cm³',
      desc: {
        de: 'Robuster Kunststoff mit erhöhter Widerstandsfähigkeit gegenüber Feuchtigkeit und UV-Strahlung. Weniger spröde als PLA – ideal für funktionale Bauteile im Innen- und geschützten Außenbereich.',
        en: 'A tough plastic with strong resistance to moisture and UV light. Less brittle than PLA — ideal for functional parts indoors and in sheltered outdoor spots.'
      },
      colors: [
        { name: { de: 'White', en: 'White' }, hex: '#F2F2EE', img: 'vase-white', desc: { de: 'Klares, deckendes Weiß – sauber, neutral und vielseitig.', en: 'Clear, opaque white — clean, neutral and versatile.' } },
        { name: { de: 'Clear', en: 'Clear' }, hex: 'clear', img: 'petg-clear', desc: { de: 'Transparent mit leichter Trübung – ideal für Lichtdurchlässigkeit.', en: 'Transparent with a slight haze — ideal when light needs to pass through.' } },
        { name: { de: 'Light Gray', en: 'Light Gray' }, hex: '#B7BBC2', img: 'vase-grey', desc: { de: 'Helles Grau – modern, technisch und unauffällig elegant.', en: 'Light grey — modern, technical and quietly elegant.' } }
      ]
    },
    {
      id: 'tpu',
      tab: { de: 'TPU', en: 'TPU' },
      name: { de: 'TPU', en: 'TPU' },
      tagline: { de: 'Flexibel & elastisch', en: 'Flexible & elastic' },
      price: 'ca. 0,30–0,40 €/cm³',
      desc: {
        de: 'Elastisches, gummiartiges Material, das sich flexibel verformen lässt und danach wieder in seine ursprüngliche Form zurückkehrt. Ideal für Schutzteile, Dichtungen, Griffe oder Handyhüllen.',
        en: 'An elastic, rubber-like material that flexes and springs back to shape. Ideal for protective parts, seals, grips or phone cases.'
      },
      colors: [
        { name: { de: 'White 90A', en: 'White 90A' }, hex: '#EFEAE0', img: 'vase-white', desc: { de: 'Klares, deckendes Weiß – sauber, neutral und vielseitig.', en: 'Clear, opaque white — clean, neutral and versatile.' } }
      ]
    }
  ];

  var uiText = {
    allTab: { de: 'Alle Farben', en: 'All colours' },
    dialogClose: { de: 'Schließen', en: 'Close' }
  };

  function swatchStyle(color) {
    if (color.img) return 'background-image:url(assets/img/gallery/' + color.img + '.jpg)';
    if (color.hex === 'clear') return '';
    return 'background-color:' + color.hex;
  }

  function buildSwatchButton(material, color, lang) {
    var isClear = color.hex === 'clear' && !color.img;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.setAttribute('data-material', material.name[lang]);
    btn.setAttribute('data-tagline', material.tagline[lang]);
    btn.setAttribute('data-name', color.name[lang]);
    btn.setAttribute('data-desc', color.desc[lang]);
    btn.setAttribute('data-swatch-style', swatchStyle(color));
    btn.setAttribute('data-clear', isClear ? '1' : '0');

    var dot = document.createElement('span');
    dot.className = 'swatch-dot' + (isClear ? ' is-clear' : '');
    if (!isClear) dot.setAttribute('style', swatchStyle(color));

    var label = document.createElement('span');
    label.className = 'swatch-label';
    label.textContent = color.name[lang];

    btn.appendChild(dot);
    btn.appendChild(label);
    btn.addEventListener('click', function () { openColorDialog(btn); });
    return btn;
  }

  function renderMaterials(lang) {
    var tabList = document.getElementById('tabList');
    var tabPanels = document.getElementById('tabPanels');
    if (!tabList || !tabPanels) return;

    var activeId = tabList.getAttribute('data-active') || materialsData[0].id;

    tabList.innerHTML = '';
    tabPanels.innerHTML = '';

    materialsData.forEach(function (material) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab-btn' + (material.id === activeId ? ' is-active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', material.id === activeId ? 'true' : 'false');
      btn.setAttribute('data-tab', material.id);
      btn.textContent = material.tab[lang];
      btn.addEventListener('click', function () { setActiveTab(material.id, lang); });
      tabList.appendChild(btn);

      var panel = document.createElement('div');
      panel.className = 'tab-panel' + (material.id === activeId ? ' is-active' : '');
      panel.id = 'tab-' + material.id;
      panel.hidden = material.id !== activeId;
      panel.appendChild(buildMaterialPanelContent(material, lang));
      tabPanels.appendChild(panel);
    });

    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'tab-btn tab-btn-all' + (activeId === 'all' ? ' is-active' : '');
    allBtn.setAttribute('role', 'tab');
    allBtn.setAttribute('aria-selected', activeId === 'all' ? 'true' : 'false');
    allBtn.setAttribute('data-tab', 'all');
    allBtn.textContent = uiText.allTab[lang];
    allBtn.addEventListener('click', function () { setActiveTab('all', lang); });
    tabList.appendChild(allBtn);

    var allPanel = document.createElement('div');
    allPanel.className = 'tab-panel' + (activeId === 'all' ? ' is-active' : '');
    allPanel.id = 'tab-all';
    allPanel.hidden = activeId !== 'all';
    materialsData.forEach(function (material) {
      var group = document.createElement('div');
      group.className = 'material-group';
      var heading = document.createElement('p');
      heading.className = 'material-group-title';
      heading.textContent = material.name[lang] + ' — ' + material.tagline[lang];
      group.appendChild(heading);
      group.appendChild(buildSwatchGrid(material, lang));
      allPanel.appendChild(group);
    });
    tabPanels.appendChild(allPanel);

    tabList.setAttribute('data-active', activeId);
  }

  function buildSwatchGrid(material, lang) {
    var grid = document.createElement('div');
    grid.className = 'swatch-grid';
    material.colors.forEach(function (color) {
      grid.appendChild(buildSwatchButton(material, color, lang));
    });
    return grid;
  }

  function buildMaterialPanelContent(material, lang) {
    var wrap = document.createElement('div');

    var head = document.createElement('div');
    head.className = 'tab-panel-head';
    var h3 = document.createElement('h3');
    h3.textContent = material.name[lang];
    var tagline = document.createElement('span');
    tagline.className = 'tab-panel-tagline';
    tagline.textContent = material.tagline[lang];
    var price = document.createElement('span');
    price.className = 'tab-panel-price';
    price.textContent = material.price;
    head.appendChild(h3);
    head.appendChild(tagline);
    head.appendChild(price);

    var desc = document.createElement('p');
    desc.className = 'tab-panel-desc';
    desc.textContent = material.desc[lang];

    wrap.appendChild(head);
    wrap.appendChild(desc);
    wrap.appendChild(buildSwatchGrid(material, lang));
    return wrap;
  }

  function setActiveTab(id, lang) {
    var tabList = document.getElementById('tabList');
    if (!tabList) return;
    tabList.setAttribute('data-active', id);
    renderMaterials(lang);
  }

  function openColorDialog(btn) {
    var dialog = document.getElementById('colorDialog');
    if (!dialog) return;
    var swatch = document.getElementById('colorDialogSwatch');
    var isClear = btn.getAttribute('data-clear') === '1';
    swatch.className = 'color-dialog-swatch' + (isClear ? ' is-clear' : '');
    if (!isClear) swatch.setAttribute('style', btn.getAttribute('data-swatch-style'));
    else swatch.removeAttribute('style');

    document.getElementById('colorDialogMaterial').textContent = btn.getAttribute('data-material') + ' · ' + btn.getAttribute('data-tagline');
    document.getElementById('colorDialogName').textContent = btn.getAttribute('data-name');
    document.getElementById('colorDialogDesc').textContent = btn.getAttribute('data-desc');

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function initColorDialog() {
    var dialog = document.getElementById('colorDialog');
    var closeBtn = document.getElementById('colorDialogClose');
    if (!dialog || !closeBtn) return;
    closeBtn.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------------- Language switch ---------------- */
  var translations = {
    en: {
      'nav.services': 'Services',
      'nav.materials': 'Materials',
      'nav.gallery': 'Gallery',
      'nav.process': 'Process',
      'nav.contact': 'Contact',

      'hero.eyebrow': '3D printing studio for private customers',
      'hero.title': 'Your idea.<br>Built layer<br>by <span class="accent-text">layer.</span>',
      'hero.lede': 'Got a problem, a vision, or a gap in your home that exactly one part could fill? We design it together with you and print it — in almost any colour you like.',
      'hero.ctaPrimary': 'Send a request',
      'hero.ctaSecondary': 'See projects',
      'hero.trust1': 'In-house design & advice',
      'hero.trust2': 'Printed with Bambu Lab technology',
      'hero.trust3': 'Any colour you like',
      'hero.chip1': 'From idea to object',
      'hero.chip2': 'In your favourite colour',
      'hero.scroll': 'Scroll',

      'services.eyebrow': 'Services',
      'services.title': 'What people come to us for',
      'services.lede': "No request is too small or too unusual. Tell us what you have in mind — we'll find a solution that fits.",
      'services.card1.title': 'Custom requests',
      'services.card1.text': "Have an idea, a problem, or a missing part? We'll design the right 3D model together with you and bring it to life.",
      'services.card2.title': 'Decor & gifts',
      'services.card2.text': 'Vases, figures, personalised signs or memorable gifts — printed in the colour of your choice.',
      'services.card3.title': 'Spare parts & repair',
      'services.card3.text': 'A household appliance has a broken part? We measure, design and print a matching replacement.',
      'services.card4.title': 'Prototypes & businesses',
      'services.card4.text': 'Also for companies: functional prototypes, small batches, or custom promotional and gift items for clients and staff.',

      'materials.eyebrow': 'Materials',
      'materials.title': 'The right material for your project',
      'materials.lede': "Every material has its strengths. Pick a material to see all matching colours — or browse every colour at a glance. Click any colour for details.",

      'gallery.eyebrow': 'Gallery',
      'gallery.title': 'Selected projects',
      'gallery.lede': "A small look at what's already come off our printer.",
      'gallery.helm': 'Wall-mounted helmet holder',
      'gallery.helmHint': 'Drag: without ↔ with helmet',
      'gallery.printer': 'How your project comes to life — in your favourite colour',
      'gallery.haarwerk': 'Business card holder for a hair salon',
      'gallery.sphere': 'Decor piece, ribbed finish',
      'gallery.bunny': 'Custom-designed phone stand',
      'gallery.blumen': 'Decorative bookends with a floral motif',

      'process.eyebrow': 'Process',
      'process.title': 'This is how easy it is to get your object',
      'process.step1.title': 'Send a request',
      'process.step1.text': 'Describe your idea, your problem, or send a photo — via the form or directly on WhatsApp.',
      'process.step2.title': 'Design & quote',
      'process.step2.text': "We'll discuss size, material and colour with you and put together a no-obligation quote.",
      'process.step3.title': 'Printed in your colour',
      'process.step3.text': 'Once you approve it, we print your object layer by layer — clean and to the quality you expect.',
      'process.step4.title': 'Pickup or shipping',
      'process.step4.text': 'Pick up your finished piece from us or have it shipped straight to your door.',

      'contact.eyebrow': 'Contact',
      'contact.title': 'Tell us about your idea',
      'contact.lede': 'The more precise your description, the faster we can put together a matching quote. You can also reach us directly:',
      'contact.whatsapp': 'Start a WhatsApp chat',
      'contact.whatsappBtn': 'Quick chat on WhatsApp',

      'form.name': 'Name',
      'form.email': 'Email address',
      'form.idea': 'What do you have in mind?',
      'form.ideaPh': 'e.g. a decorative vase for the living room, a spare part for ...',
      'form.problem': 'What does the problem / object look like?',
      'form.problemPh': 'Describe shape and function, or send a photo by email afterwards',
      'form.size': 'Approximate size',
      'form.sizePh': 'e.g. approx. 10 x 10 x 15 cm',
      'form.submit': 'Send request',
      'form.note': "We'll get back to you by email as soon as possible.",

      'footer.tagline': '3D printing studio for custom ideas & decor.',
      'footer.impressum': 'Legal notice',
      'footer.privacy': 'Privacy'
    }
  };

  var deDefaults = {};

  function collectDefaults() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      deDefaults[el.getAttribute('data-i18n') + '::html::' + uniqueKey(el)] = el.innerHTML;
    });
  }

  var keyCounter = 0;
  var elementKeys = new WeakMap();
  function uniqueKey(el) {
    if (!elementKeys.has(el)) {
      elementKeys.set(el, keyCounter++);
    }
    return elementKeys.get(el);
  }

  function applyLanguage(lang) {
    var isEn = lang === 'en';
    currentLang = isEn ? 'en' : 'de';
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute('data-lang', currentLang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (isEn && translations.en[key]) {
        el.innerHTML = translations.en[key];
      } else {
        var storedKey = key + '::html::' + uniqueKey(el);
        if (deDefaults[storedKey]) el.innerHTML = deDefaults[storedKey];
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      if (isEn && translations.en[key]) {
        el.setAttribute('placeholder', translations.en[key]);
      } else {
        el.setAttribute('placeholder', el.getAttribute('data-de-ph') || el.getAttribute('placeholder'));
      }
    });

    document.querySelectorAll('.lang-opt').forEach(function (opt) {
      opt.classList.toggle('is-active', opt.getAttribute('data-lang-opt') === lang);
    });

    var closeBtn = document.getElementById('colorDialogClose');
    if (closeBtn) closeBtn.setAttribute('aria-label', uiText.dialogClose[currentLang]);

    renderMaterials(currentLang);

    try { localStorage.setItem('mdlayerlab-lang', lang); } catch (e) {}
  }

  function initLanguage() {
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('data-de-ph', el.getAttribute('placeholder'));
    });
    collectDefaults();

    var toggle = document.getElementById('langToggle');

    var stored = null;
    try { stored = localStorage.getItem('mdlayerlab-lang'); } catch (e) {}
    applyLanguage(stored === 'en' ? 'en' : 'de');

    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-lang') || 'de';
      applyLanguage(current === 'de' ? 'en' : 'de');
    });
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Before/after drag-slider (helmet holder) ---------------- */
  function initCompareCards() {
    document.querySelectorAll('.showcase-compare').forEach(function (card) {
      var frame = card.querySelector('.compare-frame');
      var topImg = card.querySelector('.compare-img-top');
      var handle = card.querySelector('.compare-handle');
      if (!frame || !topImg || !handle) return;

      function setPosition(pct) {
        pct = Math.max(0, Math.min(100, pct));
        topImg.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        handle.style.left = pct + '%';
        handle.setAttribute('aria-valuenow', String(Math.round(pct)));
      }

      function pctFromClientX(clientX) {
        var rect = frame.getBoundingClientRect();
        return ((clientX - rect.left) / rect.width) * 100;
      }

      var dragging = false;

      function onPointerMove(e) {
        if (!dragging) return;
        setPosition(pctFromClientX(e.clientX));
      }
      function stopDragging() {
        dragging = false;
      }

      frame.addEventListener('pointerdown', function (e) {
        dragging = true;
        handle.focus();
        setPosition(pctFromClientX(e.clientX));
      });
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', stopDragging);
      window.addEventListener('pointercancel', stopDragging);

      handle.addEventListener('keydown', function (e) {
        var current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
        if (e.key === 'ArrowLeft') { setPosition(current - 5); e.preventDefault(); }
        if (e.key === 'ArrowRight') { setPosition(current + 5); e.preventDefault(); }
        if (e.key === 'Home') { setPosition(0); e.preventDefault(); }
        if (e.key === 'End') { setPosition(100); e.preventDefault(); }
      });

      setPosition(50);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    runIntro();
    initNav();
    initHeroVideo();
    initColorDialog();
    initCompareCards();
    initLanguage(); // also triggers first renderMaterials()
    initYear();
  });
})();
