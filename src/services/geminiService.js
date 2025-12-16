import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

// Gemini APIの初期化
export const initGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  console.log("=== Gemini API初期化 ===");
  console.log("環境変数の確認:");
  console.log("- import.meta.env.MODE:", import.meta.env.MODE);
  console.log("- import.meta.env.DEV:", import.meta.env.DEV);
  console.log("- VITE_GEMINI_API_KEY:", apiKey ? `設定済み (長さ: ${apiKey.length}文字)` : "❌ 未設定");

  if (apiKey) {
    console.log("- APIキーの先頭:", apiKey.substring(0, 10) + "...");
  }

  if (!apiKey) {
    console.error("⚠️ Gemini API Keyが設定されていません！");
    console.error("📝 手順:");
    console.error("  1. プロジェクトルート (C:\\Users\\ikino\\project2025_team3) に .env ファイルがあるか確認");
    console.error("  2. .env ファイルの内容を確認:");
    console.error("     VITE_GEMINI_API_KEY=AIzaSy... (実際のAPIキー)");
    console.error("  3. スペースや引用符がないか確認");
    console.error("  4. サーバーを Ctrl+C で停止後、npm run dev で再起動");
    console.error("🔗 APIキー取得: https://aistudio.google.com/app/apikey");
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // gemini-1.5-flashは無料枠で利用可能
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
    return false;
  }
};

// 日記の内容に対してコメントを生成
export const generateCommentForDiary = async (diaryText) => {
  console.log("=== generateCommentForDiary 開始 ===");
  console.log("日記の内容:", diaryText);

  try {
    // APIが初期化されていない場合は初期化を試みる
    if (!model) {
      console.log("モデルが未初期化のため、初期化を試みます...");
      const initialized = initGemini();
      if (!initialized) {
        console.error("❌ 初期化に失敗しました");
        return null;
      }
      console.log("✅ 初期化成功");
    } else {
      console.log("✅ モデルは既に初期化済み");
    }

    // プロンプト：日記の内容に対して短く共感的なコメントを生成
    const prompt = `以下は、ユーザーが書いた日記の内容です。この内容に対して、優しく共感的で、励ましや応援の気持ちを込めた一言コメント（30文字以内）を日本語で生成してください。コメントは「」などの引用符を付けず、文章だけを返してください。

日記の内容：
${diaryText}`;

    console.log("🤖 Gemini APIにリクエストを送信中...");
    const result = await model.generateContent(prompt);
    console.log("📥 レスポンスを受信しました");

    const response = await result.response;
    const comment = response.text().trim();

    console.log("✅ 生成されたコメント:", comment);
    console.log("=== generateCommentForDiary 終了 ===");

    return comment;
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    console.error("エラーの詳細:", error.message);
    console.error("エラーのスタック:", error.stack);
    return null;
  }
};

