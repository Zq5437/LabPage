<template>
    <div class="content-distribution-chart">
        <div class="chart-placeholder">
            <el-icon size="48" color="#67C23A">
                <PieChart />
            </el-icon>
            <p>内容分布图表开发中...</p>
        </div>
    </div>
</template>

<script setup>
import { PieChart } from '@element-plus/icons-vue'
</script>

<style scoped>
.content-distribution-chart {
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
