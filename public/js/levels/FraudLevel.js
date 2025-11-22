// FraudLevel.js
import BaseLevel from './BaseLevel.js';
export default class FraudLevel extends BaseLevel {
  constructor(config, opts){ super(config, opts); }

  render(){
    const cfg = this.config;
    const container = document.createElement('div');
    const cluesHtml = cfg.clues.map(c => `
      <div class="clue-card" data-clue="${c.id}">
        <div class="clue-title">${c.title}</div>
        <p>${c.text}</p>
      </div>
    `).join('');

    const dialog = cfg.dialog;
    const optionsHtml = dialog.options.map(o => `<div class="response-option" data-option="${o.id}">${o.text}</div>`).join('');
    container.innerHTML = `
      <main class="game-board">
        <h2 class="board-title"><i class="fas fa-search"></i> Детективная доска с уликами</h2>
        <div class="clues-container clues-grid">${cluesHtml}</div>

        <div class="dialog-container" style="margin-top:18px">
          <h3 class="dialog-title">Диалог с подозреваемым</h3>
          <div class="dialog-content">${dialog.lines.map(l => `<p><strong>${l.who === 'player' ? 'Игрок' : 'Подозреваемый'}:</strong> ${l.text}</p>`).join('')}</div>
          <div class="response-options">${optionsHtml}</div>
        </div>

        <div style="margin-top:16px; text-align:right;">
          <div class="score-display" style="display:inline-flex;align-items:center;gap:12px;margin-right:12px;">
            <span>Очки:</span><span class="score-value">0</span>
          </div>
          <button class="btn" id="check-answers">Проверить ответы</button>
        </div>
      </main>
    `;
    this.mount.innerHTML = '';
    this.mount.appendChild(container);
    this.setHint('Выберите улики, указывающие на мошенничество, и правильную реакцию в диалоге.');
  }

  bind(){
    const cfg = this.config;
    const mount = this.mount;
    let score = 0;
    let selectedClues = [];
    let selectedResponse = null;
    const correctClues = cfg.dialog.correctClues || [];
    const correctResponse = cfg.dialog.correctResponse;

    const clueCards = mount.querySelectorAll('.clue-card');
    const responseOptions = mount.querySelectorAll('.response-option');
    const scoreDisplay = mount.querySelector('.score-value');
    const checkBtn = mount.querySelector('#check-answers');

    clueCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.clue);
        if(card.classList.contains('selected')){
          card.classList.remove('selected');
          selectedClues = selectedClues.filter(x => x !== id);
        } else {
          card.classList.add('selected');
          selectedClues.push(id);
        }
      });
    });

    responseOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        responseOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedResponse = parseInt(opt.dataset.option);
      });
    });

    checkBtn.addEventListener('click', async () => {
      let cluesCorrect = true;
      clueCards.forEach(card => card.classList.remove('correct','incorrect'));
      responseOptions.forEach(opt => opt.classList.remove('correct','incorrect','selected'));

      clueCards.forEach(card => {
        const id = parseInt(card.dataset.clue);
        const shouldBe = correctClues.includes(id);
        const isSelected = selectedClues.includes(id);
        if(shouldBe !== isSelected) cluesCorrect = false;
        card.classList.add(shouldBe && isSelected ? 'correct' : 'incorrect');
      });

      const responseCorrect = selectedResponse === correctResponse;
      if(selectedResponse) {
        const el = [...responseOptions].find(o => parseInt(o.dataset.option) === selectedResponse);
        if(el) el.classList.add(responseCorrect ? 'correct' : 'incorrect');
      }
      // show correct option
      const correctEl = [...responseOptions].find(o => parseInt(o.dataset.option) === correctResponse);
      if(correctEl) correctEl.classList.add('correct');

      if(cluesCorrect) score += 30;
      if(responseCorrect) score += 20;
      scoreDisplay.textContent = score;

      checkBtn.disabled = true;

      // show modal
      let title, text;
      if(cluesCorrect && responseCorrect){ title='Отлично!'; text='Вы успешно выявили все признаки мошенничества и правильно отреагировали!'; }
      else if(cluesCorrect){ title='Хорошо, но можно лучше'; text='Вы нашли все улики, но реакция на звонок была неверной.'; }
      else if(responseCorrect){ title='Неплохо'; text='Вы правильно отреагировали, но пропустили улики.'; }
      else { title='Нужно учиться'; text='Изучите подсказки и попробуйте снова!'; }

      this.showMessage(title, `${text}<br>Ваш счёт: <strong>${score}</strong>`, async () => {
        // complete level only if user found both parts (for demo — allow any)
        await this.completeLevel({ levelId: cfg.id, xp: (cluesCorrect && responseCorrect) ? 200 : 100, redirect: `levels.html?topic=moshenichestvo` });
      });
    });
  }
}
