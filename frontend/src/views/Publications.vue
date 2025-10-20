<template>
  <div class="publications-page">
    <!-- 页面头部 - 增强设计 -->
    <div class="publications-header">
      <div class="header-bg-pattern"></div>
      <div class="container">
        <div class="header-content">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 11H7C6.44772 11 6 11.4477 6 12V19C6 19.5523 6.44772 20 7 20H9C9.55228 20 10 19.5523 10 19V12C10 11.4477 9.55228 11 9 11Z"
                fill="currentColor" />
              <path
                d="M13 7C12.4477 7 12 7.44772 12 8V19C12 19.5523 12.4477 20 13 20H15C15.5523 20 16 19.5523 16 19V8C16 7.44772 15.5523 7 15 7H13Z"
                fill="currentColor" />
              <path
                d="M17 4C17 3.44772 17.4477 3 18 3H20C20.5523 3 21 3.44772 21 4V19C21 19.5523 20.5523 20 20 20H18C17.4477 20 17 19.5523 17 19V4Z"
                fill="currentColor" />
            </svg>
          </div>
          <h1>学术成果</h1>
          <p>探索实验室前沿研究与学术贡献</p>
          <div class="header-stats">
            <div class="header-stat-item stat-item-1" v-if="!loading">
              <div class="stat-icon">
                <el-icon>
                  <Document />
                </el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ pagination.total }}</span>
                <span class="stat-label">发表论文</span>
              </div>
            </div>
            <div class="header-stat-item stat-item-2" v-if="!loading">
              <div class="stat-icon">
                <el-icon>
                  <Star />
                </el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ totalCitations }}</span>
                <span class="stat-label">总引用</span>
              </div>
            </div>
            <div class="header-stat-item stat-item-3" v-if="!loading">
              <div class="stat-icon">
                <el-icon>
                  <Reading />
                </el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ journalCount }}</span>
                <span class="stat-label">期刊论文</span>
              </div>
            </div>
            <div class="header-stat-item stat-item-4" v-if="!loading">
              <div class="stat-icon">
                <el-icon>
                  <Opportunity />
                </el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ conferenceCount }}</span>
                <span class="stat-label">会议论文</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 筛选工具栏 - 优化设计 -->
      <div class="filter-section">
        <div class="filter-toolbar">
          <div class="search-wrapper">
            <el-input v-model="filters.search" placeholder="搜索论文标题、作者、期刊、关键词..." class="search-input" clearable
              @input="handleSearch">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>

          <div class="filter-controls">
            <el-select v-model="filters.category" placeholder="所有分类" clearable class="filter-select">
              <el-option v-for="category in categories" :key="category.category" :label="category.category"
                :value="category.category" />
            </el-select>

            <el-select v-model="filters.year" placeholder="所有年份" clearable class="filter-select">
              <el-option v-for="year in years" :key="year.year" :label="year.year" :value="year.year" />
            </el-select>

            <el-select v-model="sortBy" class="filter-select" @change="loadPublications">
              <el-option label="最新发表" value="publish_date" />
              <el-option label="引用最多" value="citation_count" />
              <el-option label="影响因子" value="impact_factor" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 论文列表 - 重新设计 -->
      <div class="publications-list" v-loading="loading">
        <transition-group name="list" tag="div" class="list-container">
          <div v-for="(publication, index) in publications" :key="publication.id" class="publication-card"
            :style="{ animationDelay: `${index * 0.1}s` }">
            <!-- 左侧视觉区域 -->
            <div class="card-visual">
              <!-- 如果有封面图片，显示图片 -->
              <div v-if="publication.cover_image_url" class="visual-image">
                <el-image :src="publication.cover_image_url" :alt="publication.title" fit="cover"
                  :preview-src-list="[publication.cover_image_url]" :initial-index="0" :preview-teleported="true">
                  <template #error>
                    <div class="image-error">
                      <el-icon>
                        <Picture />
                      </el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
                <div class="image-overlay">
                  <div class="view-hint">
                    <el-icon>
                      <ZoomIn />
                    </el-icon>
                    <span>点击查看大图</span>
                  </div>
                  <div class="publication-year">{{ publication.year || publication.publish_date }}</div>
                </div>
              </div>
              <!-- 否则显示占位符 -->
              <div v-else class="visual-placeholder">
                <div class="placeholder-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="publication-year">{{ publication.year || publication.publish_date }}</div>
              </div>

              <!-- 类型标签 -->
              <div class="type-badge" v-if="publication.type">
                {{ getTypeLabel(publication.type) }}
              </div>
            </div>

            <!-- 右侧内容区域 -->
            <div class="card-content">
              <div class="content-header">
                <h3 class="publication-title">{{ publication.title }}</h3>

                <!-- 指标标签 -->
                <div class="metrics">
                  <span v-if="publication.citation_count" class="metric-badge citation">
                    <el-icon>
                      <Star />
                    </el-icon>
                    <span>{{ publication.citation_count }}</span>
                  </span>
                  <span v-if="publication.impact_factor" class="metric-badge impact">
                    <span class="if-label">IF</span>
                    <span>{{ publication.impact_factor }}</span>
                  </span>
                </div>
              </div>

              <div class="publication-meta">
                <div class="meta-item authors">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {{ publication.authors }}
                </div>
                <div class="meta-item journal">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" />
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                  </svg>
                  {{ publication.journal }}
                </div>
                <div class="meta-item date">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                  </svg>
                  {{ formatDate(publication.publish_date) }}
                </div>
              </div>

              <p v-if="publication.abstract" class="publication-abstract">
                {{ publication.abstract.substring(0, 200) }}{{ publication.abstract.length > 200 ? '...' : '' }}
              </p>

              <!-- 操作按钮 -->
              <div class="card-actions">
                <button v-if="publication.pdf_url" class="action-btn primary" @click="viewPDF(publication.pdf_url)">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>PDF全文</span>
                </button>

                <button v-if="publication.doi" class="action-btn secondary" @click="openDOI(publication.doi)">
                  <el-icon>
                    <Link />
                  </el-icon>
                  <span>DOI</span>
                </button>

                <button class="action-btn text" @click="toggleAbstract(publication.id)">
                  <span>{{ expandedIds.includes(publication.id) ? '收起详情' : '查看详情' }}</span>
                  <svg class="arrow-icon" :class="{ 'expanded': expandedIds.includes(publication.id) }"
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </div>

              <!-- 展开的详情 -->
              <transition name="expand">
                <div v-if="expandedIds.includes(publication.id)" class="expanded-content">
                  <div class="abstract-section" v-if="publication.abstract">
                    <h4>摘要</h4>
                    <p>{{ publication.abstract }}</p>
                  </div>

                  <div class="keywords-section" v-if="publication.keywords">
                    <h4>关键词</h4>
                    <div class="keywords-list">
                      <span v-for="keyword in getKeywords(publication.keywords)" :key="keyword" class="keyword-tag">
                        {{ keyword }}
                      </span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </transition-group>

        <!-- 空状态优化 -->
        <div v-if="!loading && publications.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>暂无论文数据</h3>
          <p>当前筛选条件下没有找到相关论文</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 30, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadPublications" @current-change="loadPublications" background />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search, Star, Document, Link, Reading, Opportunity, Picture, ZoomIn
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const publications = ref([])
const categories = ref([])
const years = ref([])
const expandedIds = ref([])

