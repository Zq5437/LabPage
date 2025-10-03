<template>
  <div class="member-detail-page">
    <!-- 增强版头部横幅 -->
    <div class="detail-hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <div class="hero-pattern"></div>
      </div>

      <div class="container">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">
            <el-icon>
              <HomeFilled />
            </el-icon>
            首页
          </router-link>
          <span class="separator">›</span>
          <router-link to="/members" class="breadcrumb-link">实验室成员</router-link>
          <span class="separator">›</span>
          <span class="current">成员详情</span>
        </div>

        <div class="hero-title-section" v-if="member">
          <div class="hero-badge">
            <el-icon>
              <User />
            </el-icon>
            <span>{{ getCategoryLabel(member.category) }}</span>
          </div>
          <h1 class="hero-main-title">{{ member.name }}</h1>
          <p class="hero-subtitle" v-if="member.name_en">{{ member.name_en }}</p>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="container" v-loading="loading">
      <div class="detail-content" v-if="member">
        <!-- 顶部信息卡片组 -->
        <div class="top-cards-grid">
          <!-- 个人头像卡片 -->
          <div class="avatar-card">
            <div class="card-glow"></div>
            <div class="avatar-card-inner">
              <div class="avatar-wrapper">
                <div class="avatar-ring"></div>
                <img v-if="member.avatar" :src="member.avatar" :alt="member.name" class="avatar" />
                <div v-else class="default-avatar">
                  <img :src="getDefaultAvatar(member.category)" :alt="member.name" />
                </div>
                <div class="status-indicator" :class="member.status">
                  <span class="status-dot"></span>
                  {{ getStatusLabel(member.status) }}
                </div>
              </div>
              <div class="avatar-info">
                <h2>{{ member.name }}</h2>
                <p class="title-text">{{ member.title }}</p>

                <!-- 显示年级（学生）或导师（学生/博士后） -->
                <div class="additional-info" v-if="member.grade || member.supervisor">
                  <span v-if="member.grade" class="info-badge">{{ member.grade }}</span>
                  <span v-if="member.supervisor" class="info-badge">
                    <el-icon>
                      <UserFilled />
                    </el-icon>
                    导师：{{ member.supervisor }}
                  </span>
                </div>

                <!-- 显示专业（本科生） -->
                <p v-if="member.major" class="major-text">
                  <el-icon>
                    <Reading />
                  </el-icon>
                  {{ member.major }}
                </p>

                <!-- 显示当前去向（校友） -->
                <p v-if="member.current_position" class="current-position">
                  <el-icon>
                    <OfficeBuilding />
                  </el-icon>
                  {{ member.current_position }}
                </p>

                <el-tag :type="getCategoryTagType(member.category)" effect="plain" size="large" class="category-tag">
                  <el-icon>
                    <User />
                  </el-icon>
                  {{ getCategoryLabel(member.category) }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 联系方式卡片 -->
          <div class="contact-card" v-if="member.email || member.homepage || member.google_scholar">
            <div class="card-glow"></div>
            <div class="card-header-styled">
              <div class="header-icon-wrapper">
                <el-icon class="header-icon">
                  <Phone />
                </el-icon>
              </div>
              <h3>联系方式</h3>
            </div>
            <div class="contact-items">
              <div v-if="member.email" class="contact-item-modern">
                <div class="contact-icon email-icon">
                  <el-icon>
                    <Message />
                  </el-icon>
                </div>
                <div class="contact-details">
                  <span class="contact-label">电子邮箱</span>
                  <a :href="`mailto:${member.email}`" class="contact-value">{{ member.email }}</a>
                </div>
              </div>
              <div v-if="member.homepage" class="contact-item-modern">
                <div class="contact-icon web-icon">
                  <el-icon>
                    <Link />
                  </el-icon>
                </div>
                <div class="contact-details">
                  <span class="contact-label">个人主页</span>
                  <a :href="member.homepage" target="_blank" class="contact-value">
                    访问主页
                    <el-icon class="arrow-icon">
                      <Right />
                    </el-icon>
                  </a>
                </div>
              </div>
              <div v-if="member.google_scholar" class="contact-item-modern">
                <div class="contact-icon scholar-icon">
                  <el-icon>
                    <Document />
                  </el-icon>
                </div>
                <div class="contact-details">
                  <span class="contact-label">学术资料</span>
                  <a :href="member.google_scholar" target="_blank" class="contact-value">
                    Google Scholar
                    <el-icon class="arrow-icon">
                      <Right />
                    </el-icon>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细信息区域 -->
        <div class="info-section-wrapper">
          <!-- 个人简介 -->
          <div class="info-card modern-card" v-if="member.bio">
            <div class="card-glow"></div>
            <div class="card-header-modern">
              <div class="header-icon-circle">
                <el-icon>
                  <UserFilled />
                </el-icon>
              </div>
              <div class="header-text">
                <h3>个人简介</h3>
                <p>Personal Introduction</p>
              </div>
            </div>
            <div class="card-body-modern">
              <p class="bio-text">{{ member.bio }}</p>
            </div>
          </div>

          <!-- 研究兴趣 -->
          <div class="info-card modern-card" v-if="member.research_interests">
            <div class="card-glow"></div>
            <div class="card-header-modern">
              <div class="header-icon-circle">
                <el-icon>
                  <TrendCharts />
                </el-icon>
              </div>
              <div class="header-text">
                <h3>研究兴趣</h3>
                <p>Research Interests</p>
              </div>
            </div>
            <div class="card-body-modern">
              <div class="interests-cloud">
                <div v-for="(interest, index) in getInterests(member.research_interests)" :key="interest"
                  class="interest-bubble" :style="{ animationDelay: `${index * 0.1}s` }">
                  <el-icon>
                    <Star />
                  </el-icon>
                  <span>{{ interest }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 教育背景 -->
          <div class="info-card modern-card" v-if="member.education">
            <div class="card-glow"></div>
            <div class="card-header-modern">
              <div class="header-icon-circle">
                <el-icon>
                  <School />
                </el-icon>
              </div>
              <div class="header-text">
                <h3>教育背景</h3>
                <p>Educational Background</p>
              </div>
            </div>
            <div class="card-body-modern">
              <p class="education-text">{{ member.education }}</p>
            </div>
          </div>

          <!-- 荣誉称号（教师） -->
          <div class="info-card modern-card" v-if="member.honors">
            <div class="card-glow"></div>
            <div class="card-header-modern">
              <div class="header-icon-circle">
                <el-icon>
                  <Trophy />
                </el-icon>
              </div>
              <div class="header-text">
                <h3>荣誉称号</h3>
                <p>Honors & Awards</p>
              </div>
            </div>
            <div class="card-body-modern">
              <p class="education-text">{{ member.honors }}</p>
            </div>
          </div>

          <!-- 职位履历 -->
          <div class="info-card modern-card" v-if="member.positions">
            <div class="card-glow"></div>
            <div class="card-header-modern">
              <div class="header-icon-circle">
                <el-icon>
                  <Briefcase />
                </el-icon>
              </div>
              <div class="header-text">
                <h3>职位履历</h3>
                <p>Positions</p>
              </div>
            </div>
            <div class="card-body-modern">
              <p class="education-text">{{ member.positions }}</p>
            </div>
          </div>

          <!-- 学术服务 -->
          <div class="info-card modern-card" v-if="member.academic_service">
            <div class="card-glow"></div>
            <div class="card-header-modern">
              <div class="header-icon-circle">
                <el-icon>
                  <Document />
                </el-icon>
              </div>
              <div class="header-text">
                <h3>学术服务</h3>
                <p>Professional Service</p>
              </div>
            </div>
            <div class="card-body-modern">
              <p class="education-text">{{ member.academic_service }}</p>
            </div>
          </div>

          <!-- 研究成果（论文列表） -->
          <div class="info-card modern-card" v-if="publications.length > 0" v-loading="publicationsLoading">
            <div class="card-glow"></div>
            <div class="card-header-modern">
              <div class="header-icon-circle">
                <el-icon>
                  <Notebook />
                </el-icon>
              </div>
              <div class="header-text">
                <h3>研究成果</h3>
                <p>Publications & Achievements</p>
              </div>
              <div class="publication-count">{{ publications.length }} 篇</div>
            </div>
            <div class="card-body-modern">
              <div class="publications-list">
                <div class="publication-item" v-for="(pub, index) in publications" :key="pub.id">
                  <div class="pub-number">{{ index + 1 }}</div>
                  <div class="pub-content">
                    <h4 class="pub-title">{{ pub.title }}</h4>
                    <p class="pub-authors">{{ pub.authors }}</p>
                    <div class="pub-meta">
                      <span v-if="pub.journal" class="pub-journal">
                        <el-icon>
                          <Document />
                        </el-icon>
                        {{ pub.journal }}
                      </span>
                      <span class="pub-year">
                        <el-icon>
                          <Calendar />
                        </el-icon>
                        {{ pub.year }}
                      </span>
                      <span v-if="pub.citations" class="pub-citations">
                        <el-icon>
                          <TrendCharts />
                        </el-icon>
                        引用 {{ pub.citations }}
                      </span>
                    </div>
                    <div class="pub-links" v-if="pub.doi || pub.url || pub.pdf_url">
                      <a v-if="pub.doi" :href="`https://doi.org/${pub.doi}`" target="_blank" class="pub-link">
                        <el-icon>
                          <Link />
                        </el-icon>
                        DOI
                      </a>
                      <a v-if="pub.url" :href="pub.url" target="_blank" class="pub-link">
                        <el-icon>
                          <Link />
                        </el-icon>
                        访问
                      </a>
                      <a v-if="pub.pdf_url" :href="pub.pdf_url" target="_blank" class="pub-link">
                        <el-icon>
                          <Document />
                        </el-icon>
                        PDF
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="action-bar">
          <el-button size="large" class="action-btn back-btn" @click="$router.back()">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            返回列表
          </el-button>
          <el-button type="primary" size="large" class="action-btn contact-btn" @click="$router.push('/contact')">
            <el-icon>
              <Message />
            </el-icon>
            联系我们
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state">
        <div class="empty-icon">
          <el-icon>
            <User />
          </el-icon>
        </div>
        <h3>未找到该成员信息</h3>
        <p>该成员可能已离职或信息不存在</p>
        <el-button type="primary" @click="$router.push('/members')" class="back-to-list-btn">
          返回成员列表
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  User, Phone, Message, Link, Document, TrendCharts, School, Star,
  Trophy, Medal, Calendar, ArrowLeft, HomeFilled, UserFilled, Right,
  Notebook, Position, Reading, OfficeBuilding, Briefcase
} from '@element-plus/icons-vue'

const route = useRoute()
const loading = ref(false)
const member = ref(null)
const publications = ref([])
const publicationsLoading = ref(false)

// 加载成员详情
const loadMemberDetail = async () => {
  try {
    loading.value = true
    const response = await api.get(`/members/${route.params.id}`)
    if (response && response.data) {
      member.value = response.data
    }
  } catch (error) {
    console.error('加载成员详情失败:', error)
    ElMessage.error('加载成员详情失败')
  } finally {
    loading.value = false
  }
}

// 加载成员相关论文
const loadMemberPublications = async () => {
  try {
    publicationsLoading.value = true
    const response = await api.get(`/members/${route.params.id}/publications`)
    if (response && response.data) {
      publications.value = response.data
    }
  } catch (error) {
    console.error('加载成员论文失败:', error)
    // 论文加载失败不显示错误提示，静默处理
  } finally {
    publicationsLoading.value = false
  }
}

// 获取研究兴趣数组
const getInterests = (interests) => {
  if (!interests) return []
  return interests.split(',').map(interest => interest.trim()).filter(interest => interest)
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

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    active: '在职',
    alumni: '校友'
  }
  return statusMap[status] || status
}

