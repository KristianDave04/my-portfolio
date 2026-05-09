const circles = document.querySelectorAll('.circle');

circles.forEach(circle => {
  const images = circle.dataset.images.split(',');
  const card = circle.querySelector('.card');

  // Populate card with images once
  if (card.children.length === 0) {
    images.forEach(src => {
      const img = document.createElement('img');
      img.src = src.trim();
      card.appendChild(img);
    });
  }

  // Desktop hover
  circle.addEventListener('mouseenter', () => {
    card.style.display = 'grid';   // show card
  });
  circle.addEventListener('mouseleave', () => {
    card.style.display = 'none';   // hide card
  });

  // Mobile click toggle
  circle.addEventListener('click', (e) => {
    e.stopPropagation();
    card.style.display = card.style.display === 'grid' ? 'none' : 'grid';
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
