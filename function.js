const circles = document.querySelectorAll('.circle');

circles.forEach(circle => {
  const images = circle.dataset.images.split(',');
  const card = circle.querySelector('.card');

  // Populate card with images
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src.trim();
    card.appendChild(img);
  });

  // Desktop hover
  circle.addEventListener('mouseenter', () => {
    card.style.display = 'flex';
  });
  circle.addEventListener('mouseleave', () => {
    card.style.display = 'none';
  });

  // Mobile click toggle
  circle.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent closing immediately
    card.style.display = card.style.display === 'flex' ? 'none' : 'flex';
  });
});

// Close card when clicking outside (mobile)
document.addEventListener('click', (e) => {
  circles.forEach(circle => {
    const card = circle.querySelector('.card');
    if (!circle.contains(e.target)) {
      card.style.display = 'none';
    }
  });
});
