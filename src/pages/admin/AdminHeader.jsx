import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import AlertModal from "../AlertModal";

const Header = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    onConfirm: null,
    onCancel: null,
  });

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
    const name = localStorage.getItem("name");

    setName(name);
  }, []);

  const logout = () => {
    showConfirm(
      "로그아웃됩니다",
      () => {
        localStorage.clear();
        navigate("/");
      }, // 확인 시
      () => {} // 취소 시
    );
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-md">
      <h2 className="text-xl font-bold text-gray-800">
        광덕정 시수관리 시스템(관리자)
      </h2>

      <div
        onClick={logout}
        title="로그아웃"
        className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
      >
        <span className="text-base font-medium text-gray-700">{name}</span>
        <IoLogOutOutline size={28} className="text-gray-700" />
      </div>
      {alertInfo.show && (
        <AlertModal
          message={alertInfo.message}
          onConfirm={alertInfo.onConfirm}
          onCancel={alertInfo.onCancel}
        />
      )}
    </header>
  );
};

export default Header;
