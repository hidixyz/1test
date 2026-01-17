import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import usePageTitle from "../hooks/usePageTitle.js";

const STORAGE_KEY = "reminderSettings";
const LAST_TRIGGER_KEY = "reminderLastTriggered";
const NEXT_TRIGGER_KEY = "reminderNextTrigger";
const SERVICE_WORKER_PATH = "/reminder-sw.js";

const DEFAULT_SETTINGS = {
  enabled: false,
  time: "08:30",
  message: "别忘了完成今日打卡！",
  channel: "web"
};

const getStoredSettings = () => {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
};

const toReminderDate = (timeValue) => {
  const now = new Date();
  const [hourValue, minuteValue] = timeValue.split(":");
  const hours = Number.parseInt(hourValue, 10);
  const minutes = Number.parseInt(minuteValue, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target;
};

const getTodayKey = () => new Date().toISOString().split("T")[0];

const Reminders = () => {
  usePageTitle("提醒设置");

  const [settings, setSettings] = useState(getStoredSettings);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [nextTrigger, setNextTrigger] = useState(null);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState("未注册");
  const [inAppNotice, setInAppNotice] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setServiceWorkerStatus("当前浏览器不支持 Service Worker");
      return;
    }
    navigator.serviceWorker
      .register(SERVICE_WORKER_PATH)
      .then(() => {
        setServiceWorkerStatus("已注册");
      })
      .catch(() => {
        setServiceWorkerStatus("注册失败");
      });
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const triggerReminder = useCallback(() => {
    const lastTriggered = window.localStorage.getItem(LAST_TRIGGER_KEY);
    const todayKey = getTodayKey();
    if (lastTriggered === todayKey) {
      return;
    }
    if (settings.channel === "web" && typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready
            .then((registration) =>
              registration.showNotification("打卡提醒", {
                body: settings.message,
                tag: "daily-reminder"
              })
            )
            .catch(() => {
              new Notification("打卡提醒", {
                body: settings.message,
                tag: "daily-reminder"
              });
            });
        } else {
          new Notification("打卡提醒", {
            body: settings.message,
            tag: "daily-reminder"
          });
        }
      }
    } else if (settings.channel === "inapp") {
      setInAppNotice(settings.message);
      window.setTimeout(() => {
        setInAppNotice("");
      }, 4000);
    }
    window.localStorage.setItem(LAST_TRIGGER_KEY, todayKey);
  }, [settings]);

  const scheduleNextReminder = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!settings.enabled) {
      setNextTrigger(null);
      window.localStorage.removeItem(NEXT_TRIGGER_KEY);
      return;
    }
    const next = toReminderDate(settings.time);
    if (!next) {
      setNextTrigger(null);
      window.localStorage.removeItem(NEXT_TRIGGER_KEY);
      return;
    }
    setNextTrigger(next);
    window.localStorage.setItem(NEXT_TRIGGER_KEY, next.toISOString());
    const delay = next.getTime() - Date.now();
    timerRef.current = window.setTimeout(() => {
      triggerReminder();
      scheduleNextReminder();
    }, delay);
  }, [settings.enabled, settings.time, triggerReminder]);

  useEffect(() => {
    scheduleNextReminder();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scheduleNextReminder]);

  const previewReminder = () => {
    if (!settings.enabled) {
      setSettings((prev) => ({ ...prev, enabled: true }));
    }
    triggerReminder();
  };

  const statusCopy = useMemo(() => {
    if (!settings.enabled) {
      return "提醒已关闭，随时可在此重新开启。";
    }
    if (!nextTrigger) {
      return "提醒时间尚未设置，请选择有效时间。";
    }
    if (settings.channel === "mobile") {
      return "移动端渠道需要接入本地通知 SDK，当前仅保存提醒计划。";
    }
    return `下一次提醒将在 ${nextTrigger.toLocaleString()} 触发。`;
  }, [nextTrigger, settings.enabled, settings.channel]);

  return (
    <section className="page">
      <h1>提醒设置</h1>
      <p>
        为每日打卡安排提醒时间。Web 端使用 Notification API，
        移动端可接入本地通知（如 Flutter/RN）。
      </p>

      {inAppNotice ? (
        <div className="card">
          <strong>应用内提醒</strong>
          <p className="muted">{inAppNotice}</p>
        </div>
      ) : null}

      <div className="card form-card">
        <div className="form-row">
          <span>启用提醒</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  enabled: event.target.checked
                }))
              }
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="form-grid">
          <label className="form-field">
            <span>提醒时间</span>
            <input
              type="time"
              value={settings.time}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  time: event.target.value
                }))
              }
            />
          </label>
          <label className="form-field">
            <span>提醒渠道</span>
            <select
              value={settings.channel}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  channel: event.target.value
                }))
              }
            >
              <option value="web">浏览器通知</option>
              <option value="mobile">移动端本地通知</option>
              <option value="inapp">应用内提示</option>
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>提醒内容</span>
          <input
            type="text"
            value={settings.message}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                message: event.target.value
              }))
            }
          />
        </label>

        <div className="form-row">
          <div>
            <p className="muted">浏览器通知权限：{permission}</p>
            <p className="muted">Service Worker：{serviceWorkerStatus}</p>
            <p className="muted">{statusCopy}</p>
          </div>
          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={requestPermission}
              disabled={typeof Notification === "undefined"}
            >
              请求通知权限
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={previewReminder}
            >
              预览提醒
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>持久化与同步</h2>
        <p className="muted">
          当前设置与下一次提醒时间会保存在本地存储，后续可接入后端以同步多端提醒配置。
        </p>
      </div>
    </section>
  );
};

export default Reminders;
