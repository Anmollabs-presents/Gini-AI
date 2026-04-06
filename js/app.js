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

  // Expose for debugging
  window.__gini = { nav, hero, animations, chatbot, modelViewer };
});
