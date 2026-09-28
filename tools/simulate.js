#!/usr/bin/env node
// 動的検証：ランダム周回＋エンディング別の目標探索で、全エンディングの到達可能性を確認する。
// 到達した手順を docs/09_攻略チャート_自動生成.md に書き出す。
// 使い方: node tools/simulate.js [ランダム周回数=20000]
'use strict';
const fs = require('fs');
const path = require('path');
const { load, makeRunner } = require('./lib');
const { Core, prog, DATA } = load();

const sys = { endings: { a: 1, b: 1, c: 1, d: 1, e: 1 } }; // トゥルー解放条件(5種回収済み)を満たした状態で検証
const run = makeRunner(Core, prog, sys);
const N = Number(process.argv[2] || 20000);
const rnd = (n) => Math.floor(Math.random() * n);

// ---------- ランダム周回 ----------
const endCount = {}, errs = {}, sceneSeen = new Set(), stillSeen = new Set(), labelSeen = new Set();
for (let i = 0; i < N; i++) {
  const r = run((opts) => opts[rnd(opts.length)]);
  if (r.error) errs[r.error] = (errs[r.error] || 0) + 1;
  else endCount[r.ending] = (endCount[r.ending] || 0) + 1;
  r.trace.scenes.forEach((s) => sceneSeen.add(s));
  r.trace.stills.forEach((s) => stillSeen.add(s));
  r.trace.labels.forEach((s) => labelSeen.add(s));
}

// ---------- 目標探索 ----------
function strategy(goal, eps) {
  const sim = goal.sim;
  const want = new Set(sim.flags || []), avoid = new Set(sim.avoid || []);
  const also = sim.also || [];
  // キャラごとの目標値。目標に届いていないキャラほど優先する（三角関係・トゥルーの両立用）
  const target = {};
  ['reny', 'hyu', 'jin', 'gel', 'neo', 'muni'].forEach((c) => {
    target[c] = c === sim.route ? (goal.type === 'triangle' ? 72 : 90) : also.includes(c) ? 72 : sim.balance ? 45 : 0;
  });
  return (opts, state) => {
    if (Math.random() < eps) return opts[rnd(opts.length)];
    let best = [], bs = -1e9;
    for (const o of opts) {
      let s = Math.random() * 0.5;
      const t = o.target;
      if (t.startsWith('ch08_lock_')) s += t === 'ch08_lock_' + sim.route ? 1000 : -1000;
      if (t === 'ch11_alone') s += sim.alone ? 500 : -500;
      if (/^ch12_tri_/.test(t)) s += goal.type === 'triangle' && t === 'ch12_tri_' + goal.id.split('_')[1] ? 500 : -500;
      if (t === 'ch12_true_gate') s += goal.type === 'true' ? 500 : -500;
      for (const e of o.effects) {
        if (e.type === 'flag' && e.value) { if (want.has(e.id)) s += 40; if (avoid.has(e.id)) s -= 60; }
        if (e.type === 'add' && e.id.startsWith('aff.')) {
          const c = e.id.slice(4);
          if (sim.empty) s -= e.n * 3;
          else if (target[c] > 0) {
            const lack = Math.max(0, target[c] - state.vars['aff.' + c]);
            s += e.n * (lack > 0 ? 1.5 + lack / 15 : 0.2);
          }
        }
        if (e.type === 'add' && e.id === 'house') s += sim.empty ? -e.n : e.n * 0.6;
      }
      if (s > bs) { bs = s; best = [o]; } else if (s === bs) best.push(o);
    }
    return best[rnd(best.length)];
  };
}

const found = {};
for (const e of DATA.endings) {
  for (let i = 0; i < 4000 && !found[e.id]; i++) {
    const eps = i < 50 ? 0 : Math.min(0.35, 0.02 + i / 8000);
    const r = run(strategy(e, eps));
    if (r.ending === e.id) found[e.id] = r;
  }
}

// ---------- 出力 ----------
const names = { reny: 'レニィ', hyu: 'ヒュウ', jin: 'ジンパチ', gel: 'ゲル', neo: 'ネオ', muni: 'ムニ' };
console.log(`=== ランダム周回 ${N} 回 ===`);
DATA.endings.forEach((e) => console.log(`${(endCount[e.id] || 0).toString().padStart(6)}  ${e.id}  ${e.title}`));
Object.entries(errs).forEach(([m, n]) => console.log(`ERROR x${n}: ${m}`));
console.log(`シーン到達 ${sceneSeen.size}/${prog.scenes.length}  スチル到達 ${stillSeen.size}/${Object.keys(DATA.manifest.still).length}  ラベル到達 ${labelSeen.size}/${Object.keys(prog.labels).length}`);
console.log('\n=== 目標探索（攻略手順の発見） ===');
let ok = 0;
DATA.endings.forEach((e) => {
  const r = found[e.id];
  if (r) { ok++; const v = r.state.vars; console.log(`✓ ${e.id.padEnd(15)} 選択${r.trace.choices.length}回  ` + Object.keys(names).map((k) => names[k] + v['aff.' + k]).join(' ') + ` 灯${v.house} 記憶${v.mem}`); }
  else console.log(`✗ ${e.id.padEnd(15)} 到達手順が見つからない`);
});
const missingStill = Object.keys(DATA.manifest.still).filter((s) => !stillSeen.has(s) && !Object.values(found).some((r) => r.trace.stills.includes(s)));
if (missingStill.length) console.log('未到達スチル: ' + missingStill.join(', '));

// 攻略チャート
let md = '# 攻略チャート（自動生成）\n\n`node tools/simulate.js` が実際にシナリオを実行して見つけた、各エンディングへの選択肢の一例です。\n' +
  '（手順は一例。★の付く重要選択以外は自由に変えても到達できることが多い）\n\n';
DATA.endings.forEach((e) => {
  const r = found[e.id];
  md += `## ${e.typeLabel}「${e.title}」 (${e.id}) — ${e.route}\n\n`;
  if (!r) { md += '（未発見）\n\n'; return; }
  const v = r.state.vars;
  md += `最終パラメータ：${Object.keys(names).map((k) => names[k] + ' ' + v['aff.' + k]).join(' / ')} / 家の灯 ${v.house} / 記憶 ${v.mem}\n\n`;
  md += `取得フラグ：${Object.keys(r.state.flags).filter((f) => r.state.flags[f] && !f.startsWith('F_T_')).join(', ') || 'なし'}\n\n`;
  md += '| # | 場所 | 選んだ選択肢 |\n|---|---|---|\n';
  r.trace.choices.forEach((c, i) => { md += `| ${i + 1} | ${c.where}${c.prompt ? ' ' + c.prompt : ''} | ${c.text.replace(/\|/g, '｜')} |\n`; });
  md += '\n';
});
fs.writeFileSync(path.join(__dirname, '..', 'docs', '09_攻略チャート_自動生成.md'), md);
console.log(`\n${ok}/${DATA.endings.length} エンディングに到達。docs/09_攻略チャート_自動生成.md を更新しました。`);
process.exit(ok === DATA.endings.length && !Object.keys(errs).length ? 0 : 1);
