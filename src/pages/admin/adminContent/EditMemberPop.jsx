import { useEffect, useState } from "react";
import axios from "axios";
import AlertModal from "../../AlertModal";

const EditMember = ({ member, onClose }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState(null);
  const [handle, setHandle] = useState(null);
  const [useyn, setUseYn] = useState(null);
  const [memberNo, setMemberNo] = useState("");

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

  // 초기 데이터 설정
  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setMemberNo(member.member_no || "");
      setRole(member.role || "");
      setHandle(member.handle ?? 0);
      setUseYn(member.useyn || "");
    }
  }, [member]);

  const editMember = async () => {
    if (!name || !role || !handle || !memberNo || !useyn) {
      showAlert("이름, 직책, 궁 방향, 사원번호는 모두 필수입니다.");
      return;
    }

    try {
      await axios.post("/api/admin/editMember", {
        id: member.member_id,
        name,
        role,
        handle,
        useyn,
        memberNo,
      });
      setAlertInfo({
        show: true,
        message: "회원 수정이 완료되었습니다.",
        onConfirm: () => {
          setAlertInfo((prev) => ({ ...prev, show: false }));
          onClose();
        },
        onCancel: null, // confirm만 쓰는 alert
      });
    } catch (err) {
      showAlert(err.response.data.message);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-80 lg:w-full max-w-sm p-6 shadow-lg">
        <div className="text-xl font-semibold mb-4 text-center">
          회원정보 수정
        </div>

        <div className="space-y-4">
          {/* member_id는 숨겨진 필드 */}
          <input
            type="text"
            value={member.member_id}
            disabled
            className="hidden"
          />

          {/* 이름 (비활성화) */}
          <input
            type="text"
            placeholder="이름"
            value={name}
            disabled
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
          />

          {/* 사원번호 */}
          <input
            type="text"
            placeholder="사원 번호"
            value={memberNo}
            onChange={(e) => setMemberNo(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* 직책 */}
          <select
            value={member.role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="사원">사원</option>
            <option value="고문">고문</option>
            <option value="이사">이사</option>
            <option value="사두">사두</option>
            <option value="부사두">부사두</option>
          </select>

          {/* 우궁/좌궁 */}
          <div className="flex items-center gap-6 mt-2">
            {[
              { label: "우궁", value: 1 },
              { label: "좌궁", value: -1 },
            ].map((v) => (
              <label key={v.value} className="flex items-center gap-2 -[16px]">
                <input
                  type="radio"
                  name="handle"
                  value={v.value}
                  checked={Number(handle) === v.value}
                  onChange={() => setHandle(v.value)}
                  className="accent-blue-500"
                />
                {v.label}
              </label>
            ))}
          </div>
          {/* 사용 여부 */}
          <div className="flex items-center gap-6 mt-2">
            {[
              { label: "사용", value: "Y" },
              { label: "휴궁", value: "N" },
            ].map((v) => (
              <label
                key={v.value}
                className="flex items-center gap-2 text-[16px]"
              >
                <input
                  type="radio"
                  name="useyn"
                  value={v.value}
                  checked={String(useyn) === v.value}
                  onChange={() => setUseYn(v.value)}
                  className="accent-blue-500"
                />
                {v.label}
              </label>
            ))}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            닫기
          </button>
          <button
            onClick={editMember}
            className="px-4 py-2 font-bold text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
};

export default EditMember;
