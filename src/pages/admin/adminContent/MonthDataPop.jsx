import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import AlertModal from "../../AlertModal.jsx";

const MonthDataPop = ({ data, onClose }) => {
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2025);
  const [yearRange, setYearRange] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const thisYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => thisYear - i);

  const showAlert = (message) => {
    setAlertInfo({
      show: true,
      message,
      onConfirm: () => setAlertInfo({ ...alertInfo, show: false }),
      onCancel: null,
    });
  };

  const selectStartYear = (e) => {
    setStartYear(Number(e.target.value));
  };
  const selectEndYear = (e) => {
    setEndYear(Number(e.target.value));
  };

  useEffect(() => {
    const list = [];

    if (endYear < startYear) {
      showAlert("종료 연도는 시작 연도와 같거나 이후여야 합니다.");
    }
    for (let i = startYear; i <= endYear; i++) {
      list.push(i);
    }
    setYearRange(list);
  }, [startYear, endYear]);

  useEffect(() => {
    if (yearRange.length > 0) {
      getMonthData();
    }
  }, [yearRange]);

  const getMonthData = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/admin/getMonthScore`,
        {
          id: data.id,
          yearRange,
        }
      );
      if (res.data.success) {
        setMonthData(res.data.list);
      }
    } catch (err) {
      showAlert(err.response.data.message);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center pb-10">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <span className="font-semibold">기간 :</span>
            <select
              value={startYear}
              onChange={selectStartYear}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <span>~</span>
            <select
              value={endYear}
              onChange={selectEndYear}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            className="text-xl font-bold text-gray-500 hover:text-red-500 transition"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* 테이블 내용 */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm md:text-base border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">연도</th>
                {yearRange.map((y) => (
                  <th key={y} className="border px-4 py-2">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthData.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="border px-4 py-2 font-semibold">
                    {row.month}
                  </td>
                  {yearRange.map((y) => (
                    <td key={y} className="border px-4 py-2 text-center">
                      {row[y] ?? "0"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
};

export default MonthDataPop;
