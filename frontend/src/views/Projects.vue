<template>
  <div class="projects-page">
    <!-- 页面标题 - 增强版 -->
    <div class="page-header">
      <div class="header-overlay"></div>
      <div class="header-pattern"></div>
      <div class="container">
        <div class="header-content">
          <div class="title-wrapper">
            <h1 class="page-title">研究项目</h1>
            <p class="page-subtitle">Research Projects</p>
            <p class="page-description">探索前沿科技，创新驱动未来</p>
          </div>
          <div class="header-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目内容 -->
    <div class="page-content">
      <div class="container">
        <!-- 搜索和筛选 - 优化版 -->
        <div class="filter-section">
          <div class="filter-card">
            <div class="filter-row">
              <div class="filter-left">
                <el-input v-model="searchQuery" placeholder="搜索项目标题、关键词或负责人..." class="search-input" clearable
                  @input="handleSearch">
                  <template #prefix>
                    <el-icon class="search-icon">
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </div>

              <div class="filter-right">
                <el-select v-model="selectedCategory" placeholder="项目类别" clearable class="filter-select"
                  @change="loadProjects">
                  <el-option label="国家级" value="national" />
                  <el-option label="省部级" value="provincial" />
                  <el-option label="校级" value="institutional" />
                  <el-option label="企业合作" value="enterprise" />
                  <el-option label="国际合作" value="international" />
                </el-select>

                <el-select v-model="selectedStatus" placeholder="项目状态" clearable class="filter-select"
                  @change="loadProjects">
                  <el-option label="进行中" value="ongoing" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="暂停" value="suspended" />
                </el-select>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目统计 - 增强版 -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-item stat-primary">
              <div class="stat-icon">
                <el-icon>
                  <Folder />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ totalProjects }}</div>
                <div class="stat-label">总项目数</div>
              </div>
            </div>
            <div class="stat-item stat-success">
              <div class="stat-icon">
                <el-icon>
                  <CircleCheck />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ ongoingProjects }}</div>
                <div class="stat-label">进行中</div>
              </div>
            </div>
            <div class="stat-item stat-info">
              <div class="stat-icon">
                <el-icon>
                  <SuccessFilled />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ completedProjects }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
            <div class="stat-item stat-warning">
              <div class="stat-icon">
                <el-icon>
                  <Money />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ formatCurrencyForTemplate(totalFunding) }}</div>
                <div class="stat-label">总资助金额</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目列表 - 重新设计 -->
        <div class="projects-section" v-loading="loading">
          <div v-if="projects.length === 0 && !loading" class="empty-state">
            <div class="empty-illustration">
              <el-icon>
                <DocumentDelete />
              </el-icon>
            </div>
            <h3>暂无项目数据</h3>
            <p>还没有添加任何研究项目</p>
            <el-button type="primary" @click="loadProjects">刷新页面</el-button>
          </div>

          <div v-else class="projects-grid">
            <div v-for="project in projects" :key="project.id" class="project-card" @click="viewProject(project)">
              <div class="project-image-wrapper">
                <div class="project-image">
                  <img v-if="project.cover_image" :src="project.cover_image" :alt="project.title" />
                  <div v-else class="default-image">
                    <div class="placeholder-pattern">
                      <div class="pattern-grid">
                        <div v-for="i in 16" :key="i" class="grid-item"></div>
                      </div>
                      <div class="placeholder-icon">
                        <el-icon>
                          <DataAnalysis />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                  <div class="image-overlay"></div>
                </div>
                <div class="project-badges">
                  <el-tag :type="getStatusTagType(project.status)" class="status-badge" effect="dark">
                    {{ getStatusText(project.status) }}
                  </el-tag>
                  <el-tag :type="getCategoryTagType(project.category)" class="category-badge">
                    {{ getCategoryText(project.category) }}
                  </el-tag>
                </div>
              </div>

              <div class="project-content">
                <div class="project-header">
                  <h3 class="project-title">{{ project.title }}</h3>
                </div>

                <p class="project-description">{{ project.description || '暂无项目描述' }}</p>

                <div class="project-meta">
                  <div class="meta-item">
                    <div class="meta-icon">
                      <el-icon>
                        <User />
                      </el-icon>
                    </div>
                    <div class="meta-content">
                      <div class="meta-label">负责人</div>
                      <div class="meta-value">{{ project.principal_investigator || '未设定' }}</div>
                    </div>
                  </div>

                  <div class="meta-item" v-if="project.funding_amount">
                    <div class="meta-icon">
                      <el-icon>
                        <Money />
                      </el-icon>
                    </div>
                    <div class="meta-content">
                      <div class="meta-label">资助金额</div>
                      <div class="meta-value">{{ formatCurrencyForTemplate(project.funding_amount) }}</div>
                    </div>
                  </div>
                </div>

                <div class="project-timeline">
                  <div class="timeline-icon">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                  </div>
                  <div class="timeline-content">
                    <span class="timeline-date">{{ formatDate(project.start_date) }}</span>
                    <span class="timeline-separator">-</span>
                    <span class="timeline-date">{{ formatDate(project.end_date) }}</span>
                  </div>
                </div>

                <div class="project-footer">
                  <div class="funding-info">
                    <el-icon>
                      <OfficeBuilding />
                    </el-icon>
                    <span>{{ project.funding_agency || '未设定资助机构' }}</span>
                  </div>
                  <el-button type="primary" class="detail-btn" @click.stop="viewProject(project)">
                    查看详情
                    <el-icon class="btn-icon">
                      <ArrowRight />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-section" v-if="pagination.total > 0">
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
              :total="pagination.total" :page-sizes="[12, 24, 48]" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handlePageChange" background />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  User,
  Money,
  Calendar,
  ArrowRight,
  Folder,
  CircleCheck,
  SuccessFilled,
  DocumentDelete,
  DataAnalysis,
  OfficeBuilding
} from '@element-plus/icons-vue'
import api from '@/utils/api'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const projects = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