// 获取默认头像
const getDefaultAvatar = (category) => {
  const avatarMap = {
    faculty: 'https://via.placeholder.com/400x400/667eea/ffffff?text=Professor',
    postdoc: 'https://via.placeholder.com/400x400/f39c12/ffffff?text=Postdoc',
    phd: 'https://via.placeholder.com/400x400/3498db/ffffff?text=PhD',
    master: 'https://via.placeholder.com/400x400/9b59b6/ffffff?text=Master',
    undergraduate: 'https://via.placeholder.com/400x400/2ecc71/ffffff?text=UG',
    alumni: 'https://via.placeholder.com/400x400/95a5a6/ffffff?text=Alumni'
  }
  return avatarMap[category] || 'https://via.placeholder.com/400x400/95a5a6/ffffff?text=Member'
}

// 初始化
onMounted(() => {
  loadMemberDetail()
  loadMemberPublications()
})
</script>

<style scoped>
.member-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%);
}

/* Hero Section - 增强版 */
.detail-hero {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 0 120px;
  overflow: hidden;
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
  filter: blur(80px);
  opacity: 0.4;
  animation: float 25s infinite ease-in-out;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #667eea 0%, transparent 70%);
  top: -250px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #f093fb 0%, transparent 70%);
  bottom: -200px;
  left: -100px;
  animation-delay: -10s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #4facfe 0%, transparent 70%);
  top: 50%;
  left: 30%;
  animation-delay: -5s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(50px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(30deg, rgba(255, 255, 255, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.05) 87.5%, rgba(255, 255, 255, 0.05)),
    linear-gradient(150deg, rgba(255, 255, 255, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.05) 87.5%, rgba(255, 255, 255, 0.05));
  background-size: 80px 140px;
  opacity: 0.3;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  animation: fadeInDown 0.6s ease-out;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.breadcrumb-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.breadcrumb .separator {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
}

.breadcrumb .current {
  color: white;
  font-weight: 500;
}

/* Hero标题区 */
.hero-title-section {
  text-align: center;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.hero-main-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 15px 0;
  letter-spacing: -1px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  margin: 0;
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

/* 详情内容 */
.detail-content {
  margin-top: -60px;
  position: relative;
}

/* 顶部卡片组 */
.top-cards-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

/* 头像卡片 */
.avatar-card,
.contact-card {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.avatar-card:hover .card-glow,
.contact-card:hover .card-glow,
.modern-card:hover .card-glow {
  opacity: 1;
}

.avatar-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.avatar-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
}

.avatar-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  opacity: 0.15;
  animation: pulse 3s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.15;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.25;
  }
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 6px solid white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.default-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
  color: #2ecc71;
}

.status-indicator.alumni {
  color: #95a5a6;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: blink 2s infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.avatar-info {
  text-align: center;
  width: 100%;
}

.avatar-info h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.title-text {
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 500;
  margin: 0 0 15px 0;
}

.category-tag {
  font-size: 1rem;
  padding: 8px 20px;
}

/* 额外信息显示 */
.additional-info {
  display: flex;
  gap: 10px;
  margin: 12px 0;
  flex-wrap: wrap;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f0f2f5;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
}

.major-text,
.current-position {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  color: #667eea;
  font-size: 1rem;
  font-weight: 500;
}

/* 联系方式卡片 */
.card-header-styled {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.card-header-styled h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-item-modern {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.contact-item-modern:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.contact-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.email-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.web-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.scholar-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.contact-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.contact-value {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s ease;
}

.contact-value[href]:hover {
  color: #667eea;
}

.arrow-icon {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.contact-value:hover .arrow-icon {
  transform: translateX(4px);
}

/* 信息区块 */
.info-section-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 40px;
}

.modern-card {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out both;
  transition: all 0.3s ease;
}

.modern-card:nth-child(1) {
  animation-delay: 0.5s;
}

.modern-card:nth-child(2) {
  animation-delay: 0.6s;
}

.modern-card:nth-child(3) {
  animation-delay: 0.7s;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.card-header-modern {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #f0f0f0;
}

.header-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.header-text h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.header-text p {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

.card-body-modern {
  padding: 35px;
}

.bio-text,
.education-text {
  color: #555;
  line-height: 1.9;
  font-size: 1.05rem;
  margin: 0;
  white-space: pre-wrap;
  /* 保留换行符和空格 */
  word-wrap: break-word;
  /* 自动换行 */
}

/* 研究兴趣云 */
.interests-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.interest-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  animation: bounceIn 0.6s ease-out both;
}

.interest-bubble:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}

/* 扩展卡片网格 */
.extension-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

/* 占位卡片 */
/* 论文列表样式 */
.publication-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: auto;
}

.publications-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.publication-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.publication-item:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f0f3ff 100%);
  border-color: #667eea;
  transform: translateX(5px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.pub-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.1rem;
}

.pub-content {
  flex: 1;
  min-width: 0;
}

.pub-title {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.5;
}

.pub-authors {
  margin: 0 0 12px 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

.pub-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.pub-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.pub-meta span .el-icon {
  font-size: 1rem;
  color: #667eea;
}

.pub-journal {
  font-style: italic;
}

.pub-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pub-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.pub-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pub-link .el-icon {
  font-size: 0.9rem;
}

.placeholder-card {
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 20px;
  padding: 35px;
  text-align: center;
  border: 2px dashed #dee2e6;
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out both;
}

.placeholder-card:nth-child(1) {
  animation-delay: 0.8s;
}

.placeholder-card:nth-child(2) {
  animation-delay: 0.9s;
}

.placeholder-card:nth-child(3) {
  animation-delay: 1s;
}

.placeholder-card:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  transform: translateY(-3px);
}

.placeholder-icon-bg {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.placeholder-card:hover .placeholder-icon-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.placeholder-icon {
  font-size: 2.5rem;
  color: #adb5bd;
  transition: color 0.3s ease;
}

.placeholder-card:hover .placeholder-icon {
  color: white;
}

.placeholder-card h4 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
}

.placeholder-desc {
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

.placeholder-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #95a5a6;
  font-size: 0.95rem;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 50px 0;
  animation: fadeInUp 0.8s ease-out 1.1s both;
}

.action-btn {
  font-size: 1rem;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn {
  background: white;
  border: 2px solid #dee2e6;
  color: #495057;
}

.back-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.contact-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100px 20px;
  animation: fadeInUp 0.8s ease-out;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #adb5bd;
}

.empty-state h3 {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.empty-state p {
  margin: 0 0 30px 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.back-to-list-btn {
  padding: 12px 30px;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .top-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-hero {
    padding: 60px 0 100px;
  }

  .hero-main-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .avatar-wrapper {
    width: 160px;
    height: 160px;
  }

  .avatar-card,
  .contact-card {
    padding: 30px;
  }

  .card-body-modern {
    padding: 25px;
  }

  .extension-cards-grid {
    grid-template-columns: 1fr;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .hero-main-title {
    font-size: 2rem;
  }

  .breadcrumb {
    font-size: 0.85rem;
  }

  .avatar-wrapper {
    width: 140px;
    height: 140px;
  }

  .card-header-modern {
    padding: 20px;
  }

  .header-icon-circle {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .header-text h3 {
    font-size: 1.2rem;
  }
}
</style>
