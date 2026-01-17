import usePageTitle from "../hooks/usePageTitle.js";
import useWorkoutRecords from "../hooks/useWorkoutRecords.js";

const getDateString = (date) => date.toISOString().slice(0, 10);

const Home = () => {
  usePageTitle("首页");
  const { records, todayRecords, today } = useWorkoutRecords();
  const latestRecord = records[0];
  const dateSet = new Set(records.map((record) => record.date));

  const streak = (() => {
    let count = 0;
    let cursor = new Date(`${today}T00:00:00`);
    while (dateSet.has(getDateString(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  return (
    <section className="page">
      <h1>欢迎回来</h1>
      <p>在这里快速查看今日目标、提醒与进度。</p>
      <div className="card-grid">
        <article className="card">
          <h2>今日目标</h2>
          <p>今日已完成 {todayRecords.length} 次打卡。</p>
        </article>
        <article className="card">
          <h2>连续打卡</h2>
          <p>已连续保持 {streak} 天打卡。</p>
        </article>
        <article className="card">
          <h2>最新记录</h2>
          <p>
            {latestRecord
              ? `${latestRecord.date} ${latestRecord.time} · ${latestRecord.workoutType}`
              : "暂无记录，开始首次打卡吧。"}
          </p>
        </article>
      </div>
    </section>
  );
};

export default Home;
