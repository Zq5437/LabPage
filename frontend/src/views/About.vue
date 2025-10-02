<template>
  <div class="about-page">
    <!-- 页面头部 - 增强版 -->
    <div class="about-hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">探索 · 创新 · 卓越</div>
          <h1 class="hero-title">关于我们</h1>
          <p class="hero-subtitle">以研究为本，用技术创造价值</p>
          <p class="hero-description">
            致力于前沿科技研究，培养创新人才，推动科技进步与产业发展
          </p>
          <div class="hero-actions">
            <router-link to="/research">
              <el-button type="primary" size="large" class="hero-btn primary-btn">
                <el-icon>
                  <TrendCharts />
                </el-icon>
                了解研究方向
              </el-button>
            </router-link>
            <router-link to="/members">
              <el-button plain size="large" class="hero-btn secondary-btn">
                <el-icon>
                  <User />
                </el-icon>
                认识我们的团队
              </el-button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 实验室简介 - 重新设计 -->
      <section class="lab-intro reveal-on-scroll" v-loading="loading">
        <div class="section-header">
          <div class="section-badge">INTRODUCTION</div>
          <h2>实验室简介</h2>
          <div class="section-divider"></div>
        </div>

        <div class="intro-content">
          <div class="intro-text">
            <div class="description" v-if="labInfo.description">
              {{ labInfo.description }}
            </div>
            <div class="description" v-else>
              我们是一支专注于前沿智能计算的科研团队，聚焦算法、系统与应用的交叉创新。
              团队坚持「简洁、可靠、可复用」的工程理念与「开放协作」的学术文化，
              以高质量科研与真实场景落地为导向，持续输出有影响力的成果与人才。
            </div>

            <div class="key-stats">
              <div class="stat-item reveal-on-scroll" v-for="(stat, index) in statsDisplay" :key="index">
                <div class="stat-icon" :style="{ background: stat.color }">
                  <el-icon>
                    <component :is="stat.icon" />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-number">{{ stat.value }}</span>
                  <span class="stat-label">{{ stat.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="intro-image reveal-on-scroll">
            <div class="image-wrapper">
              <img v-if="labInfo.banner_url || labInfo.banner" :src="labInfo.banner_url || labInfo.banner" alt="实验室"
                @error="handleImageError" />
              <div v-else class="placeholder-image">
                <div class="placeholder-content">
                  <el-icon class="placeholder-icon">
                    <OfficeBuilding />
                  </el-icon>
                  <p class="placeholder-text">实验室环境图片</p>
                  <p class="placeholder-hint">Laboratory Environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 发展历程 - 增强版（带图片） -->
      <section class="timeline-section section-with-bg reveal-on-scroll">
        <div class="section-header">
          <div class="section-badge">MILESTONES</div>
          <h2>发展历程</h2>
          <div class="section-divider"></div>
          <p class="section-description">见证我们的成长足迹，每一步都是突破与创新</p>
        </div>
        <div class="timeline">
          <div v-for="(milestone, index) in milestones" :key="index" class="timeline-item reveal-on-scroll"
            :class="{ 'timeline-item-left': index % 2 === 0, 'timeline-item-right': index % 2 === 1 }"
            :style="{ '--item-index': index }">
            <!-- 空白侧的装饰年份 -->
            <div class="timeline-year-decoration">
              <span class="decoration-year">{{ milestone.year }}</span>
              <span class="decoration-line"></span>
            </div>

            <div class="timeline-content">
              <!-- 图片区域 -->
              <div class="timeline-image">
                <img v-if="milestone.image" :src="milestone.image" :alt="milestone.title" />
                <div v-else class="timeline-image-placeholder">
                  <div class="placeholder-overlay">
                    <el-icon class="placeholder-calendar">
                      <Calendar />
                    </el-icon>
                    <span class="placeholder-year">{{ milestone.year }}</span>
                  </div>
                </div>
              </div>

              <!-- 内容区域 -->
              <div class="timeline-info">
                <div class="timeline-year-badge">
                  <span class="year-text">{{ milestone.year }}</span>
                </div>
                <h3 class="timeline-title">{{ milestone.title }}</h3>
                <p class="timeline-description">{{ milestone.description }}</p>
                <div class="timeline-tag">重要里程碑</div>
              </div>
            </div>

            <div class="timeline-marker">
              <div class="marker-ring"></div>
              <div class="marker-dot"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 研究领域 - 重新设计 -->
      <section class="research-areas-section reveal-on-scroll" v-if="researchAreas.length > 0">
        <div class="section-header">
          <div class="section-badge">RESEARCH</div>
          <h2>主要研究领域</h2>
          <div class="section-divider"></div>
        </div>
        <div class="areas-grid">
          <div v-for="(area, index) in (researchAreas || []).slice(0, 6)" :key="area.id"
            class="area-card reveal-on-scroll" :style="{ '--card-index': index }">
            <div class="area-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="area-icon">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
            <h3>{{ area.title }}</h3>
            <p>{{ (area.description || '').substring(0, 100) }}{{ (area.description || '').length > 100 ? '...' : '' }}
            </p>
            <div class="area-footer">
              <span class="learn-more">了解更多 →</span>
            </div>
          </div>
        </div>
        <div class="more-areas">
          <router-link to="/research">
            <el-button type="primary" size="large" class="modern-btn">
              <span>查看全部研究方向</span>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </el-button>
          </router-link>
        </div>
      </section>

      <!-- 实验室文化 - 重新设计 -->
      <section class="culture-section section-with-bg reveal-on-scroll">
        <div class="section-header">
          <div class="section-badge">CULTURE</div>
          <h2>实验室文化</h2>
          <div class="section-divider"></div>
        </div>
        <div class="culture-grid">
          <div class="culture-item reveal-on-scroll" v-for="(item, index) in cultureItems" :key="index"
            :style="{ '--item-index': index }">
            <div class="culture-decoration"></div>
            <div class="culture-icon" :style="{ background: item.color }">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </section>

      <!-- 实验室设施 - 重新设计 -->
      <section class="facilities-section reveal-on-scroll">
        <div class="section-header">
          <div class="section-badge">FACILITIES</div>
          <h2>实验室设施</h2>
          <div class="section-divider"></div>
        </div>
        <div class="facilities-content">
          <div class="facilities-grid">
            <div class="facility-card reveal-on-scroll" v-for="(facility, index) in facilities" :key="index"
              :style="{ '--item-index': index }">
              <div class="facility-icon" :style="{ background: facility.color }">
                <el-icon>
                  <component :is="facility.icon" />
                </el-icon>
              </div>
              <div class="facility-body">
                <h3>{{ facility.title }}</h3>
                <p>{{ facility.description }}</p>
              </div>
            </div>
          </div>

          <div class="facilities-stats">
            <div class="stats-card reveal-on-scroll" v-for="(stat, index) in facilityStats" :key="index"
              :style="{ '--item-index': index }">
              <div class="stats-icon" :style="{ background: stat.color }">
                <el-icon>
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <div class="stats-content">
                <span class="stats-number">{{ stat.value }}</span>
                <span class="stats-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 合作伙伴 - 重新设计 -->
      <section class="partners-section section-with-bg reveal-on-scroll">
        <div class="section-header">
          <div class="section-badge">PARTNERS</div>
          <h2>合作伙伴</h2>
          <div class="section-divider"></div>
        </div>
        <div class="partners-content">
          <p class="partners-intro reveal-on-scroll">
            我们与国内外知名高校、科研院所和企业建立了良好的合作关系，
            共同推进科技创新和人才培养。
          </p>
          <div class="partners-grid">
            <div class="partner-category reveal-on-scroll" v-for="(category, index) in partnerCategories" :key="index"
              :style="{ '--item-index': index }">
              <div class="category-header">
                <div class="category-icon" :style="{ background: category.color }">
                  <el-icon>
                    <component :is="category.icon" />
                  </el-icon>
                </div>
                <h3>{{ category.title }}</h3>
              </div>
              <div class="category-body">
                <div class="partner-logo-placeholder" v-for="(partner, idx) in category.partners" :key="idx">
                  <span class="partner-name">{{ partner }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系信息 - 重新设计 -->
      <section class="contact-section reveal-on-scroll">
        <div class="section-header">
          <div class="section-badge">CONTACT</div>
          <h2>联系我们</h2>
          <div class="section-divider"></div>
        </div>
        <div class="contact-container">
          <div class="contact-grid">
            <div class="contact-item reveal-on-scroll" v-for="(item, index) in contactItems" :key="index"
              :style="{ '--item-index': index }">
              <div class="contact-icon" :style="{ background: item.color }">
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="contact-info">
                <h3>{{ item.title }}</h3>
                <p>{{ item.value }}</p>
              </div>
            </div>
          </div>
          <div class="contact-action">
            <router-link to="/contact">
              <el-button type="primary" size="large" class="modern-btn">
                <span>查看详细联系方式</span>
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </el-button>
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import { useSiteStore } from '@/stores/site'
import {
  OfficeBuilding, TrendCharts, Star, User, Trophy, Reading,
  Monitor, Collection, Connection, Location, Phone, Message, Link,
  ArrowRight, UserFilled, Checked, Document, SetUp, DataAnalysis,
  Tools, InfoFilled, School, OfficeBuilding as Building, Calendar
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const siteStore = useSiteStore()
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
  const founded = labInfo.value.established_year || labInfo.value.founded_year || labInfo.value.founded_date
  if (founded) {
    const year = typeof founded === 'string' ? parseInt(founded, 10) : founded
    if (!Number.isNaN(year)) return year
    try {
      return new Date(founded).getFullYear()
    } catch (e) { }
  }
  return milestones.value[0]?.year || '2015'
})

// 统计展示数据
const statsDisplay = computed(() => [
  {
    value: stats.members || 0,
    label: '研究成员',
    icon: UserFilled,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    value: stats.projects || 0,
    label: '研究项目',
    icon: Document,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    value: stats.publications || 0,
    label: '发表论文',
    icon: Checked,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    value: foundedYear.value,
    label: '成立年份',
    icon: Trophy,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

// 文化项目数据
const cultureItems = [
  {
    icon: Star,
    title: '创新精神',
    description: '鼓励创新思维，勇于探索未知领域，追求科技前沿突破',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: User,
    title: '团队协作',
    description: '重视团队合作，促进学术交流，共同攻克科研难题',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: Trophy,
    title: '追求卓越',
    description: '以高标准要求自己，追求学术卓越和研究质量',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: Reading,
    title: '学术传承',
    description: '注重人才培养，传承学术精神，培育下一代研究者',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
]

// 设施数据
const facilities = [
  {
    icon: Monitor,
    title: '先进设备',
    description: '配备国际先进的科研设备和仪器，为高质量研究提供硬件保障',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: Collection,
    title: '实验环境',
    description: '提供安全、舒适的实验环境，满足各类科研项目的实验需求',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: Connection,
    title: '网络设施',
    description: '高速网络连接和云计算资源，支持大数据处理和远程协作',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
]

// 设施统计数据
const facilityStats = computed(() => [
  {
    icon: Tools,
    value: stats.equipment || 0,
    label: '台设备',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: DataAnalysis,
    value: '1000+',
    label: '平方米',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: SetUp,
    value: '24/7',
    label: '开放时间',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
])

// 合作伙伴分类
const partnerCategories = [
  {
    icon: School,
    title: '学术合作',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    partners: ['北京大学', '清华大学', '中科院相关研究所', 'MIT', 'Stanford University']
  },
  {
    icon: Building,
    title: '产业合作',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    partners: ['华为技术有限公司', '阿里巴巴集团', '腾讯科技', '百度公司', '字节跳动']
  },
  {
    icon: Connection,
    title: '国际交流',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    partners: ['IEEE 学会', 'ACM 组织', '欧盟研究项目', '日本理化学研究所', '新加坡国立大学']
  }
]

// 联系信息
const contactItems = computed(() => [
  {
    icon: Location,
    title: '地址',
    value: labInfo.value.address || '请查看联系我们页面获取详细地址',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: Phone,
    title: '电话',
    value: labInfo.value.phone || '+86 xxx-xxxx-xxxx',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: Message,
    title: '邮箱',
    value: labInfo.value.email || 'info@lab.edu.cn',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: Link,
    title: '网站',
    value: labInfo.value.website || 'www.lab.edu.cn',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

// 加载实验室信息
const loadLabInfo = async () => {
  try {
    // 统一使用公开接口
    const response = await api.get('/public/lab-info')
    if (response.data) {
      labInfo.value = response.data || response.data.data || {}
    }
  } catch (error) {
    console.error('加载实验室信息失败:', error)
    // 回退到站点仓库数据
    labInfo.value = siteStore.labInfo || {}
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
    // 回退到仓库中的研究方向
    researchAreas.value = Array.isArray(siteStore.researchAreas) ? siteStore.researchAreas.slice(0, 6) : []
  }
}

// 加载统计信息
const loadStats = async () => {
  try {
    loading.value = true

    // 并行加载各项统计数据（使用公开列表接口）
    const [membersRes, projectsRes, publicationsRes] = await Promise.all([
      api.get('/members', { params: { status: 'active' } }),
      api.get('/projects', { params: { page: 1, limit: 1 } }),
      api.get('/publications/list', { params: { page: 1, limit: 1 } })
    ])

    // 成员总数（公开接口不分页，返回 { members, groupedMembers }）
    stats.members = (membersRes?.data?.members || []).length

    // 项目总数（公开接口返回 { projects, pagination }）
    stats.projects = projectsRes?.data?.pagination?.total || (projectsRes?.data?.projects || []).length

    // 论文总数（公开接口返回 data数组与 pagination）
    stats.publications = publicationsRes?.pagination?.total || (publicationsRes?.data?.length || 0)

    // 设备数量（公开接口返回 data数组与 pagination）
    try {
      const equipmentRes = await api.get('/equipment/list', { params: { page: 1, limit: 1 } })
      stats.equipment = equipmentRes?.pagination?.total || (equipmentRes?.data?.length || 0)
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
  initScrollReveal()
})

// 滚动显隐动画（IntersectionObserver + MutationObserver，支持动态内容）
const initScrollReveal = () => {
  if (typeof window === 'undefined') return

  const preferReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (preferReducedMotion) {
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => el.classList.add('is-visible'))
    return
  }

  let intersectionObserver
  let mutationObserver

  const ensureVisibleIfInViewport = (el, ratio = 0.12) => {
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
    const elHeight = Math.max(rect.height, 1)
    return visibleHeight / elHeight >= ratio
  }

  const bindElement = (el) => {
    if (!el || el.dataset.revealBound === '1') return
    el.dataset.revealBound = '1'
    if (ensureVisibleIfInViewport(el)) {
      el.classList.add('is-visible')
      return
    }
    intersectionObserver.observe(el)
  }

  const bindAll = () => {
    document.querySelectorAll('.reveal-on-scroll').forEach(bindElement)
  }

  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          intersectionObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' })
  } else {
    // 退化处理：直接显示
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => el.classList.add('is-visible'))
    return
  }

  // 首次绑定
  bindAll()

  // 监听后续动态插入节点（如异步加载的研究领域卡片）
  mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          if (node.classList && node.classList.contains('reveal-on-scroll')) bindElement(node)
          node.querySelectorAll && node.querySelectorAll('.reveal-on-scroll').forEach(bindElement)
        })
      }
    }
  })

  const root = document.querySelector('.about-page') || document.body
  mutationObserver.observe(root, { childList: true, subtree: true })

  onUnmounted(() => {
    try { intersectionObserver && intersectionObserver.disconnect() } catch (_) { }
    try { mutationObserver && mutationObserver.disconnect() } catch (_) { }
  })
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);
}

/* ========== Hero Section - 增强版 ========== */
.about-hero {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 120px 0 100px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.15;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: #fff;
  top: -200px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #4facfe;
  top: 50%;
  right: -150px;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: #f093fb;
  bottom: -150px;
  left: 50%;
  animation-delay: 14s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fadeInUp 1s ease-out;
}

.hero-badge {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 2px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-title {
  font-size: 3.5rem;
  margin: 0 0 16px 0;
  font-weight: 800;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0 0 12px 0;
  opacity: 0.95;
  font-weight: 300;
}

.hero-description {
  font-size: 1.1rem;
  margin: 0 0 36px 0;
  opacity: 0.85;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 14px 32px !important;
  font-size: 1rem !important;
  border-radius: 50px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.primary-btn {
  background: #fff !important;
  color: #667eea !important;
  border: none !important;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.secondary-btn {
  background: transparent !important;
  color: #fff !important;
  border: 2px solid #fff !important;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-2px);
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

/* ========== Common Styles ========== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

section {
  margin: 100px 0;
}

/* 带背景的Section - 增强视觉分隔 */
.section-with-bg {
  background: linear-gradient(180deg, #fafbfc 0%, #f8f9fa 100%);
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  padding-left: calc(50vw - 50%);
  padding-right: calc(50vw - 50%);
  padding-top: 100px;
  padding-bottom: 100px;
  margin-top: 120px;
  margin-bottom: 120px;
  position: relative;
  border-radius: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 1px 3px rgba(0, 0, 0, 0.02);
}

/* 顶部装饰线 */
.section-with-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(102, 126, 234, 0.1) 20%,
      rgba(102, 126, 234, 0.2) 50%,
      rgba(102, 126, 234, 0.1) 80%,
      transparent 100%);
}

/* 底部装饰线 */
.section-with-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(102, 126, 234, 0.08) 20%,
      rgba(102, 126, 234, 0.15) 50%,
      rgba(102, 126, 234, 0.08) 80%,
      transparent 100%);
}

/* 普通Section之间的分隔 */
section:not(.section-with-bg)+section:not(.section-with-bg) {
  position: relative;
}

section:not(.section-with-bg)+section:not(.section-with-bg)::before {
  content: '';
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.2) 50%, transparent 100%);
}

/* Section Header - 统一样式 */
.section-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.section-badge {
  display: inline-block;
  padding: 6px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #1a202c;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.section-divider {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin: 0 auto;
}

.section-description {
  margin-top: 16px;
  color: #718096;
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* ========== Lab Intro Section ========== */
.lab-intro {
  background: #fff;
  border-radius: 24px;
  padding: 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  margin: -60px 0 100px;
  position: relative;
  z-index: 2;
}

.intro-content {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 60px;
  align-items: center;
}

.intro-text {
  padding-right: 20px;
}

.description {
  color: #4a5568;
  line-height: 1.9;
  font-size: 1.1rem;
  margin-bottom: 40px;
  text-align: justify;
}

.key-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
}

.stat-label {
  color: #718096;
  font-size: 0.85rem;
}

.intro-image {
  width: 100%;
  height: 400px;
  position: relative;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  position: relative;
}

.image-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  z-index: 1;
  pointer-events: none;
}

