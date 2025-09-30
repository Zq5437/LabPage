<template>
    <div class="recent-news-list">
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>
        <div v-else-if="newsList.length === 0" class="empty-container">
            <el-empty description="暂无新闻" />
        </div>
        <div v-else class="news-container">
            <div v-for="news in newsList" :key="news.id" class="news-item" @click="goToDetail(news.id)">
                <div class="news-content">
                    <div class="news-title">{{ news.title }}</div>
                    <div class="news-meta">
                        <span class="news-category" :class="getCategoryClass(news.category)">
                            {{ getCategoryText(news.category) }}
                        </span>
                        <span class="news-date">{{ formatDate(news.created_at) }}</span>
                    </div>
                    <div class="news-summary">{{ news.summary || news.content?.substring(0, 80) + '...' }}</div>
                </div>
                <div v-if="news.featured_image" class="news-image">
                    <img :src="getImageUrl(news.featured_image)" :alt="news.title" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { newsApi } from '@/utils/api'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const newsList = ref([])

// 加载最新新闻
const loadRecentNews = async () => {
    try {
        loading.value = true
        const response = await newsApi.getList({
            limit: 5,
            status: 'published',
            sort: 'created_at',
            order: 'desc'
        })

        newsList.value = response.data?.news || []
    } catch (error) {
        console.error('加载最新新闻失败:', error)
        newsList.value = []
    } finally {
        loading.value = false
    }
}

// 格式化日期
const formatDate = (dateString) => {
    return dayjs(dateString).format('MM-DD')
}

// 获取分类文本
const getCategoryText = (category) => {
    const categoryMap = {
        news: '新闻',
        announcement: '公告',
        achievement: '成果',
        activity: '活动'
    }
    return categoryMap[category] || '新闻'
}

// 获取分类样式类
const getCategoryClass = (category) => {
    const classMap = {
        news: 'news',
        announcement: 'announcement',
        achievement: 'achievement',
        activity: 'activity'
    }
    return classMap[category] || 'news'
}

// 获取图片URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/uploads/${imagePath}`
}

// 跳转到详情页
const goToDetail = (id) => {
    router.push(`/news/edit/${id}`)
}

onMounted(() => {
    loadRecentNews()
})
</script>

<style scoped>
.recent-news-list {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.loading-container,
.empty-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.news-container {
    height: 100%;
}

.news-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
}

.news-item:hover {
    background-color: #f8f9fa;
    border-radius: 6px;
    padding: 12px;
    margin: 0 -12px;
}

.news-item:last-child {
    border-bottom: none;
}

.news-content {
    flex: 1;
    min-width: 0;
}

.news-title {
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    line-height: 1.4;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.news-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.news-category {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
}

.news-category.news {
    background-color: #3498db;
}

.news-category.announcement {
    background-color: #e74c3c;
}

.news-category.achievement {
    background-color: #f39c12;
}

.news-category.activity {
    background-color: #9b59b6;
}

.news-date {
    font-size: 11px;
    color: #666;
}

.news-summary {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.news-image {
    width: 60px;
    height: 45px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
}

.news-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 响应式 */
@media (max-width: 768px) {
    .recent-news-list {
        padding: 15px;
    }

    .news-item {
        gap: 10px;
    }

    .news-image {
        width: 50px;
        height: 38px;
    }
}
</style>
