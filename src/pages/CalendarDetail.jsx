import { Link, useParams } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";

const parseDateParam = (dateParam) => {
  if (!dateParam) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateParam);
  if (!match) {
    return null;
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const CalendarDetail = () => {
  const { date } = useParams();
  const parsedDate = parseDateParam(date);
  const displayDateSource = parsedDate ?? new Date();
  const displayDate = displayDateSource.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  usePageTitle("当天打卡详情");

  return (
    <section className="page">
      <div className="calendar-detail-header">
        <div>
          <h1>当天打卡详情</h1>
          <p className="muted">{displayDate}</p>
        </div>
        <Link className="secondary-button" to="/calendar">
          返回月历
        </Link>
      </div>

      <div className="card">
        <h2>打卡概览</h2>
        <ul className="calendar-detail-list">
          <li>
            <strong>状态：</strong>已打卡
          </li>
          <li>
            <strong>打卡时间：</strong>08:45 / 18:05
          </li>
          <li>
            <strong>入口：</strong>日历快捷入口
          </li>
          <li>
            <strong>备注：</strong>保持专注，完成 3 个任务。
          </li>
        </ul>
      </div>

      <div className="calendar-detail-actions">
        <button type="button" className="primary-button">
          继续打卡
        </button>
        <button type="button" className="secondary-button">
          查看历史记录
        </button>
      </div>
    </section>
  );
};

export default CalendarDetail;
