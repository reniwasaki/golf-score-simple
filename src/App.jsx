import { useState, useEffect } from "react";

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
  const [viewMode, setViewMode] = useState("vertical"); // ✅ 表示モード

  // ✅ localStorage復元
  useEffect(() => {
    const saved = localStorage.getItem("golfAppData_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      setScores(parsed.scores || initialData);
      setGolfCourseName(parsed.golfCourseName || "");
      setHistory(parsed.history || []);
      setTheme(parsed.theme || "light");
      setViewMode(parsed.viewMode || "vertical");
    }
  }, []);

  // ✅ 自動保存
  useEffect(() => {
    localStorage.setItem(
      "golfAppData_v2",
      JSON.stringify({ scores, golfCourseName, history, theme, viewMode })
    );
  }, [scores, golfCourseName, history, theme, viewMode]);

  const handleChange = (index, key, value) => {
    const updated = [...scores];
    updated[index][key] = value;
    setScores(updated);
  };

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
    return { par, score, putt, fairwayRate, avgPutt };
  };

  const outTotal = total(0, 9);
  const inTotal = total(9, 18);
  const totalScore = outTotal.score + inTotal.score;

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

  // ✅ 柔らかいダークトーン設定
  const darkStyle = {
    backgroundColor: "#3B3024",
    color: "#F5E6CC",
  };

  const borderStyle = theme === "dark" ? "border-[#8C7A62]" : "border-gray-300";

  // ✅ スコア入力（＋／−）
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

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#3B3024] text-[#F5E6CC]"
          : "bg-green-50 text-green-900"
      }`}
    >
      {/* ✅ ヘッダー */}
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

      {/* ✅ ゴルフ場名 */}
      <input
        type="text"
        value={golfCourseName}
        onChange={(e) => setGolfCourseName(e.target.value)}
        placeholder="ゴルフ場名を入力"
        className={`border px-3 py-2 rounded w-full sm:w-96 mb-4 ${borderStyle} ${
          theme === "dark" ? "bg-[#4B3B2A]" : ""
        }`}
      />

      {/* ✅ 集計表示 */}
      <div
        className={`flex flex-wrap justify-center items-center gap-3 px-3 py-2 rounded-lg shadow w-full max-w-md text-sm text-center mb-4 ${
          theme === "dark" ? "bg-[#4B3B2A]" : "bg-white/70"
        }`}
      >
        <div>前半 Par:{outTotal.par}　Score:{outTotal.score}</div>
        <div>後半 Par:{inTotal.par}　Score:{inTotal.score}</div>
        <div className="font-bold">Total:{totalScore}</div>
      </div>

      <div className="text-xs sm:text-sm mb-4 opacity-80">
        前半 平均パット: {outTotal.avgPutt}　FW率: {outTotal.fairwayRate}%　
        ／ 後半 平均パット: {inTotal.avgPutt}　FW率: {inTotal.fairwayRate}%
      </div>

      {/* ✅ 表描画（縦 or 横） */}
      {viewMode === "vertical" ? (
        // ▼ 縦表示
        <div className="w-full overflow-x-auto max-w-3xl">
          <table
            className={`w-full text-xs sm:text-sm text-center border-collapse ${borderStyle}`}
          >
            <thead>
              <tr>
                <th>Hole</th>
                <th>Par</th>
                <th>スコア</th>
                <th>パット</th>
                <th>ティー</th>
                <th>距離(yd)</th>
                <th>±</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((h, i) => {
                const diff =
                  h.par && h.score ? diffToSymbol(h.score - h.par) : "";
                return (
                  <tr key={i} className="border-b border-gray-300 dark:border-[#6E5B43]">
                    <td>{i + 1}</td>
                    <td>
                      <select
                        value={h.par}
                        onChange={(e) => handleChange(i, "par", e.target.value)}
                        className={`border rounded ${borderStyle} ${
                          theme === "dark" ? "bg-[#4B3B2A]" : ""
                        }`}
                      >
                        <option value=""></option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </td>
                    <td>
                      <ScoreInput index={i} value={h.score} />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={h.putt}
                        onChange={(e) =>
                          handleChange(i, "putt", e.target.value)
                        }
                        className={`w-10 border rounded text-center ${borderStyle} ${
                          theme === "dark" ? "bg-[#4B3B2A]" : ""
                        }`}
                      />
                    </td>
                    <td>
                      <select
                        value={h.teeShot}
                        onChange={(e) =>
                          handleChange(i, "teeShot", e.target.value)
                        }
                        className={`border rounded ${borderStyle} ${
                          theme === "dark" ? "bg-[#4B3B2A]" : ""
                        }`}
                      >
                        <option>-</option>
                        <option>フェアウェイ</option>
                        <option>右ラフ</option>
                        <option>左ラフ</option>
                        <option>OB</option>
                      </select>
                    </td>
                    <td>
                      {h.par !== "3" ? (
                        <input
                          type="number"
                          value={h.drive}
                          onChange={(e) =>
                            handleChange(i, "drive", e.target.value)
                          }
                          className={`w-14 text-center border rounded ${borderStyle} ${
                            theme === "dark" ? "bg-[#4B3B2A]" : ""
                          }`}
                          placeholder="yd"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // ▼ 横表示（前のバージョンの形式）
        <div className="w-full overflow-x-auto">
          <table
            className={`w-full text-xs sm:text-sm text-center border-collapse ${borderStyle}`}
          >
            <thead>
              <tr>
                <th>ホール</th>
                {scores.slice(0, 9).map((_, i) => (
                  <th key={i}>H{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>スコア</td>
                {scores.slice(0, 9).map((h, i) => (
                  <td key={i}>
                    <ScoreInput index={i} value={h.score} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ ボタン群 */}
      <div className="flex gap-2 mt-6">
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
      </div>

      {/* ✅ 履歴 */}
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
