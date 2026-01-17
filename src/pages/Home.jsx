import usePageTitle from "../hooks/usePageTitle.js";

const Home = () => {
  usePageTitle("首页");

  return (
    <section className="page">
      <h1>欢迎回来</h1>
      <p>在这里快速查看今日目标、提醒与进度。</p>
      <div className="card-grid">
        <article className="card">
          <h2>今日目标</h2>
          <p>完成 3 项打卡任务。</p>
        </article>
        <article className="card">
          <h2>连续打卡</h2>
          <p>保持 7 天连续打卡记录。</p>
        </article>
        <article className="card">
          <h2>最新记录</h2>
          <p>查看最近的习惯与成长日志。</p>
        </article>
      </div>
    </section>
  );
};

export default Home;
