// BudgetLevel.js
import BaseLevel from './BaseLevel.js';
export default class BudgetLevel extends BaseLevel {
  constructor(config, opts){ super(config, opts); }

  render(){
    const cfg = this.config;
    // создаём DOM на основе конфигурации (взято из вашего HTML)
    const html = document.createElement('div');
    html.innerHTML = `
      <div class="stats-container">
        <div class="stat-card"><i class="fas fa-wallet"></i><div class="stat-value">${cfg.totalIncome.toLocaleString()} ₽</div><div class="stat-label">Месячный доход</div></div>
        <div class="stat-card"><i class="fas fa-file-invoice"></i><div class="stat-value">${cfg.fixedExpenses.toLocaleString()} ₽</div><div class="stat-label">Обязательные расходы</div></div>
        <div class="stat-card"><i class="fas fa-coins"></i><div class="stat-value">${(cfg.totalIncome-cfg.fixedExpenses).toLocaleString()} ₽</div><div class="stat-label">Доступно для распределения</div></div>
      </div>

      <div class="goal-container">
        <div class="goal-header"><div class="goal-title">Цель уровня:</div><div class="goal-amount">${cfg.goalAmount.toLocaleString()} ₽</div></div>
        <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
      </div>

      <div class="budget-section">
        <div class="section-title"><i class="fas fa-chart-pie"></i>Распределите оставшиеся средства</div>
        <div class="budget-cards" id="budgetCards"></div>
      </div>

      <div class="remaining-section"><div class="remaining-label">Осталось распределить:</div><div class="remaining-amount" id="remainingAmount">0 ₽</div></div>

      <div class="action-buttons">
        <button class="action-btn submit-btn" id="submitBtn">Проверить решение</button>
      </div>
    `;
    this.mount.innerHTML = '';
    this.mount.appendChild(html);
    // fill hint
    this.setHint('Распределите все доступные средства так, чтобы накопления достигали цели.');
  }

  bind(){
    const cfg = this.config;
    const mount = this.mount;
    const available = cfg.totalIncome - cfg.fixedExpenses;

    // helper: format/calc
    const format = v => (parseInt(v)||0).toLocaleString('ru-RU') + ' ₽';
    const getRemaining = () => {
      let sum = 0;
      cfg.categories.forEach(c => {
        const el = mount.querySelector(`#input-${c.id}`);
        sum += parseInt(el.value || 0);
      });
      return available - sum;
    };

    // render category cards
    const cardsRoot = mount.querySelector('#budgetCards');
    cardsRoot.innerHTML = '';
    cfg.categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <div class="budget-header">
          <div class="budget-name">${cat.label}</div>
          <div class="budget-icon"><i class="fas fa-${cat.icon}"></i></div>
        </div>
        <div class="budget-amount" id="amount-${cat.id}">${format(cat.value)}</div>
        <div class="budget-controls">
          <button class="budget-btn minus" data-id="${cat.id}">-</button>
          <input class="budget-input" id="input-${cat.id}" value="${cat.value}">
          <button class="budget-btn plus" data-id="${cat.id}">+</button>
        </div>
      `;
      cardsRoot.appendChild(card);
    });

    const updateUI = () => {
      cfg.categories.forEach(cat => {
        const input = mount.querySelector(`#input-${cat.id}`);
        const amountEl = mount.querySelector(`#amount-${cat.id}`);
        amountEl.textContent = format(input.value);
      });
      const remaining = getRemaining();
      const remEl = mount.querySelector('#remainingAmount');
      remEl.textContent = format(remaining);
      remEl.style.color = remaining === 0 ? 'var(--accent)' : remaining > 0 ? 'var(--accent)' : 'var(--danger)';
      // progress
      const savingsEl = mount.querySelector('#input-savings');
      const save = savingsEl ? parseInt(savingsEl.value || 0) : 0;
      const progress = Math.min((save / cfg.goalAmount) * 100, 100);
      mount.querySelector('#progressFill').style.width = progress + '%';
    };

    // plus/minus handlers
    mount.querySelectorAll('.budget-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const cat = cfg.categories.find(c=>c.id===id);
        const input = mount.querySelector(`#input-${id}`);
        const delta = btn.classList.contains('plus') ? cat.step : -cat.step;
        input.value = Math.max(0, (parseInt(input.value)||0) + delta);
        updateUI();
      });
    });

    // inputs: keep numeric only
    cfg.categories.forEach(cat => {
      const input = mount.querySelector(`#input-${cat.id}`);
      input.addEventListener('input', () => {
        // sanitize
        input.value = input.value.replace(/[^\d]/g,'') || '0';
        updateUI();
      });
    });

    mount.querySelector('#submitBtn').addEventListener('click', async () => {
      const remaining = getRemaining();
      const savings = parseInt((mount.querySelector('#input-savings')||{value:0}).value || 0);
      if(remaining !== 0){
        this.showMessage('Внимание!','Сначала распределите все доступные средства!');
        return;
      }
      if(savings >= cfg.goalAmount){
        this.showMessage('Поздравляем!','Вы достигли цели накоплений!', async () => {
          // завершение уровня — передаём id и редирект
          await this.completeLevel({ levelId: cfg.id, xp: 100, redirect: `levels.html?topic=nakopleniya` });
        });
      } else {
        this.showMessage('Цель не достигнута', `Нужно ещё ${ (cfg.goalAmount - savings).toLocaleString() } ₽. Попробуйте уменьшить траты.`);
      }
    });

    // initial update
    updateUI();
  }
}
