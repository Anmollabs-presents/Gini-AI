/* Navigation */
class Navigation {
  constructor() {
    this.nav = document.getElementById('nav');
    this.hamburger = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.isMenuOpen = false;
  }

  init() {
    window.addEventListener('scroll', () => this._onScroll(), { passive: true });
    this.hamburger?.addEventListener('click', () => this._toggleMenu());

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-nav a, .mobile-nav button').forEach(el => {
      el.addEventListener('click', () => this._closeMenu());
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.mobileMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
        this._closeMenu();
      }
    });
  }

  _onScroll() {
    const scrolled = window.scrollY > 80;
    this.nav.classList.toggle('scrolled', scrolled);
  }

  _toggleMenu() {
    this.isMenuOpen ? this._closeMenu() : this._openMenu();
  }

  _openMenu() {
    this.isMenuOpen = true;
    this.hamburger.classList.add('open');
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.mobileMenu.classList.add('open');
    this.mobileMenu.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  _closeMenu() {
    this.isMenuOpen = false;
    this.hamburger.classList.remove('open');
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.mobileMenu.classList.remove('open');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}
