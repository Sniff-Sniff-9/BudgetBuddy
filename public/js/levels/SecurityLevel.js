// levels/SecurityLevel.js
import BaseLevel from './BaseLevel.js';

export default class SecurityLevel extends BaseLevel {
  constructor(config, opts = {}) {
    super(config, opts);
    this.questions = config.questions;
    this.current = 0;
    this.score = 0;
    this.combo = 0;
    this.timer = null;
  }

  render() {
    const q = this.questions[this.current];

    this.mount.innerHTML = `
      <!-- Верхняя строка: таймер + счёт -->
      <div class="top-bar">
        <div class="timer">Timer <span id="time">01:00</span></div>
        <div class="score">Счёт: <span id="score-value">${this.score}</span></div>
      </div>

      <!-- Прогресс -->
      <div class="progress-container">
        <div class="progress-text" style="font-weight: 600;">Прогресс: ${this.current + 1}/${this.questions.length}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${((this.current + 1) / this.questions.length) * 100}%"></div>
        </div>
      </div>

      <!-- Ситуация -->
      <div class="situation-card">
        <p class="situation-text">${q.situation}</p>
      </div>

      <!-- Ответы — всегда в колонку -->
      <div class="answers">
        ${q.options.map((text, i) => `
          <button class="answer-btn" data-id="${i + 1}">
            <span class="num">${i + 1}</span>
            <span class="text">${text}</span>
          </button>
        `).join('')}
      </div>

      <!-- Фидбек — скрыт до ответа -->
      <div class="feedback" id="feedback"></div>
    `;

    // КЛЮЧЕВОЙ МОМЕНТ: подсказка меняется сразу при появлении вопроса!
    this.setHint(q.hint);
  }

  bind() {
    // Клик по ответу
    this.mount.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        this.handleAnswer(parseInt(btn.dataset.id));
      });
    });

    // Запуск таймера
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timer);
    let time = 60;
    const timerEl = this.mount.querySelector('#time');

    const tick = () => {
      const m = String(Math.floor(time / 60)).padStart(2, '0');
      const s = String(time % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
      time--;

      if (time < 0) {
        clearInterval(this.timer);
        this.handleAnswer(null); // таймаут
      }
    };

    tick();
    this.timer = setInterval(tick, 1000);
  }

  handleAnswer(selected) {
    clearInterval(this.timer);
    const q = this.questions[this.current];
    const correct = q.correctAnswer;
    const isCorrect = selected === correct;

    // Блокируем кнопки
    this.mount.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

    // Подсвечиваем
    this.mount.querySelectorAll('.answer-btn').forEach(btn => {
      const id = parseInt(btn.dataset.id);
      if (id === correct) btn.classList.add('correct');
      if (id === selected && !isCorrect) btn.classList.add('wrong');
    });

    // Фидбек
    const feedback = this.mount.querySelector('#feedback');
    if (isCorrect) {
      this.combo++;
      const points = 10 * this.combo;
      this.score += points;
      feedback.innerHTML = `<div class="correct">Правильно! +${points} очков</div>`;
    } else {
      this.combo = 0;
      feedback.innerHTML = `
        <div class="wrong">Неправильно</div>
        <div class="hint-text">Правильный ответ: ${q.options[correct - 1]}</div>
      `;
    }

    // Обновляем счёт сразу
    this.mount.querySelector('#score-value').textContent = this.score;
    feedback.classList.add('show');

    // Следующий вопрос
    setTimeout(() => {
      if (++this.current >= this.questions.length) {
        this.complete();
      } else {
        this.render();
        this.bind();
      }
    }, 2800);
  }

  complete() {
    this.showMessage(
      "Уровень пройден!",
      `Отлично! Вы набрали <strong>${this.score}</strong> очков и стали настоящим экспертом в финансовой безопасности!`,
      () => {
        this.completeLevel({
          levelId: this.config.id,
          xp: Math.max(80, Math.floor(this.score / 3)),
          redirect: `levels.html?topic=${this.config.topic}`
        });
      }
    );
  }

  async start() {
    this.render();
    this.bind();
  }
}