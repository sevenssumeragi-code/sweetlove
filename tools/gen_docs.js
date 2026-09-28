#!/usr/bin/env node
// データから一覧系ドキュメントを生成する（手書きドキュメントとデータの食い違いを防ぐ）
// 生成物: docs/03b_フラグ・エンディング一覧_自動生成.md / docs/08_素材発注書_Codex用.md
'use strict';
const fs = require('fs');
const path = require('path');
const { load } = require('./lib');
const { prog, DATA } = load();
const D = path.join(__dirname, '..', 'docs');
const esc = (s) => String(s).replace(/\|/g, '｜');

// どこで使われているか
const where = { bg: {}, still: {}, bgm: {}, se: {}, chara: {} };
const chapOf = {};
let ch = '';
prog.cmds.forEach((c) => {
  if (c.t === 'cmd' && c.op === 'chapter') ch = c.title.split(/\s|　/)[0];
  if (c.t !== 'cmd') return;
  const id = c.args.split(/\s+/)[0];
  if (where[c.op === 'show' ? 'chara' : c.op] && id !== 'off' && id !== 'stop') {
    const k = c.op === 'show' ? 'chara' : c.op;
    (where[k][id] = where[k][id] || new Set()).add(c.file);
  }
});

// ---------- 03b ----------
let md = '# フラグ・エンディング一覧（自動生成）\n\n`node tools/gen_docs.js` で `game/data/flags.js` と `game/data/endings.js` から生成。手で編集しないこと。\n\n';
md += '## 重要フラグ（記憶のかけら）\n\n| ID | 名前 | ヒント帳表示 | 入手場所 | 効果 | 未入手時のヒント |\n|---|---|---|---|---|---|\n';
DATA.flags.forEach((f) => { md += `| ${f.id} | ${esc(f.name)} | ${f.key ? '★' : ''} | ${esc(f.where)} | ${esc(f.effect)} | ${esc(f.hint)} |\n`; });
md += '\n## パラメータ\n\n| 変数 | 範囲 | 初期値 | 意味 |\n|---|---|---|---|\n';
md += '| aff.reny / aff.hyu / aff.jin / aff.gel / aff.neo / aff.muni | 0-100 | 0 | 好感度。25でルート選択可、45で三角関係の成立、60で三角関係の甘い結末、80でHAPPY |\n';
md += '| house | 0-100 | 50 | 家の灯（住人のまとまり）。第八章終了時に30未満で「空き家」BAD。トゥルーは80以上 |\n';
md += '| mem | 0-7 | 0 | 記憶の断片。ヒュウルートのHAPPY・本火事の脱出に4以上が必要 |\n';
md += '| route | 文字列 | "" | 第八章「初雪の夜」で確定するルート |\n';
md += '| sys.endings | 0-27 | 0 | 回収済みエンディング数（周回データ）。トゥルー解放に5以上 |\n';
md += '\n## エンディング一覧と攻略ヒント（3段階）\n\n';
DATA.endings.forEach((e) => {
  md += `### [${e.typeLabel}] ${e.title}（${e.id}）— ${e.route}\n\n- スチル: ${e.still}\n`;
  e.hints.forEach((h, i) => { md += `- ヒント${i + 1}: ${h}\n`; });
  md += '\n';
});
md += '## シーン一覧（フローチャートの節点）\n\n';
let cur = null;
prog.scenes.forEach((s) => {
  if (s.chapter !== cur) { cur = s.chapter; const c = prog.chapters.find((x) => x.id === cur); md += `\n**${c ? c.title : cur}**：`; }
  md += `${s.title}（${s.id}）／`;
});
md += '\n';
fs.writeFileSync(path.join(D, '03b_フラグ・エンディング一覧_自動生成.md'), md);

