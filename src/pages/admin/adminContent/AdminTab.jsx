import { useNavigate, useLocation } from "react-router-dom";

function AdminTab({ layout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "편사기록", path: "adminRecord", icon: "/record_icon.svg" },
    { label: "회원정보", path: "member", icon: "/list_solid.svg" },
    // { label: "상세기록", path: "calendar", icon: "📄" },
  ];

  const isActive = (path) =>
    (location.pathname === "/admin" && path.toLowerCase() === "adminrecord") ||
    location.pathname.toLowerCase().endsWith(`/${path.toLowerCase()}`);

  return (
    <div
      className={`w-full z-10 bg-white ${
        layout === "top"
          ? "flex mt-5 border-b border-gray-300 h-[51px] static"
          : "fixed bottom-0 flex justify-around border-t border-gray-300 shadow-[0_-1px_5px_rgba(0,0,0,0.05)]"
      }`}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.path);

        return (
          <div
            key={tab.label}
            className={`flex flex-col items-center justify-center text-1 cursor-pointer transition-all duration-200 
              ${
                layout === "top"
                  ? `w-[100px] h-[50px] rounded-t-xl text-center ${
                      active
                        ? "bg-white font-[800] text-black border border-gray-300 border-b-0 relative -top-px"
                        : "bg-gray-100"
                    }`
                  : `flex-1 h-[60px] ${
                      active
                        ? "border-t border-black border-t-1 font-medium"
                        : "border-none"
                    }`
              }`}
            onClick={() => tab.path && navigate(`/admin/${tab.path}`)}
          >
            <img src={tab.icon} alt={tab.label} className="w-4 h-4 mb-[2px]" />
            <div>{tab.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default AdminTab;
