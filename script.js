/* ============================================
   SAGRADA ESTRATÉGIA — Briefing Wizard
   script.js
   ============================================ */

'use strict';

// ─────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────

const state = {
  currentScreen: 0,    // 0 = hero, 1..N = etapas, N+1 = final, N+2 = obrigado
  answers: {},         // { fieldName: value }
  totalSteps: 0,       // será definido após render
};

// ─────────────────────────────────────────────
// DEFINIÇÃO DAS ETAPAS
// Cada "etapa" tem um capítulo e uma lista de campos.
// Tipos: 'text' | 'textarea' | 'radio' | 'checkbox'
// ─────────────────────────────────────────────

const steps = [

  // ── ETAPA 1: O NEGÓCIO ──
  {
    chapter: 'Etapa 01 — O Negócio',
    title: 'Vamos começar <em>pelo começo</em>.',
    description: 'Quanto mais honesta for sua resposta, mais precisa será a estratégia.',
    fields: [
      {
        name: 'nome_negocio',
        label: 'Nome do seu negócio',
        type: 'text',
        placeholder: 'Ex: Studio Renata Freitas',
        required: true,
      },
      {
        name: 'o_que_faz',
        label: 'O que você faz — descreva sem filtro',
        type: 'textarea',
        placeholder: 'Descreva seu trabalho, público, e como transforma a vida das pessoas...',
        required: true,
      },
      {
        name: 'tempo_atuacao',
        label: 'Tempo de atuação',
        type: 'radio',
        options: [
          'Menos de 1 ano',
          'De 1 a 3 anos',
          'De 3 a 5 anos',
          'Mais de 5 anos',
        ],
        required: true,
      },
      {
        name: 'onde_atende',
        label: 'Onde você atende',
        type: 'radio',
        options: [
          'Presencialmente',
          'Online',
          'Híbrido',
          'Ainda estou definindo',
        ],
        required: true,
      },
    ],
  },

  // ── ETAPA 2: CLIENTE ──
  {
    chapter: 'Etapa 02 — O Cliente',
    title: 'Quem você <em>realmente</em> atende?',
    description: 'Estratégia sem clareza de cliente é tiro no escuro. Seja específico.',
    fields: [
      {
        name: 'quem_compra',
        label: 'Quem mais compra de você — descreva esse perfil',
        type: 'textarea',
        placeholder: 'Gênero, faixa etária, profissão, momento de vida, dores mais comuns...',
        required: true,
      },
      {
        name: 'maior_problema_cliente',
        label: 'Qual é o maior problema que seu cliente tenta resolver ao te contratar?',
        type: 'textarea',
        placeholder: 'Pense em como eles descrevem o problema — nas palavras deles...',
        required: true,
      },
      {
        name: 'onde_te_encontra',
        label: 'Onde seu cliente te encontra hoje',
        type: 'checkbox',
        options: [
          'Instagram',
          'Google / SEO',
          'Indicação',
          'WhatsApp',
          'LinkedIn',
          'TikTok',
          'Site / Blog',
          'Outros',
        ],
        required: true,
      },
    ],
  },

  // ── ETAPA 3: ENTREGA ──
  {
    chapter: 'Etapa 03 — A Entrega',
    title: 'O que você <em>transforma</em>?',
    description: 'Seu cliente não compra o processo. Ele compra o resultado.',
    fields: [
      {
        name: 'transformacao',
        label: 'Qual transformação concreta você entrega?',
        type: 'textarea',
        placeholder: 'Antes e depois. Onde o cliente chega depois do seu trabalho?',
        required: true,
      },
      {
        name: 'diferencial',
        label: 'Qual é o seu maior diferencial — o que ninguém mais faz como você?',
        type: 'textarea',
        placeholder: 'Pode ser método, experiência, personalidade, abordagem...',
        required: true,
      },
      {
        name: 'tempo_resultado',
        label: 'Em quanto tempo o cliente começa a ver resultado?',
        type: 'radio',
        options: [
          'Na mesma sessão / encontro',
          'Em dias',
          'Em semanas',
          'Em meses',
        ],
        required: true,
      },
    ],
  },

  // ── ETAPA 4: AUTORIDADE ──
  {
    chapter: 'Etapa 04 — Autoridade',
    title: 'Sua história é <em>seu ativo</em>.',
    description: 'Pessoas compram de quem confiam. O que faz de você a escolha certa?',
    fields: [
      {
        name: 'sua_historia',
        label: 'O que te trouxe até aqui? Sua história em poucas linhas',
        type: 'textarea',
        placeholder: 'Formação, trajetória, por que escolheu essa área, o que te move...',
        required: true,
      },
      {
        name: 'caso_marcante',
        label: 'Descreva um caso ou resultado que te orgulha muito',
        type: 'textarea',
        placeholder: 'Pode ser um cliente, um momento, uma conquista...',
        required: false,
      },
      {
        name: 'provas',
        label: 'Que tipo de prova social você tem',
        type: 'checkbox',
        options: [
          'Depoimentos em vídeo',
          'Depoimentos escritos',
          'Prints de resultados',
          'Antes e depois',
          'Certificações / diplomas',
          'Menções na mídia',
          'Ainda estou construindo',
        ],
        required: false,
      },
    ],
  },

  // ── ETAPA 5: OBJEÇÕES ──
  {
    chapter: 'Etapa 05 — Objeções',
    title: 'O que <em>impede</em> a venda?',
    description: 'Entender as resistências é o mapa para quebrá-las.',
    fields: [
      {
        name: 'duvidas_comuns',
        label: 'Quais são as dúvidas mais comuns antes de contratar você?',
        type: 'textarea',
        placeholder: 'Ex: "Vai funcionar pra mim?", "É muito caro", "Não tenho tempo"...',
        required: true,
      },
      {
        name: 'crencas_erradas',
        label: 'Que crença errada o cliente tem sobre o que você faz?',
        type: 'textarea',
        placeholder: 'O que eles pensam que é diferente da realidade?',
        required: false,
      },
      {
        name: 'medos',
        label: 'Qual é o maior medo do seu cliente ao te contratar?',
        type: 'textarea',
        placeholder: 'Medo de não ter resultado, de gastar à toa, de ser julgado...',
        required: false,
      },
    ],
  },

  // ── ETAPA 6: PRESENÇA ──
  {
    chapter: 'Etapa 06 — Presença Digital',
    title: 'Onde você quer <em>aparecer</em>?',
    description: 'Estratégia de conteúdo começa pela consistência, não pela quantidade.',
    fields: [
      {
        name: 'onde_quer_aparecer',
        label: 'Onde você quer construir presença',
        type: 'checkbox',
        options: [
          'Instagram',
          'LinkedIn',
          'TikTok',
          'YouTube',
          'WhatsApp / Newsletter',
          'Blog / SEO',
          'Podcasts',
        ],
        required: true,
      },
      {
        name: 'frequencia_conteudo',
        label: 'Frequência de conteúdo que consegue manter',
        type: 'radio',
        options: [
          '1x por semana',
          '2 a 3x por semana',
          'Diariamente',
          'Ainda não sei',
        ],
        required: true,
      },
      {
        name: 'facilidade_conteudo',
        label: 'O que você tem mais facilidade em produzir',
        type: 'radio',
        options: [
          'Escrever textos',
          'Gravar vídeos',
          'Aparecer nos stories',
          'Criar carrosséis',
        ],
        required: false,
      },
      {
        name: 'objetivo_conteudo',
        label: 'Principal objetivo do conteúdo',
        type: 'radio',
        options: [
          'Atrair novos seguidores',
          'Converter seguidores em clientes',
          'Construir autoridade',
          'Nutrir quem já me segue',
        ],
        required: true,
      },
    ],
  },

  // ── ETAPA 7: OBJETIVO FINAL ──
  {
    chapter: 'Etapa 07 — Objetivos',
    title: 'O que você quer <em>construir</em>?',
    description: 'Agora a parte mais importante: onde você quer chegar.',
    fields: [
      {
        name: 'meta_90_dias',
        label: 'Qual é a sua meta nos próximos 90 dias?',
        type: 'textarea',
        placeholder: 'Seja específico: faturamento, número de clientes, lançamento...',
        required: true,
      },
      {
        name: 'maior_desafio',
        label: 'Qual é o seu maior desafio hoje para crescer?',
        type: 'textarea',
        placeholder: 'O que está travando você? Seja honesto.',
        required: true,
      },
      {
        name: 'verba_trafego',
        label: 'Você tem verba para tráfego pago?',
        type: 'radio',
        options: [
          'Não tenho verba agora',
          'Até R$ 500/mês',
          'Entre R$ 500 e R$ 2.000/mês',
          'Acima de R$ 2.000/mês',
        ],
        required: true,
      },
      {
        name: 'campo_aberto',
        label: 'Tem mais alguma coisa que eu preciso saber?',
        type: 'textarea',
        placeholder: 'Contexto, expectativa, dúvida, recado... espaço livre.',
        required: false,
      },
    ],
  },

];

