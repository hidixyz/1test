import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { checkinsApi } from '../../api';

interface Checkin {
  id: number;
  task_id: number;
  task_name: string;
  date: string;
  time: string;
  note?: string;
}

export default function RecordsScreen() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCheckins = useCallback(async () => {
    try {
      const data = await checkinsApi.getAll();
      // 按日期倒序排列
      const sorted = data.sort((a: Checkin, b: Checkin) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      });
      setCheckins(sorted);
    } catch (error) {
      console.error('加载记录失败:', error);
      Alert.alert('错误', '加载记录失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCheckins();
  }, [loadCheckins]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCheckins();
  }, [loadCheckins]);

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

  // 按日期分组
  const groupedCheckins = checkins.reduce((groups, checkin) => {
    const date = checkin.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(checkin);
    return groups;
  }, {} as Record<string, Checkin[]>);

  const groupedData = Object.entries(groupedCheckins).map(([date, items]) => ({
    date,
    data: items,
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>打卡记录</Text>
        </View>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>打卡记录</Text>
            <Text style={styles.subtitle}>共 {checkins.length} 条记录</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>暂无打卡记录</Text>
            <Text style={styles.emptyHint}>开始你的第一次打卡吧</Text>
          </View>
        }
        renderItem={({ item: group }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{group.date}</Text>
            {group.data.map((checkin) => (
              <TouchableOpacity
                key={checkin.id}
                style={styles.recordItem}
                onLongPress={() => handleDelete(checkin.id)}
                activeOpacity={0.7}
              >
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{checkin.task_name}</Text>
                  <Text style={styles.recordTime}>{checkin.time}</Text>
                  {checkin.note && (
                    <Text style={styles.recordNote} numberOfLines={2}>
                      {checkin.note}
                    </Text>
                  )}
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✓</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
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
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    paddingLeft: 4,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  recordInfo: {
    flex: 1,
    marginRight: 12,
  },
  recordName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recordTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recordNote: {
    fontSize: 13,
    color: '#AEAEB2',
    marginTop: 6,
    fontStyle: 'italic',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#AEAEB2',
  },
});