// 筛选条件
const filters = reactive({
  search: '',
  category: '',
  year: ''
})

// 排序方式
const sortBy = ref('publish_date')

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 搜索防抖
let searchTimeout = null

// 计算属性
const totalCitations = computed(() => {
  return publications.value.reduce((sum, pub) => sum + (pub.citation_count || 0), 0)
})

// 计算期刊论文数量
const journalCount = computed(() => {
  return publications.value.filter(pub => pub.type === 'journal').length
})

// 计算会议论文数量
const conferenceCount = computed(() => {
  return publications.value.filter(pub => pub.type === 'conference').length
})

// 加载论文列表
const loadPublications = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: sortBy.value,
      order: sortBy.value === 'publish_date' ? 'DESC' : 'DESC',
      ...filters
    }

    const resp = await api.get('/publications/list', { params })
    publications.value = resp.data || []
    if (resp.pagination) {
      pagination.total = resp.pagination.total
      pagination.page = resp.pagination.page
      pagination.limit = resp.pagination.limit
    }
  } catch (error) {
    console.error('加载论文列表失败:', error)
    ElMessage.error('加载论文列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const resp = await api.get('/publications/stats/categories')
    categories.value = resp.data || []
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载年份列表
const loadYears = async () => {
  try {
    const resp = await api.get('/publications/stats/years')
    years.value = resp.data || []
  } catch (error) {
    console.error('加载年份失败:', error)
  }
}

// 搜索处理（防抖）
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadPublications()
  }, 500)
}

