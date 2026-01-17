import usePageTitle from "../hooks/usePageTitle.js";

const Calendar = () => {
  usePageTitle("日历");

  return (
    <section className="page">
      <h1>日历视图</h1>
      <p>按日期查看打卡情况与提醒。</p>
      <div className="calendar-grid">
        {Array.from({ length: 7 }).map((_, index) => (
          <div className="calendar-item" key={index}>
            <span className="calendar-day">周{index + 1}</span>
            <span className="calendar-status">已打卡</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Calendar;
