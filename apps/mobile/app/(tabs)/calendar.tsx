import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { checkinsApi, getCurrentMonth } from '../../api';

// 中文本地化
LocaleConfig.locales['zh'] = {
  monthNames: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
  dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
};
LocaleConfig.defaultLocale = 'zh';

interface Checkin {
  id: number;
  task_id: number;
  task_name: string;
  date: string;
  time: string;
  note?: string;
}

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const loadCheckins = useCallback(async (month: string) => {
    setLoading(true);
    try {
      const data = await checkinsApi.getByMonth(month);
      setCheckins(data);

      // 构建标记日期
      const marks: MarkedDates = {};
      data.forEach((checkin: Checkin) => {
        marks[checkin.date] = {
          marked: true,
          dotColor: '#34C759',
        };
      });
      setMarkedDates(marks);
    } catch (error) {
      console.error('加载打卡记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCheckins(currentMonth);
  }, [currentMonth, loadCheckins]);

  // 处理日期选择
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    router.push(`/calendar/${day.dateString}`);
  };

  // 处理月份变化
  const handleMonthChange = (date: { year: number; month: number }) => {
    const month = `${date.year}-${String(date.month).padStart(2, '0')}`;
    setCurrentMonth(month);
  };

  // 获取选中日期的打卡记录
  const selectedDateCheckins = checkins.filter((c) => c.date === selectedDate);

  // 统计本月打卡天数
  const checkinDays = new Set(checkins.map((c) => c.date)).size;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>打卡日历</Text>
        <Text style={styles.subtitle}>
          本月已打卡 {checkinDays} 天，共 {checkins.length} 次
        </Text>
      </View>

      {/* 日历组件 */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={{
            ...markedDates,
            ...(selectedDate && {
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: '#007AFF',
              },
            }),
          }}
          theme={{
            backgroundColor: '#FFFFFF',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#8E8E93',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#007AFF',
            dayTextColor: '#000000',
            textDisabledColor: '#C7C7CC',
            dotColor: '#34C759',
            selectedDotColor: '#FFFFFF',
            arrowColor: '#007AFF',
            monthTextColor: '#000000',
            textDayFontWeight: '500',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '500',
          }}
        />
      </View>

      {loading && (
        <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
      )}

      {/* 图例说明 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>有打卡记录</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>选中日期</Text>
        </View>
      </View>

      {/* 提示文字 */}
      <Text style={styles.hint}>点击日期查看详细打卡记录</Text>
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
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loader: {
    marginTop: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    color: '#AEAEB2',
    marginTop: 16,
  },
});