// 切换摘要展开状态
const toggleAbstract = (id) => {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

// 查看PDF
const viewPDF = (url) => {
  window.open(url, '_blank')
}

// 打开DOI链接
const openDOI = (doi) => {
  window.open(`https://doi.org/${doi}`, '_blank')
}

// 获取关键词数组
const getKeywords = (keywords) => {
  if (!keywords) return []
  return keywords.split(',').map(k => k.trim()).filter(k => k)
}

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    journal: '期刊论文',
    conference: '会议论文',
    book_chapter: '专著章节',
    patent: '专利',
    thesis: '学位论文'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (yearOrDate) => {
  if (!yearOrDate) return ''
  // 如果是纯数字（年份），直接格式化
  if (typeof yearOrDate === 'number' || /^\d{4}$/.test(String(yearOrDate))) {
    return `${yearOrDate}年`
  }
  // 否则作为日期处理
  return new Date(yearOrDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
}

// Element Plus的图片组件会自动处理预览，无需额外代码

// 初始化
onMounted(() => {
  loadPublications()
  loadCategories()
  loadYears()
})
</script>

<style scoped>
.publications-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}

/* 头部区域 */
.publications-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0 60px;
  overflow: hidden;
}

.header-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  opacity: 0.5;
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.header-icon {
  display: inline-block;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  animation: float 3s ease-in-out infinite;
}

.header-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

.publications-header h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.publications-header p {
  font-size: 1.2rem;
  margin: 0 0 40px 0;
  opacity: 0.95;
}

.header-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.header-stat-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 24px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.header-stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item-1::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-item-2::before {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.stat-item-3::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.stat-item-4::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.header-stat-item:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.header-stat-item:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-item-1 .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-item-2 .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-item-3 .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-item-4 .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.header-stat-item:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 6px;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.95;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选区域 */
.filter-section {
  margin: -30px 0 40px 0;
  position: relative;
  z-index: 10;
}

.filter-toolbar {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 280px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 140px;
}

.filter-select :deep(.el-input__wrapper) {
  border-radius: 12px;
}

/* 论文列表 */
.publications-list {
  min-height: 400px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.publication-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.publication-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
}

/* 卡片视觉区域 */
.card-visual {
  position: relative;
  width: 280px;
  height: 180px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 图片遮罩层 - 增强边缘对比度 */
.card-visual:has(.visual-image)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, transparent 35%),
    linear-gradient(to top, rgba(0, 0, 0, 0.15) 0%, transparent 25%),
    linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, transparent 15%),
    linear-gradient(to left, rgba(0, 0, 0, 0.1) 0%, transparent 15%);
  pointer-events: none;
  z-index: 1;
}

.visual-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 20px;
}

.placeholder-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 15px;
  opacity: 0.9;
}

.placeholder-icon svg {
  width: 100%;
  height: 100%;
}

/* 封面图片样式 */
.visual-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
}

.visual-image :deep(.el-image) {
  width: 100%;
  height: 100%;
  display: block;
}

