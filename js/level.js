// レベルと経験値（XP）の計算をまとめたファイル。次のレベルに必要なXPや、今のレベルを求める。

function getXpRequiredForLevel(level) { return Math.floor((level - 1) / 10 + 1) * 100; }

function calculateLevelFromXp(totalXp) {
    let currentLevel = 1; let remainingXp = totalXp; let requiredForNext = getXpRequiredForLevel(currentLevel);
    while (remainingXp >= requiredForNext) { remainingXp -= requiredForNext; currentLevel++; requiredForNext = getXpRequiredForLevel(currentLevel); }
    return { level: currentLevel, xpInLevel: remainingXp, requiredXp: requiredForNext };
}
