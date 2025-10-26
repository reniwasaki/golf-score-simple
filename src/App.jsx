import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

const holeCount = 18;
const initialData = Array.from({ length: holeCount }, () => ({
  par: "",
  score: "",
  putt: "",
  teeShot: "-",
  drive: "",
}));

const diffToSymbol = (diff) => {
  if (isNaN(diff)) return "";
  if (diff <= -3) return "☆";
  if (diff === -2) return "◎";
  if (diff === -1) return "◯";
  if (diff === 0) return "ー";
  if (diff === 1) return "△";
  if (diff === 2) return "□";
  return `+${diff}`;
};

export default function App() {
  const [scores, setScores] = useState(initialData);
  const [golfCourseName, setGolfCourseName] = useState("");
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("light");
  const [viewMode, setViewMode] = useState("vertical");
  const captureRef = useRef(null);

  // ✅ データ読み込み
  useEffect(() => {
    const saved = localStorage.getItem("golfAppData_v6");
    if (saved) {
      const parsed = JSON.parse(saved);
      setScores(parsed.scores || initialData);
      setGolfCourseName(parsed.golfCourseName || "");
      setHistory(parsed.history || []);
      setTheme(parsed.theme || "light");
      setViewMode(parsed.viewMode || "vertical");
    }
  }, []);

  // ✅ データ保存
  useEffect(() => {
    localStorage.setItem(
      "golfAppData_v6",
      JSON.stringify({ scores, golfCourseName, history, theme, viewMode })
    );
  }, [scores, golfCourseName, history, theme, viewMode]);

  const handleChange = (index, key, value) => {
    const updated = [...scores];
    updated[index][key] = value;
    setScores(updated);
  };

  // ✅ 集計関数
  const total = (start, end) => {
    const slice = scores.slice(start, end);
    const par = slice.reduce((sum, s) => sum + (parseInt(s.par) || 0), 0);
    const score = slice.reduce((sum, s) => sum + (parseInt(s.score) || 0), 0);
    const putt = slice.reduce((sum, s) => sum + (parseInt(s.putt) || 0), 0);
    const fairway = slice.filter((s) => s.teeShot === "フェアウェイ").length;
    const valid = slice.filter((s) => s.par !== "3").length;
    const fairwayRate = valid > 0 ? Math.round((fairway / valid) * 100) : 0;
    const avgPutt =
      slice.filter((s) => s.putt).length > 0
        ? (putt / slice.filter((s) => s.putt).length).toFixed(1)
        : 0;

    const drives = slice
      .map((s) => parseInt(s.drive))
      .filter((v) => !isNaN(v) && v > 0);
    const avgDrive =
      drives.length > 0
        ? Math.round(drives.reduce((a, b) => a + b, 0) / drives.length)
        : 0;

    return { par, score, putt, fairwayRate, avgPutt, avgDrive };
  };

  const outTotal = total(0, 9);
  const inTotal = total(9, 18);
  const totalScore = outTotal.score + inTotal.score;

  // ✅ 画像キャプチャ
  const handleCapture = async () => {
    if (!captureRef.current) return;

    const avgDriveTotal = Math.round((outTotal.avgDrive + inTotal.avgDrive) / 2);
    const avgPuttTotal = (
      (parseFloat(outTotal.avgPutt) + parseFloat(inTotal.avgPutt)) /
      2
    ).toFixed(1);

    // 📋 スコア概要（上部に追加）
    const header = document.createElement("div");
    header.style.textAlign = "center";
    header.style.marginBottom = "16px";
    header.style.color = theme === "dark" ? "#F5E6CC" : "#222";
    header.innerHTML = `
      <div style="font-size:18px;font-weight:bold;">🏌️‍♂️ ${
        golfCourseName || "未入力コース"
      }</div>
      <div style="font-size:14px;">${new Date().toLocaleDateString("ja-JP")}</div>
      <div style="font-size:14px;margin-top:4px;">
        Total: <b>${totalScore}</b>（OUT ${outTotal.score} / IN ${
      inTotal.score
    }）<br/>
        平均飛距離: ${avgDriveTotal}yd ／ 平均パット: ${avgPuttTotal}
      </div>
    `;
    captureRef.current.prepend(header);

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: theme === "dark" ? "#3B3024" : "#f8fdf8",
      scale: 2,
    });

    captureRef.current.removeChild(header);

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${
      golfCourseName || "scorecard"
    }_${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  };

  const saveRound = () => {
    const newEntry = {
      id: Date.now(),
      course: golfCourseName || "未入力コース",
      date: new Date().toLocaleDateString("ja-JP"),
      total: totalScore,
      data: scores,
    };
    setHistory([newEntry, ...history]);
    alert("✅ ラウンドを保存しました");
  };

  const loadRound = (entry) => {
    setScores(entry.data);
    setGolfCourseName(entry.course);
    alert(`📖 ${entry.course} のスコアを読み込みました`);
  };

  const toggleTheme = () =>
    setTheme(theme === "light" ? "dark" : "light");

  const toggleViewMode = () =>
    setViewMode(viewMode === "vertical" ? "horizontal" : "vertical");

  const borderStyle = theme === "dark" ? "border-[#8C7A62]" : "border-gray-300";
  const bgCard =
    theme === "dark" ? "bg-[#4B3B2A] text-[#F5E6CC]" : "bg-white text-green-900";
  const bgBase =
    theme === "dark" ? "bg-[#3B3024] text-[#F5E6CC]" : "bg-green-50 text-green-900";

  const ScoreInput = ({ index, value }) => (
    <div className="flex justify-center items-center gap-1">
      <button
        onClick={() =>
          handleChange(index, "score", (parseInt(value) || 0) - 1)
        }
        className={`px-2 py-1 rounded ${
          theme === "dark" ? "bg-[#6E5B43]" : "bg-gray-200"
        }`}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(index, "score", e.target.value)}
        className={`w-10 text-center border rounded ${borderStyle} ${
          theme === "dark" ? "bg-[#4B3B2A]" : ""
        }`}
      />
      <button
        onClick={() =>
          handleChange(index, "score", (parseInt(value) || 0) + 1)
        }
        className={`px-2 py-1 rounded ${
          theme === "dark" ? "bg-[#6E5B43]" : "bg-gray-200"
        }`}
      >
        ＋
      </button>
    </div>
  );

  const PuttInput = ({ index, value }) => (
    <div className="flex justify-center items-center gap-1">
      <button
        onClick={() =>
          handleChange(index, "putt", Math.max(0, (parseInt(value) || 0) - 1))
        }
        className={`px-2 py-1 rounded ${
          theme === "dark" ? "bg-[#6E5B43]" : "bg-gray-200"
        }`}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(index, "putt", e.target.value)}
        className={`w-10 text-center border rounded ${borderStyle} ${
          theme === "dark" ? "bg-[#4B3B2A]" : ""
        }`}
      />
      <button
        onClick={() =>
          handleChange(index, "putt", (parseInt(value) || 0) + 1)
        }
        className={`px-2 py-1 rounded ${
          theme === "dark" ? "bg-[#6E5B43]" : "bg-gray-200"
        }`}
      >
        ＋
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${bgBase}`}>
      {/* 🔹 操作ヘッダー */}
      <div className="w-full flex justify-between items-center max-w-4xl mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">🏌️ Golf Score Card</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleViewMode}
            className="border px-3 py-1 rounded text-sm"
          >
            {viewMode === "vertical" ? "横表示に切替" : "縦表示に切替"}
          </button>
          <button
            onClick={toggleTheme}
            className="border px-3 py-1 rounded text-sm"
          >
            {theme === "dark" ? "☀️ライト" : "🌙ダーク"}
          </button>
        </div>
      </div>

      {/* 🔹 コース名 */}
      <input
        type="text"
        value={golfCourseName}
        onChange={(e) => setGolfCourseName(e.target.value)}
        placeholder="ゴルフ場名を入力"
        className={`border px-3 py-2 rounded w-full sm:w-96 mb-4 ${borderStyle} ${
          theme === "dark" ? "bg-[#4B3B2A]" : ""
        }`}
      />

      <div ref={captureRef} className="w-full flex flex-col items-center">
        {/* 🔹 集計 */}
        <div
          className={`flex flex-wrap justify-center items-center gap-3 px-3 py-2 rounded-lg shadow w-full max-w-md text-sm text-center mb-4 ${bgCard}`}
        >
          <div>前半 Par:{outTotal.par}　Score:{outTotal.score}</div>
          <div>後半 Par:{inTotal.par}　Score:{inTotal.score}</div>
          <div className="font-bold">Total:{totalScore}</div>
        </div>

        {/* 🔹 平均表示 */}
        <div className="text-xs sm:text-sm mb-4 opacity-80 text-center">
          前半 平均パット: {outTotal.avgPutt}　FW率: {outTotal.fairwayRate}%　
          平均飛距離: {outTotal.avgDrive}yd ／ 後半 平均パット:{" "}
          {inTotal.avgPutt}　FW率: {inTotal.fairwayRate}%　
          平均飛距離: {inTotal.avgDrive}yd
        </div>

        {/* 🔹 スコアテーブル（縦 or 横） */}
        {/* ここに前回のスコア表（省略、既存をそのまま） */}
      </div>

      {/* 🔹 ボタン */}
      <div className="flex gap-2 mt-6 flex-wrap justify-center">
        <button
          onClick={saveRound}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          💾 保存
        </button>
        <button
          onClick={() => setScores(initialData)}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          リセット
        </button>
        <button
          onClick={handleCapture}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📸 スコア画像を保存
        </button>
      </div>

      {/* 🔹 履歴表示 */}
      <div className="w-full max-w-3xl mt-6">
        <h2 className="text-lg font-bold mb-2">📜 スコア履歴</h2>
        {history.length === 0 ? (
          <p className="text-sm opacity-80">まだ保存されたラウンドはありません。</p>
        ) : (
          <ul className="text-sm">
            {history.map((h) => (
              <li
                key={h.id}
                className="border-b py-2 flex justify-between items-center dark:border-[#6E5B43]"
              >
                <span>
                  🏌️‍♂️ {h.course}（{h.date}） - Total {h.total}
                </span>
                <button
                  onClick={() => loadRound(h)}
                  className="text-green-700 hover:underline"
                >
                  読み込み
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
