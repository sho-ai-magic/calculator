// ごほうび関連（チケット付与・XP加算・紙吹雪・ビンゴ・コンプ判定・ガチャ）をまとめたファイル。

function awardTicket(count = 1) { userData.tickets += count; saveData(); updateTopBar(); if(elements.recordTickets) elements.recordTickets.textContent = userData.tickets; }

// 問題ごとの正誤回数を記録する（苦手判定用）。key = "opCode:n1:n2"
function recordProblemStat(problem, correct) {
    const key = `${problem.opCode}:${problem.n1}:${problem.n2}`;
    if (!userData.problemStats[key]) userData.problemStats[key] = { c: 0, w: 0 };
    if (correct) userData.problemStats[key].c++;
    else userData.problemStats[key].w++;
}

// まちがいノートに問題を追加する（同じ問題は重複させない）
function recordWrongProblem(problem) {
    const key = `${problem.opCode}:${problem.n1}:${problem.n2}`;
    const exists = userData.wrongProblems.some(w => `${w.opCode}:${w.n1}:${w.n2}` === key);
    if (!exists) userData.wrongProblems.push({ opCode: problem.opCode, n1: problem.n1, n2: problem.n2, ans: problem.ans });
}

// まちがいノートから問題を取り除く（復習で正解したとき）
function removeWrongProblem(problem) {
    const key = `${problem.opCode}:${problem.n1}:${problem.n2}`;
    userData.wrongProblems = userData.wrongProblems.filter(w => `${w.opCode}:${w.n1}:${w.n2}` !== key);
}

