# 素材発注書（Codex実装用・自動生成）

このゲームは、グラフィックとBGM・効果音以外はすべて実装済みです。下表のパスにファイルを置くだけで、エンジンが自動的に読み込みます（ファイルが無い間はプレースホルダ表示・無音で動作）。

## 実装ルール

- ファイル名・パスは `game/data/manifest.js` が正本。パスを変える場合は manifest.js を変更する。
- 背景・スチル：1920×1080 JPG（またはWebP。拡張子を変えたら manifest.js も変更）。
- 立ち絵：`assets/chara/{キャラID}/{表情}.png`。透過PNG、高さ1600px前後、膝上。表示位置は left / lc / center / rc / right の5点。
- BGM：OGG（ループ前提、先頭と末尾をクロスフェード可能に）。SE：OGG。
- 主人公は立ち絵なし。スチルに描く場合は黒髪・19歳・大学一年生。顔は描いてよいが、目元は前髪や角度で控えめに（夢小説的な没入感のため）。
- 生成後は `node tools/validate.js` → `node tools/simulate.js` を実行し、エラーが無いことを確認する。
- 音量・フェードは `engine.js` の `Audio_` オブジェクトを拡張して実装してよい（BGMのクロスフェード、SEの多重再生など）。

## キャラクター立ち絵

| ID | 名前 | 設定 | 表情差分 | 使用ファイル |
|---|---|---|---|---|
| reny | レニィ | 一人称「僕」。ほわほわ天然でよく寝ている大学二年生(20)。青い髪・青い目。 | normal, smile, laugh, sad, surprise, angry, blush, serious, troubled, cry, sleepy, smug, pain | 00_prologue, 01_april, 02_may, 03_june, 04_july, 05_august, 06_september, 07_october, 08_november, 09_shared_winter, 10_route_reny, 13_route_gel, 14_route_neo, 16_triangles, 17_fire_and_letter |
| hyu | ヒュウ | ナルシストで気取り屋。敬語。美大四年(22)。緑の髪、右目を前髪で隠す。瞳は赤。 | normal, smile, laugh, sad, surprise, angry, blush, serious, troubled, cry, sleepy, smug, pain | 00_prologue, 01_april, 02_may, 03_june, 04_july, 05_august, 06_september, 07_october, 08_november, 09_shared_winter, 11_route_hyu, 12_route_jin, 16_triangles, 17_fire_and_letter |
| jin | ジンパチ | 俺様系・熱血。一人称「俺」。消防団員の大学三年(21)。茶髪のツンツンヘア。 | normal, smile, laugh, sad, surprise, angry, blush, serious, troubled, cry, sleepy, smug, pain | 00_prologue, 01_april, 02_may, 03_june, 04_july, 05_august, 06_september, 07_october, 08_november, 09_shared_winter, 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 15_route_muni, 16_triangles, 17_fire_and_letter |
| muni | ムニ | 五歳の男の子。甘えん坊で寂しがり屋。青い髪。 | normal, smile, laugh, sad, surprise, angry, blush, serious, troubled, cry, sleepy, smug, pain | 00_prologue, 01_april, 02_may, 04_july, 05_august, 08_november, 09_shared_winter, 15_route_muni, 17_fire_and_letter, 19_endings_b |
| gel | ゲル | 一人称「私」。〜だな、〜だ口調。港の船舶整備士(23)。紫のセミロングボブ。 | normal, smile, laugh, sad, surprise, angry, blush, serious, troubled, cry, sleepy, smug, pain | 00_prologue, 01_april, 02_may, 03_june, 04_july, 05_august, 06_september, 07_october, 08_november, 09_shared_winter, 12_route_jin, 13_route_gel, 16_triangles, 17_fire_and_letter |
| neo | ネオ | 一人称「私」、二人称「貴様」。高飛車な弁護士(26)。遺言執行者。金髪ロング。 | normal, smile, laugh, sad, surprise, angry, blush, serious, troubled, cry, sleepy, smug, pain | 00_prologue, 01_april, 02_may, 03_june, 04_july, 05_august, 06_september, 07_october, 08_november, 09_shared_winter, 10_route_reny, 14_route_neo, 16_triangles, 17_fire_and_letter |
| haru | ハル | 灯台下のカフェ「しおさい珈琲」店主。短い焦げ茶の髪。本名は青羽空良(ソラ)。 | normal, smile, sad, surprise, serious, cry | 02_may, 09_shared_winter, 15_route_muni, 17_fire_and_letter |
| watarai | 渡会 | 児童相談所の職員。四十代女性。穏やかで手続きに厳格。 | normal, smile, sad, surprise, serious, cry | 03_june, 15_route_muni |
| kuga | 久我 | ネオの秘書。無表情だが主人思い。 | normal, smile, sad, surprise, serious, cry | 04_july, 09_shared_winter, 14_route_neo |
| onuki | 大貫 | 灯凪町消防団長。ジンパチの父の元同僚。 | normal, smile, sad, surprise, serious, cry | 07_october, 12_route_jin |
| aoi | あおい | ヒュウの母・翠川あおい。港町で花屋を営む。 | normal, smile, sad, surprise, serious, cry | 08_november, 11_route_hyu |
| genichiro | 鳳源一郎 | ネオの父。鳳グループ会長。 | normal, smile, sad, surprise, serious, cry | 08_november, 14_route_neo |
| renymother | レニィの母 | レニィの実母。 | normal, smile, sad, surprise, serious, cry | 10_route_reny |
| jinmother | 鷹取しず | ジンパチの母。 | normal, smile, sad, surprise, serious, cry | 12_route_jin |
| reika | 綾小路麗華 | ネオの縁談相手。 | normal, smile, sad, surprise, serious, cry | 14_route_neo |

