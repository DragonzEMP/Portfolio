/**
 * Syed Ridwan Ahmed Fahim — Portfolio Core Engine
 * Architecture:
 * 1. Theme Management (Sync with localStorage & system preference)
 * 2. Sliding Capsule Navigation & Active Section Spy
 * 3. Interactive WebGL Liquid Distortion Shader Background (#bg-canvas)
 * 4. 3D Project Rotunda (#work) — Exact Reference Architecture & Kinematics
 * 5. Disciplines Hover & Editorial Interactions (#what-i-do)
 * 6. Interactive CLI Terminal (#terminal)
 * 7. Contact Section Interactions (#contact)
 */

(function () {
  'use strict';

  // Global reduced motion query
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================================================
  // 1. THEME MANAGEMENT
  // ==========================================================================
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) {}
    });
  }

  // ==========================================================================
  // 2. SLIDING CAPSULE NAVIGATION & SCROLL SPY
  // ==========================================================================
  const navCapsule = document.getElementById('navCapsule');
  const navInd = document.getElementById('navInd');
  const navLinks = navCapsule ? Array.from(navCapsule.querySelectorAll('.nav-link')) : [];
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  function moveIndicatorTo(el) {
    if (!navInd || !el || !navCapsule) return;
    const navRect = navCapsule.getBoundingClientRect();
    const linkRect = el.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    const width = linkRect.width;
    navInd.style.transform = `translateX(${left}px)`;
    navInd.style.width = `${width}px`;
    navInd.style.opacity = '1';
  }

  function resetIndicatorToActive() {
    const active = navLinks.find(link => link.classList.contains('active')) || navLinks[0];
    if (active) moveIndicatorTo(active);
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicatorTo(link));
    link.addEventListener('focus', () => moveIndicatorTo(link));
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      moveIndicatorTo(link);
    });
  });

  if (navCapsule) {
    navCapsule.addEventListener('mouseleave', resetIndicatorToActive);
  }

  // Mobile navigation drawer toggle
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    });

    mobileNav.querySelectorAll('.m-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // Scroll Spy
  const sections = Array.from(document.querySelectorAll('section[id]'));
  function onScroll() {
    const scrollPos = window.scrollY + 180;
    let currentId = '';

    for (let i = sections.length - 1; i >= 0; i--) {
      const s = sections[i];
      if (s.offsetTop <= scrollPos) {
        currentId = s.id;
        break;
      }
    }

    if (currentId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const match = href === `#${currentId}`;
        link.classList.toggle('active', match);
      });
      resetIndicatorToActive();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', () => {
    onScroll();
    resetIndicatorToActive();
  });

  // ==========================================================================
  // 3. INTERACTIVE WEBGL LIQUID BACKGROUND (#bg-canvas)
  // ==========================================================================
  function initLiquidBg() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false }) ||
               canvas.getContext('experimental-webgl', { alpha: true, antialias: false, depth: false });
    if (!gl) return;

    // Full-viewport quad vertex shader
    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Liquid distortion fragment shader with domain warping & mouse propagation
    const fsSource = `
      precision mediump float;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_scroll;
      varying vec2 v_uv;

      // Fast simplex-style pseudo noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float val = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          val += amp * noise(p);
          p *= 2.05;
          amp *= 0.5;
        }
        return val;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float aspect = u_res.x / u_res.y;
        vec2 aspect_uv = vec2(uv.x * aspect, uv.y);
        vec2 m = vec2(u_mouse.x * aspect, u_mouse.y);

        // Fluid time scale & vertical flow offset based on scroll
        float t = u_time * 0.22;
        vec2 q = vec2(fbm(aspect_uv + t * 0.3), fbm(aspect_uv + vec2(1.0) - t * 0.2));

        // Interactive mouse disturbance wave
        float dist = distance(aspect_uv, m);
        float mouseWave = exp(-dist * 3.2) * sin(dist * 24.0 - u_time * 4.0);
        q += (aspect_uv - m) * mouseWave * 0.25;

        // Second domain warping layer
        vec2 r = vec2(
          fbm(aspect_uv + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t + vec2(0.0, u_scroll * 0.0003)),
          fbm(aspect_uv + 3.0 * q + vec2(8.3, 2.8) + 0.126 * t)
        );

        float f = fbm(aspect_uv + 3.5 * r);

        // Cyberpunk atmospheric palette mapping:
        // Deep obsidian background (#060910), cyan tint (#22d3ee), cobalt blue (#2563eb), violet (#6c48e8)
        vec3 colA = vec3(0.024, 0.035, 0.063); // #060910
        vec3 colB = vec3(0.06, 0.14, 0.35);    // #0f2459
        vec3 colC = vec3(0.133, 0.827, 0.933); // #22d3ee
        vec3 colD = vec3(0.42, 0.28, 0.91);    // #6c48e8

        vec3 color = mix(colA, colB, clamp(f * f * 2.2, 0.0, 1.0));
        color = mix(color, colD, clamp(length(q) * 0.45, 0.0, 1.0));
        color = mix(color, colC, clamp(length(r.x) * f * 0.6, 0.0, 1.0));

        // Add subtle mouse glow bloom
        float bloom = exp(-dist * 5.0) * 0.22;
        color += colC * bloom;

        gl_FragColor = vec4(color, 0.38); // Translucent fluid overlaying deep void
      }
    `;

    function createShader(type, src) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Quad geometry
    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uScroll = gl.getUniformLocation(program, 'u_scroll');

    let mouseX = 0.5, mouseY = 0.5;
    let targetMouseX = 0.5, targetMouseY = 0.5;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    window.addEventListener('pointermove', (e) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = 1.0 - (e.clientY / window.innerHeight);
    }, { passive: true });

    let startTime = performance.now();
    function render() {
      // Lerp mouse coordinates
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      const elapsed = (performance.now() - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uScroll, window.scrollY || 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
  initLiquidBg();

  // ==========================================================================
  // 4. 3D PROJECT ROTUNDA (#work) — EXACT MATCH TO REFERENCE DESIGN
  // ==========================================================================
  function initRotunda() {
    const hall = document.getElementById('projectHall');
    const stage = document.getElementById('hallStage');
    if (!hall || !stage) return;

    const cards = Array.from(stage.querySelectorAll('.hall-card'));
    const dots = Array.from(document.querySelectorAll('#hallDots button'));
    const prevBtn = document.getElementById('hallPrev');
    const nextBtn = document.getElementById('hallNext');
    const titleEl = document.getElementById('hallTitle');
    const countEl = document.getElementById('hallCount');
    const primaryBtn = document.getElementById('hallPrimaryBtn');

    const s = cards.length;
    if (!s) return;

    // EXACT reference constants from deploy-preview-7
    const Sc = 13;      // Step angle = 13 degrees per card
    const Y_ = 0.16;    // Gap ratio between cards = 16%

    let f = 0;          // Smooth interpolated float position
    let v = 0;          // Target discrete step index
    let isHovered = false;
    let b = 0;          // Current active integer index

    // Shortest modular circular distance in [ -s/2, s/2 ]
    const z = (P) => {
      const H = s / 2;
      return ((P + H) % s + s) % s - H;
    };

    const setTarget = (N) => {
      v = N;
      if (prefersReducedMotion) f = N;
    };

    const step = (dir) => {
      setTarget(Math.round(v) + dir);
    };

    const projectData = [
      { title: 'Nexus Gear', url: 'https://nexus-gear.onrender.com' },
      { title: 'Brick Smasher 67', url: 'https://brick67.vercel.app' },
      { title: 'Retro Racing', url: 'https://retro-racing-game.vercel.app' },
      { title: 'Chat-EXE', url: 'https://chat-exe.onrender.com' },
      { title: 'Neon Snake', url: 'https://neon-snake-swart-beta.vercel.app' },
      { title: 'UNO Online', url: 'https://uno-six-iota.vercel.app' },
      { title: 'Sentiment NLP', url: 'https://github.com/DragonzEMP/YouTube-Comment-Sentiment-Analysis' },
      { title: 'WordPress Themes', url: '#contact' },
      { title: 'Network Systems', url: 'https://github.com/DragonzEMP' },
      { title: 'Sonar Radar', url: 'https://github.com/DragonzEMP' }
    ];

    function updateMeta(idx) {
      const p = projectData[idx] || projectData[0];
      if (!p) return;

      if (countEl) {
        countEl.innerHTML = `<b>${String(idx + 1).padStart(2, '0')}</b> / ${String(s).padStart(2, '0')}`;
      }
      if (titleEl) {
        titleEl.textContent = p.title.toUpperCase();
        titleEl.style.setProperty('--len', String(p.title.length));
      }
      if (primaryBtn) {
        primaryBtn.href = p.url;
      }

      dots.forEach((dot, i) => {
        const isActive = i === idx;
        dot.classList.toggle('on', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    // Main 3D animation loop with lerp and cylindrical transform
    function loop() {
      // Robust card width calculation (never 0)
      const firstCard = hall.querySelector('.hall-card');
      const P = Math.max(160, firstCard ? firstCard.offsetWidth : 220);

      // Lerp interpolation
      f += (v - f) * (prefersReducedMotion ? 1 : 0.09);

      cards.forEach((F, re) => {
        if (!F) return;
        const Q = z(re - f);
        const ae = Math.abs(Q);
        const Ee = (Sc / 2) * Math.PI / 180;
        const je = Q * Sc * Math.PI / 180;
        const de = (P * (1 + Y_)) / (2 * Math.sin(Ee));
        const M = `translate3d(${de * Math.sin(je)}px,0,${de * (1 - Math.cos(je))}px) rotateY(${-Q * Sc}deg)`;
        const J = ae > 4.6 ? 0 : 1 - Math.max(0, ae - 3.6);
        const te = 1 + 0.1 * Math.max(0, 1 - ae);

        F.style.transform = `${M} scale(${te.toFixed(4)})`;
        F.style.opacity = J;
        F.style.zIndex = String(100 - Math.round(ae * 10));
        F.style.pointerEvents = J < 0.2 ? 'none' : '';
        F.classList.toggle('front', ae < 0.5);
      });

      const X = (Math.round(f) % s + s) % s;
      if (X !== b) {
        b = X;
        updateMeta(b);
      }

      requestAnimationFrame(loop);
    }

    // Direct, bulletproof button click & touch handlers
    if (prevBtn) {
      prevBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      prevBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        step(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      nextBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        step(1);
      });
    }

    // Dragging physics
    let startX = 0, startF = 0, isDragging = false, dragP = 0;

    hall.addEventListener('pointerdown', (re) => {
      if (re.target.closest('.hall-nav')) return;
      isDragging = true;
      dragP = 0;
      startX = re.clientX;
      startF = f;
      isHovered = true;
    });

    window.addEventListener('pointermove', (re) => {
      if (!isDragging) return;
      const Q = re.clientX - startX;
      dragP = Math.max(dragP, Math.abs(Q));
      const firstCard = hall.querySelector('.hall-card');
      const ae = Math.max(160, firstCard ? firstCard.offsetWidth : 220);
      v = f = startF - Q / (ae * 0.9);
    }, { passive: true });

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        isHovered = hall.matches(':hover');
        setTarget(Math.round(f));
        hall.dataset.dragged = dragP > 6 ? '1' : '';
      }
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Card click: rotate into center if side card, open link if front
    cards.forEach((card, x) => {
      card.addEventListener('click', (e) => {
        if (hall.dataset.dragged === '1') {
          e.preventDefault();
          return;
        }
        if (x !== b) {
          e.preventDefault();
          const V = s / 2;
          const P = ((x - f + V) % s + s) % s - V;
          setTarget(Math.round(f + P));
        }
      });
    });

    // Dots click: center selected project
    dots.forEach((dot, x) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const V = s / 2;
        const P = ((x - f + V) % s + s) % s - V;
        setTarget(Math.round(f + P));
      });
    });

    // Keyboard navigation
    hall.addEventListener('keydown', (re) => {
      if (re.key === 'ArrowRight') {
        re.preventDefault();
        step(1);
      } else if (re.key === 'ArrowLeft') {
        re.preventDefault();
        step(-1);
      }
    });

    hall.addEventListener('pointerenter', () => { isHovered = true; });
    hall.addEventListener('pointerleave', () => { isHovered = false; });

    // Autoplay rotation every 5s if in view and not hovered
    setInterval(() => {
      if (!isHovered && !document.hidden && !isDragging) {
        const rect = hall.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          step(1);
        }
      }
    }, 5000);

    // Initial state setup & start animation loop
    updateMeta(0);
    requestAnimationFrame(loop);
  }
  initRotunda();

  // ==========================================================================
  // 5. DISCIPLINES HOVER & EDITORIAL INTERACTIONS (#what-i-do)
  // ==========================================================================
  function initDisciplinesHover() {
    const list = document.querySelector('.a12-dl');
    if (!list) return;
    const items = list.querySelectorAll('li[data-discrow]');

    list.addEventListener('mouseenter', () => list.classList.add('is-hovered'));
    list.addEventListener('mouseleave', () => {
      list.classList.remove('is-hovered');
      items.forEach(it => it.classList.remove('active'));
    });

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        items.forEach(it => it.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }
  initDisciplinesHover();

  // ==========================================================================
  // 6. INTERACTIVE CLI TERMINAL (#terminal)
  // ==========================================================================
  function initTerminal() {
    const termWindow = document.getElementById('termWindow');
    const termBody = document.getElementById('termBody');
    const termHistory = document.getElementById('termHistory');
    const termInput = document.getElementById('termInput');
    const chips = document.querySelectorAll('.term-chip');

    if (!termWindow || !termInput || !termHistory) return;

    if (termBody) {
      termBody.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          termInput.focus();
        }
      });
    }

    const commands = {
      help: () => [
        { type: 'info', text: 'Available commands:' },
        { type: 'muted', text: '  about     - Background, research focus & engineering experience' },
        { type: 'muted', text: '  skills    - Complete technical stack and tooling' },
        { type: 'muted', text: '  projects  - Featured web systems and ML implementations' },
        { type: 'muted', text: '  contact   - Reach out directly for collaboration' },
        { type: 'muted', text: '  clear     - Wipe terminal history' }
      ],
      about: () => [
        { type: 'highlight', text: 'Syed Ridwan Ahmed Fahim — CSE Graduate & Web Developer' },
        { type: 'text', text: 'Computer Science graduate with deep specialization in Data Science, ML analytics, and enterprise web architecture. Currently working remotely building resilient web applications and custom WordPress architectures.' }
      ],
      skills: () => [
        { type: 'highlight', text: 'Technical Proficiencies:' },
        { type: 'text', text: '• Languages: Python, Java, C++, JavaScript (ES6+), SQL, HTML5/CSS3' },
        { type: 'text', text: '• Data Science & ML: Pandas, NumPy, Scikit-learn, Matplotlib, Data Wrangling' },
        { type: 'text', text: '• Web & Backend: React, Node.js, Express, MongoDB, RESTful APIs, WordPress' },
        { type: 'text', text: '• Modern Workflow: Next-Gen Agentic AI IDEs, Git, Linux, WebGL Shaders' }
      ],
      projects: () => [
        { type: 'highlight', text: 'Selected Works (Scroll to #work to test the 3D Rotunda):' },
        { type: 'link', text: '• Nexus Gear — E-Commerce Platform', url: 'https://nexus-gear.onrender.com' },
        { type: 'link', text: '• Brick Smasher 67 — Canvas Arcade Game', url: 'https://brick67.vercel.app' },
        { type: 'link', text: '• Retro Racing — Arcade Driving Simulation', url: 'https://retro-racing-game.vercel.app' },
        { type: 'link', text: '• Chat-EXE — Real-Time Chat Platform', url: 'https://chat-exe.onrender.com' },
        { type: 'link', text: '• Neon Snake — Modernized Classic Game', url: 'https://neon-snake-swart-beta.vercel.app' },
        { type: 'link', text: '• UNO Online — Interactive Multiplayer Logic', url: 'https://uno-six-iota.vercel.app' }
      ],
      contact: () => [
        { type: 'info', text: 'Direct channels:' },
        { type: 'link', text: '• Email: Fahimrr3@gmail.com', url: 'mailto:Fahimrr3@gmail.com' },
        { type: 'link', text: '• GitHub: github.com/DragonzEMP', url: 'https://github.com/DragonzEMP' },
        { type: 'link', text: '• Facebook: facebook.com/profile.php?id=61565551984635', url: 'https://www.facebook.com/profile.php?id=61565551984635' }
      ],
      clear: () => '__CLEAR__'
    };

    function appendOutput(lines, cmd) {
      const block = document.createElement('div');
      block.className = 'term-entry';

      const promptLine = document.createElement('div');
      promptLine.className = 'term-line term-prompt-line';
      promptLine.innerHTML = `<span class="term-ps1">$</span> <span class="term-cmd-text">${escapeHtml(cmd)}</span>`;
      block.appendChild(promptLine);

      if (lines && lines.length > 0) {
        lines.forEach(item => {
          const outLine = document.createElement('div');
          outLine.className = `term-line term-${item.type || 'text'}`;
          if (item.url) {
            outLine.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener" class="term-link">${escapeHtml(item.text)}</a>`;
          } else {
            outLine.textContent = item.text;
          }
          block.appendChild(outLine);
        });
      }

      termHistory.appendChild(block);
      if (termBody) termBody.scrollTop = termBody.scrollHeight;
    }

    function execute(rawCmd) {
      const clean = (rawCmd || '').trim().toLowerCase();
      if (!clean) return;

      if (clean === 'clear') {
        termHistory.innerHTML = '';
        termInput.value = '';
        return;
      }

      const fn = commands[clean];
      if (fn) {
        const res = fn();
        appendOutput(res, clean);
      } else {
        appendOutput([
          { type: 'error', text: `command not found: ${clean}` },
          { type: 'muted', text: "type 'help' to inspect available system commands." }
        ], clean);
      }
      termInput.value = '';
    }

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        execute(termInput.value);
      }
    });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd || chip.textContent.trim();
        execute(cmd);
        termInput.focus();
      });
    });

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }
  initTerminal();

  // ==========================================================================
  // 7. CONTACT FORM INTERACTION (#contact)
  // ==========================================================================
  function initContact() {
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('contactToast');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.contact-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        const origText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';

        setTimeout(() => {
          form.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;

          if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 5000);
          }
        }, 1200);
      }
    });
  }
  initContact();

})();
