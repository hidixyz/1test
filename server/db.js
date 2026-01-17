import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'checkin.db'));

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
  CREATE INDEX IF NOT EXISTS idx_checkins_task_id ON checkins(task_id);
`);

// 插入默认任务（如果不存在）
const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (taskCount.count === 0) {
  const insertTask = db.prepare('INSERT INTO tasks (name, description) VALUES (?, ?)');
  insertTask.run('运动', '选择运动类型并记录时长');
  insertTask.run('阅读 30 分钟', '每天阅读30分钟书籍');
  insertTask.run('晨间冥想', '每天早上进行10分钟冥想');
}

export default db;