// きょうの日付を "YYYY-MM-DD"（ローカルタイム）で返す。toISOStringは使わない（時差でズレるため）。
function getTodayStr() {
    if (window.__mockToday) return window.__mockToday; // テスト用の日付上書き
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// きょうのスタンプを押す。初めてならpushして60日分にトリム、trueを返す。
function recordDailyStamp() {
    const today = getTodayStr();
    if (userData.stamps.includes(today)) return false;
    userData.stamps.push(today);
    if (userData.stamps.length > 60) userData.stamps = userData.stamps.slice(-60);
    return true;
}

// 連続でスタンプを押した日数を数える。今日が無ければ昨日を起点にする。
function calcStreak() {
    const set = new Set(userData.stamps);
    // 起点の日付を決める（今日があれば今日、無ければ昨日、それも無ければ0）
    const base = new Date(getTodayStr() + 'T00:00:00');
    const fmt = (dt) => {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    let cursor = new Date(base);
    if (!set.has(fmt(cursor))) {
        cursor.setDate(cursor.getDate() - 1); // 今日が無ければ昨日を起点に
        if (!set.has(fmt(cursor))) return 0;  // 昨日も無ければ連続0
    }
    let count = 0;
    while (set.has(fmt(cursor))) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return count;
}

// 連続記録に応じてチケットを付与する（多重付与を防ぐ）。
function checkStreakReward(streak) {
    if (streak > userData.streakLastClaimed) {
        // 前回受け取り済みの翌日から今回のstreakまで、各日ごとに判定して付与
        for (let d = userData.streakLastClaimed + 1; d <= streak; d++) {
            if (d % 3 === 0) awardTicket(1);
            if (d % 7 === 0) awardTicket(2);
        }
        userData.streakLastClaimed = streak;
    } else if (streak < userData.streakLastClaimed) {
        // 連続が途切れたら基準を引き下げるだけ（付与なし）
        userData.streakLastClaimed = streak;
    }
    saveData();
}

function addXP(amount) {
    const oldLvInfo = calculateLevelFromXp(userData.xp);
    userData.xp += amount;
    const newLvInfo = calculateLevelFromXp(userData.xp);
    const leveledUp = newLvInfo.level > oldLvInfo.level;
    if (leveledUp) awardTicket(newLvInfo.level - oldLvInfo.level);
    saveData(); updateTopBar(); return leveledUp;
}

function triggerConfetti() {
    const emojis = ["✨", "💖", "🎀", "🌟", "🌸", "🧁", "🏅", "🎫"];
    if (!elements.confettiContainer) return;
    for (let i = 0; i < 40; i++) {
        const el = document.createElement('div');
        el.className = 'confetti'; el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + 'vw'; el.style.fontSize = (Math.random() * 20 + 20) + 'px';
        el.style.transition = `all ${Math.random() * 2 + 2}s linear`;
        elements.confettiContainer.appendChild(el);
        setTimeout(() => { el.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`; el.style.opacity = '0'; }, 10);
        setTimeout(() => el.remove(), 4000);
    }
}

function checkBingo() {
    let found = false;
    for (let g = 0; g < 2; g++) {
        const base = g * 25; const has = (r, c) => userData.stickers.includes(base + r * 5 + c);
        for (let r = 0; r < 5; r++) { const id = `g${g}-r${r}`; if (!userData.bingosClaimed.includes(id) && [0,1,2,3,4].every(c => has(r,c))) { userData.bingosClaimed.push(id); found = true; } }
        for (let c = 0; c < 5; c++) { const id = `g${g}-c${c}`; if (!userData.bingosClaimed.includes(id) && [0,1,2,3,4].every(r => has(r,c))) { userData.bingosClaimed.push(id); found = true; } }
        if (!userData.bingosClaimed.includes(`g${g}-d1`) && [0,1,2,3,4].every(i => has(i,i))) { userData.bingosClaimed.push(`g${g}-d1`); found = true; }
        if (!userData.bingosClaimed.includes(`g${g}-d2`) && [0,1,2,3,4].every(i => has(i, 4-i))) { userData.bingosClaimed.push(`g${g}-d2`); found = true; }
    }
    if (found) { awardTicket(1); SoundManager.bingo(); triggerConfetti(); if(elements.stickerCompleteModal) elements.stickerCompleteModal.classList.remove('hidden'); saveData(); }
}

function checkCollectionProgress() {
    const p1Full = Array.from({length:25},(_,i)=>i).every(i=>userData.stickers.includes(i));
    const p2Full = Array.from({length:25},(_,i)=>i+25).every(i=>userData.stickers.includes(i));
    if (p1Full && !userData.pageRewardsClaimed.includes(1)) { userData.pageRewardsClaimed.push(1); awardTicket(3); SoundManager.levelUp(); if(elements.pageCompleteModal) elements.pageCompleteModal.classList.remove('hidden'); triggerConfetti(); }
    if (p2Full && !userData.pageRewardsClaimed.includes(2)) { userData.pageRewardsClaimed.push(2); awardTicket(3); SoundManager.levelUp(); if(elements.pageCompleteModal) elements.pageCompleteModal.classList.remove('hidden'); triggerConfetti(); }
    if (userData.stickers.length === 50) {
        // この関数はガチャ結果オーバーレイを閉じたあとに呼ばれるので、オーバーレイ操作は不要。
        // 直接コンプ達成モーダルを表示する。
        if (elements.nextLapDisplay) elements.nextLapDisplay.textContent = userData.lapCount + 1;
        if (elements.grandCompleteModal) elements.grandCompleteModal.classList.remove('hidden');
        SoundManager.complete(); triggerConfetti();
    }
}

function pullGacha() {
    if (userData.tickets <= 0) return;
    userData.tickets--; saveData(); updateTopBar();
    if (elements.gachaPullBtn) elements.gachaPullBtn.disabled = true;

    if (elements.luckyBadge) elements.luckyBadge.classList.add('hidden'); // ラッキーバッジを隠す

    const shakeInterval = setInterval(() => SoundManager.gachaShake(), 100);
    setTimeout(() => {
        clearInterval(shakeInterval);

        const unowned = Array.from({length:50},(_,i)=>i).filter(i=>!userData.stickers.includes(i));
        let randomIndex = Math.floor(Math.random() * 50);
        let isLuckyReRoll = false;

        // 再抽選ロジック
        if (userData.stickers.includes(randomIndex) && unowned.length > 0 && Math.random() < 0.15) {
            randomIndex = unowned[Math.floor(Math.random() * unowned.length)];
            isLuckyReRoll = true; // ラッキー発生！
        }

        const isNew = !userData.stickers.includes(randomIndex);
        if (isNew) { userData.stickers.push(randomIndex); saveData(); triggerConfetti(); }

        SoundManager.gachaResult();
        if (elements.gachaResultIcon) elements.gachaResultIcon.textContent = FINAL_STICKERS[randomIndex];
        if (elements.gachaResultText) elements.gachaResultText.textContent = isNew ? "あたらしい！✨" : "もってるよ🧸";

        // ラッキー演出の表示
        if (isLuckyReRoll && elements.luckyBadge) {
            elements.luckyBadge.classList.remove('hidden');
        }

        if (elements.gachaResultOverlay) elements.gachaResultOverlay.classList.remove('hidden');

        // コンプ判定（checkCollectionProgress）はガチャ結果を閉じたあとに呼ぶため、ここでは呼ばない（E）。
        checkBingo(); updateRecordUI();
    }, 1200);
}
