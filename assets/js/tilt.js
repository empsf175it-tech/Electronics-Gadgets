/**
 * VOLTARIS 3D TILT MODULE (tilt.js)
 * High-performance 3D card tilt with specular glare, neon border follower,
 * preserve-3d content lifting, and touch/reduced-motion fallback.
 */

export function initTilt() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  const cards = document.querySelectorAll('[data-tilt], .tilt-card');

  cards.forEach(card => {
    // Inject glare element if missing
    if (!card.querySelector('.tilt-glare')) {
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      card.appendChild(glare);
    }

    if (isReducedMotion || isTouchDevice) {
      // Gentle touch press scale
      card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
      }, { passive: true });
      card.addEventListener('touchend', () => {
        card.style.transform = 'scale(1)';
      }, { passive: true });
      return;
    }

    // Desktop 3D Mouse Tilt
    let bounds;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 120ms ease-out, box-shadow 300ms ease';
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const percentX = (mouseX / bounds.width) * 100;
      const percentY = (mouseY / bounds.height) * 100;

      // ±12deg rotation
      const rotateX = ((mouseY / bounds.height) - 0.5) * -24;
      const rotateY = ((mouseX / bounds.width) - 0.5) * 24;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Update specular glare & neon border position variables
      card.style.setProperty('--mouse-x', `${percentX.toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${percentY.toFixed(1)}%`);
    };

    const onMouseLeave = () => {
      bounds = null;
      card.style.transition = 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}
