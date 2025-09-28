<template>
  <div class="projects-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">研究项目</h1>
        <p class="page-subtitle">Research Projects</p>
      </div>
    </div>

    <!-- 项目内容 -->
    <div class="page-content">
      <div class="container">
        <!-- 搜索和筛选 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-left">
              <el-input v-model="searchQuery" placeholder="搜索项目标题或关键词..." style="width: 300px" clearable
                @input="handleSearch">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
            </div>

            <div class="filter-right">
              <el-select v-model="selectedCategory" placeholder="项目类别" clearable
                style="width: 150px; margin-right: 15px" @change="loadProjects">
                <el-option label="国家级" value="national" />
                <el-option label="省部级" value="provincial" />
                <el-option label="校级" value="institutional" />
                <el-option label="企业合作" value="enterprise" />
                <el-option label="国际合作" value="international" />
              </el-select>

              <el-select v-model="selectedStatus" placeholder="项目状态" clearable style="width: 120px"
                @change="loadProjects">
                <el-option label="进行中" value="ongoing" />
                <el-option label="已完成" value="completed" />
                <el-option label="暂停" value="suspended" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 项目统计 -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ totalProjects }}</div>
              <div class="stat-label">总项目数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ ongoingProjects }}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ completedProjects }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ formatCurrencyForTemplate(totalFunding) }}</div>
              <div class="stat-label">总资助金额</div>
            </div>
          </div>
        </div>

        <!-- 项目列表 -->
        <div class="projects-section" v-loading="loading">
          <div v-if="projects.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无项目数据">
              <el-button type="primary" @click="loadProjects">刷新</el-button>
            </el-empty>
          </div>

          <div v-else class="projects-grid">
            <div v-for="project in projects" :key="project.id" class="project-card" @click="viewProject(project)">
              <div class="project-image">
                <img v-if="project.cover_image" :src="project.cover_image" :alt="project.title" />
                <div v-else class="default-image">
                  <el-icon>
                    <Document />
                  </el-icon>
                </div>
                <div class="project-status">
                  <el-tag :type="getStatusTagType(project.status)" size="small">
                    {{ getStatusText(project.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="project-content">
                <div class="project-header">
                  <h3 class="project-title">{{ project.title }}</h3>
                  <div class="project-category">
                    <el-tag :type="getCategoryTagType(project.category)" size="small">
                      {{ getCategoryText(project.category) }}
                    </el-tag>
                  </div>
                </div>

                <p class="project-description">{{ project.description }}</p>

                <div class="project-info">
                  <div class="info-item">
                    <el-icon>
                      <User />
                    </el-icon>
                    <span>{{ project.principal_investigator }}</span>
                  </div>
                  <div class="info-item" v-if="project.funding_amount">
                    <el-icon>
                      <Money />
                    </el-icon>
                    <span>{{ formatCurrencyForTemplate(project.funding_amount) }}</span>
                  </div>
                </div>

                <div class="project-timeline">
                  <div class="timeline-item">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                    <span>{{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}</span>
                  </div>
                </div>

                <div class="project-footer">
                  <div class="funding-agency">{{ project.funding_agency }}</div>
                  <el-button type="primary" size="small" @click.stop="viewProject(project)">
                    查看详情
                    <el-icon>
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
              @size-change="handleSizeChange" @current-change="handlePageChange" />
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
import { Search, Document, User, Money, Calendar, ArrowRight } from '@element-plus/icons-vue'
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
  background: #f8f9fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.page-content {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 30px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-right {
  display: flex;
  align-items: center;
}

/* 统计区域 */
.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  background: white;
  padding: 30px 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 项目区域 */
.projects-section {
  min-height: 400px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.project-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.project-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f0f2f5, #e8ebf0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #c0c4cc;
}

.project-status {
  position: absolute;
  top: 10px;
  right: 10px;
}

.project-content {
  padding: 25px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.project-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 10px;
}

.project-description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.project-timeline {
  margin-bottom: 20px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.funding-agency {
  color: #999;
  font-size: 0.85rem;
  flex: 1;
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 60px 0 40px;
  }

  .page-title {
    font-size: 2.2rem;
  }

  .container {
    padding: 0 15px;
  }

  .filter-row {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .filter-right {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-header {
    flex-direction: column;
    gap: 10px;
  }

  .project-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-number {
    font-size: 2rem;
  }
}
</style>