import { useMemo, useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import { checkinsApi } from "../api.js";
import {
  buildMonthDays,
  getStatusByDay,
  groupCheckinsByDate,
  formatMonthLabel
} from "../../shared/logic/calendar.js";
import { WEEK_DAYS, formatDateKey } from "../../shared/logic/date.js";

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
        // 使用共享函数按日期统计
        const dateMap = groupCheckinsByDate(data);
        setCheckinDates(dateMap);
      } catch (error) {
        console.error("加载月度数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMonthData();
  }, [monthKey]);

  // 使用共享函数构建月份日期
  const monthDays = useMemo(() => buildMonthDays(year, month), [year, month]);

  // 使用共享函数格式化月份标签
  const monthLabel = formatMonthLabel(year, month);

  // 根据打卡数据计算状态
  const getStatus = (day) => {
    if (!day) {
      return { label: "", tone: "" };
    }
    const dateKey = formatDateKey(year, month, day);
    const todayDate = now.getDate();
    return getStatusByDay(day, todayDate, checkinDates, dateKey);
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
        {WEEK_DAYS.map((day) => (
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

            const status = getStatus(item.day);
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