.intro-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.placeholder-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.placeholder-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 16px;
  opacity: 0.9;
}

.placeholder-text {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.placeholder-hint {
  font-size: 1rem;
  opacity: 0.7;
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
}

/* ========== Timeline Section ========== */
.timeline-section {
  overflow: hidden;
}

.timeline-section .section-header::before {
  content: '';
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.04) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin: 60px 0;
  display: flex;
  align-items: center;
  animation: slideIn 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--item-index) * 0.1s);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧内容（偶数索引：0, 2, 4...） */
.timeline-item-left {
  justify-content: flex-start;
}

/* 右侧内容（奇数索引：1, 3, 5...） */
.timeline-item-right {
  justify-content: flex-end;
}

.timeline-content {
  width: 45%;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.timeline-content:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

/* 左侧内容，给右侧留空间 */
.timeline-item-left .timeline-content {
  margin-right: 70px;
}

/* 右侧内容，给左侧留空间 */
.timeline-item-right .timeline-content {
  margin-left: 70px;
}

/* 空白侧装饰 */
.timeline-year-decoration {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 20px;
  opacity: 0.15;
  transition: opacity 0.3s ease;
}

.timeline-item:hover .timeline-year-decoration {
  opacity: 0.25;
}

/* 内容在左侧时，装饰在右侧 */
.timeline-item-left .timeline-year-decoration {
  left: 50%;
  right: 0;
  justify-content: flex-start;
  padding-left: 90px;
  flex-direction: row-reverse;
}

/* 内容在右侧时，装饰在左侧 */
.timeline-item-right .timeline-year-decoration {
  left: 0;
  right: 50%;
  justify-content: flex-end;
  padding-right: 90px;
}

.decoration-year {
  font-size: 6rem;
  font-weight: 900;
  color: #667eea;
  line-height: 1;
  font-family: 'Arial Black', sans-serif;
  letter-spacing: -4px;
}

.decoration-line {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* 图片区域 */
.timeline-image {
  width: 100%;
  height: 220px;
  position: relative;
  overflow: hidden;
}

.timeline-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.timeline-content:hover .timeline-image img {
  transform: scale(1.08);
}

.timeline-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.timeline-image-placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.placeholder-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  color: #fff;
  z-index: 1;
}

.placeholder-calendar {
  font-size: 4rem;
  margin-bottom: 12px;
  opacity: 0.9;
}

.placeholder-year {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 3px;
}

/* 内容区域 */
.timeline-info {
  padding: 30px;
  position: relative;
}

.timeline-year-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.year-text {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.timeline-title {
  color: #1a202c;
  margin: 0 0 14px 0;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.4;
}

.timeline-description {
  color: #718096;
  line-height: 1.8;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
}

.timeline-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #667eea;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 时间轴标记 */
.timeline-marker {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.marker-ring {
  position: absolute;
  inset: 0;
  border: 4px solid #667eea;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.8);
  animation: pulse 2.5s infinite;
}

.marker-dot {
  position: absolute;
  inset: 7px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.8);
  }

  50% {
    box-shadow: 0 0 0 12px rgba(102, 126, 234, 0), 0 0 0 4px rgba(255, 255, 255, 0.8);
  }
}

/* ========== Research Areas Section ========== */
.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.area-card {
  position: relative;
  background: #fff;
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid transparent;
  animation: cardFadeIn 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--card-index) * 0.1s);
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.area-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.area-card:hover::before {
  transform: scaleX(1);
}

