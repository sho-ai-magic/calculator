// 設定データ（シール一覧・称号・セーブ名・ユーザーデータの初期値）と、共有する箱（変数）の宣言をまとめたファイル。

const FINAL_STICKERS = ["🍓", "🎀", "🦄", "🍦", "🍭", "👑", "🧸", "🎨", "🌈", "🪄", "🍪", "🌟", "🐱", "🐶", "🍒", "💎", "🍎", "🍑", "🍊", "🍉", "🍇", "🥞", "🍩", "🧁", "🍮", "🍫", "🍰", "🥨", "🍬", "🍨", "🍿", "🥤", "🍙", "🍡", "🐼", "🎈", "🎊", "🎁", "👗", "💄", "💍", "🎒", "👒", "🌸", "🌷", "🌼", "🌻", "🍀", "🦋", "🐰"];
const RANKS = ["すうじの妖精", "さんすう見習い", "計算のプリンセス", "きらきらスター", "魔法の算数使い", "きらめきマジシャン", "数の守護者", "伝説の計算手", "算数マスター ✨", "知恵の女神", "宇宙一の天才", "銀河の覇者 👑"];
const SAVE_KEY = "kawaii_arithmetic_save_v7_lucky";

// ユーザーデータの初期値（新規スタート時の状態）。壊れたセーブデータを直すときの「お手本」としても使う。
const DEFAULT_USER_DATA = {
    xp: 0, level: 1, tickets: 0, stickers: [],
    stamps: [], // 毎日スタンプで押した日付（"YYYY-MM-DD"）の配列
    claimedWeeklyBonus: "", // 旧データ互換のため残す（現在は未使用）
    lastOperation: "add", hasSeenTutorial: false,
    clearedDans: { add: [], sub: [], mul: [], div: [] },
    bingosClaimed: [], lapCount: 1, pageRewardsClaimed: [],
    wrongProblems: [],                    // まちがいノート [{opCode,n1,n2,ans}]（キー opCode:n1:n2 で1件化）
    problemStats: {},                     // {"mul:7:8":{c:3,w:2}} 苦手判定用
    playLog: {},                          // {"2026-07-18":{add:{t:9,c:8},...}} おうちの人画面用
    streakLastClaimed: 0,                 // 連続ごほうびの多重付与防止
    parentSettings: { freeRetry: false }  // false=まんべんなく（現状）/ true=くりかえし自由
};

// 今のユーザーデータ。初期値をコピーして始める（structuredCloneで中身まで別物にする）。
let userData = structuredClone(DEFAULT_USER_DATA);

let quizState = { problems: [], currentIndex: 0, correctCount: 0, currentCombo: 0, isAwaitingNext: false, currentInput: "", mode: 'normal', opCode: 'add' };
let elements = {};
