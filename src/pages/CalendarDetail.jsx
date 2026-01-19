import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle.js";
import { checkinsApi, tasksApi } from "../api.js";
import { CategoryCheckin } from "./Checkin.jsx";
import {
  parseDateParam,
  isToday,
  isWithinDays,
  isFuture
} from "../../shared/logic/date.js";
import {
  DEFAULT_EXERCISE_CATEGORY,
  STORAGE_KEYS
} from "../../shared/index.js";
import { getStorageSync } from "../adapters/storage.js";

// 加载自定义分类
const loadCustomCategories = () => {
  return getStorageSync(STORAGE_KEYS.CUSTOM_CATEGORIES) || {};
};

const CalendarDetail = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const parsedDate = parseDateParam(date);
  const displayDateSource = parsedDate ?? new Date();
  const displayDate = displayDateSource.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  usePageTitle("当天打卡详情");

  const [checkins, setCheckins] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null);

  // 使用共享函数计算日期状态
  const dateIsToday = date ? isToday(date) : false;
  const dateCanMakeUp = date ? isWithinDays(date, 7) : false;
  const dateIsFuture = date ? isFuture(date) : false;

  // 加载当天数据
  useEffect(() => {
    const loadData = async () => {
      if (!date) return;
      try {
        const [checkinsData, tasksData] = await Promise.all([
          checkinsApi.getByDate(date),
          tasksApi.getAll(),
        ]);
        setCheckins(checkinsData);
        setTasks(tasksData);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [date]);

  const checkedTaskIds = new Set(checkins.map((c) => c.task_id));
  const uncheckedTasks = tasks.filter((t) => !checkedTaskIds.has(t.id));

  // 普通任务补打卡
  const handleMakeupCheckin = async (taskId) => {
    if (checkedTaskIds.has(taskId)) return;

    setChecking(taskId);
    try {
      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: date,
      });
      setCheckins((prev) => [...prev, newCheckin]);
    } catch (error) {
      alert(error.message || "补打卡失败");
    } finally {
      setChecking(null);
    }
  };

  // 运动任务补打卡（带 note）
  const handleExerciseMakeupCheckin = async (taskId, note) => {
    const newCheckin = await checkinsApi.create({
      task_id: taskId,
      date: date,
      note: note,
    });
    setCheckins((prev) => [...prev, newCheckin]);
  };

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

      {loading ? (
        <p className="muted">加载中...</p>
      ) : (
        <>
          <div className="card">
            <h2>打卡概览</h2>
            <ul className="calendar-detail-list">
              <li>
                <strong>状态：</strong>
                {checkins.length > 0
                  ? `已打卡 ${checkins.length} 项`
                  : "未打卡"}
              </li>
              <li>
                <strong>打卡时间：</strong>
                {checkins.length > 0
                  ? checkins.map((c) => c.time).join(" / ")
                  : "-"}
              </li>
              <li>
                <strong>已完成任务：</strong>
                {checkins.length > 0
                  ? checkins.map((c) => c.task_name).join("、")
                  : "无"}
              </li>
              {uncheckedTasks.length > 0 && (
                <li>
                  <strong>未完成任务：</strong>
                  {uncheckedTasks.map((t) => t.name).join("、")}
                </li>
              )}
            </ul>
          </div>

          {checkins.length > 0 && (
            <div className="card mt-md">
              <h2>打卡详情</h2>
              <div className="list">
                {checkins.map((checkin) => (
                  <div className="list-item" key={checkin.id}>
                    <div>
                      <h3>{checkin.task_name}</h3>
                      <p className="muted">打卡时间: {checkin.time}</p>
                    </div>
                    <span className="badge success">已完成</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 今天：显示继续打卡按钮 */}
          {dateIsToday && (
            <div className="calendar-detail-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/checkin")}
              >
                继续打卡
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/records")}
              >
                查看历史记录
              </button>
            </div>
          )}

          {/* 过去7天内：显示补打卡区域 */}
          {dateCanMakeUp && uncheckedTasks.length > 0 && (
            <div className="makeup-section">
              <h2 className="makeup-section-title">补打卡 (可补打7天内)</h2>
              <p className="muted mb-md">
                未完成任务：
              </p>
              <div className="list">
                {uncheckedTasks.map((task) => {
                  const isChecking = checking === task.id;

                  // 获取任务对应的分类配置
                  let category = null;
                  if (task.name === "运动") {
                    category = { ...DEFAULT_EXERCISE_CATEGORY, taskId: task.id };
                  } else {
                    const customCategories = loadCustomCategories();
                    category = Object.values(customCategories).find(c => c.taskId === task.id);
                  }

                  // 如果有匹配的分类配置，使用 CategoryCheckin 组件
                  if (category) {
                    return (
                      <CategoryCheckin
                        key={task.id}
                        category={category}
                        task={task}
                        onComplete={handleExerciseMakeupCheckin}
                        isChecked={false}
                        onDeleteCategory={() => {}}
                        completedText="已补打卡"
                      />
                    );
                  }

                  // 普通任务使用简单的补打卡按钮
                  return (
                    <div className="list-item" key={task.id}>
                      <div>
                        <h3>{task.name}</h3>
                        <p className="muted">{task.description || "未完成"}</p>
                      </div>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleMakeupCheckin(task.id)}
                        disabled={isChecking}
                      >
                        {isChecking ? "补打卡中..." : "立即补打卡"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 过去7天内但已全部完成 */}
          {dateCanMakeUp && uncheckedTasks.length === 0 && (
            <div className="calendar-detail-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/records")}
              >
                查看历史记录
              </button>
            </div>
          )}

          {/* 超过7天：显示已过期提示 */}
          {!dateIsToday && !dateCanMakeUp && !dateIsFuture && (
            <div className="makeup-section makeup-expired-section">
              <p className="makeup-expired">已超过补打卡期限（仅支持7天内补打卡）</p>
              <div className="calendar-detail-actions mt-md">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/records")}
                >
                  查看历史记录
                </button>
              </div>
            </div>
          )}

          {/* 未来日期：显示提示 */}
          {dateIsFuture && (
            <div className="makeup-section makeup-expired-section">
              <p className="makeup-expired">未来日期无法打卡</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CalendarDetail;
