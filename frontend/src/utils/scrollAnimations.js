// Scroll animation utilities for enhancing user experience

export const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe elements with animation classes
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll-scale');
  animatedElements.forEach(el => observer.observe(el));

  // Stagger animations
  const staggerElements = document.querySelectorAll('.stagger-animation');
  staggerElements.forEach(container => {
    const children = container.children;
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(child);
    });
  });

  // Progress bar animations
  const progressBars = document.querySelectorAll('.progress-animate');
  progressBars.forEach(bar => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const width = entry.target.getAttribute('data-progress') || '100%';
          entry.target.style.setProperty('--progress-width', width);
          entry.target.classList.add('animated');
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(bar);
  });
};

export const addScrollClass = () => {
  // Add scrolled class to header when scrolling
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
};

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  addScrollClass();
});

// Re-initialize on dynamic content changes
export const reinitAnimations = () => {
  setTimeout(initScrollAnimations, 100);
};