.area-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
}

.area-number {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 3rem;
  font-weight: 800;
  color: #f7fafc;
  line-height: 1;
}

.area-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 24px 0;
  font-size: 2rem;
  transition: all 0.3s ease;
}

.area-card:hover .area-icon {
  transform: scale(1.1) rotate(5deg);
}

.area-card h3 {
  color: #1a202c;
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: left;
}

.area-card p {
  color: #718096;
  line-height: 1.7;
  margin: 0 0 20px 0;
  text-align: left;
  font-size: 0.95rem;
}

.area-footer {
  text-align: left;
}

.learn-more {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.area-card:hover .learn-more {
  transform: translateX(5px);
}

.more-areas {
  text-align: center;
  margin-top: 20px;
}

.modern-btn {
  padding: 14px 32px !important;
  border-radius: 50px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

/* ========== Culture Section ========== */
.culture-section {
  overflow: hidden;
}

.culture-section .section-header::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -100px;
  transform: translateY(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(118, 75, 162, 0.03) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 30px;
}

.culture-item {
  position: relative;
  background: #fff;
  padding: 45px 35px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.4s ease;
  overflow: hidden;
  animation: cardFadeIn 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--item-index) * 0.1s);
}

.culture-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 0 20px 0 100%;
}

.culture-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

