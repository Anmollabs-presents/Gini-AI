/* Model Viewer */
class ModelViewer {
  constructor() {
    this.images = [
      'assets/gini-model1/img1.png',
      'assets/gini-model1/img2.png',
      'assets/gini-model1/img3.png',
      'assets/gini-model1/img4.png',
    ];
    this.current   = 0;
    this.playing   = true;
    this.interval  = null;
    this.DELAY     = 3200;
  }

  init() {
    this.$img    = document.getElementById('model-image');
    this.$prev   = document.getElementById('model-prev');
    this.$next   = document.getElementById('model-next');
    this.$play   = document.getElementById('model-play');
    this.$dots   = document.querySelectorAll('.mdot');

    if (!this.$img) return;

    this.$prev?.addEventListener('click', () => { this._go(this.current - 1); this._resetTimer(); });
    this.$next?.addEventListener('click', () => { this._go(this.current + 1); this._resetTimer(); });
    this.$play?.addEventListener('click', () => this._togglePlay());

    this.$dots.forEach(dot => {
      dot.addEventListener('click', () => {
        this._go(parseInt(dot.dataset.idx, 10));
        this._resetTimer();
      });
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('model-container')?.closest('section')?.matches(':hover')) return;
      if (e.key === 'ArrowLeft')  { this._go(this.current - 1); this._resetTimer(); }
      if (e.key === 'ArrowRight') { this._go(this.current + 1); this._resetTimer(); }
    });

    this._startTimer();
    this._updateUI();
  }

  _go(idx) {
    const total = this.images.length;
    this.current = ((idx % total) + total) % total;
    this._transition();
  }

  _transition() {
    if (!this.$img) return;
    this.$img.style.opacity = '0';
    setTimeout(() => {
      this.$img.src = this.images[this.current];
      this.$img.style.opacity = '1';
    }, 280);
    this._updateUI();
  }

  _updateUI() {
    // Dots
    this.$dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.current);
      dot.setAttribute('aria-selected', String(i === this.current));
    });

    // Play/pause icons
    const iconPause = this.$play?.querySelector('.icon-pause');
    const iconPlay  = this.$play?.querySelector('.icon-play');
    if (iconPause) iconPause.style.display = this.playing ? '' : 'none';
    if (iconPlay)  iconPlay.style.display  = this.playing ? 'none' : '';
    this.$play?.setAttribute('aria-pressed', String(this.playing));
    this.$play?.setAttribute('aria-label', this.playing ? 'Pause slideshow' : 'Play slideshow');
  }

  _startTimer() {
    this.interval = setInterval(() => {
      if (this.playing) this._go(this.current + 1);
    }, this.DELAY);
  }

  _resetTimer() {
    clearInterval(this.interval);
    this._startTimer();
  }

  _togglePlay() {
    this.playing = !this.playing;
    this._updateUI();
  }
}