### 主要キャラのビジュアル指定

- **レニィ**：青い髪（やわらかい癖毛）、青い目、眠たげな半目がデフォルト。オーバーサイズのパーカーやカーディガン。指先に機械油の汚れ（塔の時計修理）。
- **ヒュウ**：緑の髪、長い前髪で右目を隠す。見えている左目は赤。細身、白シャツに上品なジャケット。右目の周りに火傷痕（前髪を上げた差分／HAPPY後は短髪差分が必要）。
- **ジンパチ**：茶髪のツンツンヘア、日焼け、がっしり体型。Tシャツ／消防団の法被／紺のスーツ／消防の制服の衣装差分。
- **ムニ**：5歳、空色の髪、丸い頬。パジャマ・保育園スモック・黄色い長靴と雨合羽。狐のお面の小物。
- **ゲル**：紫のセミロングボブ、作業着（つなぎ）、油汚れ。女性らしさを強調しない凛とした立ち姿。第十二章以降は補聴器を着けた差分。
- **ネオ**：金髪ロング（背中まで）、仕立ての良いスーツ、高圧的な立ち姿。エプロン差分（ネオルート料理）、腕の包帯差分（ネオルート火事後）。
- **ハル（ソラ）**：焦げ茶の短髪（分け目の根元がわずかに青い）、エプロン、ポケットに色鉛筆。

## 背景

