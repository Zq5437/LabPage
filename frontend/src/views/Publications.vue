<template>
  <div class="publications-page">
    <!-- 页面头部 -->
    <div class="publications-header">
      <div class="container">
        <h1>发表论文</h1>
        <p>实验室学术成果与研究论文展示</p>
      </div>
    </div>

    <div class="container">
      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input v-model="filters.search" placeholder="搜索论文标题、作者、期刊..." style="width: 300px" clearable
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="filters.category" placeholder="选择分类" clearable style="width: 150px"
            @change="loadPublications">
            <el-option v-for="category in categories" :key="category.category" :label="category.category"
              :value="category.category" />
          </el-select>

          <el-select v-model="filters.year" placeholder="选择年份" clearable style="width: 120px"
            @change="loadPublications">
            <el-option v-for="year in years" :key="year.year" :label="year.year" :value="year.year" />
          </el-select>

          <el-select v-model="sortBy" style="width: 150px" @change="loadPublications">
            <el-option label="按时间排序" value="publish_date" />
            <el-option label="按引用数排序" value="citation_count" />
            <el-option label="按影响因子排序" value="impact_factor" />
          </el-select>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="!loading">
        <div class="stats-item">
          <span class="stats-number">{{ pagination.total }}</span>
          <span class="stats-label">篇论文</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ totalCitations }}</span>
          <span class="stats-label">总引用数</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ uniqueJournals }}</span>
          <span class="stats-label">发表期刊</span>
        </div>
      </div>

      <!-- 论文列表 -->
      <div class="publications-list" v-loading="loading">
        <div v-for="publication in publications" :key="publication.id" class="publication-item">
          <div class="publication-content">
            <h3 class="publication-title">{{ publication.title }}</h3>

            <div class="publication-meta">
              <span class="authors">{{ publication.authors }}</span>
              <span class="journal">{{ publication.journal }}</span>
              <span class="date">{{ formatDate(publication.publish_date) }}</span>
            </div>

            <div class="publication-details">
              <el-tag v-if="publication.type" size="small" type="info">
                {{ getTypeLabel(publication.type) }}
              </el-tag>

              <span v-if="publication.citation_count" class="citation-count">
                <el-icon>
                  <Star />
                </el-icon>
                {{ publication.citation_count }} 引用
              </span>

              <span v-if="publication.impact_factor" class="impact-factor">
                IF: {{ publication.impact_factor }}
              </span>
            </div>

            <p v-if="publication.abstract" class="publication-abstract">
              {{ publication.abstract.substring(0, 200) }}{{ publication.abstract.length > 200 ? '...' : '' }}
            </p>

            <div class="publication-actions">
              <el-button v-if="publication.pdf_url" type="primary" size="small" @click="viewPDF(publication.pdf_url)">
                <el-icon>
                  <Document />
                </el-icon>
                查看PDF
              </el-button>

              <el-button v-if="publication.doi" type="default" size="small" @click="openDOI(publication.doi)">
                <el-icon>
                  <Link />
                </el-icon>
                DOI链接
              </el-button>

              <el-button type="text" size="small" @click="toggleAbstract(publication.id)">
                {{ expandedIds.includes(publication.id) ? '收起' : '展开' }}摘要
              </el-button>
            </div>

            <!-- 展开的摘要 -->
            <div v-if="expandedIds.includes(publication.id) && publication.abstract" class="full-abstract">
              <h4>摘要</h4>
              <p>{{ publication.abstract }}</p>

              <div v-if="publication.keywords" class="keywords">
                <h4>关键词</h4>
                <el-tag v-for="keyword in getKeywords(publication.keywords)" :key="keyword" size="small"
                  style="margin-right: 8px; margin-bottom: 8px;">
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && publications.length === 0" class="empty-state">
          <el-empty description="暂无论文数据" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 30, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadPublications" @current-change="loadPublications" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search, Star, Document, Link
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

const uniqueJournals = computed(() => {
  const journals = new Set(publications.value.map(pub => pub.journal))
  return journals.size
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
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
}

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
  background: #f8f9fa;
}

.publications-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0 40px;
  text-align: center;
}

.publications-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.publications-header p {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
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
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-right {
  display: flex;
  gap: 15px;
}

.stats-section {
  display: flex;
  gap: 40px;
  margin: 30px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-item {
  text-align: center;
}

.stats-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.stats-label {
  font-size: 0.9rem;
  color: #666;
}

.publications-list {
  min-height: 400px;
}

.publication-item {
  background: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.publication-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.publication-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.publication-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: #666;
}

.authors {
  font-weight: 500;
}

.journal {
  font-style: italic;
}

.publication-details {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.citation-count,
.impact-factor {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
}

.publication-abstract {
  color: #555;
  line-height: 1.6;
  margin: 15px 0;
}

.publication-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.full-abstract {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.full-abstract h4 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.full-abstract p {
  color: #555;
  line-height: 1.7;
  margin: 0 0 15px 0;
}

.keywords h4 {
  margin: 15px 0 10px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

@media (max-width: 768px) {
  .publications-header h1 {
    font-size: 2rem;
  }

  .filter-toolbar {
    flex-direction: column;
    gap: 15px;
  }

  .filter-right {
    flex-direction: column;
    width: 100%;
  }

  .filter-right .el-select {
    width: 100% !important;
  }

  .stats-section {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .publication-meta {
    flex-direction: column;
    gap: 8px;
  }

  .publication-actions {
    flex-direction: column;
  }

  .publication-actions .el-button {
    width: 100%;
  }
}
</style>