.culture-icon {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  font-size: 2.2rem;
  color: #fff;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.culture-item:hover .culture-icon {
  transform: scale(1.1) rotate(-5deg);
}

.culture-item h3 {
  color: #1a202c;
  margin: 0 0 16px 0;
  font-size: 1.35rem;
  font-weight: 600;
}

.culture-item p {
  color: #718096;
  line-height: 1.8;
  margin: 0;
  font-size: 0.95rem;
}

/* ========== Facilities Section ========== */
.facilities-content {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.facility-card {
  background: #fff;
  padding: 35px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 20px;
  align-items: flex-start;
  transition: all 0.3s ease;
  animation: cardFadeIn 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--item-index) * 0.1s);
}

.facility-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
}

.facility-icon {
  width: 65px;
  height: 65px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #fff;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.facility-card:hover .facility-icon {
  transform: scale(1.1) rotate(5deg);
}

.facility-body h3 {
  color: #1a202c;
  margin: 0 0 12px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.facility-body p {
  color: #718096;
  line-height: 1.7;
  margin: 0;
  font-size: 0.95rem;
}

.facilities-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
}

.stats-card {
  background: #fff;
  padding: 35px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  animation: cardFadeIn 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--item-index) * 0.1s);
}

.stats-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.stats-card:hover .stats-icon {
  transform: scale(1.1) rotate(-5deg);
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  line-height: 1;
}