// 分页
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0
})

// 搜索防抖
let searchTimeout = null

// 计算属性
const totalProjects = computed(() => projects.value.length)
const ongoingProjects = computed(() => projects.value.filter(p => p.status === 'ongoing').length)
const completedProjects = computed(() => projects.value.filter(p => p.status === 'completed').length)
const totalFunding = computed(() => {
  return projects.value.reduce((sum, project) => {
    return sum + (parseFloat(project.funding_amount) || 0)
  }, 0)
})

// 生命周期
onMounted(() => {
  loadProjects()
})

// 加载项目列表
const loadProjects = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }

    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }
    if (selectedStatus.value) {
      params.status = selectedStatus.value
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await api.get('/projects', { params })

    if (response && response.data) {
      projects.value = response.data.projects || []
      pagination.total = response.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadProjects()
  }, 500)
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.limit = size
  pagination.page = 1
  loadProjects()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadProjects()
}

// 查看项目详情
const viewProject = (project) => {
  router.push(`/projects/${project.id}`)
}

// 工具函数
const getCategoryText = (category) => {
  const map = {
    national: '国家级',
    provincial: '省部级',
    institutional: '校级',
    enterprise: '企业合作',
    international: '国际合作'
  }
  return map[category] || category
}

const getCategoryTagType = (category) => {
  const map = {
    national: 'danger',
    provincial: 'warning',
    institutional: 'info',
    enterprise: 'success',
    international: 'primary'
  }
  return map[category] || ''
}

const getStatusText = (status) => {
  const map = {
    ongoing: '进行中',
    completed: '已完成',
    suspended: '暂停'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    ongoing: 'success',
    completed: 'info',
    suspended: 'warning'
  }
  return map[status] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return '未设定'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 过滤器
const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 将过滤器添加到全局
const filters = {
  formatCurrency
}

// 模板中使用过滤器的替代方法
const formatCurrencyForTemplate = (amount) => formatCurrency(amount)
</script>

<style scoped>
.projects-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%);
}

/* ========== 页面头部 ========== */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0 80px;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  z-index: 1;
}

.header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  z-index: 2;
}

