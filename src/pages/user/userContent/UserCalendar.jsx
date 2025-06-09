import React, { useEffect, useState, forwardRef } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
//npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
import interactionPlugin from "@fullcalendar/interaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CirclePicker } from "react-color"; //npm install react-color

import { ko } from "date-fns/locale";
import { addDays, format } from "date-fns";

import "../../../css/Calendar.css";
import AlertModal from "../../AlertModal.jsx";

function UserCalendar() {
  const [calendar, setCalendar] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState("#ffebc2");
  const [modify, setModify] = useState(null);

  const [addScheModalOpen, setAddScheModalOpen] = useState(false);
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
  useEffect(() => {
    displayCalendar(startDate);
  }, [startDate]);

  useEffect(() => {
    if (addScheModalOpen && modify) {
      const inputEl = document.querySelector(
        ".react-datepicker__input-container input"
      );
      if (inputEl) {
        inputEl.style.backgroundColor = selectedColor;
      }
    }
  }, [addScheModalOpen, modify, selectedColor]);

  /* 사용자 일정  */
  const displayCalendar = async (startDate) => {
    try {
      const res = await axios.post("/api/user/getScheduleInfo", {
        memberId: localStorage.getItem("member_id"),
        startDate: format(startDate, "yyyy-MM-dd"),
      });
      if (res.data.success) {
        const mappedEvents = res.data.result.map((value) => ({
          id: value.cal_id,
          title: value.cal_title,
          start: value.start_date,
          end: format(addDays(new Date(value.end_date), 1), "yyyy-MM-dd"),
          allDay: true,
          color: value.cal_color,
        }));
        setCalendar(mappedEvents);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* 일정 추가 팝업 오픈 */
  const addSchedulePop = (info) => {
    const clickedDate = new Date(info.dateStr);
    setStartDate(clickedDate);
    setNewTitle("");
    setEndDate(addDays(clickedDate, 3));
    setAddScheModalOpen(true);
    setModify(null);
  };

  /* 일정 추가 */
  const addSchedule = async () => {
    if (!newTitle.trim() || !startDate) {
      return;
    }

    const newEvent = {
      title: newTitle,
      start: startDate,
      end: format(addDays(endDate, 1), "yyyy-MM-dd"),
      allDay: true,
      color: selectedColor,
    };

    setCalendar((prev) => [...prev, newEvent]);
    setNewTitle("");
    setSelectedColor("#ffebc");
    setAddScheModalOpen(false);

    try {
      const safeEndDate = endDate || startDate;
      const res = await axios.post("/api/user/saveCalendar", {
        memberId: localStorage.getItem("member_id"),
        title: newTitle,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(safeEndDate, "yyyy-MM-dd"),
        selectedColor,
      });
      if (res.data.success) {
        showAlert("저장되었습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* 일정 수정 팝업 오픈 */
  const modifySchedulePop = (clickInfo) => {
    const event = clickInfo.event;
    const modDay = addDays(new Date(event.end), -1);

    setModify({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: modDay,
      color: event.backgroundColor,
    });

    setNewTitle(event.title);
    setStartDate(new Date(event.start));
    setEndDate(modDay);
    setSelectedColor(event.backgroundColor);
    setAddScheModalOpen(true);
  };

  /* 일정 수정 */
  const modifySchedule = async () => {
    if (!modify) return;

    const modifyEvent = {
      ...modify,
      title: newTitle,
      start: startDate,
      end: addDays(endDate, 1),
      color: selectedColor,
      allDay: true,
    };

    setCalendar((prev) =>
      prev.map((event) => (event.id === modify.id ? modifyEvent : event))
    );

    try {
      const res = await axios.put("/api/user/modifyCalendar", {
        id: modify.id,
        title: newTitle,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        selectedColor,
      });
      if (res.data.success) {
        displayCalendar(startDate);
        showAlert("수정되었습니다.");
      }
    } catch (err) {
      console.error("수정 실패:", err);
    }

    setModify(null);
    setNewTitle("");
    setAddScheModalOpen(false);
  };

  /* 일정 삭제 */
  const deleteSchedule = (id) => {
    showConfirm(
      "정말 삭제하시겠습니까?",
      async () => {
        try {
          const res = await axios.delete("/api/user/deleteCalendar", {
            data: { id: id },
          });

          if (res.data.success) {
            setCalendar((prev) => prev.filter((event) => event.id !== id));
            showAlert("삭제되었습니다.");
            setAddScheModalOpen(false);
            displayCalendar(startDate);
          }
        } catch (err) {
          console.error(err);
        }
      }, // 확인 시
      () => {} // 취소 시
    );
  };

  /* 일정 색상 선택 */
  const colorChange = (color) => setSelectedColor(color.hex);

  /* 기간 선택 커스텀 */
  const CustomRangeInput = forwardRef(({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      type="button"
      className="w-full text-left border-none rounded-full text-center px-3 py-2 text-lg lg:text-base bg-green-200 shadow-sm"
      style={{ backgroundColor: selectedColor }}
    >
      {value || "날짜 선택"}
    </button>
  ));

  return (
    <div className="w-full px-4 py-4 bg-white overflow-y-hidden">
      {/* Calendar Section */}
      <div className="mb-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={addSchedulePop}
          events={calendar}
          locale="ko"
          height={window.innerWidth < 768 ? 500 : "auto"}
          contentHeight={window.innerWidth < 768 ? 500 : "auto"}
          eventClick={modifySchedulePop}
          dayCellContent={(arg) => arg.dayNumberText.replace("일", "")}
          eventDidMount={(info) => {
            const trash = document.createElement("span");
            trash.innerHTML = "X";
            trash.className =
              "text-red-500 ml-2 cursor-pointer text-xs hover:scale-110 transition-transform delete-icon";

            trash.addEventListener("click", (e) => {
              e.stopPropagation();
              deleteSchedule(info.event._def.publicId);
            });

            const titleEl = info.el.querySelector(".fc-event-title");
            if (titleEl) {
              titleEl.appendChild(trash);
            } else {
              info.el.appendChild(trash);
            }
          }}
        />
      </div>

      {/* Modal Section */}
      {addScheModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-80 max-w-md p-6 shadow-lg relative">
            {/* Header Input */}
            <div className="mb-4">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="일정을 입력해주세요"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            {/* Color Picker */}
            <div className="flex justify-center mb-4">
              <CirclePicker
                color={selectedColor}
                onChangeComplete={colorChange}
                colors={[
                  "#ffc0bb",
                  "#fcd598",
                  "#f7ffad",
                  "#bbffac",
                  "#99f3ff",
                  "#6ebdfc",
                ]}
              />
            </div>

            {/* Date Picker */}
            <div className="mb-4 calendar">
              <DatePicker
                locale={ko}
                dateFormat="yyyy-MM-dd"
                selected={startDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end || null);
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                className="w-full border-none rounded-md px-3 py-2 bg-green-200 text-sm "
                calendarClassName="custom-calendar"
                customInput={<CustomRangeInput />}
                popperPlacement="auto"
                popperModifiers={[
                  {
                    name: "customPosition",
                    enabled: true,
                    phase: "beforeWrite",
                    fn: ({ state }) => {
                      state.styles.popper = {
                        ...state.styles.popper,
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 9999,
                      };
                    },
                  },
                ]}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-2">
              <button
                className="px-4 py-2 text-sm text-gray-600 bg-gray-200 text-xl lg:text-base font-bold rounded-md hover:bg-gray-300"
                onClick={() => setAddScheModalOpen(false)}
              >
                취소
              </button>
              {modify ? (
                <button
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-200 text-xl lg:text-base font-bold rounded-md hover:bg-gray-300"
                  onClick={() => deleteSchedule(modify.id)}
                >
                  삭제
                </button>
              ) : (
                ""
              )}

              <button
                className="px-4 py-2 bg-orange-300 text-white text-xl lg:text-base font-bold rounded-[5px] hover:bg-orange-400"
                onClick={modify ? modifySchedule : addSchedule}
              >
                {modify ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
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

export default UserCalendar;
