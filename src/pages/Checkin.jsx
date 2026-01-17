import { useState } from "react";
import usePageTitle from "../hooks/usePageTitle.js";
import useWorkoutRecords from "../hooks/useWorkoutRecords.js";

const Checkin = () => {
  usePageTitle("打卡");
  const { addRecord, today, todayRecords, getCurrentTime } = useWorkoutRecords();
  const workoutOptions = ["晨间冥想", "阅读 30 分钟", "运动 20 分钟", "力量训练", "拉伸放松"];
  const [formState, setFormState] = useState({
    date: today,
    time: getCurrentTime(),
    workoutType: workoutOptions[0],
    notes: "",
    photoUrl: ""
  });

  const latestRecord = todayRecords[0];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addRecord(formState);
    setFormState((prev) => ({
      ...prev,
      time: getCurrentTime(),
      notes: "",
      photoUrl: ""
    }));
  };

  return (
    <section className="page">
      <h1>打卡中心</h1>
      <p>选择任务并完成今日打卡。</p>
      <div className="status-card">
        <div>
          <h2>今日状态</h2>
          <p className="muted">已完成 {todayRecords.length} 次打卡</p>
        </div>
        <div className="status-detail">
          <span>{latestRecord ? `最近：${latestRecord.workoutType}` : "今日尚未打卡"}</span>
          <span className="muted">
            {latestRecord ? `${latestRecord.date} ${latestRecord.time}` : "添加记录后自动更新"}
          </span>
        </div>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="date">日期</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formState.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="time">时间</label>
          <input
            id="time"
            name="time"
            type="time"
            value={formState.time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="workoutType">健身类型</label>
          <select
            id="workoutType"
            name="workoutType"
            value={formState.workoutType}
            onChange={handleChange}
          >
            {workoutOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="notes">备注</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            placeholder="记录今日感受或训练计划"
            value={formState.notes}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label htmlFor="photoUrl">照片路径 / URL</label>
          <input
            id="photoUrl"
            name="photoUrl"
            type="text"
            placeholder="https:// 或本地路径"
            value={formState.photoUrl}
            onChange={handleChange}
          />
        </div>
        <button className="primary-button" type="submit">
          立即打卡
        </button>
      </form>
    </section>
  );
};

export default Checkin;