// ---------- 08 素材発注書 ----------
const M = DATA.manifest;
let a = '# 素材発注書（Codex実装用・自動生成）\n\n';
a += 'このゲームは、グラフィックとBGM・効果音以外はすべて実装済みです。下表のパスにファイルを置くだけで、エンジンが自動的に読み込みます（ファイルが無い間はプレースホルダ表示・無音で動作）。\n\n';
a += '## 実装ルール\n\n- ファイル名・パスは `game/data/manifest.js` が正本。パスを変える場合は manifest.js を変更する。\n- 背景・スチル：1920×1080 JPG（またはWebP。拡張子を変えたら manifest.js も変更）。\n- 立ち絵：`assets/chara/{キャラID}/{表情}.png`。透過PNG、高さ1600px前後、膝上。表示位置は left / lc / center / rc / right の5点。\n- BGM：OGG（ループ前提、先頭と末尾をクロスフェード可能に）。SE：OGG。\n- 主人公は立ち絵なし。スチルに描く場合は黒髪・19歳・大学一年生。顔は描いてよいが、目元は前髪や角度で控えめに（夢小説的な没入感のため）。\n- 生成後は `node tools/validate.js` → `node tools/simulate.js` を実行し、エラーが無いことを確認する。\n- 音量・フェードは `engine.js` の `Audio_` オブジェクトを拡張して実装してよい（BGMのクロスフェード、SEの多重再生など）。\n\n';
a += '## キャラクター立ち絵\n\n| ID | 名前 | 設定 | 表情差分 | 使用ファイル |\n|---|---|---|---|---|\n';
Object.entries(M.chara).forEach(([id, c]) => { const d = DATA.characters[id] || {}; a += `| ${id} | ${d.name || id} | ${esc(d.profile || '')} | ${c.exprs.join(', ')} | ${[...(where.chara[id] || [])].join(', ')} |\n`; });
a += '\n### 主要キャラのビジュアル指定\n\n';
a += '- **レニィ**：青い髪（やわらかい癖毛）、青い目、眠たげな半目がデフォルト。オーバーサイズのパーカーやカーディガン。指先に機械油の汚れ（塔の時計修理）。\n';
a += '- **ヒュウ**：緑の髪、長い前髪で右目を隠す。見えている左目は赤。細身、白シャツに上品なジャケット。右目の周りに火傷痕（前髪を上げた差分／HAPPY後は短髪差分が必要）。\n';
a += '- **ジンパチ**：茶髪のツンツンヘア、日焼け、がっしり体型。Tシャツ／消防団の法被／紺のスーツ／消防の制服の衣装差分。\n';
a += '- **ムニ**：5歳、空色の髪、丸い頬。パジャマ・保育園スモック・黄色い長靴と雨合羽。狐のお面の小物。\n';
a += '- **ゲル**：紫のセミロングボブ、作業着（つなぎ）、油汚れ。女性らしさを強調しない凛とした立ち姿。第十二章以降は補聴器を着けた差分。\n';
a += '- **ネオ**：金髪ロング（背中まで）、仕立ての良いスーツ、高圧的な立ち姿。エプロン差分（ネオルート料理）、腕の包帯差分（ネオルート火事後）。\n';
a += '- **ハル（ソラ）**：焦げ茶の短髪（分け目の根元がわずかに青い）、エプロン、ポケットに色鉛筆。\n';
const sec = (title, kind, cols) => {
  a += `\n## ${title}\n\n| ID | ${cols} | ファイル | 使用箇所 |\n|---|---|---|---|\n`;
  Object.entries(M[kind]).forEach(([id, m]) => { a += `| ${id} | ${esc(m.name || m.desc || '')} | ${m.file || '（不要）'} | ${[...(where[kind][id] || [])].join(', ')} |\n`; });
};
sec('背景', 'bg', '内容');
a += '\n## スチル（イベントCG）— 制作と回収の指示\n\nスチルは `@still ID` で表示された瞬間にギャラリーへ登録（回収）される。「入手条件」は回収ヒントとしてギャラリーにも表示される。\n\n| ID | 区分 | タイトル | 入手条件 | 構図・演出指示 |\n|---|---|---|---|---|\n';
Object.entries(M.still).forEach(([id, m]) => { a += `| ${id} | ${m.group} | ${esc(m.title)} | ${esc(m.where)} | ${esc(m.desc)} |\n`; });
sec('BGM', 'bgm', '曲の指示');
sec('効果音', 'se', '内容');
fs.writeFileSync(path.join(D, '08_素材発注書_Codex用.md'), a);
console.log('docs/03b_フラグ・エンディング一覧_自動生成.md と docs/08_素材発注書_Codex用.md を生成しました');
