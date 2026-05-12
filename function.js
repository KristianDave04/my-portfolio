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
            <div><img src="../assets/icons/c-sharp.png" alt="C#"><span>C#</span></div>
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
            <div class="card"><img src="../assets/hobbies/digital.jpg" alt="Hobby 4"><p>I love drawing some digital art</p></div>
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

    /**
 * MISS MINUTES - INTERACTIVE AI LOGIC
 * Features: Wake up sequence, Draggable, Wandering AI, Random Facts
 */

const mmContainer = document.getElementById('miss-minutes');
const mmSprite = document.getElementById('mm-character');
const mmBubble = document.getElementById('mm-bubble');

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
let wanderTimer; // Holds the timeout for the next movement

// --- 1. INITIALIZATION: Wake Up & Shrink ---
window.addEventListener('load', () => {
    // Initial State: Big and Sleeping
    mmContainer.style.transform = "scale(1.5)";
    mmSprite.className = "mm-sprite sleeping";

    setTimeout(() => {
        // Wake up animation: Switch to walking and shrink
        mmContainer.style.transform = "scale(0.8)";
        mmSprite.className = "mm-sprite walking";
        speak("I'm awake! Let's check out these projects.");

        // Wait for the wake-up speech to finish, then start wandering
        setTimeout(() => {
            startWandering();
        }, 3000);
    }, 2000);
});

// --- 2. WANDERING AI LOGIC ---
function startWandering() {
    // If the user is currently dragging her, stop the loop
    if (isDragging) return;

    // Randomly decide: 0 = Stay Idle, 1 = Walk somewhere
    const decision = Math.floor(Math.random() * 2);

    if (decision === 0) {
        // STATE: IDLE
        mmSprite.className = "mm-sprite idle";
        
        // Wait 3-5 seconds before making the next move
        const idleTime = Math.random() * (5000 - 3000) + 3000;
        wanderTimer = setTimeout(startWandering, idleTime);
    } else {
        // STATE: WALKING
        mmSprite.className = "mm-sprite walking";

        // Calculate a random target position nearby
        const currentLeft = mmContainer.offsetLeft;
        const currentTop = mmContainer.offsetTop;

        // Move up to 150px in any direction
        const moveX = (Math.random() - 0.5) * 300;
        const moveY = (Math.random() - 0.5) * 300;

        // Boundary Check: Keep her within the window viewport
        const padding = 60;
        const targetX = Math.max(padding, Math.min(window.innerWidth - padding * 2, currentLeft + moveX));
        const targetY = Math.max(padding, Math.min(window.innerHeight - padding * 2, currentTop + moveY));

        // Flip Sprite: Face left if moving left, right if moving right
        if (moveX > 0) {
            mmSprite.style.transform = "scaleX(1)"; // Facing Right
        } else {
            mmSprite.style.transform = "scaleX(-1)"; // Facing Left (flipped)
        }

        // Apply movement using CSS Transition
        mmContainer.style.transition = "left 3s linear, top 3s linear, transform 0.5s ease";
        mmContainer.style.left = `${targetX}px`;
        mmContainer.style.top = `${targetY}px`;
        mmContainer.style.bottom = 'auto'; // Remove initial CSS positioning
        mmContainer.style.right = 'auto';

        // Wait for the walk animation to finish (3 seconds) then decide again
        wanderTimer = setTimeout(startWandering, 3200);
    }
}

// --- 3. DRAGGING SYSTEM ---
mmContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    
    // Stop the wandering loop immediately
    clearTimeout(wanderTimer);
    
    // Change to grab animation
    mmSprite.className = "mm-sprite grab";
    mmContainer.style.transition = "none"; // Instant response while dragging

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
        
        // Return to a resting state
        mmContainer.style.transition = "transform 0.5s ease";
        mmSprite.className = "mm-sprite idle";
        
        // Resume wandering after 2 seconds of being dropped
        wanderTimer = setTimeout(startWandering, 2000);
    }
});

// --- 4. SPEECH & INTERACTION ---
function speak(text) {
    mmBubble.innerText = text;
    mmBubble.classList.add('show');
    
    // Hide bubble after 4 seconds
    setTimeout(() => {
        mmBubble.classList.remove('show');
    }, 4000);
}

mmSprite.addEventListener('click', () => {
    // Only speak if we aren't dragging
    if (isDragging) return;
    
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    speak(randomFact);
});
