/* ============================================================
   TVA HEADQUARTERS — First-person controller
   Pointer-lock mouse-look, WASD movement, boundary clamping,
   and proximity-based interaction with the Tempad.
   ============================================================ */

(function () {
  'use strict';

  function init() {
    if (!window.TVA_SCENE) return; // WebGL unavailable; scene module already handled fallback.

    const { camera, tempadGroup, tempadZ, HALLWAY_LENGTH, HALLWAY_WIDTH, EYE_HEIGHT } = window.TVA_SCENE;
    const canvas = document.getElementById('tva-canvas');
    const crosshair = document.getElementById('tva-crosshair');
    const interactPrompt = document.getElementById('tva-interact-prompt');
    const clickToLookEl = document.getElementById('tva-click-to-look');
    const moveHintEl = document.getElementById('tva-move-hint');

    /* ---------------- Pointer-lock mouse-look ---------------- */

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (isTouchDevice) {
      document.body.classList.add('touch-device');
      if (clickToLookEl) clickToLookEl.textContent = 'Drag right side of screen to look around';
      if (moveHintEl) moveHintEl.textContent = 'Use the joystick to walk';
    }

    let yaw = 0;
    let pitch = 0;
    const PITCH_LIMIT = Math.PI / 2 - 0.05;
    const MOUSE_SENSITIVITY = 0.0022;

    let pointerLocked = false;

    function onMouseMove(e) {
      if (!pointerLocked) return;
      yaw -= e.movementX * MOUSE_SENSITIVITY;
      pitch -= e.movementY * MOUSE_SENSITIVITY;
      pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    }

    function requestLock() {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    }

    document.addEventListener('pointerlockchange', () => {
      pointerLocked = document.pointerLockElement === canvas;
      if (clickToLookEl) {
        clickToLookEl.classList.toggle('visible', !pointerLocked && !window.TVA_INTRO_PLAYING);
      }
    });

    if (!isTouchDevice) {
      canvas.addEventListener('click', () => {
        if (window.TVA_INTRO_PLAYING) return;
        if (window.TVA_PORTFOLIO_OPEN) return;
        requestLock();
      });
      document.addEventListener('mousemove', onMouseMove);
    }

    /* ---------------- Touch look (drag on the right half of the screen) ---------------- */

    const TOUCH_LOOK_SENSITIVITY = 0.0032;
    let lookTouchId = null;
    let lastTouchX = 0;
    let lastTouchY = 0;

    if (isTouchDevice) {
      canvas.addEventListener('touchstart', (e) => {
        if (window.TVA_INTRO_PLAYING || window.TVA_PORTFOLIO_OPEN) return;
        for (const t of e.changedTouches) {
          // Only the right half of the screen controls looking, so the
          // left half stays free for the movement joystick.
          if (t.clientX > window.innerWidth / 2 && lookTouchId === null) {
            lookTouchId = t.identifier;
            lastTouchX = t.clientX;
            lastTouchY = t.clientY;
          }
        }
      }, { passive: true });

      canvas.addEventListener('touchmove', (e) => {
        for (const t of e.changedTouches) {
          if (t.identifier === lookTouchId) {
            const dx = t.clientX - lastTouchX;
            const dy = t.clientY - lastTouchY;
            lastTouchX = t.clientX;
            lastTouchY = t.clientY;
            yaw -= dx * TOUCH_LOOK_SENSITIVITY;
            pitch -= dy * TOUCH_LOOK_SENSITIVITY;
            pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
            camera.rotation.set(pitch, yaw, 0, 'YXZ');
          }
        }
      }, { passive: true });

      canvas.addEventListener('touchend', (e) => {
        for (const t of e.changedTouches) {
          if (t.identifier === lookTouchId) lookTouchId = null;
        }
      }, { passive: true });
    }

    /* ---------------- WASD movement ---------------- */

    const keys = { w: false, a: false, s: false, d: false };
    const MOVE_SPEED = 3.1; // meters/second

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k in keys) keys[k] = true;
      if (k === 'e') tryInteract();
      if (k === 'escape') closePortfolioIfOpen();
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k in keys) keys[k] = false;
    });

    // Virtual joystick (touch devices only): reports a normalized
    // forward/right vector in the same [-1, 1] range as the keys above.
    let joystickForward = 0;
    let joystickRight = 0;

    if (isTouchDevice) {
      const joystickBase = document.getElementById('tva-joystick-base');
      const joystickNub = document.getElementById('tva-joystick-nub');

      if (joystickBase && joystickNub) {
        let joystickTouchId = null;
        let baseCenterX = 0;
        let baseCenterY = 0;
        const JOYSTICK_RADIUS = 46; // px, matches the CSS base size

        function startJoystick(t) {
          const rect = joystickBase.getBoundingClientRect();
          baseCenterX = rect.left + rect.width / 2;
          baseCenterY = rect.top + rect.height / 2;
          joystickTouchId = t.identifier;
        }

        function updateJoystick(t) {
          let dx = t.clientX - baseCenterX;
          let dy = t.clientY - baseCenterY;
          const dist = Math.hypot(dx, dy);
          if (dist > JOYSTICK_RADIUS) {
            dx = (dx / dist) * JOYSTICK_RADIUS;
            dy = (dy / dist) * JOYSTICK_RADIUS;
          }
          joystickNub.style.transform = `translate(${dx}px, ${dy}px)`;
          // Screen-up (negative dy) means move forward.
          joystickForward = -dy / JOYSTICK_RADIUS;
          joystickRight = dx / JOYSTICK_RADIUS;
        }

        function endJoystick() {
          joystickTouchId = null;
          joystickForward = 0;
          joystickRight = 0;
          joystickNub.style.transform = 'translate(0px, 0px)';
        }

        joystickBase.addEventListener('touchstart', (e) => {
          if (window.TVA_INTRO_PLAYING || window.TVA_PORTFOLIO_OPEN) return;
          const t = e.changedTouches[0];
          startJoystick(t);
          updateJoystick(t);
          e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
          for (const t of e.changedTouches) {
            if (t.identifier === joystickTouchId) {
              updateJoystick(t);
            }
          }
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
          for (const t of e.changedTouches) {
            if (t.identifier === joystickTouchId) endJoystick();
          }
        }, { passive: true });
      }
    }

    // Movement bounds: keep the player inside the hallway, with a small
    // margin so the camera near-plane never clips through a wall.
    const MARGIN = 0.35;
    const boundX = HALLWAY_WIDTH / 2 - MARGIN;
    const boundZFar = HALLWAY_LENGTH / 2 - MARGIN;   // toward the entrance
    const boundZNear = -HALLWAY_LENGTH / 2 + MARGIN; // toward the Tempad wall

    const clock = new THREE.Clock();

    function updateMovement() {
      const dt = Math.min(clock.getDelta(), 0.05); // clamp to avoid huge jumps on tab-switch

      if (window.TVA_INTRO_PLAYING || window.TVA_PORTFOLIO_OPEN) return;

      let moveForward = 0;
      let moveRight = 0;
      if (keys.w) moveForward += 1;
      if (keys.s) moveForward -= 1;
      if (keys.d) moveRight += 1;
      if (keys.a) moveRight -= 1;

      // Blend in joystick input (touch devices). Keyboard and joystick
      // are additive but clamped, so a stray key doesn't double speed.
      moveForward = Math.max(-1, Math.min(1, moveForward + joystickForward));
      moveRight = Math.max(-1, Math.min(1, moveRight + joystickRight));

      if (moveForward !== 0 || moveRight !== 0) {
        // Normalize diagonal movement so it isn't faster than straight movement.
        const len = Math.hypot(moveForward, moveRight) || 1;
        moveForward /= len;
        moveRight /= len;

        const sinYaw = Math.sin(yaw);
        const cosYaw = Math.cos(yaw);

        // Forward vector for yaw-only movement (ignore pitch so walking
        // doesn't speed up/slow down just from looking up or down).
        const forwardX = -sinYaw;
        const forwardZ = -cosYaw;
        const rightX = cosYaw;
        const rightZ = -sinYaw;

        const dx = (forwardX * moveForward + rightX * moveRight) * MOVE_SPEED * dt;
        const dz = (forwardZ * moveForward + rightZ * moveRight) * MOVE_SPEED * dt;

        camera.position.x = Math.max(-boundX, Math.min(boundX, camera.position.x + dx));
        camera.position.z = Math.max(boundZNear, Math.min(boundZFar, camera.position.z + dz));
      }

      camera.position.y = EYE_HEIGHT;
    }

    /* ---------------- Tempad proximity + interaction ---------------- */

    const INTERACT_DISTANCE = 2.4;
    let inRange = false;

    function updateProximity() {
      if (window.TVA_INTRO_PLAYING || window.TVA_PORTFOLIO_OPEN) {
        if (interactPrompt) interactPrompt.classList.remove('visible');
        return;
      }
      const dx = camera.position.x - 0;
      const dz = camera.position.z - tempadZ;
      const dist = Math.hypot(dx, dz);
      inRange = dist <= INTERACT_DISTANCE;
      if (interactPrompt) interactPrompt.classList.toggle('visible', inRange);
    }

    function tryInteract() {
      if (window.TVA_INTRO_PLAYING) return;
      if (window.TVA_PORTFOLIO_OPEN) return;
      if (!inRange) return;
      openPortfolio();
    }

    if (isTouchDevice && interactPrompt) {
      interactPrompt.classList.add('touch-tappable');
      interactPrompt.addEventListener('touchend', (e) => {
        e.preventDefault();
        tryInteract();
      }, { passive: false });
    }

    /* ---------------- Portfolio overlay bridge ---------------- */

    const portfolioOverlay = document.getElementById('portfolio-overlay');
    const closeBtn = document.getElementById('portfolio-close-btn');

    function openPortfolio() {
      window.TVA_PORTFOLIO_OPEN = true;
      if (portfolioOverlay) portfolioOverlay.classList.add('visible');
      if (interactPrompt) interactPrompt.classList.remove('visible');
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      if (clickToLookEl) clickToLookEl.classList.remove('visible');
    }

    function closePortfolioIfOpen() {
      if (!window.TVA_PORTFOLIO_OPEN) return;
      window.TVA_PORTFOLIO_OPEN = false;
      if (portfolioOverlay) portfolioOverlay.classList.remove('visible');
      // Re-prompt the user to click to resume looking around.
      if (clickToLookEl) clickToLookEl.classList.add('visible');
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closePortfolioIfOpen);
    }

    window.TVA_CLOSE_PORTFOLIO = closePortfolioIfOpen;

    /* ---------------- Main loop ---------------- */

    const { renderer, scene } = window.TVA_SCENE;

    function tick() {
      requestAnimationFrame(tick);

      if (window.TVA_PORTFOLIO_OPEN) return; // nothing 3D is visible right now; don't burn cycles re-rendering it

      updateMovement();
      updateProximity();

      // Gentle idle rotation on the Tempad device for visual life.
      if (tempadGroup) tempadGroup.rotation.y += 0.0035;

      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.TVA_CONTROLLER_READY = true;
    window.dispatchEvent(new CustomEvent('tva-controller-ready'));
  }

  if (window.TVA_SCENE_READY) {
    init();
  } else {
    window.addEventListener('tva-scene-ready', init);
  }
})();
