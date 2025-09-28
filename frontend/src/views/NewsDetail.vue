<template>
  <div class="news-detail-page">
    <div class="container">
      <div v-loading="loading" class="news-detail-content">
        <div v-if="news" class="news-article">
          <!-- 返回按钮 -->
          <div class="back-button">
            <el-button @click="goBack" type="primary" plain>
              <el-icon>
                <ArrowLeft />
              </el-icon>
              返回新闻列表
            </el-button>
          </div>

          <!-- 文章头部 -->
          <div class="article-header">
            <div class="article-meta">
              <el-tag :type="getCategoryTagType(news.category)" size="large">
                {{ getCategoryText(news.category) }}
              </el-tag>
              <span v-if="news.is_top" class="top-badge">
                <el-icon>
                  <Star />
                </el-icon>
                置顶
              </span>
            </div>

            <h1 class="article-title">{{ news.title }}</h1>

            <div class="article-info">
              <div class="info-left">
                <span class="info-item">
                  <el-icon>
                    <User />
                  </el-icon>
                  {{ news.author }}
                </span>
                <span class="info-item">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  {{ formatDate(news.publish_time) }}
                </span>
                <span class="info-item">
                  <el-icon>
                    <View />
                  </el-icon>
                  {{ news.views }} 次浏览
                </span>
              </div>
            </div>
          </div>

          <!-- 封面图片 -->
          <div v-if="news.cover_image" class="article-cover">
            <img :src="news.cover_image" :alt="news.title" />
          </div>

          <!-- 文章摘要 -->
          <div v-if="news.summary" class="article-summary">
            <div class="summary-label">
              <el-icon>
                <Document />
              </el-icon>
              摘要
            </div>
            <p>{{ news.summary }}</p>
          </div>

          <!-- 文章内容 -->
          <div class="article-content">
            <div v-html="formatContent(news.content)"></div>
          </div>

          <!-- 文章底部 -->
          <div class="article-footer">
            <div class="article-tags">
              <span class="tags-label">标签：</span>
              <el-tag :type="getCategoryTagType(news.category)">
                {{ getCategoryText(news.category) }}
              </el-tag>
            </div>

            <div class="article-actions">
              <el-button @click="goBack" type="primary">
                返回列表
              </el-button>
            </div>
          </div>
        </div>

        <!-- 相关新闻推荐 -->
        <div v-if="relatedNews.length > 0" class="related-news">
          <h3 class="related-title">相关新闻</h3>
          <div class="related-list">
            <div v-for="item in relatedNews" :key="item.id" class="related-item" @click="viewRelatedNews(item)">
              <div class="related-image">
                <img v-if="item.cover_image" :src="item.cover_image" :alt="item.title" @error="handleImageError" />
                <div v-else class="default-image">
                  <el-icon>
                    <Document />
                  </el-icon>
                </div>
              </div>
              <div class="related-content">
                <h4 class="related-news-title">{{ item.title }}</h4>
                <p class="related-summary">{{ item.summary }}</p>
                <div class="related-meta">
                  <span>{{ formatDate(item.publish_time) }}</span>
                  <span>{{ item.author }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-if="!loading && !news" class="error-state">
          <el-result icon="warning" title="新闻不存在" sub-title="抱歉，您访问的新闻可能已被删除或不存在">
            <template #extra>
              <el-button type="primary" @click="goBack">返回新闻列表</el-button>
            </template>
          </el-result>
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
  ArrowLeft, Star, User, Calendar, View, Document
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
  background: #f8f9fa;
  padding: 40px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.news-detail-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.back-button {
  padding: 20px 30px 0;
}

.news-article {
  padding: 20px 30px 30px;
}

.article-header {
  margin-bottom: 40px;
  padding-bottom: 20px;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.top-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #f39c12;
  font-weight: 500;
}

.article-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.4;
  margin: 0 0 25px 0;
  word-wrap: break-word;
  hyphens: auto;
}

.article-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-top: 1px solid #ecf0f1;
  border-bottom: 1px solid #ecf0f1;
}

.info-left {
  display: flex;
  gap: 25px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.article-cover {
  margin: 30px 0;
  text-align: center;
}

.article-cover img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.article-summary {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 20px;
  margin: 30px 0;
  border-radius: 0 8px 8px 0;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 10px;
}

.article-summary p {
  margin: 0;
  color: #555;
  line-height: 1.7;
  font-size: 1.05rem;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin: 30px 0;
  text-align: justify;
}

.article-content :deep(p) {
  margin-bottom: 1.5em;
}

.article-content :deep(br) {
  display: block;
  margin: 0.8em 0;
  content: "";
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid #ecf0f1;
  margin-top: 40px;
}

.article-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tags-label {
  color: #7f8c8d;
  font-weight: 500;
}

.related-news {
  padding: 30px;
  border-top: 1px solid #ecf0f1;
  background: #fafbfc;
}

.related-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
}

.related-list {
  display: grid;
  gap: 20px;
}

.related-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.related-image {
  width: 100px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.related-content {
  flex: 1;
}

.related-news-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-summary {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 0.8rem;
}

.error-state {
  padding: 60px 30px;
}

@media (max-width: 768px) {
  .news-detail-page {
    padding: 20px 0;
  }

  .container {
    padding: 0 15px;
  }

  .news-article {
    padding: 15px 20px 20px;
  }

  .back-button {
    padding: 15px 20px 0;
  }

  .article-title {
    font-size: 1.8rem;
    line-height: 1.3;
  }

  .article-meta {
    flex-wrap: wrap;
    gap: 10px;
  }

  .article-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 20px 0;
  }

  .info-left {
    flex-wrap: wrap;
    gap: 15px;
  }

  .article-summary {
    margin: 20px 0;
    padding: 15px;
  }

  .article-content {
    font-size: 1rem;
    line-height: 1.7;
    margin: 20px 0;
  }

  .article-footer {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .related-item {
    flex-direction: column;
    gap: 10px;
  }

  .related-image {
    width: 100%;
    height: 150px;
  }

  .related-news {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 1.5rem;
  }

  .article-content {
    font-size: 1rem;
  }
}
</style>