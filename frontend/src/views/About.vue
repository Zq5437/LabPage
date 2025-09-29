<template>
  <div class="about-page">
    <!-- 页面头部 -->
    <div class="about-header">
      <div class="container">
        <h1>关于我们</h1>
        <p>致力于科技创新，推动学术发展</p>
      </div>
    </div>

    <div class="container">
      <!-- 实验室简介 -->
      <section class="lab-intro" v-loading="loading">
        <div class="intro-content">
          <div class="intro-text">
            <h2>实验室简介</h2>
            <div class="description" v-if="labInfo.description">
              {{ labInfo.description }}
            </div>
            <div class="description" v-else>
              我们是一个专注于前沿科技研究的创新实验室，致力于推动科学技术的发展与创新。
              实验室拥有一支高水平的科研团队，在多个领域取得了重要的研究成果。
              我们秉承"创新、协作、卓越"的理念，为培养优秀人才和推动科技进步不懈努力。
            </div>

            <div class="key-stats">
              <div class="stat-item">
                <span class="stat-number">{{ stats.members || 0 }}</span>
                <span class="stat-label">研究成员</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ stats.projects || 0 }}</span>
                <span class="stat-label">研究项目</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ stats.publications || 0 }}</span>
                <span class="stat-label">发表论文</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ foundedYear }}</span>
                <span class="stat-label">成立年份</span>
              </div>
            </div>
          </div>

          <div class="intro-image">
            <img v-if="labInfo.banner_url" :src="labInfo.banner_url" alt="实验室" @error="handleImageError" />
            <div v-else class="placeholder-image">
              <el-icon>
                <Office />
              </el-icon>
            </div>
          </div>
        </div>
      </section>

      <!-- 发展历程 -->
      <section class="timeline-section">
        <h2>发展历程</h2>
        <div class="timeline">
          <div v-for="(milestone, index) in milestones" :key="index" class="timeline-item"
            :class="{ 'right': index % 2 === 1 }">
            <div class="timeline-content">
              <div class="timeline-year">{{ milestone.year }}</div>
              <h3>{{ milestone.title }}</h3>
              <p>{{ milestone.description }}</p>
            </div>
            <div class="timeline-marker"></div>
          </div>
        </div>
      </section>

      <!-- 研究领域 -->
      <section class="research-areas-section" v-if="researchAreas.length > 0">
        <h2>主要研究领域</h2>
        <div class="areas-grid">
          <div v-for="area in (researchAreas || []).slice(0, 6)" :key="area.id" class="area-card">
            <div class="area-icon">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
            <h3>{{ area.title }}</h3>
            <p>{{ area.description.substring(0, 100) }}...</p>
          </div>
        </div>
        <div class="more-areas">
          <router-link to="/research">
            <el-button type="primary">查看更多研究方向</el-button>
          </router-link>
        </div>
      </section>

      <!-- 实验室文化 -->
      <section class="culture-section">
        <h2>实验室文化</h2>
        <div class="culture-grid">
          <div class="culture-item">
            <div class="culture-icon">
              <el-icon>
                <Star />
              </el-icon>
            </div>
            <h3>创新精神</h3>
            <p>鼓励创新思维，勇于探索未知领域，追求科技前沿突破</p>
          </div>
          <div class="culture-item">
            <div class="culture-icon">
              <el-icon>
                <Users />
              </el-icon>
            </div>
            <h3>团队协作</h3>
            <p>重视团队合作，促进学术交流，共同攻克科研难题</p>
          </div>
          <div class="culture-item">
            <div class="culture-icon">
              <el-icon>
                <Trophy />
              </el-icon>
            </div>
            <h3>追求卓越</h3>
            <p>以高标准要求自己，追求学术卓越和研究质量</p>
          </div>
          <div class="culture-item">
            <div class="culture-icon">
              <el-icon>
                <Education />
              </el-icon>
            </div>
            <h3>学术传承</h3>
            <p>注重人才培养，传承学术精神，培育下一代研究者</p>
          </div>
        </div>
      </section>

      <!-- 实验室设施 -->
      <section class="facilities-section">
        <h2>实验室设施</h2>
        <div class="facilities-content">
          <div class="facilities-text">
            <div class="facility-item">
              <h3>
                <el-icon>
                  <Monitor />
                </el-icon>
                先进设备
              </h3>
              <p>配备国际先进的科研设备和仪器，为高质量研究提供硬件保障</p>
            </div>
            <div class="facility-item">
              <h3>
                <el-icon>
                  <Collection />
                </el-icon>
                实验环境
              </h3>
              <p>提供安全、舒适的实验环境，满足各类科研项目的实验需求</p>
            </div>
            <div class="facility-item">
              <h3>
                <el-icon>
                  <Connection />
                </el-icon>
                网络设施
              </h3>
              <p>高速网络连接和云计算资源，支持大数据处理和远程协作</p>
            </div>
          </div>
          <div class="facilities-stats">
            <div class="stats-card">
              <span class="stats-number">{{ stats.equipment || 0 }}</span>
              <span class="stats-label">台设备</span>
            </div>
            <div class="stats-card">
              <span class="stats-number">1000+</span>
              <span class="stats-label">平方米</span>
            </div>
            <div class="stats-card">
              <span class="stats-number">24/7</span>
              <span class="stats-label">开放时间</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 合作伙伴 -->
      <section class="partners-section">
        <h2>合作伙伴</h2>
        <div class="partners-content">
          <p class="partners-intro">
            我们与国内外知名高校、科研院所和企业建立了良好的合作关系，
            共同推进科技创新和人才培养。
          </p>
          <div class="partners-grid">
            <div class="partner-category">
              <h3>学术合作</h3>
              <ul>
                <li>北京大学</li>
                <li>清华大学</li>
                <li>中科院相关研究所</li>
                <li>MIT</li>
                <li>Stanford University</li>
              </ul>
            </div>
            <div class="partner-category">
              <h3>产业合作</h3>
              <ul>
                <li>华为技术有限公司</li>
                <li>阿里巴巴集团</li>
                <li>腾讯科技</li>
                <li>百度公司</li>
                <li>字节跳动</li>
              </ul>
            </div>
            <div class="partner-category">
              <h3>国际交流</h3>
              <ul>
                <li>IEEE 学会</li>
                <li>ACM 组织</li>
                <li>欧盟研究项目</li>
                <li>日本理化学研究所</li>
                <li>新加坡国立大学</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系信息 -->
      <section class="contact-section">
        <h2>联系我们</h2>
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon>
                <Location />
              </el-icon>
            </div>
            <div class="contact-info">
              <h3>地址</h3>
              <p>{{ labInfo.address || '请查看联系我们页面获取详细地址' }}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon>
                <Phone />
              </el-icon>
            </div>
            <div class="contact-info">
              <h3>电话</h3>
              <p>{{ labInfo.phone || '+86 xxx-xxxx-xxxx' }}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon>
                <Message />
              </el-icon>
            </div>
            <div class="contact-info">
              <h3>邮箱</h3>
              <p>{{ labInfo.email || 'info@lab.edu.cn' }}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon>
                <Link />
              </el-icon>
            </div>
            <div class="contact-info">
              <h3>网站</h3>
              <p>{{ labInfo.website || 'www.lab.edu.cn' }}</p>
            </div>
          </div>
        </div>
        <div class="contact-action">
          <router-link to="/contact">
            <el-button type="primary" size="large">
              详细联系方式
            </el-button>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Office, TrendCharts, Star, Users, Trophy, Education,
  Monitor, Collection, Connection, Location, Phone, Message, Link
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const labInfo = ref({})
const researchAreas = ref([])
const stats = reactive({
  members: 0,
  projects: 0,
  publications: 0,
  equipment: 0
})

