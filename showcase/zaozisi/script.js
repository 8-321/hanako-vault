const rootList = document.getElementById('rootList');
const inkPool = document.getElementById('inkPool');
const ingredientRow = document.getElementById('ingredientRow');
const rippleLayer = document.getElementById('rippleLayer');
const resultChar = document.getElementById('resultChar');
const resultCaption = document.getElementById('resultCaption');
const hintText = document.getElementById('hintText');
const discoveryList = document.getElementById('discoveryList');
const landscape = document.getElementById('landscape');
const resetBtn = document.getElementById('resetBtn');

const initialRoots = [
  { char: '日', name: '太阳' },
  { char: '月', name: '月相' },
  { char: '木', name: '树木' },
  { char: '人', name: '行者' },
  { char: '火', name: '火种' },
  { char: '水', name: '水脉' }
];

const rules = {
  '日+月': {
    char: '明', name: '明', note: '日月相照，万物有光。', scene: 'ming', hint: '「明」已入卷。试试把「木」和「木」合在一起。'
  },
  '木+木': {
    char: '林', name: '林', note: '二木成林，风从其间来。', scene: 'lin', hint: '「林」也可以继续入池。林与木，会生出更深的地方。'
  },
  '木+木+木': {
    char: '森', name: '森', note: '三木成森，万籁在暗处生长。', scene: 'sen', hint: '森已成。拖「人」与「木」，看看人如何在树下停歇。'
  },
  '木+林': {
    char: '森', name: '森', note: '林再得一木，阴翳成森。', scene: 'sen', hint: '森已成。拖「人」与「木」，看看人如何在树下停歇。'
  },
  '人+木': {
    char: '休', name: '休', note: '人倚木下，谓之休。', scene: 'xiu', hint: '休不是停止，是有依靠。再试试两簇火。'
  },
  '火+火': {
    char: '炎', name: '炎', note: '火上加火，热气升腾为炎。', scene: 'yan', hint: '火已明。水与月相遇，会不会成为湖？'
  },
  '月+水': {
    char: '湖', name: '湖', note: '水受月色，静而成湖。', scene: 'hu', hint: '一卷初成。你可以继续试组合，也可以清空墨池重来。'
  }
};

const unlocked = new Map();
const discovered = new Map();
let ingredients = [];
let dragState = null;

function keyOf(items) {
  return items.slice().sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0)).join('+');
}

function init() {
  initialRoots.forEach(addRoot);
  renderDiscoveries();
  bindDrag();
  resetBtn.addEventListener('click', clearPool);

  if (window.gsap) {
    gsap.set(['.root-card', '.panel-shell', '.topbar'], { opacity: 0, y: 18 });
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to('.topbar', { opacity: 1, y: 0, duration: .7 })
      .to('.panel-shell', { opacity: 1, y: 0, duration: .75, stagger: .08 }, '-=.35')
      .to('.root-card', { opacity: 1, y: 0, duration: .5, stagger: .05 }, '-=.38')
      .from('.ink-pool', { opacity: 0, scale: .78, duration: .9, ease: 'back.out(1.7)' }, '-=.55');
  }
}

function addRoot(root) {
  if (unlocked.has(root.char)) return;
  unlocked.set(root.char, root);

  const card = document.createElement('button');
  card.className = 'root-card';
  card.dataset.char = root.char;
  card.dataset.name = root.name || root.char;
  card.innerHTML = `<span class="root-char">${root.char}</span><span class="root-name">${root.name || '字根'}</span>`;
  rootList.appendChild(card);

  if (window.gsap) {
    gsap.fromTo(card, { opacity: 0, scale: .84, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: .48, ease: 'back.out(1.8)' });
  }
}

function bindDrag() {
  rootList.addEventListener('pointerdown', event => {
    const card = event.target.closest('.root-card');
    if (!card) return;
    event.preventDefault();
    startDrag(card, event);
  });

  window.addEventListener('pointermove', event => {
    if (!dragState) return;
    moveGhost(event.clientX, event.clientY);
    const inside = isInsidePool(event.clientX, event.clientY);
    inkPool.classList.toggle('ready', inside);
  });

  window.addEventListener('pointerup', event => {
    if (!dragState) return;
    const inside = isInsidePool(event.clientX, event.clientY);
    const char = dragState.char;
    const ghost = dragState.ghost;
    dragState = null;
    inkPool.classList.remove('ready');

    if (inside) {
      absorbGhost(ghost, char);
    } else {
      dropGhost(ghost);
    }
  });
}

function startDrag(card, event) {
  const char = card.dataset.char;
  const rect = card.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'ghost-card';
  ghost.textContent = char;
  document.body.appendChild(ghost);

  dragState = { char, ghost };
  ghost.style.left = `${rect.left + rect.width / 2 - 39}px`;
  ghost.style.top = `${rect.top + rect.height / 2 - 39}px`;

  if (window.gsap) {
    gsap.fromTo(ghost, { scale: .72, opacity: .4 }, { scale: 1, opacity: 1, duration: .22, ease: 'back.out(2)' });
    gsap.to(card, { scale: .94, duration: .16, yoyo: true, repeat: 1 });
  }
  moveGhost(event.clientX, event.clientY);
}

function moveGhost(x, y) {
  if (!dragState) return;
  dragState.ghost.style.left = `${x - 39}px`;
  dragState.ghost.style.top = `${y - 39}px`;
}

function isInsidePool(x, y) {
  const rect = inkPool.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = rect.width * .42;
  return Math.hypot(x - cx, y - cy) < radius;
}

