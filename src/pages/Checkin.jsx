import { useState, useEffect } from "react";
import usePageTitle from "../hooks/usePageTitle.js";
import { tasksApi, checkinsApi, getTodayDate } from "../api.js";
import { getStorageSync, setStorageSync } from "../adapters/storage.js";
import {
  CATEGORY_TEMPLATES,
  ICON_OPTIONS,
  DEFAULT_EXERCISE_CATEGORY,
  DURATION_OPTIONS,
  DEFAULT_EXERCISE_TYPES,
  createCategory,
  STORAGE_KEYS
} from "../../shared/index.js";
import {
  getCategoryForTask,
  getAllCategories,
  getExistingCategoryNames,
  buildCheckinNote,
  calculateTotalMeasure,
  getVisiblePresetTags,
  getAllAvailableTags
} from "../../shared/logic/checkin.js";

// ============ 存储工具函数 ============
const loadCustomCategories = () => {
  return getStorageSync(STORAGE_KEYS.CUSTOM_CATEGORIES) || {};
};

const saveCustomCategories = (categories) => {
  setStorageSync(STORAGE_KEYS.CUSTOM_CATEGORIES, categories);
};

const loadCustomTypes = () => {
  return getStorageSync(STORAGE_KEYS.CUSTOM_EXERCISE_TYPES) || [];
};

const saveCustomTypes = (types) => {
  setStorageSync(STORAGE_KEYS.CUSTOM_EXERCISE_TYPES, types);
};

const loadHiddenPresetTypes = () => {
  return getStorageSync(STORAGE_KEYS.HIDDEN_PRESET_TYPES) || [];
};

const saveHiddenPresetTypes = (types) => {
  setStorageSync(STORAGE_KEYS.HIDDEN_PRESET_TYPES, types);
};

const loadCategoryHidden = () => {
  return getStorageSync(STORAGE_KEYS.EXERCISE_CATEGORY_HIDDEN) === true;
};

const saveCategoryHidden = (hidden) => {
  setStorageSync(STORAGE_KEYS.EXERCISE_CATEGORY_HIDDEN, hidden);
};

