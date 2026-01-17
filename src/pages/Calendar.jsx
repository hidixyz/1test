import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

const buildMonthDays = (year, month) => {
  const startDate = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = (startDate.getDay() + 6) % 7;
  const days = Array.from({ length: startOffset }, (_, index) => ({
    key: `empty-${index}`,
    isEmpty: true,
  }));

  for (let day = 1; day <= totalDays; day += 1) {
    days.push({
      key: `${year}-${month + 1}-${day}`,
      day,
      date: new Date(year, month, day),
      isEmpty: false,
    });
  }

  return days;
};

const statusByDay = (day, todayDate) => {
  if (!day) {
    return { label: "", tone: "" };
  }

  if (day > todayDate) {
    return { label: "未开始", tone: "future" };
  }

  if (day % 6 === 0) {
    return { label: "补卡", tone: "warning" };
  }

  if (day % 2 === 0) {
    return { label: "已打卡", tone: "success" };
  }

  return { label: "待打卡", tone: "danger" };
};

const formatDateKey = (year, month, day) => {
  const monthValue = String(month + 1).padStart(2, "0");
  const dayValue = String(day).padStart(2, "0");
  return `${year}-${monthValue}-${dayValue}`;
};

const Calendar = () => {
  usePageTitle("日历");

  const now = new Date();
  const navigate = useNavigate();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthDays = useMemo(() => buildMonthDays(year, month), [year, month]);

  const monthLabel = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });

  const handleSelectDay = (day) => {
    if (!day) {
      return;
    }
    navigate(`/calendar/${formatDateKey(year, month, day)}`);
  };

  return (
    <section className="page">
      <div className="calendar-header">
        <div>
          <h1>月历视图</h1>
          <p>按日期查看打卡情况，并快速进入当天详情。</p>
        </div>
        <div className="calendar-month">{monthLabel}</div>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <span key={day} className="calendar-weekday">
            周{day}
          </span>
        ))}
      </div>

      <div className="calendar-grid">
        {monthDays.map((item) => {
          if (item.isEmpty) {
            return <div className="calendar-cell empty" key={item.key} />;
          }

          const status = statusByDay(item.day, now.getDate());
          return (
            <button
              key={item.key}
              type="button"
              className={`calendar-cell ${status.tone}`}
              onClick={() => handleSelectDay(item.day)}
            >
              <span className="calendar-date">{item.day}</span>
              <span className="calendar-status">{status.label}</span>
              <span className="calendar-action">进入打卡</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default Calendar;
