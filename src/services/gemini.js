import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 日記の内容からパラメータ変化を推測する
 * @param {string} episode - 日記の内容
 * @returns {Promise<{health: number, stress: number, energy: number, money: number}>}
 */
export async function analyzeEpisodeParameters(episode) {
  try {
    // デバッグ：APIキーの確認
    if (!API_KEY) {
      throw new Error("APIキーが設定されていません");
    }
    console.log("API Key exists:", !!API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `あなたは日記の内容から、その人の状態変化を分析する専門家です。
以下の日記の内容を読んで、4つのパラメータの変化量を-100から+100の範囲で推測してください。

日記の内容：
${episode}

以下の4つのパラメータについて、変化量を数値で答えてください：
1. 体力（health）：体調が良くなったり運動したら+、疲れたり病気になったら-
2. ストレス（stress）：嫌なことがあったりプレッシャーを感じたら+、リラックスしたり楽しいことがあったら-
3. 空腹度（energy）：お腹が空いたら+、美味しい食事をしたら-
4. お金（money）：収入や節約できたら+、出費があったら-

必ず以下のJSON形式で回答してください。他のテキストは含めないでください：
{"health": 数値, "stress": 数値, "energy": 数値, "money": 数値}

注意：
- 各値は-100から+100の整数で指定してください
- 日記に言及がないパラメータは0にしてください
- 推測は常識的な範囲で行ってください`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // JSONをパース
    // マークダウンのコードブロックで囲まれている場合を考慮
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const parameters = JSON.parse(jsonMatch[0]);

    // 値を-100から+100の範囲に制限
    const clamp = (value) => Math.max(-100, Math.min(100, parseInt(value) || 0));

    return {
      health: clamp(parameters.health),
      stress: clamp(parameters.stress),
      energy: clamp(parameters.energy),
      money: clamp(parameters.money),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("パラメータの分析に失敗しました。もう一度お試しください。");
  }
}
