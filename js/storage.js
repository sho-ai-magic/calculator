// セーブデータの読み込み・保存をまとめたファイル。ブラウザの中（localStorage）に記録を残す。

function loadData() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        let parsed = {};
        try { parsed = JSON.parse(saved) || {}; } catch (e) { parsed = {}; } // こわれたデータは初期化あつかい
        // 初期値に、保存されていた内容を上書きして合体（足りない項目は初期値で補う）
        userData = Object.assign(structuredClone(DEFAULT_USER_DATA), parsed);
        userData.clearedDans = Object.assign({ add: [], sub: [], mul: [], div: [] }, userData.clearedDans || {});
        // 本来は配列であるべき項目が壊れていたら、空の配列に直す
        ['stickers','stamps','bingosClaimed','pageRewardsClaimed'].forEach(k => {
            if (!Array.isArray(userData[k])) userData[k] = [];
        });
        // 周回数がおかしければ1に直す
        if (typeof userData.lapCount !== 'number' || userData.lapCount < 1) userData.lapCount = 1;
        saveData(); // 補完結果を保存（マイグレーション）
    } else {
        userData.tickets = 1; saveData();
    }
    updateAllUI();
}

function saveData() { localStorage.setItem(SAVE_KEY, JSON.stringify(userData)); }
