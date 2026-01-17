import { Router } from 'express';
import db from '../db.js';

const router = Router();

// 获取所有任务
router.get('/', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个任务
router.get('/:id', (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建新任务
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: '任务名称不能为空' });
    }
    const result = db.prepare('INSERT INTO tasks (name, description) VALUES (?, ?)').run(name, description || '');
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新任务
router.put('/:id', (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: '任务不存在' });
    }
    db.prepare('UPDATE tasks SET name = ?, description = ? WHERE id = ?').run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      req.params.id
    );
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除任务
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: '任务不存在' });
    }
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ message: '任务已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
