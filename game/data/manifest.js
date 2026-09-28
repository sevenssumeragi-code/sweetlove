/*
 * 素材マニフェスト（Codex実装用）
 * ここに書かれたパスにファイルを置けば、エンジンが自動で読み込む。ファイルが無い間はプレースホルダ表示。
 *  - 背景   : assets/bg/{id}.jpg        1920x1080
 *  - 立ち絵 : assets/chara/{id}/{expr}.png  高さ1600px目安・透過PNG・膝上
 *  - スチル : assets/still/{id}.jpg     1920x1080
 *  - BGM    : assets/bgm/{id}.ogg       ループ前提
 *  - SE     : assets/se/{id}.ogg
 * desc はアートディレクション／作曲指示。docs/08_素材発注書.md に詳細あり。
 */
(function (G) {
  G.GAME_DATA = G.GAME_DATA || {};

  const bgList = {
    black: '暗転（画像不要）', title: 'タイトル：夜明け前の坂の上の洋館と時計塔、遠くに灯台の光',
    train: '海沿いを走る電車の車内、窓の外に春の海', slope: '海へ下る石段の坂道、錆びた手すり、坂上に白い洋館と小さな時計塔(針は2:17)',
    entrance: '凪ノ家の玄関ホール、吹き抜け階段、磨かれた手すり', entrance_night: '夜の玄関ホール、全ての灯りが点いている', entrance_snow: '雪の日の玄関ホール', entrance_morning: '冬の朝の玄関、紺のスーツ姿を見送る位置',
    living: '居間、窓辺のソファ、古い洋風暖炉', living_rain: '梅雨の居間、曇った窓、廊下に洗濯物', living_night: '停電の居間、LEDランタン7つだけの白い光、布団が並ぶ', living_winter: '冬の居間、陽だまり',
    dining: '大きな食卓のダイニング、朝', dining_night: 'ダイニング夜・卓上IHの鍋', dining_xmas: 'クリスマスのダイニング、鶏の丸焼き、もみの木、電球の星', dining_spring: '春の朝のダイニング、空いた椅子が二つ',
    kitchen: '古いがよく手入れされた台所、手書きラベルの調味料瓶', kitchen_night: '夜の台所、灯り一つ', kitchen_winter: '冬の朝の台所',
    corridor: '二階廊下、朝', corridor_night: '夜の二階廊下、突き当たりの天井に屋根裏の四角い扉', corridor_fire: '夜の廊下、天井の隙間から煙、赤い光',
    heroine_room: '主人公の部屋、東向きの窓から海', heroine_room_night: '主人公の部屋・夜、月の道が海に', heroine_room_rain: '主人公の部屋・雨', heroine_room_winter: '主人公の部屋・冬', heroine_room_spring: '主人公の部屋・春の朝',
    reny_room: 'レニィの部屋：本と星図、天井に蓄光の星シール', hyu_room: 'ヒュウの部屋：半分アトリエ、自画像のキャンバス、鏡台', muni_room_night: 'ムニの部屋・夜、窓の外に庭',
    chizuru_room: '千鶴の書斎、アップライトピアノ、机、木箱', chizuru_room_night: '書斎・夜、ピアノの上に灯り', chizuru_room_spring: '書斎・春の光',
    attic: '屋根裏：焦げた梁、星形格子の丸窓、ランタンの白い光(嵐)', attic_night: '屋根裏・夜、星の窓から月明かり', attic_fire: '燃える屋根裏、星の窓',
    tower: '時計塔内部：歯車、振り子、小さな鐘、工具箱', tower_night: '時計塔内部・夜', tower_fire: '煙の降りてくる塔の螺旋階段', tower_spring: '修理後の塔内部、春',
    garden: '庭・朝もや', garden_night: '夜の庭、奥に幹の黒い桜、時計塔のシルエット', garden_snow_night: '初雪の夜の庭、焦げた桜に雪', garden_winter: '冬の庭、焦げた桜', garden_spring: '春の庭、焦げた桜につぼみ', garden_sakura: '満開の焦げた桜', garden_sunset: '夕暮れの庭',
    garage: 'ガレージ：船外機、作業灯', garage_night: '夜のガレージ', garage_spring: '春のガレージ、看板', garage_empty: '工具が消えたガレージ',
    roof_night: '天窓から出た屋根の上、満天の星', roof_snow: '雪の屋根の上',
    town: '灯凪町の商店街', library: '町の図書館・郷土資料の棚', cafe: '灯台下のカフェ「しおさい珈琲」店内', cafe_snow: '雪の日のしおさい珈琲', cafe_night: '閉店後のしおさい珈琲',
    beach: '五月の干潟', beach_evening: '夕方の浜', beach_summer: '夏の浜辺、パラソル', sea_float: '海に浮かぶ視点', sea_under: '海中の青い世界',
    lighthouse_rain: '雨の夜の古い灯台の根元、錆びた鉄扉、光の帯が空に',
    festival: '灯凪神社の夏祭り、提灯の参道', fireworks_sky: '夜空の花火', shrine_back: '社の裏、花火の光が届かない暗がり', festival_end: '祭りの帰り道の坂下、黒い高級車',
    house_ext_morning: '嵐の翌朝の凪ノ家外観、時計塔の針が動いている', house_ext_night: '夜の凪ノ家外観', house_ext_snow: '雪の凪ノ家外観', house_ext_spring: '春の凪ノ家外観', house_ext_winter: '冬の凪ノ家外観（寂しげ）', house_gate_spring: '門と桜とベンチ、春',
    fire_station: '港近くの消防団詰所(古いガレージ)', drill_ground: '消防団の訓練場、煙を噴く訓練棟',
    univ_festival: '大学祭の中庭、屋台', gallery: '美術学科の展示室、右目を隠した自画像が十枚', univ_night: '後夜祭の仮面舞踏会、夜のキャンパス広場',
    aoi_shop: '港町の小さな花屋', car_night: '夜の車内、窓の外に海', atelier: 'ヒュウのアトリエ(雨)', atelier_night: '夜のアトリエ、布をかけたキャンバス', atelier_winter: '冬のアトリエ', atelier_spring: '春のアトリエ', atelier_empty: '空っぽのアトリエ、イーゼル一つ',
    snow_street_night: '雪の坂道・夜', station_cafe: '隣町の駅のカフェ', station_spring: '春の灯凪駅ホーム',
    seawall_winter: '冬の防波堤', seawall_spring: '春の防波堤', cemetery_winter: '海の見える墓地・冬', cemetery_spring: '海の見える墓地・春',
    harbor_winter: '冬の港、クレーン', harbor_spring: '春の港', harbor_sunset: '夕暮れの港の防波堤', hospital: '病院の聴力検査室前の廊下', hospital_spring: '病室・窓際、春',
    community_center: '町の公民館・手話教室', tokyo_office: '鳳グループ本社の控え室', tokyo_boardroom: '本社最上階の会議室', tokyo_night: '東京の夜、本社ビル前',
    planetarium: '塔の中のプラネタリウム、天井いっぱいの星', coast_road: '海岸線を走る軽トラック'
  };
  const bg = {};
  Object.entries(bgList).forEach(([id, name]) => { bg[id] = { file: id === 'black' ? '' : `assets/bg/${id}.jpg`, name: name, ph: id === 'black' ? 'linear-gradient(#000,#000)' : '' }; });

  const std = ['normal', 'smile', 'laugh', 'sad', 'surprise', 'angry', 'blush', 'serious', 'troubled', 'cry', 'sleepy', 'smug', 'pain'];
  const sub = ['normal', 'smile', 'sad', 'surprise', 'serious', 'cry'];
  const chara = {};
  ['reny', 'hyu', 'jin', 'muni', 'gel', 'neo'].forEach((id) => { chara[id] = { pattern: `assets/chara/${id}/{expr}.png`, exprs: std }; });
  ['haru', 'watarai', 'kuga', 'onuki', 'aoi', 'genichiro', 'renymother', 'jinmother', 'reika'].forEach((id) => { chara[id] = { pattern: `assets/chara/${id}/{expr}.png`, exprs: sub }; });

  // [id, グループ, タイトル, 入手場所, 構図指示]
  const stills = [
    ['st_p_reny_bench', '共通', '桜の下の眠り', '序章', '門の脇の桜の下、ベンチで眠るレニィ。髪・頬・胸の文庫本に花びら。見下ろす構図'],
    ['st_p_muni_night', '共通', '夜のノック', '序章', '枕を抱えて扉の前に立つムニ、廊下の暗がり、部屋の灯りが顔に'],
    ['st_c1_breakfast', '共通', '七人の食卓', '第一章', '朝の大きな食卓、湯気、タコさんウインナー、泣きながら食べるムニ'],
    ['st_c2_tower_reny', 'レニィ', '歯車の部屋', '第二章／塔へ行く', '歯車に囲まれ工具箱を枕に眠るレニィ、油のしみた手、床に星座の図'],
    ['st_c3_lighthouse_reny', 'レニィ', '雨の灯台（レニィ）', '第三章／レニィと探す', '雨の灯台下、パーカーの中にムニを抱き込むレニィ'],
    ['st_c3_lighthouse_hyu', 'ヒュウ', '雨の灯台（ヒュウ）', '第三章／ヒュウと探す', '濡れた前髪が割れかけたヒュウがジャケットでムニを包む、街灯'],
    ['st_c3_lighthouse_jin', 'ジンパチ', '雨の灯台（ジンパチ）', '第三章／ジンパチと探す', '雨合羽の中にムニを抱えるジンパチ、懐中電灯、赤い目'],
    ['st_c3_lighthouse_gel', 'ゲル', '雨の灯台（ゲル）', '第三章／ゲルと探す', '軽トラのヘッドライトの中、ムニの顔を両手で包むゲル'],
    ['st_c3_lighthouse_neo', 'ネオ', '雨の灯台（ネオ）', '第三章／ネオと探す', '泥に膝をつき高級な上着でムニを包みぎこちなく抱くネオ'],
    ['st_c3_lighthouse_alone', 'ジンパチ', '雨の灯台（ひとり）', '第三章／ひとりで探す', '足首を押さえて座り込む主人公としがみつくムニ、懐中電灯を向けるジンパチ'],
    ['st_c4_yukata_reny', 'レニィ', 'わたあめ', '第四章／レニィと祭り', '提灯の参道、わたあめを差し出すレニィ、藍の朝顔浴衣の主人公'],
    ['st_c4_yukata_hyu', 'ヒュウ', '星の髪飾り', '第四章／ヒュウと祭り', '射的の屋台前、主人公の黒髪にガラスの星の髪飾りをつけるヒュウ'],
    ['st_c4_yukata_jin', 'ジンパチ', '法被の見回り', '第四章／ジンパチと祭り', '法被姿で迷子を肩車するジンパチ、隣に浴衣の主人公'],
    ['st_c4_yukata_gel', 'ゲル', '石段のラムネ', '第四章／ゲルと祭り', '神社裏の石段に並んで座る作業着のゲルと浴衣の主人公、ラムネ'],
    ['st_c4_yukata_neo', 'ネオ', '十三枚目のポイ', '第四章／ネオと祭り', '金魚を一匹すくって子どもっぽく笑うネオ'],
    ['st_c4_yukata_muni', 'ムニ', '狐のお面', '第四章／ムニと祭り', '狐のお面を斜めにかぶったムニと主人公'],
    ['st_c4_tri_gj', '三角関係', '三人の夏祭り', '第四章／三人で回る', 'ゲルとジンパチに挟まれた浴衣の主人公、二人が互いを横目で見る'],
    ['st_c4_jin_shrine', 'ジンパチ', '社の裏', '第四章／ジンパチを探す', '暗い社の裏で耳を塞いでしゃがみ込むジンパチ、遠くの花火光'],
    ['st_c5_roof_stars', '共通', '屋根の上の七人', '第五章', '新月の屋根に並んで寝転ぶ七人、天の川'],
    ['st_c6_clock', '共通', '動き出した時計', '第六章', '嵐と稲光、時計塔の文字盤の針が2:17から動き出す'],
    ['st_c6_attic_can', '共通', '星の缶', '第六章', '焦げた梁の屋根裏、釘穴の開いた錆びた空き缶を拾う主人公の手'],
    ['st_c6_clipping', '共通', '十五年前の記事', '第六章', '古い新聞切り抜き「消防士が殉職」と、若い千鶴・奏・4歳の主人公の写真'],
    ['st_c7_reny_vigil', 'レニィ', '午前三時の夜番', '第七章／レニィの隣に座る', 'ムニの部屋の前で一枚の毛布を分け合う主人公とレニィ'],
    ['st_c7_mask_hyu', 'ヒュウ', '仮面の下', '第七章／ヒュウと踊る', '後夜祭、落ちる白い仮面、前髪が割れ右目周りの火傷と赤い瞳'],
    ['st_c7_between', '三角関係', '二人の間', '第七章／間に飛び込む', '焦げた桜の下、拳を振り上げるジンパチと倒れたヒュウの間に両腕を広げる主人公'],
    ['st_c8_empty_plate', '共通', 'ヒュウの席', '第八章', '湯気のない皿を並べるムニ、空席'],
    ['st_c8_snow_reny', 'レニィ', '初雪（レニィ）', '第八章／レニィを選ぶ', '雪の屋根に寝転ぶレニィと主人公'],
    ['st_c8_snow_hyu', 'ヒュウ', '初雪（ヒュウ）', '第八章／ヒュウを選ぶ', '雪の窓辺、布をかけたキャンバスの前のヒュウ'],
    ['st_c8_snow_jin', 'ジンパチ', '初雪（ジンパチ）', '第八章／ジンパチを選ぶ', '自分のマフラーを主人公に巻くジンパチ、スコップ'],
    ['st_c8_snow_gel', 'ゲル', '初雪（ゲル）', '第八章／ゲルを選ぶ', '雪の吹き込むガレージ、船外機に耳を当てるゲル'],
    ['st_c8_snow_neo', 'ネオ', '初雪（ネオ）', '第八章／ネオを選ぶ', '雪の夜の書斎、ピアノの前のネオ'],
    ['st_c8_snow_muni', 'ムニ', '初雪（ムニ）', '第八章／ムニを選ぶ', '主人公に抱き上げられて窓の雪を見るムニ'],
    ['st_c9_blueprint', '共通', 'ブライトンの設計図', '第九章／塔を探す', '真鍮の筒から出てきた青焼き図面、ABのモノグラムと署名'],
    ['st_c9_christmas', '共通', '七人のクリスマス', '第九章', '鶏の丸焼きとLEDキャンドルのケーキを囲む七人'],
    ['st_c9_contract', '共通', '合意書', '第九章', '書斎の机、鳳グループの封筒からはみ出た「合意書」とネオの署名'],
    ['st_c10_sora', 'ムニ', 'ハルの告白', '第十章', 'カウンターでうつむくハル、焦げ茶の髪の分け目の根元が青い'],
    ['st_r10_reny_mother', 'レニィ', 'いってらっしゃい', 'レニィルート第十章', '駅のカフェ、青い髪の母とレニィ、テーブルの上で繋がれた主人公とレニィの手'],
    ['st_r11_reny_lap', 'レニィ', '膝の上の春', 'レニィルート第十一章', '陽だまりの居間、主人公の膝で眠るレニィとチョコの箱'],
    ['st_h11_same_night', 'ヒュウ', '同じ夜', 'ヒュウルート第十一章', '屋根裏、缶の星を見上げるムニと、凍りつくヒュウ'],
    ['st_j10_grave', 'ジンパチ', '父の墓', 'ジンパチルート第十章', '海の見える墓地、墓前で泣くジンパチ、主人公としず'],
    ['st_j11_ittekimasu', 'ジンパチ', 'いってきます', 'ジンパチルート第十一章', '玄関、紺のスーツで振り返り泣き笑いのジンパチ'],
    ['st_j11_return', 'ジンパチ', '帰る道', 'ジンパチルート第十一章', '燃える屋根裏でレニィを背負い星の窓へ向かうジンパチ'],
    ['st_g10_sign', 'ゲル', '指先の言葉', 'ゲルルート第十章', '夕食の席、手話をする主人公とムニ、口を覆うゲル'],
    ['st_n10_tokyo', 'ネオ', '帰るぞ', 'ネオルート第十章', '冬の東京の夜、本社ビル前で主人公に手を差し出すネオ'],
    ['st_m11_mama', 'ムニ', 'ママ', 'ムニルート第十一章', '屋根裏、火傷した手でムニの頬を包むソラ、胸に顔をうずめるムニ'],
    ['st_b_fire_alone', 'バッド', '焔の中へ', '第十一章／ひとりで飛び込む', '赤い屋根裏、星の窓の下で泣くムニへ手を伸ばす主人公'],
    ['st_e_reny_happy', 'エンディング', 'おはようの約束', 'レニィ HAPPY', '塔のプラネタリウム、作り物の朝焼けの中でキスする二人'],
    ['st_e_reny_normal', 'エンディング', '春眠、窓辺にて', 'レニィ NORMAL', '星の下、主人公の肩で眠るレニィ'],
    ['st_e_reny_bad', 'エンディング', '眠り姫はきみのほう', 'レニィ BAD', '病室で眠るレニィの手を握る主人公、枕元の小さな投影機'],
    ['st_e_hyu_happy', 'エンディング', '両目で描く君', 'ヒュウ HAPPY', '絵『みて、ほしだよ』の前で、前髪を切り両目で笑うヒュウ'],
    ['st_e_hyu_normal', 'エンディング', '片目の自画像', 'ヒュウ NORMAL', '駅のホーム、主人公の額に口づけるヒュウ'],
    ['st_e_hyu_bad', 'エンディング', '描かれなかった肖像', 'ヒュウ BAD', '空のアトリエ、顔だけ白い主人公の肖像画'],
    ['st_e_jin_happy', 'エンディング', '炎の向こうのただいま', 'ジンパチ HAPPY', '満開の焦げた桜の下、紺の制服のジンパチが主人公を抱きしめる'],
    ['st_e_jin_normal', 'エンディング', '消防士の背中', 'ジンパチ NORMAL', '改札へ向かう大きな背中、片手を上げる'],
    ['st_e_jin_bad', 'エンディング', '父と同じ場所へ', 'ジンパチ BAD', '父の隣に刻まれた名前の墓前、手紙を持つ主人公'],
    ['st_e_gel_happy', 'エンディング', 'きこえる、きこえない、好き', 'ゲル HAPPY', '夕暮れの防波堤、手話で「すき」を交わしキスする二人'],
    ['st_e_gel_normal', 'エンディング', '指先の約束', 'ゲル NORMAL', '春の港、小指を絡める二人の手のアップ'],
    ['st_e_gel_bad', 'エンディング', '無音の海', 'ゲル BAD', '工具の消えたガレージの作業台、一枚のメモ'],
    ['st_e_neo_happy', 'エンディング', '王冠を捨てた日', 'ネオ HAPPY', '春の書斎、ピアノの前で片膝をつくネオ'],
    ['st_e_neo_normal', 'エンディング', '仮契約の恋人', 'ネオ NORMAL', '賃貸借契約書を差し出すネオと笑う主人公'],
    ['st_e_neo_bad', 'エンディング', '王の帰還', 'ネオ BAD', '新聞の経済面、完璧な無表情のネオの写真'],
    ['st_e_muni_happy', 'エンディング', 'ただいま、おかえり', 'ムニ HAPPY', '門の前で振り返るムニ、手を繋いだ主人公とソラ'],
    ['st_e_muni_normal', 'エンディング', 'またね、おねえちゃん', 'ムニ NORMAL', '電車の窓から手を振るムニ、頭を下げるソラ'],
    ['st_e_muni_bad', 'エンディング', 'わすれんぼうのムニ', 'ムニ BAD', '六年後の図書館、振り向く11歳の少年と大人の主人公'],
    ['st_e_tri_jh_sweet', 'エンディング', '灰と星の三人', '三角関係（ジンパチ×ヒュウ）', '墓前で笑う三人'],
    ['st_e_tri_jh_bitter', 'エンディング', '焼け跡の春', '三角関係（ジンパチ×ヒュウ）', '満開の焦げた桜の下のベンチにひとり座る主人公'],
    ['st_e_tri_rn_sweet', 'エンディング', '朝と夜の王国', '三角関係（レニィ×ネオ）', 'プラネタリウム、主人公の右にレニィ左にネオ'],
    ['st_e_tri_rn_bitter', 'エンディング', '二人ぶんの空席', '三角関係（レニィ×ネオ）', '朝の食卓の空いた二つの椅子'],
    ['st_e_tri_gj_sweet', 'エンディング', '三人で走る海岸線', '三角関係（ゲル×ジンパチ）', '海岸線の軽トラ、運転席ゲル・助手席主人公・荷台のジンパチ'],
    ['st_e_tri_gj_bitter', 'エンディング', '幼馴染の終わり', '三角関係（ゲル×ジンパチ）', '防波堤の先にひとり座るジンパチの背中'],
    ['st_e_empty', 'エンディング', '空き家', '共通 BAD', 'リゾートホテルのロビーに移築された、2:17で止まった時計'],
    ['st_e_fire', 'エンディング', '焔の夜', '共通 BAD', '夜明け前、焼けた屋根裏と星の窓、屋根の上で保護されるムニ'],
    ['st_true_1', 'トゥルー', '星まつり', 'TRUE', '塔のプラネタリウム、町の人々と住人たちが星を見上げる'],
    ['st_true_2', 'トゥルー', '凪ノ家の灯', 'TRUE', '玄関前の八人の集合写真、鐘が鳴る瞬間']
  ];
  const still = {};
  stills.forEach(([id, group, title, where, desc]) => { still[id] = { file: `assets/still/${id}.jpg`, group: group, title: title, where: where, desc: desc }; });

  const bgmList = {
    title: 'タイトル：ピアノとオルゴール、郷愁と温かさ', prologue: '序章：電車と海、期待と不安', daily_morning: '朝の日常：軽やか', daily_house: '凪ノ家のテーマ：木管とピアノ', daily_fun: 'にぎやかな日常', tender: '優しい場面', serious: '緊張感のある会話', letter: '千鶴の手紙のテーマ：ピアノソロ', letter_last: '十二通目：手紙のテーマの完全版、弦が加わる',
    night: '夜の静けさ', night_tension: '見張りの夜、張りつめた静寂', sea: '海', cafe: 'カフェ', cafe_winter: '冬のカフェ', rain_daily: '雨の日常', rain_night: '雨の夜の捜索', tension: '不穏', mystery: '謎', festival: '夏祭り', fireworks: '花火', stars: '星空', dream: '夢（くぐもった音）', storm: '嵐の夜',
    sorrow: '悲しみ', sorrow_piano: '悲しみ(ピアノ)', festival_univ: '学園祭', waltz: '仮面舞踏会のワルツ', snow: '初雪', hope: '希望・作戦会議', christmas: 'クリスマス', snow_sorrow: '雪の別れ', spring_sorrow: '焼け跡の春',
    fire_tension: '小火：緊迫', fire: '火事：激しい緊迫', triangle: '三角関係のテーマ', true_prelude: 'トゥルー導入', true_ending: 'トゥルーエンディング主題歌想定', ending_theme: 'エンディング共通', sorrow_end: 'バッドエンディング',
    reny_theme: 'レニィのテーマ：オルゴールと眠たげなシンセ', reny_mother: 'レニィと母', reny_ending: 'レニィEDアレンジ', hyu_theme: 'ヒュウのテーマ：チェロとピアノ、気取りと陰', hyu_love: 'ヒュウ恋愛', hyu_ending: 'ヒュウED',
    jin_theme: 'ジンパチのテーマ：ギターとブラス、熱と不器用さ', jin_ending: 'ジンパチED', gel_theme: 'ゲルのテーマ：アコギと波音、静けさ', gel_love: 'ゲル恋愛', gel_ending: 'ゲルED',
    neo_piano: 'ネオ：ドビュッシー「月の光」の編曲', neo_love: 'ネオ恋愛', neo_ending: 'ネオED', muni_theme: 'ムニのテーマ：鉄琴とリコーダー', muni_mama: 'ムニと母', muni_ending: 'ムニED', triangle_ending: '三角関係ED'
  };
  const bgm = {};
  Object.entries(bgmList).forEach(([id, desc]) => { bgm[id] = { file: `assets/bgm/${id}.ogg`, desc: desc }; });

  const seList = {
    train: '電車の走行音', train_stop: '電車の停車', footsteps: '廊下の足音(木の床)', door: '扉の開閉', paper: '封筒を開ける・紙', knock: 'ノック2回', bell_far: '遠くの小さな鐘',
    heartbeat: '心音(フラッシュバック)', rain: '雨', rain_heavy: '豪雨', fall: '転倒', cicada: '蝉', firework: '花火の破裂音', fire: '炎の音', storm: '暴風', thunder: '雷鳴',
    bell_tower: '時計塔の鐘(低く重い)', clock_tick: '時計の秒針', water_drip: '雨漏りの水滴', glass: '物が落ちる／割れる', punch: '殴打', extinguish: '消火器の噴射', collapse: '梁が崩れる', fire_alarm: '火災報知器'
  };
  const se = {};
  Object.entries(seList).forEach(([id, desc]) => { se[id] = { file: `assets/se/${id}.ogg`, desc: desc }; });

  G.GAME_DATA.manifest = { bg: bg, chara: chara, still: still, bgm: bgm, se: se };
})(typeof globalThis !== 'undefined' ? globalThis : this);
