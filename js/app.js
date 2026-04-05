/* App — bootstraps all modules */
document.addEventListener('DOMContentLoaded', () => {
  const nav         = new Navigation();
  const hero        = new HeroSection();
  const animations  = new AnimationController();
  const chatbot     = new Chatbot();
  const modelViewer = new ModelViewer();

  nav.init();
  hero.init();
  chatbot.init();
  modelViewer.init();
  // AnimationController self-initialises in constructor

  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = themeToggle?.querySelector('.sun-icon');
  const moonIcon = themeToggle?.querySelector('.moon-icon');

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggle?.addEventListener('click', () => {
    document.documentElement.classList.add('theme-transition');
    let theme = document.documentElement.getAttribute('data-theme');
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 400);
  });

  function updateThemeIcon(theme) {
    if(!sunIcon || !moonIcon) return;
    if (theme === 'light') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      document.body.style.colorScheme = 'light';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      document.body.style.colorScheme = 'dark';
    }
  }

  // Color Picker
  const colorBtns = document.querySelectorAll('.color-btn');
  const currentColor = localStorage.getItem('color-theme') || 'violet';
  document.documentElement.setAttribute('data-color', currentColor);
  
  colorBtns.forEach(btn => {
    if(btn.dataset.color === currentColor) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', (e) => {
      document.documentElement.classList.add('theme-transition');
      const selectedColor = e.target.dataset.color;
      document.documentElement.setAttribute('data-color', selectedColor);
      localStorage.setItem('color-theme', selectedColor);
      
      colorBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 400);
    });
  });

  // Expose for debugging
  window.__gini = { nav, hero, animations, chatbot, modelViewer };
});