// 发展历程数据
const milestones = ref([
  {
    year: '2015',
    title: '实验室成立',
    description: '实验室正式成立，开始专注于前沿科技研究'
  },
  {
    year: '2017',
    title: '首个重大项目',
    description: '获得国家重点研发项目资助，开展关键技术攻关'
  },
  {
    year: '2019',
    title: '国际合作',
    description: '与多个国际知名高校建立合作关系，拓展研究视野'
  },
  {
    year: '2021',
    title: '重要突破',
    description: '在核心技术领域取得重要突破，发表高水平论文'
  },
  {
    year: '2023',
    title: '产业转化',
    description: '多项研究成果成功转化，产生重要社会经济价值'
  },
  {
    year: '2025',
    title: '持续发展',
    description: '继续在前沿领域深耕，致力于更多原创性突破'
  }
])

// 计算属性
const foundedYear = computed(() => {
  const founded = labInfo.value.founded_date
  if (founded) {
    return new Date(founded).getFullYear()
  }
  return milestones.value[0]?.year || '2015'
})

// 加载实验室信息
const loadLabInfo = async () => {
  try {
    const response = await api.get('/lab-info/info')
    if (response.data) {
      labInfo.value = response.data.data || {}
    }
  } catch (error) {
    console.error('加载实验室信息失败:', error)
  }
}

