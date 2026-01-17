import { useState, useEffect } from "react";
import usePageTitle from "../hooks/usePageTitle.js";
import { checkinsApi } from "../api.js";

const Records = () => {
  usePageTitle("记录");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await checkinsApi.getAll();
        setRecords(data);
      } catch (error) {
        console.error("加载记录失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  // 删除记录
  const handleDelete = async (id) => {
    if (!confirm("确定要删除这条记录吗？")) {
      return;
    }
    try {
      await checkinsApi.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert(error.message || "删除失败");
    }
  };

  if (loading) {
    return (
      <section className="page">
        <h1>记录列表</h1>
        <p>加载中...</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>记录列表</h1>
      <p>查看历史打卡记录与备注。</p>
      <div className="table">
        <div className="table-row table-head">
          <span>日期</span>
          <span>任务</span>
          <span>时间</span>
          <span>操作</span>
        </div>
        {records.map((row) => (
          <div className="table-row" key={row.id}>
            <span>{row.date}</span>
            <span>{row.task_name}</span>
            <span>{row.time}</span>
            <span>
              <button
                type="button"
                className="text-button danger"
                onClick={() => handleDelete(row.id)}
              >
                删除
              </button>
            </span>
          </div>
        ))}
        {records.length === 0 && (
          <div className="table-row">
            <span colSpan="4" className="muted">
              暂无打卡记录
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Records;
