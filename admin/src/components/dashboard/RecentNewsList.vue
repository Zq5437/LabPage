<template>
    <div class="recent-news-list">
        <div class="news-placeholder">
            <el-icon size="32" color="#E6A23C">
                <Document />
            </el-icon>
            <p>最新新闻列表开发中...</p>
        </div>
    </div>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.recent-news-list {
    padding: 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.news-placeholder {
    text-align: center;
    color: #999;
}

.news-placeholder p {
    margin: 10px 0 0 0;
    font-size: 14px;
}
</style>
