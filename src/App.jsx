import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

export default function App() {
  const [scores, setScores] = useState(
    Array(18).fill({
      par: "",
      score: "",
      putt: "",
      teeShot: "-",
      drive: "",
    })
  );
  const [viewMode, setViewMode] = useState("horizontal");
  const [theme, setTheme] = useState("light");
  const [courseName, setCourseName] = useState("");
  const [history, setHistory] = useState([]);
  const captureRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("golfScores");
    if (saved) setScores(JSON.parse(saved));
    const savedHistory = localStorage.getItem("golfHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem("golfScores", JSON.stringify(scores));
  }, [scores]);

  const handleChange = (i, field, value) => {
    const newScores = [...scores];
    newScores[i][field] = value;
    setScores(newScores);
  };

  const handleReset = () => {
    if (window.confirm("スコアをリセットしますか？")) {
      setScores(
        Array(18).fill({
          par: "",
          score: "",
          putt: "",
          teeShot: "-",
          drive: "",
        })
      );
    }
  };

  const diffToSymbol = (diff) => {
    if (diff <= -3) return "☆";
    if (diff === -2) return "◎";
    if (diff === -1) return "◯";
    if (diff === 0) return "ー";
    if (diff === 1) return "△";
    if (diff === 2) return "□";
    if (diff >= 3) return `+${diff}`;
    return "";
  };

  const getStats = (start, end) => {
    const segment = scores.slice(start, end);
    const validScores = segment.filter((s) => s.score && s.par);
    const parSum = validScores.reduce((acc, s) => acc + parseInt(s.par), 0);
    const scoreSum = validScores.reduce(
      (acc, s) => acc + parseInt(s.score),
      0
    );
    const puttSum = validScores.reduce(
      (acc, s) => acc + parseInt(s.putt || 0),
      0
    );
    const drives = segment
      .map((s) => parseInt(s.drive))
      .filter((n) => !isNaN(n));
    const avgDrive =
      drives.length > 0
        ? Math.round(drives.reduce((a, b) => a + b, 0) / drives.length)
        : 0;
    const avgPutt =
      validScores.length > 0
        ? (puttSum / validScores.length).toFixed(1)
        : 0;

    return {
      par: parSum,
      score: scoreSum,
      avgDrive,
      avgPutt,
    };
  };

  const outStats = getStats(0, 9);
  const inStats = getStats(9, 18);
  const totalScore = outStats.score + inStats.score;
  const avgDriveTotal =
    Math.round((outStats.avgDrive + inStats.avgDrive) / 2) || 0;

  const handleSave = () => {
    const newHistory = [
      {
        id: Date.now(),
        course: courseName || "未入力",
        date: new Date().toLocaleDateString("ja-JP"),
        total: totalScore,
      },
      ...history,
    ];
    setHistory(newHistory);
    localStorage.setItem("golfHistory", JSON.stringify(newHistory));
    alert("スコアを保存しました！");
  };

  const handleCapture = async () => {
    if (!captureRef.current) return;
    const avgPuttTotal =
      ((parseFloat(outStats.avgPutt) + parseFloat(inStats.avgPutt)) / 2).toFixed(
        1
      );

    const header = document.createElement("div");
    header.style.textAlign = "center";
    header.style.marginBottom = "16px";
    header.style.color = theme === "dark" ? "#F5E6CC" : "#222";
    header.innerHTML = `
      <div style="font-size:18px;font-weight:bold;">🏌️‍♂️ ${
        courseName || "未入力コース"
      }</div>
      <div style="font-size:14px;">${new Date().toLocaleDateString("ja-JP")}</div>
      <div style="font-size:14px;margin-top:4px;">
        Total: <b>${totalScore}</b>（OUT ${outStats.score} / IN ${
      inStats.score
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
      courseName || "scorecard"
    }_${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  };

  const bg = theme === "dark" ? "bg-[#3B3024] text-[#F5E6CC]" : "bg-green-50";
  const bgCard =
    theme === "dark" ? "bg-[#5A4736] text-[#F5E6CC]" : "bg-white";
  const borderStyle =
    theme === "dark" ? "border-[#A67C52]" : "border-green-200";

  return (
    <div className={`min-h-screen ${bg} p-4`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🏌️‍♂️ Golf Score Card</h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setViewMode(viewMode === "vertical" ? "horizontal" : "vertical")
            }
            className={`px-2 py-1 rounded border ${borderStyle}`}
          >
            {viewMode === "vertical" ? "横表示に切替" : "縦表示に切替"}
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`px-2 py-1 rounded border ${borderStyle}`}
          >
            {theme === "dark" ? "☀️ ライト" : "🌙 ダーク"}
          </button>
        </div>
      </div>

      <div ref={captureRef} className="w-full flex flex-col items-center">
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="ゴルフ場名を入力"
          className={`w-full max-w-md p-2 mb-3 text-center rounded border ${borderStyle}`}
        />

        <p className="font-semibold">
          前半 Par:{outStats.par} Score:{outStats.score} ／ 後半 Par:
          {inStats.par} Score:{inStats.score} ／ Total:
          <span className="text-green-700 dark:text-[#F5E6CC] font-bold">
            {totalScore}
          </span>
        </p>

        <p className="text-sm mt-1">
          平均飛距離: {avgDriveTotal}yd ／ 平均パット:
          {(
            (parseFloat(outStats.avgPutt) + parseFloat(inStats.avgPutt)) /
            2
          ).toFixed(1)}
        </p>

        {/* 🔹 スコアテーブル（縦 or 横） */}
        {viewMode === "vertical" ? (
          <VerticalTable
            scores={scores}
            handleChange={handleChange}
            diffToSymbol={diffToSymbol}
            bgCard={bgCard}
            borderStyle={borderStyle}
          />
        ) : (
          <HorizontalTable
            scores={scores}
            handleChange={handleChange}
            diffToSymbol={diffToSymbol}
            bgCard={bgCard}
            borderStyle={borderStyle}
          />
        )}
      </div>

      <div className="mt-4 flex gap-2 justify-center">
        <button
          onClick={handleSave}
          className="bg-green-700 text-white px-4 py-2 rounded"
        >
          💾 保存
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          リセット
        </button>
        <button
          onClick={handleCapture}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          📸 スコア画像を保存
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">📜 スコア履歴</h2>
        {history.length === 0 ? (
          <p>まだ保存されたラウンドはありません。</p>
        ) : (
          <ul className="text-sm space-y-2">
            {history.map((h) => (
              <li key={h.id} className={`p-2 rounded ${bgCard}`}>
                🏌️‍♂️ {h.course}（{h.date}） - Total: {h.total}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- 縦表示テーブル ----------
const VerticalTable = ({
  scores,
  handleChange,
  diffToSymbol,
  bgCard,
  borderStyle,
}) => (
  <table className={`border-collapse w-full max-w-4xl text-sm ${borderStyle}`}>
    <thead>
      <tr className="bg-green-100 text-green-800">
        <th>Hole</th>
        <th>Par</th>
        <th>Score</th>
        <th>Putt</th>
        <th>±差</th>
        <th>Tee Shot</th>
        <th>Drive</th>
      </tr>
    </thead>
    <tbody>
      {scores.map((s, i) => {
        const diff =
          s.score && s.par ? parseInt(s.score) - parseInt(s.par) : "";
        const symbol = diffToSymbol(diff);
        const diffColor =
          diff < 0
            ? "text-blue-500"
            : diff > 0
            ? "text-red-500"
            : "text-gray-600";
        const isPar3 = s.par === "3";

        return (
          <tr key={i} className={`${bgCard}`}>
            <td className="text-center font-semibold">H{i + 1}</td>
            <td>
              <select
                value={s.par}
                onChange={(e) => handleChange(i, "par", e.target.value)}
                className={`w-full text-center rounded border ${borderStyle}`}
              >
                <option value="">-</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </td>
            <td>
              <NumberInput
                index={i}
                field="score"
                value={s.score}
                handleChange={handleChange}
                borderStyle={borderStyle}
              />
            </td>
            <td>
              <NumberInput
                index={i}
                field="putt"
                value={s.putt}
                handleChange={handleChange}
                borderStyle={borderStyle}
              />
            </td>
            <td className={`text-center ${diffColor}`}>{symbol}</td>
            <td>
              <select
                value={s.teeShot}
                onChange={(e) => handleChange(i, "teeShot", e.target.value)}
                className={`w-full text-center rounded border ${borderStyle}`}
              >
                <option value="-">-</option>
                {isPar3 ? (
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
            </td>
            <td>
              {!isPar3 && (
                <input
                  type="number"
                  value={s.drive}
                  onChange={(e) =>
                    handleChange(i, "drive", e.target.value)
                  }
                  className={`w-20 text-center border rounded ${borderStyle}`}
                  placeholder="yd"
                />
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// ---------- 横表示 ----------
const HorizontalTable = ({
  scores,
  handleChange,
  diffToSymbol,
  bgCard,
  borderStyle,
}) => (
  <>
    {["前半（1〜9）", "後半（10〜18）"].map((label, idx) => (
      <div key={idx} className="w-full mb-6">
        <h2 className="text-lg font-bold mb-2">{label}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {scores.slice(idx * 9, idx * 9 + 9).map((s, i) => {
            const index = idx * 9 + i;
            const diff =
              s.score && s.par ? parseInt(s.score) - parseInt(s.par) : "";
            const symbol = diffToSymbol(diff);
            const diffColor =
              diff < 0
                ? "text-blue-500"
                : diff > 0
                ? "text-red-500"
                : "text-gray-600";
            const isPar3 = s.par === "3";

            return (
              <div
                key={index}
                className={`flex flex-col items-center p-2 rounded shadow ${bgCard}`}
              >
                <div className="font-bold text-green-700">H{index + 1}</div>
                <select
                  value={s.par}
                  onChange={(e) =>
                    handleChange(index, "par", e.target.value)
                  }
                  className={`w-14 text-center rounded border ${borderStyle}`}
                >
                  <option value="">-</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <NumberInput
                  index={index}
                  field="score"
                  value={s.score}
                  handleChange={handleChange}
                  borderStyle={borderStyle}
                />
                <NumberInput
                  index={index}
                  field="putt"
                  value={s.putt}
                  handleChange={handleChange}
                  borderStyle={borderStyle}
                />
                <div className={`text-sm ${diffColor}`}>{symbol}</div>
                <select
                  value={s.teeShot}
                  onChange={(e) =>
                    handleChange(index, "teeShot", e.target.value)
                  }
                  className={`w-20 text-center rounded border ${borderStyle}`}
                >
                  <option value="-">-</option>
                  {isPar3 ? (
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
                {!isPar3 && (
                  <input
                    type="number"
                    value={s.drive}
                    onChange={(e) =>
                      handleChange(index, "drive", e.target.value)
                    }
                    className={`w-20 text-center border rounded ${borderStyle}`}
                    placeholder="yd"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </>
);

// ---------- 数値入力コンポーネント（±ボタン付き） ----------
const NumberInput = ({ index, field, value, handleChange, borderStyle }) => {
  const inc = () =>
    handleChange(index, field, parseInt(value || 0) + 1);
  const dec = () =>
    handleChange(index, field, Math.max(0, parseInt(value || 0) - 1));

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={dec}
        className={`px-2 py-1 rounded border ${borderStyle}`}
      >
        －
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(index, field, e.target.value)}
        className={`w-12 text-center border rounded ${borderStyle}`}
      />
      <button
        onClick={inc}
        className={`px-2 py-1 rounded border ${borderStyle}`}
      >
        ＋
      </button>
    </div>
  );
};
