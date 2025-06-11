import React, { useEffect, useState, forwardRef } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";
import { CgPlayStop } from "react-icons/cg";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import ko from "date-fns/locale/ko";
import {
  format as formatDate,
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isAfter,
  isSameDay,
} from "date-fns";
import AlertModal from "../../AlertModal.jsx";

function UserRecord() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [baseDate, setBaseDate] = useState(today);
  const [isMobile, setIsMobile] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [rows, setRows] = useState([]);

  const [datesWithData, setDatesWithData] = useState([]);

  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (message) => {
    setAlertInfo({
      show: true,
      message,
      onConfirm: () => setAlertInfo({ ...alertInfo, show: false }),
      onCancel: null,
    });
  };

  useEffect(() => {
    /* 사용자 오늘의 시수 */
    getMemberScore(startDate);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind 기준 'md'
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [startDate]);

  const weekStart = startOfWeek(baseDate, { locale: ko, weekStartsOn: 0 });
  const visibleDays = isMobile ? 7 : 14;
  const weekDates = Array.from({ length: visibleDays }, (_, i) =>
    addDays(weekStart, i)
  );
  // const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  // const visibleWeekdays = Array.from(
  //   { length: visibleDays },
  //   (_, i) => weekdays[i % 7]
  // );

  const getMemberScore = async (startDate) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/user/getMemberScore`,
        {
          id: localStorage.getItem("member_id"),
          date: format(startDate, "yyyy-MM-dd"),
        }
      );

      if (res.data.success) {
        displayScoreTable(res.data.result);
        setDatesWithData(res.data.dateList.map((m) => m.record_date));
      }
    } catch (err) {
      console.error("에러 발생:", err);
    }
  };

  /* 사용자 시수 테이블 적용 */
  const displayScoreTable = (list) => {
    const wrapped = Array.isArray(list) ? list : [list];

    const newRows = wrapped.map((item, idx) => {
      const shots = [
        item.record_1 === 1 ? "中" : "·",
        item.record_2 === 1 ? "中" : "·",
        item.record_3 === 1 ? "中" : "·",
        item.record_4 === 1 ? "中" : "·",
        item.record_5 === 1 ? "中" : "·",
      ];
      return {
        round: `${idx + 1}巡`,
        shots,
        score: `${item.totalscore}中`,
      };
    });
    setRows(newRows);
  };

  const changeDate = (date) => {
    getMemberScore(format(date, "yyyy-MM-dd"));
  };

  /* 행 추가 */
  const addRow = () => {
    setRows((prevRows) => {
      if (prevRows.length === 0) {
        return [
          {
            round: "1巡",
            shots: ["", "", "", "", ""],
            score: "中",
          },
        ];
      }

      const updatedRows = [...prevRows];

      // 마지막 행 가져오기
      const lastRowIdx = updatedRows.length - 1;
      const lastRow = updatedRows[lastRowIdx];

      // 빈칸("")이면 "."으로 바꾸기
      const updatedLastShots = lastRow.shots.map((shot) =>
        shot === "" ? "·" : shot
      );
      const updatedLastScore = updatedLastShots.filter(
        (shot) => shot === "中"
      ).length;

      // 기존 행 업데이트
      updatedRows[lastRowIdx] = {
        ...lastRow,
        shots: updatedLastShots,
        score: updatedLastScore + "中",
      };

      // 새 행 추가
      const newRow = {
        round: `${updatedRows.length + 1}巡`,
        shots: ["", "", "", "", ""],
        score: 0,
      };

      return [...updatedRows, newRow];
    });
  };

  const countTotalHits = (rows) =>
    rows.reduce(
      (sum, row) => sum + row.shots.filter((s) => s === "中").length,
      0
    );

  const totalScore = countTotalHits(rows);
  const totalArrows = rows.length * 5;
  const avgScore = rows.length > 0 ? (totalScore / rows.length).toFixed(2) : 0;

  /* 셀 클릭 시 관중 (中) 표시 (토글) (*/
  const cellClick = (rowIdx, colIdx) => {
    setRows((prevRows) =>
      prevRows.map((row, rIdx) => {
        if (rIdx !== rowIdx) return row;

        const newShots = row.shots.map((val, cIdx) =>
          cIdx === colIdx ? (val === "中" ? "·" : "中") : val
        );

        const newScore = newShots.filter((shot) => shot === "中").length;
        return {
          ...row,
          shots: newShots,
          score: newScore + "中",
        };
      })
    );
  };

  const saveRecord = async () => {
    const data = {
      date: format(startDate, "yyyy-MM-dd"), // 선택한 날짜
      totalScore,
      totalArrows,
      avgScore,
      records: rows.map((row) => ({
        round: row.round.replace("巡", ""),
        shots: row.shots,
        score: row.score.replace("中", ""),
      })),
    };

    if (localStorage.getItem("member_id") === null) {
      showAlert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/user/saveUserRecord`,
        {
          data,
          member_id: localStorage.getItem("member_id"),
        }
      );
      if (res.data.success) {
        showAlert("저장되었습니다.");
        setStartDate(new Date());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="w-30 h-30 border border-gray-600 rounded-md px-3 py-1 text-medium bg-white shadow-sm"
    >
      {value || "날짜 선택"}
    </button>
  ));
  return (
    <div className="w-full min-h-screen overflow-y-auto">
      <div className="w-full overflow-x-hidden py-4 bg-white shadow space-y-4">
        {/* 월 이동 */}
        <div className="flex justify-center items-center gap-4 text-xl font-semibold text-gray-800">
          <button
            onClick={() => setBaseDate((prev) => subWeeks(prev, 4))}
            className="text-gray-600 hover:text-black transition"
          >
            ◀
          </button>
          <div>{formatDate(weekStart, "yyyy년 MM월", { locale: ko })}</div>
          <button
            onClick={() => setBaseDate((prev) => addWeeks(prev, 4))}
            className="text-gray-600 hover:text-black transition"
          >
            ▶
          </button>
        </div>

        {/* 날짜 버튼 */}
        <div className="flex items-center justify-between gap-2">
          {/* 한 주 전 */}
          <button
            onClick={() => setBaseDate((prev) => subWeeks(prev, 1))}
            className="text-xl text-gray-600 hover:text-black px-2"
            title="한 주 전"
          >
            <GrPrevious />
          </button>

          <table className="table-fixed w-full border-separate border-spacing-y-1 text-center">
            <thead>
              <tr className="text-sm">
                {weekDates.map((day, idx) => {
                  const isNow = isSameDay(day, today);
                  const dayOfWeek = formatDate(day, "E", { locale: ko });
                  const weekdayIndex = day.getDay(); // 0 = 일, 6 = 토

                  let colorClass = "text-gray-600";
                  if (weekdayIndex === 0) colorClass = "text-red-500";
                  else if (weekdayIndex === 6) colorClass = "text-blue-500";

                  return (
                    <th
                      key={idx}
                      className={`w-[20px] h-[40px] align-middle font-large ${colorClass}`}
                    >
                      {isNow ? "오늘" : dayOfWeek}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDates.map((day, idx) => {
                  const isDisabled = isAfter(day, today);
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <td key={idx} className="align-middle font-large">
                      <button
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedDate(day);
                            setStartDate(day);
                            changeDate(day);
                          }
                        }}
                        disabled={isDisabled}
                        className={`w-[40px] h-[40px] flex items-center justify-center mx-auto text-sm font-medium transition
                        ${
                          isDisabled
                            ? "text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-orange-400 text-white rounded-full"
                            : "hover:bg-orange-200 rounded-full text-gray-800"
                        }`}
                      >
                        {formatDate(day, "d")}
                      </button>
                      {/* 작은 점 표시 */}
                      <div className="h-[20px]">
                        {datesWithData.includes(
                          formatDate(day, "yyyy-MM-dd")
                        ) &&
                          !isDisabled && (
                            <span className="text-[30px] text-orange-400 leading-none">
                              •
                            </span>
                          )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          {/* 한 주 후 */}
          <button
            onClick={() => setBaseDate((prev) => addWeeks(prev, 1))}
            className="text-xl text-gray-600 hover:text-black px-2"
            title="한 주 후"
          >
            <GrNext />
          </button>
        </div>
      </div>
      {/* 기록 테이블 */}
      <div className="mt-6 bg-white overflow-y-auto shadow-md rounded-xl p-2">
        <div className="w-full flex flex-wrap items-center gap-3 p-3 rounded-lg">
          {/* 총시수 */}
          <div className="flex items-center text-medium text-gray-600 min-w-[140px]">
            <CgPlayStop />
            총시수:&nbsp;
            <strong className="text-black">
              {totalScore}中 / {totalArrows}矢
            </strong>
          </div>

          {/* 평균 */}
          <div className="flex items-center text-medium text-gray-600 min-w-[100px]">
            <CgPlayStop />
            평:&nbsp;
            <strong className="text-black">{avgScore}中</strong>
          </div>
          <p className="text-sm text-gray-600">
            ※ 개인 습사 기록은 평균시수(편사)에 포함되지 않습니다.
          </p>
        </div>
        <table className="w-full text-center table-auto border border-gray-200">
          <thead className="bg-gray-100 text-sm text-gray-700">
            <tr>
              <th className="py-2 px-2 border">항목</th>
              <th className="py-2 px-2 border">1矢</th>
              <th className="py-2 px-2 border">2矢</th>
              <th className="py-2 px-2 border">3矢</th>
              <th className="py-2 px-2 border">4矢</th>
              <th className="py-2 px-2 border">5矢</th>
              <th className="py-2 px-2 border">巡點</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-gray-400">
                  데이터 없음
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  <td className="py-2 px-2 border">{row.round}</td>
                  {row.shots.map((shot, colIdx) => (
                    <td
                      key={colIdx}
                      className="py-2 px-2 border cursor-pointer"
                      onClick={() => cellClick(rowIdx, colIdx)}
                    >
                      {shot}
                    </td>
                  ))}
                  <td className="py-2 px-2 border text-red-600 font-semibold">
                    {row.score}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 행 추가 버튼 */}
        <div className="flex justify-center mt-4">
          <button
            onClick={addRow}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-lg font-bold shadow-sm transition"
          >
            +
          </button>
        </div>
        {/* 저장 버튼 */}
        <div className=" flex justify-center mx-4 p-4">
          <button
            onClick={saveRecord}
            className="w-20 h-10 bg-orange-300 text-white rounded-[5px] hover:bg-orange-400 text-lg font-bold shadow-sm transition"
          >
            저장
          </button>
        </div>
      </div>

      {alertInfo.show && (
        <AlertModal
          message={alertInfo.message}
          onConfirm={alertInfo.onConfirm}
          onCancel={alertInfo.onCancel}
        />
      )}
    </div>
  );
}

export default UserRecord;