function absorbGhost(ghost, char) {
  const target = inkPool.getBoundingClientRect();
  const cx = target.left + target.width / 2 - 39;
  const cy = target.top + target.height / 2 - 39;

  const finish = () => {
    ghost.remove();
    addIngredient(char);
    makeRipple();
  };

  if (window.gsap) {
    gsap.to(ghost, { left: cx, top: cy, scale: .42, opacity: 0, duration: .42, ease: 'power3.in', onComplete: finish });
  } else {
    finish();
  }
}

function dropGhost(ghost) {
  if (window.gsap) {
    gsap.to(ghost, { scale: .8, opacity: 0, y: 18, duration: .25, onComplete: () => ghost.remove() });
  } else {
    ghost.remove();
  }
}

function addIngredient(char) {
  ingredients.push(char);
  if (ingredients.length > 3) ingredients = [char];
  renderIngredients();
  tryCombine();
}

function renderIngredients() {
  ingredientRow.innerHTML = ingredients.map(char => `<span class="ingredient-pill">${char}</span>`).join('');
  if (window.gsap) {
    gsap.fromTo('.ingredient-pill', { scale: .7, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: .32, stagger: .05, ease: 'back.out(1.8)' });
  }
}

function tryCombine() {
  const key = keyOf(ingredients);
  const rule = rules[key];
  if (rule) {
    setTimeout(() => reveal(rule), 260);
    return;
  }

  if (ingredients.length >= 2) {
    const possible = Object.keys(rules).some(k => {
      const parts = k.split('+');
      return ingredients.every(item => parts.includes(item)) && parts.length > ingredients.length;
    });

    if (!possible) {
      hintText.textContent = `「${ingredients.join('')}」墨色未合。换一组字根试试。`;
      pulseHint();
      setTimeout(clearPool, 950);
    } else {
      hintText.textContent = '墨色还在酝酿，也许还缺一笔。';
      pulseHint();
    }
  }
}

function reveal(rule) {
  const already = discovered.has(rule.char);
  discovered.set(rule.char, rule);
  addRoot({ char: rule.char, name: rule.name });
  renderDiscoveries();
  resultChar.textContent = rule.char;
  resultCaption.textContent = rule.note;
  hintText.textContent = rule.hint;
  clearPool(false);
  makeRipple(3);
  summonScene(rule.scene);

  if (window.gsap) {
    gsap.killTweensOf([resultChar, resultCaption]);
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(resultChar, { scale: .54, opacity: 0, rotate: -8, filter: 'blur(8px)' }, { scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)', duration: .75, ease: 'back.out(1.7)' })
      .fromTo(resultCaption, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5 }, '-=.35')
      .to(resultChar, { boxShadow: '0 0 0 8px rgba(158,63,47,.08), 0 22px 64px rgba(158,63,47,.22)', duration: .28, yoyo: true, repeat: 1 }, '-=.2');

    if (!already) {
      gsap.fromTo('.discovery-card:first-child', { opacity: 0, y: -12, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .46, ease: 'back.out(1.5)' });
    }
  }
}

function clearPool(animate = true) {
  const oldPills = Array.from(ingredientRow.children);
  ingredients = [];

  if (animate && window.gsap && oldPills.length) {
    gsap.to(oldPills, { opacity: 0, scale: .6, y: 8, duration: .2, stagger: .03, onComplete: () => {
      ingredientRow.innerHTML = '';
    }});
  } else {
    ingredientRow.innerHTML = '';
  }
}

function makeRipple(count = 1) {
  for (let i = 0; i < count; i += 1) {
    const r = document.createElement('span');
    r.className = 'ripple';
    rippleLayer.appendChild(r);
    if (window.gsap) {
      gsap.fromTo(r, { scale: .25, opacity: .8 }, { scale: 5.2, opacity: 0, duration: 1.3, delay: i * .12, ease: 'power2.out', onComplete: () => r.remove() });
    } else {
      setTimeout(() => r.remove(), 1200);
    }
  }
}

function renderDiscoveries() {
  if (!discovered.size) {
    discoveryList.innerHTML = '<div class="discovery-empty">字卷尚空。<br>第一枚字，会从日月相照处醒来。</div>';
    return;
  }

  const cards = Array.from(discovered.values()).reverse().map(item => `
    <article class="discovery-card">
      <span class="big">${item.char}</span>
      <strong>${item.name}</strong>
      <p>${item.note}</p>
    </article>
  `).join('');
  discoveryList.innerHTML = cards;
}

function pulseHint() {
  if (window.gsap) {
    gsap.fromTo('#hintCard', { scale: .985 }, { scale: 1, duration: .3, ease: 'back.out(2)' });
  }
}

function summonScene(scene) {
  const makers = {
    ming: () => [el('sun'), el('moon')],
    lin: () => [el('tree t1'), el('tree t2')],
    sen: () => [el('tree t1'), el('tree t2'), el('tree t3'), el('tree t4')],
    xiu: () => [el('person'), el('tree t3')],
    yan: () => [el('flame f1'), el('flame f2'), el('flame f3')],
    hu: () => [el('lake'), el('moon')]
  };

  const nodes = makers[scene] ? makers[scene]() : [];
  nodes.forEach(node => landscape.appendChild(node));

  if (window.gsap && nodes.length) {
    gsap.fromTo(nodes, { opacity: 0, y: 22, scale: .86, filter: 'blur(8px)' }, { opacity: .95, y: 0, scale: 1, filter: 'blur(0px)', duration: .9, stagger: .1, ease: 'power3.out' });
  } else {
    nodes.forEach(n => n.style.opacity = .95);
  }
}

function el(className) {
  const node = document.createElement('span');
  node.className = `scene-item ${className}`;
  return node;
}

init();
