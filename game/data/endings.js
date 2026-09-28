/*
 * エンディング定義＋攻略ヒント（3段階）＋シミュレータ用の攻略方針(sim)
 * hints[0]=ぼかし / hints[1]=方向性 / hints[2]=具体的条件
 */
(function (G) {
  G.GAME_DATA = G.GAME_DATA || {};
  const L = { happy: 'HAPPY', normal: 'NORMAL', bad: 'BAD', triangle: 'TRIANGLE', common_bad: 'BAD', true: 'TRUE' };
  const E = [
    // レニィ
    { id: 'reny_happy', char: 'reny', type: 'happy', route: 'レニィルート', title: 'おはようの約束', still: 'st_e_reny_happy',
      hints: ['眠たがりの彼が、朝を待てるようになるには。', '夜をひとりで背負わせないこと。そして、彼が「さよなら」から逃げないように隣にいること。', 'レニィルートで：第七章でレニィの隣に座る(夜番)→第九章「夜番を半分こ」で小指を差し出す→第十章で母に会いに一緒に行く。好感度80以上。'],
      sim: { route: 'reny', flags: ['F_RENY_NIGHT', 'F_RENY_SHARE', 'F_RENY_MOTHER', 'F_CLOCK_SEEN'], avoid: [] } },
    { id: 'reny_normal', char: 'reny', type: 'normal', route: 'レニィルート', title: '春眠、窓辺にて', still: 'st_e_reny_normal',
      hints: ['星の下で、彼は何かを言いかけた。', 'レニィルートで、大事な約束を一つ取りこぼすと……。', 'レニィルートで、火事を無事に越えたが、HAPPYの条件（好感度80・夜の半分こ・母に会う）のどれかが足りない。'],
      sim: { route: 'reny', flags: ['F_RENY_SHARE'], avoid: ['F_RENY_MOTHER'] } },
    { id: 'reny_bad', char: 'reny', type: 'bad', route: 'レニィルート', title: '眠り姫はきみのほう', still: 'st_e_reny_bad',
      hints: ['ひとりで起き続けた人は、いつか。', '彼が全部をひとりで抱えたまま、あの夜を迎えると……。', 'レニィルートで「夜番を半分こ」の約束をせず、第十一章で屋根裏を見張らずに眠る。'],
      sim: { route: 'reny', flags: [], avoid: ['F_RENY_SHARE', 'F_FEB_WARNING'] } },
    // ヒュウ
    { id: 'hyu_happy', char: 'hyu', type: 'happy', route: 'ヒュウルート', title: '両目で描く君', still: 'st_e_hyu_happy',
      hints: ['十五年描けなかった絵が、完成する日。', '仮面の下を受け入れ、あの夜の記憶を取り戻すこと。彼の「帰る場所」も大切に。', 'ヒュウルートで：仮面の下の顔を受け入れる(第七章か第九章)、第八章でHYU_PLATEかAOI_MET、記憶の断片4以上、好感度80以上。'],
      sim: { route: 'hyu', flags: ['F_HYU_SCAR_ACCEPT', 'F_HYU_PLATE', 'F_AOI_MET', 'F_HYU_CANDLE'], avoid: [] } },
    { id: 'hyu_normal', char: 'hyu', type: 'normal', route: 'ヒュウルート', title: '片目の自画像', still: 'st_e_hyu_normal',
      hints: ['前髪を切るのは、もう少し先。', '傷は受け入れた。でも、何かがまだ足りない。', 'ヒュウルートでBADを回避したが、好感度80・記憶4以上・(HYU_PLATEかAOI_MET)のどれかが足りない。'],
      sim: { route: 'hyu', flags: ['F_HYU_SCAR_ACCEPT'], avoid: ['F_HYU_PLATE', 'F_AOI_MET'] } },
    { id: 'hyu_bad', char: 'hyu', type: 'bad', route: 'ヒュウルート', title: '描かれなかった肖像', still: 'st_e_hyu_bad',
      hints: ['仮面は、最後まで外れなかった。', '彼の傷を、正面から受け止めなかったら。', 'ヒュウルートで、仮面の下の顔を一度も受け入れない（第七章「見てないです」、第九章「時間をちょうだい」）。または本火事で記憶4未満。'],
      sim: { route: 'hyu', flags: [], avoid: ['F_HYU_SCAR_ACCEPT'] } },
    // ジンパチ
    { id: 'jin_happy', char: 'jin', type: 'happy', route: 'ジンパチルート', title: '炎の向こうのただいま', still: 'st_e_jin_happy',
      hints: ['言いそびれた言葉を、今度こそ。', '父の最期の夜のことを知り、そして、彼が出かける朝に。', 'ジンパチルートで：第十章で墓参りに同行→第十一章の朝「いってらっしゃい、必ず帰ってきてね」。好感度80以上。'],
      sim: { route: 'jin', flags: ['F_JIN_GRAVE', 'F_JIN_PROMISE', 'F_JIN_FEAR_KNOWN'], avoid: [] } },
    { id: 'jin_normal', char: 'jin', type: 'normal', route: 'ジンパチルート', title: '消防士の背中', still: 'st_e_jin_normal',
      hints: ['半年後の秋に、続きがある。', '約束はした。でも、何かが足りない。', 'ジンパチルートでBADを回避したが、好感度80・墓参り・「いってらっしゃい」のどれかが足りない。'],
      sim: { route: 'jin', flags: ['F_JIN_PROMISE'], avoid: ['F_JIN_GRAVE'] } },
    { id: 'jin_bad', char: 'jin', type: 'bad', route: 'ジンパチルート', title: '父と同じ場所へ', still: 'st_e_jin_bad',
      hints: ['二人目を、助けに戻った。', '手紙は「いってらっしゃい」を言ってあげて、と書いていた。', 'ジンパチルートで第十一章の朝「がんばってね」を選び、さらに屋根裏を見張らずに眠る。'],
      sim: { route: 'jin', flags: [], avoid: ['F_JIN_PROMISE', 'F_FEB_WARNING'] } },
    // ゲル
    { id: 'gel_happy', char: 'gel', type: 'happy', route: 'ゲルルート', title: 'きこえる、きこえない、好き', still: 'st_e_gel_happy',
      hints: ['音がなくても、確かな言葉。', '彼女の秘密を正面から受け止め、声以外の言葉を覚え、背負った罪を下ろさせること。', 'ゲルルートで：耳の秘密を聞く(GEL_TRUTH)、第十章で祖母の日記を見せる、手話教室に通う。好感度80以上。'],
      sim: { route: 'gel', flags: ['F_GEL_BACK1', 'F_GEL_BACK2', 'F_GEL_TRUTH', 'F_SIGN', 'F_GEL_GUILT_FREED'], avoid: [] } },
    { id: 'gel_normal', char: 'gel', type: 'normal', route: 'ゲルルート', title: '指先の約束', still: 'st_e_gel_normal',
      hints: ['言葉は、もう少し先に。', '秘密は分かち合えた。でも……。', 'ゲルルートで耳の秘密は聞けたが、好感度80・手話・日記のどれかが足りない。'],
      sim: { route: 'gel', flags: ['F_GEL_TRUTH'], avoid: ['F_SIGN'] } },
    { id: 'gel_bad', char: 'gel', type: 'bad', route: 'ゲルルート', title: '無音の海', still: 'st_e_gel_bad',
      hints: ['背中から呼んでも、振り向かない人。', '最後まで、彼女の秘密に正面から触れなかったら。', 'ゲルルートで、耳の秘密を聞く機会（第八章・第九章・第十章）をすべて逃す。'],
      sim: { route: 'gel', flags: [], avoid: ['F_GEL_TRUTH', 'F_GEL_BACK1', 'F_GEL_BACK2'] } },
    // ネオ
    { id: 'neo_happy', char: 'neo', type: 'happy', route: 'ネオルート', title: '王冠を捨てた日', still: 'st_e_neo_happy',
      hints: ['欲しいものを、欲しいと言う日。', '嘘を見抜き、証拠を揃え、彼のいる場所まで行くこと。', 'ネオルートで：家の生まれ①②③を揃える、第九章で契約書を最後まで読む、第十章で東京へ行く。好感度80以上。'],
      sim: { route: 'neo', flags: ['F_ARCHIVE_1', 'F_ARCHIVE_2', 'F_ARCHIVE_3', 'F_NEO_DOC_READFULL', 'F_NEO_TOKYO'], avoid: [] } },
    { id: 'neo_normal', char: 'neo', type: 'normal', route: 'ネオルート', title: '仮契約の恋人', still: 'st_e_neo_normal',
      hints: ['契約書は、毎年更新される。', 'ネオは帰ってきた。でも、まだ素直になれない。', 'ネオルートでネオが帰還したが、好感度80・契約書を最後まで読む・東京へ行くのどれかが足りない。'],
      sim: { route: 'neo', flags: ['F_ARCHIVE_1', 'F_ARCHIVE_2', 'F_ARCHIVE_3'], avoid: ['F_NEO_TOKYO', 'F_NEO_DOC_READFULL'] } },
    { id: 'neo_bad', char: 'neo', type: 'bad', route: 'ネオルート', title: '王の帰還', still: 'st_e_neo_bad',
      hints: ['家は守られた。王冠と引き換えに。', '感情だけでは、あの人の父は動かない。', 'ネオルートで「家の生まれ③（設計図）」を手に入れられない。'],
      sim: { route: 'neo', flags: [], avoid: ['F_ARCHIVE_1', 'F_ARCHIVE_3'] } },
    // ムニ
    { id: 'muni_happy', char: 'muni', type: 'happy', route: 'ムニルート', title: 'ただいま、おかえり', still: 'st_e_muni_happy',
      hints: ['おうちは、ひとつ。', 'ママと和解できるよう急がず待ち、誕生日を家族全員で。', 'ムニルートで：ソラが自分で言えるまで待つ(第十章)、誕生日会をみんなで準備(第十一章)、ソラと和解。好感度80以上。'],
      sim: { route: 'muni', flags: ['F_SORA_WAIT', 'F_MUNI_BIRTHDAY', 'F_SORA_NOTICE', 'F_PROMISE_MUNI'], avoid: [] } },
    { id: 'muni_normal', char: 'muni', type: 'normal', route: 'ムニルート', title: 'またね、おねえちゃん', still: 'st_e_muni_normal',
      hints: ['灯台の町へ。', 'ママとは和解できた。でも……。', 'ムニルートでソラと和解したが、好感度80・誕生日の準備のどれかが足りない。'],
      sim: { route: 'muni', flags: ['F_SORA_WAIT'], avoid: ['F_MUNI_BIRTHDAY'] } },
    { id: 'muni_bad', char: 'muni', type: 'bad', route: 'ムニルート', title: 'わすれんぼうのムニ', still: 'st_e_muni_bad',
      hints: ['「……だれ？」', '三年の空白を、急いで埋めようとすると。', 'ムニルートで、第十章に今すぐ真実を話し、さらに塔でもう一度会うよう誘わない（ソラと和解できない）。'],
      sim: { route: 'muni', flags: [], avoid: ['F_SORA_WAIT'] } },
    // 三角関係
    { id: 'tri_jh_sweet', char: 'tri', type: 'triangle', route: 'ジンパチ×ヒュウ', title: '灰と星の三人', still: 'st_e_tri_jh_sweet',
      hints: ['あの夜に繋がる三人で。', '二人の間に飛び込んだ日から、三人の関係は始まった。', '第七章で二人の間に飛び込む(TRI_JH)→ジンパチかヒュウのルートで、もう一方の好感度も45以上に→第十二章で「三人で」。両者60以上＋屋根裏を見張る。'],
      sim: { route: 'jin', flags: ['F_TRI_JH', 'F_FEB_WARNING'], also: ['hyu'], avoid: [] } },
    { id: 'tri_jh_bitter', char: 'tri', type: 'triangle', route: 'ジンパチ×ヒュウ', title: '焼け跡の春', still: 'st_e_tri_jh_bitter',
      hints: ['優しすぎた二人。', '三人を選ぶには、想いがまだ足りなかった。', 'TRI_JHの状態で第十二章に「三人で」を選んだが、両者の好感度60・屋根裏の見張りのどれかが足りない。'],
      sim: { route: 'hyu', flags: ['F_TRI_JH', 'F_HYU_SCAR_ACCEPT'], also: ['jin'], avoid: ['F_FEB_WARNING'] } },
    { id: 'tri_rn_sweet', char: 'tri', type: 'triangle', route: 'レニィ×ネオ', title: '朝と夜の王国', still: 'st_e_tri_rn_sweet',
      hints: ['夜の当番と、朝の当番。', '屋根の上の毛布から始まった関係。王様が家に帰ってこなければ成立しない。', '第五章で屋根の上の毛布にネオを入れる(TRI_RN)→レニィかネオのルートで、ネオ帰還(NEO_BACK)＋もう一方の好感度45以上→第十二章で「三人で」。両者60以上＋屋根裏を見張る。'],
      sim: { route: 'reny', flags: ['F_TRI_RN', 'F_ARCHIVE_1', 'F_ARCHIVE_2', 'F_ARCHIVE_3', 'F_FEB_WARNING', 'F_RENY_SHARE'], also: ['neo'], avoid: [] } },
    { id: 'tri_rn_bitter', char: 'tri', type: 'triangle', route: 'レニィ×ネオ', title: '二人ぶんの空席', still: 'st_e_tri_rn_bitter',
      hints: ['朝と夜は、同じ場所にいられない。', '三人を選ぶには、何かが欠けていた。', 'TRI_RNの状態で第十二章に「三人で」を選んだが、両者の好感度60・ネオ帰還・屋根裏の見張りのどれかが足りない。'],
      sim: { route: 'neo', flags: ['F_TRI_RN', 'F_ARCHIVE_1', 'F_ARCHIVE_2', 'F_ARCHIVE_3'], also: ['reny'], avoid: ['F_FEB_WARNING'] } },
    { id: 'tri_gj_sweet', char: 'tri', type: 'triangle', route: 'ゲル×ジンパチ', title: '三人で走る海岸線', still: 'st_e_tri_gj_sweet',
      hints: ['腐れ縁は、切れなかった。', '夏祭りで二人に同時に誘われたとき。', '第四章で「三人で回ろう」(TRI_GJ)→ゲルかジンパチのルートで、もう一方の好感度45以上→第十二章で「三人で」。両者60以上＋ゲルの耳の秘密＋屋根裏を見張る。'],
      sim: { route: 'jin', flags: ['F_TRI_GJ', 'F_GEL_TRUTH', 'F_FEB_WARNING', 'F_GEL_BACK1', 'F_GEL_BACK2'], also: ['gel'], avoid: ['F_TRI_JH'] } },
    { id: 'tri_gj_bitter', char: 'tri', type: 'triangle', route: 'ゲル×ジンパチ', title: '幼馴染の終わり', still: 'st_e_tri_gj_bitter',
      hints: ['六年の腐れ縁に入った、最後のひび。', '三人を選ぶには、何かが足りなかった。', 'TRI_GJの状態で第十二章に「三人で」を選んだが、両者の好感度60・ゲルの耳の秘密・屋根裏の見張りのどれかが足りない。'],
      sim: { route: 'jin', flags: ['F_TRI_GJ', 'F_JIN_PROMISE'], also: ['gel'], avoid: ['F_FEB_WARNING', 'F_TRI_JH'] } },
    // 共通
    { id: 'bad_empty', char: 'common', type: 'common_bad', route: '共通（第八章）', title: '空き家', still: 'st_e_empty',
      hints: ['初雪の夜、誰の顔も浮かばなかった。', '誰とも深く関わらず、家もばらばらのまま十一月を終えると。', '第八章の終わりに、全員の好感度が25未満、または家の灯が30未満。'],
      sim: { route: '', flags: [], avoid: [], empty: true } },
    { id: 'bad_fire', char: 'common', type: 'common_bad', route: '共通（第十一章）', title: '焔の夜', still: 'st_e_fire',
      hints: ['十五年前と、同じ梁。', '手紙は何度も書いていた。ひとりで行かないこと、と。', '第十一章で屋根裏を見張らずに眠り、火事の中「ひとりで屋根裏へ飛び込む」を選ぶ。（どのルートでも起こる）'],
      sim: { route: 'jin', flags: [], avoid: ['F_FEB_WARNING'], alone: true } },
    { id: 'true', char: 'common', type: 'true', route: 'ムニルート（特別）', title: '凪ノ家の灯', still: 'st_true_2',
      hints: ['十二通の手紙の、すべてのお願いを叶えたとき。', 'この家の全員の秘密を、正面から受け止めること。家族の物語の、その先に。エンディングを5つ以上見てから。', 'エンディング5種以上回収済みで、ムニルート（ムニ好感度70以上・誕生日の準備・ソラと和解）＋全員の秘密を知る（レニィの夜番／ヒュウの仮面の下を受け入れる／ジンパチの恐れ／ゲルの耳）＋設計図(ARCHIVE_3)とネオ帰還＋嵐の夜に誰かを呼ぶ＋屋根裏を見張る＋家の灯80以上。第十二章で「みんなで決めよう」。'],
      sim: { route: 'muni', flags: ['F_SORA_WAIT', 'F_MUNI_BIRTHDAY', 'F_ARCHIVE_1', 'F_ARCHIVE_2', 'F_ARCHIVE_3', 'F_FEB_WARNING', 'F_STORM_CALL', 'F_RENY_NIGHT', 'F_GEL_BACK1', 'F_GEL_BACK2', 'F_GEL_TRUTH', 'F_HYU_SCAR_ACCEPT', 'F_JIN_FEAR_KNOWN'], avoid: [] } }
  ];
  E.forEach((e) => { e.typeLabel = L[e.type]; });
  G.GAME_DATA.endings = E;
  G.GAME_DATA.endingIndex = {};
  E.forEach((e) => { G.GAME_DATA.endingIndex[e.id] = e; });

  G.GAME_DATA.guideHtml = `
  <h2>遊び方</h2>
  <ul style="line-height:1.9;font-size:14px">
    <li>クリック／Enter／Space：文章を進める　Ctrl（長押し）：スキップ　A：オート　H：ウィンドウ非表示</li>
    <li>S：セーブ　L：ロード　Q：クイックセーブ　W：クイックロード　↑／ホイール上：バックログ　Tab：ヒント帳</li>
    <li>毎月一日に、祖母・千鶴の手紙が一通届きます。手紙の「お願い」には、必ず意味があります。</li>
    <li>選択肢の右に出るマーク：色つき●はそのキャラの好感度が上がる、▼は下がる、■は「家の灯」が上がる、★は重要な分岐（設定でOFFにできます）。</li>
    <li>第八章の終わり「初雪の夜」に、好感度25以上の相手からルートを選びます。</li>
    <li>「記憶のかけら」（重要フラグ）は、ヒント帳で確認できます。一度でも入手したものは、入手場所が表示されます。</li>
    <li>三角関係は、特定の場面で「二人とも」を選ぶことで発生します。</li>
    <li>トゥルーエンドは、エンディングを5つ以上見たあとに解放されます。</li>
  </ul>
  <h2>攻略の基本</h2>
  <ul style="line-height:1.9;font-size:14px">
    <li>ハッピーエンドの目安は、ルート相手の好感度80以上＋そのルートの「記憶のかけら」をすべて。</li>
    <li>バッドエンドは好感度不足ではなく、「ある選択」で起こります。ヒント帳の第2段階ヒントを参考に。</li>
    <li>「家の灯」が30未満だと、どのルートにも入れません。朝ごはん・ムニとの時間・家を温める選択で上がります。</li>
    <li>祖母の手紙に「従う」か「逆らう」かで、得られる情報が変わる章があります（第八章）。どちらも正解です。</li>
  </ul>`;
})(typeof globalThis !== 'undefined' ? globalThis : this);
