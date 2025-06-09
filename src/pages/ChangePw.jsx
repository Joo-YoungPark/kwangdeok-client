import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChangePw = () => {
  const navigate = useNavigate();
  const memberId = localStorage.getItem("member_id");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("비밀번호를 모두 입력하세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/changePw`, {
        memberId,
        newPassword,
      });

      alert("비밀번호가 변경되었습니다. 다시 로그인하세요.");
      localStorage.clear(); // 로그인 정보 삭제
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">비밀번호 변경</h2>
        <input
          type="password"
          placeholder="새 비밀번호"
          className="w-full mb-3 p-2 border border-gray-300 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={handleChangePassword}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          비밀번호 변경
        </button>
      </div>
    </div>
  );
};

export default ChangePw;
