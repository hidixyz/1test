import usePageTitle from "../hooks/usePageTitle.js";
import useWorkoutRecords from "../hooks/useWorkoutRecords.js";

const Records = () => {
  usePageTitle("记录");
  const { records } = useWorkoutRecords();

  return (
    <section className="page">
      <h1>记录列表</h1>
      <p>查看历史打卡记录与备注。</p>
      <div className="table">
        <div className="table-row table-head">
          <span>日期</span>
          <span>时间</span>
          <span>健身类型</span>
          <span>备注</span>
          <span>照片</span>
        </div>
        {records.length === 0 ? (
          <div className="table-row empty-row">
            <span>暂无打卡记录</span>
          </div>
        ) : (
          records.map((record) => (
            <div className="table-row" key={record.id}>
              <span>{record.date}</span>
              <span>{record.time}</span>
              <span>{record.workoutType}</span>
              <span>{record.notes || "—"}</span>
              <span>{record.photoUrl || "—"}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Records;