| ID | 内容 | ファイル | 使用箇所 |
|---|---|---|---|
| black | 暗転（画像不要） | （不要） | 00_prologue, 01_april, 02_may, 03_june, 04_july, 05_august, 06_september, 07_october, 08_november, 09_shared_winter, 17_fire_and_letter, 19_endings_b |
| title | タイトル：夜明け前の坂の上の洋館と時計塔、遠くに灯台の光 | assets/bg/title.jpg |  |
| train | 海沿いを走る電車の車内、窓の外に春の海 | assets/bg/train.jpg | 00_prologue |
| slope | 海へ下る石段の坂道、錆びた手すり、坂上に白い洋館と小さな時計塔(針は2:17) | assets/bg/slope.jpg | 00_prologue |
| entrance | 凪ノ家の玄関ホール、吹き抜け階段、磨かれた手すり | assets/bg/entrance.jpg | 00_prologue, 02_may, 08_november |
| entrance_night | 夜の玄関ホール、全ての灯りが点いている | assets/bg/entrance_night.jpg | 03_june, 08_november, 09_shared_winter, 14_route_neo |
| entrance_snow | 雪の日の玄関ホール | assets/bg/entrance_snow.jpg | 09_shared_winter, 14_route_neo |
| entrance_morning | 冬の朝の玄関、紺のスーツ姿を見送る位置 | assets/bg/entrance_morning.jpg | 12_route_jin |
| living | 居間、窓辺のソファ、古い洋風暖炉 | assets/bg/living.jpg | 00_prologue, 02_may, 03_june, 05_august, 06_september, 09_shared_winter, 15_route_muni |
| living_rain | 梅雨の居間、曇った窓、廊下に洗濯物 | assets/bg/living_rain.jpg | 03_june |
| living_night | 停電の居間、LEDランタン7つだけの白い光、布団が並ぶ | assets/bg/living_night.jpg | 06_september, 08_november |
| living_winter | 冬の居間、陽だまり | assets/bg/living_winter.jpg | 10_route_reny, 11_route_hyu, 12_route_jin, 14_route_neo, 15_route_muni, 16_triangles |
| dining | 大きな食卓のダイニング、朝 | assets/bg/dining.jpg | 01_april, 07_october, 08_november, 09_shared_winter |
| dining_night | ダイニング夜・卓上IHの鍋 | assets/bg/dining_night.jpg | 01_april, 09_shared_winter, 17_fire_and_letter |
| dining_xmas | クリスマスのダイニング、鶏の丸焼き、もみの木、電球の星 | assets/bg/dining_xmas.jpg | 09_shared_winter |
| dining_spring | 春の朝のダイニング、空いた椅子が二つ | assets/bg/dining_spring.jpg | 19_endings_b |
| kitchen | 古いがよく手入れされた台所、手書きラベルの調味料瓶 | assets/bg/kitchen.jpg | 01_april, 08_november |
| kitchen_night | 夜の台所、灯り一つ | assets/bg/kitchen_night.jpg | 01_april |
| kitchen_winter | 冬の朝の台所 | assets/bg/kitchen_winter.jpg | 10_route_reny, 14_route_neo |
| corridor | 二階廊下、朝 | assets/bg/corridor.jpg | 01_april |
| corridor_night | 夜の二階廊下、突き当たりの天井に屋根裏の四角い扉 | assets/bg/corridor_night.jpg | 01_april, 03_june, 07_october, 10_route_reny, 12_route_jin, 16_triangles, 17_fire_and_letter |
| corridor_fire | 夜の廊下、天井の隙間から煙、赤い光 | assets/bg/corridor_fire.jpg | 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni, 17_fire_and_letter |
| heroine_room | 主人公の部屋、東向きの窓から海 | assets/bg/heroine_room.jpg | 02_may, 04_july, 05_august, 06_september, 07_october, 08_november |
| heroine_room_night | 主人公の部屋・夜、月の道が海に | assets/bg/heroine_room_night.jpg | 00_prologue, 01_april, 03_june, 05_august |
| heroine_room_rain | 主人公の部屋・雨 | assets/bg/heroine_room_rain.jpg | 03_june |
| heroine_room_winter | 主人公の部屋・冬 | assets/bg/heroine_room_winter.jpg | 09_shared_winter, 10_route_reny, 14_route_neo |
| heroine_room_spring | 主人公の部屋・春の朝 | assets/bg/heroine_room_spring.jpg | 17_fire_and_letter |
| reny_room | レニィの部屋：本と星図、天井に蓄光の星シール | assets/bg/reny_room.jpg | 01_april, 10_route_reny |
| hyu_room | ヒュウの部屋：半分アトリエ、自画像のキャンバス、鏡台 | assets/bg/hyu_room.jpg | 01_april, 07_october |
| muni_room_night | ムニの部屋・夜、窓の外に庭 | assets/bg/muni_room_night.jpg | 03_june, 08_november, 15_route_muni, 17_fire_and_letter |
| chizuru_room | 千鶴の書斎、アップライトピアノ、机、木箱 | assets/bg/chizuru_room.jpg | 00_prologue, 01_april, 03_june, 05_august, 08_november, 09_shared_winter |
| chizuru_room_night | 書斎・夜、ピアノの上に灯り | assets/bg/chizuru_room_night.jpg | 01_april, 08_november, 09_shared_winter, 14_route_neo |
| chizuru_room_spring | 書斎・春の光 | assets/bg/chizuru_room_spring.jpg | 14_route_neo, 19_endings_b |
| attic | 屋根裏：焦げた梁、星形格子の丸窓、ランタンの白い光(嵐) | assets/bg/attic.jpg | 06_september, 09_shared_winter |
| attic_night | 屋根裏・夜、星の窓から月明かり | assets/bg/attic_night.jpg | 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni |
| attic_fire | 燃える屋根裏、星の窓 | assets/bg/attic_fire.jpg | 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni |
| tower | 時計塔内部：歯車、振り子、小さな鐘、工具箱 | assets/bg/tower.jpg | 02_may, 09_shared_winter, 14_route_neo |
| tower_night | 時計塔内部・夜 | assets/bg/tower_night.jpg | 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni |
| tower_fire | 煙の降りてくる塔の螺旋階段 | assets/bg/tower_fire.jpg | 10_route_reny |
| tower_spring | 修理後の塔内部、春 | assets/bg/tower_spring.jpg | 10_route_reny |
| garden | 庭・朝もや | assets/bg/garden.jpg | 01_april |
| garden_night | 夜の庭、奥に幹の黒い桜、時計塔のシルエット | assets/bg/garden_night.jpg | 00_prologue, 01_april, 02_may, 07_october, 08_november, 16_triangles |
| garden_snow_night | 初雪の夜の庭、焦げた桜に雪 | assets/bg/garden_snow_night.jpg | 08_november, 15_route_muni, 19_endings_b |
| garden_winter | 冬の庭、焦げた桜 | assets/bg/garden_winter.jpg | 11_route_hyu |
| garden_spring | 春の庭、焦げた桜につぼみ | assets/bg/garden_spring.jpg | 12_route_jin, 15_route_muni |
| garden_sakura | 満開の焦げた桜 | assets/bg/garden_sakura.jpg | 18_endings_a, 19_endings_b |
| garden_sunset | 夕暮れの庭 | assets/bg/garden_sunset.jpg | 19_endings_b |
| garage | ガレージ：船外機、作業灯 | assets/bg/garage.jpg | 01_april, 03_june, 13_route_gel |
| garage_night | 夜のガレージ | assets/bg/garage_night.jpg | 08_november, 13_route_gel |
| garage_spring | 春のガレージ、看板 | assets/bg/garage_spring.jpg | 18_endings_a |
| garage_empty | 工具が消えたガレージ | assets/bg/garage_empty.jpg | 18_endings_a |
| roof_night | 天窓から出た屋根の上、満天の星 | assets/bg/roof_night.jpg | 01_april, 05_august |
| roof_snow | 雪の屋根の上 | assets/bg/roof_snow.jpg | 08_november |
| town | 灯凪町の商店街 | assets/bg/town.jpg | 02_may |
| library | 町の図書館・郷土資料の棚 | assets/bg/library.jpg | 02_may |
| cafe | 灯台下のカフェ「しおさい珈琲」店内 | assets/bg/cafe.jpg | 02_may |
| cafe_snow | 雪の日のしおさい珈琲 | assets/bg/cafe_snow.jpg | 09_shared_winter |
| cafe_night | 閉店後のしおさい珈琲 | assets/bg/cafe_night.jpg | 15_route_muni |
| beach | 五月の干潟 | assets/bg/beach.jpg | 02_may |
| beach_evening | 夕方の浜 | assets/bg/beach_evening.jpg | 02_may |
| beach_summer | 夏の浜辺、パラソル | assets/bg/beach_summer.jpg | 05_august |
| sea_float | 海に浮かぶ視点 | assets/bg/sea_float.jpg | 05_august |
| sea_under | 海中の青い世界 | assets/bg/sea_under.jpg | 05_august |
| lighthouse_rain | 雨の夜の古い灯台の根元、錆びた鉄扉、光の帯が空に | assets/bg/lighthouse_rain.jpg | 03_june |
| festival | 灯凪神社の夏祭り、提灯の参道 | assets/bg/festival.jpg | 04_july |
| fireworks_sky | 夜空の花火 | assets/bg/fireworks_sky.jpg | 04_july |
| shrine_back | 社の裏、花火の光が届かない暗がり | assets/bg/shrine_back.jpg | 04_july |
| festival_end | 祭りの帰り道の坂下、黒い高級車 | assets/bg/festival_end.jpg | 04_july |
| house_ext_morning | 嵐の翌朝の凪ノ家外観、時計塔の針が動いている | assets/bg/house_ext_morning.jpg | 06_september |
| house_ext_night | 夜の凪ノ家外観 | assets/bg/house_ext_night.jpg | 11_route_hyu, 19_endings_b |
| house_ext_snow | 雪の凪ノ家外観 | assets/bg/house_ext_snow.jpg | 15_route_muni |
| house_ext_spring | 春の凪ノ家外観 | assets/bg/house_ext_spring.jpg | 17_fire_and_letter, 18_endings_a, 19_endings_b |
| house_ext_winter | 冬の凪ノ家外観（寂しげ） | assets/bg/house_ext_winter.jpg | 19_endings_b |
| house_gate_spring | 門と桜とベンチ、春 | assets/bg/house_gate_spring.jpg | 19_endings_b |
| fire_station | 港近くの消防団詰所(古いガレージ) | assets/bg/fire_station.jpg | 07_october |
| drill_ground | 消防団の訓練場、煙を噴く訓練棟 | assets/bg/drill_ground.jpg | 12_route_jin |
| univ_festival | 大学祭の中庭、屋台 | assets/bg/univ_festival.jpg | 07_october |
| gallery | 美術学科の展示室、右目を隠した自画像が十枚 | assets/bg/gallery.jpg | 07_october |
| univ_night | 後夜祭の仮面舞踏会、夜のキャンパス広場 | assets/bg/univ_night.jpg | 07_october |
| aoi_shop | 港町の小さな花屋 | assets/bg/aoi_shop.jpg | 08_november |
| car_night | 夜の車内、窓の外に海 | assets/bg/car_night.jpg | 08_november |
| atelier | ヒュウのアトリエ(雨) | assets/bg/atelier.jpg | 03_june |
| atelier_night | 夜のアトリエ、布をかけたキャンバス | assets/bg/atelier_night.jpg | 08_november, 11_route_hyu |
| atelier_winter | 冬のアトリエ | assets/bg/atelier_winter.jpg | 11_route_hyu |
| atelier_spring | 春のアトリエ | assets/bg/atelier_spring.jpg | 11_route_hyu, 18_endings_a |
| atelier_empty | 空っぽのアトリエ、イーゼル一つ | assets/bg/atelier_empty.jpg | 18_endings_a |
| snow_street_night | 雪の坂道・夜 | assets/bg/snow_street_night.jpg | 09_shared_winter |
| station_cafe | 隣町の駅のカフェ | assets/bg/station_cafe.jpg | 10_route_reny |
| station_spring | 春の灯凪駅ホーム | assets/bg/station_spring.jpg | 18_endings_a, 19_endings_b |
| seawall_winter | 冬の防波堤 | assets/bg/seawall_winter.jpg | 12_route_jin, 16_triangles |
| seawall_spring | 春の防波堤 | assets/bg/seawall_spring.jpg | 19_endings_b |
| cemetery_winter | 海の見える墓地・冬 | assets/bg/cemetery_winter.jpg | 12_route_jin |
| cemetery_spring | 海の見える墓地・春 | assets/bg/cemetery_spring.jpg | 18_endings_a, 19_endings_b |
| harbor_winter | 冬の港、クレーン | assets/bg/harbor_winter.jpg | 13_route_gel |
| harbor_spring | 春の港 | assets/bg/harbor_spring.jpg | 13_route_gel, 18_endings_a |
| harbor_sunset | 夕暮れの港の防波堤 | assets/bg/harbor_sunset.jpg | 18_endings_a |
| hospital | 病院の聴力検査室前の廊下 | assets/bg/hospital.jpg | 13_route_gel |
| hospital_spring | 病室・窓際、春 | assets/bg/hospital_spring.jpg | 18_endings_a |
| community_center | 町の公民館・手話教室 | assets/bg/community_center.jpg | 13_route_gel |
| tokyo_office | 鳳グループ本社の控え室 | assets/bg/tokyo_office.jpg | 14_route_neo |
| tokyo_boardroom | 本社最上階の会議室 | assets/bg/tokyo_boardroom.jpg | 14_route_neo |
| tokyo_night | 東京の夜、本社ビル前 | assets/bg/tokyo_night.jpg | 14_route_neo |
| planetarium | 塔の中のプラネタリウム、天井いっぱいの星 | assets/bg/planetarium.jpg | 18_endings_a, 19_endings_b |
| coast_road | 海岸線を走る軽トラック | assets/bg/coast_road.jpg | 19_endings_b |

