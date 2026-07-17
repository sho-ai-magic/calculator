// 設定データ（シール一覧・称号・セーブ名・ユーザーデータの初期値）と、共有する箱（変数）の宣言をまとめたファイル。

const FINAL_STICKERS = ["🍓", "🎀", "🦄", "🍦", "🍭", "👑", "🧸", "🎨", "🌈", "🪄", "🍪", "🌟", "🐱", "🐶", "🍒", "💎", "🍎", "🍑", "🍊", "🍉", "🍇", "🥞", "🍩", "🧁", "🍮", "🍫", "🍰", "🥨", "🍬", "🍨", "🍿", "🥤", "🍙", "🍡", "🐼", "🎈", "🎊", "🎁", "👗", "💄", "💍", "🎒", "👒", "🌸", "🌷", "🌼", "🌻", "🍀", "🦋", "🐰"];
const RANKS = ["すうじの妖精", "さんすう見習い", "計算のプリンセス", "きらきらスター", "魔法の算数使い", "きらめきマジシャン", "数の守護者", "伝説の計算手", "算数マスター ✨", "知恵の女神", "宇宙一の天才", "銀河の覇者 👑"];
const SAVE_KEY = "kawaii_arithmetic_save_v7_lucky";

// ユーザーデータの初期値（新規スタート時の状態）。壊れたセーブデータを直すときの「お手本」としても使う。
const DEFAULT_USER_DATA = {
    xp: 0, level: 1, tickets: 0, stickers: [],
    stamps: [], // 将来のデイリースタンプ機能用（現在は未使用）
    claimedWeeklyBonus: "", // 将来のデイリースタンプ機能用（現在は未使用）
    lastOperation: "add", hasSeenTutorial: false,
    clearedDans: { add: [], sub: [], mul: [], div: [] },
    bingosClaimed: [], lapCount: 1, pageRewardsClaimed: []
};

// 今のユーザーデータ。初期値をコピーして始める（structuredCloneで中身まで別物にする）。
let userData = structuredClone(DEFAULT_USER_DATA);

let quizState = { problems: [], currentIndex: 0, correctCount: 0, currentCombo: 0, isAwaitingNext: false, currentInput: "" };
let elements = {};
