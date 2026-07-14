/*
 * =============================================
 *  RELAY — 交互引擎
 *  氛围层 / 导航 / 卡片渲染 / 解密弹窗 / 动效
 * =============================================
 */

(function() {
  'use strict';

  // ===== UTILS =====
  const $ = (sel, ctx) => (ctx||document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx||document).querySelectorAll(sel)];

  // ===== RELAY TRACKING (localStorage) =====
  window.RELAY = window.RELAY || {};

  // 获取接力计数
  window.RELAY.getCount = function(id) {
    return parseInt(localStorage.getItem('rl-c-'+id) || '0');
  };

  // 标记走完一条路径
  window.RELAY.complete = function(id) {
    var c = window.RELAY.getCount(id) + 1;
    localStorage.setItem('rl-c-'+id, c);
    var my = JSON.parse(localStorage.getItem('rl-my') || '[]');
    if (my.indexOf(id) === -1) { my.push(id); localStorage.setItem('rl-my', JSON.stringify(my)); }
    return c;
  };

  // 我走过的路径
  window.RELAY.myPaths = function() {
    return JSON.parse(localStorage.getItem('rl-my') || '[]');
  };

  // 留路标
  window.RELAY.leaveMarker = function(id, text, type) {
    var markers = JSON.parse(localStorage.getItem('rl-m-'+id) || '[]');
    markers.push({text:text, type:type||'tip', date:new Date().toISOString().slice(0,10)});
    localStorage.setItem('rl-m-'+id, JSON.stringify(markers));
    // 我的记录
    var mym = JSON.parse(localStorage.getItem('rl-my-m') || '[]');
    mym.push({templateId:id, text:text, type:type||'tip'});
    localStorage.setItem('rl-my-m', JSON.stringify(mym));
  };

  // 获取某路径的所有路标
  window.RELAY.getMarkers = function(id) {
    return JSON.parse(localStorage.getItem('rl-m-'+id) || '[]');
  };

  // 我留过的所有路标
  window.RELAY.myMarkers = function() {
    return JSON.parse(localStorage.getItem('rl-my-m') || '[]');
  };

  // 获取某路径的完成者列表（限制在本地）
  window.RELAY.getCompleters = function(id) {
    var c = window.RELAY.getCount(id);
    var my = window.RELAY.myPaths();
    var userCompleted = my.indexOf(id) !== -1;
    return { count:c, you:userCompleted };
  };

  // ===== CURRENT PAGE =====
  function currentPageId() {
    const p = location.pathname.split('/').pop() || 'index.html';
    if (p === '' || p === 'index.html') return 'home';
    if (p === 'templates.html') return 'templates';
    if (p === 'resources.html') return 'resources';
    if (p === 'about.html') return 'about';
    if (p === 'my-relay.html') return 'myrelay';
    if (p === 'submit.html') return 'submit';
    if (p === 'showcase.html') return 'showcase';
    return 'home';
  }

  // ===== ATMOSPHERE =====
  function injectAtmosphere() {
    const root = document.createElement('div');
    root.id = 'bg-root';
    root.innerHTML = `
      <div class="bg-fx__grid"></div>
      <div class="bg-fx__glow"></div>
      <div class="bg-fx__scan"></div>
      <div class="bg-fx__grain"></div>
    `;
    document.body.prepend(root);
  }

  // ===== CUSTOM CURSOR =====
  let cursorEl, cursorX=0, cursorY=0, targetX=0, targetY=0;

  function injectCursor() {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    cursorEl = document.createElement('div');
    cursorEl.id = 'custom-cursor';
    document.body.appendChild(cursorEl);

    document.addEventListener('mousemove', function(e) {
      targetX = e.clientX; targetY = e.clientY;
    });

    document.addEventListener('mouseover', function(e) {
      const hot = e.target.closest('a, button, .card, [role="button"], .chip, .star');
      if (hot) cursorEl.classList.add('is-hover');
    });
    document.addEventListener('mouseout', function(e) {
      const hot = e.target.closest('a, button, .card, [role="button"], .chip, .star');
      if (hot) cursorEl.classList.remove('is-hover');
    });

    function tick() {
      cursorX += (targetX - cursorX) * 0.18;
      cursorY += (targetY - cursorY) * 0.18;
      if (cursorEl) {
        cursorEl.style.left = cursorX + 'px';
        cursorEl.style.top = cursorY + 'px';
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ===== NAVIGATION =====
  function injectNav() {
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.id = 'nav-root';
    const cp = currentPageId();
    nav.innerHTML = `
      <div class="nav__inner">
        <a href="index.html" class="nav__sigil">
          <div class="nav__sigil-ring"></div>
          <span class="nav__brand">${window.SITE.brand}</span>
          <span class="nav__id">${window.SITE.id}</span>
        </a>
        <div class="nav__links">
          ${window.NAV_ITEMS.map(n => `
            <a href="${n.href}" class="nav__link ${n.id===cp?'is-active':''}">
              <span class="idx">${n.idx}</span> ${n.label}
            </a>
          `).join('')}
          <a href="templates.html" class="btn--primary">进入档案库 →</a>
        </div>
        <button class="nav__burger" aria-label="菜单">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;
    document.body.prepend(nav);

    // scroll detection
    window.addEventListener('scroll', function() {
      nav.classList.toggle('is-scrolled', window.scrollY > 20);
    });

    // burger (mobile)
    const burger = $('.nav__burger', nav);
    const links = $('.nav__links', nav);
    burger.addEventListener('click', function() {
      const show = links.style.display === 'flex';
      links.style.display = show ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '100%';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(10,10,10,0.95)';
      links.style.padding = '24px';
      links.style.backdropFilter = 'blur(20px)';
      links.style.borderBottom = '1px solid var(--bronze-line)';
    });
  }

  // ===== FOOTER =====
  function injectFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.id = 'footer-root';
    footer.innerHTML = `
      <div class="wrap">
        <div class="footer__grid">
          <div>
            <div class="footer__brand">${window.SITE.name}</div>
            <p class="footer__brand-desc">${window.SITE.tagline}<br>所有模板免费开放。没有注册墙。</p>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">档案库</div>
            <a href="templates.html">全部模板</a>
            <a href="craft.html">匠录</a>
            <a href="showcase.html">展示台</a>
            <a href="submit.html">提交模板</a>
            <a href="index.html">首页</a>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">联系</div>
            <a href="about.html">关于我们</a>
            <a href="#">公众号</a>
            <a href="#">GitHub</a>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">更多</div>
            <a href="resources.html">踩坑记录</a>
            <a href="about.html">理念</a>
          </div>
        </div>
        <div class="footer__glow"></div>
        <div class="footer__status">STATUS: <b>●</b> ONLINE &nbsp;|&nbsp; RELAY v1.0 &nbsp;|&nbsp; 永远免费</div>
      </div>
    `;
    document.body.appendChild(footer);
  }

  // ===== COVER GENERATION =====
  function hashStr(str) {
    let hash = 0;
    for (let i=0; i<str.length; i++) {
      hash = ((hash<<5)-hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  window.coverFor = function(c) {
    const seed = hashStr(c.id + c.title);
    const rand = mulberry32(seed);

    const w=600, h=375;
    const gx = 30 + rand()*70, gy = 10 + rand()*60;
    const nodes = [];
    for (let i=0; i<15; i++) {
      nodes.push({ x:8+rand()*92, y:8+rand()*84 });
    }

    let lines = '';
    for (let i=0; i<nodes.length; i++) {
      for (let j=i+1; j<nodes.length; j++) {
        const dx = (nodes[i].x-nodes[j].x)*w/100;
        const dy = (nodes[i].y-nodes[j].y)*h/100;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 190) {
          lines += `<line x1="${nodes[i].x}%" y1="${nodes[i].y}%" x2="${nodes[j].x}%" y2="${nodes[j].y}%" stroke="rgba(201,169,110,0.28)" stroke-width="0.6"/>`;
        }
      }
    }

    let dots = '';
    nodes.forEach(n => {
      dots += `<circle cx="${n.x}%" cy="${n.y}%" r="2.2" fill="#C9A96E" opacity="0.75"/>`;
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="100%" height="100%" fill="#111113"/>
      <radialGradient id="g">
        <stop offset="0%" stop-color="rgba(201,169,110,0.34)"/>
        <stop offset="100%" stop-color="rgba(201,169,110,0)"/>
      </radialGradient>
      <circle cx="${gx}%" cy="${gy}%" r="60%" fill="url(#g)"/>
      <g opacity="0.6">
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.08"/>
      </g>
      ${lines}
      ${dots}
      <text x="50%" y="${48+(c.glyph?'0':'0')}%" text-anchor="middle" font-family="serif" font-size="200" fill="rgba(201,169,110,0.09)">${c.glyph||'R'}</text>
      <pattern id="scan" width="100%" height="3" patternUnits="userSpaceOnUse">
        <rect width="100%" height="1" fill="rgba(201,169,110,0.04)"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#scan)"/>
      <rect width="100%" height="100%" fill="none" stroke="rgba(201,169,110,0.18)" stroke-width="1.5"/>
    </svg>`;

    return 'url(\'data:image/svg+xml,' + encodeURIComponent(svg) + '\')';
  };

  // ===== CARD HTML =====
  window.cardHTML = function(t) {
    var imgUrl = 'assets/images/card-' + t.id + '.jpg';
    var bgStyle = 'background-image:url(' + imgUrl + '), ' + window.coverFor(t) + ';background-size:cover,cover;background-position:center,center;';
    return `
      <div class="card" tabindex="0" role="button" data-id="${t.id}" onclick="ARCHIVE.openCase('${t.id}')" onkeydown="if(event.key==='Enter')ARCHIVE.openCase('${t.id}')">
        <div class="card__media" style="${bgStyle}">
          <span class="card__tag">${t.direction}</span>
          <span class="media-label">${t.id.startsWith('c')?'CRAFT':'TEMPLATE'} // ${t.id}</span>
          <div class="card__watermark-mask"></div>
        </div>
        <div class="card__body">
          <div class="card__title">${t.title}</div>
          <div class="card__meta">
            <span class="card__chip">${t.type}</span>
            ${t.tags?.slice(0,2).map(tg=>`<span class="card__chip">#${tg}</span>`).join('')||''}
          </div>
          <p class="card__desc">${t.summary}</p>
          <div class="card__foot">
            <span class="card__stars">★ ${t.stars}</span>
            <span class="card__relay-count" data-id="${t.id}">${window.RELAY.getCount(t.id)} 人走过</span>
          </div>
        </div>
      </div>`;
  };

  // 刷新卡片接力数
  window.RELAY.refreshCounts = function() {
    var els = document.querySelectorAll('.card__relay-count');
    els.forEach(function(el) {
      var id = el.dataset.id;
      if (id) el.textContent = window.RELAY.getCount(id) + ' 人走过';
    });
  };

  // ===== DECRYPT SCRAMBLE =====
  function scramble(el, finalText, callback, delay) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/░▒▓█▀▄■□▪▫';
    let iterations = 0;
    const maxIter = 12;
    const totalTime = delay || 600;
    const interval = totalTime / maxIter;

    const timer = setInterval(function() {
      let txt = '';
      for (let i=0; i<finalText.length; i++) {
        if (iterations >= maxIter) {
          txt += finalText[i];
        } else if (i < iterations) {
          txt += finalText[i];
        } else {
          txt += chars[Math.floor(Math.random()*chars.length)];
        }
      }
      el.textContent = txt;
      iterations++;
      if (iterations > maxIter) {
        clearInterval(timer);
        el.textContent = finalText;
        if (callback) callback();
      }
    }, interval);
  }

  // ===== MODAL (Walk Mode + Legacy Archive View) =====
  let modalRoot = null, walkState = null;

  function ensureModal() {
    if (modalRoot) return modalRoot;
    modalRoot = document.createElement('div');
    modalRoot.className = 'modal-root';
    modalRoot.id = 'modal-root';
    modalRoot.innerHTML = `
      <div class="modal-scrim" onclick="ARCHIVE.closeModal()"></div>
      <div class="modal-panel" id="modal-panel">
        <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
      </div>
    `;
    document.body.appendChild(modalRoot);
    return modalRoot;
  }

  // Walk Mode: render one step
  function renderWalkStep(t, stepIdx) {
    const w = t.walkthrough;
    const s = w[stepIdx];
    const total = w.length;
    const prog = ((stepIdx+1)/total*100).toFixed(0);

    let html = `
      <div class="walk-container">
        <div class="walk-progress">
          <div class="walk-progress__bar" style="width:${prog}%"></div>
        </div>
        <div class="walk-steps">
          ${w.map(function(_,i){
            const cls = i<stepIdx?'done':i===stepIdx?'current':'ahead';
            return '<span class="walk-dot '+cls+'">'+(i<stepIdx?'✓':(i+1))+'</span>';
          }).join('')}
        </div>

        <div class="walk-card">
          <div class="walk-card__step">第${stepIdx+1}步 · ${s.time}</div>
          <div class="walk-card__title">${s.title}</div>

          <div class="walk-card__action">
            <span class="walk-card__action-icon">▸</span>
            ${s.action}
          </div>

          ${s.detail ? `
          <details class="walk-detail">
            <summary>展开详细说明</summary>
            <div class="walk-detail__inner">${s.detail}</div>
          </details>` : ''}

          ${s.code ? `
          <div class="walk-code">
            <div class="walk-code__label">⬇ 复制这一段</div>
            <pre onclick="navigator.clipboard.writeText(this.textContent);this.style.borderColor='var(--phosphor)';setTimeout(()=>this.style.borderColor='',1200)">${s.code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
          </div>` : ''}

          ${s.marker ? `
          <div class="walk-marker walk-marker--${s.marker.type}">
            ${s.marker.text}
          </div>` : ''}
        </div>

        <div class="walk-nav">
          <button class="btn--ghost" onclick="ARCHIVE.walkPrev()" ${stepIdx===0?'disabled':''}>← 上一步</button>
          ${stepIdx < total-1 ? `
            <button class="btn--primary" onclick="ARCHIVE.walkNext()">完成 → 下一步</button>
          ` : `
            <button class="btn--primary" onclick="ARCHIVE.walkFinish()">✦ 走完了</button>
          `}
        </div>
      </div>`;
    return html;
  }

  // Walk Mode: certificate
  function renderCertificate(t) {
    const w = t.walkthrough;
    const svg = `data:image/svg+xml,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">'+
      '<rect width="100%" height="100%" fill="#111113"/>'+
      '<circle cx="50%" cy="40%" r="35%" fill="none" stroke="#C9A96E" stroke-width="0.5" opacity="0.2"/>'+
      '<text x="50%" y="42%" text-anchor="middle" font-family="serif" font-size="100" fill="rgba(201,169,110,0.08)">'+t.glyph+'</text>'+
      '<text x="50%" y="75%" text-anchor="middle" font-family="serif" font-size="14" fill="#C9A96E" letter-spacing="4">RELAY CERTIFICATE</text>'+
      '<text x="50%" y="90%" text-anchor="middle" font-family="serif" font-size="10" fill="#756F64" letter-spacing="2">PATH COMPLETED · '+w.length+' STEPS</text>'+
      '<rect width="100%" height="100%" fill="none" stroke="rgba(201,169,110,0.18)" stroke-width="1"/>'+
      '</svg>'
    )}`;

    return `
      <div class="walk-container">
        <div class="walk-cert">
          <div class="walk-cert__img" style="background-image:url('${svg}')"></div>
          <div class="walk-cert__title">你已走通</div>
          <div class="walk-cert__name">${t.title}</div>
          <div class="walk-cert__steps">完成了 ${w.length} 个路段</div>
          <p class="walk-cert__desc" style="font-size:13px;color:var(--ink-soft);margin-top:var(--s-4);text-align:center;line-height:1.8;">
            这条路上已经有 <em style="color:var(--bronze);font-style:normal;">${t.views.toLocaleString()}</em> 人走过。<br>
            现在你也可以把棒交给下一个了。
          </p>
          <div style="margin-top:var(--s-6);display:flex;gap:var(--s-3);justify-content:center;flex-wrap:wrap;">
            <button class="btn--primary" onclick="ARCHIVE.downloadTemplate('${t.id}')">⬇ 下载模板</button>
            <button class="btn--ghost" onclick="ARCHIVE.closeModal()">关闭</button>
          </div>
        </div>
      </div>`;
  }

  // Walk Mode: render overview (entry screen)
  function renderWalkOverview(t) {
    const w = t.walkthrough;
    const totalMin = w.reduce(function(sum,s){ return sum + (s.time.match(/\d+/)?parseInt(s.time.match(/\d+/)[0]):5); }, 0);

    return `
      <div class="walk-container">
        <div class="walk-overview">
          <div class="walk-overview__glyph">${t.glyph}</div>
          <div class="walk-overview__title">${t.title}</div>
          <div class="walk-overview__meta">
            <span>${w.length} 个路段</span>
            <span>·</span>
            <span>约 ${totalMin} 分钟</span>
            <span>·</span>
            <span>${t.direction} · ${t.type}</span>
          </div>
          <p class="walk-overview__summary">${t.summary}</p>
          <div class="walk-overview__steps">
            ${w.map(function(s,i){
              return '<div class="walk-overview__step"><span class="walk-overview__step-num">'+(i+1)+'</span> '+s.title+' <span class="walk-overview__step-time">'+s.time+'</span></div>';
            }).join('')}
          </div>
          <div style="margin-top:var(--s-6);display:flex;gap:var(--s-3);justify-content:center;flex-wrap:wrap;">
            <button class="btn--primary" onclick="ARCHIVE.walkStart('${t.id}')">✦ 开始行走</button>
            <button class="btn--ghost" onclick="ARCHIVE.downloadTemplate('${t.id}')">直接下载</button>
          </div>
        </div>
      </div>`;
  }

  window.openCase = function(id) {
    var t = window.TEMPLATES.find(function(x){return x.id===id;});
    if (!t) return;

    var root = ensureModal();
    var panel = $('#modal-panel', root);

    // Show decrypt sequence first
    panel.innerHTML = `
      <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
      <div class="detail__media" style="background-image:url('assets/images/card-${t.id}.jpg'), ${window.coverFor(t)};background-size:cover,cover;background-position:center,center;">
        <div class="card__watermark-mask"></div>
        <div class="detail__play">▶</div>
      </div>
      <div class="detail__body" style="text-align:center;padding:var(--s-12) var(--s-8);">
        <div class="decrypt-bar" id="decryptBar" style="font-size:12px;">ACCESSING…</div>
      </div>
    `;

    root.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    var bar = $('#decryptBar');

    setTimeout(function(){
      bar.textContent = 'DECRYPTING ARCHIVE…';
      setTimeout(function(){
        bar.textContent = 'PAYLOAD DECRYPTED';
        bar.style.color = 'var(--phosphor)';

        setTimeout(function(){
          // Has walkthrough → show overview
          if (t.walkthrough && t.walkthrough.length) {
            panel.innerHTML = `
              <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
              <div class="detail__media" style="background-image:url('assets/images/card-${t.id}.jpg'), ${window.coverFor(t)};background-size:cover,cover;background-position:center,center;aspect-ratio:21/7;">
                <div class="card__watermark-mask"></div>
              </div>
              ${renderWalkOverview(t)}
            `;
            walkState = { id:id, step:-1 };
          } else {
            // Legacy archive view
            showLegacyArchive(panel, t);
          }
        }, 400);
      }, 300);
    }, 200);

    function onEsc(e) { if (e.key==='Escape') { window.closeModal(); document.removeEventListener('keydown', onEsc); } }
    document.addEventListener('keydown', onEsc);
  };

  // Legacy archive view (no walkthrough)
  function showLegacyArchive(panel, t) {
    panel.innerHTML = `
      <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
      <div class="detail__media" style="background-image:url('assets/images/card-${t.id}.jpg'), ${window.coverFor(t)};background-size:cover,cover;background-position:center,center;">
        <div class="card__watermark-mask"></div>
        <div class="detail__play">▶</div>
      </div>
      <div class="detail__body">
        <div class="detail__tag">TEMPLATE // ${t.id} · ${t.direction} · ${t.type}</div>
        <div class="detail__title">${t.title}</div>
        <div class="detail__meta">${t.tags?.map(function(tg){return '<span class="card__chip">#'+tg+'</span>';}).join('')||''}</div>
        <div class="detail__summary">${t.summary}</div>
        <div class="detail__content">${t.content||''}</div>
        ${t.quote?'<div class="detail__quote">「'+t.quote+'」</div>':''}
        ${t.pitfalls?.length?'<div class="detail__attachments"><div style="font-family:var(--font-mono);font-size:10px;color:var(--bronze);letter-spacing:2px;margin-bottom:8px;">⚠ 踩坑记录</div>'+t.pitfalls.map(function(p){return '<div class="attach__item"><span>'+p+'</span></div>';}).join('')+'</div>':''}
        <div style="margin-top:var(--s-5);display:flex;gap:var(--s-3);">
          <button class="btn--primary" onclick="ARCHIVE.downloadTemplate('${t.id}')">⬇ 下载模板</button>
          <button class="btn--ghost" onclick="ARCHIVE.closeModal()">关闭档案</button>
        </div>
      </div>
    `;
  }

  // Walk Mode controls
  window.walkStart = function(id) {
    var t = window.TEMPLATES.find(function(x){return x.id===id;});
    if (!t) return;
    walkState = { id:id, step:0 };
    var panel = $('#modal-panel', modalRoot);
    panel.innerHTML = `
      <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
      ${renderWalkStep(t, 0)}
    `;
  };

  window.walkNext = function() {
    if (!walkState) return;
    walkState.step++;
    var t = window.TEMPLATES.find(function(x){return x.id===walkState.id;});
    if (!t) return;
    var panel = $('#modal-panel', modalRoot);
    panel.innerHTML = `
      <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
      ${renderWalkStep(t, walkState.step)}
    `;
    panel.scrollTop = 0;
  };

  window.walkPrev = function() {
    if (!walkState || walkState.step<=0) return;
    walkState.step--;
    var t = window.TEMPLATES.find(function(x){return x.id===walkState.id;});
    if (!t) return;
    var panel = $('#modal-panel', modalRoot);
    panel.innerHTML = `
      <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
      ${renderWalkStep(t, walkState.step)}
    `;
    panel.scrollTop = 0;
  };

  window.walkFinish = function() {
    if (!walkState) return;
    var t = window.TEMPLATES.find(function(x){return x.id===walkState.id;});
    if (!t) return;
    var id = walkState.id;
    var total = window.RELAY.complete(id);
    walkState = null;
    window.RELAY.refreshCounts();

    var panel = $('#modal-panel', modalRoot);
    panel.innerHTML = `
      <button class="modal-panel__close" onclick="ARCHIVE.closeModal()" aria-label="关闭">✕</button>
      ${renderCertificate(t)}
      <div class="detail__body" style="padding-top:0;">
        <div class="decrypt-bar" style="color:var(--phosphor);text-align:center;">你已走通 · 第 ${total} 位接力者</div>

        <div class="walk-marker-form" style="margin-top:var(--s-6);border-top:1px solid var(--bronze-line);padding-top:var(--s-5);">
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--bronze);letter-spacing:2px;margin-bottom:var(--s-3);">+ 留一个路标</div>
          <div style="display:flex;gap:var(--s-2);margin-bottom:var(--s-3);">
            <span class="chip" data-mtype="tip" onclick="this.parentElement.querySelectorAll('.chip').forEach(function(c){c.classList.remove('is-on')});this.classList.add('is-on');">💡 技巧</span>
            <span class="chip" data-mtype="pitfall" onclick="this.parentElement.querySelectorAll('.chip').forEach(function(c){c.classList.remove('is-on')});this.classList.add('is-on');">⚠ 踩坑</span>
            <span class="chip" data-mtype="note" onclick="this.parentElement.querySelectorAll('.chip').forEach(function(c){c.classList.remove('is-on')});this.classList.add('is-on');">✏ 笔记</span>
          </div>
          <textarea id="markerInput" placeholder="写下你在这条路上遇到的事…" style="width:100%;background:var(--bg);border:1px solid var(--bronze-line);border-radius:var(--r-sm);padding:var(--s-4);color:var(--ink);font-family:var(--font-body);font-size:13px;resize:vertical;min-height:80px;outline:none;"></textarea>
          <div style="display:flex;gap:var(--s-3);margin-top:var(--s-3);">
            <button class="btn--primary" onclick="ARCHIVE.saveMarker('${id}')">留路标 →</button>
            <button class="btn--ghost" onclick="ARCHIVE.closeModal()">关闭</button>
          </div>
        </div>
      </div>
    `;
    panel.scrollTop = 0;
  };

  window.saveMarker = function(id) {
    var input = document.getElementById('markerInput');
    if (!input || !input.value.trim()) return;
    var active = document.querySelector('.walk-marker-form .chip.is-on');
    var type = active ? active.dataset.mtype : 'tip';
    window.RELAY.leaveMarker(id, input.value.trim(), type);
    input.value = '';
    input.placeholder = '✓ 路标已留。你可以再写一个，或关闭。';
  };

  window.closeModal = function() {
    if (!modalRoot) return;
    modalRoot.classList.remove('is-open');
    document.body.style.overflow = '';
    walkState = null;
  };

  window.closeModal = function() {
    if (!modalRoot) return;
    modalRoot.classList.remove('is-open');
    document.body.style.overflow = '';
    walkState = null;
  };

  // ===== DOWNLOAD =====
  window.downloadTemplate = function(id) {
    const t = window.TEMPLATES.find(x => x.id === id);
    if (!t) return;
    const blob = new Blob([t.downloadContent], { type:'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `RELAY-${t.id}-${t.title}.txt`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ===== TEMPLATE GALLERY =====
  window.initGallery = function(containerId, filterContainerId, pagerContainerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    const all = window.TEMPLATES;
    let activeDir = null, activeCohort = null, searchQuery = '';
    const pageSize = window.SITE.pageSize || 6;
    let currentPage = 1;

    function getFiltered() {
      let list = all;
      if (activeDir) list = list.filter(t => t.direction === activeDir);
      if (activeCohort) list = list.filter(t => t.cohort === activeCohort);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.tags?.some(tg => tg.toLowerCase().includes(q))
        );
      }
      return list;
    }

    function render() {
      const filtered = getFiltered();
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const start = (currentPage-1)*pageSize;
      const page = filtered.slice(start, start+pageSize);

      grid.innerHTML = page.length
        ? page.map(t => window.cardHTML(t)).join('')
        : '<div class="gallery-empty">未检索到匹配档案</div>';

      // result count
      const counter = $('#resultCount');
      if (counter) counter.innerHTML = `检索到 <span>${total}</span> 条档案记录`;

      // pager
      const pager = document.getElementById(pagerContainerId);
      if (pager && totalPages > 1) {
        let html = `<button ${currentPage===1?'disabled':''} onclick="ARCHIVE.goPage(${currentPage-1})">‹</button>`;
        for (let i=1; i<=totalPages; i++) {
          html += `<button class="${i===currentPage?'is-on':''}" onclick="ARCHIVE.goPage(${i})">${i}</button>`;
        }
        html += `<button ${currentPage===totalPages?'disabled':''} onclick="ARCHIVE.goPage(${currentPage+1})">›</button>`;
        pager.innerHTML = html;
      } else if (pager) {
        pager.innerHTML = '';
      }
    }

    window.goPage = function(p) {
      currentPage = p;
      render();
      grid.scrollIntoView({ behavior:'smooth', block:'start' });
    };

    // filters
    if (filterContainerId) {
      const fc = document.getElementById(filterContainerId);
      if (fc) {
        fc.addEventListener('click', function(e) {
          const chip = e.target.closest('.chip');
          if (!chip) return;

          const dtype = chip.dataset.dir;
          const ctype = chip.dataset.cohort;

          if (dtype !== undefined) {
            $$('.chip[data-dir]', fc).forEach(c => c.classList.remove('is-on'));
            if (activeDir === dtype) { activeDir = null; }
            else { activeDir = dtype; chip.classList.add('is-on'); }
          }

          if (ctype !== undefined) {
            $$('.chip[data-cohort]', fc).forEach(c => c.classList.remove('is-on'));
            if (activeCohort === ctype) { activeCohort = null; }
            else { activeCohort = ctype; chip.classList.add('is-on'); }
          }

          currentPage = 1;
          render();
        });
      }
    }

    // search
    const searchInput = $('#gallerySearch');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchQuery = this.value.trim();
        currentPage = 1;
        render();
      });
    }

    // URL params
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q');
    if (qParam && searchInput) {
      searchInput.value = qParam;
      searchQuery = qParam;
    }

    render();
  };

  // ===== RESOURCES PAGE =====
  window.initResources = function(containerId, filterContainerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    let activeCat = null;

    function render() {
      let list = window.RESOURCES;
      if (activeCat) list = list.filter(r => r.category === activeCat);

      grid.innerHTML = list.map(r => `
        <div class="res-card">
          <div class="res-card__icon">${r.icon}</div>
          <div class="res-card__title">${r.title}</div>
          <p class="res-card__desc">${r.desc}</p>
          <div class="res-card__foot">
            <span class="res-card__type">${r.type}</span>
            ${r.link ? `<a href="${r.link}" target="_blank" rel="noopener" class="res-card__dl">${r.dlLabel} →</a>` : ''}
          </div>
        </div>
      `).join('');

      const counter = $('#resultCount');
      if (counter) counter.innerHTML = `共 <span>${list.length}</span> 条资源`;
    }

    if (filterContainerId) {
      const fc = document.getElementById(filterContainerId);
      if (fc) {
        fc.addEventListener('click', function(e) {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          const cat = chip.dataset.cat;
          $$('.chip', fc).forEach(c => c.classList.remove('is-on'));
          if (activeCat === cat) { activeCat = null; }
          else { activeCat = cat; chip.classList.add('is-on'); }
          render();
        });
      }
    }

    render();
  };

  // ===== REVEAL ON SCROLL =====
  function initReveal() {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const d = parseInt(el.dataset.d) || 0;
          setTimeout(function() { el.classList.add('visible'); }, d * 80);
          observer.unobserve(el);
        }
      });
    }, { threshold:0.15 });

    $$('.reveal').forEach(function(el) { observer.observe(el); });
  }

  // ===== COUNT UP =====
  function initCountUp() {
    const nums = $$('[data-count]');
    if (!nums.length) return;
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          const duration = 1400;
          const start = performance.now();

          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      });
    }, { threshold:0.5 });
    nums.forEach(function(el) { observer.observe(el); });
  }

  // ===== TYPING =====
  window.initTyping = function(el, phrases, typeSpeed, pauseTime) {
    if (!el) return;
    const ts = typeSpeed || 90;
    const pt = pauseTime || 1600;
    let phraseIdx = 0, charIdx = 0, isDeleting = false;

    function tick() {
      const phrase = phrases[phraseIdx];
      if (isDeleting) {
        el.textContent = phrase.substring(0, charIdx-1);
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx+1) % phrases.length;
          setTimeout(tick, 200);
          return;
        }
        setTimeout(tick, ts/2);
      } else {
        el.textContent = phrase.substring(0, charIdx+1);
        charIdx++;
        if (charIdx === phrase.length) {
          setTimeout(function() { isDeleting = true; tick(); }, pt);
          return;
        }
        setTimeout(tick, ts);
      }
    }
    tick();
  };

  // ===== MARQUEE =====
  function initMarquee() {
    const track = $('.marquee__track');
    if (!track) return;
    const items = window.MARQUEE_ITEMS;
    let html = items.map(function(item) {
      return `<span>${item}<b>●</b></span>`;
    }).join('');
    track.innerHTML = html + html; // duplicate for seamless
  }

  // ===== HERO TITLE RISE =====
  function initHeroRise() {
    const lines = $$('.h-display .line > span');
    lines.forEach(function(span, i) {
      setTimeout(function() {
        span.classList.add('rise');
      }, 200 + i * 120);
    });
  }

  // ===== TERMINAL LINES =====
  window.initTerminal = function(containerSelector) {
    const term = $(containerSelector);
    if (!term) return;
    const lines = $$('.terminal__line', term);
    lines.forEach(function(line, i) {
      setTimeout(function() { line.classList.add('show'); }, 600 + i * 200);
    });
  };

  // ===== GLITCH =====
  function initGlitch() {
    $$('.glitch').forEach(function(el) {
      el.setAttribute('data-text', el.textContent);
    });
  }

  // ===== BOOT =====
  function boot() {
    injectAtmosphere();
    injectCursor();
    injectNav();
    injectFooter();
    initReveal();
    initCountUp();
    initMarquee();
    initHeroRise();
    initGlitch();
  }

  // ===== EXPORT =====
  window.ARCHIVE = {
    openCase: window.openCase,
    closeModal: window.closeModal,
    cardHTML: window.cardHTML,
    coverFor: window.coverFor,
    downloadTemplate: window.downloadTemplate,
    initGallery: window.initGallery,
    initResources: window.initResources,
    initTyping: window.initTyping,
    initTerminal: window.initTerminal,
    goPage: window.goPage,
    saveMarker: window.saveMarker,
    walkNext: window.walkNext,
    walkPrev: window.walkPrev,
    walkStart: window.walkStart,
    walkFinish: window.walkFinish
  };

  // ===== DOM READY =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
