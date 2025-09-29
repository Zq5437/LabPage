<template>
    <div class="visit-trend-chart">
        <div v-if="loading || internalLoading" class="loading-container">
            <el-skeleton :rows="8" animated />
        </div>
        <div v-else class="chart-wrapper">
            <div v-if="!chartData || chartData.length === 0" class="empty-container">
                <el-empty description="暂无访问数据" />
            </div>
            <div ref="chartContainer" class="chart-container"
                :style="{ display: chartData.length > 0 ? 'block' : 'none' }"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { publicApi } from '@/utils/api'
import * as echarts from 'echarts'

const props = defineProps({
    data: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    period: {
        type: [String, Number],
        default: '7'
    }
})

const chartContainer = ref(null)
let chartInstance = null

// 组件内部状态
const internalLoading = ref(false)
const chartData = ref([])
const dailyStats = ref([])

// 获取数据
const fetchData = async () => {
    try {
        internalLoading.value = true
        const response = await publicApi.getStatistics({
            days: parseInt(props.period) || 7
        })

        if (response.data && response.data.dailyStats) {
            dailyStats.value = response.data.dailyStats
            processData()
            nextTick(() => {
                initChart()
            })
        }
    } catch (error) {
        console.error('获取访问趋势数据失败:', error)
        dailyStats.value = []
        chartData.value = []
    } finally {
        internalLoading.value = false
    }
}

// 处理数据
const processData = () => {
    // 优先使用传入的data，否则使用内部获取的dailyStats
    const sourceData = props.data.length > 0 ? props.data : dailyStats.value

    console.log('processData - sourceData:', sourceData)

    if (!sourceData || sourceData.length === 0) {
        console.log('processData - 数据为空')
        chartData.value = []
        return
    }

    // 按日期排序并格式化
    chartData.value = sourceData
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
            ...item,
            formattedDate: formatDate(item.date)
        }))

    console.log('processData - 处理后的chartData:', chartData.value)
}

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
}

// 初始化ECharts
const initChart = () => {
    console.log('initChart called - container:', !!chartContainer.value, 'data length:', chartData.value.length)

    if (!chartContainer.value || chartData.value.length === 0) {
        console.log('initChart - 跳过：容器不存在或数据为空')
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
        title: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const data = params[0]
                return `${data.name}<br/>访问量: ${data.value}`
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: chartData.value.map(item => item.formattedDate),
            axisLine: {
                lineStyle: {
                    color: '#E4E7ED'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#909399',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#909399',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: '#EBEEF5',
                    type: 'dashed'
                }
            }
        },
        series: [{
            data: chartData.value.map(item => item.visits),
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#5dade2' },
                    { offset: 1, color: '#3498db' }
                ]),
                borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#3498db' },
                        { offset: 1, color: '#2980b9' }
                    ])
                }
            },
            barWidth: '60%'
        }]
    }

    chartInstance.setOption(option)
    console.log('initChart - ECharts图表创建完成')
}

// 监听数据变化
watch(() => props.data, (newData) => {
    console.log('props.data changed:', newData)
    processData()
    nextTick(() => {
        initChart()
        // 如果第一次初始化失败，延迟重试
        if (!chartInstance && chartData.value.length > 0) {
            setTimeout(() => {
                console.log('延迟重试初始化图表')
                initChart()
            }, 100)
        }
    })
}, { deep: true, immediate: true })

// 监听period变化
watch(() => props.period, () => {
    fetchData()
})

// 监听加载状态
watch(() => props.loading, (newVal) => {
    if (!newVal) {
        nextTick(() => {
            processData()
            initChart()
        })
    }
})

// 响应式处理
const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize()
    }
}

onMounted(() => {
    console.log('VisitTrendChart mounted, props.data.length:', props.data.length)

    // 注意：由于添加了 immediate: true 的 watch，数据处理会自动触发
    // 这里只需要处理没有外部数据的情况
    if (props.data.length === 0 && props.period) {
        // 只有在没有外部数据且有period参数时才获取数据（用于Dashboard）
        console.log('获取内部数据，period:', props.period)
        fetchData()
    }

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
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
.visit-trend-chart {
    width: 100%;
    height: 350px;
    /* 设置固定高度 */
    min-height: 350px;
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

.chart-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}

.chart-container {
    width: 100%;
    height: 100%;
}
</style>