<template>
  <div class="project-detail-page">
    <div v-if="loading" class="loading-container">
      <el-loading-spinner />
    </div>

    <div v-else-if="project" class="project-detail-content">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button @click="goBack" type="primary" plain>
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回项目列表
        </el-button>
      </div>

      <!-- 项目头部 -->
      <div class="project-header">
        <div class="container">
          <div class="header-content">
            <div class="project-meta">
              <el-tag :type="getCategoryTagType(project.category)" size="large">
                {{ getCategoryText(project.category) }}
              </el-tag>
              <el-tag :type="getStatusTagType(project.status)" size="large">
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>

            <h1 class="project-title">{{ project.title }}</h1>
            <p v-if="project.title_en" class="project-title-en">{{ project.title_en }}</p>

            <div class="project-basic-info">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">项目负责人</div>
                  <div class="info-value">{{ project.principal_investigator }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">资助机构</div>
                  <div class="info-value">{{ project.funding_agency }}</div>
                </div>
                <div class="info-item" v-if="project.funding_amount">
                  <div class="info-label">资助金额</div>
                  <div class="info-value">{{ formatCurrency(project.funding_amount) }}</div>
                </div>
                <div class="info-item">
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

      <!-- 项目内容 -->
      <div class="project-content">
        <div class="container">
          <div class="content-grid">
            <!-- 主要内容 -->
            <div class="main-content">
              <!-- 项目封面 -->
              <div v-if="project.cover_image" class="project-cover">
                <img :src="project.cover_image" :alt="project.title" />
              </div>

              <!-- 项目描述 -->
              <div class="project-description">
                <h2 class="section-title">
                  <el-icon>
                    <Document />
                  </el-icon>
                  项目描述
                </h2>
                <div class="description-content">
                  <p>{{ project.description }}</p>
                </div>
              </div>

              <!-- 参与人员 -->
              <div v-if="project.participants" class="project-participants">
                <h2 class="section-title">
                  <el-icon>
                    <User />
                  </el-icon>
                  参与人员
                </h2>
                <div class="participants-content">
                  <p>{{ project.participants }}</p>
                </div>
              </div>

              <!-- 项目附件 -->
              <div v-if="project.attachments && project.attachments.length > 0" class="project-attachments">
                <h2 class="section-title">
                  <el-icon>
                    <Paperclip />
                  </el-icon>
                  相关附件
                </h2>
                <div class="attachments-list">
                  <div v-for="(attachment, index) in project.attachments" :key="index" class="attachment-item">
                    <el-button type="text" @click="downloadAttachment(attachment)">
                      <el-icon>
                        <Download />
                      </el-icon>
                      {{ attachment.name }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 侧边栏 -->
            <div class="sidebar">
              <!-- 项目信息卡片 -->
              <div class="info-card">
                <h3 class="card-title">项目信息</h3>
                <div class="info-list">
                  <div class="info-row">
                    <span class="label">项目编号</span>
                    <span class="value">#{{ project.id }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">项目类别</span>
                    <span class="value">{{ getCategoryText(project.category) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">项目状态</span>
                    <span class="value">
                      <el-tag :type="getStatusTagType(project.status)" size="small">
                        {{ getStatusText(project.status) }}
                      </el-tag>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="label">开始时间</span>
                    <span class="value">{{ formatDate(project.start_date) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">结束时间</span>
                    <span class="value">{{ formatDate(project.end_date) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">创建时间</span>
                    <span class="value">{{ formatDate(project.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- 相关项目 -->
              <div v-if="relatedProjects.length > 0" class="related-projects">
                <h3 class="card-title">相关项目</h3>
                <div class="related-list">
                  <div v-for="relatedProject in relatedProjects" :key="relatedProject.id" class="related-item"
                    @click="viewRelatedProject(relatedProject)">
                    <div class="related-image">
                      <img v-if="relatedProject.cover_image" :src="relatedProject.cover_image"
                        :alt="relatedProject.title" />
                      <div v-else class="default-image">
                        <el-icon>
                          <Document />
                        </el-icon>
                      </div>
                    </div>
                    <div class="related-content">
                      <h4 class="related-title">{{ relatedProject.title }}</h4>
                      <div class="related-meta">
                        <span class="category">{{ getCategoryText(relatedProject.category) }}</span>
                        <span class="status">{{ getStatusText(relatedProject.status) }}</span>
                      </div>
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
        <el-empty description="项目不存在或已被删除">
          <el-button type="primary" @click="goBack">返回项目列表</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Document, User, Paperclip, Download
} from '@element-plus/icons-vue'
import api from '@/utils/api'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const project = ref(null)
const relatedProjects = ref([])

// 生命周期
onMounted(() => {
  const projectId = route.params.id
  if (projectId) {
    loadProjectDetail(projectId)
    loadRelatedProjects(projectId)
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

// 加载相关项目
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
    console.error('加载相关项目失败:', error)
  }
}

// 查看相关项目
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
  background: #f8f9fa;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button {
  padding: 20px 0;
}

/* 项目头部 */
.project-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0 60px;
}

.header-content {
  text-align: center;
}

.project-meta {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.project-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.project-title-en {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0 0 30px 0;
  font-style: italic;
}

.project-basic-info {
  margin-top: 40px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.info-item {
  text-align: center;
}

.info-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 8px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 600;
}

/* 项目内容 */
.project-content {
  padding: 40px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 40px;
}

/* 主要内容 */
.main-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.project-cover {
  margin-bottom: 30px;
}

.project-cover img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.description-content,
.participants-content {
  line-height: 1.8;
  color: #555;
  margin-bottom: 30px;
}

.description-content p,
.participants-content p {
  margin: 0;
  text-align: justify;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  padding: 10px;
  border: 1px solid #e8ebf0;
  border-radius: 6px;
  background: #f8f9fa;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.related-projects {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row .label {
  color: #666;
  font-size: 0.9rem;
}

.info-row .value {
  font-weight: 500;
  text-align: right;
}

/* 相关项目 */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.related-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.related-item:hover {
  background-color: #f8f9fa;
}

.related-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-image {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.related-content {
  flex: 1;
  min-width: 0;
}

.related-title {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  gap: 10px;
  color: #999;
  font-size: 0.8rem;
}

.error-state {
  padding: 60px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-header {
    padding: 30px 0 40px;
  }

  .project-title {
    font-size: 2rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .sidebar {
    order: -1;
  }

  .main-content {
    padding: 20px;
  }

  .info-card,
  .related-projects {
    padding: 20px;
  }

  .project-meta {
    flex-direction: column;
    align-items: center;
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
}
</style>