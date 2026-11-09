/**
 * Syed Ridwan Ahmed Fahim — Portfolio Core Engine
 * Architecture:
 * 1. Theme Management (Sync with localStorage & system preference)
 * 2. Sliding Capsule Navigation & Active Section Spy
 * 3. Daiki Fujita 3D Prismatic Crystal Lens WebGL Engine (#bg-canvas)
 * 4. 3D Project Rotunda (#work) — Reference Architecture & Kinematics
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
  // 3. DAIKI FUJITA 3D PRISMATIC CRYSTAL LENS WEBGL ENGINE (#bg-canvas)
  // ==========================================================================
  function initDaikiCrystal() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const THREE = window.THREE;
    if (!THREE) {
      console.warn('[WebGL] Three.js not found, skipping 3D crystal.');
      return;
    }

    // 1. Renderer Setup matching Daiki Fujita's pipeline
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('[WebGL] Failed to initialize WebGLRenderer:', e);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    // 2. Perspective Camera with 1:1 pixel coordinate projection
    const scene = new THREE.Scene();
    const cameraDist = 1600;
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 10, 6000);
    camera.position.set(0, 0, cameraDist);

    function updateCamera() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = (2 * Math.atan(h / 2 / cameraDist) * 180) / Math.PI;
      camera.updateProjectionMatrix();
    }
    updateCamera();
    window.addEventListener('resize', updateCamera, { passive: true });

    // 3. Sculpted Asymmetric Crystal Shard Geometry (Daiki Fujita ke/Ae inspired)
    const baseGeo = new THREE.IcosahedronGeometry(95, 0);
    const pos = baseGeo.attributes.position;
    const p = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      // Elongate along Y axis, taper at ends, sculpt asymmetric facet depth
      p.y *= 1.35;
      p.x *= 0.88 - Math.abs(p.y) * 0.0015;
      p.z *= 0.76 + p.x * 0.001;

      // Asymmetric cut planes
      if (p.x > 20 && p.y > 10) {
        p.x *= 1.1;
        p.z *= 0.85;
      }
      if (p.x < -15 && p.y < -10) {
        p.x *= 1.05;
        p.y *= 1.12;
      }
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    baseGeo.computeVertexNormals();

    // 4. Daiki Fujita Custom Prismatic Refraction Shaders
    const uniforms = {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uView: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseVel: { value: new THREE.Vector2(0, 0) }
    };

    const vertexShader = `
      varying vec3 vN;
      varying vec3 vVP;
      varying vec3 vObj;
      varying vec3 vWorldPos;

      void main() {
        vObj = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vVP = mv.xyz;
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform vec2 uView;
      uniform float uTime;
      uniform float uHover;
      uniform vec2 uMouse;
      uniform vec2 uMouseVel;

      varying vec3 vN;
      varying vec3 vVP;
      varying vec3 vObj;
      varying vec3 vWorldPos;

      // Daiki Fujita's exact rainbow spectral dispersion formula
      vec3 rainbow(float t) {
        return 0.5 + 0.5 * cos(6.2831853 * (t + vec3(0.0, 0.33, 0.67)));
      }

      // Daiki Fujita's studio softbox light reflection formula
      float box(vec3 R, vec3 c, vec2 s, float soft) {
        c = normalize(c);
        float d = dot(R, c);
        if (d <= 0.0) return 0.0;
        vec3 u = normalize(cross(c, vec3(0.0, 1.0, 0.001)));
        vec3 v = cross(u, c);
        vec2 p = vec2(dot(R, u), dot(R, v)) / d;
        vec2 q = abs(p) - s;
        return smoothstep(soft, 0.0, max(q.x, q.y)) * (1.0 - 0.55 * smoothstep(0.0, 1.0, length(p / s)));
      }

      vec3 envLight(vec3 R, float t) {
        vec3 dayC = mix(vec3(0.03, 0.05, 0.1), vec3(0.15, 0.25, 0.4), smoothstep(-0.5, 0.4, R.y));
        dayC = mix(dayC, vec3(0.9, 0.95, 1.0), smoothstep(0.2, 0.85, R.y));

        // Studio softbox light panels
        float e = 0.0;
        e += 4.5 * box(R, vec3(-0.45 + 0.22 * sin(t * 0.21), 0.62 + 0.08 * cos(t * 0.17), 0.65), vec2(0.26, 0.09), 0.05);
        e += 6.5 * box(R, vec3(0.7 + 0.12 * sin(t * 0.13 + 1.0), 0.15, 0.7), vec2(0.02, 0.85), 0.015);
        e += 4.0 * box(R, vec3(-0.75, -0.2, 0.62), vec2(0.015, 0.6), 0.01);

        return dayC * 0.35 + vec3(e) * 0.55;
      }

      void main() {
        vec3 V = normalize(vVP);
        vec3 N = normalize(vN);
        float ndv = clamp(dot(N, -V), 0.0, 1.0);

        // Fresnel reflection
        float F = pow(1.0 - ndv, 3.0);

        // Prismatic chromatic dispersion (red, green, blue refractions)
        float etaR = 1.0 / 1.48;
        float etaG = 1.0 / 1.52;
        float etaB = 1.0 / 1.56;

        vec3 refrR = refract(V, N, etaR);
        vec3 refrG = refract(V, N, etaG);
        vec3 refrB = refract(V, N, etaB);

        // Internal facet absorption & chromatic split
        float t = uTime;
        vec3 envR = envLight(refrR, t);
        vec3 envG = envLight(refrG, t);
        vec3 envB = envLight(refrB, t);
        vec3 interiorCol = vec3(envR.r, envG.g, envB.b);

        // Deep crystal body color (obsidian / cyan tint)
        vec3 crystalCore = mix(vec3(0.02, 0.05, 0.09), vec3(0.133, 0.827, 0.933), 0.18);
        vec3 col = mix(crystalCore, interiorCol, 0.68);

        // Reflected environment & specular glints
        vec3 refl = reflect(V, N);
        vec3 specEnv = envLight(refl, t);
        col += specEnv * (0.35 + F * 0.75);

        // Daiki rainbow facet edge dispersion
        vec3 rimRainbow = rainbow(dot(vObj, vec3(1.7, 1.1, 0.9)) + ndv * 2.8 + t * 0.15);
        col += (mix(rimRainbow, vec3(0.8, 0.9, 1.0), 0.35) * 0.65 + vec3(0.66, 0.56, 1.0) * 0.35) * F * (0.85 + uHover * 0.5);

        // Sharp pinpoint specular glints
        vec3 L1 = normalize(vec3(-0.45, 0.65, 0.7));
        vec3 L2 = normalize(vec3(0.6, 0.3, 0.8));
        float sp1 = pow(max(dot(refl, L1), 0.0), 110.0);
        float sp2 = pow(max(dot(refl, L2), 0.0), 160.0);
        col += vec3(1.0) * (sp1 * 0.85 + sp2 * 1.3);

        // Subtle internal facet caustics
        float facetAngle = sin(dot(vObj, vec3(4.2, 5.1, 3.8)) + t * 0.5);
        col += rainbow(facetAngle * 0.5 + t * 0.05) * 0.08 * (1.0 - ndv);

        // Output with high alpha for crisp prismatic presence
        float alpha = clamp(0.75 + F * 0.25, 0.0, 0.98);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    const crystal = new THREE.Mesh(baseGeo, material);
    scene.add(crystal);

    // 5. Physics & Dynamic Motion Tracking
    let targetX = 0, targetY = 0;
    let posX = 0, posY = 0;
    let prevPosX = 0, prevPosY = 0;
    let velX = 0, velY = 0;
    let rotX = 0, rotY = 0, rotZ = 0;
    let hoverState = 0;
    let targetHover = 0;

    // Track mouse in screen space (center = 0, 0)
    window.addEventListener('pointermove', (e) => {
      targetX = e.clientX - window.innerWidth / 2;
      targetY = -(e.clientY - window.innerHeight / 2);
    }, { passive: true });

    // Hover detection over interactive targets
    document.addEventListener('mouseover', (e) => {
      const isInteract = e.target.closest('a, button, [role="button"], .hall-card, .term-chip, [data-discrow]');
      targetHover = isInteract ? 1.0 : 0.0;
    });

    // 6. Animation Loop
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth position lerp with spring inertia
      posX += (targetX - posX) * 0.075;
      posY += (targetY - posY) * 0.075;

      velX = posX - prevPosX;
      velY = posY - prevPosY;
      prevPosX = posX;
      prevPosY = posY;

      // Floating organic breathing motion
      const floatY = Math.sin(elapsed * 1.5) * 7.0;
      crystal.position.set(posX, posY + floatY, 0);

      // Dynamic tilt based on velocity and continuous ethereal spin
      const targetRotX = -velY * 0.012 + Math.sin(elapsed * 0.8) * 0.15;
      const targetRotY = velX * 0.012 + elapsed * 0.35;
      const targetRotZ = -velX * 0.006;

      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;
      rotZ += (targetRotZ - rotZ) * 0.08;
      crystal.rotation.set(rotX, rotY, rotZ);

      // Smooth hover scale & glint pulse
      hoverState += (targetHover - hoverState) * 0.1;
      const baseScale = 1.0 + hoverState * 0.16;
      crystal.scale.set(baseScale, baseScale, baseScale);

      // Update uniforms
      uniforms.uTime.value = elapsed;
      uniforms.uHover.value = hoverState;
      uniforms.uView.value.set(window.innerWidth, window.innerHeight);
      uniforms.uMouse.value.set(posX, posY);
      uniforms.uMouseVel.value.set(velX, velY);

      renderer.render(scene, camera);
    }
    animate();
  }

  // Initialize once DOM & scripts are loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDaikiCrystal);
  } else {
    initDaikiCrystal();
  }

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
