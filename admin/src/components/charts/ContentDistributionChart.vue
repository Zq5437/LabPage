<template>
    <div class="enhanced-distribution">
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="6" animated />
        </div>
        <div v-else-if="!chartData || chartData.length === 0" class="empty-container">
            <el-empty description="暂无内容数据" />
        </div>
        <div v-else class="distribution-content">
            <!-- 环形图表区域 -->
            <div class="chart-section">
                <div class="chart-container" ref="chartContainer"></div>
                <!-- 中心统计 -->
                <div class="center-stats">
                    <div class="total-count">{{ totalCount }}</div>
                    <div class="total-label">总内容数</div>
                </div>
            </div>

            <!-- 底部图例 + 数据 -->
            <div class="legend-section" :class="{ 'has-highlight': currentHighlight }">
                <div v-for="item in chartData" :key="item.name" class="legend-item"
                    :class="{ 'legend-active': currentHighlight === item.name }" @click="highlightSector(item.name)">
                    <div class="legend-info">
                        <div class="color-dot" :style="{ backgroundColor: getLegendColor(item.color) }"></div>
                        <span class="legend-name">{{ item.name }}</span>
                    </div>
                    <div class="legend-data">
                        <span class="legend-value">{{ item.value }}</span>
                        <span class="legend-percent">{{ getPercentage(item.value) }}%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { newsApi, membersApi, projectsApi, publicApi } from '@/utils/api'
import * as echarts from 'echarts'

const props = defineProps({
    data: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const chartContainer = ref(null)
let chartInstance = null

// 组件内部状态
const loading = ref(false)
const chartData = ref([])

// 计算总数
const totalCount = computed(() => {
    return chartData.value.reduce((sum, item) => sum + item.value, 0)
})

// 计算百分比
const getPercentage = (value) => {
    const total = totalCount.value
    return total > 0 ? Math.round((value / total) * 100) : 0
}

// 获取图例颜色
const getLegendColor = (colorConfig) => {
    if (typeof colorConfig === 'string') {
        return colorConfig
    }
    // 如果是渐变配置，返回第一个颜色作为图例颜色
    if (colorConfig && colorConfig.colorStops && colorConfig.colorStops.length > 0) {
        return colorConfig.colorStops[0].color
    }
    return '#ccc'
}

// 获取内容分布数据
const fetchData = async () => {
    try {
        loading.value = true

        // 并行获取各类内容数量
        const [
            newsResponse,
            membersResponse,
            projectsResponse,
            publicationsResponse,
            equipmentResponse,
            recruitmentResponse
        ] = await Promise.all([
            newsApi.getList({ limit: 1, status: 'published' }).catch(() => ({ data: { pagination: { total: 0 } } })),
            membersApi.getList({ limit: 1, status: 'active' }).catch(() => ({ data: { pagination: { total: 0 } } })),
            projectsApi.getList({ limit: 1, status: 'ongoing' }).catch(() => ({ data: { pagination: { total: 0 } } })),
            publicApi.getPublications({ limit: 1 }).catch(() => ({ data: { pagination: { total: 0 } } })),
            publicApi.getEquipment({ limit: 1 }).catch(() => ({ data: [] })),
            publicApi.getRecruitment().catch(() => ({ data: [] }))
        ])

        const newsCount = newsResponse.data?.pagination?.total || 0
        const membersCount = membersResponse.data?.pagination?.total || 0
        const projectsCount = projectsResponse.data?.pagination?.total || 0
        const publicationsCount = publicationsResponse.data?.pagination?.total || 0
        const equipmentCount = Array.isArray(equipmentResponse.data) ? equipmentResponse.data.length : 0
        const recruitmentCount = Array.isArray(recruitmentResponse.data) ? recruitmentResponse.data.length : 0

        const allData = [
            {
                name: '新闻动态',
                value: newsCount,
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                        { offset: 0, color: '#5dade2' },
                        { offset: 1, color: '#3498db' }
                    ]
                }
            },
            {
                name: '研究项目',
                value: projectsCount,
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                        { offset: 0, color: '#ec7063' },
                        { offset: 1, color: '#e74c3c' }
                    ]
                }
            },
            {
                name: '团队成员',
                value: membersCount,
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                        { offset: 0, color: '#58d68d' },
                        { offset: 1, color: '#2ecc71' }
                    ]
                }
            },
            {
                name: '发表论文',
                value: publicationsCount,
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                        { offset: 0, color: '#f7dc6f' },
                        { offset: 1, color: '#f39c12' }
                    ]
                }
            },
            {
                name: '设备资源',
                value: equipmentCount,
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                        { offset: 0, color: '#bb8fce' },
                        { offset: 1, color: '#9b59b6' }
                    ]
                }
            },
            {
                name: '招生信息',
                value: recruitmentCount,
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                        { offset: 0, color: '#48c9b0' },
                        { offset: 1, color: '#1abc9c' }
                    ]
                }
            }
        ]

        chartData.value = allData.filter(item => item.value > 0) // 过滤掉数量为0的项目

        // 重置高亮状态
        currentHighlight.value = null

        nextTick(() => {
            initChart()
        })
    } catch (error) {
        console.error('获取内容分布数据失败:', error)
        chartData.value = []
    } finally {
        loading.value = false
    }
}