.stats-label {
  color: #718096;
  font-size: 1rem;
}

/* ========== Partners Section ========== */
.partners-section {
  overflow: hidden;
}

.partners-section .section-header::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -80px;
  transform: translateY(-50%);
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.03) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.partners-intro {
  text-align: center;
  color: #718096;
  font-size: 1.15rem;
  line-height: 1.8;
  margin-bottom: 50px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.partner-category {
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  animation: cardFadeIn 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--item-index) * 0.1s);
}

.partner-category:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  gap: 16px;
}

.category-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  transition: all 0.3s ease;
}

.partner-category:hover .category-icon {
  transform: scale(1.1) rotate(-5deg);
}

.category-header h3 {
  color: #1a202c;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.category-body {
  display: grid;
  gap: 12px;
}

.partner-logo-placeholder {
  padding: 16px;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: center;
  transition: all 0.3s ease;
}

.partner-logo-placeholder:hover {
  transform: translateX(5px);
  border-color: #cbd5e0;
  background: #fff;
}

.partner-name {
  color: #4a5568;
  font-size: 0.95rem;
  font-weight: 500;
}

/* ========== Contact Section ========== */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  animation: cardFadeIn 0.6s ease-out;
  animation-fill-mode: both;
  animation-delay: calc(var(--item-index) * 0.1s);
}

