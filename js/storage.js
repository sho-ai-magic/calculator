// セーブデータの読み込み・保存をまとめたファイル。ブラウザの中（localStorage）に記録を残す。

function loadData() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        userData = JSON.parse(saved);
        if (!userData.clearedDans) userData.clearedDans = { add: [], sub: [], mul: [], div: [] };
    } else {
        userData.tickets = 1; saveData();
    }
    updateAllUI();
}

function saveData() { localStorage.setItem(SAVE_KEY, JSON.stringify(userData)); }
