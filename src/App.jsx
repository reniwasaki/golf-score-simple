import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

export default function App() {
  const [scores, setScores] = useState(
    Array(18).fill({
      par: "",
      score: "",
      putt: "",
      tee: "",
      drive: "",
    })
  );
  const [courseName, setCourseName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [viewVertical, setViewVertical] = useState(true);

  // 🔄 ローカル保存
  useEffect(() => {
    const saved = localStorage.getItem("golf-score-data");
    if (saved) {
      const parsed = JSON.parse(saved);
      setScores(parsed.scores || scores);
      setCourseName(parsed.courseName || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("golf-score-data", JSON.stringify({ scores, courseName }));
  }, [scores, courseName]);

  // 🧮 集計
  const calcSum = (field, start, end) =>
    scores.slice(start, end).reduce((sum, s) => sum + (parseInt(s[field]) || 0), 0);

  const totalScore = calcSum("score", 0, 18);
  const totalPar = calcSum("par", 0, 18);
  const avgPutt = (
    scores.reduce((sum, s) => sum + (parseInt(s.putt) || 0), 0) / 18
  ).toFixed(1);
  const validDrives = scores
    .map((s) => parseInt(s.drive))
    .filter((d) => !isNaN(d));
  const avgDrive =
    validDrives.length > 0
      ? Math.round(validDrives.reduce((a, b) => a + b, 0) / validDrives.length)
      : 0;

  // 🔢 スコア入力更新
  const handleChange = (index, field, value) => {
    const newScores = [...scores];
    newScores[index] = { ...newScores[index], [field]: value };
    setScores(newScores);
  };

  // 🖼 画像キャプチャ（1080x1080）
  const handleCapture = async () => {
    const captureElement = document.getElementById("score-image");
    if (!captureElement) return;

    const canvas = await html2canvas(captureElement, {
      backgroundColor: "#EAF5E3", // 芝生風
      scale: 2,
      width: 1080,
      height: 1080,
      windowWidth: 1080,
      windowHeight: 1080,
    });

    const link = document.createElement("a");
    link.download = `${courseName || "golf-score"}_scorecard.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleReset = () => {
    setScores(Array(18).fill({ par: "", score: "", putt: "", tee: "", drive: "" }));
    setCourseName("");
    localStorage.removeItem("golf-score-data");
  };

  const bgColor = darkMode ? "bg-[#3f3b36] text-white" : "bg-green-50 text-green-900";
  const cardColor = darkMode ? "bg-[#4b453f]" : "bg-white";
  const borderStyle = darkMode ? "border-gray-500" : "border-green-300";

  return (
    <div className={`min-h-screen p-4 transition-all ${bgColor}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🏌️‍♂️ Golf Score Card</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewVertical(!viewVertical)}
              className="px-2 py-1 bg-gray-100 rounded"
            >
              {viewVertical ? "横表示に切替" : "縦表示に切替"}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2 py-1 bg-gray-100 rounded"
            >
              {darkMode ? "☀️ ライト" : "🌙 ダーク"}
            </button>
          </div>
        </div>

        {/* === 出力画像用コンテナ === */}
        <div
          id="score-image"
          className={`p-6 rounded-xl shadow-lg ${cardColor}`}
          style={{
            width: "1080px",
            height: "1080px",
            backgroundColor: "#EAF5E3",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-1">{courseName || "ゴルフ場名"}</h2>
            <p className="text-2xl font-semibold text-green-800">
              🏆 Total {totalScore}（前半 {calcSum("score", 0, 9)} ／ 後半 {calcSum("score", 9, 18)}）
            </p>
          </div>

          {/* スコアテーブル */}
          <div className="flex flex-col items-center space-y-4">
            {[0, 9].map((startIdx) => (
              <div key={startIdx} className="flex gap-2">
                {scores.slice(startIdx, startIdx + 9).map((s, i) => (
                  <div
                    key={startIdx + i}
                    className="w-24 bg-white bg-opacity-90 text-center p-3 rounded shadow"
                  >
                    <div className="text-sm font-semibold text-green-700">
                      H{startIdx + i + 1}
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {s.score || "-"}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 平均表示 */}
          <div className="text-center mt-10 text-xl font-semibold text-green-900">
            平均パット：{avgPutt}　平均飛距離：{avgDrive}yd
          </div>
        </div>

        {/* === ボタン === */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            リセット
          </button>
          <button
            onClick={handleCapture}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            📸 スコア画像を保存（1080×1080）
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- ±ボタン付き入力 ----------
const NumberInput = ({ index, field, value, handleChange, borderStyle }) => {
  const inc = () => handleChange(index, field, parseInt(value || 0) + 1);
  const dec = () => handleChange(index, field, Math.max(0, parseInt(value || 0) - 1));

  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={dec} className={`px-2 py-1 rounded border ${borderStyle}`}>
        －
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(index, field, e.target.value)}
        className={`w-12 text-center border rounded ${borderStyle}`}
      />
      <button onClick={inc} className={`px-2 py-1 rounded border ${borderStyle}`}>
        ＋
      </button>
    </div>
  );
};
