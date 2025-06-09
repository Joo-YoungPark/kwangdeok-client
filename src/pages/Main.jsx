import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../css/Common.css";
import axios from "axios";

function MainPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const LoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/login`,
        {
          id,
          password,
        }
      );

      if (res.data.success) {
        if (res.data.isFirstLogin) {
          localStorage.setItem("member_id", res.data.id);
          navigate("/changePw");
          return;
        }
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("member_id", res.data.id);
        localStorage.setItem("member_no", res.data.memberNo);
        localStorage.setItem("name", res.data.name);

        navigate(res.data.memberNo === "000000" ? "/admin" : "/user");
      }
    } catch (err) {
      console.log(err.status);
      if (err.status === 401) {
        alert(err.response.data.message);
      } else {
        alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 to-custom_purple flex flex-col items-center justify-center px-4 text-center text-white">
      <h1 className="text-3xl font-bold mb-2">광덕정 시수관리</h1>
      <p className="mb-6">오늘도 한 걸음, 수련의 길을 향해.</p>

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg text-left text-gray-800">
        <form onSubmit={LoginSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">아이디</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              type="password"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

export default MainPage;
