#!/usr/bin/env node
// 静的検証：ラベル・素材・フラグ・エンディング・口調ルール・到達可能性
// 使い方: node tools/validate.js
'use strict';
const { load } = require('./lib');
const { prog, DATA } = load();

const errors = [...prog.errors];
const warns = [];
const E = (m) => errors.push(m);
const W = (m) => warns.push(m);
const at = (c) => c.file + ':' + c.line;

// ---------- ラベル参照 ----------
const targets = [];
prog.cmds.forEach((c, i) => {
  if (c.t === 'choice') c.options.forEach((o) => targets.push([o.target, c]));
  if (c.t === 'cmd' && ['goto', 'if', 'call'].includes(c.op)) targets.push([c.target, c]);
});
targets.forEach(([t, c]) => { if (prog.labels[t] === undefined) E(at(c) + ' 未定義ラベル: ' + t); });
if (prog.labels.start === undefined) E('開始ラベル *start がありません');

// ---------- 素材 ----------
const M = DATA.manifest;
const used = { bg: new Set(), still: new Set(), bgm: new Set(), se: new Set(), chara: new Set() };
prog.cmds.forEach((c) => {
  if (c.t !== 'cmd') return;
  const a = c.args.split(/\s+/);
  if (c.op === 'bg') { used.bg.add(a[0]); if (!M.bg[a[0]]) E(at(c) + ' 背景未定義: ' + a[0]); }
  if (c.op === 'still' && a[0] !== 'off') { used.still.add(a[0]); if (!M.still[a[0]]) E(at(c) + ' スチル未定義: ' + a[0]); }
  if (c.op === 'bgm' && a[0] !== 'stop') { used.bgm.add(a[0]); if (!M.bgm[a[0]]) E(at(c) + ' BGM未定義: ' + a[0]); }
  if (c.op === 'se') { used.se.add(a[0]); if (!M.se[a[0]]) E(at(c) + ' SE未定義: ' + a[0]); }
  if (c.op === 'show') { used.chara.add(a[0]); if (!M.chara[a[0]]) E(at(c) + ' 立ち絵キャラ未定義: ' + a[0]); if (!a[1]) W(at(c) + ' 表情指定なし'); else if (M.chara[a[0]] && !M.chara[a[0]].exprs.includes(a[1])) E(at(c) + ` 表情未定義: ${a[0]} ${a[1]}`); }
  if (c.op === 'effect' && !['shake', 'flash', 'black', 'white', 'red'].includes(a[0])) E(at(c) + ' 未知のeffect: ' + a[0]);
});
['bg', 'still', 'bgm', 'se'].forEach((k) => Object.keys(M[k]).forEach((id) => { if (!used[k].has(id) && !(k === 'bg' && ['title', 'black'].includes(id)) && !(k === 'bgm' && id === 'title')) W(`${k} 未使用: ${id}`); }));

// ---------- エンディング ----------
const endingIds = new Set(DATA.endings.map((e) => e.id));
const usedEndings = new Set();
prog.cmds.forEach((c) => { if (c.t === 'cmd' && c.op === 'ending') { usedEndings.add(c.args); if (!endingIds.has(c.args)) E(at(c) + ' endings.js に無いエンディング: ' + c.args); } });
endingIds.forEach((id) => { if (!usedEndings.has(id)) E('シナリオで使われていないエンディング: ' + id); });
DATA.endings.forEach((e) => { if (!e.hints || e.hints.length !== 3) E('ヒントが3段階でない: ' + e.id); if (!M.still[e.still]) E('エンディングスチル未定義: ' + e.id + ' ' + e.still); });

// ---------- フラグ ----------
const setF = new Map(), readF = new Map();
const addTo = (m, id, c) => { if (!m.has(id)) m.set(id, []); m.get(id).push(at(c)); };
prog.cmds.forEach((c) => {
  const effs = c.t === 'choice' ? c.options.flatMap((o) => o.effects) : (c.effects || []);
  effs.forEach((e) => { if ((e.type === 'flag') && e.value) addTo(setF, e.id, c); });
  const exprs = [c.cond, c.expr].concat(c.t === 'choice' ? c.options.map((o) => o.cond) : []).filter(Boolean);
  exprs.forEach((x) => x.ids.filter((i) => i.startsWith('F_')).forEach((i) => addTo(readF, i, c)));
});
readF.forEach((w, id) => { if (!setF.has(id)) E(`フラグが参照されているが一度も立たない: ${id} (${w[0]})`); });
setF.forEach((w, id) => { if (!readF.has(id)) W(`フラグが立つが参照されない（伏線未回収の疑い）: ${id} (${w[0]})`); });
const registered = new Set(DATA.flags.map((f) => f.id));
new Set([...setF.keys(), ...readF.keys()]).forEach((id) => { if (!id.startsWith('F_T_') && !registered.has(id)) E('flags.js 未登録フラグ: ' + id); });
registered.forEach((id) => { if (!setF.has(id)) E('flags.js に登録済みだがシナリオで立たない: ' + id); });