// ─────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  state.totalSteps = steps.length;
  renderDynamicScreens();
  bindHeroButton();
  updateProgressBar();
});

// ─────────────────────────────────────────────
// RENDER: GERA TODAS AS ETAPAS NO DOM
// ─────────────────────────────────────────────

function renderDynamicScreens() {
  const container = document.getElementById('dynamicScreens');

  steps.forEach((step, stepIndex) => {
    const screenNumber = stepIndex + 1; // 1-based
    const section = document.createElement('section');
    section.className = 'screen';
    section.id = `screen-${screenNumber}`;
    section.dataset.screen = screenNumber;

    let fieldsHTML = '';
    step.fields.forEach(field => {
      fieldsHTML += renderField(field, stepIndex);
    });

    section.innerHTML = `
      <div class="q-screen">
        <div class="q-chapter">${step.chapter}</div>
        <h2 class="q-title">${step.title}</h2>
        <p class="q-description">${step.description}</p>
        <div class="fields-container">
          ${fieldsHTML}
        </div>
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

  // Bind events after render
  bindStepButtons();
  bindOptionItems();
  bindInputs();
}

// ─────────────────────────────────────────────
// RENDER: CAMPO INDIVIDUAL
// ─────────────────────────────────────────────

function renderField(field, stepIndex) {
  if (field.type === 'text') {
    return `
      <div class="field-wrap">
        <label class="field-label" for="${field.name}">${field.label}${field.required ? '' : ' <span style="opacity:.4;font-size:10px">(opcional)</span>'}</label>
        <input
          type="text"
          id="${field.name}"
          name="${field.name}"
          placeholder="${field.placeholder || ''}"
          data-step="${stepIndex}"
          data-required="${field.required}"
          autocomplete="off"
        />
      </div>
    `;
  }

  if (field.type === 'textarea') {
    return `
      <div class="field-wrap">
        <label class="field-label" for="${field.name}">${field.label}${field.required ? '' : ' <span style="opacity:.4;font-size:10px">(opcional)</span>'}</label>
        <textarea
          id="${field.name}"
          name="${field.name}"
          placeholder="${field.placeholder || ''}"
          data-step="${stepIndex}"
          data-required="${field.required}"
          rows="3"
        ></textarea>
      </div>
    `;
  }

  if (field.type === 'radio') {
    const optionsHTML = field.options.map(opt => `
      <label class="option-item" data-field="${field.name}" data-value="${opt}" data-type="radio">
        <input type="radio" name="${field.name}" value="${opt}" />
        <span class="option-mark"></span>
        <span class="option-text">${opt}</span>
      </label>
    `).join('');

    const isTwoCol = field.options.length >= 4;
    return `
      <div class="field-wrap">
        <div class="field-label">${field.label}${field.required ? '' : ' <span style="opacity:.4;font-size:10px">(opcional)</span>'}</div>
        <div class="options-grid${isTwoCol ? ' cols-2' : ''}" data-field="${field.name}" data-required="${field.required}" data-step="${stepIndex}">
          ${optionsHTML}
        </div>
      </div>
    `;
  }

  if (field.type === 'checkbox') {
    const optionsHTML = field.options.map(opt => `
      <label class="option-item" data-field="${field.name}" data-value="${opt}" data-type="checkbox">
        <input type="checkbox" name="${field.name}" value="${opt}" />
        <span class="option-mark-sq"></span>
        <span class="option-text">${opt}</span>
      </label>
    `).join('');

    return `
      <div class="field-wrap">
        <div class="field-label">${field.label}${field.required ? '' : ' <span style="opacity:.4;font-size:10px">(opcional)</span>'}</div>
        <div class="options-grid cols-2" data-field="${field.name}" data-required="${field.required}" data-step="${stepIndex}">
          ${optionsHTML}
        </div>
      </div>
    `;
  }

  return '';
}

// ─────────────────────────────────────────────
// BIND: BOTÃO HERO
// ─────────────────────────────────────────────

function bindHeroButton() {
  document.getElementById('btnStart').addEventListener('click', () => {
    navigateTo(1);
  });
}

// ─────────────────────────────────────────────
// BIND: BOTÕES DE ETAPA (next / back)
// ─────────────────────────────────────────────

function bindStepButtons() {
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepIndex = parseInt(btn.dataset.next);
      if (!validateStep(stepIndex)) return;
      collectStepAnswers(stepIndex);

      const isLast = stepIndex === steps.length - 1;
      if (isLast) {
        navigateTo('final');
      } else {
        navigateTo(stepIndex + 2); // +1 for zero-based, +1 for hero offset
      }
    });
  });

  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepIndex = parseInt(btn.dataset.back);
      const prevScreen = stepIndex === 0 ? 0 : stepIndex; // stepIndex 0 → go back to hero (screen 0)
      navigateTo(prevScreen);
    });
  });

  document.getElementById('btnFinal').addEventListener('click', () => {
    submitBriefing();
    navigateTo('obrigado');
  });
}

// ─────────────────────────────────────────────
// BIND: OPTION ITEMS (radio + checkbox)
// ─────────────────────────────────────────────

function bindOptionItems() {
  document.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', () => {
      const fieldName = item.dataset.field;
      const type = item.dataset.type;

      if (type === 'radio') {
        // Deselect all in same field
        document.querySelectorAll(`.option-item[data-field="${fieldName}"]`).forEach(el => {
          el.classList.remove('selected');
          el.querySelector('input').checked = false;
        });
        item.classList.add('selected');
        item.querySelector('input').checked = true;
      }

      if (type === 'checkbox') {
        item.classList.toggle('selected');
        const input = item.querySelector('input');
        input.checked = !input.checked;
      }
    });
  });
}

// ─────────────────────────────────────────────
// BIND: INPUTS (live save on blur)
// ─────────────────────────────────────────────

function bindInputs() {
  document.querySelectorAll('input[type="text"], textarea').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        state.answers[input.name] = input.value.trim();
      }
    });
  });
}

// ─────────────────────────────────────────────
// VALIDAÇÃO: checa campos obrigatórios
// ─────────────────────────────────────────────

function validateStep(stepIndex) {
  const step = steps[stepIndex];
  let valid = true;

  step.fields.forEach(field => {
    if (!field.required) return;

    if (field.type === 'text' || field.type === 'textarea') {
      const el = document.getElementById(field.name);
      if (!el || el.value.trim() === '') {
        valid = false;
        el && el.classList.add('invalid');
      } else {
        el.classList.remove('invalid');
      }
    }

    if (field.type === 'radio') {
      const selected = document.querySelector(`.option-item[data-field="${field.name}"].selected`);
      if (!selected) valid = false;
    }

    if (field.type === 'checkbox') {
      const grid = document.querySelector(`.options-grid[data-field="${field.name}"]`);
      if (!grid) return;
      const req = grid.dataset.required === 'true';
      if (!req) return;
      const anySelected = grid.querySelector('.option-item.selected');
      if (!anySelected) valid = false;
    }
  });

  const errorEl = document.getElementById(`error-${stepIndex}`);
  if (errorEl) {
    if (!valid) {
      errorEl.classList.add('visible');
      setTimeout(() => errorEl.classList.remove('visible'), 3000);
    } else {
      errorEl.classList.remove('visible');
    }
  }

  return valid;
}

// ─────────────────────────────────────────────
// COLETA: salva respostas do step no state
// ─────────────────────────────────────────────

function collectStepAnswers(stepIndex) {
  const step = steps[stepIndex];

  step.fields.forEach(field => {
    if (field.type === 'text' || field.type === 'textarea') {
      const el = document.getElementById(field.name);
      if (el) state.answers[field.name] = el.value.trim();
    }

    if (field.type === 'radio') {
      const selected = document.querySelector(`.option-item[data-field="${field.name}"].selected`);
      if (selected) state.answers[field.name] = selected.dataset.value;
    }

    if (field.type === 'checkbox') {
      const selectedItems = document.querySelectorAll(`.option-item[data-field="${field.name}"].selected`);
      state.answers[field.name] = Array.from(selectedItems).map(el => el.dataset.value);
    }
  });

  // Persist to localStorage
  try {
    localStorage.setItem('sagrada_briefing', JSON.stringify(state.answers));
  } catch(e) {}
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO: troca de tela com animação
// ─────────────────────────────────────────────

function navigateTo(target) {
  // Resolve current screen ID
  const currentId = resolveScreenId(state.currentScreen);
  const currentEl = document.getElementById(currentId);

  // Animate out
  if (currentEl) {
    currentEl.classList.remove('active');
    currentEl.classList.add('exit');
    setTimeout(() => currentEl.classList.remove('exit'), 600);
  }

  // Update state
  state.currentScreen = target;

  // Resolve next screen ID
  const nextId = resolveScreenId(target);
  const nextEl = document.getElementById(nextId);

  if (nextEl) {
    setTimeout(() => {
      nextEl.classList.add('active');
      updateProgressBar();
      updateLogoAndProgress();
      // Scroll to top on mobile
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
  const wrap    = document.getElementById('progressWrap');
  const fill    = document.getElementById('progressFill');
  const label   = document.getElementById('progressLabel');
  const current = state.currentScreen;

  if (current === 0 || current === 'obrigado') {
    wrap.classList.remove('visible');
    return;
  }

  wrap.classList.add('visible');

  let pct = 0;
  let labelText = '';

  if (current === 'final') {
    pct = 100;
    labelText = 'Concluído';
  } else {
    pct = Math.round((current / state.totalSteps) * 100);
    labelText = `${current} de ${state.totalSteps}`;
  }

  fill.style.width = `${pct}%`;
  label.textContent = labelText;
}

function updateLogoAndProgress() {
  const logo = document.getElementById('logoMark');
  const current = state.currentScreen;
  if (current === 0 || current === 'obrigado') {
    logo.classList.remove('visible');
  } else {
    logo.classList.add('visible');
  }
}

// ─────────────────────────────────────────────
// ENVIO / SUBMISSÃO
// ─────────────────────────────────────────────

function submitBriefing() {
  // Log estruturado
  console.group('📋 SAGRADA ESTRATÉGIA — Briefing Completo');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Respostas:', state.answers);
  console.groupEnd();

  // Estrutura pronta para webhook / API
  const payload = {
    timestamp: new Date().toISOString(),
    source: 'sagrada-estrategia-briefing',
    version: '1.0',
    data: state.answers,
  };

  // Salva definitivo no localStorage
  try {
    localStorage.setItem('sagrada_briefing_final', JSON.stringify(payload));
    localStorage.setItem('sagrada_briefing_submitted', 'true');
  } catch(e) {}

  /*
   * INTEGRAÇÃO FUTURA — descomente e ajuste conforme necessário:
   *
   * fetch('https://seu-webhook.com/briefing', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(payload),
   * });
   */

  return payload;
}
