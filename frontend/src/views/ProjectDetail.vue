<template>
  <div class="project-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <el-icon class="rotating">
          <Loading />
        </el-icon>
        <p>加载项目详情中...</p>
      </div>
    </div>

    <div v-else-if="project" class="project-detail-content">
      <!-- 项目头部 -->
      <div class="project-header">
        <div class="header-overlay"></div>
        <div class="header-pattern"></div>

        <!-- 返回按钮 -->
        <div class="container">
          <div class="back-button-wrapper">
            <el-button @click="goBack" class="back-button" circle>
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </el-button>
            <span class="back-text" @click="goBack">返回项目列表</span>
          </div>
        </div>

        <div class="container">
          <div class="header-content">
            <div class="project-badges">
              <el-tag :type="getCategoryTagType(project.category)" size="large" effect="dark" class="badge">
                {{ getCategoryText(project.category) }}
              </el-tag>
              <el-tag :type="getStatusTagType(project.status)" size="large" effect="dark" class="badge">
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>

            <h1 class="project-title">{{ project.title }}</h1>
            <p v-if="project.title_en" class="project-title-en">{{ project.title_en }}</p>

            <div class="project-quick-info">
              <div class="quick-info-grid">
                <div class="quick-info-item">
                  <div class="info-icon">
                    <el-icon>
                      <User />
                    </el-icon>
                  </div>
                  <div class="info-text">
                    <div class="info-label">项目负责人</div>
                    <div class="info-value">{{ project.principal_investigator || '未设定' }}</div>
                  </div>
                </div>
                <div class="quick-info-item">
                  <div class="info-icon">
                    <el-icon>
                      <OfficeBuilding />
                    </el-icon>
                  </div>
                  <div class="info-text">
                    <div class="info-label">资助机构</div>
                    <div class="info-value">{{ project.funding_agency || '未设定' }}</div>
                  </div>
                </div>
                <div class="quick-info-item" v-if="project.funding_amount">
                  <div class="info-icon">
                    <el-icon>
                      <Money />
                    </el-icon>
                  </div>
                  <div class="info-text">
                    <div class="info-label">资助金额</div>
                    <div class="info-value">{{ formatCurrency(project.funding_amount) }}</div>
                  </div>
                </div>
                <div class="quick-info-item">
                  <div class="info-icon">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                  </div>
                  <div class="info-text">
                    <div class="info-label">项目周期</div>
                    <div class="info-value">
                      {{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目内容 -->
      <div class="project-content">
        <div class="container">
          <div class="content-grid">
            <!-- 主要内容 -->
            <div class="main-content">
              <!-- 项目封面 -->
              <div class="project-cover-section">
                <div v-if="project.cover_image" class="project-cover">
                  <img :src="project.cover_image" :alt="project.title" />
                </div>
                <div v-else class="project-cover-placeholder">
                  <div class="placeholder-pattern">
                    <div class="pattern-grid">
                      <div v-for="i in 20" :key="i" class="grid-item"></div>
                    </div>
                    <div class="placeholder-content">
                      <el-icon class="placeholder-icon">
                        <DataAnalysis />
                      </el-icon>
                      <p class="placeholder-text">暂无项目封面</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 项目描述 -->
              <div class="content-section project-description">
                <div class="section-header">
                  <div class="section-icon">
                    <el-icon>
                      <Document />
                    </el-icon>
                  </div>
                  <h2 class="section-title">项目描述</h2>
                </div>
                <div class="description-content">
                  <p>{{ project.description || '暂无项目描述' }}</p>
                </div>
              </div>

              <!-- 参与人员 -->
              <div v-if="project.participants" class="content-section project-participants">
                <div class="section-header">
                  <div class="section-icon">
                    <el-icon>
                      <UserFilled />
                    </el-icon>
                  </div>
                  <h2 class="section-title">参与人员</h2>
                </div>
                <div class="participants-content">
                  <p>{{ project.participants }}</p>
                </div>
              </div>

              <!-- 项目附件 -->
              <div v-if="project.attachments && project.attachments.length > 0"
                class="content-section project-attachments">
                <div class="section-header">
                  <div class="section-icon">
                    <el-icon>
                      <Paperclip />
                    </el-icon>
                  </div>
                  <h2 class="section-title">相关附件</h2>
                </div>
                <div class="attachments-grid">
                  <div v-for="(attachment, index) in project.attachments" :key="index" class="attachment-card"
                    @click="downloadAttachment(attachment)">
                    <div class="attachment-icon">
                      <el-icon>
                        <Document />
                      </el-icon>
                    </div>
                    <div class="attachment-info">
                      <div class="attachment-name">{{ attachment.name }}</div>
                      <div class="attachment-action">
                        <el-icon>
                          <Download />
                        </el-icon>
                        <span>下载</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 侧边栏 -->
            <div class="sidebar">
              <!-- 项目信息卡片 -->
              <div class="info-card">
                <div class="card-header">
                  <el-icon class="card-icon">
                    <InfoFilled />
                  </el-icon>
                  <h3 class="card-title">项目信息</h3>
                </div>
                <div class="info-list">
                  <div class="info-row">
                    <span class="label">
                      <el-icon>
                        <Memo />
                      </el-icon>
                      项目编号
                    </span>
                    <span class="value">#{{ project.id }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">
                      <el-icon>
                        <CollectionTag />
                      </el-icon>
                      项目类别
                    </span>
                    <span class="value">{{ getCategoryText(project.category) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">
                      <el-icon>
                        <CircleCheck />
                      </el-icon>
                      项目状态
                    </span>
                    <span class="value">
                      <el-tag :type="getStatusTagType(project.status)" size="small" effect="dark">
                        {{ getStatusText(project.status) }}
                      </el-tag>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="label">
                      <el-icon>
                        <Timer />
                      </el-icon>
                      开始时间
                    </span>
                    <span class="value">{{ formatDate(project.start_date) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">
                      <el-icon>
                        <Timer />
                      </el-icon>
                      结束时间
                    </span>
                    <span class="value">{{ formatDate(project.end_date) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">
                      <el-icon>
                        <Clock />
                      </el-icon>
                      创建时间
                    </span>
                    <span class="value">{{ formatDate(project.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- 其他项目 -->
              <div v-if="relatedProjects.length > 0" class="related-projects-card">
                <div class="card-header">
                  <el-icon class="card-icon">
                    <Link />
                  </el-icon>
                  <h3 class="card-title">其他项目</h3>
                </div>
                <div class="related-list">
                  <div v-for="relatedProject in relatedProjects" :key="relatedProject.id" class="related-item"
                    @click="viewRelatedProject(relatedProject)">
                    <div class="related-image">
                      <img v-if="relatedProject.cover_image" :src="relatedProject.cover_image"
                        :alt="relatedProject.title" />
                      <div v-else class="related-placeholder">
                        <el-icon>
                          <DataAnalysis />
                        </el-icon>
                      </div>
                    </div>
                    <div class="related-content">
                      <h4 class="related-title">{{ relatedProject.title }}</h4>
                      <div class="related-meta">
                        <el-tag :type="getCategoryTagType(relatedProject.category)" size="small">
                          {{ getCategoryText(relatedProject.category) }}
                        </el-tag>
                      </div>
                    </div>
                    <div class="related-arrow">
                      <el-icon>
                        <ArrowRight />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <div class="container">
        <div class="error-content">
          <el-icon class="error-icon">
            <WarningFilled />
          </el-icon>
          <h3>项目不存在</h3>
          <p>该项目可能已被删除或不存在</p>
          <el-button type="primary" @click="goBack" class="back-home-btn">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            返回项目列表
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
import {
  ArrowLeft,
  ArrowRight,
  Document,
  User,
  UserFilled,
  Paperclip,
  Download,
  Loading,
  OfficeBuilding,
  Money,
  Calendar,
  DataAnalysis,
  InfoFilled,
  Memo,
  CollectionTag,
  CircleCheck,
  Timer,
  Clock,
  Link,
  WarningFilled
} from '@element-plus/icons-vue'
import api from '@/utils/api'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const project = ref(null)
const relatedProjects = ref([])

// 加载项目数据
const loadProjectData = () => {
  const projectId = route.params.id
  if (projectId) {
    loadProjectDetail(projectId)
    loadRelatedProjects(projectId)
  }
}

// 生命周期
onMounted(() => {
  loadProjectData()
})

// 监听路由变化
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // 重新加载数据
    loadProjectData()
  }
})

// 加载项目详情
const loadProjectDetail = async (id) => {
  try {
    loading.value = true
    const response = await api.get(`/projects/${id}`)
    if (response && response.data) {
      project.value = response.data
    }
  } catch (error) {
    console.error('加载项目详情失败:', error)
    ElMessage.error('加载项目详情失败')
    router.push('/projects') // 如果项目不存在，返回项目列表
  } finally {
    loading.value = false
  }
}

// 加载其他项目
const loadRelatedProjects = async (currentId) => {
  try {
    const response = await api.get('/projects', {
      params: {
        limit: 4,
        exclude: currentId
      }
    })
    if (response && response.data) {
      relatedProjects.value = response.data.projects || []
    }
  } catch (error) {
    console.error('加载其他项目失败:', error)
  }
}

// 查看其他项目
const viewRelatedProject = (relatedProject) => {
  router.push(`/projects/${relatedProject.id}`)
}

// 下载附件
const downloadAttachment = (attachment) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank')
  }
}

// 返回项目列表
const goBack = () => {
  router.push('/projects')
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

const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
.project-detail-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f7fa 0%, #ffffff 100%);
}

/* ========== 加载状态 ========== */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner .rotating {
  font-size: 48px;
  color: #667eea;
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.loading-spinner p {
  margin-top: 20px;
  color: #6b7280;
  font-size: 1rem;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ========== 项目头部 ========== */
.project-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 0 80px;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  z-index: 1;
}

.header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  z-index: 2;
}

.back-button-wrapper {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeInDown 0.5s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateX(-3px);
}

.back-text {
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.back-text:hover {
  opacity: 1;
}

.header-content {
  position: relative;
  z-index: 3;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
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

.project-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.badge {
  backdrop-filter: blur(10px);
  font-weight: 600;
  border: none;
  padding: 8px 20px;
}

.project-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 15px 0;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
}

.project-title-en {
  font-size: 1.3rem;
  opacity: 0.9;
  margin: 0 0 40px 0;
  font-style: italic;
  font-weight: 300;
}

.project-quick-info {
  margin-top: 40px;
}

.quick-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.quick-info-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.quick-info-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

.info-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
  text-align: left;
}

.info-label {
  font-size: 0.85rem;
  opacity: 0.85;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.05rem;
  font-weight: 600;
}

/* ========== 项目内容 ========== */
.project-content {
  padding: 50px 0 80px;
  margin-top: -30px;
  position: relative;
  z-index: 10;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

/* ========== 主要内容 ========== */
.main-content {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.project-cover-section {
  margin-bottom: 30px;
}

.project-cover img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  display: block;
}

.project-cover-placeholder {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  opacity: 0.12;
}

.grid-item {
  background: white;
  animation: pulse 3s ease-in-out infinite;
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
    opacity: 0.7;
  }
}

.placeholder-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.placeholder-icon {
  font-size: 100px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }
}

.placeholder-text {
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

.content-section {
  padding: 35px 40px;
  border-bottom: 1px solid #f0f2f5;
}

.content-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.section-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.description-content,
.participants-content {
  line-height: 1.9;
  color: #4b5563;
  font-size: 1rem;
}

.description-content p,
.participants-content p {
  margin: 0;
  text-align: justify;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.attachment-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.attachment-card:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.attachment-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-action {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ========== 侧边栏 ========== */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-card,
.related-projects-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f2f5;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f2f5;
}

.card-icon {
  font-size: 24px;
  color: #667eea;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.info-row:hover {
  background: #f3f4f6;
  transform: translateX(3px);
}

.info-row .label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-row .value {
  font-weight: 600;
  text-align: right;
  color: #1f2937;
}

/* ========== 其他项目 ========== */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.related-item:hover {
  background: #f9fafb;
  border-color: #667eea;
  transform: translateX(5px);
}

.related-image {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.related-content {
  flex: 1;
  min-width: 0;
}

.related-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 8px;
}

.related-arrow {
  color: #667eea;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.related-item:hover .related-arrow {
  transform: translateX(5px);
}

/* ========== 错误状态 ========== */
.error-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 100px;
  color: #f59e0b;
  margin-bottom: 25px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-10px);
  }

  75% {
    transform: translateX(10px);
  }
}

.error-content h3 {
  font-size: 1.8rem;
  color: #1f2937;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.error-content p {
  color: #6b7280;
  margin: 0 0 30px 0;
  font-size: 1rem;
}

.back-home-btn {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 768px) {
  .project-header {
    padding: 25px 0 60px;
  }

  .project-title {
    font-size: 2.2rem;
  }

  .project-title-en {
    font-size: 1.1rem;
  }

  .quick-info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .quick-info-item {
    padding: 15px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .sidebar {
    order: 2;
  }

  .main-content {
    order: 1;
  }

  .content-section {
    padding: 25px 20px;
  }

  .info-card,
  .related-projects-card {
    padding: 20px;
  }

  .project-badges {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .attachments-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .project-title {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .back-button-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .project-cover-placeholder {
    height: 300px;
  }

  .placeholder-icon {
    font-size: 70px;
  }
}
</style>