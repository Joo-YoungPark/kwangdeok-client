// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main";
import ChangePw from "./pages/ChangePw";

import UserMain from "./pages/user/UserMain";
import UserRecord from "./pages/user/userContent/UserRecord";
import UserCalendar from "./pages/user/userContent/UserCalendar";
import UserState from "./pages/user/userContent/UserState";
import ArcheryPlace from "./pages/user/userContent/ArcheryPlace";

import AdminMain from "./pages/admin/AdminMain";
import AdminRecord from "./pages/admin/adminContent/AdminRecord";
import AdminMember from "./pages/admin/adminContent/AdminMember";

import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/changePw" element={<ChangePw />} />

        {/* 유저 (Protected) */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserMain />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="userRecord" />} />
          <Route path="userRecord" element={<UserRecord />} />
          <Route path="calendar" element={<UserCalendar />} />
          <Route path="state" element={<UserState />} />
          <Route path="place" element={<ArcheryPlace />} />
        </Route>

        {/* 관리자 (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminMain />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="adminRecord" />} />
          <Route path="adminRecord" element={<AdminRecord />} />
          <Route path="member" element={<AdminMember />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
