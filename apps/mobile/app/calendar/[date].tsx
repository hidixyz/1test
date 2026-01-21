import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { checkinsApi } from '../../api';

interface Checkin {
  id: number;
  task_id: number;
  task_name: string;
  date: string;
  time: string;
  note?: string;
}

export default function CalendarDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCheckins = async () => {
      if (!date) return;

      try {
        const data = await checkinsApi.getByDate(date);
        setCheckins(data);
      } catch (error) {
        console.error('加载记录失败:', error);
        Alert.alert('错误', '加载记录失败');
      } finally {
        setLoading(false);
      }
    };

    loadCheckins();
  }, [date]);

  // 删除记录
  const handleDelete = (id: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条打卡记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await checkinsApi.delete(id);
              setCheckins((prev) => prev.filter((c) => c.id !== id));
            } catch (error: any) {
              Alert.alert('错误', error.message || '删除失败');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.dateText}>📅 {date}</Text>
        <Text style={styles.subtitle}>
          {checkins.length > 0
            ? `共 ${checkins.length} 条打卡记录`
            : '当日无打卡记录'}
        </Text>
      </View>

      {/* 打卡记录列表 */}
      {checkins.length > 0 ? (
        <View style={styles.recordList}>
          {checkins.map((checkin) => (
            <TouchableOpacity
              key={checkin.id}
              style={styles.recordItem}
              onLongPress={() => handleDelete(checkin.id)}
              activeOpacity={0.7}
            >
              <View style={styles.recordHeader}>
                <Text style={styles.recordName}>{checkin.task_name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✓</Text>
                </View>
              </View>
              <Text style={styles.recordTime}>🕐 {checkin.time}</Text>
              {checkin.note && (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>备注：</Text>
                  <Text style={styles.noteText}>{checkin.note}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>当日暂无打卡记录</Text>
          <TouchableOpacity
            style={styles.goCheckinBtn}
            onPress={() => router.push('/checkin')}
          >
            <Text style={styles.goCheckinBtnText}>去打卡</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 长按提示 */}
      {checkins.length > 0 && (
        <Text style={styles.hint}>长按记录可删除</Text>
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
  loader: {
    marginTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  recordList: {
    gap: 12,
  },
  recordItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  recordTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  noteContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  goCheckinBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goCheckinBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#AEAEB2',
    marginTop: 24,
  },
});
