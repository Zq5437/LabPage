<template>
  <div class="recruitment-page">
    <!-- 页面头部 -->
    <div class="recruitment-header">
      <div class="container">
        <h1>招生信息</h1>
        <p>加入我们，共创学术辉煌</p>
      </div>
    </div>

    <div class="container">
      <!-- 筛选工具栏 -->
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索职位、导师、方向..." style="width: 300px" clearable
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="selectedType" placeholder="选择类型" clearable style="width: 150px"
            @change="handleFilterChange">
            <el-option v-for="type in recruitmentTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>

          <el-select v-model="selectedStatus" placeholder="状态" clearable style="width: 120px"
            @change="handleFilterChange">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>

          <el-select v-model="viewMode" style="width: 120px">
            <el-option label="卡片视图" value="card" />
            <el-option label="列表视图" value="list" />
          </el-select>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="!loading">
        <div class="stats-item">
          <span class="stats-number">{{ pagination.total }}</span>
          <span class="stats-label">个招生岗位</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ availablePositions }}</span>
          <span class="stats-label">个可申请</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ uniqueTypes }}</span>
          <span class="stats-label">种类型</span>
        </div>
      </div>

      <!-- 招生信息列表 -->
      <div v-loading="loading">
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="recruitment-list">
          <div v-for="recruitment in filteredRecruitments" :key="recruitment.id" class="recruitment-card">
            <div class="card-header">
              <div class="header-left">
                <h3 class="position-title">{{ recruitment.title }}</h3>
                <div class="position-meta">
                  <el-tag :type="getTypeColor(recruitment.type)" size="small">
                    {{ getTypeName(recruitment.type) }}
                  </el-tag>
                  <el-tag v-if="recruitment.is_featured" type="warning" size="small">推荐</el-tag>
                  <span class="deadline" v-if="recruitment.deadline">
                    截止：{{ formatDate(recruitment.deadline) }}
                  </span>
                  <el-tag v-if="recruitment.deadline && !isExpired(recruitment.deadline)"
                    :type="getDeadlineTagType(recruitment.deadline)" size="small" class="time-left">
                    剩余{{ daysUntilDeadline(recruitment.deadline) }}天
                  </el-tag>
                  <span class="positions" v-if="recruitment.positions">
                    名额：{{ recruitment.positions }}人
                  </span>
                </div>
              </div>
              <div class="header-right">
                <el-tag :type="getStatusColor(recruitment.status)" effect="dark">
                  {{ getStatusText(recruitment.status) }}
                </el-tag>
              </div>
            </div>

            <div class="card-content">
              <p class="description">{{ recruitment.description }}</p>

              <div class="requirements" v-if="recruitment.requirements">
                <h4>申请要求</h4>
                <div class="requirements-content">
                  {{ recruitment.requirements }}
                </div>
              </div>

              <div class="details-grid">
                <div class="detail-item" v-if="recruitment.supervisor">
                  <span class="label">导师：</span>
                  <span class="value">{{ recruitment.supervisor }}</span>
                </div>
                <div class="detail-item" v-if="recruitment.research_direction">
                  <span class="label">研究方向：</span>
                  <span class="value">{{ recruitment.research_direction }}</span>
                </div>
                <div class="detail-item" v-if="recruitment.degree_type">
                  <span class="label">学位类型：</span>
                  <span class="value">{{ recruitment.degree_type }}</span>
                </div>
                <div class="detail-item" v-if="recruitment.duration">
                  <span class="label">培养周期：</span>
                  <span class="value">{{ recruitment.duration }}</span>
                </div>
              </div>

              <div class="benefits" v-if="recruitment.benefits">
                <h4>待遇福利</h4>
                <div class="benefits-content">
                  {{ recruitment.benefits }}
                </div>
              </div>
            </div>

            <div class="card-actions">
              <el-button @click="viewDetails(recruitment)">
                查看详情
              </el-button>
              <el-button type="primary" :disabled="!isApplyEnabled(recruitment)" @click="applyPosition(recruitment)">
                {{ getApplyButtonText(recruitment) }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="recruitment-table">
          <div v-for="recruitment in filteredRecruitments" :key="recruitment.id" class="recruitment-row">
            <div class="row-left">
              <h3 class="row-title">{{ recruitment.title }}</h3>
              <div class="row-meta">
                <el-tag size="small" :type="getTypeColor(recruitment.type)">{{ getTypeName(recruitment.type) }}</el-tag>
                <el-tag v-if="recruitment.is_featured" size="small" type="warning">推荐</el-tag>
                <span v-if="recruitment.deadline" class="row-deadline">截止：{{ formatDate(recruitment.deadline) }}</span>
                <span v-if="recruitment.positions" class="row-positions">名额：{{ recruitment.positions }}人</span>
              </div>
              <p class="row-desc">{{ recruitment.description }}</p>
            </div>
            <div class="row-right">
              <el-tag :type="getStatusColor(recruitment.status)" effect="dark">{{ getStatusText(recruitment.status)
              }}</el-tag>
              <el-button type="primary" size="small" :disabled="!isApplyEnabled(recruitment)"
                @click="applyPosition(recruitment)">申请</el-button>
              <el-button size="small" @click="viewDetails(recruitment)">详情</el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredRecruitments.length === 0" class="empty-state">
          <el-empty description="暂无招生信息" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="pagination.total > 0">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
          :page-sizes="[6, 12, 18, 24]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadRecruitments" @current-change="loadRecruitments" />
      </div>

      <!-- 申请流程 -->
      <div class="application-process" v-if="recruitments.length > 0">
        <h2>申请流程</h2>
        <div class="process-steps">
          <div class="step-item" v-for="(step, index) in applicationSteps" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="contact-section" v-if="recruitments.length > 0">
        <h2>联系我们</h2>
        <div class="contact-info">
          <div class="contact-item">
            <el-icon>
              <Phone />
            </el-icon>
            <div>
              <h4>电话咨询</h4>
              <p>+86 xxx-xxxx-xxxx</p>
            </div>
          </div>
          <div class="contact-item">
            <el-icon>
              <Message />
            </el-icon>
            <div>
              <h4>邮件咨询</h4>
              <p>recruitment@lab.edu.cn</p>
            </div>
          </div>
          <div class="contact-item">
            <el-icon>
              <Location />
            </el-icon>
            <div>
              <h4>地址</h4>
              <p>请查看联系我们页面获取详细地址</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" :title="selectedRecruitment?.title" width="800px" destroy-on-close>
      <div v-if="selectedRecruitment" class="recruitment-detail">
        <div class="detail-header">
          <div class="position-info">
            <h2>{{ selectedRecruitment.title }}</h2>
            <div class="position-tags">
              <el-tag :type="getTypeColor(selectedRecruitment.type)">
                {{ getTypeName(selectedRecruitment.type) }}
              </el-tag>
              <el-tag :type="getStatusColor(selectedRecruitment.status)" effect="dark">
                {{ getStatusText(selectedRecruitment.status) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <h3>职位描述</h3>
            <p>{{ selectedRecruitment.description }}</p>
          </div>

          <div v-if="selectedRecruitment.requirements" class="detail-section">
            <h3>申请要求</h3>
            <div class="requirements-text">{{ selectedRecruitment.requirements }}</div>
          </div>

          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="info-grid">
              <div class="info-item" v-if="selectedRecruitment.supervisor">
                <span class="label">指导教师：</span>
                <span class="value">{{ selectedRecruitment.supervisor }}</span>
              </div>
              <div class="info-item" v-if="selectedRecruitment.research_direction">
                <span class="label">研究方向：</span>
                <span class="value">{{ selectedRecruitment.research_direction }}</span>
              </div>
              <div class="info-item" v-if="selectedRecruitment.degree_type">
                <span class="label">学位类型：</span>
                <span class="value">{{ selectedRecruitment.degree_type }}</span>
              </div>
              <div class="info-item" v-if="selectedRecruitment.duration">
                <span class="label">培养周期：</span>
                <span class="value">{{ selectedRecruitment.duration }}</span>
              </div>
              <div class="info-item" v-if="selectedRecruitment.positions">
                <span class="label">招生名额：</span>
                <span class="value">{{ selectedRecruitment.positions }}人</span>
              </div>
              <div class="info-item" v-if="selectedRecruitment.deadline">
                <span class="label">申请截止：</span>
                <span class="value">{{ formatDate(selectedRecruitment.deadline) }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedRecruitment.benefits" class="detail-section">
            <h3>待遇福利</h3>
            <div class="benefits-text">{{ selectedRecruitment.benefits }}</div>
          </div>

          <div v-if="selectedRecruitment.contact_info" class="detail-section">
            <h3>联系方式</h3>
            <div class="contact-text">{{ selectedRecruitment.contact_info }}</div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="!selectedRecruitment || !isApplyEnabled(selectedRecruitment)"
          @click="applyPosition(selectedRecruitment)">
          {{ selectedRecruitment ? getApplyButtonText(selectedRecruitment) : '申请职位' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'
import {
  Phone, Message, Location, Search
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const recruitments = ref([])
const viewMode = ref('card')
const selectedType = ref('')
const selectedStatus = ref('')
const searchQuery = ref('')
const detailVisible = ref(false)
const selectedRecruitment = ref(null)

// 招生类型
const recruitmentTypes = [
  { label: '硕士研究生', value: 'master' },
  { label: '博士研究生', value: 'phd' },
  { label: '博士后', value: 'postdoc' },
  { label: '访问学者', value: 'visiting' }
]

// 状态筛选项
const statusOptions = [
  { label: '招生中', value: 'open' },
  { label: '已满员', value: 'filled' },
  { label: '已结束', value: 'closed' }
]

// 申请流程
const applicationSteps = [
  {
    title: '查看职位',
    description: '浏览招生信息，选择合适的研究方向和导师'
  },
  {
    title: '准备材料',
    description: '准备个人简历、研究计划、推荐信等申请材料'
  },
  {
    title: '提交申请',
    description: '通过邮件或指定渠道提交完整的申请材料'
  },
  {
    title: '等待审核',
    description: '招生委员会将对申请材料进行审核评估'
  },
  {
    title: '面试交流',
    description: '通过初审的申请者将受邀参加面试或学术交流'
  },
  {
    title: '录取通知',
    description: '最终录取结果将通过邮件或电话通知'
  }
]

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0
})

// 列表直接使用服务端分页结果
const filteredRecruitments = computed(() => recruitments.value)

const availablePositions = computed(() => {
  return recruitments.value.filter(r => isApplyEnabled(r)).length
})

const uniqueTypes = computed(() => {
  const types = new Set(recruitments.value.map(r => r.type))
  return types.size
})

// 加载招生信息
const loadRecruitments = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: 'created_at',
      order: 'DESC',
      type: selectedType.value || undefined,
      status: selectedStatus.value !== '' ? selectedStatus.value : '',
      search: searchQuery.value || undefined
    }
    const response = await api.get('/recruitment/list', { params })

    if (response.data) {
      recruitments.value = response.data || []
    }
    if (response.pagination) {
      pagination.total = response.pagination.total
      pagination.page = response.pagination.page
      pagination.limit = response.pagination.limit
    }
  } catch (error) {
    console.error('加载招生信息失败:', error)
    ElMessage.error('加载招生信息失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理（防抖）
let searchTimeout = null
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadRecruitments()
  }, 500)
}

// 下拉筛选变更
const handleFilterChange = () => {
  pagination.page = 1
  loadRecruitments()
}

// 查看详情
const viewDetails = (recruitment) => {
  selectedRecruitment.value = recruitment
  detailVisible.value = true
}

// 申请职位
const applyPosition = async (recruitment) => {
  try {
    await ElMessageBox.confirm(
      `确定要申请"${recruitment.title}"职位吗？这将打开邮件客户端发送申请邮件。`,
      '确认申请',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 构建邮件链接
    const subject = encodeURIComponent(`申请职位：${recruitment.title}`)
    const body = encodeURIComponent(`尊敬的老师，您好！

我对贵实验室的"${recruitment.title}"职位非常感兴趣，希望能够申请该职位。

基本信息：
- 职位类型：${getTypeName(recruitment.type)}
- 研究方向：${recruitment.research_direction || '无'}
- 指导教师：${recruitment.supervisor || '无'}

我将在后续邮件中发送详细的申请材料，包括个人简历、研究计划等。

期待您的回复！

此致
敬礼！`)

    const emailLink = `mailto:recruitment@lab.edu.cn?subject=${subject}&body=${body}`
    window.open(emailLink, '_self')

    detailVisible.value = false
    ElMessage.success('邮件客户端已打开，请完善申请内容后发送')
  } catch (error) {
    // 用户取消申请
  }
}

// 获取类型名称
const getTypeName = (type) => {
  const typeMap = {
    'master': '硕士研究生',
    'phd': '博士研究生',
    'postdoc': '博士后',
    'visiting': '访问学者'
  }
  return typeMap[type] || type
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    'master': 'warning',
    'phd': 'danger',
    'postdoc': 'info',
    'visiting': 'primary'
  }
  return colorMap[type] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'open': '招生中',
    'active': '招生中',
    'closed': '已结束',
    'filled': '已满员'
  }
  return statusMap[status] || status
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'open': 'success',
    'active': 'success',
    'closed': 'info',
    'filled': 'warning'
  }
  return colorMap[status] || 'default'
}

