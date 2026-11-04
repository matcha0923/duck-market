/* 鴨市｜系統保護 guard.js
 * 在主程式「之後」載入。不修改遊戲規則，只做四件事：
 *  1. 追進度時分片執行，避免離線補進度卡死畫面
 *  2. 已下市很久的公司自動壓縮歷史資料，避免存檔越長越肥
 *  3. 定期檢查數值（NaN／Infinity）並修復；存檔偏大時壓縮並提醒
 *  4. 偵測「讀取存檔失敗後被自動備份的舊存檔」，詢問是否還原
 * 若此檔載入失敗，遊戲照常運作，只是少了保護。
 */
(function () {
  'use strict';
  const YR = 525600;                       // 一個遊戲年（分鐘）
  const safe = f => { try { return f(); } catch (e) { try { console.warn('[guard]', e); } catch (_) {} } };
  const toast = m => safe(() => ts(m));
  const bad = x => typeof x !== 'number' || !isFinite(x);

  /* 1. 追進度分片：每個畫面最多花約 12ms，超過就留到下一個畫面 */
  if (typeof adv === 'function' && typeof step === 'function') {
    window.adv = function (mx) {
      const t0 = performance.now(); let n = 0;
      while (S.acc >= 5 && n < mx) {
        S.acc -= 5; step(); n++;
        if ((n & 7) === 0 && performance.now() - t0 > 12) break;
      }
    };
  }

  /* 2. 壓縮已下市很久的公司（保留：玩家持有過、子公司、玩家自創、被合併者） */
  function compact(force) {
    if (!S || !S.cs) return 0;
    const keep = new Set((S.dx || []).map(r => r.id));
    (S.subs || []).forEach(m => { if (m.id != null) keep.add(m.id); });
    if (S.me && S.me.id != null) keep.add(S.me.id);
    let k = 0;
    for (const c of S.cs) {
      if (c.alive) { if (c.dtm != null) delete c.dtm; continue; }
      if (c.pl || c.me || keep.has(c.id)) continue;
      if (c.dtm == null) { c.dtm = S.t; continue; }
      if (!force && S.t - c.dtm < 3 * YR) continue;
      if ((c.hs && c.hs.length > 3) || (c.dh && c.dh.length > 3) || c.ow || c.eh) {
        c.hs = (c.hs || []).slice(-3); c.dh = (c.dh || []).slice(-3);
        delete c.ow; c.owv = 0; delete c.eh; k++;
      }
    }
    return k;
  }

  /* 3a. 數值檢查與修復 */
  const good = { cash: 0 };
  function sane() {
    if (!S || !S.cs) return 0;
    let fix = 0;
    const num = (o, k, d) => { if (bad(o[k])) { o[k] = d; fix++; } };
    num(S, 'cash', good.cash); if (!bad(S.cash)) good.cash = S.cash;
    num(S, 'ix', 1000); num(S, 'ixc', 1000);
    for (const c of S.cs) {
      if (bad(c.p) || c.p < 0.5) { c.p = bad(c.pc) || c.pc < 0.5 ? 10 : c.pc; fix++; }
      num(c, 'pc', c.p); num(c, 'imp', 0);
    }
    for (const k of Object.keys(S.etf || {})) { num(S.etf[k], 'v', 100); num(S.etf[k], 'c', S.etf[k].v); }
    for (const k of Object.keys(S.hold || {})) {
      const h = S.hold[k];
      if (!h || bad(h.q) || bad(h.c)) { delete S.hold[k]; fix++; }
    }
    (typeof ents === 'function' ? ents() : []).forEach(m => { num(m, 'cash', 0); num(m, 'emp', 0); });
    if (fix) toast('系統保護：已修復 ' + fix + ' 筆異常數值');
    return fix;
  }

  /* 3b. 存檔大小監控（以與 💾 選單相同的算法：字元數 / 1e6 ≈ MB） */
  let warned = 0;
  function sizeCheck() {
    const D = window.DB; if (!D || !D.size) return;
    const mb = D.size / 1e6, ls = D.mode !== 'idb', lo = ls ? 3.5 : 8, hi = ls ? 4.3 : 25;
    if (mb > lo) { compact(true); if (typeof slim === 'function') slim(); }
    if (mb > hi && Date.now() - warned > 6e5) {
      warned = Date.now();
      toast('存檔已達 ' + mb.toFixed(1) + ' MB，' + (ls ? '接近瀏覽器上限，' : '偏大，') + '請按 💾 匯出備份');
    }
  }

  /* 3c. 已下市清單最多顯示最近 N 筆，避免畫面塞進上千個節點（搜尋代碼仍能找到全部） */
  if (typeof blks === 'function') {
    const _b = blks;
    window.blks = function () {
      const B = _b();
      B.forEach(b => { if (b.k === 'd' && b.ks.length > 200) b.ks = b.ks.slice(-200); });
      return B;
    };
  }
  if (typeof dch === 'function') {
    window.dch = function (a) {
      return S.cs.filter(c => !c.alive && (a || !S.dx.some(r => r.id == c.id))).slice(-120)
        .map(c => `<span class="chip" onpointerdown="od('c${c.id}')">${c.e}${c.n}</span>`).join('');
    };
  }
  // 交易損益紀錄（已下市結算）最多保留 300 筆
  safe(() => { if (S.dx && S.dx.length > 300) S.dx.length = 300; });

  setInterval(() => safe(() => { compact(false); if (S.dx && S.dx.length > 300) S.dx.length = 300; }), 30000);
  setInterval(() => safe(sane), 10000);
  setInterval(() => safe(sizeCheck), 60000);
  setTimeout(() => safe(sane), 2000);

  /* 4. 讀取失敗時，主程式會把舊存檔另存為 duckmkt1_lost；這裡詢問是否還原 */
  safe(() => {
    const lost = window.DB && DB.lost;
    if (lost && !sessionStorage.getItem('duck_lost_asked')) {
      sessionStorage.setItem('duck_lost_asked', '1');
      setTimeout(() => {
        if (confirm('偵測到上次「讀取存檔失敗」時自動備份的舊存檔。\n要還原它嗎？（會覆蓋目前的新進度）')) {
          DB.replace(lost).then(r => {
            if (r) DB.clearLost().then(() => location.reload());
            else alert('還原失敗：瀏覽器不允許寫入存檔');
          });
        }
      }, 1500);
    }
  });

  window.GUARD = { compact, sane, sizeCheck };
})();
