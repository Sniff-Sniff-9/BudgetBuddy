
import('./levels/BaseLevel.js').then(()=>{}).catch(()=>{  });

import { } from './save_system.js';

function getParam(name){
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

const LEVELS = {
  "nakopleniya-level1": {
    id: "nakopleniya-level1",
    type: "budget",
    topic: "nakopleniya",
    title: "Распредели бюджет правильно",
    subtitle: "Оптимизируй расходы и достигни цели!",
    totalIncome: 50000,
    fixedExpenses: 30000,
    goalAmount: 8000,
    categories: [
      { id: "food", label: "Еда", value: 6000, step: 500, icon: "utensils" },
      { id: "fun", label: "Развлечения", value: 5000, step: 500, icon: "gamepad" },
      { id: "clothes", label: "Одежда", value: 3000, step: 500, icon: "tshirt" },
      { id: "savings", label: "Накопления", value: 6000, step: 500, icon: "piggy-bank" }
    ]
  },

  "moshenichestvo-level1": {
    id: "moshenichestvo-level1",
    type: "fraud",
    topic: "moshenichestvo",
    title: "Вычисли мошенников",
    subtitle: "Раскрой обман и защити свои данные!",
    clues: [
      { id: 1, title: "Подозрительный звонок", text: "Получен звонок от сотрудника службы безопасности банка" },
      { id: 2, title: "Неизвестный номер", text: "Незнакомый номер просит подтвердить личные данные" },
      { id: 3, title: "Сомнительный сайт", text: "Сайт запрашивает слишком много личной информации" },
      { id: 4, title: "Сообщение о выигрыше", text: "Пришло сообщение о крупном выигрыше без участия в лотерее" },
      { id: 5, title: "Срочный перевод", text: "Просят срочно перевести деньги под предлогом помощи родственнику" },
      { id: 6, title: "Техподдержка", text: "Звонок от 'техподдержки' с просьбой предоставить доступ к компьютеру" }
    ],
    dialog: {
      lines: [
        { who: "suspect", text: "Здравствуйте, это служба безопасности вашего банка. Мы заметили подозрительную активность на вашем счете. Для защиты средств нам нужно подтвердить ваши данные."},
        { who: "player", text: "Как я могу убедиться, что вы действительно представляете банк?" },
        { who: "suspect", text: "Мы можем отправить вам код подтверждения, просто сообщите нам последние 4 цифры вашей карты и код из СМС." }
      ],
      options: [
        { id: 1, text: "Предоставить запрошенные данные для безопасности" },
        { id: 2, text: "Поблагодарить и положить трубку, затем позвонить в банк по официальному номеру" },
        { id: 3, text: "Спросить больше информации о 'подозрительной активности'" }
      ],
      correctClues: [1,2],
      correctResponse: 2
    }
  },

  "bezopasnost-level1": {
  id: "bezopasnost-level1",
  type: "security",
  title: "Защити свои финансы",
  subtitle: "Принимай быстрые решения, чтобы обезопасить средства!",
  levelLabel: "Уровень 1",
  topic: "bezopasnost",
  hintText: "Настоящий сотрудник банка никогда не попросит вас назвать CVV код или PIN-код карты. Будьте внимательны и проверяйте источники!",
  
  
  questions: [
    {
      id: 1,
      situation: "Звонок из 'банка' с просьбой назвать CVV код",
      options: [
        "Назвать код",
        "Положить трубку",
        "Перезвонить в банк"
      ],
      correctAnswer: 2,
      hint: "Настоящий сотрудник банка никогда не попросит вас назвать CVV код или PIN-код карты. Это конфиденциальная информация."
    },
    {
      id: 2,
      situation: "Пришло SMS с ссылкой для подтверждения операции, которую вы не совершали",
      options: [
        "Перейти по ссылке и отменить операцию",
        "Удалить сообщение",
        "Позвонить в банк по официальному номеру"
      ],
      correctAnswer: 2,
      hint: "Мошенники часто рассылают фишинговые ссылки. Не переходите по подозрительным ссылкам в SMS."
    },
    {
      id: 3,
      situation: "На сайте, похожем на банковский, просят ввести PIN-код от карты",
      options: [
        "Ввести PIN",
        "Закрыть сайт",
        "Сообщить в банк о мошенничестве"
      ],
      correctAnswer: 2,
      hint: "Всегда проверяйте адрес сайта банка. Фишинговые сайты могут выглядеть очень похоже на настоящие."
    },
    {
      id: 4,
      situation: "Незнакомец просит помочь перевести деньги через банкомат, обещая вознаграждение",
      options: [
        "Помочь за вознаграждение",
        "Вежливо отказаться",
        "Сообщить в полицию"
      ],
      correctAnswer: 2,
      hint: "Такие предложения часто связаны с отмыванием денег или мошенничеством. Не участвуйте в сомнительных операциях."
    },
    {
      id: 5,
      situation: "Предложение в соцсетях о быстром кредите под очень низкий процент",
      options: [
        "Оформить кредит",
        "Игнорировать",
        "Проверить информацию о компании в официальных источниках"
      ],
      correctAnswer: 2,
      hint: "Финансовые услуги стоит получать только у лицензированных организаций. Проверяйте информацию на сайте ЦБ РФ."
    },
    {
      id: 6,
      situation: "Вам предлагают инвестировать в проект с гарантированной высокой доходностью",
      options: [
        "Вложить деньги",
        "Обратиться за консультацией",
        "Игнорировать предложение"
      ],
      correctAnswer: 2,
      hint: "Высокая доходность всегда связана с высоким риском. Финансовые пирамиды часто обещают гарантированную прибыль."
    },
    {
      id: 7,
      situation: "При оплате онлайн кассир просит продиктовать код из SMS для 'подтверждения'",
      options: [
        "Продиктовать код",
        "Отказаться и завершить операцию",
        "Попросить альтернативный способ подтверждения"
      ],
      correctAnswer: 2,
      hint: "Код из SMS — это конфиденциальная информация для подтверждения операций. Никогда не сообщайте его посторонним."
    },
    {
      id: 8,
      situation: "Вам пришло письмо с просьбой обновить данные банковской карты по ссылке",
      options: [
        "Перейти по ссылке и обновить данные",
        "Удалить письмо",
        "Позвонить в банк для проверки"
      ],
      correctAnswer: 2,
      hint: "Банки никогда не рассылают письма с просьбой обновить данные по ссылке. Это распространенная фишинговая атака."
    },
    {
      id: 9,
      situation: "На улице предлагают оформить кредитную карту 'без проверок' по паспорту",
      options: [
        "Оформить карту",
        "Отказаться",
        "Порекомендовать друзьям"
      ],
      correctAnswer: 2,
      hint: "Оформление финансовых продуктов требует тщательной проверки. Предложения 'без проверок' часто являются мошенничеством."
    },
    {
      id: 10,
      situation: "Приложение на телефоне запрашивает доступ к SMS и контактам для 'безопасности'",
      options: [
        "Предоставить доступ",
        "Отказать в доступе",
        "Удалить приложение"
      ],
      correctAnswer: 2,
      hint: "Банковские приложения редко запрашивают доступ к SMS и контактам. Это может быть признаком мошеннического приложения."
    }
  ]
}

};


async function loadLevelModule(type){
  if(type === 'budget'){
    return import('./levels/BudgetLevel.js');
  } else if(type === 'fraud'){
    return import('./levels/FraudLevel.js');
  } else if(type === 'security'){  
    return import('./levels/SecurityLevel.js');
  } else {
    throw new Error('Unknown level type: ' + type);
  }
}

function loadLevelStyles(levelType) {
  
  const prevLink = document.getElementById('level-css');
  if (prevLink) prevLink.remove();

 
  const link = document.createElement('link');
  link.id = 'level-css';
  link.rel = 'stylesheet';
  link.type = 'text/css';

  if (levelType === 'fraud') {
    link.href = './styles/moshenichestvo_level1_style.css'; 
  } else if (levelType === 'budget') {
    link.href = './styles/nakopleniya_level1.css'; 
  } else if (levelType === 'security') {
    link.href = './styles/bezopasnost_level1_style.css'; 
  }

  document.head.appendChild(link);
}

function renderShell(config){
  const shell = document.getElementById('level-shell');
  shell.innerHTML = `
    <div class="header">
      <div class="exit-button"><i class="fas fa-arrow-left"></i> Выйти</div>

      <h1>${config.title}</h1>
      <p>${config.subtitle || ''}</p>

      <div class="hint-wrapper">
      <div class="hint-indicator">
        <i class="fas fa-lightbulb"></i> Подсказка
      </div>
      <div class="hint-popup" id="hintPopup">Подсказки появятся здесь.</div>
      </div>

      <div class="level-indicator">${config.levelLabel || 'Уровень 1'}</div>
    </div>

    <div class="level-body" id="levelBody"></div>
  `;

  
  const hintIndicator = shell.querySelector('.hint-indicator');
  const hintPopup = shell.querySelector('.hint-popup');
  hintIndicator.addEventListener('click', (e) => {
    e.stopPropagation();
    hintPopup.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    
    if (!hintIndicator.contains(e.target) && !hintPopup.contains(e.target)) {
      hintPopup.classList.remove('show');
    }
  });

  
  const exitBtn = shell.querySelector('.exit-button');
  exitBtn.addEventListener('click', () => {
    if (confirm('Выйти из уровня? Прогресс не будет сохранен.')) {
      const topic = config.topic || '';
      window.location.href = `levels.html${topic ? ('?topic=' + encodeURIComponent(topic)) : ''}`;
    }
  });

  
  if (config.hintText) {
    hintPopup.innerHTML = config.hintText;
  }
}

(async function(){
  const levelParam = getParam('level') || 'nakopleniya-level1';
  const config = LEVELS[levelParam];

  if(!config){
    document.getElementById('level-shell').innerHTML = `<div style="padding:20px">Level not found: ${levelParam}</div>`;
    return;
  }

  loadLevelStyles(config.type);
  renderShell(config);

  const module = await loadLevelModule(config.type);
  const LevelClass = module.default;
  const levelInstance = new LevelClass(config, {
    mountPoint: document.getElementById('levelBody'),
    shellRoot: document.getElementById('level-shell')
  });

  await levelInstance.start();
})();
