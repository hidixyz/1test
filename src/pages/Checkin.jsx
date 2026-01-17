import usePageTitle from "../hooks/usePageTitle.js";

const Checkin = () => {
  usePageTitle("打卡");

  return (
    <section className="page">
      <h1>打卡中心</h1>
      <p>选择任务并完成今日打卡。</p>
      <div className="list">
        {["晨间冥想", "阅读 30 分钟", "运动 20 分钟"].map((item) => (
          <div className="list-item" key={item}>
            <div>
              <h3>{item}</h3>
              <p className="muted">今日目标</p>
            </div>
            <button className="secondary-button" type="button">
              立即打卡
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Checkin;
