import usePageTitle from "../hooks/usePageTitle.js";

const Records = () => {
  usePageTitle("记录");

  return (
    <section className="page">
      <h1>记录列表</h1>
      <p>查看历史打卡记录与备注。</p>
      <div className="table">
        <div className="table-row table-head">
          <span>日期</span>
          <span>任务</span>
          <span>状态</span>
        </div>
        {[
          { date: "2024-01-15", task: "晨间冥想", status: "已完成" },
          { date: "2024-01-14", task: "阅读 30 分钟", status: "已完成" },
          { date: "2024-01-13", task: "运动 20 分钟", status: "已完成" }
        ].map((row) => (
          <div className="table-row" key={row.date}>
            <span>{row.date}</span>
            <span>{row.task}</span>
            <span>{row.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Records;
