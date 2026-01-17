import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "workoutRecords";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getCurrentTime = () =>
  new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

const readStoredRecords = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("无法读取本地打卡记录", error);
    return [];
  }
};

const notifyRecordsUpdate = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("workoutRecordsUpdated"));
};

const saveRecords = (nextRecords) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  notifyRecordsUpdate();
};

const buildRecord = ({ date, time, workoutType, notes, photoUrl }) => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
  date,
  time,
  workoutType,
  notes,
  photoUrl,
  createdAt: new Date().toISOString()
});

const useWorkoutRecords = () => {
  const [records, setRecords] = useState(() => readStoredRecords());

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event || event.key === STORAGE_KEY || event.type === "workoutRecordsUpdated") {
        setRecords(readStoredRecords());
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("workoutRecordsUpdated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("workoutRecordsUpdated", handleStorage);
    };
  }, []);

  const addRecord = useCallback((input) => {
    const record = buildRecord({
      date: input.date || getTodayDate(),
      time: input.time || getCurrentTime(),
      workoutType: input.workoutType,
      notes: input.notes || "",
      photoUrl: input.photoUrl || ""
    });

    setRecords((prev) => {
      const next = [record, ...prev];
      saveRecords(next);
      return next;
    });
  }, []);

  const today = getTodayDate();

  const todayRecords = useMemo(
    () => records.filter((record) => record.date === today),
    [records, today]
  );

  return {
    records,
    addRecord,
    today,
    todayRecords,
    getTodayDate,
    getCurrentTime
  };
};

export default useWorkoutRecords;
