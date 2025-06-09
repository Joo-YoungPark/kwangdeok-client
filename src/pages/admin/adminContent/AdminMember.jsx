import React, { useEffect, useState } from "react";
import axios from "axios";
import { BiDetail } from "react-icons/bi"; // npm install react-icons
import {
  MdOutlineFirstPage,
  MdOutlineLastPage,
  MdNavigateBefore,
  MdNavigateNext,
} from "react-icons/md";
import RegistModal from "./RegistMemberPop.jsx";
import EditModal from "./EditMemberPop.jsx";
import MonthModal from "./MonthDataPop.jsx";

import AlertModal from "../../AlertModal.jsx";

function AdminMember() {
  const [searchType, setSearchType] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [members, setMembers] = useState([]);
  const [checked, setChecked] = useState([]);

  const [registModalOpen, setRegistModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMemberData, setEditMemberData] = useState(null);

  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [memberId, setMemberId] = useState("");

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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

  const pagesPerGroup = 5;
  const totalPages = Math.ceil(totalCount / size);
  const currentGroup = Math.floor((page - 1) / pagesPerGroup);
  const groupStart = currentGroup * pagesPerGroup + 1;
  const groupEnd = Math.min(groupStart + pagesPerGroup - 1, totalPages);

  useEffect(() => {
    searchMemberList();
  }, [page]);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  /* 사원 리스트 불러오기 */
  const searchMemberList = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/admin/getMemberList`,
        {
          params: { page, size, searchType, searchKeyword },
        }
      );
      if (res.data.success) {
        setMembers(res.data.members);
        setTotalCount(res.data.totalCount);
      }
    } catch (err) {
      showAlert(err.response.data.message);
    }
  };

  /* 사원 등록 팝업 오픈 */
  const registMember = () => setRegistModalOpen(true);
  // 사원 등록 팝업 닫기
  const closeRegistModal = () => {
    setRegistModalOpen(false);
    searchMemberList();
  };

  /* 사원 삭제 */

  const deleteMember = () => {
    if (checked.length === 0) {
      showAlert("삭제할 회원을 선택하세요.");
      return;
    }

    showConfirm(
      "정말 삭제하시겠습니까?",
      async () => {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/api/admin/deleteMember`,
            {
              id: checked,
            }
          );
          if (res.data.success) {
            showAlert("삭제되었습니다.");
            setChecked([]);
            searchMemberList();
          } else {
            throw new Error("삭제 실패");
          }
        } catch (err) {
          showAlert(err.response.data.message);
        }
      }, // 확인 시
      () => {} // 취소 시
    );
  };

  /* 수정 팝업 열기 + 사원 정보 */
  const editMember = async () => {
    if (checked.length !== 1) {
      showAlert("하나만 선택해주세요.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/admin/getMemberInfo`,
        { id: checked }
      );
      if (res.data.success) {
        setEditModalOpen(true);
        setEditMemberData(res.data.member);
      }
    } catch (err) {
      showAlert(err.response.data.message);
    }
  };

  // 수정 팝업 닫기
  const onCloseEditModal = () => {
    setEditModalOpen(false);
    setEditMemberData(null);
    searchMemberList();
  };

  /* 월별 보기 팝업 오픈픈 */
  const viewMonth = (id) => {
    setMemberId(id);
    setMonthModalOpen(true);
  };

  // 월별 보기 팝업 닫기
  const onCloseMonthModal = () => {
    setMonthModalOpen(false);
    searchMemberList();
  };

  return (
    <div className="w-full px-4 py-6">
      {/* 검색 영역 */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-base"
          >
            <option value="all">전체</option>
            <option value="name">이름</option>
            <option value="memberNo">사원번호</option>
            <option value="role">직책</option>
          </select>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 text-base w-40"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button
            onClick={searchMemberList}
            className="bg-blue-500 font-bold text-white rounded-md px-4 py-2 hover:bg-blue-600"
          >
            검색
          </button>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="mb-4 flex gap-2 justify-end">
        <button
          onClick={registMember}
          className="bg-orange-400 text-white px-2 font-bold rounded hover:bg-orange-600"
        >
          등록
        </button>
        <button
          onClick={deleteMember}
          className="bg-gray-400 text-white px-2 font-bold rounded hover:bg-gray-600"
        >
          삭제
        </button>
        <button
          onClick={editMember}
          className="bg-fuchsia-400 text-white px-2 font-bold rounded hover:bg-fuchsia-600"
        >
          수정
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 border-r">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setChecked(
                      e.target.checked ? members.map((m) => m.member_id) : []
                    );
                  }}
                />
              </th>
              <th className="border-r">이름</th>
              <th className="border-r">사원번호</th>
              <th className="border-r">직책</th>
              <th className="border-r">우궁/좌궁</th>
              <th className="border-r">평시수</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.member_id} className="border-t">
                <td className="border-r">
                  <input
                    type="checkbox"
                    checked={checked.includes(m.member_id)}
                    onChange={(e) => {
                      setChecked((prev) =>
                        e.target.checked
                          ? [...prev, m.member_id]
                          : prev.filter((id) => id !== m.member_id)
                      );
                    }}
                  />
                </td>
                <td className="border-r">{m.name}</td>
                <td className="border-r">{m.member_no}</td>
                <td className="border-r">{m.role}</td>
                <td className="border-r">{m.handle}</td>
                <td className="border-r">{m.avg_score}</td>
                <td>
                  <button
                    onClick={() => viewMonth(m.member_id)}
                    className="text-blue-600 hover:underline"
                  >
                    <BiDetail size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이징 */}
      <div className="flex justify-center items-center gap-1 mt-4 flex-wrap text-sm">
        <button
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className="px-2 py-1 rounded disabled:opacity-50"
        >
          <MdOutlineFirstPage />
        </button>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 rounded disabled:opacity-50"
        >
          <MdNavigateBefore />
        </button>

        {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => {
          const p = groupStart + i;
          return (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-2 py-1 border rounded ${
                page === p ? "bg-blue-500 text-white" : ""
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className="px-2 py-1 rounded disabled:opacity-50"
        >
          <MdNavigateNext />
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          className="px-2 py-1 rounded disabled:opacity-50"
        >
          <MdOutlineLastPage />
        </button>
      </div>

      {registModalOpen && <RegistModal onClose={closeRegistModal} />}
      {editModalOpen && (
        <EditModal member={editMemberData} onClose={onCloseEditModal} />
      )}
      {monthModalOpen && (
        <MonthModal
          data={{ id: memberId }}
          onClose={() => onCloseMonthModal(false)}
        />
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

export default AdminMember;
