import { useState, useEffect } from "react";

function App() {
  const HOLE_COUNT = 18;
  const [courseNames, setCourseNames] = useState(["", ""]);

  const [scores, setScores] = useState(Array(HOLE_COUNT).fill(""));
  const [pars, setPars] = useState(Array(HOLE_COUNT).fill(""));
  const [putts, setPutts] = useState(Array(HOLE_COUNT).fill(""));
  const [teeShots, setTeeShots] = useState(Array(HOLE_COUNT).fill(""));
  const [distances, setDistances] = useState(Array(HOLE_COUNT).fill(""));

  useEffect(() => {
    const saved = localStorage.getItem("golfScoreData");
    if (saved) {
      const d = JSON.parse(saved);
      setCourseNames(d.courseNames || ["", ""]);
      setScores(d.scores || Array(HOLE_COUNT).fill(""));
      setPars(d.pars || Array(HOLE_COUNT).fill(""));
      setPutts(d.putts || Array(HOLE_COUNT).fill(""));
      setTeeShots(d.teeShots || Array(HOLE_COUNT).fill(""));
      setDistances(d.distances || Array(HOLE_COUNT).fill(""));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "golfScoreData",
      JSON.stringify({ courseNames, scores, pars, putts, teeShots, distances })
    );
  }, [courseNames, scores, pars, putts, teeShots, distances]);

  const handleChange = (setter, index, value) => {
    setter((prev) => {
      const a = [...prev];
      a[index] = value;
      return a;
    });
  };

  const diffSymbol = (s, p) => {
    if (!s || !p) return "";
    const d = s - p;
    if (d <= -3) return "☆";
    if (d === -2) return "◎";
    if (d === -1) return "◯";
    if (d === 0) return "ー";
    if (d === 1) return "△";
    if (d === 2) return "□";
    return `+${d}`;
  };
  const diffColor = (s, p) => {
    if (!s || !p) return "text-gray-600";
    const d = s - p;
    if (d < 0) return "text-green-600 font-bold";
    if (d > 0) return "text-red-600 font-bold";
    return "text-gray-800 font-semibold";
  };

  const calcSum = (a) => a.reduce((x, y) => x + (parseInt(y) || 0), 0);
  const calcAvg = (a) => {
    const f = a.filter((x) => x !== "");
    return f.length ? Math.round(f.reduce((x, y) => x + parseInt(y), 0) / f.length) : 0;
  };

  const resetAll = () => {
    const b = Array(HOLE_COUNT).fill("");
    setCourseNames(["", ""]);
    setScores(b);
    setPars(b);
    setPutts(b);
    setTeeShots(b);
    setDistances(b);
    localStorage.removeItem("golfScoreData");
  };

  const sum = (s, e) => ({
    par: calcSum(pars.slice(s, e)),
    score: calcSum(scores.slice(s, e)),
    putt: calcSum(putts.slice(s, e)),
    avg: calcAvg(distances.slice(s, e)),
  });

  const sumOut = sum(0, 9);
  const sumIn = sum(9, 18);

  const renderHalf = (start, end, label, idx) => (
    <div className="w-full flex flex-col items-center mb-10">
      {/* コース名 */}
      <div className="flex items-center mb-3 flex-wrap justify-center">
        <h2 className="text-lg font-semibold text-green-800 mr-2">{label}</h2>
        <input
          type="text"
          placeholder="コース名（例：OUT）"
          className="border rounded px-2 py-1 text-sm w-36 text-center"
          value={courseNames[idx]}
          onChange={(e) => handleChange(setCourseNames, idx, e.target.value)}
        />
      </div>

      {/* スマホ対応：横スクロール */}
      <div className="flex overflow-x-auto sm:overflow-visible">
        <div className="flex flex-col sm:flex-row justify-center items-start">
          {/* 左ラベル */}
          <div className="flex flex-col items-end pr-2 text-[12px] sm:text-[13px] text-gray-700 font-semibold">
            <div className="score-cell">ホール</div>
            <div className="score-cell">Par</div>
            <div className="score-cell">スコア</div>
            <div className="score-cell">パット</div>
            <div className="score-cell">±差</div>
            <div className="score-cell">ティーショット</div>
            <div className="score-cell">ドライバー</div>
          </div>

          {/* 入力欄 */}
          <div className="flex sm:grid sm:grid-cols-9 gap-2 sm:gap-[6px]">
            {scores.slice(start, end).map((_, i) => {
              const n = start + i;
              const p = parseInt(pars[n]);
              const teeOpt =
                p === 3
                  ? ["-", "グリーンオン", "右", "左", "奥", "手前", "OB"]
                  : ["-", "フェアウェイ", "右ラフ", "左ラフ", "OB"];
              return (
                <div
                  key={n}
                  className="flex flex-col items-center bg-white p-[3px] rounded shadow-sm min-w-[70px]"
                >
                  <div className="score-cell font-semibold text-green-700">
                    H{n + 1}
                  </div>
                  <select
                    className="w-16 border rounded text-center text-sm"
                    value={pars[n]}
                    onChange={(e) => handleChange(setPars, n, e.target.value)}
                  >
                    <option value="">-</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>

                  <input
                    type="number"
                    className="w-16 border rounded text-center text-sm"
                    value={scores[n]}
                    onChange={(e) => handleChange(setScores, n, e.target.value)}
                    placeholder="Score"
                  />
                  <input
                    type="number"
                    className="w-16 border rounded text-center text-sm"
                    value={putts[n]}
                    onChange={(e) => handleChange(setPutts, n, e.target.value)}
                    placeholder="Putt"
                  />
                  <div className={`score-cell border rounded ${diffColor(scores[n], p)}`}>
                    {diffSymbol(scores[n], p)}
                  </div>
                  <select
                    className="w-20 border rounded text-center text-sm"
                    value={teeShots[n]}
                    onChange={(e) => handleChange(setTeeShots, n, e.target.value)}
                  >
                    {teeOpt.map((t) => (
                      <option key={t} value={t === "-" ? "" : t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {p !== 3 ? (
                    <input
                      type="number"
                      className="w-20 border rounded text-center text-sm"
                      value={distances[n]}
                      onChange={(e) => handleChange(setDistances, n, e.target.value)}
                      placeholder="yd"
                    />
                  ) : (
                    <div className="w-20 text-gray-400 text-sm text-center">-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-green-700">
        🏌️ Golf Score Card
      </h1>

      <div className="flex justify-center flex-wrap gap-3 mb-6 bg-white shadow-sm rounded-lg px-4 py-3 text-sm sm:text-base">
        <div>前半 Par:{sumOut.par}</div>
        <div>Score:{sumOut.score}</div>
        <div>後半 Par:{sumIn.par}</div>
        <div>Score:{sumIn.score}</div>
        <div className="font-semibold">Total:{sumOut.score + sumIn.score}</div>
      </div>

      {renderHalf(0, 9, "前半（1〜9）", 0)}
      {renderHalf(9, 18, "後半（10〜18）", 1)}

      <button
        onClick={resetAll}
        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 mt-2 mb-6 text-sm sm:text-base"
      >
        リセット
      </button>

      {/* 凡例 */}
      <div className="bg-white shadow-sm rounded-lg p-3 text-xs sm:text-sm text-gray-700 flex flex-wrap justify-center gap-2 sm:gap-4 max-w-lg text-center">
        <div><span className="text-green-700 font-bold">☆</span>：−3以下</div>
        <div><span className="text-green-700 font-bold">◎</span>：−2</div>
        <div><span className="text-green-700 font-bold">◯</span>：−1</div>
        <div><span className="text-gray-800 font-semibold">ー</span>：±0</div>
        <div><span className="text-red-600 font-bold">△</span>：＋1</div>
        <div><span className="text-red-600 font-bold">□</span>：＋2</div>
        <div><span className="text-red-600 font-bold">+3</span>：＋3以上</div>
      </div>
    </div>
  );
}

export default App;
