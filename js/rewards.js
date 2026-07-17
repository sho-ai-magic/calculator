// ごほうび関連（チケット付与・XP加算・紙吹雪・ビンゴ・コンプ判定・ガチャ）をまとめたファイル。

function awardTicket(count = 1) { userData.tickets += count; saveData(); updateTopBar(); if(elements.recordTickets) elements.recordTickets.textContent = userData.tickets; }

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
