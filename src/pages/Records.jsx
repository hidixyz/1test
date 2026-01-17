import { useEffect, useRef, useState } from "react";
import usePageTitle from "../hooks/usePageTitle.js";

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialRecords = [
  {
    id: 1,
    date: "2024-01-15",
    task: "晨间冥想",
    status: "已完成",
    note: "早晨安静 10 分钟",
    imageUrl: ""
  },
  {
    id: 2,
    date: "2024-01-14",
    task: "阅读 30 分钟",
    status: "已完成",
    note: "阅读《原子习惯》",
    imageUrl: ""
  },
  {
    id: 3,
    date: "2024-01-13",
    task: "运动 20 分钟",
    status: "已完成",
    note: "拉伸 + 跑步",
    imageUrl: ""
  }
];

const Records = () => {
  usePageTitle("记录");

  const [records, setRecords] = useState(initialRecords);
  const [selectedId, setSelectedId] = useState(initialRecords[0]?.id ?? null);
  const [task, setTask] = useState("晨间冥想");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const recordsRef = useRef(records);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    return () => {
      recordsRef.current.forEach((record) => {
        if (record.imageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(record.imageUrl);
        }
      });
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    setError("");

    if (!selectedFile) {
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      setError("仅支持 JPG、PNG、WebP 格式图片。");
      event.target.value = "";
      return;
    }

    const maxBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setError(`图片大小不能超过 ${MAX_IMAGE_SIZE_MB}MB。`);
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("请先选择或拍摄一张图片。");
      return;
    }

    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      task,
      status: "已完成",
      note: note.trim() || "暂无备注",
      imageUrl: URL.createObjectURL(file)
    };

    setRecords((prev) => [newRecord, ...prev]);
    setSelectedId(newRecord.id);
    setNote("");
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  };

  const selectedRecord = records.find((record) => record.id === selectedId) ?? records[0];

  return (
    <section className="page">
      <h1>记录列表</h1>
      <p>选择照片上传，保存你的打卡记录与成长瞬间。</p>

      <form className="record-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>打卡任务</span>
            <select value={task} onChange={(event) => setTask(event.target.value)}>
              <option value="晨间冥想">晨间冥想</option>
              <option value="阅读 30 分钟">阅读 30 分钟</option>
              <option value="运动 20 分钟">运动 20 分钟</option>
            </select>
          </label>
          <label className="form-field">
            <span>备注</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="写下今天的感受..."
              rows={3}
            />
          </label>
        </div>

        <div className="upload-control">
          <div>
            <p className="upload-title">上传照片</p>
            <p className="muted">
              Web 可通过文件选择器上传，移动端可直接调用相册/相机。支持 JPG/PNG/WebP，最大
              {MAX_IMAGE_SIZE_MB}MB。
            </p>
          </div>
          <label className="upload-button">
            选择/拍摄照片
            <input
              accept="image/*"
              capture="environment"
              type="file"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {previewUrl ? (
          <div className="upload-preview">
            <img src={previewUrl} alt="待上传预览" />
            <div>
              <p>预览就绪，点击保存完成上传。</p>
              <span className="muted">图片将保存为记录链接路径。</span>
            </div>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit">
          保存记录
        </button>
      </form>

      <div className="table">
        <div className="table-row table-head table-row-records">
          <span>日期</span>
          <span>任务</span>
          <span>状态</span>
          <span>照片</span>
        </div>
        {records.map((row) => (
          <button
            className={`table-row table-row-records ${row.id === selectedId ? "table-row-active" : ""}`}
            key={row.id}
            onClick={() => setSelectedId(row.id)}
            type="button"
          >
            <span>{row.date}</span>
            <span>{row.task}</span>
            <span>{row.status}</span>
            <span>
              {row.imageUrl ? (
                <img className="record-thumb" src={row.imageUrl} alt={`${row.task}缩略图`} />
              ) : (
                <span className="muted">暂无</span>
              )}
            </span>
          </button>
        ))}
      </div>

      {selectedRecord ? (
        <div className="record-detail">
          <div>
            <h2>记录详情</h2>
            <p className="muted">点击列表查看图片与备注。</p>
            <div className="record-meta">
              <span>日期：{selectedRecord.date}</span>
              <span>任务：{selectedRecord.task}</span>
              <span>状态：{selectedRecord.status}</span>
              <span>备注：{selectedRecord.note}</span>
              <span>图片路径：{selectedRecord.imageUrl || "暂无"}</span>
            </div>
          </div>
          {selectedRecord.imageUrl ? (
            <img
              className="record-image-large"
              src={selectedRecord.imageUrl}
              alt={`${selectedRecord.task}大图`}
            />
          ) : (
            <div className="record-image-placeholder">暂无图片</div>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default Records;
