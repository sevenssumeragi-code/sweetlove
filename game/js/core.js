/*
 * 凪ノ家の十二通 — シナリオコア
 * ブラウザ(engine.js)とNode(tools/*.js)の両方から使う、DSLパーサーと式評価器。
 * スクリプト書式は docs/07_スクリプト仕様書.md を参照。
 */
(function (G) {
  'use strict';

  const SCRIPTS = [];
  function add(file, text) { SCRIPTS.push({ file: file, text: text }); }

  // ---------- 式 ----------
  const TOKEN_RE = /\s*(\d+(?:\.\d+)?|"[^"]*"|'[^']*'|[A-Za-z_][\w.]*|&&|\|\||===|!==|==|!=|>=|<=|[<>!()+\-*\/%])/y;

  function compileExpr(src) {
    const s = String(src).trim();
    const out = [];
    const ids = [];
    let pos = 0;
    while (pos < s.length) {
      TOKEN_RE.lastIndex = pos;
      const m = TOKEN_RE.exec(s);
      if (!m) throw new Error('式を解釈できません: ' + src);
      const tok = m[1];
      pos = TOKEN_RE.lastIndex;
      if (/^[A-Za-z_]/.test(tok)) {
        if (tok === 'true' || tok === 'false') out.push(tok);
        else { out.push('$(' + JSON.stringify(tok) + ')'); ids.push(tok); }
      } else out.push(tok);
    }
    // eslint-disable-next-line no-new-func
    const fn = new Function('$', 'return (' + out.join(' ') + ');');
    return { src: s, fn: fn, ids: ids };
  }

  function parseEffects(str) {
    const list = [];
    if (!str) return list;
    str.split(/[,\s]+/).filter(Boolean).forEach(function (tok) {
      let m;
      if ((m = /^(!?)(F_\w+)$/.exec(tok))) list.push({ type: 'flag', id: m[2], value: !m[1] });
      else if ((m = /^([A-Za-z_][\w.]*)([+-])(\d+)$/.exec(tok))) list.push({ type: 'add', id: m[1], n: (m[2] === '-' ? -1 : 1) * Number(m[3]) });
      else if ((m = /^([A-Za-z_][\w.]*)=(.+)$/.exec(tok))) {
        let v = m[2].replace(/^["']|["']$/g, '');
        if (/^-?\d+$/.test(v)) v = Number(v);
        list.push({ type: 'set', id: m[1], value: v });
      } else throw new Error('効果を解釈できません: ' + tok);
    });
    return list;
  }

  // ---------- 状態 ----------
  function newState() {
    return {
      pc: 0, stack: [], vars: {
        'aff.reny': 0, 'aff.hyu': 0, 'aff.jin': 0, 'aff.gel': 0, 'aff.neo': 0, 'aff.muni': 0,
        house: 50, mem: 0, route: ''
      },
      flags: {}, name: '澪', chapter: '', chapterId: '', scene: '', hint: '',
      visual: { bg: '', chars: {}, still: '', bgm: '', letter: false },
      playTime: 0
    };
  }

  function makeResolver(state, sys) {
    return function (id) {
      if (id.indexOf('F_') === 0) return !!state.flags[id];
      if (id === 'sys.endings') return sys ? Object.keys(sys.endings || {}).length : 0;
      if (id.indexOf('seen.') === 0) return !!(sys && sys.endings && sys.endings[id.slice(5)]);
      if (id in state.vars) return state.vars[id];
      return 0;
    };
  }

  function evalCond(expr, state, sys) {
    try { return !!expr.fn(makeResolver(state, sys)); }
    catch (e) { console.error('条件式エラー', expr.src, e); return false; }
  }

  function clamp(id, v) {
    if (id.indexOf('aff.') === 0 || id === 'house') return Math.max(0, Math.min(100, v));
    return v;
  }

  function applyEffects(effects, state) {
    (effects || []).forEach(function (e) {
      if (e.type === 'flag') state.flags[e.id] = e.value;
      else if (e.type === 'add') state.vars[e.id] = clamp(e.id, (Number(state.vars[e.id]) || 0) + e.n);
      else if (e.type === 'set') state.vars[e.id] = e.value;
    });
  }

  // ---------- パーサー ----------
  const SPEAKER_RE = /^([^\s「」@*#+?、。！？]{1,16})「([\s\S]*)」$/;
  const OPTION_RE = /^\+\s*(?:\[(.+?)\]\s*)?(.+?)\s*->\s*([\w]+)\s*(?:\|\s*(.*))?$/;

  function parseAll(scripts) {
    scripts = scripts || SCRIPTS;
    const cmds = [], labels = {}, errors = [], scenes = [], chapters = [];
    const labelAt = [];
    let curLabel = null, curChapter = null;
    scripts.forEach(function (sc) {
      const lines = sc.text.split(/\r?\n/);
      let choice = null;
      lines.forEach(function (raw, i) {
        const lineNo = i + 1;
        let line = raw.trim();
        const where = sc.file + ':' + lineNo;
        if (!line || line[0] === '#' || line.indexOf('//') === 0) return;

        if (line[0] === '+') {
          if (!choice) { errors.push(where + ' 選択肢の外に + 行があります'); return; }
          const m = OPTION_RE.exec(line);
          if (!m) { errors.push(where + ' 選択肢の書式エラー: ' + line); return; }
          try {
            choice.options.push({
              cond: m[1] ? compileExpr(m[1]) : null,
              text: m[2].trim(), target: m[3],
              effects: parseEffects(m[4] || ''), line: lineNo
            });
          } catch (e) { errors.push(where + ' ' + e.message); }
          return;
        }
        choice = null;

        let cond = null;
        const cm = /^\?\[(.+?)\]\s*(.*)$/.exec(line);
        if (cm) {
          try { cond = compileExpr(cm[1]); } catch (e) { errors.push(where + ' ' + e.message); return; }
          line = cm[2];
        }
        const base = { file: sc.file, line: lineNo, cond: cond };

        if (line[0] === '*') {
          const name = line.slice(1).trim();
          if (labels[name] !== undefined) errors.push(where + ' ラベル重複: ' + name);
          labels[name] = cmds.length;
          curLabel = name;
          cmds.push(Object.assign(base, { t: 'label', name: name }));
          labelAt.push(curLabel);
          return;
        }
        if (line[0] === '@') {
          const sp = line.indexOf(' ');
          const op = (sp < 0 ? line.slice(1) : line.slice(1, sp)).trim();
          const args = sp < 0 ? '' : line.slice(sp + 1).trim();
          const c = Object.assign(base, { t: 'cmd', op: op, args: args });
          try {
            if (op === 'choice') {
              choice = Object.assign(base, { t: 'choice', prompt: args, options: [] });
              cmds.push(choice); labelAt.push(curLabel); return;
            }
            if (op === 'if') {
              const m = /^(.+?)\s*->\s*([\w]+)$/.exec(args);
              if (!m) throw new Error('@if の書式エラー');
              c.expr = compileExpr(m[1]); c.target = m[2];
            } else if (op === 'goto' || op === 'call') {
              c.target = args;
            } else if (op === 'set') {
              c.effects = parseEffects(args);
            } else if (op === 'flag' || op === 'unflag') {
              c.effects = args.split(/[,\s]+/).filter(Boolean).map(function (f) { return { type: 'flag', id: f, value: op === 'flag' }; });
            } else if (op === 'route') {
              c.effects = [{ type: 'set', id: 'route', value: args }];
            } else if (op === 'chapter') {
              const m = /^(\S+)\s+(.*)$/.exec(args);
              c.id = m ? m[1] : args; c.title = m ? m[2] : args;
              curChapter = c.id;
              chapters.push({ id: c.id, title: c.title });
            } else if (op === 'scene') {
              const m = /^(\S+)\s+(.*)$/.exec(args);
              c.id = m ? m[1] : args; c.title = m ? m[2] : args;
              scenes.push({ id: c.id, title: c.title, chapter: curChapter, file: sc.file });
            }
          } catch (e) { errors.push(where + ' ' + e.message); return; }
          cmds.push(c); labelAt.push(curLabel);
          return;
        }
        const sm = SPEAKER_RE.exec(line);
        const t = Object.assign(base, { t: 'text' });
        if (sm) { t.speaker = sm[1]; t.text = '「' + sm[2] + '」'; }
        else { t.speaker = ''; t.text = line; }
        cmds.push(t); labelAt.push(curLabel);
      });
    });
    return { cmds: cmds, labels: labels, labelAt: labelAt, errors: errors, scenes: scenes, chapters: chapters };
  }

  function posOf(prog, pc) {
    const label = prog.labelAt[pc];
    return { label: label, offset: pc - prog.labels[label] };
  }
  function pcOf(prog, pos) {
    if (!pos || prog.labels[pos.label] === undefined) return -1;
    return prog.labels[pos.label] + pos.offset;
  }

  const api = {
    add: add, SCRIPTS: SCRIPTS, compileExpr: compileExpr, parseEffects: parseEffects,
    parseAll: parseAll, newState: newState, evalCond: evalCond, applyEffects: applyEffects,
    makeResolver: makeResolver, posOf: posOf, pcOf: pcOf
  };
  G.NovelCore = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
