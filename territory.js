/* 鴨市｜領地系統 territory.js
 * 獨立模組：只透過 window.TERR 與主程式溝通，資料存在 S.terr（{領地代碼: 購買時的遊戲時間}）與 S.tb／S.tbs（建設與稅收）。
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

  /* ───────── 地標：emoji|名稱|典故（順序與上面三張資料表相同）───────── */
  const LM = {
    i: [
      '🌟|星砂梳月塔|高塔頂端掛著一把巨大的沙梳，每晚替整座沙灘梳一次頭髮。',
      '🌈|七彩雙虹橋|橫跨珊瑚環的雙層拱橋，雨後會同時亮起兩道彩虹，橋頭立著一塊向魚道歉的石碑。',
      '🌅|日出鴨嘴燈塔|矗立在鴨嘴尖端，歷任島長的就職典禮都在它腳下舉行。',
      '🗿|潟湖鴨像館|把上一任島長的鴨子雕像擴建成十層樓高的透明展館，整座像泡在潟湖裡。',
      '🍃|雲端茶園塔|沿著山腰盤旋的茶園觀景塔，島民堅持在塔頂喝茶不算午餐，只算點心。',
      '🌙|滿月議事廳|沒有屋頂的圓形議事廳，只在滿月夜開會，其餘時間全島放假。',
      '🔔|喊聲大鐘樓|霧中的大鐘每分鐘敲一次，島民出門前還是堅持先喊一聲「我來了」。',
      '🌬️|百座風車陣|一百座風車排成鴨子的形狀，從空中俯瞰像一隻正在振翅的鴨。',
      '🍯|蜂后議會大廳|蜜蜂居民的投票廳，棄權率依然是百分之百，但大廳免費供應蜂蜜。',
      '🌺|萬花環拱門|每位訪客都要穿過的巨型花環拱門，拒絕套花環的人要罰一杯椰子汁。',
      '🏝️|水上咖啡穹頂|漂浮在潟湖上的玻璃穹頂，終於讓島上最大的建築不再只是機場旁的咖啡廳。',
      '🛕|千祭神廟|一座有三百六十五個祭壇的神廟，從此「今天沒有祭典」變成不可能的句子。',
      '♨️|間歇泉暖泉宮|間歇泉每小時準時噴發，居民聚在宮裡泡湯，早就分不清是洗澡還是社交。',
      '🍗|不夜炸雞塔|二十四小時營業的炸雞塔，一樓賣炸雞、頂樓是軍用塔台，沒人敢問為什麼。',
      '🥥|胡椒根迎賓堂|每位訪客喝完一碗胡椒根汁才算入島，喝完全身麻麻的，但心情很好。',
      '🦪|黑珍珠潟湖館|館中陳列歷代婚約珍珠，依島民約定的日期輪流展出。',
      '⛄|巨型雪鴨像|冰雪祭的雪鴨被永久化成冰雕，孩子們依然每年偷偷幫它圍上圍巾。',
      '🌊|慢悠悠海洋公園|公園裡的水母全都慢悠悠地游，和島民的口頭禪「船到橋頭自然直」互相呼應。',
      '⛪|藍頂日落禮拜堂|日落時全島停下來看海，連驢子也配合安靜三分鐘。',
      '🌋|老大哥觀火台|為那座暱稱「老大哥」的火山興建的觀火台，每次冒煙還是有人鼓掌。',
      '🏰|五百歲鎮島石|全島第一塊被正式認證為五百歲的石頭，隔壁那塊只好屈居第二。',
      '🍨|祖母圍裙冰淇淋館|館內陳列各家祖母藏在圍裙裡的食譜，參觀者只能看，不能抄。',
      '🐢|海龜路權碑|刻著「烏龜優先」的石碑，每次有居民闖紅燈都得向它鞠躬。',
      '🦤|渡渡鳥咖啡館|傳說渡渡鳥就躲在這裡偷看遊客，招牌是一隻戴著墨鏡的鳥。',
      '☕|四點熄火茶亭|每天下午四點，全島的計程車司機都會在此熄火泡一壺茶。',
      '🪼|水母道歉池|遊客簽完環保誓言後，必須當面向水母道歉才能離島。',
      '🌲|魔鬼鴨保護區|最後一批「魔鬼鴨」的家，脾氣很差，但保護區備有牠們愛吃的零食。',
      '🏦|祕密金庫大廈|銀行比海灘還多的島終於蓋出最大的一座，唯一的出口商品依舊是「祕密」。',
      '🎶|節拍紅綠燈廣場|整座廣場的紅綠燈都按拍子閃爍，連過馬路都得踩點。',
      '🛶|看海發呆台|島民把「把海看好」的工作做成了一座觀景台，登台者可免費發呆三小時。'
    ],
    n: [
      '🌸|花見京大天守|春天占位置的新人總會在這座天守前鋪好野餐墊。',
      '🐼|竹京借熊外交館|專門負責「借胖達」的外交殿堂，門口永遠排著各國外交官。',
      '🐆|雲台晶片珍奶塔|一杯珍珠奶茶旁邊立著一顆晶片，是居民口中「兩大主食」的紀念碑。',
      '🌶️|辣城不夜炸雞街|凌晨兩點比早餐店還擠的炸雞街，整條街的招牌都是辣的。',
      '🦘|育兒袋市烤肉廣場|簽約專用烤肉架，沒有烤肉就不算簽約。',
      '🍁|楓糖城道歉長廊|擦身而過要互道三次抱歉的長廊，據說是國家機密的訓練場。',
      '🦅|鷹都超大杯紀念碑|一只高十八公尺的超大杯飲料，是世界最大的早餐杯。',
      '🌷|風車港海平面堤壩|整個國家一半在海平面下，這道堤壩是他們最驕傲的腳踏車專用道。',
      '🍺|麥芽堡泡沫標準館|收藏全國啤酒泡沫高度標準的檢驗所，每年都有人挑戰誤差一毫米。',
      '🍷|酒鄉午餐神殿|刻著「午餐時間神聖不可侵犯」的碑文，罷工的人們也在此用餐。',
      '🍕|圓餅城三百年配方窖|保存三百年沒動過的披薩配方，內閣換了幾十屆，它還在。',
      '🐂|午睡堡大午睡塔|全國統一午睡的鐘聲塔，晚上十點才響起晚餐鐘。',
      '🫖|大鐘市排隊鐘|每逢下雨整座城都在這座鐘下排隊，插隊者將被全國白眼審判。',
      '🐻|冰堡九時區鐘塔|九個時區同時報時的鐘塔，所以全國永遠有人在上班、有人在睡覺。',
      '🍛|香料城三十咖哩宮|三十種咖哩各有一間展室，參觀者必須選邊站。',
      '🐘|微笑市大象按摩殿|大象吉祥物在此接受國民尊敬，兼負責按摩服務。',
      '🦁|獅城乾淨證明碑|刻著「口香糖罰款比午餐還貴」的紀念碑，被當成觀光景點。',
      '🍌|島嶼灣七千島合唱廳|七千座島、七千種方言，但合唱廳裡每個人唱歌都一樣好聽。',
      '🥥|火山市椰子運動場|椰子水是國民運動飲料，運動場的每個座位都附一顆椰子。',
      '🍜|河畔四人一樹摩托像|一輛車載四個人和一棵年桔樹的紀錄，被鑄成巨大的銅像。',
      '🔺|沙洲講價大市集|一半的人住在河邊，另一半在這裡跟遊客講價，永遠有三成折扣。',
      '🌈|三首都聯合閱兵台|三座首都共用的閱兵台，國慶日要連開三場閱兵。',
      '💃|嘉年華市五日不夜舞台|放假五天的舞台，其餘三百六十天都在彩排。',
      '🪘|草原港烤肉考場|市長候選人必須先通過的烤肉測試場，滿分的人才能開始競選。',
      '🌵|玉米城亡靈節祭壇|辣椒、玉米餅與亡靈節三大國寶共用的祭壇，沒人敢說誰比較重要。',
      '🧀|巧克力堡公投廣場|連廣場鴨池要不要加欄杆都要投票，目前的投票結果是「再討論」。',
      '🥝|羊群市致意台|候選人必須向羊群致意的觀禮台，羊比人多六倍，座位多半留給羊。',
      '🎈|氣球城千球起飛場|數百顆熱氣球排隊起飛的起飛場，天空永遠在塞氣球。',
      '🦆|鴨池市呱呱三音國會|國歌只有三個音符的國會大廈，人人平均配備 2.3 把雨傘。',
      '🏔️|冰晶城冰雕金冠館|國王的冰雕鍍金皇冠陳列在特製冷藏室，夏天全靠它撐起整座王國的氣勢。'
    ],
    p: [
      '🍵|月面低重力茶館|在這裡跳一步等於地球六步，泡茶時間要多算兩倍的月面茶館。',
      '🥔|紅砂國寶馬鈴薯田|第一批殖民者種出的國寶馬鈴薯被保存在恆溫玻璃田，沙塵暴季是全星球公認的放假日。',
      '☁️|雲上浮空城冠冕|懸浮在雲層之上的城市，居民堅稱這裡的一天比一年還長。',
      '🌀|巨大紅斑氣象台|負責全星球「天氣預報」的觀測台，每天都預報同一場風暴。',
      '🧊|星環採冰茶港|採冰賣給鄰星球做冰茶的港口，每顆冰都附一張產地證明。',
      '😴|午睡季節紀念碑|紀念整顆星球「躺著」繞太陽的午睡制度，一季極晝、一季極夜。',
      '🔭|宇宙盡頭守望塔|太陽系邊陲的守望站，居民堅信再往前一步就是宇宙盡頭。',
      '👑|鴨皇黑洞敲門殿|連黑洞也要先敲門再吞東西的皇宮，是整個鴨市的終局奇觀。'
    ]
  };

  /* ───────── 建設設施：每種領地 5 個領域 × 5 級 ───────── */
  const DN = ['交通', '能源', '民生', '產業', '文化'];
  const FAC = {
    i: ['小碼頭,渡輪站,漁港,國際港,離島機場', '太陽能板,風力發電,潮汐發電,儲能電池,智慧微電網', '村落住宅,診所,學校,海景社區,綜合醫院',
        '漁業合作社,養殖場,度假旅店,免稅商圈,海洋科技園', '廟埕市集,小劇場,節慶廣場,海洋博物館,國際藝術節'],
    n: ['公路網,區域鐵道,高速鐵路,國際機場,磁浮鐵道', '火力發電,水力發電,智慧電網,再生能源,核融合電廠', '國民住宅,公立醫院,義務教育,社福體系,智慧城市',
        '農業合作,製造工廠,科技園區,金融中心,太空產業鏈', '國家劇院,大學體系,國家博物館,國際電影節,世界遺產'],
    p: ['著陸平台,軌道太空港,星際航線,軌道電梯,躍遷門', '太陽能陣列,地熱鑽井,核融合爐,軌道發電站,戴森環', '密封艙住宅,穹頂都市,水循環系統,生態圈,行星醫療中心',
        '採礦站,精煉廠,軌道工廠,星際貿易港,量子製造', '科研站,殖民博物館,星空劇院,行星大學,星際文明館']
  };
  Object.keys(FAC).forEach(k => { FAC[k] = FAC[k].map(s => s.split(',')); });
  const EMO = { i: ['⛴️', '🌬️', '🏠', '🐟', '🎪'], n: ['🚉', '⚡', '🏘️', '🏭', '🎭'], p: ['🚀', '☀️', '🛖', '⛏️', '🔭'] };

  /* 建設與稅收參數（要調平衡只改這裡） */
  const CFG = {
    cost: 0.02,      // 第 1 級費用 = 領地購買價 × 0.02
    grow: 1.6,       // 每升一級費用 ×1.6（5 領域全建約為購買價的 1.6 倍）
    days: 20,        // 第 n 級工期 = 20 × n 個遊戲日
    slot0: 3,        // 基本同時施工名額
    slotMax: 12,     // 名額上限（每 5 座地標 +1）
    perCap: 1000,    // 滿繁榮度時每人每月稅收
    taxBase: 0.3,    // 未建設時的基礎稅率係數
    lmTax: 1.25,     // 地標落成後該領地稅收倍率
    galTax: 0.01     // 鴨鴨星系稅率係數（人口 1,200 億，不壓低會讓經濟崩壞）
  };

  const TI = {
    i: { n: '島嶼', base: 1e12, g: 1.1, bon: 0.01, cap: 0, eff: '買賣手續費 −3%', rows: ISL },
    n: { n: '國家', base: 1e13, g: 1.1, bon: 0.03, cap: 0, eff: '賣出交易稅 −3%', rows: NAT },
    p: { n: '星球', base: 2e14, g: 1.6, bon: 0.08, cap: 5000, eff: '員工上限 +5,000', rows: PLN }
  };
  const rd = x => Math.round(x / 1e10) * 1e10;
  function parsePop(s) {
    const m = String(s).replace(/[,，]/g, '').match(/([\d.]+)\s*(萬|億)?/);
    if (!m) return 1000;
    const v = parseFloat(m[1]) * (m[2] === '億' ? 1e8 : m[2] === '萬' ? 1e4 : 1);
    return v > 0 && isFinite(v) ? v : 1000;
  }
  const ITEMS = [], BY = {};
  Object.keys(TI).forEach((t, ti) => {
    TI[t].rows.forEach((r, i) => {
      const f = r.split('|'), gal = t === 'p' && i === TI.p.rows.length - 1, l = (LM[t][i] || '❓|無名地標|').split('|');
      const it = {
        id: t + i, t, i, e: f[0], n: f[1], sys: f[2], pop: f[3], geo: f[4], desc: f[5],
        price: rd(TI[t].base * Math.pow(TI[t].g, i)),
        bon: gal ? 0.30 : TI[t].bon, cap: gal ? 10000 : TI[t].cap, gal,
        hu: (i * 47 + ti * 120) % 360,
        bp: parsePop(f[3]), lm: { e: l[0], n: l[1], s: l[2] }
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
      if (!S.tb || typeof S.tb !== 'object' || Array.isArray(S.tb)) S.tb = {};
      if (!S.tbs || typeof S.tbs !== 'object') S.tbs = { tt: 0, sp: 0, last: 0 };
      ['tt', 'sp', 'last'].forEach(k => { if (!isFinite(S.tbs[k])) S.tbs[k] = 0; });
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
  const el = id => document.getElementById(id);

  /* ───────── 建設：資料正規化與公式 ───────── */
  // S.tb[領地代碼] = { l:[交通,能源,民生,產業,文化 等級0~5], q:null 或 [領域, 完工時間, 開工時間], p:目前人口 }
  const cost = (it, lv) => it.price * CFG.cost * Math.pow(CFG.grow, lv - 1);   // lv = 要蓋的那一級（1~5）
  const dur = lv => CFG.days * lv;                                               // 遊戲日
  function tbOf(id) {
    const it = BY[id];
    if (!it || !S.terr[id]) return null;
    let b = S.tb[id];
    if (!b || typeof b !== 'object') b = S.tb[id] = { l: [0, 0, 0, 0, 0], q: null, p: it.bp };
    if (!Array.isArray(b.l) || b.l.length !== 5) b.l = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) { const v = b.l[i]; b.l[i] = (v >= 0 && v <= 5) ? Math.floor(v) : 0; }
    if (!(b.p > 0) || !isFinite(b.p)) b.p = it.bp;
    if (b.q && (!Array.isArray(b.q) || !(b.q[0] >= 0 && b.q[0] < 5) || b.l[b.q[0]] >= 5 || !isFinite(b.q[1]) || !isFinite(b.q[2]))) b.q = null;
    return b;
  }
  const lmDone = it => { const b = S.tb && S.tb[it.id]; return !!S.terr[it.id] && !!b && Array.isArray(b.l) && b.l.length === 5 && b.l.every(v => v >= 5); };
  function lms() {
    const o = { all: 0, i: 0, n: 0, p: 0 };
    for (const it of ITEMS) if (lmDone(it)) { o.all++; o[it.t]++; }
    return o;
  }
  const slots = () => Math.min(CFG.slotMax, CFG.slot0 + Math.floor(lms().all / 5));
  function used() {
    let n = 0;
    for (const id in S.tb) { const b = S.tb[id]; if (b && b.q && S.terr[id]) n++; }
    return n;
  }
  const pctOf = id => {
    const b = S.tb && S.tb[id];
    if (!b || !Array.isArray(b.l)) return 0;
    return Math.round(b.l.reduce((a, v) => a + (v > 0 && v <= 5 ? v : 0), 0) / 25 * 100);
  };
  const popT = (it, b) => it.bp * (1 + 0.6 * (0.6 * b.l[2] / 5 + 0.4 * b.l[1] / 5));        // 目標人口：民生與能源
  const prosp = b => (b.l[3] + b.l[0]) / 10;                                                    // 繁榮度：產業＋交通
  const happy = b => (b.l[2] + b.l[4]) / 10;                                                    // 幸福度：民生＋文化
  const taxOf = (it, b) => b.p * CFG.perCap * (CFG.taxBase + (1 - CFG.taxBase) * prosp(b)) * (it.gal ? CFG.galTax : 1) * (lmDone(it) ? CFG.lmTax : 1);
  function estTax() {
    let s = 0;
    for (const it of ITEMS) { if (!S.terr[it.id]) continue; const b = tbOf(it.id); if (b) s += taxOf(it, b); }
    return s;
  }

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
    ['鴨鴨宇宙霸主', '買齊全部 ' + TOTAL + ' 處領地', c => c.all, TOTAL],
    ['建設起步', '完成 1 座地標', c => c.lm, 1], ['城市規劃師', '完成 5 座地標', c => c.lm, 5],
    ['基建狂魔', '完成 20 座地標', c => c.lm, 20], ['建築大師', '完成 40 座地標', c => c.lm, 40],
    ['島嶼建設王', '完成全部 30 座島嶼地標', c => c.li, 30], ['國家建設王', '完成全部 30 座國家地標', c => c.ln, 30],
    ['星球建設王', '完成全部 8 座星球地標', c => c.lp, 8], ['宇宙基建王', '完成全部 ' + TOTAL + ' 座地標', c => c.lm, TOTAL],
    ['稅務新手', '累計領地稅收 1 兆', c => c.tt, 1e12], ['稅務大亨', '累計領地稅收 100 兆', c => c.tt, 1e14],
    ['稅務帝國', '累計領地稅收 1 京', c => c.tt, 1e16]
  ];
  const ach = () => {
    const c = Object.assign({}, ensure().cnt), L = lms();
    c.lm = L.all; c.li = L.i; c.ln = L.n; c.lp = L.p; c.tt = (S.tbs && S.tbs.tt) || 0;
    return ACH.map(a => ({ n: a[0], d: a[1], cur: a[2](c), need: a[3], ok: a[2](c) >= a[3] }));
  };
  const okNames = () => ach().filter(a => a.ok).map(a => a.n);
  const notify = before => ach().filter(a => a.ok && !before.includes(a.n)).forEach(a => addN(`🏆 領地成就解鎖：${a.n}（${a.d}）`, '領地'));

  /* ───────── 介面 ───────── */
  let TV = 'i', TSEL = null;
  const lgS = it => `<span class="lg" style="background:hsl(${it.hu} 70% 88%);border-color:hsl(${it.hu} 50% 55%)">${it.e}</span>`;
  const numF = x => x >= 1e8 ? bz(x) : Math.round(x).toLocaleString('zh-TW');

  function rowH(it) {
    const own = !!S.terr[it.id];
    return `<div class="row" onclick="TERR.sel('${it.id}')"${own ? ' style="border-left:4px solid var(--ac)"' : ''}>` +
      lgS(it) +
      `<div class="g"><b>${it.n}</b> ${own ? '✅' : ''}${lmDone(it) ? '🏆' : ''}<br><small>${it.sys}・${it.pop}</small></div>` +
      `<div class="r"><b>${bz(it.price)}</b><small>${own ? '已擁有・建設 ' + pctOf(it.id) + '%' : '加成 ' + pctTxt(it)}</small></div></div>`;
  }

  /* 建設面板：結構只依等級／施工中領域／名額是否已滿而變，其餘（人口、進度、剩餘日數）由 dyn() 填入，避免按鈕被重繪 */
  function bpanel(it) {
    const b = tbOf(it.id);
    if (!b) return '';
    const done = lmDone(it), em = EMO[it.t], fac = FAC[it.t], busy = !!b.q, full = used() >= slots(), lm = it.lm;
    let h = `<div style="border-top:1px solid var(--l);margin-top:10px;padding-top:8px"><b>🏗 建設</b> <small>5 個領域、每領域 5 級；每處領地一次只能施工一項，全域同時施工名額 ${slots()} 個</small><div id="tbi"></div>`;
    h += `<div class="card" style="text-align:center;margin:8px 0;${done ? 'border:2px solid var(--ac)' : ''}"><div style="font-size:38px;${done ? '' : 'filter:grayscale(1);opacity:.35'}">${done ? lm.e : '❓'}</div>` +
      `<b>${done ? lm.n : '地標・尚未落成'}</b><br><small>${done ? lm.s + '（本領地稅收 ×' + CFG.lmTax + '）' : '25 級全部建成後落成：「' + lm.n + '」'}</small></div>`;
    for (let d = 0; d < 5; d++) {
      const l = b.l[d];
      const cells = [0, 1, 2, 3, 4].map(k => {
        const bd = k < l, ip = busy && b.q[0] === d && k === l;
        return `<span title="${fac[d][k]}" style="font-size:20px;${(bd || ip) ? '' : 'opacity:.2;filter:grayscale(1)'}">${ip ? '⏳' : em[d]}</span>`;
      }).join('');
      const btn = l >= 5 ? '<small>✅ 已完成</small>'
        : `<button class="bb" style="background:${busy || full ? '#667' : 'var(--ac)'}" onclick="TERR.bld('${it.id}',${d})">建 Lv${l + 1}・${bz(cost(it, l + 1))}・${dur(l + 1)}日</button>`;
      h += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0"><b style="width:44px">${DN[d]}</b><span style="letter-spacing:2px">${cells}</span>` +
        `<span style="flex:1;min-width:90px"><small>${l ? fac[d][l - 1] : '未建設'}</small></span>${btn}</div>`;
    }
    return h + '<div id="tbq" style="margin-top:6px"></div></div>';
  }
  function indH(it, b) {
    return '<div class="kvs">' + kv([['人口', numF(b.p) + ' 人'], ['目標人口', numF(popT(it, b)) + ' 人'],
      ['繁榮度', Math.round(prosp(b) * 100) + '%'], ['幸福度', Math.round(happy(b) * 100) + '%'],
      ['連通度', Math.round(b.l[0] / 5 * 100) + '%'], ['預估月稅', bz(taxOf(it, b))]]) + '</div>';
  }
  function qH(it, b) {
    if (!b.q) return '<small>目前沒有施工項目。</small>';
    const d = b.q[0], lv = b.l[d] + 1, tot = Math.max(1, b.q[1] - b.q[2]);
    const pp = Math.max(0, Math.min(100, (S.t - b.q[2]) / tot * 100)), left = Math.max(0, Math.ceil((b.q[1] - S.t) / 1440));
    return `🔨 施工中：${DN[d]} Lv${lv}「${FAC[it.t][d][lv - 1]}」・剩 ${left} 日` +
      `<div style="height:6px;background:var(--l);border-radius:3px;margin-top:4px"><div style="height:6px;width:${pp.toFixed(1)}%;background:var(--ac);border-radius:3px"></div></div>`;
  }
  function detailH(it) {
    const o = S.terr[it.id], tn = TI[it.t].n;
    const geoLabel = it.t === 'n' ? '首都' : it.t === 'p' ? '環境' : '地形';
    const geo = it.t === 'n' ? it.geo.replace('首都 ', '') : it.geo;
    return `<div class="card"><div style="display:flex;gap:10px;align-items:center">` +
      lgS(it) + `<div><b style="font-size:17px">${it.n}</b><br><small>${tn}・${it.sys}</small></div></div>` +
      `<div class="kvs">${kv([['制度', it.sys], ['人口', it.pop], [geoLabel, geo], ['價格', bz(it.price)],
        ['領地加成', '收入 ' + pctTxt(it)], ['附帶效益', effTxt(it)]])}</div><p>${it.desc}</p>` +
      (o ? `<b>✅ 已於 ${tstr(o).split('（')[0]} 取得這處領地</b>` + bpanel(it)
        : `<div id="tdc" style="margin-bottom:6px"></div><button class="bb" style="background:var(--ac)" onclick="TERR.buy('${it.id}')">購買</button> ` +
          `<small>從個人現金扣款，購買價仍計入總資產；買下後不能轉賣。</small>`) +
      `</div>`;
  }
  function achH() {
    const L = ach(), done = L.filter(a => a.ok).length;
    return `<div class="card"><b>🏆 領地成就</b> <small>${done}/${L.length}</small></div>` +
      L.map(a => `<div class="card"><b>${a.ok ? '✅' : '⬜'} ${a.n}</b><br><small>${a.d}（${numF(Math.min(a.cur, a.need))}/${numF(a.need)}）</small></div>`).join('');
  }
  function bsumH() {
    const own = ITEMS.filter(it => S.terr[it.id]);
    let h = '<div class="card"><b>🏗 施工進度</b><div id="tbq2" style="margin-top:6px"></div></div>';
    if (!own.length) return h + '<p><small>還沒有領地可以建設，先到島嶼、國家或星球分頁買一處。</small></p>';
    return h + own.map(it => {
      const p = pctOf(it.id);
      return `<div class="row" onclick="TERR.open('${it.id}')">${lgS(it)}<div class="g"><b>${it.n}</b> ${lmDone(it) ? '🏆' : ''}<br><small>${TI[it.t].n}・${it.sys}</small></div><div class="r"><b>${p}%</b><small>建設</small></div></div>`;
    }).join('');
  }
  function wondH() {
    const L = lms(), done = ITEMS.filter(lmDone);
    let h = `<div class="card"><b>🏛 奇觀館</b> <small>${L.all}/${TOTAL}・島 ${L.i}/${TI.i.rows.length}・國 ${L.n}/${TI.n.rows.length}・星 ${L.p}/${TI.p.rows.length}</small><br>` +
      `<small>一處領地 25 級全部建成就會落成專屬地標；落成後該領地稅收 ×${CFG.lmTax}，每 5 座地標再多 1 個施工名額。</small></div>`;
    return h + (done.map(it => `<div class="card"><span style="font-size:26px">${it.lm.e}</span> <b>${it.lm.n}</b> <small>${it.e}${it.n}</small><br><small>${it.lm.s}</small></div>`).join('')
      || '<p><small>還沒有地標落成。</small></p>');
  }
  function build() {
    const c = ensure().cnt, L = lms();
    const tabs = [['i', '島嶼 ' + c.i + '/' + TI.i.rows.length], ['n', '國家 ' + c.n + '/' + TI.n.rows.length],
      ['p', '星球 ' + c.p + '/' + TI.p.rows.length], ['b', '建設'], ['w', '奇觀 ' + L.all + '/' + TOTAL], ['a', '成就']];
    let h = '<div id="tsum"></div><div class="sp" style="margin:8px 0">' +
      tabs.map(t => `<button class="${TV === t[0] ? 'on' : ''}" onclick="TERR.go('${t[0]}')">${t[1]}</button>`).join('') + '</div>';
    if (TV === 'a') return h + achH();
    if (TV === 'b') return h + bsumH();
    if (TV === 'w') return h + wondH();
    h += `<div class="card"><small>${TI[TV].n}每座：收入加成 ${pctTxt({ bon: TI[TV].bon })}（所有公司，含子公司；各領地加成相加）・${TI[TV].eff}。購買價依序遞增。買下後可建設，並每月產出稅收。</small></div>`;
    if (TSEL && BY[TSEL] && BY[TSEL].t === TV) h += detailH(BY[TSEL]);
    else h += '<p><small>點選下方領地查看制度、人口與介紹。</small></p>';
    return h + ITEMS.filter(it => it.t === TV).map(rowH).join('');
  }
  function allQ() {
    const L = [];
    for (const it of ITEMS) {
      if (!S.terr[it.id]) continue;
      const b = tbOf(it.id);
      if (b && b.q) L.push(`<div style="margin:6px 0">${it.e}<b>${it.n}</b>　${qH(it, b)}</div>`);
    }
    return `<small>施工名額 ${used()}/${slots()}</small>` + (L.join('') || '<br><small>目前沒有施工項目。</small>');
  }
  function totV() { let s = 0; try { s = (S.tbs && S.tbs.sp) || 0; } catch (e) { /* ignore */ } return ensure().v + s; }
  function dyn() {
    const c = ensure(), s = el('tsum'), L = lms();
    if (s) {
      s.innerHTML = '<div class="card"><b>🗺 我的領地</b> <small>' + c.cnt.all + '/' + TOTAL + '</small><div class="kvs">' +
        kv([['持有', '島 ' + c.cnt.i + '・國 ' + c.cnt.n + '・星 ' + c.cnt.p], ['領地總價值', bz(totV())],
          ['收入倍率', '× ' + c.m.toFixed(2)], ['員工上限', '+' + fm(c.cap)],
          ['買賣手續費', '× ' + c.fee.toFixed(2)], ['賣出交易稅', '× ' + c.tax.toFixed(2)],
          ['預估月稅', bz(estTax())], ['累計稅收', bz(S.tbs.tt)],
          ['地標', L.all + '/' + TOTAL], ['施工名額', used() + '/' + slots()]]) +
        '</div><small>個人現金 ' + bz(S.cash) + '・上月稅收 ' + bz(S.tbs.last) + '</small></div>';
    }
    const d = el('tdc');
    if (d && TSEL && BY[TSEL]) {
      const p = BY[TSEL].price;
      d.innerHTML = S.cash >= p ? '個人現金 ' + bz(S.cash) + '・<b>可以購買</b>'
        : '個人現金 ' + bz(S.cash) + '・還差 <b>' + bz(p - S.cash) + '</b>';
    }
    if (TV === 'b') { const q = el('tbq2'); if (q) q.innerHTML = allQ(); }
    if (TSEL && BY[TSEL] && S.terr[TSEL] && BY[TSEL].t === TV) {
      const it = BY[TSEL], b = tbOf(it.id), e1 = el('tbi'), e2 = el('tbq');
      if (b) { if (e1) e1.innerHTML = indH(it, b); if (e2) e2.innerHTML = qH(it, b); }
    }
  }
  function render(M) {
    const h = build();
    if (M.dataset.h !== h) { M.innerHTML = h; M.dataset.h = h; }
    dyn();
  }

  /* ───────── 操作 ───────── */
  function go(k) { TV = k; const m = el('main'); if (m) m.dataset.h = ''; rm(); }
  function sel(id) { TSEL = id; rm(); }
  function open(id) { const it = BY[id]; if (!it) return; TV = it.t; TSEL = id; const m = el('main'); if (m) m.dataset.h = ''; rm(); }
  function buy(id) {
    const it = BY[id]; if (!it) return;
    ensure();
    if (S.terr[id]) return ts('已經擁有這處領地');
    if (!(it.price > 0) || !isFinite(it.price)) return ts('價格異常，無法購買');
    if (!(S.cash >= it.price)) return ts('個人現金不足，還差 ' + bz(it.price - S.cash));
    if (!confirm('購買「' + it.n + '」？\n價格 ' + bz(it.price) + '（從個人現金扣除，仍計入總資產，不可轉賣）')) return;
    const before = okNames();
    S.cash -= it.price;
    S.terr[id] = S.t; N++;
    ensure();
    addN(it.gal ? `${it.e}你買下了整個${it.n}！收入倍率提升為 ×${C.m.toFixed(2)}。`
      : `${it.e}你買下了${TI[it.t].n}「${it.n}」，收入倍率提升為 ×${C.m.toFixed(2)}。`, '領地');
    notify(before);
    ts('已購買 ' + it.n);
    try { save(); } catch (e) { /* 存檔失敗由主程式提示 */ }
    if (typeof ui === 'function') ui(); else rm();
  }
  function bld(id, d) {
    const it = BY[id]; ensure();
    if (!it || !S.terr[id]) return ts('尚未擁有這處領地');
    const b = tbOf(id);
    if (!b || !(d >= 0 && d < 5)) return;
    if (b.q) return ts('這處領地已有施工中的項目');
    if (b.l[d] >= 5) return ts('這個領域已建設完成');
    if (used() >= slots()) return ts('施工名額已滿（' + used() + '/' + slots() + '）');
    const lv = b.l[d] + 1, c = cost(it, lv);
    if (!(c > 0) || !isFinite(c)) return ts('費用異常，無法施工');
    if (!(S.cash >= c)) return ts('個人現金不足，還差 ' + bz(c - S.cash));
    S.cash -= c; S.tbs.sp += c;
    b.q = [d, S.t + dur(lv) * 1440, S.t];
    ts('開工：' + it.n + '・' + DN[d] + ' Lv' + lv + '（' + dur(lv) + ' 日）');
    try { save(); } catch (e) { /* 存檔失敗由主程式提示 */ }
    if (typeof ui === 'function') ui(); else rm();
  }

  /* ───────── 每日／每月結算（由主程式 day() 呼叫） ───────── */
  function doneCheck() {
    for (const id in S.tb) {
      const it = BY[id];
      if (!it || !S.terr[id]) { delete S.tb[id]; continue; }
      const b = tbOf(id);
      if (!b || !b.q || S.t < b.q[1]) continue;
      const d = b.q[0], before = okNames(), wasDone = lmDone(it);
      b.l[d] = Math.min(5, b.l[d] + 1); b.q = null;
      if (b.l[d] >= 5) addN(`🏗 ${it.e}${it.n}的${DN[d]}建設全部完成（最終設施：${FAC[it.t][d][4]}）。`, '領地');
      if (!wasDone && lmDone(it)) {
        addN(`🎉 ${it.e}${it.n}建設達 100%！地標「${it.lm.e}${it.lm.n}」落成，本領地稅收 ×${CFG.lmTax}。`, '領地');
        try { ts('地標落成：' + it.lm.n); } catch (e) { /* ignore */ }
      }
      notify(before);
    }
  }
  function month() {
    const before = okNames();
    let tot = 0, n = 0;
    for (const it of ITEMS) {
      if (!S.terr[it.id]) continue;
      const b = tbOf(it.id); if (!b) continue;
      const t = popT(it, b);
      b.p += (t - b.p) * 0.05;                       // 人口每月向目標靠近 5%
      if (Math.abs(t - b.p) < 1) b.p = t;
      const x = taxOf(it, b);
      if (x > 0 && isFinite(x)) { tot += x; n++; }
    }
    if (n && tot > 0 && isFinite(tot)) {
      S.cash += tot; S.tbs.tt += tot; S.tbs.last = tot;
      S.log.unshift({ g: tstr(S.t), s: '稅', q: n, p: tot });   // 每月只寫一筆彙總
      if (S.log.length > 200) S.log.pop();
      notify(before);
    }
  }
  function day(dd) {
    try { ensure(); doneCheck(); if (dd === 1) month(); } catch (e) { try { console.warn('[TERR]', e); } catch (_) { /* ignore */ } }
  }

  window.TERR = {
    get m() { return ensure().m; },
    get cap() { return ensure().cap; },
    get fee() { return ensure().fee; },
    get tax() { return ensure().tax; },
    get v() { return totV(); },
    get inc() { ensure(); return S.tbs ? S.tbs.last : 0; },
    items: ITEMS, render, buy, go, sel, open, bld, day, ach
  };
})();
