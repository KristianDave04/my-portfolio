/* ============================================================
   TVA HEADQUARTERS — 3D Scene
   A first-person walk through a TVA hallway, ending at a
   Tempad pedestal the user can interact with to open the
   portfolio (the existing 2D "monitor" UI).
   ============================================================ */

(function () {
  'use strict';

  // ---- Guard: bail gracefully if WebGL isn't available ----
  function hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  const sceneRoot = document.getElementById('tva-scene-root');
  if (!sceneRoot) return;

  if (!hasWebGL() || typeof THREE === 'undefined') {
    // Fallback: skip straight to the 2D monitor UI, no 3D.
    document.body.classList.add('no-webgl');
    const overlay = document.getElementById('portfolio-overlay');
    if (overlay) overlay.classList.add('visible', 'no-transition');
    const introEl = document.getElementById('cinematic-intro');
    if (introEl) introEl.remove();
    return;
  }

  /* ---------------- Renderer / Scene / Camera ---------------- */

  const canvas = document.createElement('canvas');
  canvas.id = 'tva-canvas';
  sceneRoot.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const FOG_COLOR = 0x0a0600;
  scene.background = new THREE.Color(FOG_COLOR);
  scene.fog = new THREE.Fog(FOG_COLOR, 6, 26);

  const camera = new THREE.PerspectiveCamera(
    62,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  // Player eye-height and starting position: far back in the hallway,
  // facing down its length toward the Tempad pedestal.
  const EYE_HEIGHT = 1.65;
  const HALLWAY_LENGTH = 22;
  const HALLWAY_WIDTH = 6;

  camera.position.set(0, EYE_HEIGHT, HALLWAY_LENGTH / 2 - 1);
  camera.rotation.order = 'YXZ';

  /* ---------------- Lighting ---------------- */

  const ambient = new THREE.AmbientLight(0x3a2a14, 0.55);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x4a3820, 0x0a0600, 0.4);
  scene.add(hemi);

  // Warm ceiling lights running down the hallway, TVA-style.
  const lightFixtures = [];
  const NUM_LIGHTS = 6;
  for (let i = 0; i < NUM_LIGHTS; i++) {
    const z = HALLWAY_LENGTH / 2 - 1 - i * (HALLWAY_LENGTH / (NUM_LIGHTS - 1));
    const light = new THREE.PointLight(0xffae00, 6, 9, 2);
    light.position.set(0, 3.15, z);
    light.castShadow = i % 2 === 0; // alternate shadow-casting lights to keep perf reasonable
    if (light.castShadow) {
      light.shadow.mapSize.set(512, 512);
      light.shadow.bias = -0.003;
    }
    scene.add(light);
    lightFixtures.push(light);

    // Visible fixture housing (a small emissive box on the ceiling)
    const fixtureGeo = new THREE.BoxGeometry(0.9, 0.12, 0.35);
    const fixtureMat = new THREE.MeshStandardMaterial({
      color: 0x1a1208,
      emissive: 0xffae00,
      emissiveIntensity: 1.6,
      roughness: 0.6,
    });
    const fixtureMesh = new THREE.Mesh(fixtureGeo, fixtureMat);
    fixtureMesh.position.set(0, 3.18, z);
    scene.add(fixtureMesh);
  }

  // A dedicated warm spotlight on the Tempad pedestal itself, so it
  // always reads as the focal point.
  const tempadZ = -HALLWAY_LENGTH / 2 + 2.2;
  const spotlight = new THREE.SpotLight(0xffcf7a, 14, 12, Math.PI / 6, 0.5, 1.5);
  spotlight.position.set(0, 3.4, tempadZ + 1.5);
  spotlight.target.position.set(0, 0.9, tempadZ);
  spotlight.castShadow = true;
  spotlight.shadow.mapSize.set(1024, 1024);
  scene.add(spotlight);
  scene.add(spotlight.target);

  /* ---------------- Materials ---------------- */

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x2b2420,
    roughness: 0.75,
    metalness: 0.15,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1c1610,
    roughness: 0.85,
    metalness: 0.05,
  });
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x141009,
    roughness: 0.9,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x3a2a10,
    emissive: 0xff8c00,
    emissiveIntensity: 0.35,
    roughness: 0.4,
    metalness: 0.6,
  });

  /* ---------------- Hallway geometry ---------------- */

  const hallwayGroup = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(HALLWAY_WIDTH, HALLWAY_LENGTH),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  hallwayGroup.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(HALLWAY_WIDTH, HALLWAY_LENGTH),
    ceilingMat
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 3.3;
  hallwayGroup.add(ceiling);

  const wallLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(HALLWAY_LENGTH, 3.3),
    wallMat
  );
  wallLeft.rotation.y = Math.PI / 2;
  wallLeft.position.set(-HALLWAY_WIDTH / 2, 1.65, 0);
  wallLeft.receiveShadow = true;
  hallwayGroup.add(wallLeft);

  const wallRight = wallLeft.clone();
  wallRight.rotation.y = -Math.PI / 2;
  wallRight.position.set(HALLWAY_WIDTH / 2, 1.65, 0);
  hallwayGroup.add(wallRight);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(HALLWAY_WIDTH, 3.3),
    wallMat
  );
  backWall.position.set(0, 1.65, -HALLWAY_LENGTH / 2);
  hallwayGroup.add(backWall);

  const frontWall = backWall.clone();
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, 1.65, HALLWAY_LENGTH / 2);
  hallwayGroup.add(frontWall);

  // Floor/wall trim strips (thin glowing accent lines), a recurring TVA
  // architectural motif that also helps players read depth as they walk.
  for (let side = -1; side <= 1; side += 2) {
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, HALLWAY_LENGTH),
      trimMat
    );
    trim.position.set(side * (HALLWAY_WIDTH / 2 - 0.03), 0.05, 0);
    hallwayGroup.add(trim);

    const ceilTrim = trim.clone();
    ceilTrim.position.set(side * (HALLWAY_WIDTH / 2 - 0.03), 3.25, 0);
    hallwayGroup.add(ceilTrim);
  }

  // Wall-mounted clock-gear medallions, echoing the temporal-aperture
  // motif from the 2D UI, repeated down both walls.
  function buildGearMedallion() {
    const group = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.35, 0.025, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x2a1e10,
      emissive: 0xff8c00,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    const coreGeo = new THREE.CircleGeometry(0.12, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1a1208,
      emissive: 0xffae00,
      emissiveIntensity: 1.2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    for (let t = 0; t < 4; t++) {
      const tickGeo = new THREE.BoxGeometry(0.03, 0.12, 0.02);
      const tick = new THREE.Mesh(tickGeo, ringMat);
      const angle = (t / 4) * Math.PI * 2;
      tick.position.set(Math.sin(angle) * 0.42, Math.cos(angle) * 0.42, 0);
      tick.rotation.z = angle;
      group.add(tick);
    }
    return group;
  }

  const MEDALLIONS_PER_SIDE = 4;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < MEDALLIONS_PER_SIDE; i++) {
      const medallion = buildGearMedallion();
      const z = HALLWAY_LENGTH / 2 - 3 - i * (HALLWAY_LENGTH / MEDALLIONS_PER_SIDE);
      medallion.position.set(side * (HALLWAY_WIDTH / 2 - 0.05), 1.9, z);
      medallion.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
      hallwayGroup.add(medallion);
    }
  }

  scene.add(hallwayGroup);

  /* ---------------- Tempad pedestal (the interactable) ---------------- */

  const tempadGroup = new THREE.Group();
  tempadGroup.position.set(0, 0, tempadZ);

  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x2b2620,
    roughness: 0.5,
    metalness: 0.4,
  });
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 1.0, 24),
    pedestalMat
  );
  pedestal.position.y = 0.5;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  tempadGroup.add(pedestal);

  const pedestalTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.025, 8, 24),
    trimMat
  );
  pedestalTrim.rotation.x = Math.PI / 2;
  pedestalTrim.position.y = 0.98;
  tempadGroup.add(pedestalTrim);

  // The Tempad device itself: a small angled device sitting on the pedestal.
  const tempadBodyMat = new THREE.MeshStandardMaterial({
    color: 0x3a2a10,
    emissive: 0xff8c00,
    emissiveIntensity: 0.6,
    roughness: 0.35,
    metalness: 0.6,
  });
  const tempadBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.06, 0.5),
    tempadBodyMat
  );
  tempadBody.position.set(0, 1.05, 0);
  tempadBody.rotation.x = -0.28;
  tempadBody.castShadow = true;
  tempadGroup.add(tempadBody);

  const tempadScreenMat = new THREE.MeshStandardMaterial({
    color: 0x0d0800,
    emissive: 0xffae00,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  const tempadScreen = new THREE.Mesh(
    new THREE.CircleGeometry(0.14, 24),
    tempadScreenMat
  );
  tempadScreen.position.set(0, 1.085, 0.05);
  tempadScreen.rotation.x = -Math.PI / 2 + 0.28;
  tempadGroup.add(tempadScreen);

  // Named so the raycaster / proximity check can find it by reference.
  tempadGroup.name = 'tempad-interactable';
  tempadGroup.userData.interactable = true;
  tempadGroup.userData.promptLabel = 'TEMPAD';

  scene.add(tempadGroup);

  // Soft point light glowing from the Tempad's screen, up-lighting the
  // player's view when close — sells the "device is powered on" read.
  const tempadGlow = new THREE.PointLight(0xffae00, 2.2, 3, 2);
  tempadGlow.position.set(0, 1.2, tempadZ);
  scene.add(tempadGlow);

  /* ---------------- Expose to the controller module ---------------- */

  window.TVA_SCENE = {
    renderer,
    scene,
    camera,
    tempadGroup,
    tempadZ,
    HALLWAY_LENGTH,
    HALLWAY_WIDTH,
    EYE_HEIGHT,
  };

  window.TVA_SCENE_READY = true;
  window.dispatchEvent(new CustomEvent('tva-scene-ready'));
})();