## スチル（イベントCG）— 制作と回収の指示

スチルは `@still ID` で表示された瞬間にギャラリーへ登録（回収）される。「入手条件」は回収ヒントとしてギャラリーにも表示される。

| ID | 区分 | タイトル | 入手条件 | 構図・演出指示 |
|---|---|---|---|---|
| st_p_reny_bench | 共通 | 桜の下の眠り | 序章 | 門の脇の桜の下、ベンチで眠るレニィ。髪・頬・胸の文庫本に花びら。見下ろす構図 |
| st_p_muni_night | 共通 | 夜のノック | 序章 | 枕を抱えて扉の前に立つムニ、廊下の暗がり、部屋の灯りが顔に |
| st_c1_breakfast | 共通 | 七人の食卓 | 第一章 | 朝の大きな食卓、湯気、タコさんウインナー、泣きながら食べるムニ |
| st_c2_tower_reny | レニィ | 歯車の部屋 | 第二章／塔へ行く | 歯車に囲まれ工具箱を枕に眠るレニィ、油のしみた手、床に星座の図 |
| st_c3_lighthouse_reny | レニィ | 雨の灯台（レニィ） | 第三章／レニィと探す | 雨の灯台下、パーカーの中にムニを抱き込むレニィ |
| st_c3_lighthouse_hyu | ヒュウ | 雨の灯台（ヒュウ） | 第三章／ヒュウと探す | 濡れた前髪が割れかけたヒュウがジャケットでムニを包む、街灯 |
| st_c3_lighthouse_jin | ジンパチ | 雨の灯台（ジンパチ） | 第三章／ジンパチと探す | 雨合羽の中にムニを抱えるジンパチ、懐中電灯、赤い目 |
| st_c3_lighthouse_gel | ゲル | 雨の灯台（ゲル） | 第三章／ゲルと探す | 軽トラのヘッドライトの中、ムニの顔を両手で包むゲル |
| st_c3_lighthouse_neo | ネオ | 雨の灯台（ネオ） | 第三章／ネオと探す | 泥に膝をつき高級な上着でムニを包みぎこちなく抱くネオ |
| st_c3_lighthouse_alone | ジンパチ | 雨の灯台（ひとり） | 第三章／ひとりで探す | 足首を押さえて座り込む主人公としがみつくムニ、懐中電灯を向けるジンパチ |
| st_c4_yukata_reny | レニィ | わたあめ | 第四章／レニィと祭り | 提灯の参道、わたあめを差し出すレニィ、藍の朝顔浴衣の主人公 |
| st_c4_yukata_hyu | ヒュウ | 星の髪飾り | 第四章／ヒュウと祭り | 射的の屋台前、主人公の黒髪にガラスの星の髪飾りをつけるヒュウ |
| st_c4_yukata_jin | ジンパチ | 法被の見回り | 第四章／ジンパチと祭り | 法被姿で迷子を肩車するジンパチ、隣に浴衣の主人公 |
| st_c4_yukata_gel | ゲル | 石段のラムネ | 第四章／ゲルと祭り | 神社裏の石段に並んで座る作業着のゲルと浴衣の主人公、ラムネ |
| st_c4_yukata_neo | ネオ | 十三枚目のポイ | 第四章／ネオと祭り | 金魚を一匹すくって子どもっぽく笑うネオ |
| st_c4_yukata_muni | ムニ | 狐のお面 | 第四章／ムニと祭り | 狐のお面を斜めにかぶったムニと主人公 |
| st_c4_tri_gj | 三角関係 | 三人の夏祭り | 第四章／三人で回る | ゲルとジンパチに挟まれた浴衣の主人公、二人が互いを横目で見る |
| st_c4_jin_shrine | ジンパチ | 社の裏 | 第四章／ジンパチを探す | 暗い社の裏で耳を塞いでしゃがみ込むジンパチ、遠くの花火光 |
| st_c5_roof_stars | 共通 | 屋根の上の七人 | 第五章 | 新月の屋根に並んで寝転ぶ七人、天の川 |
| st_c6_clock | 共通 | 動き出した時計 | 第六章 | 嵐と稲光、時計塔の文字盤の針が2:17から動き出す |
| st_c6_attic_can | 共通 | 星の缶 | 第六章 | 焦げた梁の屋根裏、釘穴の開いた錆びた空き缶を拾う主人公の手 |
| st_c6_clipping | 共通 | 十五年前の記事 | 第六章 | 古い新聞切り抜き「消防士が殉職」と、若い千鶴・奏・4歳の主人公の写真 |
| st_c7_reny_vigil | レニィ | 午前三時の夜番 | 第七章／レニィの隣に座る | ムニの部屋の前で一枚の毛布を分け合う主人公とレニィ |
| st_c7_mask_hyu | ヒュウ | 仮面の下 | 第七章／ヒュウと踊る | 後夜祭、落ちる白い仮面、前髪が割れ右目周りの火傷と赤い瞳 |
| st_c7_between | 三角関係 | 二人の間 | 第七章／間に飛び込む | 焦げた桜の下、拳を振り上げるジンパチと倒れたヒュウの間に両腕を広げる主人公 |
| st_c8_empty_plate | 共通 | ヒュウの席 | 第八章 | 湯気のない皿を並べるムニ、空席 |
| st_c8_snow_reny | レニィ | 初雪（レニィ） | 第八章／レニィを選ぶ | 雪の屋根に寝転ぶレニィと主人公 |
| st_c8_snow_hyu | ヒュウ | 初雪（ヒュウ） | 第八章／ヒュウを選ぶ | 雪の窓辺、布をかけたキャンバスの前のヒュウ |
| st_c8_snow_jin | ジンパチ | 初雪（ジンパチ） | 第八章／ジンパチを選ぶ | 自分のマフラーを主人公に巻くジンパチ、スコップ |
| st_c8_snow_gel | ゲル | 初雪（ゲル） | 第八章／ゲルを選ぶ | 雪の吹き込むガレージ、船外機に耳を当てるゲル |
| st_c8_snow_neo | ネオ | 初雪（ネオ） | 第八章／ネオを選ぶ | 雪の夜の書斎、ピアノの前のネオ |
| st_c8_snow_muni | ムニ | 初雪（ムニ） | 第八章／ムニを選ぶ | 主人公に抱き上げられて窓の雪を見るムニ |
| st_c9_blueprint | 共通 | ブライトンの設計図 | 第九章／塔を探す | 真鍮の筒から出てきた青焼き図面、ABのモノグラムと署名 |
| st_c9_christmas | 共通 | 七人のクリスマス | 第九章 | 鶏の丸焼きとLEDキャンドルのケーキを囲む七人 |
| st_c9_contract | 共通 | 合意書 | 第九章 | 書斎の机、鳳グループの封筒からはみ出た「合意書」とネオの署名 |
| st_c10_sora | ムニ | ハルの告白 | 第十章 | カウンターでうつむくハル、焦げ茶の髪の分け目の根元が青い |
| st_r10_reny_mother | レニィ | いってらっしゃい | レニィルート第十章 | 駅のカフェ、青い髪の母とレニィ、テーブルの上で繋がれた主人公とレニィの手 |
| st_r11_reny_lap | レニィ | 膝の上の春 | レニィルート第十一章 | 陽だまりの居間、主人公の膝で眠るレニィとチョコの箱 |
| st_h11_same_night | ヒュウ | 同じ夜 | ヒュウルート第十一章 | 屋根裏、缶の星を見上げるムニと、凍りつくヒュウ |
| st_j10_grave | ジンパチ | 父の墓 | ジンパチルート第十章 | 海の見える墓地、墓前で泣くジンパチ、主人公としず |
| st_j11_ittekimasu | ジンパチ | いってきます | ジンパチルート第十一章 | 玄関、紺のスーツで振り返り泣き笑いのジンパチ |
| st_j11_return | ジンパチ | 帰る道 | ジンパチルート第十一章 | 燃える屋根裏でレニィを背負い星の窓へ向かうジンパチ |
| st_g10_sign | ゲル | 指先の言葉 | ゲルルート第十章 | 夕食の席、手話をする主人公とムニ、口を覆うゲル |
| st_n10_tokyo | ネオ | 帰るぞ | ネオルート第十章 | 冬の東京の夜、本社ビル前で主人公に手を差し出すネオ |
| st_m11_mama | ムニ | ママ | ムニルート第十一章 | 屋根裏、火傷した手でムニの頬を包むソラ、胸に顔をうずめるムニ |
| st_b_fire_alone | バッド | 焔の中へ | 第十一章／ひとりで飛び込む | 赤い屋根裏、星の窓の下で泣くムニへ手を伸ばす主人公 |
| st_e_reny_happy | エンディング | おはようの約束 | レニィ HAPPY | 塔のプラネタリウム、作り物の朝焼けの中でキスする二人 |
| st_e_reny_normal | エンディング | 春眠、窓辺にて | レニィ NORMAL | 星の下、主人公の肩で眠るレニィ |
| st_e_reny_bad | エンディング | 眠り姫はきみのほう | レニィ BAD | 病室で眠るレニィの手を握る主人公、枕元の小さな投影機 |
| st_e_hyu_happy | エンディング | 両目で描く君 | ヒュウ HAPPY | 絵『みて、ほしだよ』の前で、前髪を切り両目で笑うヒュウ |
| st_e_hyu_normal | エンディング | 片目の自画像 | ヒュウ NORMAL | 駅のホーム、主人公の額に口づけるヒュウ |
| st_e_hyu_bad | エンディング | 描かれなかった肖像 | ヒュウ BAD | 空のアトリエ、顔だけ白い主人公の肖像画 |
| st_e_jin_happy | エンディング | 炎の向こうのただいま | ジンパチ HAPPY | 満開の焦げた桜の下、紺の制服のジンパチが主人公を抱きしめる |
| st_e_jin_normal | エンディング | 消防士の背中 | ジンパチ NORMAL | 改札へ向かう大きな背中、片手を上げる |
| st_e_jin_bad | エンディング | 父と同じ場所へ | ジンパチ BAD | 父の隣に刻まれた名前の墓前、手紙を持つ主人公 |
| st_e_gel_happy | エンディング | きこえる、きこえない、好き | ゲル HAPPY | 夕暮れの防波堤、手話で「すき」を交わしキスする二人 |
| st_e_gel_normal | エンディング | 指先の約束 | ゲル NORMAL | 春の港、小指を絡める二人の手のアップ |
| st_e_gel_bad | エンディング | 無音の海 | ゲル BAD | 工具の消えたガレージの作業台、一枚のメモ |
| st_e_neo_happy | エンディング | 王冠を捨てた日 | ネオ HAPPY | 春の書斎、ピアノの前で片膝をつくネオ |
| st_e_neo_normal | エンディング | 仮契約の恋人 | ネオ NORMAL | 賃貸借契約書を差し出すネオと笑う主人公 |
| st_e_neo_bad | エンディング | 王の帰還 | ネオ BAD | 新聞の経済面、完璧な無表情のネオの写真 |
| st_e_muni_happy | エンディング | ただいま、おかえり | ムニ HAPPY | 門の前で振り返るムニ、手を繋いだ主人公とソラ |
| st_e_muni_normal | エンディング | またね、おねえちゃん | ムニ NORMAL | 電車の窓から手を振るムニ、頭を下げるソラ |
| st_e_muni_bad | エンディング | わすれんぼうのムニ | ムニ BAD | 六年後の図書館、振り向く11歳の少年と大人の主人公 |
| st_e_tri_jh_sweet | エンディング | 灰と星の三人 | 三角関係（ジンパチ×ヒュウ） | 墓前で笑う三人 |
| st_e_tri_jh_bitter | エンディング | 焼け跡の春 | 三角関係（ジンパチ×ヒュウ） | 満開の焦げた桜の下のベンチにひとり座る主人公 |
| st_e_tri_rn_sweet | エンディング | 朝と夜の王国 | 三角関係（レニィ×ネオ） | プラネタリウム、主人公の右にレニィ左にネオ |
| st_e_tri_rn_bitter | エンディング | 二人ぶんの空席 | 三角関係（レニィ×ネオ） | 朝の食卓の空いた二つの椅子 |
| st_e_tri_gj_sweet | エンディング | 三人で走る海岸線 | 三角関係（ゲル×ジンパチ） | 海岸線の軽トラ、運転席ゲル・助手席主人公・荷台のジンパチ |
| st_e_tri_gj_bitter | エンディング | 幼馴染の終わり | 三角関係（ゲル×ジンパチ） | 防波堤の先にひとり座るジンパチの背中 |
| st_e_empty | エンディング | 空き家 | 共通 BAD | リゾートホテルのロビーに移築された、2:17で止まった時計 |
| st_e_fire | エンディング | 焔の夜 | 共通 BAD | 夜明け前、焼けた屋根裏と星の窓、屋根の上で保護されるムニ |
| st_true_1 | トゥルー | 星まつり | TRUE | 塔のプラネタリウム、町の人々と住人たちが星を見上げる |
| st_true_2 | トゥルー | 凪ノ家の灯 | TRUE | 玄関前の八人の集合写真、鐘が鳴る瞬間 |

