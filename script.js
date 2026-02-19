class RelaxingTimer {
      constructor() {
                this.timeLeft = 300;
                this.initialTime = 300;
                this.isRunning = false;
                this.timerId = null;
                this.audioContext = null;

          this.minPicker = document.getElementById('min-picker');
                this.secPicker = document.getElementById('sec-picker');
                this.timePicker = document.getElementById('time-picker');
                this.countdownDisplay = document.getElementById('countdown-display');

          this.startBtn = document.getElementById('start-btn');
                this.pauseBtn = document.getElementById('pause-btn');
                this.resetBtn = document.getElementById('reset-btn');
                this.container = document.querySelector('.container');

          this.itemHeight = 100;

          this.startBtn.addEventListener('click', () => this.start());
                this.pauseBtn.addEventListener('click', () => this.pause());
                this.resetBtn.addEventListener('click', () => this.reset());

          this.initPickers();
                this.setupScrollListeners();
                this.scrollToTime(0, 0);
                this.updateTimeFromScroll();
      }

    initPickers() {
              for (let i = 0; i <= 99; i++) {
                            const el = document.createElement('div');
                            el.className = 'picker-item';
                            el.textContent = i.toString().padStart(2, '0');
                            this.minPicker.appendChild(el);
              }

          for (let i = 0; i <= 59; i++) {
                        const el = document.createElement('div');
                        el.className = 'picker-item';
                        el.textContent = i.toString().padStart(2, '0');
                        this.secPicker.appendChild(el);
          }
    }

    setupScrollListeners() {
              let scrollTimeout;
              const onScroll = () => {
                            clearTimeout(scrollTimeout);
                            this.highlightActiveItem();
                            scrollTimeout = setTimeout(() => {
                                              this.snapToNearest();
                                              this.updateTimeFromScroll();
                            }, 100);
              };

          this.minPicker.addEventListener('scroll', onScroll);
              this.secPicker.addEventListener('scroll', onScroll);
    }

    snapToNearest() {
              [this.minPicker, this.secPicker].forEach(picker => {
                            const scrollTop = picker.scrollTop;
                            const nearestIndex = Math.round(scrollTop / this.itemHeight);
                            picker.scrollTo({
                                              top: nearestIndex * this.itemHeight,
                                              behavior: 'smooth'
                            });
              });
    }

    highlightActiveItem() {
              [this.minPicker, this.secPicker].forEach(picker => {
                            const index = Math.round(picker.scrollTop / this.itemHeight);
                            const items = picker.querySelectorAll('.picker-item');
                            items.forEach((item, i) => {
                                              if (i === index) {
                                                                    item.classList.add('active');
                                                                    item.style.color = '#ffffff';
                                                                    item.style.transform = 'scale(1.1)';
                                                                    item.style.opacity = '1';
                                              } else {
                                                                    item.classList.remove('active');
                                                                    item.style.color = 'rgba(255,255,255,0.3)';
                                                                    item.style.transform = 'scale(1)';
                                                                    item.style.opacity = '0.5';
                                              }
                            });
              });
    }

    updateTimeFromScroll() {
              const m = Math.round(this.minPicker.scrollTop / this.itemHeight);
              const s = Math.round(this.secPicker.scrollTop / this.itemHeight);

          this.timeLeft = m * 60 + s;
              this.initialTime = this.timeLeft;
    }

    scrollToTime(m, s) {
              this.minPicker.scrollTop = m * this.itemHeight;
              this.secPicker.scrollTop = s * this.itemHeight;
              this.highlightActiveItem();
    }

    formatTime(seconds) {
              const m = Math.floor(seconds / 60);
              const s = seconds % 60;
              return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    updateCountdownDisplay() {
              this.countdownDisplay.textContent = this.formatTime(this.timeLeft);
              document.title = `${this.formatTime(this.timeLeft)} - Relaxing Timer`;
    }

    start() {
              if (this.isRunning) return;
              if (this.timeLeft === 0) return;

          if (!this.audioContext) {
                        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
              if (this.audioContext.state === 'suspended') {
                            this.audioContext.resume();
              }

          this.timePicker.classList.add('hidden');
              this.countdownDisplay.classList.remove('hidden');

          this.isRunning = true;
              this.container.classList.add('running');
              this.toggleControls(true);
              this.updateCountdownDisplay();

          this.timerId = setInterval(() => {
                        if (this.timeLeft > 0) {
                                          this.timeLeft--;
                                          this.updateCountdownDisplay();
                        } else {
                                          this.complete();
                        }
          }, 1000);
    }

    pause() {
              if (!this.isRunning) return;

          clearInterval(this.timerId);
              this.isRunning = false;
              this.container.classList.remove('running');
              this.toggleControls(false);
    }

    reset() {
              this.pause();

          this.countdownDisplay.classList.add('hidden');
              this.timePicker.classList.remove('hidden');

          const m = Math.floor(this.initialTime / 60);
              const s = this.initialTime % 60;
              this.scrollToTime(m, s);
    }

    complete() {
              this.pause();
              this.playHealingSound();
    }

    toggleControls(isRunning) {
              if (isRunning) {
                            this.startBtn.classList.add('hidden');
                            this.pauseBtn.classList.remove('hidden');
              } else {
                            this.startBtn.classList.remove('hidden');
                            this.pauseBtn.classList.add('hidden');
              }
    }

    playHealingSound() {
              if (!this.audioContext) return;

          const now = this.audioContext.currentTime;

          const oscillator = this.audioContext.createOscillator();
              const gainNode = this.audioContext.createGain();

          oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(528, now);

          gainNode.gain.setValueAtTime(0, now);
              gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
              gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 4);

          oscillator.connect(gainNode);
              gainNode.connect(this.audioContext.destination);

          oscillator.start(now);
              oscillator.stop(now + 4);

          const osc2 = this.audioContext.createOscillator();
              const gain2 = this.audioContext.createGain();

          osc2.type = 'sine';
              osc2.frequency.setValueAtTime(528 * 1.5, now);

          gain2.gain.setValueAtTime(0, now);
              gain2.gain.linearRampToValueAtTime(0.1, now + 0.2);
              gain2.gain.exponentialRampToValueAtTime(0.0001, now + 5);

          osc2.connect(gain2);
              gain2.connect(this.audioContext.destination);

          osc2.start(now);
              osc2.stop(now + 5);
    }
}

document.addEventListener('DOMContentLoaded', () => {
      new RelaxingTimer();
});
