<template>
    <div class="visit-trend-chart">
        <div class="chart-placeholder">
            <el-icon size="48" color="#409EFF">
                <TrendCharts />
            </el-icon>
            <p>访问趋势图表开发中...</p>
        </div>
    </div>
</template>

<script setup>
import { TrendCharts } from '@element-plus/icons-vue'

defineProps({
    period: {
        type: String,
        default: '7'
    }
})
</script>

<style scoped>
.visit-trend-chart {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-placeholder {
    text-align: center;
    color: #999;
}

.chart-placeholder p {
    margin: 10px 0 0 0;
    font-size: 14px;
}
</style>
