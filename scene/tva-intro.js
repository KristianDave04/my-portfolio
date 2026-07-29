/* ============================================================
   TVA HEADQUARTERS — Cinematic intro
   A short scripted camera dolly down the hallway with
   TVA-style bureaucratic text overlays, before handing control
   to the user. Skippable by click or any key.
   ============================================================ */

(function () {
  'use strict';

  window.TVA_INTRO_PLAYING = true;

  function init() {
    if (!window.TVA_SCENE) return;

    const { camera, HALLWAY_LENGTH, EYE_HEIGHT } = window.TVA_SCENE;
    const introEl = document.getElementById('cinematic-intro');
    const introTextEl = document.getElementById('intro-text');
    const skipHintEl = document.getElementById('intro-skip-hint');

    if (!introEl) {
      window.TVA_INTRO_PLAYING = false;
      return;
    }

    // Returning from a portfolio sub-page (e.g. clicking "Exit Tempad" on
    // the About/Timeline/Documents pages) skips straight to the hallway --
    // replaying the full cinematic every time would get old fast.
    const params = new URLSearchParams(window.location.search);
    if (params.get('skipIntro') === '1') {
      window.TVA_INTRO_PLAYING = false;
      introEl.style.display = 'none';
      camera.position.set(0, EYE_HEIGHT, HALLWAY_LENGTH / 2 - 1);
      camera.rotation.set(0, 0, 0, 'YXZ');
      const clickToLookEl = document.getElementById('tva-click-to-look');
      if (clickToLookEl) clickToLookEl.classList.add('visible');
      // Clean the URL so a manual refresh later plays the intro normally again.
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Camera path: start far back near the entrance, drift slowly toward
    // the Tempad, then settle at the normal starting position.
    const startZ = HALLWAY_LENGTH / 2 - 1;
    const driftToZ = -1.5;
    const settleBackToZ = startZ;

    camera.position.set(0, EYE_HEIGHT, startZ);
    camera.rotation.set(0, 0, 0, 'YXZ');

    const lines = [
      { text: 'TIME VARIANCE AUTHORITY', at: 0 },
      { text: 'MAINTAINING THE SACRED TIMELINE SINCE THE DAWN OF TIME', at: 2600 },
      { text: 'VISITOR CLEARANCE: GRANTED', at: 5400 },
      { text: 'PROCEED TO THE TEMPAD TERMINAL', at: 7800 },
    ];

    let introStartTime = null;
    let skipped = false;
    let currentLineIndex = -1;

    function showLine(index) {
      if (index < 0 || index >= lines.length) return;
      currentLineIndex = index;
      introTextEl.textContent = lines[index].text;
      introTextEl.classList.remove('line-in');
      // Force reflow so the animation re-triggers for each new line.
      void introTextEl.offsetWidth;
      introTextEl.classList.add('line-in');
    }

    const TOTAL_DURATION = 9600; // ms

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
      if (skipped) return;

      if (introStartTime === null) introStartTime = now;
      const elapsed = now - introStartTime;

      // Advance text lines at their scheduled times.
      for (let i = lines.length - 1; i >= 0; i--) {
        if (elapsed >= lines[i].at && currentLineIndex < i) {
          showLine(i);
          break;
        }
      }

      // Camera dolly: drift forward through the first ~2/3 of the intro,
      // then ease back to the standard starting position for the handoff.
      const driftPortion = 0.62;
      const driftEndMs = TOTAL_DURATION * driftPortion;

      if (elapsed <= driftEndMs) {
        const t = easeInOutCubic(Math.min(elapsed / driftEndMs, 1));
        camera.position.z = startZ + (driftToZ - startZ) * t;
      } else {
        const t = easeInOutCubic(Math.min((elapsed - driftEndMs) / (TOTAL_DURATION - driftEndMs), 1));
        const posAtDriftEnd = driftToZ;
        camera.position.z = posAtDriftEnd + (settleBackToZ - posAtDriftEnd) * t;
      }

      // Slight ambient sway for cinematic feel (very subtle).
      camera.rotation.y = Math.sin(elapsed * 0.00035) * 0.025;

      if (elapsed >= TOTAL_DURATION) {
        finishIntro();
        return;
      }

      requestAnimationFrame(step);
    }

    function finishIntro() {
      if (skipped) return;
      skipped = true;
      window.TVA_INTRO_PLAYING = false;
      camera.position.set(0, EYE_HEIGHT, settleBackToZ);
      camera.rotation.set(0, 0, 0, 'YXZ');
      introEl.classList.add('fade-out');
      setTimeout(() => {
        introEl.style.display = 'none';
        const clickToLookEl = document.getElementById('tva-click-to-look');
        if (clickToLookEl) clickToLookEl.classList.add('visible');
      }, 700);
    }

    function skipIntro() {
      if (skipped) return;
      finishIntro();
    }

    // Skip on click or any key press.
    window.addEventListener('keydown', skipIntro, { once: true });
    introEl.addEventListener('click', skipIntro, { once: true });

    // Show the skip hint a moment after the intro starts, not instantly
    // (avoids it feeling like the very first thing shouting for attention).
    setTimeout(() => {
      if (skipHintEl && !skipped) skipHintEl.classList.add('visible');
    }, 1500);

    showLine(0);
    requestAnimationFrame(step);
  }

  if (window.TVA_SCENE_READY) {
    init();
  } else {
    window.addEventListener('tva-scene-ready', init);
  }
})();
