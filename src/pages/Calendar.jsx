import { useMemo, useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import { checkinsApi } from "../api.js";

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

const formatDateKey = (year, month, day) => {
  const monthValue = String(month + 1).padStart(2, "0");
  const dayValue = String(day).padStart(2, "0");
  return `${year}-${monthValue}-${dayValue}`;
};

// Memoized calendar cell component for better performance
const CalendarCell = memo(({ day, status, onSelect }) => (
  <button
    type="button"
    className={`calendar-cell ${status.tone}`}
    onClick={() => onSelect(day)}
  >
    <span className="calendar-date">{day}</span>
    <span className="calendar-status">{status.label}</span>
    <span className="calendar-action">进入打卡</span>
  </button>
));

const Calendar = () => {
  usePageTitle("日历");

  const now = new Date();
  const navigate = useNavigate();
  const year = now.getFullYear();
  const month = now.getMonth();

  const [checkinDates, setCheckinDates] = useState({});
  const [loading, setLoading] = useState(true);

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  // 加载当月打卡数据
  useEffect(() => {
    const loadMonthData = async () => {
      try {
        const data = await checkinsApi.getByMonth(monthKey);
        // 按日期统计打卡数量
        const dateMap = {};
        data.forEach((checkin) => {
          if (!dateMap[checkin.date]) {
            dateMap[checkin.date] = [];
          }
          dateMap[checkin.date].push(checkin);
        });
        setCheckinDates(dateMap);
      } catch (error) {
        console.error("加载月度数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMonthData();
  }, [monthKey]);

  const monthDays = useMemo(() => buildMonthDays(year, month), [year, month]);

  const monthLabel = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });

  // 根据打卡数据计算状态
  const getStatusByDay = (day) => {
    if (!day) {
      return { label: "", tone: "" };
    }

    const dateKey = formatDateKey(year, month, day);
    const todayDate = now.getDate();

    if (day > todayDate) {
      return { label: "未开始", tone: "future" };
    }

    const checkins = checkinDates[dateKey];
    if (checkins && checkins.length > 0) {
      return { label: `已打卡(${checkins.length})`, tone: "success" };
    }

    if (day === todayDate) {
      return { label: "待打卡", tone: "warning" };
    }

    return { label: "未打卡", tone: "danger" };
  };

  const handleSelectDay = useCallback((day) => {
    if (!day) return;
    navigate(`/calendar/${formatDateKey(year, month, day)}`);
  }, [navigate, year, month]);

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
        {loading ? (
          <p className="muted">加载中...</p>
        ) : (
          monthDays.map((item) => {
            if (item.isEmpty) {
              return <div className="calendar-cell empty" key={item.key} />;
            }

            const status = getStatusByDay(item.day);
            return (
              <CalendarCell
                key={item.key}
                day={item.day}
                status={status}
                onSelect={handleSelectDay}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export default Calendar;
