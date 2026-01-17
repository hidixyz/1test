import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import { statsApi, tasksApi } from "../api.js";

const Home = () => {
  usePageTitle("首页");
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          statsApi.get(),
          tasksApi.getAll(),
        ]);
        setStats(statsData);
        setTasks(tasksData);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <section className="page">
        <h1>欢迎回来</h1>
        <p>加载中...</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>欢迎回来</h1>
      <p>在这里快速查看今日目标、提醒与进度。</p>
      <div className="card-grid">
        <article className="card card-interactive" onClick={() => navigate("/checkin")}>
          <h2>今日目标</h2>
          <p>
            完成 {tasks.length} 项打卡任务
            {stats && stats.todayCheckins > 0 && (
              <span>（已完成 {stats.todayCheckins} 项）</span>
            )}
          </p>
        </article>
        <article className="card">
          <h2>连续打卡</h2>
          <p>
            {stats
              ? `保持 ${stats.streakDays} 天连续打卡记录`
              : "暂无打卡记录"}
          </p>
        </article>
        <article className="card card-interactive" onClick={() => navigate("/records")}>
          <h2>累计打卡</h2>
          <p>
            {stats
              ? `共 ${stats.totalCheckins} 次打卡记录`
              : "开始你的第一次打卡吧"}
          </p>
        </article>
      </div>

      {stats && stats.recentCheckins && stats.recentCheckins.length > 0 && (
        <div className="card mt-lg">
          <h2>最近打卡</h2>
          <div className="list">
            {stats.recentCheckins.slice(0, 3).map((checkin) => (
              <div className="list-item" key={checkin.id}>
                <div>
                  <h3>{checkin.task_name}</h3>
                  <p className="muted">{checkin.date} {checkin.time}</p>
                </div>
                <span className="badge success">已完成</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Home;