// ============ 创建分类弹窗组件 ============
const CreateCategoryModal = ({ onClose, onCreateCategory, existingCategoryNames }) => {
  const [step, setStep] = useState('choose'); // 'choose' | 'custom'
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const [measureType, setMeasureType] = useState('duration');
  const [measureOptions, setMeasureOptions] = useState([5, 10, 15, 20, 30]);
  const [measureUnit, setMeasureUnit] = useState('分钟');
  const [presetTags, setPresetTags] = useState([]);
  const [newTagValue, setNewTagValue] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // 过滤掉已存在的模板
  const availableTemplates = CATEGORY_TEMPLATES.filter(
    t => !existingCategoryNames.includes(t.name)
  );

  // 从模板创建
  const handleCreateFromTemplate = async (template) => {
    if (existingCategoryNames.includes(template.name)) {
      setError(`"${template.name}" 分类已存在`);
      return;
    }
    setCreating(true);
    setError('');
    try {
      await onCreateCategory({
        name: template.name,
        icon: template.icon,
        presetTags: template.presetTags,
        measureType: template.measureType,
        measureOptions: template.measureOptions,
        measureUnit: template.measureUnit
      });
      onClose();
    } catch (err) {
      setError(err.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  // 自定义创建
  const handleCustomCreate = async () => {
    if (!name.trim()) {
      setError('请输入分类名称');
      return;
    }
    if (existingCategoryNames.includes(name.trim())) {
      setError(`"${name.trim()}" 分类已存在`);
      return;
    }
    setCreating(true);
    setError('');
    try {
      await onCreateCategory({
        name: name.trim(),
        icon,
        presetTags,
        measureType,
        measureOptions: measureType === 'none' ? [] : measureOptions,
        measureUnit: measureType === 'none' ? '' : measureUnit
      });
      onClose();
    } catch (err) {
      setError(err.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  // 添加预置标签
  const handleAddTag = () => {
    const trimmed = newTagValue.trim();
    if (trimmed && !presetTags.includes(trimmed)) {
      setPresetTags([...presetTags, trimmed]);
      setNewTagValue('');
    }
  };

  // 删除预置标签
  const handleRemoveTag = (tag) => {
    setPresetTags(presetTags.filter(t => t !== tag));
  };

  // 添加度量选项
  const handleAddOption = () => {
    const num = parseInt(newOptionValue, 10);
    if (!isNaN(num) && num > 0 && !measureOptions.includes(num)) {
      setMeasureOptions([...measureOptions, num].sort((a, b) => a - b));
      setNewOptionValue('');
    }
  };

  // 删除度量选项
  const handleRemoveOption = (opt) => {
    setMeasureOptions(measureOptions.filter(o => o !== opt));
  };

  // 更新度量类型时调整默认选项
  const handleMeasureTypeChange = (type) => {
    setMeasureType(type);
    if (type === 'duration') {
      setMeasureOptions([5, 10, 15, 20, 30]);
      setMeasureUnit('分钟');
    } else if (type === 'count') {
      setMeasureOptions([1, 2, 3, 5, 10]);
      setMeasureUnit('个');
    } else {
      setMeasureOptions([]);
      setMeasureUnit('');
    }
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="create-category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-category-header">
          <h3>添加新分类</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="create-category-error">{error}</div>}

        {step === 'choose' ? (
          <>
            {/* 快速添加模板 */}
            {availableTemplates.length > 0 && (
              <div className="template-section">
                <h4 className="template-section-title">📌 快速添加模板</h4>
                <div className="template-list">
                  {availableTemplates.map(template => (
                    <button
                      key={template.name}
                      className="template-item"
                      onClick={() => handleCreateFromTemplate(template)}
                      disabled={creating}
                    >
                      <span className="template-icon">{template.icon}</span>
                      <span className="template-name">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 分隔线 */}
            <div className="create-category-divider">
              <span>或</span>
            </div>

            {/* 自定义创建入口 */}
            <button
              className="custom-create-entry"
              onClick={() => setStep('custom')}
            >
              <span className="custom-create-icon">✨</span>
              <div className="custom-create-text">
                <span className="custom-create-title">自定义创建</span>
                <span className="custom-create-desc">自定义图标、标签和度量方式</span>
              </div>
              <span className="custom-create-arrow">→</span>
            </button>
          </>
        ) : (
          <>
            {/* 返回按钮 */}
            <button className="back-btn" onClick={() => setStep('choose')}>
              ← 返回
            </button>

            {/* 自定义创建表单 */}
            <div className="custom-create-form">
              {/* 图标选择 */}
              <div className="form-group">
                <label>图标</label>
                <div className="icon-picker">
                  {ICON_OPTIONS.map(ic => (
                    <button
                      key={ic}
                      className={`icon-option ${icon === ic ? 'active' : ''}`}
                      onClick={() => setIcon(ic)}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* 名称输入 */}
              <div className="form-group">
                <label>名称</label>
                <input
                  type="text"
                  placeholder="输入分类名称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={10}
                />
              </div>

              {/* 度量类型 */}
              <div className="form-group">
                <label>度量类型</label>
                <div className="measure-type-options">
                  <label className={`measure-type-option ${measureType === 'duration' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="measureType"
                      value="duration"
                      checked={measureType === 'duration'}
                      onChange={() => handleMeasureTypeChange('duration')}
                    />
                    <span>⏱️ 时长</span>
                  </label>
                  <label className={`measure-type-option ${measureType === 'count' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="measureType"
                      value="count"
                      checked={measureType === 'count'}
                      onChange={() => handleMeasureTypeChange('count')}
                    />
                    <span>🔢 数量</span>
                  </label>
                  <label className={`measure-type-option ${measureType === 'none' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="measureType"
                      value="none"
                      checked={measureType === 'none'}
                      onChange={() => handleMeasureTypeChange('none')}
                    />
                    <span>✓ 无</span>
                  </label>
                </div>
              </div>

              {/* 度量选项（仅在非 none 时显示） */}
              {measureType !== 'none' && (
                <div className="form-group">
                  <label>度量选项</label>
                  <div className="measure-options-editor">
                    <div className="measure-options-list">
                      {measureOptions.map(opt => (
                        <span key={opt} className="measure-option-tag">
                          {opt}
                          <button onClick={() => handleRemoveOption(opt)}>×</button>
                        </span>
                      ))}
                      <div className="measure-option-add">
                        <input
                          type="number"
                          placeholder="添加"
                          value={newOptionValue}
                          onChange={(e) => setNewOptionValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                          min="1"
                        />
                        <button onClick={handleAddOption}>+</button>
                      </div>
                    </div>
                    <div className="measure-unit-input">
                      <label>单位</label>
                      <input
                        type="text"
                        placeholder="分钟/页/个"
                        value={measureUnit}
                        onChange={(e) => setMeasureUnit(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 预置标签 */}
              <div className="form-group">
                <label>预置标签（可选）</label>
                <div className="preset-tags-editor">
                  {presetTags.map(tag => (
                    <span key={tag} className="preset-tag-item">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>×</button>
                    </span>
                  ))}
                  <div className="preset-tag-add">
                    <input
                      type="text"
                      placeholder="添加标签"
                      value={newTagValue}
                      onChange={(e) => setNewTagValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      maxLength={10}
                    />
                    <button onClick={handleAddTag}>+</button>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="form-actions">
                <button className="secondary-button" onClick={onClose}>
                  取消
                </button>
                <button
                  className="primary-button"
                  onClick={handleCustomCreate}
                  disabled={creating || !name.trim()}
                >
                  {creating ? '创建中...' : '创建分类'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============ 通用分类打卡组件 ============
const CategoryCheckin = ({
  category,
  task,
  onComplete,
  isChecked,
  completedText = "今日已完成"
}) => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customTags, setCustomTags] = useState(() => {
    // 对于运动分类，使用旧的存储方式保持兼容
    if (category.id === 'exercise_default') {
      return loadCustomTypes();
    }
    return category.customTags || [];
  });
  const [hiddenTags, setHiddenTags] = useState(() => {
    if (category.id === 'exercise_default') {
      return loadHiddenPresetTypes();
    }
    return category.hiddenTags || [];
  });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 使用共享函数获取可见标签
  const visiblePresetTags = getVisiblePresetTags(category.presetTags, hiddenTags);
  const allTags = getAllAvailableTags(category.presetTags, customTags, hiddenTags);

  // 使用共享函数计算总量
  const totalMeasure = calculateTotalMeasure(selectedItems);

  // 保存自定义标签
  const saveCustomTagsToStorage = (tags) => {
    if (category.id === 'exercise_default') {
      saveCustomTypes(tags);
    } else {
      // 更新自定义分类的 customTags
      const categories = loadCustomCategories();
      if (categories[category.id]) {
        categories[category.id].customTags = tags;
        saveCustomCategories(categories);
      }
    }
  };

  // 保存隐藏标签
  const saveHiddenTagsToStorage = (tags) => {
    if (category.id === 'exercise_default') {
      saveHiddenPresetTypes(tags);
    } else {
      const categories = loadCustomCategories();
      if (categories[category.id]) {
        categories[category.id].hiddenTags = tags;
        saveCustomCategories(categories);
      }
    }
  };

  // 选择标签
  const handleTagSelect = (tag) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  // 选择度量值
  const handleMeasureSelect = (measure) => {
    if (!selectedTag) return;
    setSelectedItems(prev => [...prev, { tag: selectedTag, measure }]);
    setSelectedTag(null);
  };

  // 删除已选项
  const handleRemoveItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  // 添加自定义标签
  const handleAddCustomTag = () => {
    const trimmed = customInputValue.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      const newCustomTags = [...customTags, trimmed];
      setCustomTags(newCustomTags);
      saveCustomTagsToStorage(newCustomTags);
      setSelectedTag(trimmed);
    }
    setCustomInputValue("");
    setShowCustomInput(false);
  };

  // 提交打卡
  const handleSubmit = async () => {
    // 对于无度量类型，允许直接打卡
    if (category.measureType === 'none' && selectedItems.length === 0) {
      setSubmitting(true);
      try {
        const note = buildCheckinNote(category, []);
        await onComplete(task.id, note);
      } catch (error) {
        alert(error.message || "打卡失败");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (selectedItems.length === 0) return;

    setSubmitting(true);
    try {
      const note = buildCheckinNote(category, selectedItems);
      await onComplete(task.id, note);
    } catch (error) {
      alert(error.message || "打卡失败");
    } finally {
      setSubmitting(false);
    }
  };

  // 已打卡状态
  if (isChecked) {
    return (
      <div className="exercise-checkin">
        <div className="exercise-header">
          <span>{category.icon}</span>
          <h3>{category.name}</h3>
        </div>
        <p className="muted">{completedText}</p>
      </div>
    );
  }

  return (
    <div className="exercise-checkin">
      <div className="exercise-header">
        <span>{category.icon}</span>
        <h3>{category.name}</h3>
      </div>

      <p className="exercise-hint">
        {category.measureType === 'none'
          ? '点击下方按钮完成打卡'
          : `点击选择${category.name}类型和${category.measureType === 'duration' ? '时长' : '数量'}`}
      </p>

      {/* 标签列表（仅当有标签时显示） */}
      {allTags.length > 0 && (
        <div className="exercise-tags">
          {visiblePresetTags.map((tag) => (
            <button
              key={tag}
              className={`exercise-tag ${selectedTag === tag ? "active" : ""}`}
              onClick={() => handleTagSelect(tag)}
            >
              {tag}
            </button>
          ))}
          {customTags.map((tag) => (
            <button
              key={tag}
              className={`exercise-tag ${selectedTag === tag ? "active" : ""}`}
              onClick={() => handleTagSelect(tag)}
            >
              {tag}
            </button>
          ))}
          {category.measureType !== 'none' && (
            <button
              className="exercise-tag add"
              onClick={() => setShowCustomInput(true)}
            >
              + 添加
            </button>
          )}
        </div>
      )}

      {/* 度量选择（选中标签后显示，仅非 none 类型） */}
      {selectedTag && category.measureType !== 'none' && (
        <div className="duration-section">
          <p className="duration-label">
            ── 选择{category.measureType === 'duration' ? '时长' : '数量'} ──
          </p>
          <div className="duration-tags">
            {(category.measureOptions || []).map((measure) => (
              <button
                key={measure}
                className="duration-tag"
                onClick={() => handleMeasureSelect(measure)}
              >
                {measure}{category.measureUnit}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 已选择列表 */}
      {selectedItems.length > 0 && (
        <div className="selected-section">
          <p className="selected-label">── 已选择 ──</p>
          <div className="selected-exercises">
            {selectedItems.map((item, index) => (
              <div key={index} className="selected-item">
                <div className="selected-item-info">
                  <span className="selected-item-check">✓</span>
                  <span>
                    {item.tag} {item.measure}{category.measureUnit}
                  </span>
                </div>
                <button
                  className="selected-item-delete"
                  onClick={() => handleRemoveItem(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      {(selectedItems.length > 0 || category.measureType === 'none') && (
        <div className="exercise-submit">
          <button
            className="exercise-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "提交中..."
              : category.measureType === 'none'
                ? "完成打卡"
                : `完成打卡 (${totalMeasure}${category.measureUnit})`}
          </button>
        </div>
      )}

      {/* 自定义标签输入弹窗 */}
      {showCustomInput && (
        <div className="custom-input-overlay" onClick={() => setShowCustomInput(false)}>
          <div className="custom-input-modal" onClick={(e) => e.stopPropagation()}>
            <h4>添加自定义{category.name}类型</h4>
            <input
              type="text"
              placeholder="输入类型名称"
              value={customInputValue}
              onChange={(e) => setCustomInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomTag()}
              autoFocus
            />
            <div className="custom-input-actions">
              <button
                className="secondary-button"
                onClick={() => setShowCustomInput(false)}
              >
                取消
              </button>
              <button className="primary-button" onClick={handleAddCustomTag}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ 添加分类按钮组件 ============
const AddCategoryButton = ({ onClick }) => (
  <button className="add-category-btn" onClick={onClick}>
    <span className="add-category-icon">+</span>
    <span className="add-category-text">添加新分类</span>
  </button>
);

// ============ 分类管理弹窗组件 ============
const CategoryManageModal = ({
  category,
  onClose,
  onDeleteCategory,
  onUpdateCategory
}) => {
  const [customTags, setCustomTags] = useState(() => {
    if (category.id === 'exercise_default') {
      return loadCustomTypes();
    }
    return category.customTags || [];
  });
  const [hiddenTags, setHiddenTags] = useState(() => {
    if (category.id === 'exercise_default') {
      return loadHiddenPresetTypes();
    }
    return category.hiddenTags || [];
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');

  const visiblePresetTags = getVisiblePresetTags(category.presetTags, hiddenTags);
  const allTags = getAllAvailableTags(category.presetTags, customTags, hiddenTags);

  // 保存自定义标签
  const saveCustomTagsToStorage = (tags) => {
    if (category.id === 'exercise_default') {
      saveCustomTypes(tags);
    } else {
      const categories = loadCustomCategories();
      if (categories[category.id]) {
        categories[category.id].customTags = tags;
        saveCustomCategories(categories);
      }
    }
  };

  // 保存隐藏标签
  const saveHiddenTagsToStorage = (tags) => {
    if (category.id === 'exercise_default') {
      saveHiddenPresetTypes(tags);
    } else {
      const categories = loadCustomCategories();
      if (categories[category.id]) {
        categories[category.id].hiddenTags = tags;
        saveCustomCategories(categories);
      }
    }
  };

  // 添加标签
  const handleAddTag = () => {
    const trimmed = newTagValue.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      const newCustomTags = [...customTags, trimmed];
      setCustomTags(newCustomTags);
      saveCustomTagsToStorage(newCustomTags);
      setNewTagValue('');
    }
  };

  // 删除标签
  const handleDeleteTag = (tag) => {
    if ((category.presetTags || []).includes(tag)) {
      const newHiddenTags = [...hiddenTags, tag];
      setHiddenTags(newHiddenTags);
      saveHiddenTagsToStorage(newHiddenTags);
    } else {
      const newCustomTags = customTags.filter(t => t !== tag);
      setCustomTags(newCustomTags);
      saveCustomTagsToStorage(newCustomTags);
    }
  };

  // 恢复预置标签
  const handleRestorePresetTags = () => {
    setHiddenTags([]);
    saveHiddenTagsToStorage([]);
  };

  // 清空所有标签
  const handleClearAllTags = () => {
    setHiddenTags([...category.presetTags || []]);
    saveHiddenTagsToStorage([...category.presetTags || []]);
    setCustomTags([]);
    saveCustomTagsToStorage([]);
  };

  // 删除分类
  const handleDeleteCategory = () => {
    if (category.isCustom) {
      onDeleteCategory(category);
    } else {
      saveCategoryHidden(true);
      window.location.reload();
    }
    onClose();
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="category-manage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="category-manage-modal-header">
          <h3>{category.icon} {category.name} 管理</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* 标签管理区 */}
        <div className="category-manage-tags-section">
          <h4>标签管理</h4>
          <div className="category-manage-tags">
            {visiblePresetTags.map((tag) => (
              <span key={tag} className="category-manage-tag preset">
                {tag}
                <button onClick={() => handleDeleteTag(tag)}>×</button>
              </span>
            ))}
            {customTags.map((tag) => (
              <span key={tag} className="category-manage-tag custom">
                {tag}
                <button onClick={() => handleDeleteTag(tag)}>×</button>
              </span>
            ))}
          </div>

          {/* 添加新标签 */}
          <div className="category-manage-add-tag">
            <input
              type="text"
              placeholder="添加新标签"
              value={newTagValue}
              onChange={(e) => setNewTagValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button onClick={handleAddTag}>+</button>
          </div>
        </div>

        {/* 操作按钮区 */}
        <div className="category-manage-actions">
          {hiddenTags.length > 0 && (
            <button
              className="category-manage-action-btn restore"
              onClick={handleRestorePresetTags}
            >
              <span>↻</span>
              恢复预置标签 ({hiddenTags.length})
            </button>
          )}
          {allTags.length > 0 && (
            <button
              className="category-manage-action-btn warning"
              onClick={handleClearAllTags}
            >
              <span>🗑</span>
              清空所有标签
            </button>
          )}
          <button
            className="category-manage-action-btn danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <span>⊘</span>
            {category.isCustom ? '删除分类' : '隐藏分类'}
          </button>
        </div>

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div className="category-manage-confirm">
            <div className="category-manage-confirm-content">
              <div className="confirm-icon">⊘</div>
              <h4>{category.isCustom ? `删除${category.name}分类` : `隐藏${category.name}分类`}</h4>
              <p className="confirm-desc">
                {category.isCustom
                  ? '此操作将删除该分类及其后端任务，不可恢复。'
                  : '此操作将隐藏整个打卡分类，可通过管理区域恢复。'}
              </p>
              <div className="confirm-actions">
                <button
                  className="confirm-btn cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  取消
                </button>
                <button
                  className="confirm-btn danger"
                  onClick={handleDeleteCategory}
                >
                  确认{category.isCustom ? '删除' : '隐藏'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ 分类管理区域组件 ============
const CategoryManageSection = ({
  categories,
  exerciseCategoryHidden,
  onManageCategory,
  onAddCategory,
  onRestoreExercise
}) => {
  return (
    <div className="category-manage-section">
      <h3 className="category-manage-section-title">
        <span>⚙️</span> 分类管理
      </h3>
      <div className="category-manage-list">
        {/* 运动分类（隐藏时显示恢复按钮） */}
        {exerciseCategoryHidden ? (
          <button
            className="category-manage-item hidden"
            onClick={onRestoreExercise}
          >
            <span className="category-manage-item-icon">🏃</span>
            <span className="category-manage-item-name">运动</span>
            <span className="category-manage-item-badge">已隐藏</span>
            <span className="category-manage-item-action">↻ 恢复</span>
          </button>
        ) : (
          <button
            className="category-manage-item"
            onClick={() => onManageCategory(categories.find(c => c.id === 'exercise_default'))}
          >
            <span className="category-manage-item-icon">🏃</span>
            <span className="category-manage-item-name">运动</span>
            <span className="category-manage-item-gear">⚙</span>
          </button>
        )}

        {/* 自定义分类 */}
        {categories.filter(c => c.isCustom).map((cat) => (
          <button
            key={cat.id}
            className="category-manage-item"
            onClick={() => onManageCategory(cat)}
          >
            <span className="category-manage-item-icon">{cat.icon}</span>
            <span className="category-manage-item-name">{cat.name}</span>
            <span className="category-manage-item-gear">⚙</span>
          </button>
        ))}
      </div>

      {/* 添加新分类按钮 */}
      <AddCategoryButton onClick={onAddCategory} />
    </div>
  );
};

// ============ 主组件 ============
const Checkin = () => {
  usePageTitle("打卡");

  const [tasks, setTasks] = useState([]);
  const [todayCheckins, setTodayCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null);
  const [exerciseCategoryHidden, setExerciseCategoryHidden] = useState(() => loadCategoryHidden());
  const [customCategories, setCustomCategories] = useState(() => loadCustomCategories());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedCategoryForManage, setSelectedCategoryForManage] = useState(null);

  const today = getTodayDate();

  // 恢复运动分类
  const handleRestoreExerciseCategory = () => {
    saveCategoryHidden(false);
    setExerciseCategoryHidden(false);
  };

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, checkinsData] = await Promise.all([
          tasksApi.getAll(),
          checkinsApi.getByDate(today),
        ]);
        setTasks(tasksData);
        setTodayCheckins(checkinsData);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [today]);

  // 检查任务是否已打卡
  const isTaskChecked = (taskId) => {
    return todayCheckins.some((c) => c.task_id === taskId);
  };

  // 获取任务对应的分类配置（使用共享函数）
  const getCategory = (task) => {
    return getCategoryForTask(task, customCategories);
  };

  // 获取所有已存在的分类名称（使用共享函数）
  const getExistingNames = () => {
    return getExistingCategoryNames(tasks, customCategories);
  };

  // 普通打卡
  const handleCheckin = async (taskId) => {
    if (isTaskChecked(taskId)) {
      return;
    }

    setChecking(taskId);
    try {
      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: today,
      });
      setTodayCheckins((prev) => [...prev, newCheckin]);
    } catch (error) {
      alert(error.message || "打卡失败");
    } finally {
      setChecking(null);
    }
  };

  // 分类打卡（带 note）
  const handleCategoryCheckin = async (taskId, note) => {
    const newCheckin = await checkinsApi.create({
      task_id: taskId,
      date: today,
      note: note,
    });
    setTodayCheckins((prev) => [...prev, newCheckin]);
  };

  // 创建新分类
  const handleCreateCategory = async (categoryData) => {
    // 1. 创建后端任务
    const task = await tasksApi.create({
      name: categoryData.name,
      description: `${categoryData.icon} ${categoryData.name}打卡`
    });

    // 2. 使用共享函数创建分类配置
    const category = createCategory(task.id, categoryData);

    const updatedCategories = { ...customCategories, [category.id]: category };
    setCustomCategories(updatedCategories);
    saveCustomCategories(updatedCategories);

    // 3. 刷新任务列表
    setTasks(prev => [...prev, task]);
  };

  // 删除自定义分类
  const handleDeleteCategory = async (category) => {
    if (!category.isCustom) return;

    try {
      // 删除后端任务
      await tasksApi.delete(category.taskId);

      // 删除本地存储的分类配置
      const updatedCategories = { ...customCategories };
      delete updatedCategories[category.id];
      setCustomCategories(updatedCategories);
      saveCustomCategories(updatedCategories);

      // 刷新任务列表
      setTasks(prev => prev.filter(t => t.id !== category.taskId));
    } catch (error) {
      alert(error.message || "删除失败");
    }
  };

  // 获取所有分类（使用共享函数）
  const getCategories = () => {
    return getAllCategories(tasks, customCategories);
  };

  // 打开管理弹窗
  const handleOpenManageModal = (category) => {
    if (category) {
      setSelectedCategoryForManage(category);
      setShowManageModal(true);
    }
  };

  // 关闭管理弹窗
  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setSelectedCategoryForManage(null);
  };

  if (loading) {
    return (
      <section className="page">
        <h1>打卡中心</h1>
        <p>加载中...</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>打卡中心</h1>
      <p>选择任务并完成今日打卡。</p>
      <div className="list">
        {tasks.map((task) => {
          const checked = isTaskChecked(task.id);
          const isChecking = checking === task.id;
          const category = getCategory(task);

          // 如果有匹配的分类配置，使用 CategoryCheckin 组件
          if (category) {
            // 运动分类被隐藏时跳过（在管理区域处理恢复）
            if (task.name === "运动" && exerciseCategoryHidden) {
              return null;
            }

            return (
              <CategoryCheckin
                key={task.id}
                category={category}
                task={task}
                onComplete={handleCategoryCheckin}
                isChecked={checked}
              />
            );
          }

          // 其他任务使用普通打卡
          return (
            <div className="list-item" key={task.id}>
              <div>
                <h3>{task.name}</h3>
                <p className="muted">
                  {checked ? "今日已完成" : task.description || "今日目标"}
                </p>
              </div>
              <button
                className={checked ? "primary-button" : "secondary-button"}
                type="button"
                onClick={() => handleCheckin(task.id)}
                disabled={checked || isChecking}
              >
                {isChecking ? "打卡中..." : checked ? "已打卡 ✓" : "立即打卡"}
              </button>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="muted">暂无任务</p>}
      </div>

      {/* 分类管理区域 */}
      <CategoryManageSection
        categories={getCategories()}
        exerciseCategoryHidden={exerciseCategoryHidden}
        onManageCategory={handleOpenManageModal}
        onAddCategory={() => setShowCreateModal(true)}
        onRestoreExercise={handleRestoreExerciseCategory}
      />

      {/* 分类管理弹窗 */}
      {showManageModal && selectedCategoryForManage && (
        <CategoryManageModal
          category={selectedCategoryForManage}
          onClose={handleCloseManageModal}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* 创建分类弹窗 */}
      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onCreateCategory={handleCreateCategory}
          existingCategoryNames={getExistingNames()}
        />
      )}
    </section>
  );
};

export { CategoryCheckin };
export default Checkin;