// 当前高亮的扇形
const currentHighlight = ref(null)

// 高亮扇形区域（支持切换）
const highlightSector = (name) => {
    if (!chartInstance) return

    if (currentHighlight.value === name) {
        // 如果点击的是当前高亮的项目，则取消高亮
        chartInstance.dispatchAction({
            type: 'downplay',
            seriesIndex: 0
        })
        currentHighlight.value = null
    } else {
        // 取消之前的高亮
        chartInstance.dispatchAction({
            type: 'downplay',
            seriesIndex: 0
        })

        // 高亮指定扇形
        chartInstance.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            name: name
        })
        currentHighlight.value = name
    }
}

// 初始化ECharts
const initChart = () => {
    if (!chartContainer.value || chartData.value.length === 0) {
        return
    }

    // 销毁已存在的实例
    if (chartInstance) {
        chartInstance.dispose()
    }

    // 创建新实例
    chartInstance = echarts.init(chartContainer.value)

    // 配置选项
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: (params) => {
                return `${params.seriesName}<br/>${params.name}: ${params.value} (${params.percent}%)`
            },
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            borderColor: 'transparent',
            textStyle: {
                color: '#fff',
                fontSize: 12
            },
            hideDelay: 100,
            enterable: false,
            transitionDuration: 0.2
        },
        series: [
            {
                name: '内容分布',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                startAngle: 90,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2,
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.1)'
                },
                label: {
                    show: false
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 20,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        scale: true,
                        scaleSize: 5
                    }
                },
                labelLine: {
                    show: false
                },
                data: chartData.value.map(item => ({
                    name: item.name,
                    value: item.value,
                    itemStyle: {
                        color: item.color
                    }
                })),
                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: (idx) => Math.random() * 200
            }
        ]
    }

    chartInstance.setOption(option)

    // 添加点击事件监听
    chartInstance.on('click', (params) => {
        if (params.componentType === 'series') {
            highlightSector(params.name)
        }
    })
}


// 监听数据变化
watch(() => props.data, (newData) => {
    if (newData && newData.length > 0) {
        chartData.value = newData
        nextTick(() => {
            initChart()
        })
    }
}, { deep: true, immediate: true })

// 响应式处理
const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize()
    }
}

onMounted(() => {
    // 如果没有外部数据，则获取内部数据
    if (!props.data || props.data.length === 0) {
        fetchData()
    }

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)

    // 延迟一点确保DOM完全渲染
    setTimeout(() => {
        if (chartData.value.length > 0) {
            initChart()
        }
    }, 100)
})

onUnmounted(() => {
    // 清理图表实例
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }

    // 移除事件监听
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.enhanced-distribution {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-container,
.empty-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.distribution-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* 图表区域 */
.chart-section {
    height: 280px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-container {
    width: 100%;
    height: 100%;
    min-height: 250px;
}

/* 中心统计 */
.center-stats {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
    z-index: 1;
}

.total-count {
    font-size: 28px;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1;
    margin-bottom: 4px;
}

.total-label {
    font-size: 12px;
    color: #7f8c8d;
    font-weight: 500;
}

/* 图例区域 */
.legend-section {
    padding: 12px 16px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
    flex: 1;
    overflow-y: auto;
    position: relative;
}

.legend-section.has-highlight::before {
    content: "再次点击可取消高亮";
    position: absolute;
    top: -2px;
    right: 16px;
    background: #2196f3;
    color: white;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    opacity: 0.8;
    pointer-events: none;
    z-index: 10;
}

.legend-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
    border: 1px solid #e8e8e8;
}

.legend-item:hover {
    background: #f8f9fa;
    border-color: #d0d7de;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-item.legend-active {
    background: #e3f2fd;
    border-color: #2196f3;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.legend-item.legend-active:hover {
    background: #e1f5fe;
    border-color: #1976d2;
}

.legend-info {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
}

.color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.legend-name {
    font-size: 12px;
    color: #2c3e50;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.legend-data {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
}

.legend-value {
    font-size: 14px;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1;
}

.legend-percent {
    font-size: 10px;
    color: #7f8c8d;
    font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .enhanced-distribution {
        height: 320px;
    }

    .total-count {
        font-size: 24px;
    }

    .total-label {
        font-size: 11px;
    }

    .legend-section {
        grid-template-columns: repeat(2, 1fr);
        padding: 12px 16px 6px;
        gap: 6px;
    }

    .legend-item {
        padding: 5px 6px;
    }

    .legend-name {
        font-size: 11px;
    }

    .legend-value {
        font-size: 12px;
    }

    .legend-percent {
        font-size: 9px;
    }
}

@media (max-width: 480px) {
    .enhanced-distribution {
        height: 300px;
    }

    .legend-section {
        grid-template-columns: 1fr;
    }

    .total-count {
        font-size: 20px;
    }
}
</style>
