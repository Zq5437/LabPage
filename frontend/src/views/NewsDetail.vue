<template>
  <div class="news-detail-page">
    <!-- 顶部装饰背景 -->
    <div class="page-header-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="container">
      <div v-loading="loading" class="news-detail-content">
        <div v-if="news" class="news-article">
          <!-- 返回按钮 - 优化位置 -->
          <div class="back-navigation">
            <el-button @click="goBack" link class="back-link">
              <el-icon class="back-icon">
                <ArrowLeft />
              </el-icon>
              <span class="back-text">返回列表</span>
            </el-button>
          </div>

          <!-- 文章头部 -->
          <div class="article-header">
            <!-- 标题区域 - 将标签整合到标题上方 -->
            <div class="title-section">
              <div class="article-badges">
                <el-tag :type="getCategoryTagType(news.category)" size="large" effect="plain" class="category-tag">
                  {{ getCategoryText(news.category) }}
                </el-tag>
                <span v-if="news.is_top" class="top-badge-inline">
                  <el-icon>
                    <Star />
                  </el-icon>
                  <span>置顶</span>
                </span>
              </div>

              <h1 class="article-title animate-fade-in">{{ news.title }}</h1>
            </div>

            <div class="article-info">
              <div class="info-items">
                <div class="info-item">
                  <div class="info-icon">
                    <el-icon>
                      <User />
                    </el-icon>
                  </div>
                  <div class="info-text">
                    <span class="info-label">作者</span>
                    <span class="info-value">{{ news.author }}</span>
                  </div>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                  <div class="info-icon">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                  </div>
                  <div class="info-text">
                    <span class="info-label">发布时间</span>
                    <span class="info-value">{{ formatDate(news.publish_time) }}</span>
                  </div>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                  <div class="info-icon">
                    <el-icon>
                      <View />
                    </el-icon>
                  </div>
                  <div class="info-text">
                    <span class="info-label">浏览量</span>
                    <span class="info-value">{{ news.views }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 封面图片 -->
          <div class="article-cover-wrapper">
            <div v-if="news.cover_image" class="article-cover">
              <img :src="getCoverImageUrl(news.cover_image)" :alt="news.title" />
              <div class="cover-overlay"></div>
            </div>
            <div v-else class="article-cover default-cover">
              <svg class="default-cover-svg" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <rect width="800" height="400" fill="url(#coverGrad)" />
                <g opacity="0.15">
                  <circle cx="100" cy="100" r="60" fill="white" />
                  <circle cx="700" cy="300" r="80" fill="white" />
                  <circle cx="400" cy="200" r="100" fill="white" />
                </g>
                <g transform="translate(300, 120)">
                  <rect x="0" y="0" width="200" height="160" rx="12" fill="white" opacity="0.3" />
                  <rect x="15" y="15" width="170" height="80" rx="6" fill="white" opacity="0.5" />
                  <rect x="15" y="105" width="120" height="12" rx="3" fill="white" opacity="0.4" />
                  <rect x="15" y="125" width="140" height="12" rx="3" fill="white" opacity="0.4" />
                </g>
              </svg>
            </div>
          </div>

          <!-- 文章摘要 -->
          <div v-if="news.summary" class="article-summary">
            <div class="summary-icon">
              <el-icon>
                <Document />
              </el-icon>
            </div>
            <div class="summary-content">
              <div class="summary-label">内容摘要</div>
              <p class="summary-text">{{ news.summary }}</p>
            </div>
          </div>

          <!-- 文章内容 -->
          <div class="article-content-section">
            <div class="content-decorator">
              <div class="decorator-line"></div>
            </div>
            <div class="article-content" v-html="formatContent(news.content)"></div>
          </div>

          <!-- 文章底部 -->
          <div class="article-footer">
            <div class="article-tags-section">
              <div class="tags-icon">
                <el-icon>
                  <Collection />
                </el-icon>
              </div>
              <div class="tags-content">
                <span class="tags-label">分类标签</span>
                <el-tag :type="getCategoryTagType(news.category)" size="large" effect="plain" round>
                  {{ getCategoryText(news.category) }}
                </el-tag>
              </div>
            </div>

            <div class="article-actions">
              <el-button @click="goBack" type="primary" size="large" round>
                <el-icon>
                  <ArrowLeft />
                </el-icon>
                返回列表
              </el-button>
            </div>
          </div>
        </div>

        <!-- 相关新闻推荐 -->
        <div v-if="relatedNews.length > 0" class="related-news-section">
          <div class="related-header">
            <div class="related-icon">
              <el-icon>
                <Reading />
              </el-icon>
            </div>
            <h3 class="related-title">相关推荐</h3>
            <div class="related-line"></div>
          </div>
          <div class="related-list">
            <div v-for="(item, index) in relatedNews" :key="item.id" class="related-item animate-slide-up"
              :style="{ animationDelay: `${index * 0.1}s` }" @click="viewRelatedNews(item)">
              <div class="related-image">
                <img v-if="item.cover_image" :src="getCoverImageUrl(item.cover_image)" :alt="item.title" @error="handleImageError" />
                <div v-else class="related-default-image">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="relatedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2980b9;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <rect width="100" height="100" fill="url(#relatedGrad)" />
                    <circle cx="50" cy="40" r="15" fill="white" opacity="0.3" />
                    <rect x="20" y="65" width="60" height="4" fill="white" opacity="0.4" />
                    <rect x="20" y="75" width="40" height="4" fill="white" opacity="0.3" />
                  </svg>
                </div>
                <div class="related-overlay"></div>
              </div>
              <div class="related-content">
                <h4 class="related-news-title">{{ item.title }}</h4>
                <p class="related-summary">{{ item.summary }}</p>
                <div class="related-meta">
                  <span class="related-date">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                    {{ formatDate(item.publish_time) }}
                  </span>
                  <span class="related-author">
                    <el-icon>
                      <User />
                    </el-icon>
                    {{ item.author }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-if="!loading && !news" class="error-state">
          <div class="error-icon">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="#f5f5f5" />
              <circle cx="100" cy="100" r="60" fill="#e0e0e0" />
              <path d="M70 90 L85 75 M115 75 L130 90 M75 130 Q100 120 125 130" stroke="#999" stroke-width="4"
                fill="none" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="error-title">新闻不存在</h3>
          <p class="error-message">抱歉，您访问的新闻可能已被删除或不存在</p>
          <el-button type="primary" size="large" round @click="goBack">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            返回新闻列表
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  ArrowLeft, Star, User, Calendar, View, Document, Collection, Reading
} from '@element-plus/icons-vue'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const news = ref(null)
const relatedNews = ref([])

// 获取新闻详情
const loadNewsDetail = async () => {
  try {
    loading.value = true
    const newsId = route.params.id

    const response = await api.get(`/news/${newsId}`)

    if (response && response.data) {
      news.value = response.data
      // 增加浏览量
      incrementViews(newsId)
      // 加载相关新闻
      loadRelatedNews()
    }
  } catch (error) {
    console.error('加载新闻详情失败:', error)
    ElMessage.error('加载新闻详情失败')
  } finally {
    loading.value = false
  }
}

// 增加浏览量
const incrementViews = async (newsId) => {
  try {
    await api.post(`/news/${newsId}/view`)
  } catch (error) {
    console.error('增加浏览量失败:', error)
  }
}

// 加载相关新闻
const loadRelatedNews = async () => {
  try {
    const response = await api.get('/news', {
      params: {
        category: news.value.category,
        status: 'published',
        limit: 3
      }
    })

    if (response && response.data && response.data.news) {
      // 过滤掉当前新闻
      relatedNews.value = response.data.news
        .filter(item => item.id !== news.value.id)
        .slice(0, 3)
    }
  } catch (error) {
    console.error('加载相关新闻失败:', error)
  }
}

// 查看相关新闻
const viewRelatedNews = (newsItem) => {
  router.push(`/news/${newsItem.id}`)
}

// 返回新闻列表
const goBack = () => {
  router.push('/news')
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

const formatContent = (content) => {
  if (!content) return ''
  // 将换行符转换为HTML换行
  return content.replace(/\n/g, '<br>')
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

// 监听路由变化
const handleRouteChange = () => {
  if (route.params.id) {
    loadNewsDetail()
  }
}

// 初始化
onMounted(() => {
  handleRouteChange()
})

// 监听路由参数变化
watch(() => route.params.id, handleRouteChange)
</script>

<style scoped>
.news-detail-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  padding: 60px 0;
  position: relative;
}

/* 顶部装饰 */
.page-header-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.05;
  animation: float 20s ease-in-out infinite;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: 10%;
  animation-delay: 3s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50px;
  right: 30%;
  animation-delay: 6s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.news-detail-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

/* 返回导航 */
.back-navigation {
  padding: 25px 40px 0;
  margin-bottom: 10px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
}

.back-link:hover {
  background: #f0f2ff;
  color: #5568d3;
  transform: translateX(-4px);
}

.back-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.back-link:hover .back-icon {
  transform: translateX(-3px);
}

.back-text {
  font-size: 0.95rem;
}

.news-article {
  padding: 0 40px 50px;
}

/* 文章头部 */
.article-header {
  margin-bottom: 50px;
  padding: 30px 0;
}

.title-section {
  margin-bottom: 35px;
}

.article-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.category-tag {
  font-weight: 600;
  font-size: 0.95rem;
  padding: 8px 18px;
  border-radius: 20px;
  border: 2px solid currentColor;
}

.top-badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #fff9e6 0%, #ffe9c2 100%);
  border: 2px solid #f39c12;
  border-radius: 20px;
  color: #f39c12;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.2);
}

.top-badge-inline .el-icon {
  font-size: 1rem;
}

.article-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1.3;
  margin: 0;
  word-wrap: break-word;
  hyphens: auto;
  letter-spacing: -0.5px;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
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

.article-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.info-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.info-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.85rem;
  color: #95a5a6;
  font-weight: 500;
}

.info-value {
  font-size: 1.05rem;
  color: #2c3e50;
  font-weight: 700;
}

.info-divider {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #e0e0e0, transparent);
}

/* 封面图片 */
.article-cover-wrapper {
  margin: 40px 0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.article-cover {
  position: relative;
  width: 100%;
  min-height: 400px;
  overflow: hidden;
  background: #f0f2f5;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.article-cover:hover img {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.2) 100%);
}

.default-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.default-cover-svg {
  width: 100%;
  height: 100%;
  max-height: 400px;
}

/* 文章摘要 */
.article-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-left: 5px solid #667eea;
  border-radius: 0 16px 16px 0;
  padding: 25px 30px;
  margin: 40px 0;
  display: flex;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.summary-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-weight: 700;
  color: #667eea;
  margin-bottom: 12px;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.summary-text {
  margin: 0;
  color: #555;
  line-height: 1.8;
  font-size: 1.08rem;
}

/* 文章内容 */
.article-content-section {
  margin: 50px 0;
  position: relative;
}

.content-decorator {
  position: absolute;
  left: -40px;
  top: 0;
  bottom: 0;
  width: 4px;
}

.decorator-line {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #667eea, #764ba2, transparent);
  border-radius: 2px;
}

.article-content {
  font-size: 1.15rem;
  line-height: 2;
  color: #333;
  text-align: justify;
  padding-left: 20px;
}

.article-content :deep(p) {
  margin-bottom: 1.8em;
}

.article-content :deep(br) {
  display: block;
  margin: 1em 0;
  content: "";
}

.article-content :deep(strong) {
  color: #2c3e50;
  font-weight: 700;
}

/* 文章底部 */
.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 40px;
  border-top: 3px solid #f0f2f5;
  margin-top: 50px;
  gap: 20px;
}

.article-tags-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tags-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
}

