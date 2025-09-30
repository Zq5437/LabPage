<template>
  <div class="page-container">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>欢迎回来，{{ username }}！</h2>
            <p>今天是 {{ currentDate }}，祝您工作愉快</p>
          </div>
          <div class="welcome-actions">
            <el-button type="primary" @click="$router.push('/news/create')">
              <el-icon>
                <Plus />
              </el-icon>
              发布新闻
            </el-button>
            <el-button @click="$router.push('/members')">
              <el-icon>
                <UserFilled />
              </el-icon>
              添加成员
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="stat in statsData" :key="stat.key">
          <div class="stats-card" :class="stat.type">
            <div class="stats-icon" :class="stat.type">
              <el-icon :size="24">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-title">{{ stat.title }}</div>
              <div class="stats-value">
                <AnimatedNumber :value="stat.value" />
              </div>
              <div v-if="stat.trend" class="stats-trend" :class="stat.trend.type">
                <el-icon>
                  <ArrowUp v-if="stat.trend.type === 'up'" />
                  <ArrowDown v-else />
                </el-icon>
                {{ stat.trend.text }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 访问趋势 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="title">访问趋势</span>
                <el-radio-group v-model="visitTrendPeriod" size="small">
                  <el-radio-button label="7">7天</el-radio-button>
                  <el-radio-button label="30">30天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <VisitTrendChart :data="chartData.visitTrend" :loading="false" />
          </el-card>
        </el-col>

        <!-- 内容分布 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="title">内容分布</span>
              </div>
            </template>
            <ContentDistributionChart />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最新动态 -->
    <div class="activity-section">
      <el-row :gutter="20">
        <!-- 最新新闻 -->
        <el-col :xs="24" :lg="12">
          <el-card class="activity-card">
            <template #header>
              <div class="card-header">
                <span class="title">最新新闻</span>
                <el-button type="text" @click="$router.push('/news')">
                  查看全部
                  <el-icon>
                    <ArrowRight />
                  </el-icon>
                </el-button>
              </div>
            </template>
            <RecentNewsList />
          </el-card>
        </el-col>

        <!-- 联系留言 -->
        <el-col :xs="24" :lg="12">
          <el-card class="activity-card">
            <template #header>
              <div class="card-header">
                <span class="title">联系留言</span>
                <div class="header-stats">
                  <el-tag v-if="contactStats.unreadCount > 0" type="danger" size="small">
                    {{ contactStats.unreadCount }} 条未读
                  </el-tag>
                  <el-tag v-if="contactStats.todayCount > 0" type="info" size="small">
                    今日 {{ contactStats.todayCount }} 条
                  </el-tag>
                  <el-button type="text" size="small" @click="$router.push('/contact-messages')">
                    查看全部
                    <el-icon>
                      <ArrowRight />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <ContactMessagesList ref="contactMessagesRef" @stats-update="handleContactStatsUpdate" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { publicApi, newsApi, membersApi, projectsApi } from '@/utils/api'
import dayjs from 'dayjs'
import {
  Plus, UserFilled, Document, User, Folder, TrendCharts,
  ArrowUp, ArrowDown, ArrowRight, Bell
} from '@element-plus/icons-vue'

// 组件
import AnimatedNumber from '@/components/AnimatedNumber.vue'
import VisitTrendChart from '@/components/charts/VisitTrendChart.vue'
import ContentDistributionChart from '@/components/charts/ContentDistributionChart.vue'
import RecentNewsList from '@/components/dashboard/RecentNewsList.vue'
import ContactMessagesList from '@/components/dashboard/ContactMessagesList.vue'

const authStore = useAuthStore()

// 用户信息
const username = computed(() => authStore.username)

// 当前日期
const currentDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日 dddd')
})

// 访问趋势周期
const visitTrendPeriod = ref('7')

// 联系留言组件引用
const contactMessagesRef = ref()

// 联系留言统计信息
const contactStats = ref({
  unreadCount: 0,
  todayCount: 0
})

// 处理联系留言统计更新
const handleContactStatsUpdate = (stats) => {
  contactStats.value = stats
}

// 缓存API响应以减少重复请求
const apiCache = new Map()

