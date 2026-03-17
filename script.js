/* ============================================
   SAGRADA ESTRATÉGIA — Briefing Wizard
   script.js v2 — com Google Sheets
   ============================================ */

'use strict';

const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzYt7KrbBfmDHwFNkGDF3OD6XUKiwds_6LZ7gSD4BRmtFN9I6iPtP44gjT5lCosNyU/exec';

// ─────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────
const state = {
  currentScreen: 0,
  answers: {},
  totalSteps: 0,
};

// ─────────────────────────────────────────────
// ETAPAS
// ─────────────────────────────────────────────
const steps = [
  {
    chapter: 'Etapa 01 — O Negócio',
    title: 'Vamos começar <em>pelo começo</em>.',
    description: 'Quanto mais honesta for sua resposta, mais precisa será a estratégia.',
    fields: [
      { name: 'nome_negocio', label: 'Nome do seu negócio', type: 'text', placeholder: 'Ex: Studio Renata Freitas', required: true },
      { name: 'o_que_faz', label: 'O que você faz — descreva sem filtro', type: 'textarea', placeholder: 'Descreva seu trabalho, público, e como transforma a vida das pessoas...', required: true },
      { name: 'tempo_atuacao', label: 'Tempo de atuação', type: 'radio', options: ['Menos de 1 ano','De 1 a 3 anos','De 3 a 5 anos','Mais de 5 anos'], required: true },
      { name: 'onde_atende', label: 'Onde você atende', type: 'radio', options: ['Presencialmente','Online','Híbrido','Ainda estou definindo'], required: true },
    ],
  },
  {
    chapter: 'Etapa 02 — O Cliente',
    title: 'Quem você <em>realmente</em> atende?',
    description: 'Estratégia sem clareza de cliente é tiro no escuro. Seja específico.',
    fields: [
      { name: 'quem_compra', label: 'Quem mais compra de você — descreva esse perfil', type: 'textarea', placeholder: 'Gênero, faixa etária, profissão, momento de vida, dores mais comuns...', required: true },
      { name: 'maior_problema_cliente', label: 'Qual é o maior problema que seu cliente tenta resolver ao te contratar?', type: 'textarea', placeholder: 'Pense em como eles descrevem o problema — nas palavras deles...', required: true },
      { name: 'onde_te_encontra', label: 'Onde seu cliente te encontra hoje', type: 'checkbox', options: ['Instagram','Google / SEO','Indicação','WhatsApp','LinkedIn','TikTok','Site / Blog','Outros'], required: true },
    ],
  },
  {
    chapter: 'Etapa 03 — A Entrega',
    title: 'O que você <em>transforma</em>?',
    description: 'Seu cliente não compra o processo. Ele compra o resultado.',
    fields: [
      { name: 'transformacao', label: 'Qual transformação concreta você entrega?', type: 'textarea', placeholder: 'Antes e depois. Onde o cliente chega depois do seu trabalho?', required: true },
      { name: 'diferencial', label: 'Qual é o seu maior diferencial?', type: 'textarea', placeholder: 'Pode ser método, experiência, personalidade, abordagem...', required: true },
      { name: 'tempo_resultado', label: 'Em quanto tempo o cliente começa a ver resultado?', type: 'radio', options: ['Na mesma sessão / encontro','Em dias','Em semanas','Em meses'], required: true },
    ],
  },
  {
    chapter: 'Etapa 04 — Autoridade',
    title: 'Sua história é <em>seu ativo</em>.',
    description: 'Pessoas compram de quem confiam. O que faz de você a escolha certa?',
    fields: [
      { name: 'sua_historia', label: 'O que te trouxe até aqui? Sua história em poucas linhas', type: 'textarea', placeholder: 'Formação, trajetória, por que escolheu essa área, o que te move...', required: true },
      { name: 'caso_marcante', label: 'Descreva um caso ou resultado que te orgulha muito', type: 'textarea', placeholder: 'Pode ser um cliente, um momento, uma conquista...', required: false },
      { name: 'provas', label: 'Que tipo de prova social você tem', type: 'checkbox', options: ['Depoimentos em vídeo','Depoimentos escritos','Prints de resultados','Antes e depois','Certificações / diplomas','Menções na mídia','Ainda estou construindo'], required: false },
    ],
  },
  {
    chapter: 'Etapa 05 — Objeções',
    title: 'O que <em>impede</em> a venda?',
    description: 'Entender as resistências é o mapa para quebrá-las.',
    fields: [
      { name: 'duvidas_comuns', label: 'Quais são as dúvidas mais comuns antes de contratar você?', type: 'textarea', placeholder: 'Ex: "Vai funcionar pra mim?", "É muito caro", "Não tenho tempo"...', required: true },
      { name: 'crencas_erradas', label: 'Que crença errada o cliente tem sobre o que você faz?', type: 'textarea', placeholder: 'O que eles pensam que é diferente da realidade?', required: false },
      { name: 'medos', label: 'Qual é o maior medo do seu cliente ao te contratar?', type: 'textarea', placeholder: 'Medo de não ter resultado, de gastar à toa, de ser julgado...', required: false },
    ],
  },
  {
    chapter: 'Etapa 06 — Presença Digital',
    title: 'Onde você quer <em>aparecer</em>?',
    description: 'Estratégia de conteúdo começa pela consistência, não pela quantidade.',
    fields: [
      { name: 'onde_quer_aparecer', label: 'Onde você quer construir presença', type: 'checkbox', options: ['Instagram','LinkedIn','TikTok','YouTube','WhatsApp / Newsletter','Blog / SEO','Podcasts'], required: true },
      { name: 'frequencia_conteudo', label: 'Frequência de conteúdo que consegue manter', type: 'radio', options: ['1x por semana','2 a 3x por semana','Diariamente','Ainda não sei'], required: true },
      { name: 'facilidade_conteudo', label: 'O que você tem mais facilidade em produzir', type: 'radio', options: ['Escrever textos','Gravar vídeos','Aparecer nos stories','Criar carrosséis'], required: false },
      { name: 'objetivo_conteudo', label: 'Principal objetivo do conteúdo', type: 'radio', options: ['Atrair novos seguidores','Converter seguidores em clientes','Construir autoridade','Nutrir quem já me segue'], required: true },
    ],
  },
  {
    chapter: 'Etapa 07 — Objetivos',
    title: 'O que você quer <em>construir</em>?',
    description: 'Agora a parte mais importante: onde você quer chegar.',
    fields: [
      { name: 'meta_90_dias', label: 'Qual é a sua meta nos próximos 90 dias?', type: 'textarea', placeholder: 'Seja específico: faturamento, número de clientes, lançamento...', required: true },
      { name: 'maior_desafio', label: 'Qual é o seu maior desafio hoje para crescer?', type: 'textarea', placeholder: 'O que está travando você? Seja honesto.', required: true },
      { name: 'verba_trafego', label: 'Você tem verba para tráfego pago?', type: 'radio', options: ['Não tenho verba agora','Até R$ 500/mês','Entre R$ 500 e R$ 2.000/mês','Acima de R$ 2.000/mês'], required: true },
      { name: 'campo_aberto', label: 'Tem mais alguma coisa que eu preciso saber?', type: 'textarea', placeholder: 'Contexto, expectativa, dúvida, recado... espaço livre.', required: false },
    ],
  },
];

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  state.totalSteps = steps.length;
  renderDynamicScreens();
  bindHeroButton();
  updateProgressBar();
});