## BGM

| ID | 曲の指示 | ファイル | 使用箇所 |
|---|---|---|---|
| title | タイトル：ピアノとオルゴール、郷愁と温かさ | assets/bgm/title.ogg |  |
| prologue | 序章：電車と海、期待と不安 | assets/bgm/prologue.ogg | 00_prologue |
| daily_morning | 朝の日常：軽やか | assets/bgm/daily_morning.ogg | 00_prologue, 01_april, 02_may |
| daily_house | 凪ノ家のテーマ：木管とピアノ | assets/bgm/daily_house.ogg | 00_prologue, 05_august |
| daily_fun | にぎやかな日常 | assets/bgm/daily_fun.ogg | 01_april, 04_july, 06_september, 11_route_hyu, 12_route_jin, 14_route_neo |
| tender | 優しい場面 | assets/bgm/tender.ogg | 01_april, 02_may, 03_june, 08_november, 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 17_fire_and_letter |
| serious | 緊張感のある会話 | assets/bgm/serious.ogg | 00_prologue, 02_may, 03_june, 09_shared_winter, 14_route_neo, 15_route_muni |
| letter | 千鶴の手紙のテーマ：ピアノソロ | assets/bgm/letter.ogg | 00_prologue, 02_may, 03_june, 04_july, 05_august, 06_september, 07_october, 08_november, 09_shared_winter |
| letter_last | 十二通目：手紙のテーマの完全版、弦が加わる | assets/bgm/letter_last.ogg | 17_fire_and_letter |
| night | 夜の静けさ | assets/bgm/night.ogg | 00_prologue, 01_april, 02_may, 05_august, 07_october, 17_fire_and_letter |
| night_tension | 見張りの夜、張りつめた静寂 | assets/bgm/night_tension.ogg | 17_fire_and_letter |
| sea | 海 | assets/bgm/sea.ogg | 02_may, 05_august |
| cafe | カフェ | assets/bgm/cafe.ogg | 02_may |
| cafe_winter | 冬のカフェ | assets/bgm/cafe_winter.ogg | 09_shared_winter |
| rain_daily | 雨の日常 | assets/bgm/rain_daily.ogg | 03_june |
| rain_night | 雨の夜の捜索 | assets/bgm/rain_night.ogg | 03_june |
| tension | 不穏 | assets/bgm/tension.ogg | 03_june, 04_july, 06_september, 07_october, 08_november, 09_shared_winter, 13_route_gel, 14_route_neo |
| mystery | 謎 | assets/bgm/mystery.ogg | 03_june, 06_september, 09_shared_winter, 11_route_hyu, 15_route_muni |
| festival | 夏祭り | assets/bgm/festival.ogg | 04_july |
| fireworks | 花火 | assets/bgm/fireworks.ogg | 04_july |
| stars | 星空 | assets/bgm/stars.ogg | 05_august |
| dream | 夢（くぐもった音） | assets/bgm/dream.ogg | 05_august |
| storm | 嵐の夜 | assets/bgm/storm.ogg | 06_september |
| sorrow | 悲しみ | assets/bgm/sorrow.ogg | 06_september, 07_october, 08_november, 11_route_hyu, 12_route_jin, 13_route_gel, 15_route_muni, 19_endings_b |
| sorrow_piano | 悲しみ(ピアノ) | assets/bgm/sorrow_piano.ogg | 06_september, 07_october, 08_november, 10_route_reny, 13_route_gel |
| festival_univ | 学園祭 | assets/bgm/festival_univ.ogg | 07_october |
| waltz | 仮面舞踏会のワルツ | assets/bgm/waltz.ogg | 07_october |
| snow | 初雪 | assets/bgm/snow.ogg | 08_november |
| hope | 希望・作戦会議 | assets/bgm/hope.ogg | 09_shared_winter |
| christmas | クリスマス | assets/bgm/christmas.ogg | 09_shared_winter |
| snow_sorrow | 雪の別れ | assets/bgm/snow_sorrow.ogg | 09_shared_winter, 14_route_neo |
| spring_sorrow | 焼け跡の春 | assets/bgm/spring_sorrow.ogg | 17_fire_and_letter |
| fire_tension | 小火：緊迫 | assets/bgm/fire_tension.ogg | 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni |
| fire | 火事：激しい緊迫 | assets/bgm/fire.ogg | 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni, 17_fire_and_letter |
| triangle | 三角関係のテーマ | assets/bgm/triangle.ogg | 16_triangles |
| true_prelude | トゥルー導入 | assets/bgm/true_prelude.ogg | 15_route_muni |
| true_ending | トゥルーエンディング主題歌想定 | assets/bgm/true_ending.ogg | 19_endings_b |
| ending_theme | エンディング共通 | assets/bgm/ending_theme.ogg | 18_endings_a, 19_endings_b |
| sorrow_end | バッドエンディング | assets/bgm/sorrow_end.ogg | 18_endings_a, 19_endings_b |
| reny_theme | レニィのテーマ：オルゴールと眠たげなシンセ | assets/bgm/reny_theme.ogg | 10_route_reny |
| reny_mother | レニィと母 | assets/bgm/reny_mother.ogg | 10_route_reny |
| reny_ending | レニィEDアレンジ | assets/bgm/reny_ending.ogg | 18_endings_a |
| hyu_theme | ヒュウのテーマ：チェロとピアノ、気取りと陰 | assets/bgm/hyu_theme.ogg | 11_route_hyu |
| hyu_love | ヒュウ恋愛 | assets/bgm/hyu_love.ogg | 11_route_hyu |
| hyu_ending | ヒュウED | assets/bgm/hyu_ending.ogg | 18_endings_a |
| jin_theme | ジンパチのテーマ：ギターとブラス、熱と不器用さ | assets/bgm/jin_theme.ogg | 12_route_jin |
| jin_ending | ジンパチED | assets/bgm/jin_ending.ogg | 18_endings_a |
| gel_theme | ゲルのテーマ：アコギと波音、静けさ | assets/bgm/gel_theme.ogg | 13_route_gel |
| gel_love | ゲル恋愛 | assets/bgm/gel_love.ogg | 13_route_gel |
| gel_ending | ゲルED | assets/bgm/gel_ending.ogg | 18_endings_a |
| neo_piano | ネオ：ドビュッシー「月の光」の編曲 | assets/bgm/neo_piano.ogg | 14_route_neo |
| neo_love | ネオ恋愛 | assets/bgm/neo_love.ogg | 14_route_neo |
| neo_ending | ネオED | assets/bgm/neo_ending.ogg | 19_endings_b |
| muni_theme | ムニのテーマ：鉄琴とリコーダー | assets/bgm/muni_theme.ogg | 15_route_muni |
| muni_mama | ムニと母 | assets/bgm/muni_mama.ogg | 15_route_muni |
| muni_ending | ムニED | assets/bgm/muni_ending.ogg | 19_endings_b |
| triangle_ending | 三角関係ED | assets/bgm/triangle_ending.ogg | 19_endings_b |

