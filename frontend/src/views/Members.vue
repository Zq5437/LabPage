<template>
  <div class="members-page">
    <!-- 页面头部 - 现代化设计 -->
    <div class="members-hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <div class="particles-container">
          <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
        </div>
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <el-icon>
              <User />
            </el-icon>
            <span>TEAM MEMBERS</span>
          </div>
          <h1 class="hero-title">实验室成员</h1>
          <p class="hero-subtitle">优秀的团队，卓越的研究</p>
          <p class="hero-description">
            汇聚来自全球的优秀人才，共同探索前沿科技，追求学术卓越
          </p>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 搜索和筛选工具栏 - 优化版 -->
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索成员姓名、研究兴趣..." class="search-input" clearable
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="selectedCategory" placeholder="选择类别" class="category-select" clearable
            @change="filterByCategory">
            <el-option v-for="category in categoryOptions" :key="category.value" :label="category.label"
              :value="category.value">
              <span class="category-option">
                <el-icon>
                  <component :is="getCategoryIcon(category.value)" />
                </el-icon>
                {{ category.label }}
              </span>
            </el-option>
          </el-select>
        </div>
      </div>

      <!-- 统计信息 - 增强版 -->
      <div class="stats-section" v-if="!loading">
        <div class="stats-item" v-for="(stat, index) in statsData" :key="index">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon>
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-content">
            <span class="stats-number">{{ stat.value }}</span>
            <span class="stats-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- 成员分组显示 -->
      <div class="members-content" v-loading="loading">
        <!-- 教师 -->
        <div v-if="groupedMembers.faculty && groupedMembers.faculty.length > 0" class="member-group">
          <div class="group-header">
            <h2 class="group-title">
              <div class="title-icon faculty-icon">
                <el-icon>
                  <User />
                </el-icon>
              </div>
              <span>教师团队</span>
            </h2>
            <div class="group-count">{{ groupedMembers.faculty.length }} 位成员</div>
          </div>
          <div class="members-grid">
            <div v-for="member in groupedMembers.faculty" :key="member.id" class="member-card faculty-card"
              @click="viewMemberDetail(member)">
              <div class="card-badge">教师</div>
              <div class="member-avatar-wrapper">
                <div class="avatar-decoration"></div>
                <div class="member-avatar">
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                  <div v-else class="default-avatar faculty-default">
                    <span class="avatar-text">教师</span>
                  </div>
                </div>
                <div class="avatar-overlay">
                  <el-icon class="view-icon">
                    <ZoomIn />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en" v-if="member.name_en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio || '致力于前沿科学研究，培养优秀人才' }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    class="interest-tag" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact" v-if="member.email">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 博士后 -->
        <div v-if="groupedMembers.postdoc && groupedMembers.postdoc.length > 0" class="member-group">
          <div class="group-header">
            <h2 class="group-title">
              <div class="title-icon postdoc-icon">
                <el-icon>
                  <StarFilled />
                </el-icon>
              </div>
              <span>博士后研究员</span>
            </h2>
            <div class="group-count">{{ groupedMembers.postdoc.length }} 位成员</div>
          </div>
          <div class="members-grid">
            <div v-for="member in groupedMembers.postdoc" :key="member.id" class="member-card postdoc-card"
              @click="viewMemberDetail(member)">
              <div class="card-badge postdoc-badge">博士后</div>
              <div class="member-avatar-wrapper">
                <div class="avatar-decoration"></div>
                <div class="member-avatar">
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                  <div v-else class="default-avatar postdoc-default">
                    <span class="avatar-text">博士后</span>
                  </div>
                </div>
                <div class="avatar-overlay">
                  <el-icon class="view-icon">
                    <ZoomIn />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en" v-if="member.name_en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio || '从事前沿研究，追求学术卓越' }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    class="interest-tag" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact" v-if="member.email">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 博士研究生 -->
        <div v-if="groupedMembers.phd && groupedMembers.phd.length > 0" class="member-group">
          <div class="group-header">
            <h2 class="group-title">
              <div class="title-icon phd-icon">
                <el-icon>
                  <Reading />
                </el-icon>
              </div>
              <span>博士研究生</span>
            </h2>
            <div class="group-count">{{ groupedMembers.phd.length }} 位成员</div>
          </div>
          <div class="members-grid">
            <div v-for="member in groupedMembers.phd" :key="member.id" class="member-card student-card"
              @click="viewMemberDetail(member)">
              <div class="card-badge phd-badge">博士生</div>
              <div class="member-avatar-wrapper">
                <div class="avatar-decoration"></div>
                <div class="member-avatar">
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                  <div v-else class="default-avatar phd-default">
                    <span class="avatar-text">博士生</span>
                  </div>
                </div>
                <div class="avatar-overlay">
                  <el-icon class="view-icon">
                    <ZoomIn />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en" v-if="member.name_en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio || '专注学术研究，勇攀科学高峰' }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    class="interest-tag" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact" v-if="member.email">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 硕士研究生 -->
        <div v-if="groupedMembers.master && groupedMembers.master.length > 0" class="member-group">
          <div class="group-header">
            <h2 class="group-title">
              <div class="title-icon master-icon">
                <el-icon>
                  <School />
                </el-icon>
              </div>
              <span>硕士研究生</span>
            </h2>
            <div class="group-count">{{ groupedMembers.master.length }} 位成员</div>
          </div>
          <div class="members-grid">
            <div v-for="member in groupedMembers.master" :key="member.id" class="member-card student-card"
              @click="viewMemberDetail(member)">
              <div class="card-badge master-badge">硕士生</div>
              <div class="member-avatar-wrapper">
                <div class="avatar-decoration"></div>
                <div class="member-avatar">
                  <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                  <div v-else class="default-avatar master-default">
                    <span class="avatar-text">硕士生</span>
                  </div>
                </div>
                <div class="avatar-overlay">
                  <el-icon class="view-icon">
                    <ZoomIn />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en" v-if="member.name_en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio || '努力学习，积极探索科研之路' }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    class="interest-tag" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact" v-if="member.email">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredMembers.length === 0" class="empty-state">
          <el-empty :description="searchQuery || selectedCategory ? '未找到匹配的成员' : '暂无成员数据'" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search, User, Message, Link, Document, StarFilled, Reading, School, Notebook,
  TrendCharts, Phone, ZoomIn, UserFilled, Postcard, OfficeBuilding
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const members = ref([])
const groupedMembers = ref({})
const searchQuery = ref('')
const selectedCategory = ref('')

