/**
 * Syed Ridwan Ahmed Fahim — Portfolio Core Engine
 * Architecture:
 * 1. Theme Management (Sync with localStorage & system preference)
 * 2. Sliding Capsule Navigation & Active Section Spy
 * 3. Interactive WebGL Liquid Background Engine (#bg-canvas)
 * 4. Daiki Fujita 3D Prismatic Crystal Shard with Shatter & Rebuild Engine (#crystal-canvas)
 * 5. 3D Project Rotunda (#work) — Reference Architecture & Kinematics
 * 6. Disciplines Hover & Editorial Interactions (#what-i-do)
 * 7. Interactive CLI Terminal (#terminal)
 * 8. Contact Section Interactions (#contact)
 */

(function () {
  'use strict';

  // Global reduced motion query
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Global crystal shatter trigger handle
  let globalTriggerShatter = null;

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
      if (globalTriggerShatter) globalTriggerShatter(1.2);
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
        if (globalTriggerShatter) globalTriggerShatter(1.2);
      });
    });
  }

  // Scroll Spy with Section Boundary Shatter Triggers
  const sections = Array.from(document.querySelectorAll('section[id]'));
  let lastActiveSectionId = '';

  function onScroll() {
    const scrollPos = window.scrollY + 200;
    let currentId = '';

    for (let i = sections.length - 1; i >= 0; i--) {
      const s = sections[i];
      if (s.offsetTop <= scrollPos) {
        currentId = s.id;
        break;
      }
    }

    if (currentId && currentId !== lastActiveSectionId) {
      lastActiveSectionId = currentId;
      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const match = href === `#${currentId}`;
        link.classList.toggle('active', match);
      });
      resetIndicatorToActive();

      // Trigger crystal shatter & rebuilding on entering each new section!
      if (globalTriggerShatter) {
        globalTriggerShatter(1.0);
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', () => {
    onScroll();
    resetIndicatorToActive();
  });

  // Global click triggers crystal shatter & rebuilding!
  window.addEventListener('click', (e) => {
    if (globalTriggerShatter) {
      globalTriggerShatter(1.3);
    }
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

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_scroll;
      varying vec2 v_uv;

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

        float t = u_time * 0.22;
        vec2 q = vec2(fbm(aspect_uv + t * 0.3), fbm(aspect_uv + vec2(1.0) - t * 0.2));

        float dist = distance(aspect_uv, m);
        float mouseWave = exp(-dist * 3.2) * sin(dist * 24.0 - u_time * 4.0);
        q += (aspect_uv - m) * mouseWave * 0.25;

        vec2 r = vec2(
          fbm(aspect_uv + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t + vec2(0.0, u_scroll * 0.0003)),
          fbm(aspect_uv + 3.0 * q + vec2(8.3, 2.8) + 0.126 * t)
        );

        float f = fbm(aspect_uv + 3.5 * r);

        vec3 colA = vec3(0.024, 0.035, 0.063); // #060910
        vec3 colB = vec3(0.06, 0.14, 0.35);    // #0f2459
        vec3 colC = vec3(0.133, 0.827, 0.933); // #22d3ee
        vec3 colD = vec3(0.42, 0.28, 0.91);    // #6c48e8

        vec3 color = mix(colA, colB, clamp(f * f * 2.2, 0.0, 1.0));
        color = mix(color, colD, clamp(length(q) * 0.45, 0.0, 1.0));
        color = mix(color, colC, clamp(length(r.x) * f * 0.6, 0.0, 1.0));

        float bloom = exp(-dist * 5.0) * 0.22;
        color += colC * bloom;

        gl_FragColor = vec4(color, 0.38);
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
  try {
    initLiquidBg();
  } catch (err) {
    console.error('Liquid bg error:', err);
  }

  // ==========================================================================
  // 4. DAIKI FUJITA 3D PRISMATIC CRYSTAL SHARD & SHATTER/HEAL ENGINE (#crystal-canvas)
  // ==========================================================================
  function initDaikiCrystal() {
    const canvas = document.getElementById('crystal-canvas');
    if (!canvas) return;

    const THREE = window.THREE;
    if (!THREE) {
      console.warn('[WebGL] Three.js not found, skipping 3D crystal.');
      return;
    }

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

    // 1. Shaders with Daiki Fujita exact formulas
    const uniforms = {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uCrackGlow: { value: 0 },
      uView: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
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
      uniform float uCrackGlow;

      varying vec3 vN;
      varying vec3 vVP;
      varying vec3 vObj;
      varying vec3 vWorldPos;

      vec3 rainbow(float t) {
        return 0.5 + 0.5 * cos(6.2831853 * (t + vec3(0.0, 0.33, 0.67)));
      }

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

        float F = pow(1.0 - ndv, 3.0);

        float etaR = 1.0 / 1.48;
        float etaG = 1.0 / 1.52;
        float etaB = 1.0 / 1.56;

        vec3 refrR = refract(V, N, etaR);
        vec3 refrG = refract(V, N, etaG);
        vec3 refrB = refract(V, N, etaB);

        float t = uTime;
        vec3 envR = envLight(refrR, t);
        vec3 envG = envLight(refrG, t);
        vec3 envB = envLight(refrB, t);
        vec3 interiorCol = vec3(envR.r, envG.g, envB.b);

        vec3 crystalCore = mix(vec3(0.02, 0.05, 0.09), vec3(0.133, 0.827, 0.933), 0.18);
        vec3 col = mix(crystalCore, interiorCol, 0.68);

        vec3 refl = reflect(V, N);
        vec3 specEnv = envLight(refl, t);
        col += specEnv * (0.35 + F * 0.75);

        vec3 rimRainbow = rainbow(dot(vObj, vec3(1.7, 1.1, 0.9)) + ndv * 2.8 + t * 0.15);
        col += (mix(rimRainbow, vec3(0.8, 0.9, 1.0), 0.35) * 0.65 + vec3(0.66, 0.56, 1.0) * 0.35) * F * (0.85 + uHover * 0.5);

        // Flash along seam cracks upon healing
        col += vec3(0.8, 0.95, 1.0) * uCrackGlow * 1.5;

        vec3 L1 = normalize(vec3(-0.45, 0.65, 0.7));
        vec3 L2 = normalize(vec3(0.6, 0.3, 0.8));
        float sp1 = pow(max(dot(refl, L1), 0.0), 110.0);
        float sp2 = pow(max(dot(refl, L2), 0.0), 160.0);
        col += vec3(1.0) * (sp1 * 0.85 + sp2 * 1.3);

        float facetAngle = sin(dot(vObj, vec3(4.2, 5.1, 3.8)) + t * 0.5);
        col += rainbow(facetAngle * 0.5 + t * 0.05) * 0.08 * (1.0 - ndv);

        float alpha = clamp(0.75 + F * 0.25, 0.0, 0.98);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const crystalMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    // 2. Sculpt Solid Unified Crystal
    const baseGeo = new THREE.IcosahedronGeometry(95, 0);
    const pos = baseGeo.attributes.position;
    const p = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      p.y *= 1.35;
      p.x *= 0.88 - Math.abs(p.y) * 0.0015;
      p.z *= 0.76 + p.x * 0.001;

      if (p.x > 20 && p.y > 10) { p.x *= 1.1; p.z *= 0.85; }
      if (p.x < -15 && p.y < -10) { p.x *= 1.05; p.y *= 1.12; }
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    baseGeo.computeVertexNormals();

    const solidCrystal = new THREE.Mesh(baseGeo, crystalMaterial);
    scene.add(solidCrystal);

    // 3. Build Shatter Shard Polyhedrons (16 geometric pieces)
    const shardGroup = new THREE.Group();
    scene.add(shardGroup);
    shardGroup.visible = false;

    const numShards = 16;
    const shards = [];

    for (let i = 0; i < numShards; i++) {
      const shardGeo = new THREE.TetrahedronGeometry(22 + (i % 4) * 6, 0);
      const sPos = shardGeo.attributes.position;
      const sp = new THREE.Vector3();
      for (let j = 0; j < sPos.count; j++) {
        sp.fromBufferAttribute(sPos, j);
        sp.x *= 0.9 + (i % 3) * 0.2;
        sp.y *= 1.2 + (i % 2) * 0.3;
        sp.z *= 0.8;
        sPos.setXYZ(j, sp.x, sp.y, sp.z);
      }
      shardGeo.computeVertexNormals();

      const phi = Math.acos(-1 + (2 * i) / numShards);
      const theta = Math.sqrt(numShards * Math.PI) * phi;
      const r = 45 + (i % 3) * 15;

      const homePos = new THREE.Vector3(
        r * Math.cos(theta) * Math.sin(phi) * 0.8,
        r * Math.cos(phi) * 1.3,
        r * Math.sin(theta) * Math.sin(phi) * 0.7
      );

      const homeQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler((i * 0.7) % Math.PI, (i * 1.1) % Math.PI, (i * 0.5) % Math.PI)
      );

      const shardMesh = new THREE.Mesh(shardGeo, crystalMaterial);
      shardMesh.position.copy(homePos);
      shardMesh.quaternion.copy(homeQuat);
      shardGroup.add(shardMesh);

      shards.push({
        mesh: shardMesh,
        homePos,
        homeQuat,
        currentPos: new THREE.Vector3().copy(homePos),
        currentQuat: new THREE.Quaternion().copy(homeQuat),
        vel: new THREE.Vector3(),
        angVel: new THREE.Vector3()
      });
    }

    // 4. Spark Glint Particle System (Caustic flecks on shatter)
    const sparkCount = 48;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVel = [];
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = 0;
      sparkPos[i * 3 + 1] = 0;
      sparkPos[i * 3 + 2] = 0;
      sparkVel.push(new THREE.Vector3());
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 4,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // 5. Shatter & Heal State Machine
    let shatterState = 'SOLID'; // 'SOLID', 'EXPLODING', 'GATHERING'
    let shatterTimer = 0;
    let crackGlow = 0;

    function triggerShatter(forceMultiplier = 1.0) {
      if (prefersReducedMotion) return;
      shatterState = 'EXPLODING';
      shatterTimer = 0;
      crackGlow = 1.0;

      solidCrystal.visible = false;
      shardGroup.visible = true;
      shardGroup.position.copy(solidCrystal.position);
      shardGroup.rotation.copy(solidCrystal.rotation);

      // Give explosive 3D velocity to shards
      shards.forEach((s) => {
        s.currentPos.copy(s.homePos);
        const dir = new THREE.Vector3().copy(s.homePos).normalize();
        dir.x += (Math.random() - 0.5) * 0.7;
        dir.y += (Math.random() - 0.5) * 0.7;
        dir.z += (Math.random() - 0.5) * 0.9;
        dir.normalize();

        const speed = (280 + Math.random() * 380) * forceMultiplier;
        s.vel.copy(dir).multiplyScalar(speed);
        s.angVel.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14
        );
      });

      // Launch spark particle burst
      sparkMat.opacity = 0.9;
      const posAttr = sparkGeo.attributes.position;
      for (let i = 0; i < sparkCount; i++) {
        posAttr.setXYZ(i, solidCrystal.position.x, solidCrystal.position.y, solidCrystal.position.z);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const spd = (120 + Math.random() * 260) * forceMultiplier;
        sparkVel[i].set(
          Math.sin(phi) * Math.cos(theta) * spd,
          Math.sin(phi) * Math.sin(theta) * spd,
          Math.cos(phi) * spd
        );
      }
      posAttr.needsUpdate = true;
    }

    // Expose globally so navigation & rotunda can trigger it
    globalTriggerShatter = triggerShatter;

    // 6. Physics & Dynamic Motion Tracking
    let targetX = 0, targetY = 0;
    let posX = 0, posY = 0;
    let prevPosX = 0, prevPosY = 0;
    let velX = 0, velY = 0;
    let rotX = 0, rotY = 0, rotZ = 0;
    let hoverState = 0;
    let targetHover = 0;

    window.addEventListener('pointermove', (e) => {
      targetX = e.clientX - window.innerWidth / 2;
      targetY = -(e.clientY - window.innerHeight / 2);
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      const isInteract = e.target.closest('a, button, [role="button"], .hall-card, .term-chip, [data-discrow]');
      targetHover = isInteract ? 1.0 : 0.0;
    });

    // 7. Animation Loop
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
      solidCrystal.position.set(posX, posY + floatY, 0);

      // Dynamic tilt based on velocity and continuous ethereal spin
      const targetRotX = -velY * 0.012 + Math.sin(elapsed * 0.8) * 0.15;
      const targetRotY = velX * 0.012 + elapsed * 0.35;
      const targetRotZ = -velX * 0.006;

      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;
      rotZ += (targetRotZ - rotZ) * 0.08;
      solidCrystal.rotation.set(rotX, rotY, rotZ);

      // Smooth hover scale & glint pulse
      hoverState += (targetHover - hoverState) * 0.1;
      const baseScale = 1.0 + hoverState * 0.16;
      solidCrystal.scale.set(baseScale, baseScale, baseScale);

      // Shard & Shatter Kinematics Loop
      if (shatterState !== 'SOLID') {
        shatterTimer += delta;
        shardGroup.position.set(posX, posY + floatY, 0);

        if (shatterTimer > 0.45) {
          shatterState = 'GATHERING';
        }

        shards.forEach((s) => {
          if (shatterState === 'EXPLODING') {
            s.currentPos.addScaledVector(s.vel, delta);
            s.vel.multiplyScalar(0.92);
            s.mesh.position.copy(s.currentPos);
            s.mesh.rotation.x += s.angVel.x * delta;
            s.mesh.rotation.y += s.angVel.y * delta;
            s.mesh.rotation.z += s.angVel.z * delta;
          } else if (shatterState === 'GATHERING') {
            // Magnetic pull back toward home slot
            s.currentPos.lerp(s.homePos, 0.14);
            s.mesh.position.copy(s.currentPos);
            s.mesh.quaternion.slerp(s.homeQuat, 0.14);
          }
        });

        // Update spark particles
        if (sparkMat.opacity > 0.02) {
          sparkMat.opacity *= 0.94;
          const posAttr = sparkGeo.attributes.position;
          for (let i = 0; i < sparkCount; i++) {
            const px = posAttr.getX(i) + sparkVel[i].x * delta;
            const py = posAttr.getY(i) + sparkVel[i].y * delta;
            const pz = posAttr.getZ(i) + sparkVel[i].z * delta;
            sparkVel[i].multiplyScalar(0.95);
            posAttr.setXYZ(i, px, py, pz);
          }
          posAttr.needsUpdate = true;
        }

        // Rebuild / Heal complete
        if (shatterTimer > 1.15) {
          shatterState = 'SOLID';
          solidCrystal.visible = true;
          shardGroup.visible = false;
          crackGlow = 1.5; // Caustic heal flash!
        }
      }

      // Fade crack glow
      crackGlow = Math.max(0, crackGlow - delta * 2.5);
      uniforms.uCrackGlow.value = crackGlow;
      uniforms.uTime.value = elapsed;
      uniforms.uHover.value = hoverState;
      uniforms.uView.value.set(window.innerWidth, window.innerHeight);

      renderer.render(scene, camera);
    }
    animate();
  }

  function safeInitDaikiCrystal() {
    try {
      initDaikiCrystal();
    } catch (err) {
      console.error('Daiki crystal error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitDaikiCrystal);
  } else {
    safeInitDaikiCrystal();
  }

  // ==========================================================================
  // 5. 3D PROJECT ROTUNDA (#work) — EXACT MATCH TO REFERENCE DESIGN
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

    const Sc = 13;      // Step angle = 13 degrees per card
    const Y_ = 0.16;    // Gap ratio between cards = 16%

    let f = 0;          // Smooth interpolated float position
    let v = 0;          // Target discrete step index
    let isHovered = false;
    let b = 0;          // Current active integer index

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
      if (typeof globalTriggerShatter === 'function') {
        globalTriggerShatter(0.85);
      }
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
        if (titleEl.style && typeof titleEl.style.setProperty === 'function') {
          titleEl.style.setProperty('--len', String(p.title.length));
        }
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

    function loop() {
      const firstCard = hall.querySelector('.hall-card');
      const P = (firstCard && firstCard.offsetWidth > 0) ? firstCard.offsetWidth : 220;

      f += (v - f) * (prefersReducedMotion ? 1 : 0.09);
      if (isNaN(f)) f = 0;
      if (isNaN(v)) v = 0;

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

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        step(-1);
      });
      prevBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        step(1);
      });
      nextBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }

    let startX = 0, startF = 0, isDragging = false, dragP = 0;

    hall.addEventListener('pointerdown', (re) => {
      if (re.target.closest('.hall-nav') || re.target.closest('button')) return;
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
          if (typeof globalTriggerShatter === 'function') {
            globalTriggerShatter(0.85);
          }
        }
      });
    });

    dots.forEach((dot, x) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const V = s / 2;
        const P = ((x - f + V) % s + s) % s - V;
        setTarget(Math.round(f + P));
        if (typeof globalTriggerShatter === 'function') {
          globalTriggerShatter(0.85);
        }
      });
    });

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

    setInterval(() => {
      if (!isHovered && !document.hidden && !isDragging) {
        const rect = hall.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          step(1);
        }
      }
    }, 5000);

    updateMeta(0);
    requestAnimationFrame(loop);
  }
  try {
    initRotunda();
  } catch (err) {
    console.error('Rotunda initialization error:', err);
  }

  // ==========================================================================
  // 6. DISCIPLINES HOVER & EDITORIAL INTERACTIONS (#what-i-do)
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
        if (globalTriggerShatter) globalTriggerShatter(0.8);
      });
    });
  }
  initDisciplinesHover();

  // ==========================================================================
  // 7. INTERACTIVE CLI TERMINAL (#terminal)
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
      if (globalTriggerShatter) globalTriggerShatter(1.1);
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
  // 8. CONTACT FORM INTERACTION (#contact)
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

        if (globalTriggerShatter) globalTriggerShatter(1.6);

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
