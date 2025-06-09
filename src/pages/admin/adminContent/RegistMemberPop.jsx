import { useState } from "react";
import axios from "axios";
import AlertModal from "../../AlertModal.jsx";

const RegistMember = ({ onClose }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("사원");
  const [handle, setHandle] = useState(null);
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

  const saveMember = async () => {
    if (!name || !handle || !memberNo) {
      showAlert("이름과 궁 방향을 모두 입력해주세요.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/admin/registMember`,
        {
          name,
          role,
          handle,
          memberNo,
          password: "1234",
        }
      );
      setAlertInfo({
        show: true,
        message: "회원 등록이 완료되었습니다.",
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
      <div className="bg-white rounded-lg w-80 max-w-sm p-6 shadow-lg">
        <div className="text-xl font-semibold mb-4 text-center">회원 등록</div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="이름"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="사원 번호"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={memberNo}
            inputMode="numeric"
            onChange={(e) => setMemberNo(e.target.value)}
          />
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="사원">사원</option>
            <option value="이사">이사</option>
            <option value="사두">사두</option>
            <option value="부사두">부사두</option>
            <option value="고문">고문</option>
          </select>
          <div className="flex items-center gap-6">
            {[
              { label: "우궁", value: 1 },
              { label: "좌궁", value: -1 },
            ].map((v) => (
              <label key={v.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="handle"
                  value={v.value}
                  checked={handle === v.value}
                  onChange={() => setHandle(v.value)}
                  className="accent-blue-500"
                />
                {v.label}
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            ※ 초기 비밀번호는 '1234'입니다.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
            onClick={saveMember}
          >
            등록
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

export default RegistMember;
