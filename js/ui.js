// 画面の表示切り替えと、画面上の数字やバーの更新をまとめたファイル。上部バー・記録画面・段の選択肢などを描く。

function showScreen(screenName) {
    const screens = [elements.settingsScreen, elements.quizScreen, elements.resultsScreen, elements.recordScreen];
    screens.forEach(s => { if (s) s.classList.add('hidden'); });
    if (screenName === 'settings' && elements.settingsScreen) elements.settingsScreen.classList.remove('hidden');
    if (screenName === 'quiz' && elements.quizScreen) elements.quizScreen.classList.remove('hidden');
    if (screenName === 'results' && elements.resultsScreen) elements.resultsScreen.classList.remove('hidden');
    if (screenName === 'record' && elements.recordScreen) elements.recordScreen.classList.remove('hidden');
}

function updateAllUI() { updateTopBar(); updateRecordUI(); updateDanSelectOptions(); updateReviewButton(); }

// まちがいノートボタンの表示・ラベル更新（残り0問なら隠す）
function updateReviewButton() {
    if (!elements.reviewQuizBtn) return;
    const n = userData.wrongProblems.length;
    if (n > 0) {
        elements.reviewQuizBtn.textContent = `📖 まちがいノート（${n}もん）`;
        elements.reviewQuizBtn.classList.remove('hidden');
    } else {
        elements.reviewQuizBtn.classList.add('hidden');
    }
}

function updateTopBar() {
    const lvInfo = calculateLevelFromXp(userData.xp);
    if (elements.displayXp) elements.displayXp.textContent = userData.xp;
    if (elements.displayLevel) elements.displayLevel.textContent = lvInfo.level;
    if (elements.displayTickets) elements.displayTickets.textContent = userData.tickets;
    if (elements.displayXpBar) elements.displayXpBar.style.width = `${(lvInfo.xpInLevel / lvInfo.requiredXp) * 100}%`;
    // 周回数の表示（上部バー）。1しゅうめのときは隠す（I）。
    if (userData.lapCount > 1) {
        if (elements.lapDisplayTop) elements.lapDisplayTop.classList.remove('hidden');
        if (elements.displayLap) elements.displayLap.textContent = userData.lapCount;
    } else {
        if (elements.lapDisplayTop) elements.lapDisplayTop.classList.add('hidden');
    }
}

function updateDanSelectOptions() {
    if (!elements.danSelect) return;
    const op = document.querySelector('input[name="operation"]:checked')?.value || userData.lastOperation || "add";
    const clearedList = userData.clearedDans[op] || [];
    elements.danSelect.innerHTML = "";
    let availableCount = 0;
    for (let i = 1; i <= 9; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        if (clearedList.includes(i)) { opt.textContent = `✅ ${i} クリア！`; opt.disabled = true; }
        else { opt.textContent = `${i} のかず`; availableCount++; }
        elements.danSelect.appendChild(opt);
    }
    if (availableCount === 0 && clearedList.length > 0) { userData.clearedDans[op] = []; saveData(); updateDanSelectOptions(); }
}

function updateRecordUI() {
    const lvInfo = calculateLevelFromXp(userData.xp);
    if (elements.recordLevel) elements.recordLevel.textContent = lvInfo.level;
    if (elements.recordRank) elements.recordRank.textContent = RANKS[Math.min(RANKS.length - 1, Math.floor((lvInfo.level - 1) / 5))];
    if (elements.recordXpBar) elements.recordXpBar.style.width = `${(lvInfo.xpInLevel / lvInfo.requiredXp) * 100}%`;
    if (elements.nextLevelXp) elements.nextLevelXp.textContent = lvInfo.requiredXp - lvInfo.xpInLevel;
    if (elements.recordTickets) elements.recordTickets.textContent = userData.tickets;
    if (elements.gachaPullBtn) elements.gachaPullBtn.disabled = (userData.tickets <= 0);
    // 周回数の表示（記録画面）。1しゅうめのときは隠す（I）。
    if (userData.lapCount > 1) {
        if(elements.lapDisplayRecord) elements.lapDisplayRecord.classList.remove('hidden');
        if(elements.displayLapRecord) elements.displayLapRecord.textContent = userData.lapCount;
    } else {
        if(elements.lapDisplayRecord) elements.lapDisplayRecord.classList.add('hidden');
    }
    const render = (gridId, start) => {
        const grid = document.getElementById(gridId); if (!grid) return; grid.innerHTML = "";
        for (let i = 0; i < 25; i++) {
            const idx = start + i; const slot = document.createElement('div');
            slot.className = userData.stickers.includes(idx) ? "sticker-slot" : "sticker-slot empty";
            slot.textContent = userData.stickers.includes(idx) ? FINAL_STICKERS[idx] : idx + 1;
            grid.appendChild(slot);
        }
    };
    render("sticker-grid-1", 0); render("sticker-grid-2", 25);
    renderStampSection();
}

// 毎日スタンプ（直近7日）と連続日数を描く
function renderStampSection() {
    const row = document.getElementById('stamp-days-row');
    if (row) {
        row.innerHTML = "";
        const set = new Set(userData.stamps);
        const fmt = (dt) => {
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
        const base = new Date(getTodayStr() + 'T00:00:00');
        // 6日前〜今日の順に並べる
        for (let i = 6; i >= 0; i--) {
            const dt = new Date(base);
            dt.setDate(dt.getDate() - i);
            const stamped = set.has(fmt(dt));
            const cell = document.createElement('div');
            cell.className = "flex flex-col items-center flex-1";
            const mark = document.createElement('div');
            mark.className = stamped ? "text-2xl" : "text-2xl opacity-30";
            mark.textContent = stamped ? "⭐" : "○";
            const label = document.createElement('div');
            label.className = "text-[10px] font-bold text-gray-400 mt-0.5";
            label.textContent = dt.getDate();
            cell.appendChild(mark); cell.appendChild(label);
            row.appendChild(cell);
        }
    }
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = calcStreak();
}
