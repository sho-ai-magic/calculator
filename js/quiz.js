// クイズの中身（問題づくり・問題表示・答え合わせ・結果集計）をまとめたファイル。

function generateProblems() {
    const op = document.querySelector('input[name="operation"]:checked').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const dan = parseInt(elements.danSelect.value, 10);
    let p = []; const range = [1,2,3,4,5,6,7,8,9]; const sym = {add:'＋', sub:'－', mul:'×', div:'÷'};
    if (mode === 'dan') {
        if (op === 'mul') range.forEach(n2 => p.push({n1:dan, n2, op:sym[op], ans:dan*n2}));
        else if (op === 'add') range.forEach(n2 => p.push({n1:dan, n2, op:sym[op], ans:dan+n2}));
        else if (op === 'sub') range.forEach(ans => p.push({n1:ans+dan, n2:dan, op:sym[op], ans}));
        else if (op === 'div') range.forEach(ans => p.push({n1:ans*dan, n2:dan, op:sym[op], ans}));
    } else {
        range.forEach(n1 => range.forEach(n2 => {
            if(op==='mul') p.push({n1, n2, op:sym[op], ans:n1*n2});
            else if(op==='add') p.push({n1, n2, op:sym[op], ans:n1+n2});
            else if(op==='sub') p.push({n1:n1+n2, n2, op:sym[op], ans:n1});
            else if(op==='div') p.push({n1:n1*n2, n2, op:sym[op], ans:n1});
        }));
        p = [...p].sort(() => Math.random() - 0.5).slice(0, 10);
    }
    if (document.querySelector('input[name="order"]:checked').value === 'random') p = [...p].sort(() => Math.random() - 0.5);
    quizState.problems = p; quizState.currentIndex = 0; quizState.correctCount = 0; quizState.currentCombo = 0;
}

function displayCurrentProblem() {
    const problem = quizState.problems[quizState.currentIndex]; if (!problem) return;
    quizState.currentInput = ""; if (elements.answerDisplay) elements.answerDisplay.textContent = "？";
    if (elements.keypad) elements.keypad.classList.remove('hidden');
    if (elements.nextButtonContainer) elements.nextButtonContainer.classList.add('hidden');
    if (elements.problemText) elements.problemText.textContent = `${problem.n1} ${problem.op} ${problem.n2}`;
    if (elements.progressText) elements.progressText.textContent = `${quizState.currentIndex + 1} / ${quizState.problems.length}`;
}

function checkAnswer() {
    const problem = quizState.problems[quizState.currentIndex];
    const userAnswer = parseInt(quizState.currentInput, 10);
    elements.keypad.classList.add('hidden'); elements.nextButtonContainer.classList.remove('hidden');
    if (userAnswer === problem.ans) {
        quizState.correctCount++; quizState.currentCombo++; SoundManager.correct();
        elements.answerDisplay.textContent = "○ せいかい！";
        if (quizState.currentCombo >= 2) {
            if (elements.comboCount) elements.comboCount.textContent = quizState.currentCombo;
            if (elements.comboDisplay) { elements.comboDisplay.classList.remove('hidden'); setTimeout(() => elements.comboDisplay.classList.add('hidden'), 800); }
        }
    } else { quizState.currentCombo = 0; SoundManager.incorrect(); elements.answerDisplay.textContent = `× こたえ:${problem.ans}`; }
    quizState.isAwaitingNext = true;
}

function finishQuiz() {
    const total = quizState.problems.length; const correct = quizState.correctCount; const isPerfect = (correct === total);
    const op = document.querySelector('input[name="operation"]:checked').value; const mode = document.querySelector('input[name="mode"]:checked').value;
    const dan = parseInt(elements.danSelect.value, 10);
    if (mode === 'dan' && isPerfect) { if (!userData.clearedDans[op].includes(dan)) userData.clearedDans[op].push(dan); }
    let xpGained = correct * 5 + (isPerfect ? 20 : 0);
    const leveledUp = addXP(xpGained); if (isPerfect) awardTicket(1);
    if (elements.finalScore) elements.finalScore.textContent = `${correct} / ${total}`;
    if (elements.gainedXp) elements.gainedXp.textContent = xpGained;
    showScreen('results');
    (async () => {
        if (isPerfect) { triggerConfetti(); await new Promise(r => setTimeout(r, 1000)); }
        if (leveledUp) { SoundManager.levelUp(); const lv = calculateLevelFromXp(userData.xp).level; if (elements.newLevelDisplay) elements.newLevelDisplay.textContent = lv; if (elements.levelUpModal) elements.levelUpModal.classList.remove('hidden'); }
        else if (isPerfect) if (elements.gachaConfirmModal) elements.gachaConfirmModal.classList.remove('hidden');
    })();
    saveData();
}
