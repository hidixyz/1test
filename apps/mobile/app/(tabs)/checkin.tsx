import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { tasksApi, checkinsApi, getTodayDate } from '../../api';

interface Task {
  id: number;
  name: string;
  description?: string;
}

interface Checkin {
  id: number;
  task_id: number;
  date: string;
  time: string;
  note?: string;
}

export default function CheckinScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingTaskId, setCheckingTaskId] = useState<number | null>(null);

  const today = getTodayDate();

  const loadData = useCallback(async () => {
    try {
      const [tasksData, checkinsData] = await Promise.all([
        tasksApi.getAll(),
        checkinsApi.getByDate(today),
      ]);
      setTasks(tasksData);
      setTodayCheckins(checkinsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      Alert.alert('错误', '加载数据失败，请检查网络连接');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // 检查任务是否已打卡
  const isTaskChecked = (taskId: number) => {
    return todayCheckins.some((c) => c.task_id === taskId);
  };

  // 打卡
  const handleCheckin = async (taskId: number) => {
    if (isTaskChecked(taskId)) {
      return;
    }

    setCheckingTaskId(taskId);
    try {
      const newCheckin = await checkinsApi.create({
        task_id: taskId,
        date: today,
      });
      setTodayCheckins((prev) => [...prev, newCheckin]);
      Alert.alert('成功', '打卡成功！');
    } catch (error: any) {
      Alert.alert('错误', error.message || '打卡失败');
    } finally {
      setCheckingTaskId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>打卡中心</Text>
        </View>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>打卡中心</Text>
        <Text style={styles.subtitle}>选择任务并完成今日打卡。</Text>
        <Text style={styles.dateText}>📅 {today}</Text>
      </View>

      {/* 任务列表 */}
      <View style={styles.taskList}>
        {tasks.map((task) => {
          const checked = isTaskChecked(task.id);
          const isChecking = checkingTaskId === task.id;

          return (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskDesc}>
                  {checked ? '今日已完成 ✓' : task.description || '今日目标'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.checkinBtn,
                  checked ? styles.checkinBtnChecked : styles.checkinBtnPrimary,
                ]}
                onPress={() => handleCheckin(task.id)}
                disabled={checked || isChecking}
                activeOpacity={0.7}
              >
                {isChecking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.checkinBtnText,
                      checked && styles.checkinBtnTextChecked,
                    ]}
                  >
                    {checked ? '已打卡 ✓' : '立即打卡'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无任务</Text>
            <Text style={styles.emptyHint}>请先在后台添加打卡任务</Text>
          </View>
        )}
      </View>

      {/* 今日完成统计 */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>今日进度</Text>
        <Text style={styles.statsText}>
          已完成 {todayCheckins.length} / {tasks.length} 项
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: tasks.length > 0
                  ? `${(todayCheckins.length / tasks.length) * 100}%`
                  : '0%',
              },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  checkinBtnPrimary: {
    backgroundColor: '#007AFF',
  },
  checkinBtnChecked: {
    backgroundColor: '#34C759',
  },
  checkinBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  checkinBtnTextChecked: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  statsCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
});
