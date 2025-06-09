import React, { useEffect, useRef, useState, forwardRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker"; // npm install react-datepicker
import "react-datepicker/dist/react-datepicker.css";
import "../../../css/Calendar.css";
import { format } from "date-fns"; // npm install date-fns
import { CgPlayStop } from "react-icons/cg";
import { ko } from "date-fns/locale";
import AlertModal from "../../AlertModal.jsx";

function AdminRecord() {
  const [date, setDate] = useState(new Date());
  const [searchName, setSearchName] = useState("");

  const [nameOptions, setNameOptions] = useState([]);
  const [memberId, setMemberId] = useState("");

  const [scores, setScores] = useState([]); // table에 append될 데이터
  const [score, setScore] = useState("");

  const [todaysScore, setTotaysScore] = useState([]);
  const inputRef = useRef(null);

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

  const showConfirm = (message, onYes, onNo) => {
    setAlertInfo({
      show: true,
      message,
      onConfirm: () => {
        onYes?.();
        setAlertInfo((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
        onNo?.();
        setAlertInfo((prev) => ({ ...prev, show: false }));
      },
    });
  };

  /* 사원 이름 목록 (사원이름, 사원 번호) */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/api/admin/getMembersName`)
      .then((res) => {
        if (res.data.success) {
          setNameOptions(res.data.members);
          return;
        }
      })
      .catch((err) => {
        showAlert(err.response.data.message);
      });

    // 해당 날짜 기록 불러오기
    getTodaysRecord(date);
  }, []);

  /* 시수에는 1~5 숫자만 입력되도록함 */
  const onlyNumber = (e) => {
    var value = e.target.value;
    value = value.replace(/[^0-5.]/g, "").replace(/(\..*)\./g, "$1");
    setScore(value);
  };

  /* 선택 날짜의 기록 */
  const getTodaysRecord = async (date) => {
    date = format(date, "yyyy-MM-dd");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/admin/getTodaysRecord`,
        {
          date: date,
        }
      );
      if (res.data.success) {
        setTotaysScore(res.data.result);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* 사원이름 onChange */
  const handleNameChange = (e) => {
    const value = e.target.value;
    const nameOnly = value.split(" (사번")[0];

    setSearchName(nameOnly);

    // 이름에 대응하는 member_id 찾아서 저장
    const found = nameOptions.find((m) => m.name === nameOnly);
    if (found) {
      setMemberId(found.member_id);
    } else {
      setMemberId(null); // 일치하는 이름 없으면 초기화
    }
  };

  /* 시수 입력 이벤트 */
  const addScore = () => {
    if (score.trim() === "") return;
    setScores((prev) => [...prev, score]);
    setScore("");
    inputRef.current.focus();
  };

  /* 엔터 클릭 시 시수 입력 */
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 제출 막기
    addScore(); // 기존 함수 호출
  };

  /* 평균 시수 구하기 */
  const avg =
    scores.length === 0
      ? 0
      : (
          scores.reduce((sum, cur) => sum + parseFloat(cur), 0) / scores.length
        ).toFixed(2);

  /* 시수 삭제 이벤트 */
  const removeScoreRow = (index) => {
    setScores((prev) => prev.filter((_, i) => i !== index));
  };

  /* 시수 저장 버튼 클릭 */
  const saveRecord = async () => {
    if (memberId === null) {
      showAlert("존재하지 않는 사원입니다.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/admin/saveRecord`,
        {
          date: format(date, "yyyy-MM-dd"),
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          searchName,
          avg,
          memberId,
        }
      );
      showAlert("등록되었습니다.");
      await getTodaysRecord(date);
      setSearchName("");
      setMemberId("");
      setScore("");
      setScores([]);
    } catch (err) {
      console.log(err);
    }
  };

  /* 시수 삭제 하기 */
  const removeScoreData = (id, date) => {
    showConfirm(
      "정말 삭제하시겠습니까?",
      async () => {
        try {
          const res = await axios.delete(
            `${import.meta.env.VITE_APP_API_URL}/api/admin/deleteGameScore`,
            {
              data: { id: id, date: date },
            }
          );

          if (res.data.success) {
            showAlert("삭제되었습니다.");
            await getTodaysRecord(date);
          }
        } catch (err) {
          console.error(err);
        }
      }, // 확인 시
      () => {} // 취소 시
    );
  };

  /* 모바일 전용 - 달력 선택 시 키보드 안올라오게 */
  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="w-full h-[40px] px-3 py-2 text-[16px] border border-gray-300 rounded-md font-bold text-left bg-white cursor-pointer"
    >
      {value || "날짜 선택"}
    </button>
  ));

  return (
    <>
      <div className="w-full bg-gray-50 flex items-center justify-center py-4 px-4">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* 날짜 선택 */}
          <div className="flex items-center justify-between lg:px-32">
            <span className="text-lg font-semibold flex">날짜 :</span>
            <div className="w-2/5">
              <DatePicker
                selected={date}
                onChange={(date) => {
                  setDate(date);
                  getTodaysRecord(date);
                }}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] bord focus:outline-none focus:ring-2 focus:ring-blue-400"
                calendarClassName="custom-calendar"
                customInput={<CustomInput />}
                withPortal
              />
            </div>
          </div>

          {/* 사원 이름 */}
          <div className="flex items-center justify-between lg:px-32">
            <span className="text-lg font-semibold">사원이름 :</span>
            <div className="w-2/5">
              <input
                type="text"
                list="memberNameList"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchName}
                onChange={handleNameChange}
              />
              <datalist id="memberNameList">
                {nameOptions.map((m) => (
                  <option
                    key={m.member_id}
                    value={`${m.name} (사번: ${m.member_no})`}
                  />
                ))}
              </datalist>
            </div>
          </div>

          {/* 시수 입력 */}
          <div className="flex items-center justify-between lg:px-32">
            <span className="text-lg font-semibold">시수 :</span>
            <form onSubmit={handleSubmit} className="w-2/5 flex gap-2">
              <input
                value={score}
                type="text"
                onChange={onlyNumber}
                inputMode="numeric"
                maxLength={1}
                className="w-[14vw] lg:w-[7.5vw] border border-gray-300 rounded-md px-3 py-2 text-[16px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                ref={inputRef}
              />
              <button
                type="submit"
                onClick={addScore}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                입력
              </button>
            </form>
          </div>

          {/* 평균 시수 */}
          <div className="flex items-center justify-between lg:px-32">
            <span className="text-lg font-semibold">평균 시수 :</span>
            <div className="w-2/5">
              <p className="text-lg font-medium">{avg}</p>
            </div>
          </div>

          {/* 시수 테이블 */}
          <div>
            <table className="w-full border border-gray-300 rounded-md overflow-hidden text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-r">순</th>
                  <th className="py-2 px-4 border-r">시수</th>
                  <th className="py-2 px-4">삭제</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={index} className="text-center border-t">
                    <td className="py-2 px-4 border-r">{index + 1}</td>
                    <td className="py-2 px-4 border-r">{score}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => removeScoreRow(index)}
                        className="text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={saveRecord}
              className="px-6 py-2 bg-orange-300 text-white rounded-md hover:bg-orange-400 text-base "
            >
              저장
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 space-y-6">
          <table className="w-full border border-gray-300 rounded-md overflow-hidden text-sm">
            <thead className="bg-gray-100 text-base">
              <tr>
                <th className="py-2 px-4 border-r">날짜</th>
                <th className="py-2 px-4 border-r">이름</th>
                <th className="py-2 px-4">시수</th>
                <th className="py-2 px-4">삭제</th>
              </tr>
            </thead>
            <tbody>
              {todaysScore.map((i, index) => (
                <tr key={index} className="text-center border-t text-sm">
                  <td className="py-2 px-4 border-r">{i.game_date}</td>
                  <td className="py-2 px-4 border-r">{i.name}</td>
                  <td className="py-2 px-4">{i.avg_score}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => removeScoreData(i.member_id, i.game_date)}
                      className="text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {alertInfo.show && (
          <AlertModal
            message={alertInfo.message}
            onConfirm={alertInfo.onConfirm}
            onCancel={alertInfo.onCancel}
          />
        )}
      </div>
    </>
  );
}

export default AdminRecord;