// 获取历史数据进行真实比较（优化版本，减少API调用）
const getHistoricalData = async (type, timeRange, cachedResponse = null) => {
  try {
    let response, compareLabel

    // 如果有缓存的响应，直接使用，避免重复API调用
    if (cachedResponse) {
      response = cachedResponse
    } else {
      // 检查内存缓存
      const cacheKey = `${type}_list`
      if (apiCache.has(cacheKey)) {
        response = apiCache.get(cacheKey)
      } else {
        // 发起API请求并缓存结果
        switch (type) {
          case 'news':
            response = await newsApi.getList({
              limit: 100, // API最大限制为100
              status: 'published'
            }).catch(() => null)
            break
          case 'members':
            response = await membersApi.getList({
              limit: 100, // API最大限制为100
              status: 'active'
            }).catch(() => null)
            break
          case 'projects':
            response = await projectsApi.getList({
              limit: 100, // API最大限制为100
              status: 'ongoing'
            }).catch(() => null)
            break
          default:
            return { count: 0, label: '无对比数据' }
        }

        // 缓存响应（5分钟有效期）
        if (response) {
          apiCache.set(cacheKey, response)
          setTimeout(() => apiCache.delete(cacheKey), 5 * 60 * 1000)
        }
      }
    }

    compareLabel = timeRange === 'lastMonth' ? '较上月' : '较半年前'

    if (!response?.data) {
      return { count: 0, label: compareLabel }
    }

    // 根据API类型获取正确的数据数组
    let dataArray = []
    switch (type) {
      case 'news':
        dataArray = response.data.news || []
        break
      case 'members':
        dataArray = response.data.members || []
        break
      case 'projects':
        dataArray = response.data.projects || []
        break
      default:
        return { count: 0, label: compareLabel }
    }

    // 在前端过滤历史数据
    const now = dayjs()
    let compareDate

    switch (timeRange) {
      case 'lastMonth':
        compareDate = now.subtract(1, 'month')
        break
      case 'sixMonthsAgo':
        compareDate = now.subtract(6, 'month')
        break
      default:
        return { count: 0, label: compareLabel }
    }

    // 计算指定时间点之前的数据数量
    const historicalCount = dataArray.filter(item => {
      const itemDate = dayjs(item.created_at)
      return itemDate.isBefore(compareDate)
    }).length

    return { count: historicalCount, label: compareLabel }

  } catch (error) {
    console.error(`获取${type}历史数据失败:`, error)
    return { count: 0, label: '无对比数据' }
  }
}

// 计算真实的趋势信息
const calculateRealTrend = (current, historical, label, unit) => {
  if (current === 0) {
    switch (unit) {
      case '篇':
        return { type: 'up', text: '内容建设中' }
      case '人':
        return { type: 'up', text: '团队组建中' }
      case '个':
        return { type: 'up', text: '项目启动中' }
      default:
        return { type: 'up', text: '等待数据更新' }
    }
  }

  const diff = current - historical

  if (diff > 0) {
    return {
      type: 'up',
      text: `${label} +${diff}${unit}`
    }
  } else if (diff < 0) {
    return {
      type: 'down',
      text: `${label} ${diff}${unit}`
    }
  } else {
    return {
      type: 'up',
      text: `${label}无变化`
    }
  }
}

// 图表数据
const chartData = ref({
  visitTrend: []
})

// 统计数据
const statsData = ref([
  {
    key: 'news',
    title: '新闻动态',
    value: 0,
    icon: markRaw(Document),
    type: 'primary',
    trend: { type: 'up', text: '较上月 +12%' }
  },
  {
    key: 'members',
    title: '实验室成员',
    value: 0,
    icon: markRaw(User),
    type: 'success',
    trend: { type: 'up', text: '较上月 +3' }
  },
  {
    key: 'projects',
    title: '研究项目',
    value: 0,
    icon: markRaw(Folder),
    type: 'warning',
    trend: { type: 'up', text: '较上月 +2' }
  },
  {
    key: 'visits',
    title: '总访问量',
    value: 0,
    icon: markRaw(TrendCharts),
    type: 'info',
    trend: { type: 'up', text: '较昨日 +156' }
  }
])

