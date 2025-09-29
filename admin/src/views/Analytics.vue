<template>
    <div class="analytics-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1>访问统计</h1>
                <p>网站访问数据分析和统计报告</p>
            </div>
            <div class="header-actions">
                <el-select v-model="selectedDays" @change="loadStatistics" style="width: 120px; margin-right: 10px;">
                    <el-option label="7天" :value="7" />
                    <el-option label="30天" :value="30" />
                    <el-option label="90天" :value="90" />
                </el-select>
                <el-button @click="loadStatistics" :loading="loading">
                    <el-icon>
                        <Refresh />
                    </el-icon>
                    刷新数据
                </el-button>
            </div>
        </div>

        <!-- 统计概览 -->
        <div class="stats-overview">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="stat-card total">
                        <div class="stat-icon">
                            <el-icon>
                                <View />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ statistics.totalVisits || 0 }}</div>
                            <div class="stat-label">总访问量</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="stat-card recent">
                        <div class="stat-icon">
                            <el-icon>
                                <Calendar />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ statistics.recentVisits || 0 }}</div>
                            <div class="stat-label">近{{ selectedDays }}天访问</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="stat-card average">
                        <div class="stat-icon">
                            <el-icon>
                                <TrendCharts />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ averageDaily }}</div>
                            <div class="stat-label">日均访问量</div>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <div class="stat-card pages">
                        <div class="stat-icon">
                            <el-icon>
                                <Document />
                            </el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ uniquePages }}</div>
                            <div class="stat-label">页面总数</div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
            <el-row :gutter="20">
                <!-- 访问趋势图 -->
                <el-col :xs="24" :md="16">
                    <el-card>
                        <template #header>
                            <div class="chart-header">
                                <span>访问趋势</span>
                                <small>近{{ selectedDays }}天访问量变化</small>
                            </div>
                        </template>
                        <div class="chart-container" style="height: 350px;">
                            <VisitTrendChart :data="chartData.visitTrend" :loading="loading" />
                        </div>
                    </el-card>
                </el-col>

                <!-- 页面访问排行 -->
                <el-col :xs="24" :md="8">
                    <el-card>
                        <template #header>
                            <div class="chart-header">
                                <span>热门页面</span>
                                <small>访问量排行榜</small>
                            </div>
                        </template>
                        <div class="page-ranking">
                            <div v-if="loading" class="loading-container">
                                <el-skeleton :rows="8" animated />
                            </div>
                            <div v-else-if="pageStats.length === 0" class="empty-container">
                                <el-empty description="暂无访问数据" />
                            </div>
                            <div v-else class="ranking-list">
                                <div v-for="(page, index) in pageStats" :key="page.page_url" class="ranking-item"
                                    :class="{ 'top-item': index < 3 }">
                                    <div class="rank-number" :class="`rank-${index + 1}`">
                                        {{ index + 1 }}
                                    </div>
                                    <div class="page-info">
                                        <div class="page-title">{{ getPageTitle(page.page_url) }}</div>
                                        <div class="page-url">{{ page.page_url }}</div>
                                    </div>
                                    <div class="visit-count">
                                        <strong>{{ page.visits }}</strong>
                                        <small>次</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 详细数据表格 -->
        <div class="data-table-section">
            <el-card>
                <template #header>
                    <div class="table-header">
                        <span>访问详情</span>
                        <div class="table-actions">
                            <el-button size="small" @click="exportData">
                                <el-icon>
                                    <Download />
                                </el-icon>
                                导出数据
                            </el-button>
                        </div>
                    </div>
                </template>

                <el-table v-loading="loading" :data="pageStats" stripe style="width: 100%">
                    <el-table-column type="index" label="排名" width="80" />
                    <el-table-column label="页面" min-width="200">
                        <template #default="{ row }">
                            <div class="page-cell">
                                <div class="page-title">{{ getPageTitle(row.page_url) }}</div>
                                <div class="page-path">{{ row.page_url }}</div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="访问次数" width="120" align="center">
                        <template #default="{ row }">
                            <el-tag type="primary" size="small">{{ row.visits }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="访问占比" width="120" align="center">
                        <template #default="{ row }">
                            {{ ((row.visits / statistics.recentVisits) * 100).toFixed(1) }}%
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { publicApi } from '@/utils/api'
import VisitTrendChart from '@/components/charts/VisitTrendChart.vue'
import {
    Refresh, View, Calendar, TrendCharts, Document, Download
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const selectedDays = ref(30)
const statistics = ref({})
const pageStats = ref([])
const dailyStats = ref([])

// 图表数据
const chartData = reactive({
    visitTrend: []
})

// 计算属性
const averageDaily = computed(() => {
    if (!statistics.value.recentVisits || !selectedDays.value) return 0
    return Math.round(statistics.value.recentVisits / selectedDays.value)
})

const uniquePages = computed(() => {
    return pageStats.value.length || 0
})

// 加载统计数据
const loadStatistics = async () => {
    try {
        loading.value = true
        const response = await publicApi.getStatistics({
            days: selectedDays.value
        })

        if (response.data) {
            statistics.value = response.data
            pageStats.value = response.data.pageStats || []
            dailyStats.value = response.data.dailyStats || []

            // 更新图表数据
            updateChartData()
        }
    } catch (error) {
        console.error('加载统计数据失败:', error)
        ElMessage.error('加载统计数据失败')
    } finally {
        loading.value = false
    }
}

// 更新图表数据
const updateChartData = () => {
    // 处理访问趋势数据
    chartData.visitTrend = dailyStats.value.map(item => ({
        date: item.date,
        visits: item.visits
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
}

// 获取页面标题
const getPageTitle = (path) => {
    const titleMap = {
        '/': '首页',
        '/about': '关于我们',
        '/research': '研究方向',
        '/members': '团队成员',
        '/news': '新闻动态',
        '/projects': '研究项目',
        '/publications': '发表论文',
        '/equipment': '设备资源',
        '/recruitment': '招生信息',
        '/contact': '联系我们'
    }

    // 处理动态路由
    if (path.startsWith('/news/')) {
        return '新闻详情'
    }
    if (path.startsWith('/members/')) {
        return '成员详情'
    }
    if (path.startsWith('/projects/')) {
        return '项目详情'
    }

    return titleMap[path] || path
}

// 导出数据
const exportData = () => {
    try {
        const csvContent = generateCSV()
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `访问统计_${new Date().toISOString().slice(0, 10)}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }

        ElMessage.success('数据导出成功')
    } catch (error) {
        console.error('导出数据失败:', error)
        ElMessage.error('导出数据失败')
    }
}

// 生成CSV内容
const generateCSV = () => {
    const headers = ['排名', '页面名称', '页面路径', '访问次数', '访问占比']
    const rows = pageStats.value.map((page, index) => [
        index + 1,
        getPageTitle(page.page_url),
        page.page_url,
        page.visits,
        `${((page.visits / statistics.value.recentVisits) * 100).toFixed(1)}%`
    ])

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

    return '\ufeff' + csvContent // 添加BOM以支持中文
}

// 初始化
onMounted(() => {
    loadStatistics()
})
</script>

<style scoped>
.analytics-page {
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
}

/* 页面头部 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
    margin: 0 0 5px 0;
    color: #2c3e50;
    font-size: 1.8rem;
}

.header-content p {
    margin: 0;
    color: #666;
}

.header-actions {
    display: flex;
    align-items: center;
}

/* 统计概览 */
.stats-overview {
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-right: 15px;
    color: white;
}

.stat-card.total .stat-icon {
    background: #3498db;
}

.stat-card.recent .stat-icon {
    background: #2ecc71;
}

.stat-card.average .stat-icon {
    background: #f39c12;
}

.stat-card.pages .stat-icon {
    background: #9b59b6;
}

.stat-content {
    flex: 1;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
    margin-top: 5px;
}

/* 图表区域 */
.charts-section {
    margin-bottom: 20px;
}

.chart-header {
    display: flex;
    flex-direction: column;
}

.chart-header span {
    font-weight: bold;
    color: #2c3e50;
}

.chart-header small {
    color: #666;
    margin-top: 2px;
}

.chart-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 页面排行 */
.page-ranking {
    height: 350px;
    overflow-y: auto;
}

.loading-container,
.empty-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ranking-list {
    padding: 0;
}

.ranking-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
}

.ranking-item:hover {
    background-color: #f8f9fa;
}

.ranking-item.top-item {
    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.rank-number {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    margin-right: 12px;
    flex-shrink: 0;
}

.rank-number.rank-1 {
    background: #ffd700;
    color: #333;
}

.rank-number.rank-2 {
    background: #c0c0c0;
    color: #333;
}

.rank-number.rank-3 {
    background: #cd7f32;
}

.rank-number:not(.rank-1):not(.rank-2):not(.rank-3) {
    background: #95a5a6;
}

.page-info {
    flex: 1;
    min-width: 0;
}

.page-title {
    font-weight: 500;
    color: #2c3e50;
    line-height: 1.2;
}

.page-url {
    font-size: 0.8rem;
    color: #666;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.visit-count {
    text-align: right;
    margin-left: 10px;
    flex-shrink: 0;
}

.visit-count strong {
    color: #2c3e50;
    font-size: 1.1rem;
}

.visit-count small {
    color: #666;
    margin-left: 2px;
}

/* 数据表格 */
.data-table-section {
    background: transparent;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-cell {
    line-height: 1.3;
}

.page-title {
    font-weight: 500;
    color: #2c3e50;
}

.page-path {
    font-size: 0.85rem;
    color: #666;
    margin-top: 2px;
}

@media (max-width: 768px) {
    .analytics-page {
        padding: 10px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-end;
    }

    .ranking-item {
        padding: 8px 0;
    }

    .page-ranking {
        height: 300px;
    }
}
</style>
