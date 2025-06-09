import Header from "./AdminHeader.jsx";
import AdminTab from "./adminContent/AdminTab.jsx";
import { Outlet } from "react-router-dom";

function AdminMain() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
      <Header />

      {/* PC: 상단 탭 */}
      <div className="hidden md:block border-b border-gray-200 shadow-sm">
        <AdminTab layout="top" />
      </div>

      {/* 콘텐츠 */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Mobile: 하단 탭 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-md z-50">
        <AdminTab layout="bottom" />
      </div>
    </div>
  );
}

export default AdminMain;