// 加载统计数据
const loadStats = async () => {
  try {
    // 并行加载所有统计数据
    const days = parseInt(visitTrendPeriod.value) || 7
    // 首先获取基础统计数据和详细列表数据
    const [analyticsResponse, newsResponse, membersResponse, projectsResponse] = await Promise.all([
      publicApi.getStatistics({ days }).catch(() => ({ data: { totalVisits: 0, recentVisits: 0, dailyStats: [] } })),
      newsApi.getList({ limit: 100, status: 'published' }).catch(() => ({ data: { pagination: { total: 0 } } })),
      membersApi.getList({ limit: 100, status: 'active' }).catch(() => ({ data: { pagination: { total: 0 } } })),
      projectsApi.getList({ limit: 100, status: 'ongoing' }).catch(() => ({ data: { pagination: { total: 0 } } }))
    ])

    // 使用已获取的响应来计算历史数据，避免重复API调用
    const [newsHistorical, membersHistorical, projectsHistorical] = await Promise.all([
      getHistoricalData('news', 'lastMonth', newsResponse),        // 复用新闻响应
      getHistoricalData('members', 'sixMonthsAgo', membersResponse), // 复用成员响应
      getHistoricalData('projects', 'lastMonth', projectsResponse)   // 复用项目响应
    ])

    const analyticsData = analyticsResponse.data || {}
    const newsData = newsResponse.data || {}
    const membersData = membersResponse.data || {}
    const projectsData = projectsResponse.data || {}

    // 当前数据
    const currentNews = newsData.pagination?.total || 0
    const currentMembers = membersData.pagination?.total || 0
    const currentProjects = projectsData.pagination?.total || 0
    const currentVisits = analyticsData.totalVisits || 0

    // 更新统计数据和趋势（使用真实历史数据比较）
    statsData.value[0].value = currentNews
    statsData.value[0].trend = calculateRealTrend(
      currentNews,
      newsHistorical.count,
      newsHistorical.label,
      '篇'
    )

    statsData.value[1].value = currentMembers
    statsData.value[1].trend = calculateRealTrend(
      currentMembers,
      membersHistorical.count,
      membersHistorical.label,
      '人'
    )

    statsData.value[2].value = currentProjects
    statsData.value[2].trend = calculateRealTrend(
      currentProjects,
      projectsHistorical.count,
      projectsHistorical.label,
      '个'
    )

    statsData.value[3].value = currentVisits
    // 访问量保持现有逻辑（近7天数据）
    const recentVisits = analyticsData.recentVisits || 0
    statsData.value[3].trend = {
      type: 'up',
      text: `近${days}天共 ${recentVisits} 次访问`
    }

    // 更新图表数据
    updateChartData(analyticsData)

  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 出错时使用默认值
    statsData.value.forEach((stat, index) => {
      stat.value = 0
      stat.trend = { type: 'up', text: '暂无数据' }
    })
    chartData.value.visitTrend = []
  }
}

// 更新图表数据
const updateChartData = (analyticsData) => {
  // 处理访问趋势数据
  const dailyStats = analyticsData.dailyStats || []
  chartData.value.visitTrend = dailyStats.map(item => ({
    date: item.date,
    visits: item.visits
  })).sort((a, b) => new Date(a.date) - new Date(b.date))
}

// 监听访问趋势周期变化
watch(visitTrendPeriod, () => {
  loadStats()
})

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 20px;

  .welcome-card {
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

    :deep(.el-card__body) {
      padding: 30px;
    }
  }

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }

    .welcome-text {
      h2 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 8px 0;
      }

      p {
        font-size: 14px;
        margin: 0;
        opacity: 0.9;
      }
    }

    .welcome-actions {
      display: flex;
      gap: 12px;

      @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;

        .el-button {
          width: 100%;
        }
      }

      .el-button {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }

        &.el-button--primary {
          background: #fff;
          color: #667eea;

          &:hover {
            background: rgba(255, 255, 255, 0.9);
          }
        }
      }
    }
  }
}

.stats-section {
  margin-bottom: 20px;

  .el-col {
    margin-bottom: 20px;
  }
}

.charts-section {
  margin-bottom: 20px;

  .chart-card {
    height: 460px;

    :deep(.el-card__body) {
      height: calc(100% - 57px);
      padding: 0;
    }
  }
}

.activity-section {
  .activity-card {
    height: 500px;

    :deep(.el-card__body) {
      height: calc(100% - 57px);
      padding: 0;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--admin-text-primary);
  }

  .header-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      gap: 4px;
    }

    .el-tag {
      margin: 0;
    }

    .el-button {
      font-size: 12px;
      padding: 4px 8px;
      margin-left: 4px;
    }
  }

  .badge {
    :deep(.el-badge__content) {
      top: 8px;
      right: 8px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .page-container {
    padding: 15px;
  }

  .charts-section,
  .activity-section {
    .el-col {
      margin-bottom: 20px;
    }
  }
}
</style>
