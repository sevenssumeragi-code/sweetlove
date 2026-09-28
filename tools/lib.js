// Node用ローダー：index.html の <script> 順にデータとシナリオを読み込む
'use strict';
const fs = require('fs');
const path = require('path');

const GAME = path.join(__dirname, '..', 'game');

function load() {
  const html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]).filter((s) => !s.endsWith('engine.js'));
  for (const k of Object.keys(require.cache)) if (k.startsWith(GAME)) delete require.cache[k];
  delete globalThis.GAME_DATA;
  for (const s of srcs) require(path.join(GAME, s));
  const Core = globalThis.NovelCore;
  Core.SCRIPTS.length = 0;
  for (const s of srcs.filter((x) => x.startsWith('scenario/'))) {
    delete require.cache[require.resolve(path.join(GAME, s))];
    require(path.join(GAME, s));
  }
  const prog = Core.parseAll();
  return { Core, prog, DATA: globalThis.GAME_DATA, srcs };
}

// ヘッドレス実行器（engine.js と同じ意味論）
function makeRunner(Core, prog, sys) {
  return function run(pickChoice, opts) {
    opts = opts || {};
    const state = Core.newState();
    state.pc = prog.labels[opts.from || 'start'];
    const trace = { choices: [], scenes: [], stills: [], labels: new Set() };
    let steps = 0;
    while (steps++ < 200000) {
      const c = prog.cmds[state.pc];
      if (!c) return { error: '終端に到達 pc=' + state.pc, state, trace };
      if (c.cond && !Core.evalCond(c.cond, state, sys)) { state.pc++; continue; }
      if (c.t === 'label') { trace.labels.add(c.name); state.pc++; continue; }
      if (c.t === 'text') { state.pc++; continue; }
      if (c.t === 'choice') {
        const opts2 = c.options.filter((o) => !o.cond || Core.evalCond(o.cond, state, sys));
        if (!opts2.length) return { error: '選択肢が0個 ' + c.file + ':' + c.line, state, trace };
        const o = pickChoice(opts2, state, c);
        trace.choices.push({ where: c.file + ':' + c.line, prompt: c.prompt, text: o.text });
        Core.applyEffects(o.effects, state);
        state.pc = prog.labels[o.target];
        if (state.pc === undefined) return { error: '未定義ラベル ' + o.target, state, trace };
        continue;
      }
      switch (c.op) {
        case 'set': case 'flag': case 'unflag': case 'route': Core.applyEffects(c.effects, state); break;
        case 'if': if (Core.evalCond(c.expr, state, sys)) { state.pc = prog.labels[c.target]; continue; } break;
        case 'goto': state.pc = prog.labels[c.target]; continue;
        case 'call': state.stack.push(state.pc + 1); state.pc = prog.labels[c.target]; continue;
        case 'return': state.pc = state.stack.pop(); continue;
        case 'scene': trace.scenes.push(c.id); break;
        case 'still': if (c.args !== 'off') trace.stills.push(c.args); break;
        case 'ending': return { ending: c.args, state, trace };
        case 'end': return { error: '@end', state, trace };
        default: break;
      }
      state.pc++;
    }
    return { error: '無限ループの疑い', state, trace };
  };
}

module.exports = { load, makeRunner, GAME };