.contact-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  width: 65px;
  height: 65px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #fff;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.contact-item:hover .contact-icon {
  transform: scale(1.1) rotate(-5deg);
}

.contact-info {
  flex: 1;
}

.contact-info h3 {
  color: #1a202c;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.contact-info p {
  color: #718096;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.contact-action {
  text-align: center;
  margin-top: 20px;
}

/* ========== Scroll Reveal Animation ========== */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 动效偏好：用户偏好减少动画时，禁用过渡 */
@media (prefers-reduced-motion: reduce) {

  .reveal-on-scroll,
  .area-card,
  .culture-item,
  .facility-card,
  .stats-card,
  .partner-category,
  .contact-item,
  .timeline-item,
  .gradient-orb {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}

/* ========== Responsive Design ========== */
@media (max-width: 1024px) {
  .intro-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .intro-image {
    height: 350px;
  }

  .facilities-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {

  /* Hero Section */
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 12px;
  }

  .hero-btn {
    width: 100%;
    justify-content: center !important;
  }

  /* Section Headers */
  .section-header h2 {
    font-size: 2rem;
  }

  /* Lab Intro */
  .lab-intro {
    padding: 40px 30px;
    margin: -40px 0 80px;
  }

  .intro-text {
    padding-right: 0;
  }

  .intro-image {
    height: 280px;
  }

  .key-stats {
    grid-template-columns: 1fr;
  }

  /* Timeline */
  .timeline {
    padding: 20px 0;
  }

  .timeline::before {
    left: 20px;
  }

  .timeline-item {
    justify-content: flex-start !important;
    flex-direction: row !important;
    margin: 50px 0;
  }

  .timeline-content {
    width: calc(100% - 60px);
    margin-left: 50px !important;
    margin-right: 0 !important;
  }

  .timeline-marker {
    left: 20px;
  }

  /* 移动端隐藏装饰元素 */
  .timeline-year-decoration {
    display: none;
  }

  .timeline-image {
    height: 180px;
  }

  .placeholder-calendar {
    font-size: 3rem;
  }

  .placeholder-year {
    font-size: 1.5rem;
  }

  .timeline-info {
    padding: 24px;
  }

  .timeline-title {
    font-size: 1.2rem;
  }

  /* Research Areas */
  .areas-grid {
    grid-template-columns: 1fr;
  }

  .area-number {
    font-size: 2rem;
  }

  /* Culture */
  .culture-grid {
    grid-template-columns: 1fr;
  }

  /* Facilities */
  .facility-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .facilities-stats {
    grid-template-columns: 1fr;
  }

  /* Partners */
  .partners-grid {
    grid-template-columns: 1fr;
  }

  /* Contact */
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .contact-item {
    flex-direction: row;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-badge {
    font-size: 0.75rem;
    padding: 6px 18px;
  }

  .lab-intro {
    padding: 30px 20px;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }

  .intro-image {
    height: 220px;
  }

  .timeline-content {
    width: calc(100% - 50px);
    margin-left: 45px !important;
  }

  .timeline-image {
    height: 160px;
  }

  .placeholder-calendar {
    font-size: 2.5rem;
  }

  .placeholder-year {
    font-size: 1.2rem;
  }

  .timeline-info {
    padding: 20px;
  }

  .facility-card,
  .contact-item {
    flex-direction: column;
    text-align: center;
  }

  .facility-body,
  .contact-info {
    text-align: center;
  }
}
</style>