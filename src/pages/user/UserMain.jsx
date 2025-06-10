import Header from "./UserHeader.jsx";
import UserTab from "./userContent/UserTab.jsx";
import { Outlet } from "react-router-dom";

function UserMain() {
  return (
    <div className="flex flex-col h-[100dvh]">
      <Header />

      {/* PC: 상단 탭 */}
      <div className="hidden md:block border-b border-gray-200 shadow-sm">
        <UserTab layout="top" />
      </div>

      {/* 콘텐츠 */}
      <main className="relative flex-1">
        <Outlet />
      </main>

      {/* Mobile: 하단 탭 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-md z-50">
        <UserTab layout="bottom" />
      </div>
    </div>
  );
}

export default UserMain;