.tags-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-label {
  color: #7f8c8d;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 相关新闻 */
.related-news-section {
  padding: 40px;
  border-top: 3px solid #f0f2f5;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
}

.related-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 35px;
}

.related-icon {
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.6rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.related-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  flex-shrink: 0;
}

.related-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(to right, #667eea, transparent);
  border-radius: 2px;
}

.related-list {
  display: grid;
  gap: 25px;
}

.related-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  opacity: 0;
  transform: translateY(30px);
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

.related-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.related-image {
  width: 140px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.related-item:hover .related-image img {
  transform: scale(1.1);
}

.related-default-image {
  width: 100%;
  height: 100%;
}

.related-default-image svg {
  width: 100%;
  height: 100%;
}

.related-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.related-item:hover .related-overlay {
  opacity: 1;
}

.related-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.related-news-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.related-item:hover .related-news-title {
  color: #667eea;
}

.related-summary {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
}

.related-date,
.related-author {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #95a5a6;
  font-weight: 500;
}

/* 错误状态 */
.error-state {
  padding: 100px 40px;
  text-align: center;
}

.error-icon {
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
  animation: float 3s ease-in-out infinite;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.error-message {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0 0 30px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .news-detail-page {
    padding: 30px 0;
  }

  .container {
    padding: 0 15px;
  }

  .back-navigation {
    padding: 20px 25px 0;
    margin-bottom: 5px;
  }

  .back-link {
    font-size: 0.9rem;
    padding: 6px 10px;
  }

  .back-text {
    font-size: 0.9rem;
  }

  .news-article {
    padding: 0 25px 35px;
  }

  .article-header {
    padding: 20px 0;
  }

  .title-section {
    margin-bottom: 25px;
  }

  .article-badges {
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }

  .category-tag {
    font-size: 0.85rem;
    padding: 6px 14px;
  }

  .top-badge-inline {
    font-size: 0.85rem;
    padding: 5px 12px;
  }

  .article-title {
    font-size: 2rem;
    line-height: 1.3;
  }

  .info-items {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .info-divider {
    display: none;
  }

  .article-cover {
    min-height: 250px;
  }

  .article-summary {
    flex-direction: column;
    padding: 20px;
    gap: 15px;
  }

  .content-decorator {
    display: none;
  }

  .article-content {
    font-size: 1.05rem;
    line-height: 1.8;
    padding-left: 0;
  }

  .article-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 25px;
  }

  .related-news-section {
    padding: 30px 25px;
  }

  .related-item {
    flex-direction: column;
    gap: 15px;
  }

  .related-image {
    width: 100%;
    height: 180px;
  }

  .error-state {
    padding: 60px 25px;
  }

  .error-icon {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .back-navigation {
    padding: 15px 20px 0;
  }

  .news-article {
    padding: 0 20px 30px;
  }

  .article-badges {
    gap: 8px;
  }

  .category-tag {
    font-size: 0.8rem;
    padding: 5px 12px;
  }

  .top-badge-inline {
    font-size: 0.8rem;
    padding: 4px 10px;
  }

  .article-title {
    font-size: 1.6rem;
  }

  .article-content {
    font-size: 1rem;
    line-height: 1.7;
  }

  .related-title {
    font-size: 1.4rem;
  }
}
</style>