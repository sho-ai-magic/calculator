// アプリの起動処理をまとめたファイル。画面の部品を集めて、ボタンなどの操作にはたらきを結びつける。

function initialize() {
    const ids = ['settings-screen', 'quiz-screen', 'results-screen', 'record-screen', 'dan-select', 'dan-selector', 'dan-mode-label', 'start-button', 'problem-text', 'answer-display', 'check-button', 'next-button', 'next-button-container', 'progress-text', 'final-score', 'review-button', 'reset-quiz-button', 'keypad', 'open-record-btn', 'close-record-btn', 'display-xp', 'display-level', 'display-tickets', 'display-xp-bar', 'record-level', 'record-rank', 'record-xp-bar', 'next-level-xp', 'sticker-grid-1', 'sticker-grid-2', 'perfect-badge', 'ticket-get-box', 'gained-xp', 'combo-display', 'combo-count', 'confetti-container', 'gacha-machine', 'gacha-animation-area', 'gacha-pull-btn', 'record-tickets', 'gacha-result-overlay', 'gacha-result-icon', 'gacha-result-text', 'gacha-close-result', 'gacha-confirm-modal', 'confirm-gacha-yes', 'confirm-gacha-no', 'level-up-modal', 'close-level-up-btn', 'new-level-display', 'tutorial-modal', 'close-tutorial-btn', 'sticker-complete-modal', 'close-complete-btn', 'sticker-count-display', 'page-complete-modal', 'close-page-complete-btn', 'grand-complete-modal', 'reset-collection-btn', 'next-lap-display', 'lap-display-top', 'display-lap', 'lap-display-record', 'display-lap-record', 'lucky-badge'];
    ids.forEach(id => { const el = document.getElementById(id); if(el) elements[id.replace(/-([0-9a-z])/g, (g) => g.replace('-','').toUpperCase())] = el; });
    loadData();
    if (!userData.hasSeenTutorial && elements.tutorialModal) elements.tutorialModal.classList.remove('hidden');
    if(elements.startButton) elements.startButton.addEventListener('click', () => { SoundManager.init(); SoundManager.click(); generateProblems(); showScreen('quiz'); displayCurrentProblem(); });
    document.getElementsByName('operation').forEach(r => r.addEventListener('change', (e) => { const labels = {add:'たす数', sub:'ひく数', mul:'だん', div:'わり数'}; elements.danModeLabel.textContent = `「${labels[e.target.value]}」を えらぶ`; updateDanSelectOptions(); }));
    document.getElementsByName('mode').forEach(r => r.addEventListener('change', (e) => { if (elements.danSelector) elements.danSelector.classList.toggle('hidden', e.target.value !== 'dan'); }));
    if(elements.nextButton) elements.nextButton.addEventListener('click', () => { SoundManager.click(); quizState.isAwaitingNext = false; quizState.currentIndex++; if (quizState.currentIndex < quizState.problems.length) displayCurrentProblem(); else finishQuiz(); });
    if(elements.reviewButton) elements.reviewButton.addEventListener('click', () => { SoundManager.click(); showScreen('settings'); updateDanSelectOptions(); });
    if(elements.resetQuizButton) elements.resetQuizButton.addEventListener('click', () => { SoundManager.click(); showScreen('settings'); updateDanSelectOptions(); });
    if(elements.openRecordBtn) elements.openRecordBtn.addEventListener('click', () => { SoundManager.click(); updateAllUI(); showScreen('record'); });
    if(elements.closeRecordBtn) elements.closeRecordBtn.addEventListener('click', () => { SoundManager.click(); showScreen('settings'); updateDanSelectOptions(); });
    if(elements.gachaPullBtn) elements.gachaPullBtn.addEventListener('click', () => { SoundManager.click(); pullGacha(); });
    if(elements.gachaCloseResult) elements.gachaCloseResult.addEventListener('click', () => { SoundManager.click(); if (elements.gachaResultOverlay) elements.gachaResultOverlay.classList.add('hidden'); if (elements.gachaAnimationArea) elements.gachaAnimationArea.textContent = "🔮"; updateAllUI(); checkCollectionProgress(); });
    if(elements.closeLevelUpBtn) elements.closeLevelUpBtn.addEventListener('click', () => { SoundManager.click(); if (elements.levelUpModal) elements.levelUpModal.classList.add('hidden'); if (quizState.correctCount === quizState.problems.length && elements.gachaConfirmModal) elements.gachaConfirmModal.classList.remove('hidden'); });
    if(elements.closeTutorialBtn) elements.closeTutorialBtn.addEventListener('click', () => { SoundManager.init(); SoundManager.click(); if (elements.tutorialModal) elements.tutorialModal.classList.add('hidden'); userData.hasSeenTutorial = true; saveData(); });
    if(elements.confirmGachaYes) elements.confirmGachaYes.addEventListener('click', () => { SoundManager.click(); if (elements.gachaConfirmModal) elements.gachaConfirmModal.classList.add('hidden'); updateAllUI(); showScreen('record'); });
    if(elements.confirmGachaNo) elements.confirmGachaNo.addEventListener('click', () => { SoundManager.click(); if (elements.gachaConfirmModal) elements.gachaConfirmModal.classList.add('hidden'); });
    if(elements.closeCompleteBtn) elements.closeCompleteBtn.addEventListener('click', () => { SoundManager.click(); if (elements.stickerCompleteModal) elements.stickerCompleteModal.classList.add('hidden'); });
    if(elements.closePageCompleteBtn) elements.closePageCompleteBtn.addEventListener('click', () => { SoundManager.click(); if (elements.pageCompleteModal) elements.pageCompleteModal.classList.add('hidden'); });
    if(elements.resetCollectionBtn) elements.resetCollectionBtn.addEventListener('click', () => { SoundManager.click(); userData.stickers = []; userData.bingosClaimed = []; userData.pageRewardsClaimed = []; userData.lapCount += 1; saveData(); updateAllUI(); if (elements.grandCompleteModal) elements.grandCompleteModal.classList.add('hidden'); showScreen('settings'); });
    if(elements.keypad) elements.keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('button'); if (!btn || quizState.isAwaitingNext) return; SoundManager.click(); const val = btn.dataset.val;
        if (val === 'C') { quizState.currentInput = ""; if (elements.answerDisplay) elements.answerDisplay.textContent = "？"; }
        else if (val === 'Enter') { if (quizState.currentInput !== "") checkAnswer(); }
        else if (quizState.currentInput.length < 3) { quizState.currentInput += val; if (elements.answerDisplay) elements.answerDisplay.textContent = quizState.currentInput; }
    });
    showScreen('settings'); updateDanSelectOptions();
}
window.onload = initialize;