// ─────────────────────────────────────────────
// RENDER ETAPAS
// ─────────────────────────────────────────────
function renderDynamicScreens() {
  const container = document.getElementById('dynamicScreens');

  steps.forEach((step, stepIndex) => {
    const screenNumber = stepIndex + 1;
    const section = document.createElement('section');
    section.className = 'screen';
    section.id = `screen-${screenNumber}`;
    section.dataset.screen = screenNumber;

    let fieldsHTML = '';
    step.fields.forEach(field => { fieldsHTML += renderField(field); });

    section.innerHTML = `
      <div class="q-screen">
        <div class="q-chapter">${step.chapter}</div>
        <h2 class="q-title">${step.title}</h2>
        <p class="q-description">${step.description}</p>
        <div class="fields-container">${fieldsHTML}</div>
        <p class="error-msg" id="error-${stepIndex}">Por favor, preencha os campos obrigatórios antes de continuar.</p>
        <div class="step-actions">
          <button class="btn-back" data-back="${stepIndex}">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M16 10H4M9 5L4 10l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            Voltar
          </button>
          <button class="btn-next" data-next="${stepIndex}">
            <span>${stepIndex === steps.length - 1 ? 'Concluir' : 'Continuar'}</span>
            <svg class="btn-arrow" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(section);
  });

  bindStepButtons();
  bindOptionItems();
}

// ─────────────────────────────────────────────
// RENDER CAMPO
// ─────────────────────────────────────────────
function renderField(field) {
  const optional = !field.required ? ' <span style="opacity:.4;font-size:10px;font-style:italic">(opcional)</span>' : '';

  if (field.type === 'text') return `
    <div class="field-wrap">
      <label class="field-label" for="${field.name}">${field.label}${optional}</label>
      <input type="text" id="${field.name}" name="${field.name}" placeholder="${field.placeholder||''}" data-required="${field.required}" autocomplete="off"/>
    </div>`;

  if (field.type === 'textarea') return `
    <div class="field-wrap">
      <label class="field-label" for="${field.name}">${field.label}${optional}</label>
      <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder||''}" data-required="${field.required}" rows="3"></textarea>
    </div>`;

  if (field.type === 'radio') {
    const isTwoCol = field.options.length >= 4;
    const opts = field.options.map(opt => `
      <label class="option-item" data-field="${field.name}" data-value="${opt}" data-type="radio">
        <input type="radio" name="${field.name}" value="${opt}"/>
        <span class="option-mark"></span>
        <span class="option-text">${opt}</span>
      </label>`).join('');
    return `
      <div class="field-wrap">
        <div class="field-label">${field.label}${optional}</div>
        <div class="options-grid${isTwoCol ? ' cols-2' : ''}" data-field="${field.name}" data-required="${field.required}">${opts}</div>
      </div>`;
  }

  if (field.type === 'checkbox') {
    const opts = field.options.map(opt => `
      <label class="option-item" data-field="${field.name}" data-value="${opt}" data-type="checkbox">
        <input type="checkbox" name="${field.name}" value="${opt}"/>
        <span class="option-mark-sq"></span>
        <span class="option-text">${opt}</span>
      </label>`).join('');
    return `
      <div class="field-wrap">
        <div class="field-label">${field.label}${optional}</div>
        <div class="options-grid cols-2" data-field="${field.name}" data-required="${field.required}">${opts}</div>
      </div>`;
  }
  return '';
}

// ─────────────────────────────────────────────
// BIND HERO
// ─────────────────────────────────────────────
function bindHeroButton() {
  document.getElementById('btnStart').addEventListener('click', () => navigateTo(1));
}

// ─────────────────────────────────────────────
// BIND BOTÕES DE ETAPA
// ─────────────────────────────────────────────
function bindStepButtons() {
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepIndex = parseInt(btn.dataset.next);
      if (!validateStep(stepIndex)) return;
      collectStepAnswers(stepIndex);
      const isLast = stepIndex === steps.length - 1;
      navigateTo(isLast ? 'final' : stepIndex + 2);
    });
  });

  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepIndex = parseInt(btn.dataset.back);
      navigateTo(stepIndex === 0 ? 0 : stepIndex);
    });
  });

  document.getElementById('btnFinal').addEventListener('click', () => {
    submitBriefing();
    navigateTo('obrigado');
  });
}

// ─────────────────────────────────────────────
// BIND OPTIONS
// ─────────────────────────────────────────────
function bindOptionItems() {
  document.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', () => {
      const fieldName = item.dataset.field;
      const type = item.dataset.type;
      if (type === 'radio') {
        document.querySelectorAll(`.option-item[data-field="${fieldName}"]`).forEach(el => {
          el.classList.remove('selected');
          el.querySelector('input').checked = false;
        });
        item.classList.add('selected');
        item.querySelector('input').checked = true;
      }
      if (type === 'checkbox') {
        item.classList.toggle('selected');
        item.querySelector('input').checked = item.classList.contains('selected');
      }
    });
  });
}

// ─────────────────────────────────────────────
// VALIDAÇÃO
// ─────────────────────────────────────────────
function validateStep(stepIndex) {
  const step = steps[stepIndex];
  let valid = true;

  step.fields.forEach(field => {
    if (!field.required) return;
    if (field.type === 'text' || field.type === 'textarea') {
      const el = document.getElementById(field.name);
      if (!el || !el.value.trim()) { valid = false; }
    }
    if (field.type === 'radio') {
      if (!document.querySelector(`.option-item[data-field="${field.name}"].selected`)) valid = false;
    }
    if (field.type === 'checkbox') {
      const grid = document.querySelector(`.options-grid[data-field="${field.name}"]`);
      if (grid && grid.dataset.required === 'true' && !grid.querySelector('.option-item.selected')) valid = false;
    }
  });

  const errorEl = document.getElementById(`error-${stepIndex}`);
  if (errorEl) {
    if (!valid) { errorEl.classList.add('visible'); setTimeout(() => errorEl.classList.remove('visible'), 3500); }
    else { errorEl.classList.remove('visible'); }
  }
  return valid;
}

// ─────────────────────────────────────────────
// COLETA RESPOSTAS
// ─────────────────────────────────────────────
function collectStepAnswers(stepIndex) {
  const step = steps[stepIndex];
  step.fields.forEach(field => {
    if (field.type === 'text' || field.type === 'textarea') {
      const el = document.getElementById(field.name);
      if (el) state.answers[field.name] = el.value.trim();
    }
    if (field.type === 'radio') {
      const sel = document.querySelector(`.option-item[data-field="${field.name}"].selected`);
      if (sel) state.answers[field.name] = sel.dataset.value;
    }
    if (field.type === 'checkbox') {
      const sels = document.querySelectorAll(`.option-item[data-field="${field.name}"].selected`);
      state.answers[field.name] = Array.from(sels).map(el => el.dataset.value);
    }
  });
  try { localStorage.setItem('sagrada_briefing', JSON.stringify(state.answers)); } catch(e) {}
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────
function navigateTo(target) {
  const currentEl = document.getElementById(resolveScreenId(state.currentScreen));
  if (currentEl) {
    currentEl.classList.remove('active');
    currentEl.classList.add('exit');
    setTimeout(() => currentEl.classList.remove('exit'), 600);
  }
  state.currentScreen = target;
  const nextEl = document.getElementById(resolveScreenId(target));
  if (nextEl) {
    setTimeout(() => {
      nextEl.classList.add('active');
      updateProgressBar();
      updateLogoAndProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 180);
  }
}

function resolveScreenId(target) {
  if (target === 0) return 'screen-0';
  if (target === 'final') return 'screen-final';
  if (target === 'obrigado') return 'screen-obrigado';
  return `screen-${target}`;
}

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────
function updateProgressBar() {
  const wrap = document.getElementById('progressWrap');
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');
  const current = state.currentScreen;

  if (current === 0 || current === 'obrigado') { wrap.classList.remove('visible'); return; }
  wrap.classList.add('visible');

  const pct = current === 'final' ? 100 : Math.round((current / state.totalSteps) * 100);
  const labelText = current === 'final' ? 'Concluído' : `${current} de ${state.totalSteps}`;
  fill.style.width = `${pct}%`;
  label.textContent = labelText;
}

function updateLogoAndProgress() {
  const logo = document.getElementById('logoMark');
  const current = state.currentScreen;
  if (current === 0 || current === 'obrigado') logo.classList.remove('visible');
  else logo.classList.add('visible');
}

// ─────────────────────────────────────────────
// ENVIO — Google Sheets
// ─────────────────────────────────────────────
async function submitBriefing() {
  const payload = {
    timestamp: new Date().toISOString(),
    source: 'sagrada-estrategia-briefing',
    ...state.answers,
  };

  console.log('📋 Briefing enviado:', payload);

  // Salva localmente
  try { localStorage.setItem('sagrada_briefing_final', JSON.stringify(payload)); } catch(e) {}

  // Envia para Google Sheets (só funciona após configurar a URL)
  if (SHEETS_WEBHOOK_URL && SHEETS_WEBHOOK_URL !== 'COLE_SUA_URL_AQUI') {
    try {
      await fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch(err) {
      console.error('Erro ao enviar para Sheets:', err);
    }
  }
}
