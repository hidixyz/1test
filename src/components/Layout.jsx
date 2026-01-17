import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/calendar", label: "日历" },
  { to: "/reminders", label: "提醒" },
  { to: "/checkin", label: "打卡" },
  { to: "/records", label: "记录" }
];

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-title">打卡应用</p>
          <p className="app-subtitle">专注习惯养成与记录</p>
        </div>
        <button className="primary-button" type="button">
          今日打卡
        </button>
      </header>
      <nav className="app-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="app-main">{children}</main>
    </div>
  );
};

export default Layout;
