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
            <el-button @click="$router.push('/members/create')">
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
            <VisitTrendChart :period="visitTrendPeriod" />
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

        <!-- 待办事项 -->
        <el-col :xs="24" :lg="12">
          <el-card class="activity-card">
            <template #header>
              <div class="card-header">
                <span class="title">待办事项</span>
                <el-badge :value="todoCount" class="badge">
                  <el-icon>
                    <Bell />
                  </el-icon>
                </el-badge>
              </div>
            </template>
            <TodoList />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { publicApi } from '@/utils/api'
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
import TodoList from '@/components/dashboard/TodoList.vue'

const authStore = useAuthStore()

// 用户信息
const username = computed(() => authStore.username)

// 当前日期
const currentDate = computed(() => {
  return dayjs().format('YYYY年MM月DD日 dddd')
})

// 访问趋势周期
const visitTrendPeriod = ref('7')

// 待办事项数量
const todoCount = ref(5)

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
    // 加载访问统计数据
    const analyticsResponse = await publicApi.getStatistics({ days: 30 })
    const analyticsData = analyticsResponse.data || {}

    // 模拟其他统计数据（实际项目中应该有对应的API）
    statsData.value[0].value = 128  // 新闻数量
    statsData.value[1].value = 45   // 成员数量  
    statsData.value[2].value = 23   // 项目数量
    statsData.value[3].value = analyticsData.totalVisits || 0  // 总访问量

    // 更新访问量趋势文本
    const recentVisits = analyticsData.recentVisits || 0
    const averageDaily = Math.round(recentVisits / 30)
    statsData.value[3].trend = {
      type: 'up',
      text: `日均 ${averageDaily} 次访问`
    }

  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 出错时使用默认值
    statsData.value[0].value = 128
    statsData.value[1].value = 45
    statsData.value[2].value = 23
    statsData.value[3].value = 0
  }
}

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
    height: 400px;

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