.header-content {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-wrapper {
  text-align: left;
  animation: fadeInUp 0.8s ease-out;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -1px;
}

.page-subtitle {
  font-size: 1.4rem;
  opacity: 0.95;
  margin: 0 0 10px 0;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.page-description {
  font-size: 1rem;
  opacity: 0.85;
  margin: 0;
  font-weight: 300;
}

.header-decoration {
  position: relative;
  width: 200px;
  height: 200px;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 3s ease-in-out infinite;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: 0;
  right: 0;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: 0;
  right: 30px;
  animation-delay: 0.5s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  top: 50%;
  right: 120px;
  animation-delay: 1s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
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

.page-content {
  padding: 50px 0 15px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ========== 筛选区域 ========== */
.filter-section {
  margin-bottom: 40px;
  margin-top: -30px;
}

.filter-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  gap: 20px;
}

.filter-left {
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 8px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-icon {
  font-size: 18px;
  color: #667eea;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-select {
  width: 160px;
}

.filter-select :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* ========== 统计区域 ========== */
.stats-section {
  margin-bottom: 50px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.stat-item {
  background: white;
  padding: 30px 25px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

/* 为每个统计卡片设置不同的顶部条颜色 */
.stat-primary::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-success::before {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.stat-info::before {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-warning::before {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-item:hover::before {
  transform: scaleX(1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
}

.stat-warning .stat-icon {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 5px;
  line-height: 1;
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ========== 项目区域 ========== */
.projects-section {
  min-height: 400px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.project-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid transparent;
}

.project-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.project-image-wrapper {
  position: relative;
}

.project-image {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.1);
}

/* 默认占位图案 */
.default-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.placeholder-pattern {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pattern-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  opacity: 0.15;
}

.grid-item {
  background: white;
  animation: pulse 2s ease-in-out infinite;
}

.grid-item:nth-child(odd) {
  animation-delay: 0.5s;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.8;
  }
}

.placeholder-icon {
  position: relative;
  font-size: 80px;
  color: rgba(255, 255, 255, 0.9);
  z-index: 1;
  animation: float 3s ease-in-out infinite;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .image-overlay {
  opacity: 1;
}

.project-badges {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.status-badge {
  backdrop-filter: blur(10px);
  font-weight: 600;
  border: none;
}

.category-badge {
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.project-content {
  padding: 28px;
}

.project-header {
  margin-bottom: 15px;
}

.project-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.project-card:hover .project-title {
  color: #667eea;
}

.project-description {
  color: #6b7280;
  line-height: 1.7;
  margin: 0 0 20px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.95rem;
}

.project-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.meta-item:hover {
  background: #f3f4f6;
  transform: translateX(3px);
}

.meta-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
}

.meta-content {
  flex: 1;
  min-width: 0;
}

.meta-label {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 2px;
  font-weight: 500;
}

.meta-value {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-timeline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
  border-radius: 10px;
  margin-bottom: 20px;
}

.timeline-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #667eea;
  font-size: 18px;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 500;
}

.timeline-date {
  color: #1f2937;
}

.timeline-separator {
  color: #9ca3af;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;
  gap: 15px;
}

.funding-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.85rem;
  flex: 1;
  min-width: 0;
}

.funding-info span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-btn {
  border-radius: 10px;
  font-weight: 600;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.detail-btn:hover .btn-icon {
  transform: translateX(3px);
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-illustration {
  font-size: 100px;
  color: #d1d5db;
  margin-bottom: 25px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 25px 0;
  font-size: 1rem;
}

/* ========== 分页 ========== */
.pagination-section {
  display: flex;
  justify-content: center;
  padding: 50px 0 20px;
}

.pagination-section :deep(.el-pagination) {
  gap: 8px;
}

.pagination-section :deep(.el-pager li) {
  border-radius: 8px;
  font-weight: 600;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 70px 0 50px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .title-wrapper {
    text-align: center;
    margin-bottom: 30px;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
  }

  .header-decoration {
    width: 150px;
    height: 150px;
  }

  .container {
    padding: 0 15px;
  }

  .filter-card {
    border-radius: 12px;
  }

  .filter-row {
    flex-direction: column;
    padding: 20px;
    gap: 15px;
  }

  .filter-left {
    max-width: 100%;
  }

  .filter-right {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .filter-select {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-item {
    padding: 20px 15px;
    gap: 15px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .stat-number {
    font-size: 1.6rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .project-meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .project-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .detail-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
  }

  .stat-number {
    font-size: 1.8rem;
  }

  .project-content {
    padding: 20px;
  }

  .project-image {
    height: 200px;
  }
}
</style>