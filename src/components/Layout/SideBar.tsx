import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector, RootState, useAppDispatch } from "../../redux/store";
import { logout } from "../../redux/slice/authReducer";

const SideBarItem = ({
  href,
  svg,
  title,
}: {
  href?: string;
  svg: string;
  title: string;
}) => {
  const location = useLocation();
  const active = location.pathname === href;

  return (
    <Link to={href ?? "/"}>
      <div
        className={`
          w-full px-4 py-3 rounded-xl flex items-center gap-3
          transition-all duration-200 ease-in-out group
          ${
            active
              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20"
              : "hover:bg-gray-50"
          }
        `}
      >
        <div
          className={`
          p-2 rounded-lg transition-colors
          ${active ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}
        `}
        >
          <svg className={`w-5 h-5 ${active ? "fill-white" : "fill-gray-600"}`}>
            <use href={svg} />
          </svg>
        </div>
        <span
          className={`
          font-medium transition-colors
          ${active ? "text-white" : "text-gray-700 group-hover:text-gray-900"}
        `}
        >
          {title}
        </span>
      </div>
    </Link>
  );
};

const SideBar = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const sideBarOpen = useAppSelector(
    (state: RootState) => state.app.sideBarOpen
  );
  const [collapse, setCollapse] = useState(true);

  return (
    <div
      className={`
        max-md:hidden h-[calc(100vh-90px)] fixed bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out overflow-y-auto hide-scrollbar
        ${sideBarOpen ? "w-[280px]" : "w-[80px]"}
      `}
      style={{ top: "90px" }}
    >
      <div className="p-4 flex flex-col gap-2">
        {/* User Profile Section */}
        <div
          onClick={() => setCollapse((v) => !v)}
          className={`
            flex flex-col gap-2 w-full border-b border-gray-200 pb-4 mb-2
            transition-all duration-300 ease-in-out overflow-hidden cursor-pointer
            ${sideBarOpen ? "" : "items-center"}
          `}
          style={{ height: collapse ? 80 : 140 }}
        >
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="relative">
              <img
                className="w-10 h-10 rounded-xl object-cover border-2 border-gray-200"
                src={
                  user?.photoURL ||
                  `${import.meta.env.VITE_API_PUBLIC_URL}/user.png`
                }
                alt="Profile"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            {sideBarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {user?.displayName ? user?.email : "signed in"}
                </p>
              </div>
            )}
            {sideBarOpen && (
              <svg
                className={`
                w-5 h-5 fill-gray-400 transition-transform duration-300
                ${collapse ? "" : "rotate-180"}
              `}
              >
                <use href="#svg-arrow-down" />
              </svg>
            )}
          </div>
          {sideBarOpen && (
            <div className="pl-4" onClick={() => dispatch(logout())}>
              <SideBarItem svg="#svg-logout" title="Logout" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          <SideBarItem
            href="/dashboard"
            svg="#svg-graph"
            title="Enforcement Dashboard"
          />
          <SideBarItem
            href="/payment-app"
            svg="#svg-todo"
            title="Payment App Dashboard"
          />
          {user?.customClaims.level === 1 && (
            <SideBarItem
              href="/manage-user"
              svg="#svg-graph"
              title="User Management"
            />
          )}
          <SideBarItem href="/my-lots" svg="#svg-park" title="My Lots" />
          <SideBarItem
            href="/parking-sessions"
            svg="#svg-car"
            title="Parking Sessions"
          />
          {user?.customClaims.level === 1 && (
            <SideBarItem href="/violations" svg="#svg-car" title="Violations" />
          )}
          <SideBarItem href="/permits" svg="#svg-todo" title="Permits" />
          {user?.customClaims.level === 1 && (
            <SideBarItem
              href="/unenforcable-dates"
              svg="#svg-calendar"
              title="Unenforcable Dates"
            />
          )}
          {user?.customClaims.level === 1 && (
            <SideBarItem href="/inbox" svg="#svg-email" title="Inbox" />
          )}
          {user?.customClaims.level === 3 && (
            <SideBarItem
              href="/user-permits"
              svg="#svg-todo"
              title="User Permits"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
