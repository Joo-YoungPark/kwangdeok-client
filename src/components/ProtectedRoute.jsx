// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const memberNo = localStorage.getItem("member_no");
  const location = useLocation();

  const isAuthenticated = token && memberNo;

  if (!isAuthenticated) {
    alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