// 类别选项
const categoryOptions = [
  { label: '教师', value: 'faculty' },
  { label: '博士后', value: 'postdoc' },
  { label: '博士生', value: 'phd' },
  { label: '硕士生', value: 'master' },
  { label: '本科生', value: 'undergraduate' },
  { label: '校友', value: 'alumni' }
]

// 搜索防抖
let searchTimeout = null

// 计算属性
const filteredMembers = computed(() => {
  let filtered = members.value

  if (selectedCategory.value) {
    filtered = filtered.filter(member => member.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(member => {
      return member.name.toLowerCase().includes(query) ||
        (member.name_en && member.name_en.toLowerCase().includes(query)) ||
        (member.bio && member.bio.toLowerCase().includes(query)) ||
        (member.research_interests && member.research_interests.toLowerCase().includes(query))
    })
  }

  return filtered
})

const totalResearchAreas = computed(() => {
  const allInterests = members.value
    .map(member => member.research_interests)
    .filter(interests => interests)
    .join(',')
    .split(',')
    .map(interest => interest.trim())
    .filter(interest => interest)

  return new Set(allInterests).size
})

// 统计数据
const statsData = computed(() => [
  {
    icon: UserFilled,
    value: filteredMembers.value.length,
    label: '位成员',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: OfficeBuilding,
    value: Object.keys(groupedMembers.value).length,
    label: '个类别',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: TrendCharts,
    value: totalResearchAreas.value,
    label: '个研究领域',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
])

// 加载成员列表
const loadMembers = async () => {
  try {
    loading.value = true
    const response = await api.get('/members', {
      params: {
        status: 'active'
      }
    })

    if (response && response.data) {
      members.value = response.data.members || []
      groupedMembers.value = response.data.groupedMembers || {}
    }
  } catch (error) {
    console.error('加载成员列表失败:', error)
    ElMessage.error('加载成员列表失败')
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
    // 重新筛选数据
    updateGroupedMembers()
  }, 300)
}

// 按类别筛选
const filterByCategory = () => {
  updateGroupedMembers()
}

// 更新分组数据
const updateGroupedMembers = () => {
  const filtered = filteredMembers.value
  const grouped = filtered.reduce((acc, member) => {
    if (!acc[member.category]) {
      acc[member.category] = []
    }
    acc[member.category].push(member)
    return acc
  }, {})

  groupedMembers.value = grouped
}

// 查看成员详情 - 跳转到详情页
const viewMemberDetail = (member) => {
  window.location.href = `/members/${member.id}`
}

// 获取研究兴趣数组
const getInterests = (interests) => {
  if (!interests) return []
  return interests.split(',').map(interest => interest.trim()).filter(interest => interest)
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 获取类别图标
const getCategoryIcon = (category) => {
  const iconMap = {
    faculty: User,
    postdoc: StarFilled,
    phd: Reading,
    master: School,
    undergraduate: Notebook,
    alumni: UserFilled
  }
  return iconMap[category] || User
}

// 获取类别标签
const getCategoryLabel = (category) => {
  const labelMap = {
    faculty: '教师',
    postdoc: '博士后',
    phd: '博士生',
    master: '硕士生',
    undergraduate: '本科生',
    alumni: '校友'
  }
  return labelMap[category] || '成员'
}

// 获取类别标签类型
const getCategoryTagType = (category) => {
  const typeMap = {
    faculty: 'danger',
    postdoc: 'warning',
    phd: 'primary',
    master: '',
    undergraduate: 'info',
    alumni: 'success'
  }
  return typeMap[category] || ''
}

// 默认头像现在使用CSS渐变背景和文字，不再需要外部图片服务

// 获取粒子样式
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 10

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// 初始化
onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.members-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

/* Hero Section - 现代化设计 */
.members-hero {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 0 80px;
  overflow: hidden;
  margin-bottom: -50px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #667eea 0%, transparent 70%);
  top: -200px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #f093fb 0%, transparent 70%);
  top: 50%;
  right: -150px;
  animation-delay: -7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #4facfe 0%, transparent 70%);
  bottom: -100px;
  left: 30%;
  animation-delay: -14s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }

  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: rise infinite ease-in;
  bottom: -10px;
}

@keyframes rise {
  to {
    bottom: 110%;
    opacity: 0;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: fadeInDown 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  letter-spacing: -1px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0 0 15px 0;
  opacity: 0.95;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.hero-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
  animation: fadeInUp 0.8s ease-out 0.4s both;
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* 筛选工具栏 */
.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 80px 0 40px;
  padding: 25px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
  gap: 20px;
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 1;
}

.filter-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 350px;
}

.category-select {
  width: 180px;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 统计信息 - 增强版 */
.stats-section {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 40px 0 60px;
  padding: 0;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  flex: 1;
  max-width: 350px;
}

.stats-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 8px;
}

.stats-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

/* 成员组样式 */
.member-group {
  margin-bottom: 70px;
  animation: fadeInUp 0.6s ease-out both;
}

.member-group:nth-child(1) {
  animation-delay: 0.7s;
}

.member-group:nth-child(2) {
  animation-delay: 0.8s;
}

.member-group:nth-child(3) {
  animation-delay: 0.9s;
}

.member-group:nth-child(4) {
  animation-delay: 1s;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.title-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.faculty-icon {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.postdoc-icon {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.phd-icon {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.master-icon {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.group-count {
  font-size: 1rem;
  color: #7f8c8d;
  font-weight: 500;
}

/* 成员网格 */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 30px;
}

/* 成员卡片 */
.member-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
}

.member-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 2;
  color: #e74c3c;
}

.postdoc-badge {
  color: #f39c12;
}

.phd-badge,
.master-badge {
  color: #3498db;
}

.member-avatar-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.avatar-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
  z-index: 0;
}

.member-avatar {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.member-card:hover .member-avatar img {
  transform: scale(1.05);
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.default-avatar .avatar-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  user-select: none;
}

/* 不同类别的默认头像颜色 */
.faculty-default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.postdoc-default {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.phd-default {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.master-default {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.undergraduate-default {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.alumni-default {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.member-card:hover .avatar-overlay {
  opacity: 1;
}

.view-icon {
  font-size: 2.5rem;
  color: white;
}

/* 成员信息 */
.member-info {
  padding: 28px;
}

.member-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 6px 0;
  line-height: 1.2;
}

.member-name-en {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0 0 12px 0;
  font-style: italic;
  font-weight: 400;
}

.member-title {
  font-size: 1.05rem;
  color: #667eea;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: inline-block;
  padding: 4px 0;
  border-bottom: 2px solid #667eea;
}

.member-bio {
  color: #555;
  line-height: 1.7;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
  /* 保留换行符 */
  word-wrap: break-word;
  /* 自动换行 */
}

.member-interests {
  margin: 16px 0;
  min-height: 36px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interest-tag {
  border-radius: 6px;
  font-size: 0.85rem;
}

.member-contact {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.member-contact .el-icon {
  font-size: 1.1rem;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100px 20px;
  grid-column: 1 / -1;
}

.empty-state :deep(.el-empty__description) {
  font-size: 1.1rem;
  color: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }

  .filter-left,
  .filter-right {
    width: 100%;
  }

  .search-input,
  .category-select {
    width: 100% !important;
  }

  .stats-section {
    flex-direction: column;
    gap: 20px;
  }

  .stats-item {
    max-width: 100%;
  }

  .members-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .group-title {
    font-size: 1.6rem;
  }

  .title-icon {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .member-info {
    padding: 20px;
  }

  .member-avatar-wrapper {
    height: 180px;
  }

  .member-name {
    font-size: 1.2rem;
  }

  .card-badge {
    top: 10px;
    right: 10px;
    padding: 4px 12px;
    font-size: 0.8rem;
  }
}
</style>
