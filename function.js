function showInfo(type) {
  const infoDisplay = document.getElementById('info-display');
  let content = '';

  switch(type) {
    case 'skills':
      content = `
        <h1 class="glitch-text">SKILLS</h1>
        <div class="skills-icons">
          <div><img src="../assets/icons/html.png" alt="HTML"><span>HTML</span></div>
          <div><img src="../assets/icons/css-3.png" alt="CSS"><span>CSS</span></div>
          <div><img src="../assets/icons/js.png" alt="JavaScript"><span>JavaScript</span></div>
          <div><img src="../assets/icons/php.png" alt="PHP"><span>PHP</span></div>
          <div><img src="../assets/icons/database.png" alt="SQL"><span>mySQL</span></div>
          <div><img src="../assets/icons/c-.png" alt="C++"><span>C++</span></div>
          <div><img src="../assets/assets/icons/c-sharp.png" alt="C#"><span>C#</span></div>
        </div>
      `;
      break;

    case 'hobbies':
      content = `
        <h1 class="glitch-text">HOBBIES</h1>
        <div class="card-grid">
          <div class="card"><img src="../assets/hobbies/code.png" alt="Hobby 1"><p>Coding at my free time as well learning it</p></div>
          <div class="card"><img src="../assets/hobbies/onepis.jpg" alt="Hobby 2"><p>Watching One Piece and others movies</p></div>
          <div class="card"><img src="../assets/fav books/sherlock.jpg" alt="Hobby 3"><p>At my free time, I enjoy reading books</p></div>
          <div class="card"><img src="../assets/hobbies/digital.png" alt="Hobby 3"><p>I love drawing some digital art</p></div>
        </div>
      `;
      break;

    case 'shows':
      content = `
        <h1 class="glitch-text">FAV SHOWS</h1>
        <div class="card-grid">
          <div class="card"><img src="../assets/fav show/logo.png" alt="Marvel"><p>Marvel Cinematic Universe</p></div>
          <div class="card"><img src="../assets/fav show/onepis.jpg" alt="Anime"><p>One Piece</p></div>
          <div class="card"><img src="../assets/fav show/hamilton.jpg" alt="Musical"><p>Hamilton</p></div>
          <div class="card"><img src="../assets/fav show/TGS.jpg" alt="Musical"><p>The Greatest Showman</p></div>
        </div>
      `;
      break;

    case 'books':
      content = `
        <h1 class="glitch-text">FAV BOOKS</h1>
        <div class="card-grid">
          <div class="card"><img src="../assets/fav books/iliad.jpg" alt="Book 1"><p>Iliad</p></div>
          <div class="card"><img src="../assets/fav books/odyssey.jpg" alt="Book 2"><p>Odyssey</p></div>
          <div class="card"><img src="../assets/fav books/sherlock.jpg" alt="Book 3"><p>Sherlock Holmes</p></div>
        </div>
      `;
      break;

    case 'other':
      content = `
        <h1 class="glitch-text">ABOUT ME</h1>
        <p>
          I am Kristian Dave B. Argate and currently a BSIT-2B student with a growing passion for technology and development.
          My interest in this field began back in high school while playing games; I discovered a YouTube video that explained how to make games step by step.
          That moment inspired me to pursue this course later on, because I realized I could also create the things I once admired, and over time I became better at coding.
          My goal as a developer is to build, learn, and create great applications that can help others in the future.
          I also aspire to design and develop unique games that I can be proud of, showcasing both creativity and technical skill.
        </p>
        <h1 class="glitch-text">OTHER INFO</h1>
        <p>Birthday: April 20, 2005</p>
        <p>Zodiac Sign: Taurus</p>
      `;
      break;
  }

  infoDisplay.innerHTML = content;

  // keep toolbar active state in sync with whichever button was pressed
  document.querySelectorAll('.info-toolbar button').forEach(btn => btn.classList.remove('active'));
  if (event && event.target && event.target.closest('.info-toolbar')) {
    event.target.classList.add('active');
  }
}

// Flip card toggle
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

// Reveal animation on scroll
const items = document.querySelectorAll('.timeline-item');
const revealOnScroll = () => {
  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      item.classList.add('visible');
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

/* ============================================================
   AMBIENT BACKGROUND PARALLAX
   The decorative backdrop layer behind the "glass" drifts subtly
   toward the cursor for depth. It never affects clickable content:
   .stage-backdrop is pointer-events:none and sits purely behind
   everything, so there's no risk of it destabilizing a click the
   way an animated transform on the nav itself once did.
   ============================================================ */
(function initAmbientParallax() {
  const backdrop = document.querySelector('.stage-backdrop');
  if (!backdrop) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (prefersReducedMotion || isTouch) return;

  const root = document.documentElement;
  const maxParallax = 14; // px

  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let ticking = false;

  window.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;  // -1 .. 1
    const ny = (e.clientY / window.innerHeight) * 2 - 1; // -1 .. 1
    targetX = nx;
    targetY = ny;

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(applyParallax);
    }
  });

  function applyParallax() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;

    root.style.setProperty('--parallax-x', `${(curX * maxParallax).toFixed(2)}px`);
    root.style.setProperty('--parallax-y', `${(curY * maxParallax).toFixed(2)}px`);

    if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
      requestAnimationFrame(applyParallax);
    } else {
      ticking = false;
    }
  }
})();

