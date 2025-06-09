// src/components/UserTab.jsx
import { useNavigate, useLocation } from "react-router-dom";

function UserTab({ layout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "습사기록", path: "UserRecord", icon: "/record_icon.svg" },
    { label: "습사달력", path: "calendar", icon: "/calendar_regular.svg" },
    { label: "습사통계", path: "state", icon: "/chart_icon.svg" },
    { label: "활터정보", path: "place", icon: "/bullseye_solid.svg" },
  ];

  const isActive = (path) =>
    (location.pathname === "/user" && path.toLowerCase() === "userrecord") ||
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
            onClick={() => tab.path && navigate(`/user/${tab.path}`)}
          >
            <img src={tab.icon} alt={tab.label} className="w-4 h-4 mb-[2px]" />
            <div>{tab.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default UserTab;
