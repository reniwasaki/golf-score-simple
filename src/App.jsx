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
    scores
      .slice(start, end)
      .reduce((sum, s) => sum + (parseInt(s[field]) || 0), 0);

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

    // 一時的に背景を追加して安定化
    const canvas = await html2canvas(captureElement, {
      backgroundColor: darkMode ? "#3f3b36" : "#f5f7f2",
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

  // 色テーマ
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
        <div id="score-image" className={`p-4 rounded-xl shadow ${cardColor}`}>
          <input
            type="text"
            placeholder="ゴルフ場名を入力"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className={`w-full text-center text-xl font-semibold mb-3 p-2 border rounded ${borderStyle}`}
          />

          <div className="text-center mb-4">
            <p className="font-bold text-lg">
              Total: {totalScore}　Par: {totalPar}
            </p>
            <p>
              平均パット：{avgPutt}　平均飛距離：{avgDrive}yd
            </p>
          </div>

          {/* === スコア表 === */}
          <div
            className={`${
              viewVertical ? "grid grid-cols-2 gap-4" : "flex flex-col"
            }`}
          >
            {[0, 9].map((startIdx) => (
              <div key={startIdx}>
                <h2 className="font-bold text-green-700 mb-2">
                  {startIdx === 0 ? "前半（1〜9）" : "後半（10〜18）"}
                </h2>
                <div
                  className={`${
                    viewVertical ? "flex flex-col" : "grid grid-cols-9"
                  } gap-2`}
                >
                  {scores.slice(startIdx, startIdx + 9).map((s, i) => {
                    const index = startIdx + i;
                    const par = parseInt(s.par) || 0;
                    const score = parseInt(s.score) || 0;
                    const diff = score - par;
                    const diffSymbol =
                      diff === 0
                        ? "ー"
                        : diff === -1
                        ? "◯"
                        : diff === -2
                        ? "◎"
                        : diff <= -3
                        ? "☆"
                        : diff === 1
                        ? "△"
                        : diff === 2
                        ? "□"
                        : `+${diff}`;

                    return (
                      <div
                        key={index}
                        className={`p-2 text-center rounded border ${borderStyle}`}
                      >
                        <p className="font-bold text-green-700">H{index + 1}</p>

                        {/* Par */}
                        <select
                          value={s.par}
                          onChange={(e) =>
                            handleChange(index, "par", e.target.value)
                          }
                          className={`w-full text-center border rounded ${borderStyle}`}
                        >
                          <option value="">Par</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>

                        {/* スコア */}
                        <NumberInput
                          index={index}
                          field="score"
                          value={s.score}
                          handleChange={handleChange}
                          borderStyle={borderStyle}
                        />

                        {/* パット */}
                        <NumberInput
                          index={index}
                          field="putt"
                          value={s.putt}
                          handleChange={handleChange}
                          borderStyle={borderStyle}
                        />

                        <p className="text-sm mt-1">{diffSymbol}</p>

                        {/* ティーショット */}
                        <select
                          value={s.tee}
                          onChange={(e) =>
                            handleChange(index, "tee", e.target.value)
                          }
                          className={`w-full text-center border rounded ${borderStyle}`}
                        >
                          <option value="">ティー</option>
                          {par === 3 ? (
                            <>
                              <option value="グリーンオン">グリーンオン</option>
                              <option value="右">右</option>
                              <option value="左">左</option>
                              <option value="奥">奥</option>
                              <option value="手前">手前</option>
                              <option value="OB">OB</option>
                            </>
                          ) : (
                            <>
                              <option value="フェアウェイ">フェアウェイ</option>
                              <option value="右ラフ">右ラフ</option>
                              <option value="左ラフ">左ラフ</option>
                              <option value="OB">OB</option>
                            </>
                          )}
                        </select>

                        {par !== 3 && (
                          <input
                            type="number"
                            placeholder="yd"
                            value={s.drive}
                            onChange={(e) =>
                              handleChange(index, "drive", e.target.value)
                            }
                            className={`w-full text-center border rounded ${borderStyle}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