## 効果音

| ID | 内容 | ファイル | 使用箇所 |
|---|---|---|---|
| train | 電車の走行音 | assets/se/train.ogg | 00_prologue |
| train_stop | 電車の停車 | assets/se/train_stop.ogg | 00_prologue |
| footsteps | 廊下の足音(木の床) | assets/se/footsteps.ogg | 00_prologue, 01_april, 05_august |
| door | 扉の開閉 | assets/se/door.ogg | 00_prologue, 08_november, 09_shared_winter, 11_route_hyu, 14_route_neo |
| paper | 封筒を開ける・紙 | assets/se/paper.ogg | 00_prologue, 02_may, 17_fire_and_letter |
| knock | ノック2回 | assets/se/knock.ogg | 00_prologue, 17_fire_and_letter |
| bell_far | 遠くの小さな鐘 | assets/se/bell_far.ogg | 00_prologue |
| heartbeat | 心音(フラッシュバック) | assets/se/heartbeat.ogg | 02_may, 05_august, 06_september, 11_route_hyu, 17_fire_and_letter |
| rain | 雨 | assets/se/rain.ogg | 03_june |
| rain_heavy | 豪雨 | assets/se/rain_heavy.ogg | 03_june |
| fall | 転倒 | assets/se/fall.ogg | 03_june |
| cicada | 蝉 | assets/se/cicada.ogg | 04_july, 05_august |
| firework | 花火の破裂音 | assets/se/firework.ogg | 04_july |
| fire | 炎の音 | assets/se/fire.ogg | 05_august, 06_september, 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni, 17_fire_and_letter |
| storm | 暴風 | assets/se/storm.ogg | 06_september |
| thunder | 雷鳴 | assets/se/thunder.ogg | 06_september |
| bell_tower | 時計塔の鐘(低く重い) | assets/se/bell_tower.ogg | 06_september, 17_fire_and_letter |
| clock_tick | 時計の秒針 | assets/se/clock_tick.ogg | 06_september |
| water_drip | 雨漏りの水滴 | assets/se/water_drip.ogg | 06_september |
| glass | 物が落ちる／割れる | assets/se/glass.ogg | 07_october, 09_shared_winter |
| punch | 殴打 | assets/se/punch.ogg | 07_october |
| extinguish | 消火器の噴射 | assets/se/extinguish.ogg | 10_route_reny, 11_route_hyu, 12_route_jin, 13_route_gel, 14_route_neo, 15_route_muni |
| collapse | 梁が崩れる | assets/se/collapse.ogg | 10_route_reny, 11_route_hyu, 12_route_jin, 14_route_neo, 17_fire_and_letter |
| fire_alarm | 火災報知器 | assets/se/fire_alarm.ogg | 17_fire_and_letter |