// ---------- 変数 ----------
const knownVars = new Set(['aff.reny', 'aff.hyu', 'aff.jin', 'aff.gel', 'aff.neo', 'aff.muni', 'house', 'mem', 'route', 'sys.endings', 'true', 'false']);
prog.cmds.forEach((c) => {
  const exprs = [c.cond, c.expr].concat(c.t === 'choice' ? c.options.map((o) => o.cond) : []).filter(Boolean);
  exprs.forEach((x) => x.ids.forEach((i) => { if (!i.startsWith('F_') && !i.startsWith('tmp.') && !knownVars.has(i)) E(at(c) + ' 未知の変数: ' + i); }));
  const effs = c.t === 'choice' ? c.options.flatMap((o) => o.effects) : (c.effects || []);
  effs.forEach((e) => { if (e.type !== 'flag' && !e.id.startsWith('tmp.') && !knownVars.has(e.id)) E(at(c) + ' 未知の変数への代入: ' + e.id); });
});

// ---------- 話者・口調 ----------
const speakers = new Set(['{name}', 'レニィ', 'ヒュウ', 'ジンパチ', 'ムニ', 'ゲル', 'ネオ', 'ハル', 'ソラ', '渡会', 'あおい', '鳳源一郎', '久我', '綾小路麗華', '鷹取しず', 'レニィの母', '大貫', '客', 'ゲル・ジンパチ', 'レニィ・ネオ', 'ジンパチ（', ]);
const rules = {
  'ゲル': [[/貴様/, 'ゲルは「貴様」を使わない'], [/俺|僕/, 'ゲルの一人称は「私」']],
  'レニィ': [[/俺|貴様/, 'レニィの一人称は「僕」'], [/ジンパチ(さん|くん)|ヒュウ(さん|くん)/, 'レニィはジンパチ・ヒュウを呼び捨て']],
  'ヒュウ': [[/俺|貴様/, 'ヒュウは敬語・一人称「僕」'], [/ジンパチ(?!くん)/, 'ヒュウはジンパチを「ジンパチくん」と呼ぶ'], [/レニィ(さん|くん)/, 'ヒュウはレニィを呼び捨て']],
  'ジンパチ': [[/僕|貴様/, 'ジンパチの一人称は「俺」']],
  'ネオ': [[/僕|俺|あなた|お前/, 'ネオの一人称は「私」、二人称は「貴様」']],
};
prog.cmds.forEach((c) => {
  if (c.t !== 'text' || !c.speaker) return;
  const sp = c.speaker;
  if (!speakers.has(sp) && !/^ジンパチ/.test(sp)) W(at(c) + ' 未登録の話者名: ' + sp);
  (rules[sp] || []).forEach(([re, msg]) => {
    const body = c.text.replace(/『[^』]*』/g, '');
    if (re.test(body)) E(`${at(c)} 口調違反(${msg}): ${c.text.slice(0, 50)}`);
  });
});

// ---------- 到達可能性 ----------
const reach = new Set();
const stack = [prog.labels.start];
while (stack.length) {
  let pc = stack.pop();
  while (pc !== undefined && pc < prog.cmds.length && !reach.has(pc)) {
    reach.add(pc);
    const c = prog.cmds[pc];
    if (c.t === 'choice') { c.options.forEach((o) => stack.push(prog.labels[o.target])); break; }
    if (c.t === 'cmd') {
      if (c.op === 'goto' && !c.cond) { stack.push(prog.labels[c.target]); break; }
      if (c.op === 'goto' || c.op === 'if') stack.push(prog.labels[c.target]);
      if (c.op === 'call') stack.push(prog.labels[c.target]);
      if ((c.op === 'ending' || c.op === 'end' || c.op === 'return') && !c.cond) break;
    }
    const next = prog.cmds[pc + 1];
    if (next && next.file !== c.file && !(c.t === 'cmd' && ['return', 'ending', 'end'].includes(c.op))) E(`${at(c)} ファイル境界を越えてフォールスルーします`);
    pc++;
  }
}
Object.entries(prog.labels).forEach(([name, pc]) => { if (!reach.has(pc)) E('到達不能ラベル: ' + name + ' (' + at(prog.cmds[pc]) + ')'); });

// ---------- 集計 ----------
const textLines = prog.cmds.filter((c) => c.t === 'text');
const chars = textLines.reduce((n, c) => n + c.text.length, 0);
console.log('=== 凪ノ家の十二通 シナリオ検証 ===');
console.log(`ラベル ${Object.keys(prog.labels).length} / テキスト行 ${textLines.length} / 本文 ${chars} 文字 / 選択肢 ${prog.cmds.filter((c) => c.t === 'choice').length} / シーン ${prog.scenes.length}`);
console.log(`エンディング ${endingIds.size} / スチル ${Object.keys(M.still).length} / 背景 ${Object.keys(M.bg).length} / BGM ${Object.keys(M.bgm).length} / SE ${Object.keys(M.se).length}`);
warns.forEach((w) => console.log('WARN  ' + w));
errors.forEach((e) => console.log('ERROR ' + e));
console.log(errors.length ? `\n✗ エラー ${errors.length} 件` : '\n✓ エラーなし');
process.exit(errors.length ? 1 : 0);
