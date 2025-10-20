<template>
  <div class="news-page">
    <!-- 页面头部 -->
    <div class="news-header">
      <div class="header-background"></div>
      <div class="container">
        <div class="header-content">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 9H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="animate-fade-in">新闻动态</h1>
          <p class="animate-fade-in-delay">了解实验室最新资讯与发展动态</p>
        </div>
      </div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path fill="#f8f9fa"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z">
          </path>
        </svg>
      </div>
    </div>

    <div class="container">
      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索新闻标题..." class="search-input" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable class="category-select"
            @change="filterByCategory">
            <el-option label="学术新闻" value="news" />
            <el-option label="活动通知" value="announcement" />
            <el-option label="获奖信息" value="achievement" />
            <el-option label="学术活动" value="activity" />
          </el-select>
        </div>
      </div>

      <!-- 置顶新闻 -->
      <div v-if="topNews.length > 0" class="top-news-section">
        <h2 class="section-title">
          <span class="title-icon">
            <el-icon>
              <Star />
            </el-icon>
          </span>
          <span class="title-text">置顶新闻</span>
          <span class="title-line"></span>
        </h2>
        <div class="top-news-grid">
          <div v-for="(news, index) in topNews" :key="news.id" class="news-card top-news-card animate-slide-up"
            :style="{ animationDelay: `${index * 0.1}s` }" @click="viewNewsDetail(news)">
            <div class="news-image-wrapper">
              <div class="news-image">
                <img v-if="news.cover_image" :src="getCoverImageUrl(news.cover_image)" :alt="news.title"
                  @error="handleImageError" />
                <div v-else class="default-image">
                  <svg class="default-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <rect width="200" height="200" fill="url(#grad1)" />
                    <g transform="translate(50, 50)">
                      <path
                        d="M88 0H12C5.373 0 0 5.373 0 12v76c0 6.627 5.373 12 12 12h76c6.627 0 12-5.373 12-12V12c0-6.627-5.373-12-12-12zM12 88V12h76v76H12z"
                        fill="white" opacity="0.3" />
                      <rect x="10" y="10" width="80" height="30" rx="3" fill="white" opacity="0.5" />
                      <rect x="10" y="45" width="60" height="8" rx="2" fill="white" opacity="0.4" />
                      <rect x="10" y="58" width="70" height="8" rx="2" fill="white" opacity="0.4" />
                      <rect x="10" y="71" width="50" height="8" rx="2" fill="white" opacity="0.4" />
                    </g>
                  </svg>
                </div>
                <div class="image-overlay"></div>
              </div>
              <div class="top-badge">
                <el-icon>
                  <Star />
                </el-icon>
                置顶
              </div>
            </div>
            <div class="news-content">
              <div class="news-meta">
                <el-tag :type="getCategoryTagType(news.category)" size="small" effect="dark">
                  {{ getCategoryText(news.category) }}
                </el-tag>
                <span class="news-date">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  {{ formatDate(news.publish_time) }}
                </span>
              </div>
              <h3 class="news-title">{{ news.title }}</h3>
              <p class="news-summary">{{ news.summary }}</p>
              <div class="news-footer">
                <span class="news-author">
                  <el-icon>
                    <User />
                  </el-icon>
                  {{ news.author }}
                </span>
                <span class="news-views">
                  <el-icon>
                    <View />
                  </el-icon>
                  {{ news.views }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 普通新闻列表 -->
      <div class="news-list-section">
        <h2 v-if="topNews.length > 0" class="section-title">
          <span class="title-icon">
            <el-icon>
              <List />
            </el-icon>
          </span>
          <span class="title-text">最新新闻</span>
          <span class="title-line"></span>
        </h2>

        <div v-loading="loading" class="news-list">
          <div v-for="(news, index) in regularNews" :key="news.id" class="news-card regular-news-card animate-slide-up"
            :style="{ animationDelay: `${index * 0.05}s` }" @click="viewNewsDetail(news)">
            <div class="news-image-wrapper">
              <div class="news-image">
                <img v-if="news.cover_image" :src="getCoverImageUrl(news.cover_image)" :alt="news.title"
                  @error="handleImageError" />
                <div v-else class="default-image">
                  <svg class="default-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <rect width="200" height="200" fill="url(#grad2)" />
                    <g transform="translate(50, 60)">
                      <circle cx="50" cy="30" r="15" fill="white" opacity="0.4" />
                      <path d="M10 80 L40 50 L60 70 L90 40" stroke="white" stroke-width="3" fill="none" opacity="0.5" />
                      <rect x="0" y="85" width="100" height="3" fill="white" opacity="0.3" />
                    </g>
                  </svg>
                </div>
                <div class="image-overlay"></div>
              </div>
            </div>
            <div class="news-content">
              <div class="news-meta">
                <el-tag :type="getCategoryTagType(news.category)" size="small" effect="plain">
                  {{ getCategoryText(news.category) }}
                </el-tag>
                <span class="news-date">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  {{ formatDate(news.publish_time) }}
                </span>
              </div>
              <h3 class="news-title">{{ news.title }}</h3>
              <p class="news-summary">{{ news.summary }}</p>
              <div class="news-footer">
                <span class="news-author">
                  <el-icon>
                    <User />
                  </el-icon>
                  {{ news.author }}
                </span>
                <span class="news-views">
                  <el-icon>
                    <View />
                  </el-icon>
                  {{ news.views }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && allNews.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="#f0f2f5" />
              <path d="M70 80 Q100 60 130 80" stroke="#d0d3d9" stroke-width="3" fill="none" />
              <circle cx="75" cy="90" r="8" fill="#d0d3d9" />
              <circle cx="125" cy="90" r="8" fill="#d0d3d9" />
              <rect x="40" y="130" width="120" height="30" rx="5" fill="#e0e3e9" />
            </svg>
          </div>
          <p class="empty-text">{{ searchQuery || selectedCategory ? '未找到匹配的新闻' : '暂无新闻数据' }}</p>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination-row">
          <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
            :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
            background @size-change="handleSizeChange" @current-change="handlePageChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search, Star, Document, List, View, Calendar, User
} from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const allNews = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 搜索防抖
let searchTimeout = null

// 计算属性
const topNews = computed(() => {
  return allNews.value.filter(news => news.is_top === 1)
})

const regularNews = computed(() => {
  return allNews.value.filter(news => news.is_top === 0)
})

// 加载新闻列表
const loadNews = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      status: 'published'
    }

    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await api.get('/news', { params })

    if (response && response.data) {
      allNews.value = response.data.news || []
      pagination.total = response.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载新闻失败:', error)
    ElMessage.error('加载新闻失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理（防抖）
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadNews()
  }, 500)
}

// 分类筛选
const filterByCategory = () => {
  pagination.page = 1
  loadNews()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  loadNews()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadNews()
}

// 查看新闻详情
const viewNewsDetail = (news) => {
  router.push(`/news/${news.id}`)
}

// 工具函数
const getCategoryText = (category) => {
  const map = {
    news: '学术新闻',
    announcement: '活动通知',
    achievement: '获奖信息',
    activity: '学术活动'
  }
  return map[category] || category
}

const getCategoryTagType = (category) => {
  const map = {
    news: 'primary',
    announcement: 'warning',
    achievement: 'success',
    activity: 'info'
  }
  return map[category] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 获取封面图片URL
const getCoverImageUrl = (coverImage) => {
  if (!coverImage) return ''
  // 如果已经是完整URL，直接返回
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage
  }
  // 直接返回相对路径，Vite会通过代理转发到后端
  if (coverImage.startsWith('/')) {
    return coverImage
  }
  return `/${coverImage}`
}

// 初始化
onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

/* 页面头部样式 */
.news-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0 80px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-icon {
  display: inline-block;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.header-icon svg {
  width: 100%;
  height: 100%;
  color: white;
}

.news-header h1 {
  font-size: 3.5rem;
  margin: 0 0 20px 0;
  font-weight: 800;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.news-header p {
  font-size: 1.4rem;
  margin: 0;
  opacity: 0.95;
  position: relative;
  z-index: 1;
  font-weight: 300;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fadeIn 0.8s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  z-index: 1;
}

.header-wave svg {
  width: 100%;
  height: auto;
  display: block;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选工具栏样式 */
.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 50px 0;
  padding: 25px 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
  gap: 20px;
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 1;
}

.filter-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 100%;
  max-width: 400px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-select {
  min-width: 180px;
}

.category-select :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 标题样式 */
.section-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 40px 0;
  position: relative;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
}

.title-text {
  flex-shrink: 0;
}

.title-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(to right, #667eea, transparent);
  border-radius: 2px;
}

.top-news-section {
  margin-bottom: 70px;
}

.top-news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 35px;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

/* 新闻卡片样式 */
.news-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  opacity: 0;
  transform: translateY(30px);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.news-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(102, 126, 234, 0.2);
}

.top-news-card {
  background: linear-gradient(to bottom, #fffef9 0%, white 100%);
  position: relative;
}

.top-news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f39c12 0%, #e67e22 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.top-news-card:hover::before {
  opacity: 1;
}

.regular-news-card {
  position: relative;
}

.regular-news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.regular-news-card:hover::before {
  opacity: 1;
}

.news-image-wrapper {
  position: relative;
  overflow: hidden;
}

.news-image {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-card:hover .news-image img {
  transform: scale(1.08);
}

.default-image {
  width: 100%;
  height: 100%;
  position: relative;
}

.default-icon {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.news-card:hover .image-overlay {
  opacity: 1;
}

.top-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 24px;
  font-size: 0.8125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
  backdrop-filter: blur(10px);
  z-index: 2;
  letter-spacing: 0.3px;
}

.news-content {
  padding: 24px;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.news-date {
  color: #8492a6;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 400;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.news-card:hover .news-title {
  color: #667eea;
}

.news-summary {
  color: #6b7280;
  line-height: 1.7;
  margin: 0 0 20px 0;
  font-size: 0.9375rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.news-author {
  color: #667eea;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.news-views {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #95a5a6;
  font-size: 0.95rem;
  font-weight: 500;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 100px 0;
  grid-column: 1 / -1;
}

.empty-icon {
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
  animation: float 3s ease-in-out infinite;
}

.empty-text {
  font-size: 1.2rem;
  color: #95a5a6;
  font-weight: 500;
}

/* 分页样式 */
.pagination-row {
  display: flex;
  justify-content: center;
  margin-top: 60px;
  padding-top: 50px;
  padding-bottom: 50px;
  border-top: 2px solid #f0f2f5;
}

.pagination-row :deep(.el-pagination) {
  gap: 10px;
}

.pagination-row :deep(.el-pager li) {
  border-radius: 8px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .news-header {
    padding: 60px 0 50px;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }

  .news-header h1 {
    font-size: 2.5rem;
  }

  .news-header p {
    font-size: 1.1rem;
  }

  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
    margin: 30px 0;
  }

  .filter-left,
  .filter-right {
    width: 100%;
  }

  .search-input,
  .category-select {
    width: 100%;
    max-width: none;
  }

  .section-title {
    font-size: 1.6rem;
    margin-bottom: 30px;
  }

  .title-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .top-news-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .news-list {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .news-image {
    height: 180px;
  }

  .news-content {
    padding: 22px;
  }

  .empty-state {
    padding: 60px 0;
  }

  .empty-icon {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .news-header h1 {
    font-size: 2rem;
  }

  .news-header p {
    font-size: 1rem;
  }

  .news-content {
    padding: 18px;
  }

  .news-image {
    height: 160px;
  }

  .news-title {
    font-size: 1.2rem;
  }

  .section-title {
    font-size: 1.4rem;
  }
}
</style>
