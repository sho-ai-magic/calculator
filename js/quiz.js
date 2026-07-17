// クイズの中身（問題づくり・問題表示・答え合わせ・結果集計）をまとめたファイル。

function generateProblems() {
    const op = document.querySelector('input[name="operation"]:checked').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const dan = parseInt(elements.danSelect.value, 10);
    let p = []; const range = [1,2,3,4,5,6,7,8,9]; const sym = {add:'＋', sub:'－', mul:'×', div:'÷'};
    if (mode === 'dan') {
        if (op === 'mul') range.forEach(n2 => p.push({n1:dan, n2, op:sym[op], ans:dan*n2, opCode:op}));
        else if (op === 'add') range.forEach(n2 => p.push({n1:dan, n2, op:sym[op], ans:dan+n2, opCode:op}));
        else if (op === 'sub') range.forEach(ans => p.push({n1:ans+dan, n2:dan, op:sym[op], ans, opCode:op}));
        else if (op === 'div') range.forEach(ans => p.push({n1:ans*dan, n2:dan, op:sym[op], ans, opCode:op}));
    } else {
        range.forEach(n1 => range.forEach(n2 => {
            if(op==='mul') p.push({n1, n2, op:sym[op], ans:n1*n2, opCode:op});
            else if(op==='add') p.push({n1, n2, op:sym[op], ans:n1+n2, opCode:op});
            else if(op==='sub') p.push({n1:n1+n2, n2, op:sym[op], ans:n1, opCode:op});
            else if(op==='div') p.push({n1:n1*n2, n2, op:sym[op], ans:n1, opCode:op});
        }));
        // 苦手な問題ほど出やすいように重み付きで10問えらぶ
        p = weightedSample(p, 10);
    }
    if (document.querySelector('input[name="order"]:checked').value === 'random') p = [...p].sort(() => Math.random() - 0.5);
    quizState.problems = p; quizState.currentIndex = 0; quizState.correctCount = 0; quizState.currentCombo = 0;
    quizState.mode = 'normal'; quizState.opCode = op;
}

// 苦手な問題ほど出やすくする重み付き抽選。重複なしで count 件返す。
function weightedSample(pool, count) {
    const items = pool.map(problem => {
        const key = `${problem.opCode}:${problem.n1}:${problem.n2}`;
        const stat = userData.problemStats[key];
        // 重み = 1 + 3×(まちがい率)。未出題（統計なし）は重み1。
        let weight = 1;
        if (stat && (stat.c + stat.w) > 0) weight = 1 + 3 * (stat.w / (stat.c + stat.w));
        return { problem, weight };
    });
    const result = [];
    const n = Math.min(count, items.length);
    for (let i = 0; i < n; i++) {
        const totalWeight = items.reduce((sum, it) => sum + it.weight, 0);
        let r = Math.random() * totalWeight;
        let pickIndex = 0;
        for (let j = 0; j < items.length; j++) {
            r -= items[j].weight;
            if (r <= 0) { pickIndex = j; break; }
        }
        result.push(items[pickIndex].problem);
        items.splice(pickIndex, 1); // えらんだ問題は取り除いて重複を防ぐ
    }
    return result;
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
    const correct = (userAnswer === problem.ans);
    recordProblemStat(problem, correct); // 苦手判定用の正誤記録
    if (correct) {
        quizState.correctCount++; quizState.currentCombo++; SoundManager.correct();
        elements.answerDisplay.textContent = "○ せいかい！";
        // 復習モードで正解したら、まちがいノートから取り除く
        if (quizState.mode === 'review') removeWrongProblem(problem);
        if (quizState.currentCombo >= 2) {
            if (elements.comboCount) elements.comboCount.textContent = quizState.currentCombo;
            if (elements.comboDisplay) { elements.comboDisplay.classList.remove('hidden'); setTimeout(() => elements.comboDisplay.classList.add('hidden'), 800); }
        }
    } else { quizState.currentCombo = 0; SoundManager.incorrect(); elements.answerDisplay.textContent = `× こたえ:${problem.ans}`; recordWrongProblem(problem); }
    quizState.isAwaitingNext = true;
}

// まちがいノートの復習クイズを始める（古い順に最大9問）
function startReviewQuiz() {
    const sym = {add:'＋', sub:'－', mul:'×', div:'÷'};
    const p = userData.wrongProblems.slice(0, 9).map(w => ({
        n1: w.n1, n2: w.n2, op: sym[w.opCode], opCode: w.opCode, ans: w.ans
    }));
    quizState.problems = p; quizState.currentIndex = 0; quizState.correctCount = 0; quizState.currentCombo = 0;
    quizState.mode = 'review'; quizState.opCode = p.length ? p[0].opCode : 'add';
    showScreen('quiz'); displayCurrentProblem();
}

function finishQuiz() {
    const total = quizState.problems.length; const correct = quizState.correctCount; const isPerfect = (correct === total);
    const isReview = (quizState.mode === 'review');
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const dan = parseInt(elements.danSelect.value, 10);
    // 復習モードでは段クリア（clearedDans）は更新しない
    if (!isReview && mode === 'dan' && isPerfect) { if (!userData.clearedDans[quizState.opCode].includes(dan)) userData.clearedDans[quizState.opCode].push(dan); }
    let xpGained = correct * 5 + (isPerfect ? 20 : 0);
    const leveledUp = addXP(xpGained); if (isPerfect) awardTicket(1);
    // 復習でまちがいノートが空になったらチケット+1
    const reviewCleared = isReview && userData.wrongProblems.length === 0;
    if (reviewCleared) awardTicket(1);
    if (elements.finalScore) elements.finalScore.textContent = `${correct} / ${total}`;
    if (elements.gainedXp) elements.gainedXp.textContent = xpGained;
    showScreen('results');
    (async () => {
        if (isPerfect) { triggerConfetti(); await new Promise(r => setTimeout(r, 1000)); }
        if (leveledUp) {
            SoundManager.levelUp(); const lv = calculateLevelFromXp(userData.xp).level;
            if (elements.newLevelDisplay) elements.newLevelDisplay.textContent = lv;
            if (elements.levelUpModal) elements.levelUpModal.classList.remove('hidden');
            // レベルアップ表示中は他のモーダルを同時に出さない（閉じたあとにreview-emptyを出す）
        } else if (reviewCleared) {
            // 復習でノートが空になったお祝い（ガチャ確認は出さない）
            if (elements.reviewEmptyModal) elements.reviewEmptyModal.classList.remove('hidden');
        } else if (isPerfect) {
            if (elements.gachaConfirmModal) elements.gachaConfirmModal.classList.remove('hidden');
        }
    })();
    saveData();
    if (elements.reviewQuizBtn) updateReviewButton();
}
