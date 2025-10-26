import { useState, useEffect } from "react";

const holeCount = 18;

const initialData = Array.from({ length: holeCount }, () => ({
  par: "",
  score: "",
  putt: "",
  diff: "",
  teeShot: "-",
  drive: "",
}));

const diffToSymbol = (diff) => {
  const num = Number(diff);
  if (isNaN(num)) return "";
  if (num <= -3) return "☆";
  if (num === -2) return "◎";
  if (num === -1) return "◯";
  if (num === 0) return "ー";
  if (num === 1) return "△";
  if (num === 2) return "□";
  return `+${num}`;
};

const App = () => {
  const [scores, setScores] = useState(initialData);
  const [courseNames, setCourseNames] = useState({ out: "OUT", in: "IN" });
  const [golfCourseName, setGolfCourseName] = useState("");
  const [online, setOnline] = useState(navigator.onLine);

  // ✅ オンライン／オフライン監視
  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // ✅ ローカル保存・復元
  useEffect(() => {
    const saved = localStorage.getItem("golfScores");
    if (saved) {
      const parsed = JSON.parse(saved);
      setScores(parsed.scores || initialData);
      setCourseNames(parsed.courseNames || { out: "OUT", in: "IN" });
      setGolfCourseName(parsed.golfCourseName || "");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "golfScores",
      JSON.stringify({ scores, courseNames, golfCourseName })
    );
  }, [scores, courseNames, golfCourseName]);

  const handleChange = (index, key, value) => {
    const updated = [...scores];
    updated[index][key] = value;

    // ±差自動計算
    const par = parseInt(updated[index].par);
    const score = parseInt(updated[index].score);
    if (!isNaN(par) && !isNaN(score)) {
      const diff = score - par;
      updated[index].diff = diffToSymbol(diff);
    } else {
      updated[index].diff = "";
    }

    setScores(updated);
  };

  const resetAll = () => {
    setScores(initialData);
    setGolfCourseName("");
    localStorage.removeItem("golfScores");
  };

  const total = (start, end) => {
    const slice = scores.slice(start, end);
    const par = slice.reduce((acc, cur) => acc + (parseInt(cur.par) || 0), 0);
    const score = slice.reduce((acc, cur) => acc + (parseInt(cur.score) || 0), 0);
    const putt = slice.reduce((acc, cur) => acc + (parseInt(cur.putt) || 0), 0);
    return { par, score, putt };
  };

  const outTotal = total(0, 9);
  const inTotal = total(9, 18);
  const totalScore = outTotal.score + inTotal.score;

  const renderHoleInputs = (start, end) => (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-3 sm:p-5 mb-6">
      <div className="min-w-[900px] sm:min-w-full mx-auto flex justify-center">
        <table className="w-full text-xs sm:text-sm text-center border border-green-200 rounded-lg overflow-hidden table-fixed shadow-sm">
          <thead>
            <tr>
              <th className="px-1 bg-green-100 text-green-800 font-semibold">
                ホール
              </th>
              {Array.from({ length: end - start }, (_, i) => (
                <th key={i} className="bg-green-50">{`H${start + i + 1}`}</th>
              ))}
              <th className="bg-green-100 font-bold sticky right-0">合計</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold text-green-700">Par</td>
              {scores.slice(start, end).map((hole, i) => (
                <td key={i}>
                  <select
                    value={hole.par}
                    onChange={(e) => handleChange(start + i, "par", e.target.value)}
                    className="border border-green-200 rounded-md w-14 sm:w-16 text-center py-1 shadow-inner"
                  >
                    <option value="">Par</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </td>
              ))}
              <td className="bg-green-50 font-bold sticky right-0">
                {total(start, end).par}
              </td>
            </tr>

            <tr>
              <td className="font-semibold text-green-700">スコア</td>
              {scores.slice(start, end).map((hole, i) => (
                <td key={i}>
                  <input
                    type="number"
                    value={hole.score}
                    onChange={(e) =>
                      handleChange(start + i, "score", e.target.value)
                    }
                    className="border border-green-200 rounded-md w-14 sm:w-16 text-center py-1 shadow-inner"
                    placeholder="Score"
                  />
                </td>
              ))}
              <td className="bg-green-50 font-bold sticky right-0">
                {total(start, end).score}
              </td>
            </tr>

            <tr>
              <td className="font-semibold text-green-700">パット数</td>
              {scores.slice(start, end).map((hole, i) => (
                <td key={i}>
                  <input
                    type="number"
                    value={hole.putt}
                    onChange={(e) =>
                      handleChange(start + i, "putt", e.target.value)
                    }
                    className="border border-green-200 rounded-md w-14 sm:w-16 text-center py-1 shadow-inner"
                    placeholder="Putt"
                  />
                </td>
              ))}
              <td className="bg-green-50 font-bold sticky right-0">
                {total(start, end).putt}
              </td>
            </tr>

            <tr>
              <td className="font-semibold text-green-700">±差</td>
              {scores.slice(start, end).map((hole, i) => (
                <td key={i} className="font-bold">
                  {hole.diff}
                </td>
              ))}
              <td className="bg-green-50 sticky right-0">-</td>
            </tr>

            <tr>
              <td className="font-semibold text-green-700">ティーショット</td>
              {scores.slice(start, end).map((hole, i) => (
                <td key={i}>
                  {hole.par === "3" ? (
                    <select
                      value={hole.teeShot}
                      onChange={(e) =>
                        handleChange(start + i, "teeShot", e.target.value)
                      }
                      className="border border-green-200 rounded-md w-20 sm:w-24 text-center py-1 shadow-inner"
                    >
                      <option value="-">-</option>
                      <option value="グリーンオン">グリーンオン</option>
                      <option value="右">右</option>
                      <option value="左">左</option>
                      <option value="奥">奥</option>
                      <option value="手前">手前</option>
                      <option value="OB">OB</option>
                    </select>
                  ) : (
                    <select
                      value={hole.teeShot}
                      onChange={(e) =>
                        handleChange(start + i, "teeShot", e.target.value)
                      }
                      className="border border-green-200 rounded-md w-16 text-center py-1 shadow-inner"
                    >
                      <option value="-">-</option>
                      <option value="◯">◯</option>
                      <option value="×">×</option>
                    </select>
                  )}
                </td>
              ))}
              <td className="bg-green-50 sticky right-0">-</td>
            </tr>

            <tr>
              <td className="font-semibold text-green-700">ドライバー(yd)</td>
              {scores.slice(start, end).map((hole, i) =>
                hole.par !== "3" ? (
                  <td key={i}>
                    <input
                      type="number"
                      value={hole.drive}
                      onChange={(e) =>
                        handleChange(start + i, "drive", e.target.value)
                      }
                      className="border border-green-200 rounded-md w-14 sm:w-16 text-center py-1 shadow-inner"
                      placeholder="yd"
                    />
                  </td>
                ) : (
                  <td key={i}>-</td>
                )
              )}
              <td className="bg-green-50 sticky right-0 font-bold">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 text-green-900 flex flex-col items-center px-3 sm:px-6 py-6 sm:py-10 max-w-[1200px] mx-auto overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">🏌️‍♂️ Golf Score Card</h1>

      {!online && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-2 text-sm font-medium shadow-sm">
          ⚠️ 現在オフラインモードです（データは自動保存されます）
        </div>
      )}

      <input
        type="text"
        value={golfCourseName}
        onChange={(e) => setGolfCourseName(e.target.value)}
        placeholder="ゴルフ場名を入力（例：姉ヶ崎カントリー倶楽部）"
        className="border border-green-200 rounded-lg px-3 py-2 w-full sm:w-96 text-center mb-5 shadow-sm"
      />

      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 bg-white/80 px-4 py-3 rounded-lg shadow-md w-full max-w-md mx-auto text-xs sm:text-base text-center mb-6">
        <div>前半 Par:{outTotal.par}　Score:{outTotal.score}</div>
        <div>後半 Par:{inTotal.par}　Score:{inTotal.score}</div>
        <div className="font-bold text-green-800">Total:{totalScore}</div>
      </div>

      <Section title="前半（1〜9）" value={courseNames.out} setValue={(val) => setCourseNames({ ...courseNames, out: val })} />
      {renderHoleInputs(0, 9)}

      <Section title="後半（10〜18）" value={courseNames.in} setValue={(val) => setCourseNames({ ...courseNames, in: val })} />
      {renderHoleInputs(9, 18)}

      <button
        onClick={resetAll}
        className="bg-gradient-to-r from-green-600 to-lime-500 hover:opacity-90 text-white font-bold py-2 px-8 rounded-full shadow-lg mt-8 transition"
      >
        リセット
      </button>

      <div className="text-[11px] text-gray-500 mt-5 mb-10 tracking-wide italic">
        ☆＝-3　◎＝-2　◯＝-1　ー＝±0　△＝+1　□＝+2　+3〜＝+3以上
      </div>
    </div>
  );
};

const Section = ({ title, value, setValue }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 mb-3 w-full max-w-md mx-auto">
    <h2 className="text-lg sm:text-xl font-bold text-green-800">{title}</h2>
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="コース名（例：OUT）"
      className="border border-green-200 rounded px-2 py-1 w-40 text-center shadow-sm"
    />
  </div>
);

export default App;
