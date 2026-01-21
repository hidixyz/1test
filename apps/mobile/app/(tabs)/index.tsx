import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { statsApi, tasksApi } from '../../api';

interface Stats {
  totalCheckins: number;
  streakDays: number;
  todayCheckins: number;
  recentCheckins?: Array<{
    id: number;
    task_name: string;
    date: string;
    time: string;
  }>;
}

interface Task {
  id: number;
  name: string;
  description?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          statsApi.get(),
          tasksApi.getAll(),
        ]);
        setStats(statsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>欢迎回来</Text>
          <Text style={styles.subtitle}>加载中...</Text>
        </View>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>在这里快速查看今日目标、提醒与进度。</Text>
      </View>

      {/* 统计卡片 */}
      <View style={styles.cardGrid}>
        <TouchableOpacity
          style={[styles.card, styles.cardInteractive]}
          onPress={() => router.push('/checkin')}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTitle}>今日目标</Text>
          <Text style={styles.cardText}>
            完成 {tasks.length} 项打卡任务
            {stats && stats.todayCheckins > 0 && (
              <Text style={styles.cardHighlight}>
                （已完成 {stats.todayCheckins} 项）
              </Text>
            )}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>连续打卡</Text>
          <Text style={styles.cardText}>
            {stats
              ? `保持 ${stats.streakDays} 天连续打卡记录`
              : '暂无打卡记录'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.card, styles.cardInteractive]}
          onPress={() => router.push('/records')}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTitle}>累计打卡</Text>
          <Text style={styles.cardText}>
            {stats
              ? `共 ${stats.totalCheckins} 次打卡记录`
              : '开始你的第一次打卡吧'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 最近打卡 */}
      {stats?.recentCheckins && stats.recentCheckins.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>最近打卡</Text>
          {stats.recentCheckins.slice(0, 3).map((checkin) => (
            <View key={checkin.id} style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{checkin.task_name}</Text>
                <Text style={styles.listItemSubtitle}>
                  {checkin.date} {checkin.time}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>已完成</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  },
  loader: {
    marginTop: 40,
  },
  cardGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardInteractive: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },
  cardHighlight: {
    color: '#34C759',
    fontWeight: '500',
  },
  recentSection: {
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  badge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
