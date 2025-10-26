import React, { useState, useEffect } from "react";

const initialHoles = Array(9).fill({
  par: "",
  score: "",
  putt: "",
  tee: "-",
  distance: "",
});

export default function App() {
  const [outCourseName, setOutCourseName] = useState("OUT");
  const [inCourseName, setInCourseName] = useState("IN");
  const [outHoles, setOutHoles] = useState([...initialHoles]);
  const [inHoles, setInHoles] = useState([...initialHoles]);

  // ローカル保存の復元
  useEffect(() => {
    const saved = localStorage.getItem("golfScoreData");
    if (saved) {
      const data = JSON.parse(saved);
      setOutCourseName(data.outCourseName || "OUT");
      setInCourseName(data.inCourseName || "IN");
      setOutHoles(data.outHoles || [...initialHoles]);
      setInHoles(data.inHoles || [...initialHoles]);
    }
  }, []);

  // 自動保存
  useEffect(() => {
    localStorage.setItem(
      "golfScoreData",
      JSON.stringify({ outCourseName, inCourseName, outHoles, inHoles })
    );
  }, [outCourseName, inCourseName, outHoles, inHoles]);

  const handleChange = (setHoles, holes, index, field, value) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const calculateDiffSymbol = (par, score) => {
    if (!par || !score) return "";
    const diff = score - par;
    if (diff === -3) return "☆";
    if (diff === -2) return "◎";
    if (diff === -1) return "◯";
    if (diff === 0) return "ー";
    if (diff === 1) return "△";
    if (diff === 2) return "□";
    if (diff >= 3) return `+${diff}`;
    return diff;
  };

  const calcTotal = (holes) => {
    const total = holes.reduce(
      (acc, h) => {
        const par = parseInt(h.par) || 0;
        const score = parseInt(h.score) || 0;
        return {
          par: acc.par + par,
          score: acc.score + score,
        };
      },
      { par: 0, score: 0 }
    );
    return total;
  };

  const calcPutt = (holes) =>
    holes.reduce((sum, h) => sum + (parseInt(h.putt) || 0), 0);

  const calcAvgDistance = (holes) => {
    const values = holes
      .map((h) => parseInt(h.distance))
      .filter((v) => !isNaN(v) && v > 0);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const outTotal = calcTotal(outHoles);
  const inTotal = calcTotal(inHoles);
  const totalScore = outTotal.score + inTotal.score;
  const totalPar = outTotal.par + inTotal.par;

  const resetAll = () => {
    setOutHoles([...initialHoles]);
    setInHoles([...initialHoles]);
    setOutCourseName("OUT");
    setInCourseName("IN");
    localStorage.removeItem("golfScoreData");
  };

  const renderHoleInputs = (holes, setHoles) => (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-[850px] sm:min-w-full">
        <table className="w-full text-sm text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2">項目</th>
              {holes.map((_, i) => (
                <th key={i} className="text-green-700">
                  H{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Par</td>
              {holes.map((hole, i) => (
                <td key={i}>
                  <select
                    value={hole.par}
                    onChange={(e) =>
                      handleChange(setHoles, holes, i, "par", e.target.value)
                    }
                    className="w-14 p-1 border rounded"
                  >
                    <option value=""></option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>スコア</td>
              {holes.map((hole, i) => (
                <td key={i}>
                  <input
                    type="number"
                    value={hole.score}
                    onChange={(e) =>
                      handleChange(setHoles, holes, i, "score", e.target.value)
                    }
                    className="w-14 p-1 border rounded text-center"
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td>パット数</td>
              {holes.map((hole, i) => (
                <td key={i}>
                  <input
                    type="number"
                    value={hole.putt}
                    onChange={(e) =>
                      handleChange(setHoles, holes, i, "putt", e.target.value)
                    }
                    className="w-14 p-1 border rounded text-center"
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td>±差</td>
              {holes.map((hole, i) => (
                <td key={i}>
                  {calculateDiffSymbol(parseInt(hole.par), parseInt(hole.score))}
                </td>
              ))}
            </tr>
            <tr>
              <td>ティーショット</td>
              {holes.map((hole, i) => (
                <td key={i}>
                  {hole.par === "3" ? (
                    <select
                      value={hole.tee}
                      onChange={(e) =>
                        handleChange(setHoles, holes, i, "tee", e.target.value)
                      }
                      className="w-20 p-1 border rounded"
                    >
                      <option>-</option>
                      <option>グリーンオン</option>
                      <option>右</option>
                      <option>左</option>
                      <option>奥</option>
                      <option>手前</option>
                      <option>OB</option>
                    </select>
                  ) : (
                    <select
                      value={hole.tee}
                      onChange={(e) =>
                        handleChange(setHoles, holes, i, "tee", e.target.value)
                      }
                      className="w-20 p-1 border rounded"
                    >
                      <option>-</option>
                      <option>フェアウェイ</option>
                      <option>右ラフ</option>
                      <option>左ラフ</option>
                      <option>OB</option>
                    </select>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td>ドライバー飛距(yd)</td>
              {holes.map((hole, i) => (
                <td key={i}>
                  {hole.par !== "3" ? (
                    <input
                      type="number"
                      value={hole.distance}
                      onChange={(e) =>
                        handleChange(setHoles, holes, i, "distance", e.target.value)
                      }
                      className="w-14 p-1 border rounded text-center"
                    />
                  ) : (
                    <span>-</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 text-green-900 flex flex-col items-center px-3 py-6 sm:px-8 sm:py-10 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
        🏌️‍♂️ Golf Score Card
      </h1>

     {/* ✅ スマホ対応済み 集計バー */}
<div className="flex flex-wrap justify-center items-center gap-3 bg-white/70 px-4 py-2 rounded-lg shadow-md w-full max-w-md mx-auto text-sm sm:text-base text-center">
  <div>前半 Par:{outTotal.par}　Score:{outTotal.score}</div>
  <div>後半 Par:{inTotal.par}　Score:{inTotal.score}</div>
  <div className="font-bold">Total:{totalScore}</div>
</div>


      {/* 前半 */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-green-800">
            前半（1〜9）
          </h2>
          <input
            value={outCourseName}
            onChange={(e) => setOutCourseName(e.target.value)}
            placeholder="コース名（例：OUT）"
            className="border rounded px-2 py-1 text-center"
          />
        </div>
        {renderHoleInputs(outHoles, setOutHoles)}
      </div>

      {/* 後半 */}
      <div className="w-full max-w-5xl mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-green-800">
            後半（10〜18）
          </h2>
          <input
            value={inCourseName}
            onChange={(e) => setInCourseName(e.target.value)}
            placeholder="コース名（例：IN）"
            className="border rounded px-2 py-1 text-center"
          />
        </div>
        {renderHoleInputs(inHoles, setInHoles)}
      </div>

      {/* 凡例 */}
      <div className="text-xs text-gray-700 mb-3">
        ☆(-3) ◎(-2) ◯(-1) ー(0) △(+1) □(+2) +3〜(オーバー)
      </div>

      <button
        onClick={resetAll}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        リセット
      </button>
    </div>
  );
}
