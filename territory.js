/* 鴨市｜領地系統 territory.js
 * 獨立模組：只透過 window.TERR 與主程式溝通，資料存在 S.terr（{領地代碼: 購買時的遊戲時間}）。
 * 之後要做「島嶼建設／星球建設／國家建設」，只需要改這個檔案（資料表與 render），不用動主程式。
 * 必須在主程式 <script> 之前載入；若此檔載入失敗，遊戲照常運作，只是沒有領地分頁。
 */
(function () {
  'use strict';

  /* ───────── 資料表：emoji|名稱|制度|人口|地形或首都|簡介 ───────── */
  const ISL = [
    '🏝️|星砂礁|島民議會制|約 1,500 人|珊瑚礁與粉紅沙灘|細沙在月光下會微微發亮，島民堅持每位訪客離開前都要幫沙灘「梳頭髮」。',
    '🌈|彩虹礁|海洋保育特區|約 800 人|七色珊瑚環|雨後總會出現雙層彩虹，島上法律規定釣到魚要先跟牠道歉。',
    '🦆|鴨嘴半島|自治領|約 4,200 人|狹長半島，形似鴨嘴|最適合看日出的地方，島長的就職典禮一定要在鴨嘴尖端舉行。',
    '🪸|珊瑚環礁|環礁聯合會|約 2,600 人|圓形環礁與潟湖|潟湖清澈到能直接看見海底的鴨子雕像，那是上一任島長的藝術創作。',
    '🍵|茶香島|茶農合作社制|約 9,800 人|高山茶園與霧海|整座山都是茶園，島民以茶葉計價，一把茶葉等於一頓午餐。',
    '🌙|月牙島|月曆議會制|約 3,100 人|月牙形海灣|島上依月相排班，滿月夜全島放假，這個傳統已持續三百年。',
    '🌫️|霧凇島|寒冷氣候自治區|約 2,200 人|常年霧凇覆蓋的針葉林|冬天能見度不到十公尺，島民養成了出門先喊一聲「我來了」的禮貌。',
    '🌬️|風車島|風能合作社制|約 6,500 人|平坦草原與上百座風車|電力自給有餘，多餘的電賣給鄰島，換回起司和毛襪。',
    '🍯|蜂蜜島|蜂農長老制|約 5,400 人|花海與蜂場|島上的蜜蜂被登記為居民、擁有投票權，但棄權率高達百分之百。',
    '🌺|花環島|旅遊王國|約 18 萬人|火山島與花海|訪客一下船就會被套上花環，據說拒絕花環要罰一杯椰子汁。',
    '🌴|馬鴨地夫|水上度假聯邦|約 4 萬人|數百座環礁與水上屋|海平面比島民的幽默感還低，島上最大的建築是機場旁的咖啡廳。',
    '🛕|巴鴨島|宗教自治制|約 420 萬人|梯田、火山與神廟|幾乎天天有祭典，島民說「今天沒有祭典」就像說「今天沒有太陽」。',
    '🧊|冰霜島|共和議會制|約 38 萬人|冰河、間歇泉與火山|地熱讓暖氣便宜到不行，居民洗溫泉比洗澡還頻繁。',
    '✈️|冠鴨島|軍民共管特區|約 17 萬人|珊瑚島與軍用機場|戰略位置極佳，島上最熱門的店是二十四小時營業的炸雞店。',
    '🐠|飛鴨濟|部落酋長制|約 90 萬人|三百多座珊瑚島|歡迎儀式是共飲一碗胡椒根汁，喝完全身麻麻的，但心情很好。',
    '🌊|塔希鴨|海外自治領|約 28 萬人|火山島與黑珍珠潟湖|黑珍珠是當地的貴重物，島民以交換珍珠決定婚約日期。',
    '❄️|雪原道|道廳制|約 520 萬人|雪原、溫泉與薰衣草田|冬天的冰雪祭有全島最大的雪鴨雕像，每年都被孩子偷偷圍上圍巾。',
    '🏖️|琉球鴨|王國遺緒自治制|約 140 萬人|亞熱帶島弧與海洋公園|島民說話慢悠悠，口頭禪是「船到橋頭自然直」。',
    '🏛️|聖托鴨尼|白牆議會制|約 1.5 萬人|火山口與藍頂教堂|日落時全島都會停下來看海，連驢子也配合安靜三分鐘。',
    '🌋|加那鴨|海外自治區|約 220 萬人|火山群島|有一座被暱稱為「老大哥」的火山，每次冒煙都有人鼓掌。',
    '🏰|馬爾鴨他|騎士團議會制|約 52 萬人|石灰岩小島與古堡|整座島像一座露天博物館，路邊隨便一塊石頭都有五百歲。',
    '🍋|西西鴨島|地中海聯邦|約 500 萬人|火山與柑橘園|島民熱愛甜點，據說每家的冰淇淋食譜都藏在祖母的圍裙裡。',
    '🐢|塞席鴨|海龜保育共和制|約 10 萬人|花崗岩巨石海灘|海龜比居民早到幾千萬年，所以路權永遠是烏龜優先。',
    '🦤|模里鴨斯|多元共和制|約 130 萬人|火山島與潟湖|傳說渡渡鳥從未真正消失，只是躲在咖啡館裡偷看遊客。',
    '☕|錫蘭茶島|茶園共和制|約 2,200 萬人|丘陵茶園與熱帶雨林|下午四點全島一起喝茶，連計程車司機都會熄火泡一壺。',
    '🦈|帛鴨|海洋保護國|約 1.8 萬人|石灰岩小島群與水母湖|法律規定遊客要簽「環保誓言」，違反者要當面向水母道歉。',
    '🦘|塔斯鴨尼亞|自治州議會制|約 57 萬人|荒野森林與冷涼海岸|據說最後一批「魔鬼鴨」仍在此生活，脾氣差但很可愛。',
    '💎|巴哈鴨|免稅金融特區|約 40 萬人|淺藍海灣與粉紅沙灘|銀行比海灘還多，島民笑稱他們的主要出口是「祕密」。',
    '🎶|牙買鴨|音樂共和制|約 280 萬人|山地、雨林與海灣|全島每天都有節奏，連紅綠燈閃爍都符合拍子。',
    '🛶|波拉鴨拉|傳統村落制|約 9,000 人|潟湖與火山中央山峰|被公認為最適合發呆的島，島民的主要工作是「把海看好」。'
  ];

  const NAT = [
    '🌸|櫻花國|君主立憲制|約 1.2 億人|首都 花見京|春天全國進入「賞花戰鬥模式」，公司會派新人提早去鋪野餐墊占位置。',
    '🐼|胖達國|中央集權共和制|約 14 億人|首都 竹京|國寶是黑白圓滾滾的胖達，外交官最重要的技能是「借胖達」。',
    '🐆|雲豹國|民主共和制|約 2,300 萬人|首都 雲台|高山與半導體並存的島國，居民誇口「珍珠奶茶與晶片都是主食」。',
    '🥬|泡菜國|總統共和制|約 5,100 萬人|首都 辣城|宵夜文化發達，凌晨兩點的炸雞店比早餐店還擠。',
    '🦘|袋鼠國|聯邦議會制|約 2,600 萬人|首都 育兒袋市|國民最愛說的話是「沒問題啦」，連簽約都在烤肉架旁完成。',
    '🍁|楓葉國|聯邦君主立憲制|約 3,900 萬人|首都 楓糖城|超級有禮貌，擦身而過會互道三次抱歉，據說這是國家機密。',
    '🦅|自由鷹國|聯邦總統制|約 3.3 億人|首都 鷹都|什麼都要超大杯，連早餐的杯子都能拿來當花瓶。',
    '🌷|鬱金香國|君主立憲制|約 1,800 萬人|首都 風車港|一半國土在海平面以下，全民擅長騎腳踏車與填海造陸。',
    '🍺|啤酒國|聯邦議會制|約 8,400 萬人|首都 麥芽堡|嚴謹到連啤酒泡沫的高度都有國家標準。',
    '🍷|紅酒國|半總統制|約 6,800 萬人|首都 酒鄉|罷工和麵包一樣是國民日常，午餐時間神聖不可侵犯。',
    '🍕|披薩國|議會共和制|約 5,900 萬人|首都 圓餅城|內閣更換頻繁，但披薩配方三百年來沒動過。',
    '🐂|鬥牛國|君主立憲制|約 4,700 萬人|首都 午睡堡|午睡是國策，晚上十點才吃晚餐，凌晨還有人在開會。',
    '🫖|茶霧王國|君主立憲制|約 6,700 萬人|首都 大鐘市|下雨天才是正常天氣，排隊是國民運動，插隊者會被全國白眼。',
    '🐻|白熊國|聯邦總統制|約 1.4 億人|首都 冰堡|疆域橫跨九個時區，所以全國永遠有人在上班、有人在睡覺。',
    '🍛|咖哩國|聯邦議會制|約 14 億人|首都 香料城|語言和咖哩一樣多元，三十種咖哩各有忠實支持者。',
    '🐘|象鼻國|君主立憲制|約 7,000 萬人|首都 微笑市|以微笑與按摩聞名，大象是國家吉祥物，兼最受尊敬的上班族。',
    '🦁|獅城國|議會共和制|約 590 萬人|首都 獅城|嚴格但乾淨，隨地吐口香糖的罰款比午餐還貴。',
    '🍌|香蕉國|總統共和制|約 1.1 億人|首都 島嶼灣|由七千多座島組成，每座島的方言都不同，但唱歌都一樣好聽。',
    '🥥|椰子國|總統共和制|約 2.7 億人|首都 火山市|群島之國，椰子水被當成國民運動飲料。',
    '🍜|河粉國|社會主義共和制|約 1 億人|首都 河畔|摩托車是主要交通工具，一輛車載四個人和一棵年桔樹都很正常。',
    '🔺|金字塔國|總統共和制|約 1.1 億人|首都 沙洲|一半的人口住在河邊，另一半忙著跟遊客講價。',
    '🌈|彩虹獅國|議會共和制|約 6,000 萬人|首都 三首都市|擁有三座首都和十一種官方語言，國慶日要開三場閱兵。',
    '💃|森巴國|聯邦共和制|約 2.1 億人|首都 嘉年華市|嘉年華全國放假五天，其餘三百六十天都在期待嘉年華。',
    '🪘|探戈國|聯邦總統制|約 4,500 萬人|首都 草原港|烤肉是國民信仰，市長候選人得先通過烤肉測試。',
    '🌵|仙人掌國|聯邦共和制|約 1.3 億人|首都 玉米城|辣椒、玉米餅與亡靈節是三大國寶，沒人敢說哪個比較重要。',
    '🧀|乳酪國|聯邦直接民主制|約 880 萬人|首都 巧克力堡|全民公投決定一切，連廣場的鴨池要不要加欄杆都要投票。',
    '🥝|奇異鳥國|君主立憲制|約 510 萬人|首都 羊群市|羊比人多六倍，所以選舉時候選人必須先向羊群致意。',
    '🎈|熱氣球國|總統共和制|約 8,500 萬人|首都 氣球城|奇岩地形最適合飛行，天空永遠有數百顆熱氣球在排隊起飛。',
    '🦆|鴨鴨共和國|直接民主共和制|約 4,800 萬人|首都 鴨池市|本遊戲的主場，國歌只有三個音符的「呱呱呱」，每位國民平均擁有 2.3 把雨傘。',
    '🏔️|霧凇王國|君主立憲制|約 600 萬人|首都 冰晶城|長年被霧凇覆蓋的高山王國，國王的皇冠是冰雕鍍金的，夏天要放冰箱。'
  ];

  const PLN = [
    '🌕|茶月|月面自治基地|約 1,200 人|無大氣、低重力|鴨子在這裡跳一步等於地球的六步，月面茶館的泡茶時間要多算兩倍。',
    '🔴|紅鴨星|殖民地議會制|約 8 萬人|赤紅沙漠與稀薄大氣|第一批殖民者種出的馬鈴薯被封為「國寶」，沙塵暴季是全星球公認的放假日。',
    '🟡|金鴨星|高壓工業邦聯|約 3 萬人|雲層之上的浮空城|地表高溫高壓，居民住在雲層上方，據說這裡的一天比一年還長。',
    '🟠|斑紋巨星|氣態行星聯合體|約 120 萬人|巨大風暴與衛星群|居民住在軌道衛星與浮空城，巨大紅斑是全星球的「天氣預報」重點。',
    '🪐|茶環星|環帶貿易同盟|約 60 萬人|冰環與氣態巨行星|星環由冰與岩石構成，居民靠採冰賣給鄰星球做冰茶為生。',
    '🔵|傾倒星|冰巨星長老會|約 15 萬人|躺著自轉的冰巨星|整顆星球「躺」著繞太陽轉，一季極晝、一季極夜，居民說這叫「午睡制度」。',
    '💠|冰藍星|深空科學自治體|約 9 萬人|極寒與超音速狂風|太陽系邊陲的守望站，居民堅信再往前一步就是宇宙盡頭。',
    '🌌|鴨鴨星系|銀河鴨皇制|約 1,200 億人|數千億顆恆星|終局成就。你成為整個星系的皇帝，據說連黑洞也要先敲門再吞東西。'
  ];

  const TI = {
    i: { n: '島嶼', base: 1e12, g: 1.1, bon: 0.01, cap: 0, eff: '買賣手續費 −3%', rows: ISL },
    n: { n: '國家', base: 1e13, g: 1.1, bon: 0.03, cap: 0, eff: '賣出交易稅 −3%', rows: NAT },
    p: { n: '星球', base: 2e14, g: 1.6, bon: 0.08, cap: 5000, eff: '員工上限 +5,000', rows: PLN }
  };
  const rd = x => Math.round(x / 1e10) * 1e10;
  const ITEMS = [], BY = {};
  Object.keys(TI).forEach((t, ti) => {
    TI[t].rows.forEach((r, i) => {
      const f = r.split('|'), gal = t === 'p' && i === TI.p.rows.length - 1;
      const it = {
        id: t + i, t, i, e: f[0], n: f[1], sys: f[2], pop: f[3], geo: f[4], desc: f[5],
        price: rd(TI[t].base * Math.pow(TI[t].g, i)),
        bon: gal ? 0.30 : TI[t].bon, cap: gal ? 10000 : TI[t].cap, gal,
        hu: (i * 47 + ti * 120) % 360
      };
      ITEMS.push(it); BY[it.id] = it;
    });
  });
  const TOTAL = ITEMS.length;

  /* ───────── 快取：加成、價值、持有數 ───────── */
  const C = { ref: null, n: -1, m: 1, cap: 0, fee: 1, tax: 1, v: 0, cnt: { i: 0, n: 0, p: 0, pn: 0, g: 0, all: 0 } };
  let N = 0;
  function calc() {
    let b = 0, cap = 0, v = 0;
    const cnt = { i: 0, n: 0, p: 0, pn: 0, g: 0, all: 0 };
    for (const k of Object.keys(S.terr)) {
      const it = BY[k];
      if (!it) { delete S.terr[k]; continue; }   // 清掉不認得的代碼（舊版或損壞資料）
      b += it.bon; cap += it.cap; v += it.price; cnt.all++; cnt[it.t]++;
      if (it.t === 'p') { if (it.gal) cnt.g++; else cnt.pn++; }
    }
    C.ref = S.terr; C.n = N; C.m = 1 + b; C.cap = cap; C.v = v; C.cnt = cnt;
    C.fee = Math.max(0.1, 1 - 0.03 * cnt.i);
    C.tax = Math.max(0.1, 1 - 0.03 * cnt.n);
  }
  function ensure() {
    try {
      if (typeof S === 'undefined' || !S) return C;
      if (!S.terr || typeof S.terr !== 'object' || Array.isArray(S.terr)) S.terr = {};
      if (C.ref !== S.terr || C.n !== N) calc();
    } catch (e) { /* 主程式尚未初始化 */ }
    return C;
  }

  /* ───────── 工具 ───────── */
  function bz(x) {
    const a = Math.abs(x);
    if (a >= 1e16) return (x / 1e16).toFixed(2) + '京';
    if (a >= 1e12) return (x / 1e12).toFixed(2) + '兆';
    return typeof bn === 'function' ? bn(x) : Math.round(x).toLocaleString('zh-TW');
  }
  const pctTxt = it => '+' + (it.bon * 100).toFixed(0) + '%';
  const effTxt = it => it.t === 'p' ? '員工上限 +' + it.cap.toLocaleString('zh-TW') : TI[it.t].eff;

  /* ───────── 成就（由持有狀態即時推算，不另存） ───────── */
  const ACH = [
    ['小島主', '擁有 1 座島嶼', c => c.i, 1], ['群島之主', '擁有 5 座島嶼', c => c.i, 5],
    ['環礁領主', '擁有 10 座島嶼', c => c.i, 10], ['海洋王', '擁有 20 座島嶼', c => c.i, 20],
    ['島嶼收藏家', '買齊全部 30 座島嶼', c => c.i, 30],
    ['新任國王', '擁有 1 個國家', c => c.n, 1], ['外交家', '擁有 5 個國家', c => c.n, 5],
    ['聯盟盟主', '擁有 10 個國家', c => c.n, 10], ['大帝', '擁有 20 個國家', c => c.n, 20],
    ['萬國之主', '買齊全部 30 個國家', c => c.n, 30],
    ['登月鴨', '擁有 1 顆星球', c => c.pn, 1], ['太空殖民者', '擁有 3 顆星球', c => c.pn, 3],
    ['行星大亨', '買齊 7 顆行星', c => c.pn, 7], ['星際鴨皇', '買下鴨鴨星系', c => c.g, 1],
    ['鴨鴨宇宙霸主', '買齊全部 ' + TOTAL + ' 處領地', c => c.all, TOTAL]
  ];
  const ach = () => { const c = ensure().cnt; return ACH.map(a => ({ n: a[0], d: a[1], cur: a[2](c), need: a[3], ok: a[2](c) >= a[3] })); };

  /* ───────── 介面 ───────── */
  let TV = 'i', TSEL = null;

  function rowH(it) {
    const own = !!S.terr[it.id];
    return `<div class="row" onclick="TERR.sel('${it.id}')"${own ? ' style="border-left:4px solid var(--ac)"' : ''}>` +
      `<span class="lg" style="background:hsl(${it.hu} 70% 88%);border-color:hsl(${it.hu} 50% 55%)">${it.e}</span>` +
      `<div class="g"><b>${it.n}</b> ${own ? '✅' : ''}<br><small>${it.sys}・${it.pop}</small></div>` +
      `<div class="r"><b>${bz(it.price)}</b><small>${own ? '已擁有' : '加成 ' + pctTxt(it)}</small></div></div>`;
  }
  function detailH(it) {
    const o = S.terr[it.id], tn = TI[it.t].n;
    const geoLabel = it.t === 'n' ? '首都' : it.t === 'p' ? '環境' : '地形';
    const geo = it.t === 'n' ? it.geo.replace('首都 ', '') : it.geo;
    return `<div class="card"><div style="display:flex;gap:10px;align-items:center">` +
      `<span class="lg" style="background:hsl(${it.hu} 70% 88%);border-color:hsl(${it.hu} 50% 55%)">${it.e}</span>` +
      `<div><b style="font-size:17px">${it.n}</b><br><small>${tn}・${it.sys}</small></div></div>` +
      `<div class="kvs">${kv([['制度', it.sys], ['人口', it.pop], [geoLabel, geo], ['價格', bz(it.price)],
        ['領地加成', '收入 ' + pctTxt(it)], ['附帶效益', effTxt(it)]])}</div><p>${it.desc}</p>` +
      (o ? `<b>✅ 已於 ${tstr(o).split('（')[0]} 取得這處領地</b>`
        : `<div id="tdc" style="margin-bottom:6px"></div><button class="bb" style="background:var(--ac)" onclick="TERR.buy('${it.id}')">購買</button> ` +
          `<small>從個人現金扣款，購買價仍計入總資產；買下後不能轉賣。</small>`) +
      `</div>`;
  }
  function achH() {
    const L = ach(), done = L.filter(a => a.ok).length;
    return `<div class="card"><b>🏆 領地成就</b> <small>${done}/${L.length}</small></div>` +
      L.map(a => `<div class="card"><b>${a.ok ? '✅' : '⬜'} ${a.n}</b><br><small>${a.d}（${Math.min(a.cur, a.need)}/${a.need}）</small></div>`).join('');
  }
  function build() {
    const c = ensure().cnt, own = S.terr;
    const tabs = [['i', '島嶼 ' + c.i + '/' + TI.i.rows.length], ['n', '國家 ' + c.n + '/' + TI.n.rows.length],
      ['p', '星球 ' + c.p + '/' + TI.p.rows.length], ['a', '成就']];
    let h = '<div id="tsum"></div><div class="sp" style="margin:8px 0">' +
      tabs.map(t => `<button class="${TV === t[0] ? 'on' : ''}" onclick="TERR.go('${t[0]}')">${t[1]}</button>`).join('') + '</div>';
    if (TV === 'a') return h + achH();
    h += `<div class="card"><small>${TI[TV].n}每座：收入加成 ${pctTxt({ bon: TI[TV].bon })}（所有公司，含子公司；各領地加成相加）・${TI[TV].eff}。購買價依序遞增。</small></div>`;
    if (TSEL && BY[TSEL] && BY[TSEL].t === TV) h += detailH(BY[TSEL]);
    else h += '<p><small>點選下方領地查看制度、人口與介紹。</small></p>';
    return h + ITEMS.filter(it => it.t === TV).map(rowH).join('');
  }
  function dyn() {
    const c = ensure(), s = document.getElementById('tsum');
    if (s) {
      s.innerHTML = '<div class="card"><b>🗺 我的領地</b> <small>' + c.cnt.all + '/' + TOTAL + '</small><div class="kvs">' +
        kv([['持有', '島 ' + c.cnt.i + '・國 ' + c.cnt.n + '・星 ' + c.cnt.p], ['領地總價值', bz(c.v)],
          ['收入倍率', '× ' + c.m.toFixed(2)], ['員工上限', '+' + fm(c.cap)],
          ['買賣手續費', '× ' + c.fee.toFixed(2)], ['賣出交易稅', '× ' + c.tax.toFixed(2)]]) +
        '</div><small>個人現金 ' + bz(S.cash) + '</small></div>';
    }
    const d = document.getElementById('tdc');
    if (d && TSEL && BY[TSEL]) {
      const p = BY[TSEL].price;
      d.innerHTML = S.cash >= p ? '個人現金 ' + bz(S.cash) + '・<b>可以購買</b>'
        : '個人現金 ' + bz(S.cash) + '・還差 <b>' + bz(p - S.cash) + '</b>';
    }
  }
  function render(M) {
    const h = build();
    if (M.dataset.h !== h) { M.innerHTML = h; M.dataset.h = h; }
    dyn();
  }

  /* ───────── 操作 ───────── */
  function go(k) { TV = k; const m = document.getElementById('main'); if (m) m.dataset.h = ''; rm(); }
  function sel(id) { TSEL = id; rm(); }
  function buy(id) {
    const it = BY[id]; if (!it) return;
    ensure();
    if (S.terr[id]) return ts('已經擁有這處領地');
    if (!(it.price > 0) || !isFinite(it.price)) return ts('價格異常，無法購買');
    if (!(S.cash >= it.price)) return ts('個人現金不足，還差 ' + bz(it.price - S.cash));
    if (!confirm('購買「' + it.n + '」？\n價格 ' + bz(it.price) + '（從個人現金扣除，仍計入總資產，不可轉賣）')) return;
    const before = ach().filter(a => a.ok).map(a => a.n);
    S.cash -= it.price;
    S.terr[id] = S.t; N++;
    ensure();
    addN(it.gal ? `${it.e}你買下了整個${it.n}！收入倍率提升為 ×${C.m.toFixed(2)}。`
      : `${it.e}你買下了${TI[it.t].n}「${it.n}」，收入倍率提升為 ×${C.m.toFixed(2)}。`, '領地');
    ach().filter(a => a.ok && !before.includes(a.n)).forEach(a => addN(`🏆 領地成就解鎖：${a.n}（${a.d}）`, '領地'));
    ts('已購買 ' + it.n);
    try { save(); } catch (e) { /* 存檔失敗由主程式提示 */ }
    if (typeof ui === 'function') ui(); else rm();
  }

  window.TERR = {
    get m() { return ensure().m; },
    get cap() { return ensure().cap; },
    get fee() { return ensure().fee; },
    get tax() { return ensure().tax; },
    get v() { return ensure().v; },
    items: ITEMS, render, buy, go, sel, ach
  };
})();