.visual-image :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  display: block;
  filter: brightness(0.95) contrast(1.05);
}

.visual-image :deep(.el-image__wrapper) {
  width: 100%;
  height: 100%;
  display: block;
}

.publication-card:hover .visual-image :deep(.el-image__inner) {
  transform: scale(1.05);
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 10px;
}

.image-error .el-icon {
  font-size: 2rem;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  /* 允许点击穿透到下层的图片 */
}

.visual-image:hover .image-overlay {
  opacity: 1;
}

.view-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.view-hint .el-icon {
  font-size: 1.2rem;
}

.image-overlay .publication-year {
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  font-size: 1.8rem;
  font-weight: 700;
}

.publication-year {
  font-size: 2rem;
  font-weight: 700;
  opacity: 0.95;
}

.type-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.85);
  color: #667eea;
  padding: 6px 14px;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(12px) saturate(180%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  z-index: 2;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

/* 卡片内容区域 */
.card-content {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.publication-title {
  flex: 1;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  line-height: 1.5;
}

.metrics {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.metric-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.metric-badge.citation {
  background: #fef3c7;
  color: #d97706;
}

.metric-badge.impact {
  background: #dbeafe;
  color: #2563eb;
}

.if-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* 元数据 */
.publication-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 0.95rem;
}

.meta-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.7;
}

.meta-item.authors {
  font-weight: 500;
  color: #475569;
}

.meta-item.journal {
  font-style: italic;
}

.publication-abstract {
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: auto;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.action-btn.text {
  background: transparent;
  color: #667eea;
  padding: 10px 16px;
}

.action-btn.text:hover {
  background: #f1f5f9;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.arrow-icon.expanded {
  transform: rotate(180deg);
}

/* 展开内容 */
.expanded-content {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.abstract-section h4,
.keywords-section h4 {
  color: #1a202c;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.abstract-section p {
  color: #64748b;
  line-height: 1.8;
  margin: 0 0 20px 0;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.keyword-tag:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  color: #cbd5e1;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  color: #1a202c;
  font-size: 1.5rem;
  margin: 0 0 10px 0;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 60px 0 40px;
}

/* 列表过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .publication-card {
    flex-direction: column;
  }

  .card-visual {
    width: 100%;
    padding: 30px;
    flex-direction: row;
    justify-content: space-between;
  }

  .visual-placeholder {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .placeholder-icon {
    width: 50px;
    height: 50px;
    margin: 0;
  }

  .publication-year {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .publications-header {
    padding: 60px 0 40px;
  }

  .publications-header h1 {
    font-size: 2rem;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    padding: 15px;
  }

  .header-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-value {
    font-size: 1.8rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .filter-toolbar {
    padding: 20px;
  }

  .search-wrapper {
    width: 100%;
  }

  .filter-controls {
    width: 100%;
  }

  .filter-select {
    flex: 1;
    min-width: 120px;
  }

  .content-header {
    flex-direction: column;
  }

  .metrics {
    width: 100%;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .publication-card {
    flex-direction: column;
  }

  .card-visual {
    width: 100%;
    height: 160px;
    padding: 25px;
    flex-direction: row;
    justify-content: space-between;
  }

  .type-badge {
    top: 10px;
    right: 10px;
    padding: 5px 12px;
    font-size: 0.7rem;
  }

  .visual-placeholder {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .placeholder-icon {
    width: 50px;
    height: 50px;
    margin: 0;
  }

  .publication-year {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .header-stat-item {
    padding: 20px 16px;
  }

  .filter-controls {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .card-visual {
    height: 140px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 15px;
  }

  .visual-placeholder {
    flex-direction: column;
    gap: 10px;
  }

  .placeholder-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto 8px;
  }

  .publication-year {
    font-size: 1.3rem;
  }

  .type-badge {
    top: 10px;
    right: 10px;
    padding: 5px 12px;
    font-size: 0.7rem;
  }
}
</style>