/* ============================================================
   TIMEDOOR PAGE TRANSITION
   Intercepts internal nav clicks, plays a brief gear-wipe,
   then navigates. Falls back silently if anything's missing.
   ============================================================ */
(function initTimedoorTransitions() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const wipe = document.createElement('div');
  wipe.className = 'timedoor-wipe';
  wipe.innerHTML = '<div class="gear-ring"></div>';
  document.body.appendChild(wipe);

  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || link.target === '_blank') return;
      if (prefersReducedMotion) return; // let default navigation happen instantly

      e.preventDefault();
      wipe.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 420);
    });
  });
})();

/**
 * MISS MINUTES - INTERACTIVE AI LOGIC
 * Features: Wake up sequence, Draggable, Wandering AI, Random Facts
 */

const mmContainer = document.getElementById('miss-minutes');
const mmSprite = document.getElementById('mm-character');
const mmBubble = document.getElementById('mm-bubble');

if (mmContainer && mmSprite && mmBubble) {

  // Configuration
  const facts = [
    "I'm a self-taught Developer!",
    "I built this timeline in 2026.",
    "BillNCare is one of my lead projects.",
    "I love pixel art and smooth UI!",
    "Drag me around if you're bored!",
    "I'm currently learning about C# Language.",
    "Keep an eye on my projects, more to come soon!",
    "I can wander around when I'm not sleeping or being dragged!",
    "Kristian is Taurus, born on April 20, 2005.",
    "I aspire to create unique games and applications in the future!"
  ];

  let isDragging = false;
  let startX, startY;
  let wanderTimer;

  // --- 1. INITIALIZATION: Wake Up & Shrink ---
  window.addEventListener('load', () => {
    mmContainer.style.transform = "scale(1.5)";
    mmSprite.className = "mm-sprite sleeping";

    setTimeout(() => {
      mmContainer.style.transform = "scale(0.8)";
      mmSprite.className = "mm-sprite walking";
      speak("I'm awake! Let's check out these projects.");

      setTimeout(() => {
        startWandering();
      }, 3000);
    }, 2000);
  });

  // --- 2. WANDERING AI LOGIC ---
  function startWandering() {
    if (isDragging) return;

    const decision = Math.floor(Math.random() * 2);

    if (decision === 0) {
      mmSprite.className = "mm-sprite idle";
      const idleTime = Math.random() * (5000 - 3000) + 3000;
      wanderTimer = setTimeout(startWandering, idleTime);
    } else {
      mmSprite.className = "mm-sprite walking";

      const currentLeft = mmContainer.offsetLeft;
      const currentTop = mmContainer.offsetTop;

      const moveX = (Math.random() - 0.5) * 300;
      const moveY = (Math.random() - 0.5) * 300;

      const padding = 60;
      const targetX = Math.max(padding, Math.min(window.innerWidth - padding * 2, currentLeft + moveX));
      const targetY = Math.max(padding, Math.min(window.innerHeight - padding * 2, currentTop + moveY));

      if (moveX > 0) {
        mmSprite.style.transform = "scaleX(1)";
      } else {
        mmSprite.style.transform = "scaleX(-1)";
      }

      mmContainer.style.transition = "left 3s linear, top 3s linear, transform 0.5s ease";
      mmContainer.style.left = `${targetX}px`;
      mmContainer.style.top = `${targetY}px`;
      mmContainer.style.bottom = 'auto';
      mmContainer.style.right = 'auto';

      wanderTimer = setTimeout(startWandering, 3200);
    }
  }

  // --- 3. DRAGGING SYSTEM ---
  mmContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    clearTimeout(wanderTimer);
    mmSprite.className = "mm-sprite grab";
    mmContainer.style.transition = "none";

    startX = e.clientX - mmContainer.offsetLeft;
    startY = e.clientY - mmContainer.offsetTop;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const x = e.clientX - startX;
    const y = e.clientY - startY;

    mmContainer.style.left = `${x}px`;
    mmContainer.style.top = `${y}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      mmContainer.style.transition = "transform 0.5s ease";
      mmSprite.className = "mm-sprite idle";
      wanderTimer = setTimeout(startWandering, 2000);
    }
  });

  // --- 4. SPEECH & INTERACTION ---
  function speak(text) {
    mmBubble.innerText = text;
    mmBubble.classList.add('show');
    setTimeout(() => {
      mmBubble.classList.remove('show');
    }, 4000);
  }

  mmSprite.addEventListener('click', () => {
    if (isDragging) return;
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    speak(randomFact);
  });
}
