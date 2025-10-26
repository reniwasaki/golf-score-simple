import { useState, useEffect } from "react";

const holeCount = 18;
const initialData = Array.from({ length: holeCount }, () => ({
  par: "",
  score: "",
  putt: "",
  teeShot: "-",
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

  // ✅ localStorage復元
  useEffect(() => {
    const saved = localStorage.getItem("golfAppData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setScores(parsed.scores || initialData);
      setGolfCourseName(parsed.golfCourseName || "");
      setHistory(parsed.history || []);
      setTheme(parsed.theme || "light");
    }
  }, []);

  // ✅ 自動保存
  useEffect(() => {
    localStorage.setItem(
      "golfAppData",
      JSON.stringify({ scores, golfCourseName, history, theme })
    );
  }, [scores, golfCourseName, history, theme]);

  const handleChange = (index, key, value) => {
    const updated = [...scores];
    updated[index][key] = value;
    setScores(updated);
  };

  // ✅ スコア・パット・フェアウェイ率などの集計
  const total = (start, end) => {
    const slice = scores.slice(start, end);
    const par = slice.reduce((sum, s) => sum + (parseInt(s.par) || 0), 0);
    const score = slice.reduce((sum, s) => sum + (parseInt(s.score) || 0), 0);
    const putt = slice.reduce((sum, s) => sum + (parseInt(s.putt) || 0), 0);
    const fairway = slice.filter((s) => s.teeShot === "フェアウェイ").length;
    const valid = slice.filter((s) => s.par !== "3").length; // Par3除外
    const fairwayRate =
      valid > 0 ? Math.round((fairway / valid) * 100) : 0;
    const avgPutt =
      slice.filter((s) => s.putt).length > 0
        ? (putt / slice.filter((s) => s.putt).length).toFixed(1)
        : 0;
    return { par, score, putt, fairwayRate, avgPutt };
  };

  const outTotal = total(0, 9);
  const inTotal = total(9, 18);
  const totalScore = outTotal.score + inTotal.score;

  // ✅ 履歴保存
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

  // ✅ 履歴読み込み
  const loadRound = (entry) => {
    setScores(entry.data);
    setGolfCourseName(entry.course);
    alert(`📖 ${entry.course} のスコアを読み込みました`);
  };

  // ✅ スコア入力ボタン方式（タップ最適化）
  const ScoreInput = ({ index, value }) => (
    <div className="flex justify-center items-center gap-1">
      <button
        onClick={() =>
          handleChange(index, "score", (parseInt(value) || 0) - 1)
        }
        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(index, "score", e.target.value)}
        className="w-10 text-center border rounded dark:bg-gray-800 dark:border-gray-600"
      />
      <button
        onClick={() =>
          handleChange(index, "score", (parseInt(value) || 0) + 1)
        }
        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
      >
        ＋
      </button>
    </div>
  );

  // ✅ テーマ切替
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-green-50 text-green-900"
      }`}
    >
      {/* ヘッダー */}
      <div className="w-full flex justify-between items-center max-w-4xl mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">🏌️ Golf Score Card</h1>
        <button
          onClick={toggleTheme}
          className="border px-3 py-1 rounded text-sm dark:border-gray-500"
        >
          {theme === "dark" ? "🌞 ライト" : "🌙 ダーク"}
        </button>
      </div>

      {/* ゴルフ場名 */}
      <input
        type="text"
        value={golfCourseName}
        onChange={(e) => setGolfCourseName(e.target.value)}
        placeholder="ゴルフ場名を入力"
        className="border px-3 py-2 rounded w-full sm:w-96 mb-4 dark:bg-gray-800 dark:border-gray-600"
      />

      {/* 集計 */}
      <div className="flex flex-wrap justify-center items-center gap-3 bg-white/70 dark:bg-gray-800 px-3 py-2 rounded-lg shadow w-full max-w-md mx-auto text-sm text-center mb-4">
        <div>前半 Par:{outTotal.par}　Score:{outTotal.score}</div>
        <div>後半 Par:{inTotal.par}　Score:{inTotal.score}</div>
        <div className="font-bold">Total:{totalScore}</div>
      </div>

      {/* 平均データ */}
      <div className="text-xs sm:text-sm mb-4 text-gray-700 dark:text-gray-300">
        <p>
          前半 平均パット: {outTotal.avgPutt}　FW率: {outTotal.fairwayRate}%　
          ／ 後半 平均パット: {inTotal.avgPutt}　FW率: {inTotal.fairwayRate}%
        </p>
      </div>

      {/* テーブル */}
      <div className="w-full overflow-x-auto max-w-4xl">
        <table className="w-full text-xs sm:text-sm text-center border-collapse dark:border-gray-700">
          <thead>
            <tr>
              <th>Hole</th>
              <th>Par</th>
              <th>スコア</th>
              <th>パット</th>
              <th>ティー</th>
              <th>±</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((h, i) => {
              const diff =
                h.par && h.score ? diffToSymbol(h.score - h.par) : "";
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <select
                      value={h.par}
                      onChange={(e) =>
                        handleChange(i, "par", e.target.value)
                      }
                      className="border rounded dark:bg-gray-800"
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
                      className="w-10 border rounded text-center dark:bg-gray-800"
                    />
                  </td>
                  <td>
                    <select
                      value={h.teeShot}
                      onChange={(e) =>
                        handleChange(i, "teeShot", e.target.value)
                      }
                      className="border rounded dark:bg-gray-800"
                    >
                      <option>-</option>
                      <option>フェアウェイ</option>
                      <option>右ラフ</option>
                      <option>左ラフ</option>
                      <option>OB</option>
                    </select>
                  </td>
                  <td>{diff}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ボタン群 */}
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

      {/* 履歴一覧 */}
      <div className="w-full max-w-3xl mt-6">
        <h2 className="text-lg font-bold mb-2">📜 スコア履歴</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-600">まだ保存されたラウンドはありません。</p>
        ) : (
          <ul className="text-sm">
            {history.map((h) => (
              <li
                key={h.id}
                className="border-b py-2 flex justify-between items-center dark:border-gray-700"
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
