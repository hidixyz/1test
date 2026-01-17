import usePageTitle from "../hooks/usePageTitle.js";
import useWorkoutRecords from "../hooks/useWorkoutRecords.js";

const Calendar = () => {
  usePageTitle("日历");
  const { records, today } = useWorkoutRecords();
  const recordCountByDate = records.reduce((acc, record) => {
    acc[record.date] = (acc[record.date] || 0) + 1;
    return acc;
  }, {});
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(`${today}T00:00:00`);
    date.setDate(date.getDate() - index);
    return date.toISOString().slice(0, 10);
  });

  return (
    <section className="page">
      <h1>日历视图</h1>
      <p>按日期查看打卡情况与提醒。</p>
      <div className="calendar-grid">
        {days.map((date) => {
          const count = recordCountByDate[date] || 0;
          const statusText = count > 0 ? `已打卡 ${count} 次` : "未打卡";
          return (
            <div className="calendar-item" key={date}>
              <span className="calendar-day">{date}</span>
              <span className={count > 0 ? "calendar-status" : "calendar-status muted"}>
                {statusText}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Calendar;
