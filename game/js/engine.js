/*
 * 凪ノ家の十二通 — ノベルエンジン本体
 * 依存: core.js / data/*.js / scenario/*.js
 * グラフィック・BGMは data/manifest.js のパスにファイルを置けば自動で使われる。
 * ファイルが無い場合はプレースホルダ表示・無音で動作する。
 */
(function () {
  'use strict';
  const Core = window.NovelCore;
  const DATA = window.GAME_DATA;
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs, html) => { const e = document.createElement(tag); if (attrs) Object.entries(attrs).forEach(([k, v]) => { if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); }); if (html !== undefined) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------- プログラム ----------------
  const prog = Core.parseAll();
  if (prog.errors.length) { console.error('シナリオエラー:\n' + prog.errors.join('\n')); }

  // ---------------- 永続データ ----------------
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('nagi12_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('nagi12_' + k, JSON.stringify(v)); } catch (e) { toast('保存に失敗しました'); } },
    del(k) { try { localStorage.removeItem('nagi12_' + k); } catch (e) { /* noop */ } }
  };
  const DEFAULT_CONFIG = { textSpeed: 35, autoWait: 1400, windowAlpha: 82, bgmVol: 70, seVol: 80, choiceHints: true, skipUnread: false, textSize: 20 };
  const sys = Object.assign({ endings: {}, stills: {}, read: {}, hintLevel: {}, scenes: {}, chapters: {}, flagsEver: {} }, LS.get('sys', {}));
  sys.config = Object.assign({}, DEFAULT_CONFIG, sys.config || {});
  function saveSys() { LS.set('sys', sys); }

  // ---------------- 実行状態 ----------------
  let state = Core.newState();
  let runToken = 0;
  let mode = { auto: false, skip: false };
  let backlog = [];
  let advanceResolver = null;
  let typing = null;
  let playStart = Date.now();

  // ---------------- 音声(Codex実装用フック) ----------------
  const Audio_ = {
    bgm: null, bgmId: '',
    playBgm(id) {
      if (id === this.bgmId) return;
      this.stopBgm();
      this.bgmId = id;
      const m = DATA.manifest.bgm[id];
      if (!m || !m.file) return;
      try { const a = new Audio(m.file); a.loop = true; a.volume = sys.config.bgmVol / 100; a.play().catch(() => {}); this.bgm = a; } catch (e) { /* 無音で続行 */ }
    },
    stopBgm() { if (this.bgm) { try { this.bgm.pause(); } catch (e) { /* noop */ } } this.bgm = null; this.bgmId = ''; },
    se(id) {
      const m = DATA.manifest.se[id];
      if (!m || !m.file || mode.skip) return;
      try { const a = new Audio(m.file); a.volume = sys.config.seVol / 100; a.play().catch(() => {}); } catch (e) { /* noop */ }
    },
    setVolume() { if (this.bgm) this.bgm.volume = sys.config.bgmVol / 100; }
  };

  // ---------------- 描画 ----------------
  const imgCache = {};
  function tryImage(file, ok, ng) {
    if (!file) { ng(); return; }
    if (imgCache[file] === true) { ok(); return; }
    if (imgCache[file] === false) { ng(); return; }
    const img = new Image();
    img.onload = () => { imgCache[file] = true; ok(); };
    img.onerror = () => { imgCache[file] = false; ng(); };
    img.src = file;
  }
  function setBg(id) {
    state.visual.bg = id;
    const m = DATA.manifest.bg[id] || {};
    const layer = $('#layer-bg');
    $('#bg-label').textContent = '背景: ' + (m.name || id);
    tryImage(m.file, () => { layer.style.backgroundImage = `url("${m.file}")`; $('#bg-label').classList.add('hidden'); },
      () => { layer.style.backgroundImage = m.ph || 'linear-gradient(160deg, #2a3550, #151a28)'; $('#bg-label').classList.remove('hidden'); });
  }
  function charDef(id) { return DATA.characters[id] || { name: id, color: '#777' }; }
  function renderChars() {
    const layer = $('#layer-chars');
    layer.innerHTML = '';
    Object.entries(state.visual.chars).forEach(([id, c]) => {
      const d = charDef(id);
      const box = el('div', { class: 'chara pos-' + (c.pos || 'center') });
      const file = (DATA.manifest.chara[id] && DATA.manifest.chara[id].pattern || '').replace('{expr}', c.expr);
      const ph = el('div', { class: 'ph', style: 'background:' + d.color }, `<b>${esc(d.name)}</b>${esc(c.expr)}`);
      box.appendChild(ph);
      tryImage(file, () => { box.innerHTML = ''; box.appendChild(el('img', { src: file, alt: d.name })); }, () => {});
      layer.appendChild(box);
    });
  }
  function showStill(id) {
    const layer = $('#layer-still');
    if (!id || id === 'off') { state.visual.still = ''; layer.classList.add('hidden'); return; }
    state.visual.still = id;
    if (!sys.stills[id]) { sys.stills[id] = true; saveSys(); }
    const m = DATA.manifest.still[id] || { title: id, desc: '' };
    layer.classList.remove('hidden');
    layer.innerHTML = '';
    tryImage(m.file, () => { layer.classList.remove('ph'); layer.style.backgroundImage = `url("${m.file}")`; },
      () => { layer.classList.add('ph'); layer.style.backgroundImage = ''; layer.appendChild(el('div', { class: 'still-desc' }, `【スチル】${esc(m.title)}<br><small>${esc(m.desc || '')}</small>`)); });
  }
  function fx(kind) {
    const f = $('#layer-fx');
    if (mode.skip && (kind === 'shake' || kind === 'flash')) return Promise.resolve();
    if (kind === 'shake') { $('#game').classList.remove('fx-shake'); void $('#game').offsetWidth; $('#game').classList.add('fx-shake'); return sleep(500); }
    if (kind === 'flash') { f.className = 'layer'; void f.offsetWidth; f.classList.add('fx-flash'); return sleep(500); }
    f.className = 'layer';
    if (kind === 'black') f.classList.add('fx-black');
    if (kind === 'white') f.classList.add('fx-white');
    if (kind === 'red') f.classList.add('fx-red');
    return sleep(mode.skip ? 0 : 600);
  }
  function restoreVisual() {
    setBg(state.visual.bg || 'black');
    renderChars();
    showStill(state.visual.still);
    if (state.visual.bgm) Audio_.playBgm(state.visual.bgm); else Audio_.stopBgm();
    $('#layer-fx').className = 'layer';
    $('#choices').classList.add('hidden');
    closeCard();
    setLetterMode(state.visual.letter);
  }
  function setLetterMode(on) {
    state.visual.letter = !!on;
    $('#letterbox').classList.toggle('hidden', !on);
    $('#textbox').classList.toggle('hidden', !!on);
    if (on) $('#letter-text').innerHTML = '';
  }

  // ---------------- テキスト ----------------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function subst(s) { return s.replace(/\{name\}/g, state.name).replace(/\{fullname\}/g, '汐見' + state.name); }
  function readKey(pc) { const p = Core.posOf(prog, pc); return p.label + ':' + p.offset; }

  function waitAdvance() { return new Promise((res) => { advanceResolver = res; }); }
  function advance() {
    if (typing) { typing.finish(); return; }
    if (advanceResolver) { const r = advanceResolver; advanceResolver = null; r(); }
  }

  async function showText(c) {
    const speaker = subst(c.speaker || '');
    const text = subst(c.text);
    const key = readKey(state.pc);
    const wasRead = !!sys.read[key];
    backlog.push({ speaker, text, letter: state.visual.letter });
    if (backlog.length > 300) backlog.shift();
    const letter = state.visual.letter;
    const target = letter ? el('p') : $('#text');
    if (letter) $('#letter-text').appendChild(target);
    else { $('#namebox').textContent = speaker; target.textContent = ''; }
    const mark = letter ? $('.next-mark-letter') : $('#next-mark');
    mark.classList.remove('on');
    if (mode.skip && !wasRead && !sys.config.skipUnread) setSkip(false);

    const fast = mode.skip;
    await new Promise((resolve) => {
      let i = 0; let done = false; let timer = null;
      const finish = () => { if (done) return; done = true; clearTimeout(timer); target.textContent = text; typing = null; resolve(); };
      typing = { finish };
      if (fast || sys.config.textSpeed >= 100) { finish(); return; }
      const delay = Math.max(4, 70 - sys.config.textSpeed * 0.66);
      const tick = () => { if (done) return; i++; target.textContent = text.slice(0, i); if (i >= text.length) finish(); else timer = setTimeout(tick, delay); };
      tick();
    });
    sys.read[key] = 1;
    mark.classList.add('on');
    if (mode.skip) { await sleep(40); }
    else if (mode.auto) {
      await Promise.race([sleep(sys.config.autoWait + text.length * 45), waitAdvance()]);
      advanceResolver = null;
    } else await waitAdvance();
    mark.classList.remove('on');
  }

  function choiceMarks(opt) {
    if (!sys.config.choiceHints) return '';
    let h = '';
    opt.effects.forEach((e) => {
      if (e.type === 'add' && e.id.startsWith('aff.')) {
        const d = charDef(e.id.slice(4));
        h += e.n > 0 ? `<i title="${esc(d.name)}の好感度↑" style="background:${d.color}"></i>` : `<i class="down" title="${esc(d.name)}の好感度↓" style="color:${d.color}">▼</i>`;
      } else if (e.type === 'add' && e.id === 'house' && e.n > 0) h += '<i title="家の灯↑" style="background:#e7b45a;border-radius:2px"></i>';
      else if (e.type === 'add' && e.id === 'house' && e.n < 0) h += '<i class="down" title="家の灯↓">▽</i>';
      else if (e.type === 'flag' && e.value && DATA.flagIndex[e.id] && DATA.flagIndex[e.id].key) h += '<i class="star" title="重要な分岐">★</i>';
    });
    return h ? `<span class="hint-marks">${h}</span>` : '';
  }

  function showChoice(c) {
    if (mode.skip) setSkip(false);
    setAuto(false);
    const box = $('#choices');
    box.innerHTML = '';
    if (c.prompt) box.appendChild(el('div', { class: 'prompt' }, esc(subst(c.prompt))));
    const opts = c.options.filter((o) => !o.cond || Core.evalCond(o.cond, state, sys));
    return new Promise((resolve) => {
      opts.forEach((o) => {
        const b = el('button', { onclick: (ev) => { ev.stopPropagation(); box.classList.add('hidden'); backlog.push({ speaker: '', text: '▶ ' + subst(o.text), choice: true }); resolve(o); } }, esc(subst(o.text)) + choiceMarks(o));
        box.appendChild(b);
      });
      box.classList.remove('hidden');
    });
  }

  // ---------------- 実行ループ ----------------
  function jumpTo(label) {
    const pc = prog.labels[label];
    if (pc === undefined) { console.error('未定義ラベル: ' + label); toast('エラー: ラベル ' + label + ' がありません'); return false; }
    state.pc = pc; return true;
  }

  async function execCmd(c) {
    const a = c.args;
    switch (c.op) {
      case 'bg': setBg(a.split(/\s+/)[0]); if (!mode.skip) await sleep(250); break;
      case 'bgm': if (a === 'stop' || !a) { state.visual.bgm = ''; Audio_.stopBgm(); } else { state.visual.bgm = a; Audio_.playBgm(a); } break;
      case 'se': Audio_.se(a); break;
      case 'show': { const [id, expr, pos] = a.split(/\s+/); const prev = state.visual.chars[id] || {}; state.visual.chars[id] = { expr: expr || prev.expr || 'normal', pos: pos || prev.pos || 'center' }; renderChars(); break; }
      case 'hide': if (a === 'all' || !a) state.visual.chars = {}; else a.split(/\s+/).forEach((id) => delete state.visual.chars[id]); renderChars(); break;
      case 'still': showStill(a); break;
      case 'effect': await fx(a); break;
      case 'wait': if (!mode.skip) await sleep(Number(a) || 500); break;
      case 'set': case 'flag': case 'unflag': case 'route':
        Core.applyEffects(c.effects, state);
        c.effects.forEach((e) => { if (e.type === 'flag' && e.value) sys.flagsEver[e.id] = true; });
        break;
      case 'if': if (Core.evalCond(c.expr, state, sys)) { jumpTo(c.target); return 'jump'; } break;
      case 'goto': jumpTo(c.target); return 'jump';
      case 'call': state.stack.push(state.pc + 1); jumpTo(c.target); return 'jump';
      case 'return': if (state.stack.length) { state.pc = state.stack.pop(); return 'jump'; } break;
      case 'letter': setLetterMode(true); break;
      case 'endletter': if (!mode.skip) { $('.next-mark-letter').classList.add('on'); await (mode.auto ? sleep(sys.config.autoWait) : waitAdvance()); } setLetterMode(false); break;
      case 'clearletter': $('#letter-text').innerHTML = ''; break;
      case 'hint': state.hint = a; break;
      case 'scene': state.scene = c.title; if (!sys.scenes[c.id]) { sys.scenes[c.id] = true; saveSys(); } break;
      case 'chapter':
        state.chapter = c.title; state.chapterId = c.id;
        sys.chapters[c.id] = true; saveSys();
        autosave();
        await card('', c.title, '', 2600);
        break;
      case 'ending': await doEnding(a); return 'stop';
      case 'end': toTitle(); return 'stop';
      default: console.warn('未知の命令 @' + c.op);
    }
    return 'next';
  }

  async function runLoop() {
    const token = ++runToken;
    while (token === runToken) {
      const c = prog.cmds[state.pc];
      if (!c) { toast('シナリオの終端に到達しました'); toTitle(); return; }
      if (c.cond && !Core.evalCond(c.cond, state, sys)) { state.pc++; continue; }
      if (c.t === 'label') { state.pc++; continue; }
      if (c.t === 'text') { await showText(c); if (token !== runToken) return; state.pc++; continue; }
      if (c.t === 'choice') {
        const opt = await showChoice(c);
        if (token !== runToken) return;
        Core.applyEffects(opt.effects, state);
        opt.effects.forEach((e) => { if (e.type === 'flag' && e.value) sys.flagsEver[e.id] = true; });
        saveSys();
        jumpTo(opt.target); continue;
      }
      const r = await execCmd(c);
      if (token !== runToken || r === 'stop') return;
      if (r === 'next') state.pc++;
    }
  }

  let cardTimer = null;
  function closeCard() { clearTimeout(cardTimer); cardTimer = null; $('#card').classList.add('hidden'); $('#card').onclick = null; }
  function card(sub, title, note, ms) {
    closeCard();
    return new Promise((res) => {
      const cEl = $('#card');
      $('#card-sub').textContent = sub; $('#card-title').textContent = title; $('#card-note').textContent = note || '';
      cEl.classList.remove('hidden');
      const close = () => { closeCard(); res(); };
      cEl.onclick = (e) => { e.stopPropagation(); close(); };
      if (ms) cardTimer = setTimeout(close, mode.skip ? 300 : ms);
    });
  }

  async function doEnding(id) {
    const e = DATA.endingIndex[id] || { title: id, type: 'normal' };
    const first = !sys.endings[id];
    sys.endings[id] = { date: Date.now() };
    saveSys();
    setSkip(false); setAuto(false);
    const typeName = { happy: 'HAPPY END', normal: 'NORMAL END', bad: 'BAD END', triangle: 'TRIANGLE END', true: 'TRUE END', common_bad: 'BAD END' }[e.type] || 'END';
    await card(typeName, e.title, (first ? '新しいエンディングを迎えました' : '') + `（${Object.keys(sys.endings).length} / ${DATA.endings.length}）　クリックでタイトルへ`, 0);
    toTitle();
  }

  // ---------------- セーブ／ロード ----------------
  function snapshot() {
    const s = JSON.parse(JSON.stringify(state));
    s.pos = Core.posOf(prog, state.pc);
    s.stackPos = state.stack.map((pc) => Core.posOf(prog, pc));
    s.playTime = state.playTime + (Date.now() - playStart);
    return s;
  }
  function meta() {
    const last = [...backlog].reverse().find((b) => !b.choice);
    return { date: new Date().toLocaleString('ja-JP'), chapter: state.chapter, scene: state.scene, text: last ? (last.speaker ? last.speaker + '：' : '') + last.text.slice(0, 40) : '', aff: Object.assign({}, state.vars) };
  }
  function saveTo(slot) { LS.set('save_' + slot, { meta: meta(), state: snapshot() }); }
  function loadFrom(slot) {
    const d = LS.get('save_' + slot, null);
    if (!d) return false;
    const s = d.state;
    const pc = Core.pcOf(prog, s.pos);
    if (pc < 0) { toast('このセーブデータは現在のシナリオと互換性がありません'); return false; }
    state = Core.newState();
    Object.assign(state, s);
    state.vars = Object.assign(Core.newState().vars, s.vars);
    state.pc = pc;
    state.stack = (s.stackPos || []).map((p) => Core.pcOf(prog, p));
    playStart = Date.now();
    backlog = [];
    closeOverlay();
    restoreVisual();
    runLoop();
    return true;
  }
  function autosave() { if (state.chapter) saveTo('auto'); }

  // ---------------- モード ----------------
  function setAuto(on) { mode.auto = on; $('#btn-auto').classList.toggle('on', on); indicator(); if (on) advance(); }
  function setSkip(on) { mode.skip = on; $('#btn-skip').classList.toggle('on', on); indicator(); if (on) advance(); }
  function indicator() { $('#mode-indicator').textContent = mode.skip ? '▶▶ SKIP' : mode.auto ? '▶ AUTO' : ''; }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 1800); }

  // ---------------- オーバーレイ共通 ----------------
  let overlayOpen = false;
  function openOverlay(html, onClose) {
    const o = $('#overlay');
    o.innerHTML = html;
    o.classList.remove('hidden');
    overlayOpen = true;
    const close = o.querySelector('.ov-close');
    if (close) close.onclick = () => { closeOverlay(); if (onClose) onClose(); };
    return o;
  }
  function closeOverlay() { $('#overlay').classList.add('hidden'); overlayOpen = false; }
  const closeBtn = '<button class="btn ov-close">閉じる</button>';

  // ---------------- タイトル ----------------
  function toTitle() {
    runToken++;
    setAuto(false); setSkip(false);
    Audio_.playBgm('title');
    state = Core.newState();
    state.visual.bg = 'title';
    setBg('title');
    state.visual.chars = {}; renderChars(); showStill('');
    setLetterMode(false);
    closeCard();
    $('#choices').classList.add('hidden');
    $('#text').textContent = ''; $('#namebox').textContent = '';
    const hasAuto = !!LS.get('save_auto', null);
    const nEnd = Object.keys(sys.endings).length;
    const o = openOverlay(`<div class="title-screen">
      <div class="logo">凪ノ家の十二通</div>
      <div class="sub">NAGINOYA — TWELVE LETTERS</div>
      <div class="menu">
        <button class="btn primary" data-t="new">はじめから</button>
        <button class="btn" data-t="cont" ${hasAuto ? '' : 'disabled'}>つづきから（オート）</button>
        <button class="btn" data-t="load">ロード</button>
        <button class="btn" data-t="hint">ヒント帳・攻略</button>
        <button class="btn" data-t="gallery">スチルギャラリー</button>
        <button class="btn" data-t="endings">エンディングリスト</button>
        <button class="btn" data-t="config">設定</button>
      </div>
      <div class="clock">回収エンディング ${nEnd} / ${DATA.endings.length}　・　スチル ${Object.keys(sys.stills).length} / ${Object.keys(DATA.manifest.still).length}</div>
    </div>`);
    o.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => {
      const t = b.dataset.t;
      if (t === 'new') nameInput();
      if (t === 'cont') loadFrom('auto');
      if (t === 'load') slotScreen('load', toTitle);
      if (t === 'hint') hintBook(toTitle);
      if (t === 'gallery') gallery(toTitle);
      if (t === 'endings') endingList(toTitle);
      if (t === 'config') configScreen(toTitle);
    });
  }

  function nameInput() {
    const o = openOverlay(`<div class="name-input">
      <div>主人公の名前を入力してください（苗字は「汐見」固定）</div>
      <div>汐見 <input id="name-in" maxlength="6" value="澪"></div>
      <div style="font-size:13px;color:var(--ink-dim)">未入力の場合は「澪（みお）」になります</div>
      <button class="btn primary" id="name-ok">この名前ではじめる</button>
      <button class="btn" id="name-back">もどる</button></div>`);
    o.querySelector('#name-ok').onclick = () => {
      const v = o.querySelector('#name-in').value.trim() || '澪';
      startNew(v);
    };
    o.querySelector('#name-back').onclick = toTitle;
    o.querySelector('#name-in').focus();
  }
  function startNew(name) {
    state = Core.newState();
    state.name = name;
    backlog = [];
    playStart = Date.now();
    closeOverlay();
    setBg('black');
    jumpTo('start');
    runLoop();
  }

  // ---------------- セーブ画面 ----------------
  function slotScreen(kind, back) {
    const slots = ['auto', 'q'].concat(Array.from({ length: 30 }, (_, i) => String(i + 1)));
    const cells = slots.map((s) => {
      const d = LS.get('save_' + s, null);
      const label = s === 'auto' ? 'オート' : s === 'q' ? 'クイック' : 'No.' + s;
      const body = d ? `<div>${esc(d.meta.date)}</div><div>${esc(d.meta.chapter || '')} ${esc(d.meta.scene || '')}</div><div style="color:var(--ink-dim)">${esc(d.meta.text || '')}</div>` : '<div class="empty">— 空き —</div>';
      return `<div class="slot" data-s="${s}"><span class="no">${label}</span>${body}</div>`;
    }).join('');
    const o = openOverlay(`${closeBtn}<h1>${kind === 'save' ? 'セーブ' : 'ロード'}</h1><div class="slots">${cells}</div>`, back);
    o.querySelectorAll('.slot').forEach((s) => s.onclick = () => {
      const id = s.dataset.s;
      if (kind === 'save') {
        if (id === 'auto') { toast('オート枠には保存できません'); return; }
        if (LS.get('save_' + id, null) && !confirm('上書きしますか？')) return;
        saveTo(id); toast('セーブしました'); slotScreen(kind, back);
      } else {
        if (!LS.get('save_' + id, null)) return;
        loadFrom(id);
      }
    });
  }

  // ---------------- ログ ----------------
  function logScreen() {
    const items = backlog.slice().reverse().map((b) => `<div class="log-item">${b.speaker ? `<div class="who">${esc(b.speaker)}</div>` : ''}${esc(b.text)}</div>`).join('');
    openOverlay(`${closeBtn}<h1>バックログ</h1>${items || '<p>まだ何もありません</p>'}`);
  }

  // ---------------- 設定 ----------------
  function configScreen(back) {
    const c = sys.config;
    const row = (k, label, min, max, step) => `<div class="cfg-row"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" data-k="${k}" value="${c[k]}"><span id="v-${k}">${c[k]}</span></div>`;
    const chk = (k, label) => `<div class="cfg-row"><span>${label}</span><input type="checkbox" data-k="${k}" ${c[k] ? 'checked' : ''}><span></span></div>`;
    const o = openOverlay(`${closeBtn}<h1>設定</h1>
      ${row('textSpeed', '文字速度(100=瞬間)', 0, 100, 5)}
      ${row('autoWait', 'オート待ち時間(ms)', 400, 4000, 100)}
      ${row('windowAlpha', 'ウィンドウ不透明度', 20, 100, 5)}
      ${row('textSize', '文字サイズ', 14, 30, 1)}
      ${row('bgmVol', 'BGM音量', 0, 100, 5)}
      ${row('seVol', '効果音音量', 0, 100, 5)}
      ${chk('choiceHints', '選択肢ヒントマーク表示')}
      ${chk('skipUnread', '未読もスキップする')}
      <p style="font-size:13px;color:var(--ink-dim)">選択肢ヒントマーク：●＝その色のキャラの好感度が上がる／▼＝下がる／■＝家の灯が上がる／★＝重要な分岐フラグ</p>
      <h2>データ</h2><button class="btn" id="cfg-reset">システムデータ(既読・回収状況)を初期化</button>`, back);
    o.querySelectorAll('input').forEach((i) => i.oninput = () => {
      const k = i.dataset.k;
      c[k] = i.type === 'checkbox' ? i.checked : Number(i.value);
      const v = o.querySelector('#v-' + k); if (v) v.textContent = c[k];
      applyConfig(); saveSys();
    });
    o.querySelector('#cfg-reset').onclick = () => { if (confirm('既読・エンディング・スチル回収状況をすべて消去します。よろしいですか？')) { ['endings', 'stills', 'read', 'hintLevel', 'scenes', 'chapters', 'flagsEver'].forEach((k) => sys[k] = {}); saveSys(); toast('初期化しました'); } };
  }
  function applyConfig() {
    const c = sys.config;
    document.documentElement.style.setProperty('--window', `rgba(18,22,34,${c.windowAlpha / 100})`);
    document.documentElement.style.setProperty('--text-size', c.textSize + 'px');
    Audio_.setVolume();
  }

  // ---------------- ギャラリー／エンディング ----------------
  function gallery(back) {
    const groups = {};
    Object.entries(DATA.manifest.still).forEach(([id, m]) => { (groups[m.group || 'その他'] = groups[m.group || 'その他'] || []).push([id, m]); });
    let html = `${closeBtn}<h1>スチルギャラリー</h1>`;
    Object.entries(groups).forEach(([g, list]) => {
      html += `<h2>${esc(g)}</h2><div class="grid">` + list.map(([id, m]) => sys.stills[id]
        ? `<div class="cell" data-id="${id}"><b>${esc(m.title)}</b><br><span style="color:var(--ink-dim)">${esc(m.where || '')}</span></div>`
        : `<div class="cell locked">？？？<br><span>${esc(m.where ? '入手: ' + m.where.split('／')[0] : '')}</span></div>`).join('') + '</div>';
    });
    const o = openOverlay(html, back);
    o.querySelectorAll('.cell[data-id]').forEach((c) => c.onclick = () => {
      closeOverlay();
      const prevStill = state.visual.still;
      showStill(c.dataset.id);
      const layer = $('#layer-still');
      layer.style.zIndex = 25;
      layer.onclick = () => { layer.onclick = null; layer.style.zIndex = ''; showStill(prevStill); gallery(back); };
    });
  }
  function endingList(back) {
    const order = ['happy', 'normal', 'bad', 'triangle', 'common_bad', 'true'];
    const list = DATA.endings.slice().sort((a, b) => (a.char || '').localeCompare(b.char || '') || order.indexOf(a.type) - order.indexOf(b.type));
    const cells = list.map((e) => sys.endings[e.id]
      ? `<div class="cell"><span class="tag ${e.type}">${e.typeLabel}</span><br><b>${esc(e.title)}</b><br><span style="color:var(--ink-dim)">${esc(e.route)}</span></div>`
      : `<div class="cell locked"><span class="tag ${e.type}">${e.typeLabel}</span><br>？？？<br>${esc(e.route)}</div>`).join('');
    openOverlay(`${closeBtn}<h1>エンディングリスト（${Object.keys(sys.endings).length} / ${DATA.endings.length}）</h1><div class="grid">${cells}</div>`, back);
  }

  // ---------------- ヒント帳(攻略ヒントシステム) ----------------
  function predictRoute() {
    if (state.vars.route) return state.vars.route;
    const ids = ['reny', 'hyu', 'jin', 'gel', 'neo', 'muni'];
    let best = null, bv = -1;
    ids.forEach((i) => { const v = state.vars['aff.' + i]; if (v > bv) { bv = v; best = i; } });
    return bv >= 25 ? best : '';
  }
  function hintBook(back, tab) {
    tab = tab || (state.chapter ? 'now' : 'endings');
    const inGame = !!state.chapter;
    const tabs = [['now', 'いまの状況'], ['endings', 'エンディング攻略'], ['flags', '記憶のかけら(重要フラグ)'], ['flow', 'フローチャート'], ['guide', '遊び方']];
    let body = '';
    if (tab === 'now') {
      if (!inGame) body = '<p>ゲーム中に開くと、現在の好感度や進行状況が表示されます。</p>';
      else {
        const ids = ['reny', 'hyu', 'jin', 'gel', 'neo', 'muni'];
        body += `<p>現在：${esc(state.chapter)}　${esc(state.scene)}</p>`;
        body += '<h2>好感度</h2>' + ids.map((i) => { const d = charDef(i); const v = state.vars['aff.' + i]; return `<div class="meter"><span style="color:${d.color}">${d.name}</span><div class="bar"><div style="width:${v}%;background:${d.color}"></div><span class="tick" style="left:25%"></span><span class="tick" style="left:60%"></span><span class="tick" style="left:80%"></span></div><span>${v}</span></div>`; }).join('');
        body += `<p style="font-size:12px;color:var(--ink-dim)">目盛り：25＝第八章でルートを選べるライン／60＝三角関係の甘い結末の目安／80＝ハッピーエンドの目安（BADは好感度ではなく「選択」で起こります）</p>`;
        body += `<h2>家の灯（住人のまとまり）</h2><div class="meter"><span>家の灯</span><div class="bar"><div style="width:${state.vars.house}%;background:#e7b45a"></div><span class="tick" style="left:30%"></span></div><span>${state.vars.house}</span></div><p style="font-size:12px;color:var(--ink-dim)">30未満のまま十一月を終えると……。</p>`;
        body += `<h2>記憶の断片</h2><p>${'◆'.repeat(Math.min(6, state.vars.mem))}${'◇'.repeat(Math.max(0, 6 - state.vars.mem))}（${state.vars.mem} / 6）</p>`;
        const pr = predictRoute();
        body += `<h2>ルート予測</h2><p>${state.vars.route ? '確定：' : '傾向：'}${pr ? charDef(pr).name + 'ルート' : 'まだ誰とも深く結ばれていません'}</p>`;
        if (state.hint) body += `<h2>ちづるさんのメモ（いまのアドバイス）</h2><div class="hint-card">${esc(subst(state.hint))}</div>`;
      }
    } else if (tab === 'endings') {
      body += '<p style="font-size:13px;color:var(--ink-dim)">各エンディングのヒントは3段階。「もっと詳しく」を押すほど具体的になります（ネタバレ注意）。一度見たエンディングは全段階が開きます。</p>';
      DATA.endings.forEach((e) => {
        const seen = !!sys.endings[e.id];
        const lvl = seen ? 3 : (sys.hintLevel[e.id] || 1);
        const hints = e.hints.slice(0, lvl).map((h) => `<li>${esc(h)}</li>`).join('');
        body += `<div class="hint-card"><span class="tag ${e.type}">${e.typeLabel}</span> <span class="h-title">${seen ? esc(e.title) : '？？？'}</span>　<small>${esc(e.route)}</small><ul>${hints}</ul>${lvl < 3 ? `<button class="btn" data-more="${e.id}">もっと詳しく（${lvl}/3）</button>` : ''}</div>`;
      });
    } else if (tab === 'flags') {
      body += '<p style="font-size:13px;color:var(--ink-dim)">物語の分岐を左右する「記憶のかけら」。◆＝このプレイで入手済み／◇＝未入手（過去のプレイで一度でも入手したものは入手場所が表示されます）。</p>';
      DATA.flags.filter((f) => f.key).forEach((f) => {
        const got = inGame && state.flags[f.id];
        const ever = sys.flagsEver[f.id];
        body += `<div class="flag-row"><span class="${got ? 'got' : ''}">${got ? '◆' : '◇'}</span><span>${esc(ever || got ? f.name : '？？？')}</span><span>${esc(ever || got ? f.where + ' — ' + f.effect : f.hint)}</span></div>`;
      });
    } else if (tab === 'flow') {
      const byCh = {};
      prog.scenes.forEach((s) => { (byCh[s.chapter] = byCh[s.chapter] || []).push(s); });
      const chTitles = {}; prog.chapters.forEach((c) => { chTitles[c.id] = c.title; });
      const total = prog.scenes.length, seenN = prog.scenes.filter((s) => sys.scenes[s.id]).length;
      body += `<p>シーン回収率 ${seenN} / ${total}</p>`;
      Object.entries(byCh).forEach(([ch, list]) => {
        body += `<div class="flow-ch"><b>${esc(sys.chapters[ch] ? chTitles[ch] || ch : '？？？')}</b><br>` + list.map((s) => `<span class="node ${sys.scenes[s.id] ? 'seen' : ''}">${sys.scenes[s.id] ? esc(s.title) : '？'}</span>`).join('') + '</div>';
      });
    } else if (tab === 'guide') {
      body += DATA.guideHtml;
    }
    const o = openOverlay(`${closeBtn}<h1>ヒント帳</h1><div class="tabs">${tabs.map(([k, l]) => `<button class="btn ${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>${body}`, back);
    o.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => hintBook(back, b.dataset.tab));
    o.querySelectorAll('[data-more]').forEach((b) => b.onclick = () => {
      const id = b.dataset.more;
      if ((sys.hintLevel[id] || 1) === 2 && !confirm('最終段階のヒントは具体的な条件を含みます。表示しますか？')) return;
      sys.hintLevel[id] = Math.min(3, (sys.hintLevel[id] || 1) + 1); saveSys(); hintBook(back, 'endings');
    });
  }

  // ---------------- 入力 ----------------
  function quick(act) {
    if (act === 'qsave') { saveTo('q'); toast('クイックセーブしました'); }
    if (act === 'qload') { if (!loadFrom('q')) toast('クイックセーブがありません'); }
    if (act === 'save') slotScreen('save');
    if (act === 'load') slotScreen('load');
    if (act === 'log') logScreen();
    if (act === 'auto') setAuto(!mode.auto);
    if (act === 'skip') setSkip(!mode.skip);
    if (act === 'hint') hintBook();
    if (act === 'config') configScreen();
    if (act === 'hide') document.body.classList.add('ui-hidden');
    if (act === 'title') { if (confirm('タイトルに戻りますか？（未セーブの進行は失われます）')) toTitle(); }
  }
  $('#quickmenu').addEventListener('click', (e) => { e.stopPropagation(); const b = e.target.closest('button'); if (b) quick(b.dataset.act); });
  $('#game').addEventListener('click', (e) => {
    if (overlayOpen) return;
    if (document.body.classList.contains('ui-hidden')) { document.body.classList.remove('ui-hidden'); return; }
    if (e.target.closest('#choices') || e.target.closest('#card')) return;
    if (mode.auto) setAuto(false);
    if (mode.skip) setSkip(false);
    advance();
  });
  $('#game').addEventListener('wheel', (e) => { if (!overlayOpen && e.deltaY < 0 && state.chapter) logScreen(); });
  document.addEventListener('keydown', (e) => {
    if (overlayOpen) { if (e.key === 'Escape') { const c = document.querySelector('#overlay .ov-close'); if (c) c.click(); } return; }
    if (!$('#card').classList.contains('hidden')) { if (e.key === 'Enter' || e.key === ' ') $('#card').click(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (document.body.classList.contains('ui-hidden')) document.body.classList.remove('ui-hidden'); else advance(); }
    else if (e.key === 'Control') setSkip(true);
    else if (e.key === 'a' || e.key === 'A') setAuto(!mode.auto);
    else if (e.key === 's' || e.key === 'S') quick('save');
    else if (e.key === 'l' || e.key === 'L') quick('load');
    else if (e.key === 'h' || e.key === 'H') document.body.classList.toggle('ui-hidden');
    else if (e.key === 'q' || e.key === 'Q') quick('qsave');
    else if (e.key === 'w' || e.key === 'W') quick('qload');
    else if (e.key === 'ArrowUp') logScreen();
    else if (e.key === 'Tab') { e.preventDefault(); quick('hint'); }
  });
  document.addEventListener('keyup', (e) => { if (e.key === 'Control') setSkip(false); });
  setInterval(() => { if (state.chapter) { state.playTime += Date.now() - playStart; playStart = Date.now(); } }, 10000);

  // ---------------- 起動 ----------------
  applyConfig();
  toTitle();
  window.NagiEngine = { prog, sys, get state() { return state; }, jumpTo: (l) => { jumpTo(l); runLoop(); } };
})();