// 加载研究方向
const loadResearchAreas = async () => {
  try {
    const response = await api.get('/research-areas/list', {
      params: {
        status: 'active',
        limit: 6,
        sort: 'sort_order',
        order: 'DESC'
      }
    })

    if (response.data) {
      // 确保数据是数组格式
      const data = response.data.data || response.data || []
      researchAreas.value = Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.error('加载研究方向失败:', error)
  }
}

// 加载统计信息
const loadStats = async () => {
  try {
    loading.value = true

    // 并行加载各项统计数据
    const [membersRes, projectsRes, publicationsRes] = await Promise.all([
      api.get('/members/list', { params: { limit: 1 } }),
      api.get('/projects/list', { params: { limit: 1 } }),
      api.get('/publications/list', { params: { limit: 1 } })
    ])

    if (membersRes.data?.pagination) {
      stats.members = membersRes.data.pagination.total
    }
    if (projectsRes.data?.pagination) {
      stats.projects = projectsRes.data.pagination.total
    }
    if (publicationsRes.data?.pagination) {
      stats.publications = publicationsRes.data.pagination.total
    }

    // 设备数量
    try {
      const equipmentRes = await api.get('/equipment/list', { params: { limit: 1 } })
      if (equipmentRes.data?.pagination) {
        stats.equipment = equipmentRes.data.pagination.total
      }
    } catch (error) {
      console.error('加载设备统计失败:', error)
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

// 初始化
onMounted(() => {
  loadLabInfo()
  loadResearchAreas()
  loadStats()
})
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.about-header {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
}

.about-header h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.about-header p {
  font-size: 1.3rem;
  margin: 0;
  opacity: 0.95;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

section {
  margin: 80px 0;
}

section h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  text-align: center;
  margin: 0 0 50px 0;
  font-weight: 600;
}

/* 实验室简介 */
.lab-intro {
  background: white;
  border-radius: 16px;
  padding: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 60px 0 80px;
}

.intro-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 50px;
  align-items: center;
}

.intro-text h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 25px 0;
  text-align: left;
}

.description {
  color: #555;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 40px;
}

.key-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.intro-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.intro-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 4rem;
}

/* 发展历程 */
.timeline-section {
  position: relative;
}

.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin: 40px 0;
  display: flex;
  align-items: center;
}

.timeline-item:nth-child(odd) {
  justify-content: flex-end;
}

.timeline-item:nth-child(even) {
  justify-content: flex-start;
}

.timeline-content {
  width: 45%;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.timeline-item:nth-child(odd) .timeline-content {
  margin-right: 30px;
}

.timeline-item:nth-child(even) .timeline-content {
  margin-left: 30px;
}

.timeline-year {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
}

.timeline-content h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.timeline-content p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.timeline-marker {
  position: absolute;
  left: 50%;
  width: 16px;
  height: 16px;
  background: #2d3748;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

/* 研究领域 */
.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.area-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.area-card:hover {
  transform: translateY(-5px);
}

.area-icon {
  width: 70px;
  height: 70px;
  background: #2d3748;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.8rem;
}

.area-card h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.area-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.more-areas {
  text-align: center;
}

/* 实验室文化 */
.culture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.culture-item {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.culture-item:hover {
  transform: translateY(-5px);
}

.culture-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  font-size: 2rem;
}

.culture-item h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.3rem;
}

.culture-item p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 实验室设施 */
.facilities-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 50px;
  align-items: start;
}

.facility-item {
  margin: 30px 0;
}

.facility-item h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.facility-item p {
  color: #666;
  line-height: 1.7;
  margin: 0;
}

.facilities-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-card .stats-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  display: block;
  margin-bottom: 5px;
}

.stats-card .stats-label {
  color: #666;
  font-size: 1rem;
}

/* 合作伙伴 */
.partners-intro {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 50px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.partner-category {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.partner-category h3 {
  color: #2c3e50;
  margin: 0 0 25px 0;
  font-size: 1.3rem;
  text-align: center;
}

.partner-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.partner-category li {
  padding: 10px 0;
  color: #666;
  border-bottom: 1px solid #eee;
}

.partner-category li:last-child {
  border-bottom: none;
}

/* 联系信息 */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  width: 60px;
  height: 60px;
  background: #2d3748;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.contact-info h3 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.contact-info p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.contact-action {
  text-align: center;
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 2.2rem;
  }

  .about-header p {
    font-size: 1.1rem;
  }

  .intro-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .intro-image {
    height: 200px;
  }

  .key-stats {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .timeline::before {
    left: 20px;
  }

  .timeline-item {
    justify-content: flex-start !important;
  }

  .timeline-content {
    width: calc(100% - 60px);
    margin-left: 40px !important;
    margin-right: 0 !important;
  }

  .timeline-marker {
    left: 20px;
  }

  .facilities-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .facilities-stats {
    flex-direction: row;
    justify-content: space-around;
  }

  .partners-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .contact-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>