// 规范化状态值，处理后端可能返回的不同命名
const normalizeStatus = (status) => {
  if (status === 'active') return 'open'
  return status
}

// 是否已过截止日期
const isExpired = (deadline) => {
  if (!deadline) return false
  return new Date(deadline).getTime() < Date.now()
}

// 距截止剩余天数（向上取整）
const daysUntilDeadline = (deadline) => {
  if (!deadline) return null
  const ms = new Date(deadline).getTime() - Date.now()
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0
}

// 根据剩余天数给出标签颜色
const getDeadlineTagType = (deadline) => {
  const days = daysUntilDeadline(deadline)
  if (days === null) return 'info'
  if (days <= 0) return 'danger'
  if (days <= 7) return 'warning'
  return 'success'
}

// 是否可以申请
const isApplyEnabled = (recruitment) => {
  if (!recruitment) return false
  const status = normalizeStatus(recruitment.status)
  const noPositionsLeft = typeof recruitment.positions === 'number' && recruitment.positions <= 0
  return status === 'open' && !isExpired(recruitment.deadline) && !noPositionsLeft
}

// 申请按钮文案
const getApplyButtonText = (recruitment) => {
  if (!recruitment) return '申请职位'
  if (isExpired(recruitment.deadline)) return '已截止'
  const status = normalizeStatus(recruitment.status)
  if (status === 'filled') return '已满员'
  if (!isApplyEnabled(recruitment)) return '不可申请'
  return '申请职位'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 初始化
onMounted(() => {
  loadRecruitments()
})
</script>

<style scoped>
.recruitment-page {
  min-height: 100vh;
  background: #f8f9fa;
  /* 防止最后一个子元素的 margin-bottom 与父元素合并，导致页脚上方出现空白 */
  padding-bottom: 50px;
}

.recruitment-header {
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
}

.recruitment-header h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.recruitment-header p {
  font-size: 1.3rem;
  margin: 0;
  opacity: 0.95;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 顶部筛选工具栏 */
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

.quick-nav {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 40px 0 60px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-item {
  text-align: center;
}

.stats-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #6c5ce7;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.recruitment-list {
  display: grid;
  gap: 20px;
  margin-bottom: 60px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.recruitment-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recruitment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.position-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.position-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.deadline,
.positions {
  font-size: 0.9rem;
  color: #666;
}

.card-content {
  margin-bottom: 20px;
}

.description {
  color: #555;
  line-height: 1.7;
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.requirements,
.benefits {
  margin: 20px 0;
}

.requirements h4,
.benefits h4 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.requirements-content,
.benefits-content {
  color: #555;
  line-height: 1.6;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6c5ce7;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
  min-width: 70px;
}

.detail-item .value {
  color: #333;
}

.card-actions {
  display: flex;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.time-left {
  font-weight: 600;
}

.application-process {
  margin: 80px 0;
  text-align: center;
}

.application-process h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0 0 50px 0;
  font-weight: 600;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.step-item {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #6c5ce7;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 auto 20px;
}

.step-content h4 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.step-content p {
  color: #666;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
}

.contact-section {
  margin: 80px 0;
  text-align: center;
}

.contact-section h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0 0 50px 0;
  font-weight: 600;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.contact-item .el-icon {
  font-size: 2rem;
  color: #6c5ce7;
}

.contact-item h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.contact-item p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

/* 详情对话框样式 */
.recruitment-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 30px;
}

.position-info h2 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.6rem;
}

.position-tags {
  display: flex;
  gap: 10px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.detail-section p {
  color: #555;
  line-height: 1.7;
  margin: 0;
}

.requirements-text,
.benefits-text,
.contact-text {
  color: #555;
  line-height: 1.7;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  white-space: pre-line;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 10px;
}

.info-item .label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-item .value {
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

/* 列表视图样式 */
.recruitment-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recruitment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.recruitment-row:last-child {
  border-bottom: none;
}

.row-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row-title {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.row-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
}

.row-desc {
  margin: 0;
  color: #555;
  font-size: 0.9rem;
}

.row-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

/* 移除页面容器内最后一个区块的底部外边距，避免与页脚之间出现空隙 */
.recruitment-page .container>*:last-child {
  margin-bottom: 0 !important;
}

@media (max-width: 768px) {
  .recruitment-header h1 {
    font-size: 2.2rem;
  }

  .recruitment-header p {
    font-size: 1.1rem;
  }

  .quick-nav {
    flex-direction: column;
    align-items: center;
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
    gap: 30px;
    text-align: center;
  }

  .card-header {
    flex-direction: column;
    gap: 15px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .process-steps {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .contact-info {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .contact-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>