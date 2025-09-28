<template>
  <div class="news-page">
    <!-- 页面头部 -->
    <div class="news-header">
      <div class="container">
        <h1>新闻动态</h1>
        <p>了解实验室最新资讯与发展动态</p>
      </div>
    </div>

    <div class="container">
      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索新闻标题..." style="width: 300px" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable style="width: 150px"
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
          <el-icon>
            <Star />
          </el-icon>
          置顶新闻
        </h2>
        <div class="top-news-grid">
          <div v-for="news in topNews" :key="news.id" class="news-card top-news-card" @click="viewNewsDetail(news)">
            <div class="news-image">
              <img v-if="news.cover_image" :src="news.cover_image" :alt="news.title" @error="handleImageError" />
              <div v-else class="default-image">
                <el-icon>
                  <Document />
                </el-icon>
              </div>
              <div class="top-badge">置顶</div>
            </div>
            <div class="news-content">
              <div class="news-meta">
                <el-tag :type="getCategoryTagType(news.category)" size="small">
                  {{ getCategoryText(news.category) }}
                </el-tag>
                <span class="news-date">{{ formatDate(news.publish_time) }}</span>
              </div>
              <h3 class="news-title">{{ news.title }}</h3>
              <p class="news-summary">{{ news.summary }}</p>
              <div class="news-footer">
                <span class="news-author">{{ news.author }}</span>
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
          <el-icon>
            <List />
          </el-icon>
          最新新闻
        </h2>

        <div v-loading="loading" class="news-list">
          <div v-for="news in regularNews" :key="news.id" class="news-card regular-news-card"
            @click="viewNewsDetail(news)">
            <div class="news-image">
              <img v-if="news.cover_image" :src="news.cover_image" :alt="news.title" @error="handleImageError" />
              <div v-else class="default-image">
                <el-icon>
                  <Document />
                </el-icon>
              </div>
            </div>
            <div class="news-content">
              <div class="news-meta">
                <el-tag :type="getCategoryTagType(news.category)" size="small">
                  {{ getCategoryText(news.category) }}
                </el-tag>
                <span class="news-date">{{ formatDate(news.publish_time) }}</span>
              </div>
              <h3 class="news-title">{{ news.title }}</h3>
              <p class="news-summary">{{ news.summary }}</p>
              <div class="news-footer">
                <span class="news-author">{{ news.author }}</span>
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
          <el-empty :description="searchQuery || selectedCategory ? '未找到匹配的新闻' : '暂无新闻数据'" />
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination-row">
          <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
            :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange" @current-change="handlePageChange" />
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
  Search, Star, Document, List, View
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

// 初始化
onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.news-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.news-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.news-header h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.news-header p {
  font-size: 1.3rem;
  margin: 0;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 30px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid #667eea;
}

.top-news-section {
  margin-bottom: 60px;
}

.top-news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.news-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.top-news-card {
  border-top: 4px solid #f39c12;
}

.regular-news-card {
  border-top: 4px solid #3498db;
}

.news-image {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
}

.news-image img {
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
  font-size: 3rem;
}

.top-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f39c12;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.news-content {
  padding: 25px;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.news-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.news-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  color: #555;
  line-height: 1.6;
  margin: 0 0 20px 0;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #ecf0f1;
}

.news-author {
  color: #667eea;
  font-weight: 500;
  font-size: 0.9rem;
}

.news-views {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  grid-column: 1 / -1;
}

.pagination-row {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #ecf0f1;
}

@media (max-width: 768px) {
  .news-header h1 {
    font-size: 2.2rem;
  }

  .news-header p {
    font-size: 1.1rem;
  }

  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-left .el-input,
  .filter-right .el-select {
    width: 100% !important;
  }

  .top-news-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .news-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .news-image {
    height: 150px;
  }

  .news-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .news-content {
    padding: 15px;
  }

  .news-image {
    height: 120px;
  }
}
</style>
