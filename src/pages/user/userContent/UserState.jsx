import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function UserStat() {
  const now = new Date();

  // 초기 기간 설정
  const [fullYearMonthList, setFullYearMonthList] = useState([]);
  // 검색용 기간
  const [yearMonthList, setYearMonthList] = useState([]);

  const [avgScoreDate, setAvgScoreData] = useState([]); // 평균 시수
  const [practiceDays, setPracticeDays] = useState([]); // 습사 일수

  const [tableData, setTableData] = useState([]);

  const formatYearMonth = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // const day = date.getDate().toString().padStart(2, "0");
    return `${year}년 ${month}월`;
  };

  const parseYearMonth = (str) => {
    const [yearStr, monthStr] = str.split("년 ");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr.replace("월", ""));
    return new Date(year, month - 1, 1); // 월은 0부터 시작
  };

  const toDateYearMonth = (str) => {
    const [yearStr, monthStr] = str.split("년 ");
    const year = yearStr.trim();
    const month = monthStr.replace("월", "").padStart(2, "0").trim();
    return `${year}-${month}`;
  };

  const [startDate, setStartDate] = useState(
    formatYearMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1))
  );
  const [endDate, setEndDate] = useState(
    formatYearMonth(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  );

  useEffect(() => {
    const list = [];
    const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const current = new Date(start);
    while (current <= end) {
      list.push(formatYearMonth(new Date(current)));
      current.setMonth(current.getMonth() + 1);
    }
    setFullYearMonthList(list);
    setDateRange();
  }, [startDate, endDate]);

  const setDateRange = () => {
    const result = [];

    const current = parseYearMonth(startDate);
    const end = parseYearMonth(endDate);
    while (current <= end) {
      result.push(formatYearMonth(new Date(current)));
      current.setMonth(current.getMonth() + 1);
    }

    if (result.length < 2) {
      alert("최소 2개월은 선택해주세요");
      return;
    }
    setYearMonthList(result);
  };

  useEffect(() => {
    displayChart1();
  }, [yearMonthList]);

  const displayChart1 = useCallback(async () => {
    const formattedList = yearMonthList.map(toDateYearMonth);
    if (!formattedList.length || !formattedList[0]) return;
    const start = formattedList[0] + "-01";
    var end = formattedList[formattedList.length - 1];
    end = new Date(end);
    end = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    end =
      end.getFullYear() +
      "-" +
      ("0" + (end.getMonth() + 1)).slice(-2) +
      "-" +
      end.getDate();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/user/getStatData1`,
        {
          memberId: localStorage.getItem("member_id"),
          formattedList,
          start,
          end,
        }
      );
      if (res.data.success) {
        const result1 = [];
        const result2 = [];
        for (let i = 0; i < res.data.list.length; i++) {
          const val = res.data.list[i];

          for (let y = 0; y < formattedList.length; y++) {
            if (val.label === "평균시수") {
              result1.push(val[formattedList[y]]);
            } else if (val.label === "습사량") {
              result2.push(val[formattedList[y]]);
            }
          }
        }
        setAvgScoreData(result1);
        setPracticeDays(result2);
        setTableData(res.data.table);
      }
    } catch (err) {
      console.error("회원 정보 불러오기 실패:", err);
    }
  }, [yearMonthList]);

  const selectStartDate = (e) => {
    setStartDate(e.target.value);
  };
  const selectEndDate = (e) => {
    setEndDate(e.target.value);
  };
  return (
    <div className="w-full h-[calc(100vh-110px)] overflow-y-auto p-6 bg-white space-y-6">
      {/* 기간 선택 */}
      <div className="flex flex-wrap items-center gap-2 text-gray-700 text-base font-medium">
        <span>기간 :</span>
        <select
          value={startDate}
          onChange={selectStartDate}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {fullYearMonthList.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span>~</span>
        <select
          value={endDate}
          onChange={selectEndDate}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {fullYearMonthList.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* 통계 차트 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Line Chart */}
        <div className="w-full lg:w-2/3 h-[400px]">
          <Line
            datasetIdKey="id"
            data={{
              labels: yearMonthList,
              datasets: [
                {
                  id: 1,
                  label: "평균시수",
                  data: avgScoreDate,
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
                {
                  id: 2,
                  label: "습사량",
                  data: practiceDays,
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              devicePixelRatio: 2,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    font: {
                      size: 16,
                      weight: "600",
                    },
                  },
                },
                title: {
                  display: true,
                  text: "월별 평균시수 및 습사량 통계",
                  font: {
                    size: 22,
                  },
                  padding: {
                    top: 10,
                    bottom: 20,
                  },
                },
                tooltip: {
                  bodyFont: { size: 14 },
                  titleFont: { size: 14 },
                  enabled: true,
                  mode: "index",
                  intersect: false,
                  callbacks: {
                    label: function (context) {
                      const label = context.dataset.label || "";
                      const value = context.formattedValue;
                      if (label === "습사량") return `${label}: ${value}일`;
                      if (label === "평균시수") return `${label}: ${value}`;
                      return `${label}: ${value}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    font: {
                      size: 14,
                    },
                  },
                },
                x: {
                  ticks: {
                    callback: function (value) {
                      const label = this.getLabelForValue(value); // 실제 라벨: '2025년 04월'
                      return label.replace("년 ", "/").replace("월", "");
                    },
                    font: {
                      size: window.innerWidth < 768 ? 11 : 16,
                      weight: "500",
                    },
                  },
                },
              },
            }}
          />
        </div>

        {/* Table */}
        <div className="w-full lg:w-1/3 lg:max-h-[400px] lg:overflow-x-auto">
          <table className="min-w-full border text-sm text-center">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="py-2 px-3 border">습사일자</th>
                <th className="py-2 px-3 border">습사량(순)</th>
                <th className="py-2 px-3 border">관중</th>
                <th className="py-2 px-3 border">평시수</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((m) => (
                <tr key={m.memberId} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border">{m.record_date}</td>
                  <td className="py-2 px-3 border">{m.round_count}</td>
                  <td className="py-2 px-3 border">{m.total_hit}</td>
                  <td className="py-2 px-3 border">{m.avg_hit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserStat;
