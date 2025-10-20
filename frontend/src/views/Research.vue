<template>
  <div class="research-page">
    <!-- 页面头部 - 带动态背景 -->
    <div class="research-header">
      <div class="header-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
      <div class="container">
        <div class="header-content">
          <div class="hero-badge" data-aos="fade-down">探索 · 创新 · 突破</div>
          <h1 data-aos="fade-up" data-aos-delay="100">研究方向</h1>
          <p class="subtitle" data-aos="fade-up" data-aos-delay="200">探索前沿科技，引领学术创新</p>
          <p class="description" data-aos="fade-up" data-aos-delay="300">致力于突破性研究，推动科技进步与产业创新</p>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 搜索与过滤区域 -->
      <div class="search-section" data-aos="fade-up">
        <div class="search-wrapper">
          <el-input v-model="searchQuery" placeholder="搜索研究方向、关键词..." size="large" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
          <div class="search-tips">
            <span class="tip-icon">💡</span>
            <span>输入关键词快速查找相关研究方向</span>
          </div>
        </div>
      </div>

      <!-- 统计信息卡片 -->
      <div class="stats-overview" v-if="!loading">
        <div class="stats-item stats-item-1" data-aos="fade-up" data-aos-delay="100">
          <div class="stats-icon" data-aos="zoom-in" data-aos-delay="300">
            <el-icon>
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stats-content">
            <span class="stats-number">{{ researchAreas.length }}</span>
            <span class="stats-label">研究方向</span>
          </div>
          <div class="stats-decoration"></div>
        </div>
        <div class="stats-item stats-item-2" data-aos="fade-up" data-aos-delay="200">
          <div class="stats-icon" data-aos="zoom-in" data-aos-delay="400">
            <el-icon>
              <DataAnalysis />
            </el-icon>
          </div>
          <div class="stats-content">
            <span class="stats-number">{{ totalKeywords }}</span>
            <span class="stats-label">技术关键词</span>
          </div>
          <div class="stats-decoration"></div>
        </div>
        <div class="stats-item stats-item-3" data-aos="fade-up" data-aos-delay="300">
          <div class="stats-icon" data-aos="zoom-in" data-aos-delay="500">
            <el-icon>
              <Compass />
            </el-icon>
          </div>
          <div class="stats-content">
            <span class="stats-number">{{ projectCount }}</span>
            <span class="stats-label">相关项目</span>
          </div>
          <div class="stats-decoration"></div>
        </div>
      </div>

      <!-- 研究方向列表 -->
      <div class="research-areas" v-loading="loading">
        <div v-for="(area, index) in filteredAreas" :key="area.id" class="research-area-card" data-aos="fade-up"
          :data-aos-delay="index * 100">

          <!-- 卡片标记 -->
          <div class="card-badge" data-aos="fade-right" :data-aos-delay="index * 100 + 200">
            <span>NO.{{ index + 1 }}</span>
          </div>

          <div class="area-image" data-aos="zoom-in" :data-aos-delay="index * 100 + 300">
            <img v-if="area.image_url" :src="area.image_url" :alt="area.title"
              @error="e => handleImageError(e, area)" />
            <img v-else :src="getPlaceholderImage(index)" :alt="area.title" class="placeholder-image" />
            <div class="image-gradient"></div>
            <div class="area-overlay">
              <el-button type="primary" size="large" round @click="viewDetails(area)">
                <el-icon>
                  <View />
                </el-icon>
                <span>了解更多</span>
              </el-button>
            </div>
          </div>

          <div class="area-content">
            <div class="content-header">
              <h3 class="area-title">{{ area.title }}</h3>
              <div class="title-decoration"></div>
            </div>

            <p class="area-description">
              {{ area.description }}
            </p>

            <div class="area-keywords" v-if="area.keywords">
              <div class="keywords-header">
                <el-icon class="keywords-icon">
                  <Promotion />
                </el-icon>
                <span>关键技术</span>
              </div>
              <div class="keywords-list">
                <el-tag v-for="keyword in getKeywords(area.keywords)" :key="keyword" :type="getRandomTagType()"
                  size="small" effect="light">
                  {{ keyword }}
                </el-tag>
              </div>
            </div>

            <div class="area-footer">
              <el-button type="primary" link @click="viewDetails(area)">
                <el-icon>
                  <View />
                </el-icon>
                <span>查看详情</span>
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredAreas.length === 0" class="empty-state">
          <div class="empty-icon">
            <el-icon>
              <Search />
            </el-icon>
          </div>
          <h3>{{ searchQuery ? '未找到相关研究方向' : '暂无研究方向数据' }}</h3>
          <p>{{ searchQuery ? '请尝试其他搜索词' : '敬请期待更多精彩内容' }}</p>
        </div>
      </div>

      <!-- 研究亮点部分 - 增强版 -->
      <div v-if="!searchQuery && researchAreas.length > 0" class="research-highlights">
        <div class="section-header" data-aos="fade-up">
          <div class="section-decoration"></div>
          <h2>🌟 研究亮点</h2>
          <div class="section-decoration"></div>
        </div>
        <p class="section-subtitle" data-aos="fade-up" data-aos-delay="100">聚焦核心研究领域，突破关键技术难题</p>

        <div class="highlights-grid">
          <div v-for="(area, idx) in (researchAreas || []).slice(0, 3)" :key="`highlight-${area.id}`"
            class="highlight-card" :class="`highlight-card-${idx + 1}`" data-aos="fade-up"
            :data-aos-delay="idx * 100 + 200">
            <div class="highlight-number">{{ idx + 1 }}</div>
            <div class="highlight-icon">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
            <div class="highlight-content">
              <h4>{{ area.title }}</h4>
              <p>{{ area.description.substring(0, 100) }}...</p>
              <div class="highlight-action">
                <el-button type="primary" text @click="viewDetails(area)">
                  深入了解 <el-icon>
                    <ArrowRight />
                  </el-icon>
                </el-button>
              </div>
            </div>
            <div class="highlight-bg-icon">
              <el-icon>
                <TrendCharts />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频展示区（占位） -->
      <div v-if="researchAreas.length > 0" class="video-section">
        <div class="section-header">
          <div class="section-decoration"></div>
          <h2>🎬 研究展示</h2>
          <div class="section-decoration"></div>
        </div>
        <p class="section-subtitle">通过视频了解我们的研究成果与创新实践</p>

        <div class="video-grid">
          <div class="video-card">
            <div class="video-placeholder">
              <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop"
                alt="研究视频1" />
              <div class="video-overlay">
                <div class="play-button">
                  <el-icon>
                    <VideoPlay />
                  </el-icon>
                </div>
              </div>
            </div>
            <div class="video-info">
              <h4>研究成果展示</h4>
              <p>查看我们最新的研究进展与技术突破</p>
            </div>
          </div>

          <div class="video-card">
            <div class="video-placeholder">
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop"
                alt="研究视频2" />
              <div class="video-overlay">
                <div class="play-button">
                  <el-icon>
                    <VideoPlay />
                  </el-icon>
                </div>
              </div>
            </div>
            <div class="video-info">
              <h4>实验室介绍</h4>
              <p>探索我们的科研环境与团队风采</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情对话框 - 优化版 -->
    <el-dialog v-model="detailVisible" :title="selectedArea?.title" width="90%" :style="{ maxWidth: '1000px' }"
      destroy-on-close class="research-detail-dialog">
      <div v-if="selectedArea" class="area-detail">
        <div class="detail-hero">
          <div class="detail-image">
            <img v-if="selectedArea.image_url" :src="selectedArea.image_url" :alt="selectedArea.title" />
            <img v-else :src="getPlaceholderImage(0)" :alt="selectedArea.title" class="placeholder-image" />
            <div class="detail-image-overlay">
              <div class="image-tags">
                <el-tag type="success" effect="dark" size="large">热门研究</el-tag>
              </div>
            </div>
          </div>

          <div class="detail-info">
            <div class="detail-title-section">
              <h2>{{ selectedArea.title }}</h2>
              <div class="detail-meta">
                <span class="meta-item">
                  <el-icon>
                    <TrendCharts />
                  </el-icon>
                  <span>前沿研究</span>
                </span>
                <span class="meta-item">
                  <el-icon>
                    <Star />
                  </el-icon>
                  <span>重点方向</span>
                </span>
              </div>
            </div>

            <div class="detail-keywords" v-if="selectedArea.keywords">
              <h4>
                <el-icon>
                  <Promotion />
                </el-icon>
                <span>核心技术关键词</span>
              </h4>
              <div class="keywords-cloud">
                <el-tag v-for="keyword in getKeywords(selectedArea.keywords)" :key="keyword" :type="getRandomTagType()"
                  size="large" effect="plain">
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <div class="section-title">
              <el-icon>
                <Document />
              </el-icon>
              <h3>研究内容</h3>
            </div>
            <div class="section-content">
              <p class="detailed-description">{{ selectedArea.description }}</p>
            </div>
          </div>

          <div v-if="selectedArea.objectives" class="detail-section">
            <div class="section-title">
              <el-icon>
                <Aim />
              </el-icon>
              <h3>研究目标</h3>
            </div>
            <div class="section-content">
              <p>{{ selectedArea.objectives }}</p>
            </div>
          </div>

          <div v-if="selectedArea.achievements" class="detail-section">
            <div class="section-title">
              <el-icon>
                <Trophy />
              </el-icon>
              <h3>主要成果</h3>
            </div>
            <div class="section-content">
              <p>{{ selectedArea.achievements }}</p>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">
              <el-icon>
                <Opportunity />
              </el-icon>
              <h3>应用前景</h3>
            </div>
            <div class="section-content">
              <p>该研究方向具有广阔的应用前景，在相关领域具有重要的理论意义和实用价值。通过持续的技术创新和研发投入，我们致力于将研究成果转化为实际应用，推动产业升级和社会进步。</p>
            </div>
          </div>

          <!-- 图片展示区（占位） -->
          <div class="detail-section">
            <div class="section-title">
              <el-icon>
                <Picture />
              </el-icon>
              <h3>研究成果展示</h3>
            </div>
            <div class="gallery-grid">
              <div class="gallery-item">
                <img src="https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=400&h=300&fit=crop"
                  alt="成果展示1" />
                <div class="gallery-overlay">
                  <span>实验设备</span>
                </div>
              </div>
              <div class="gallery-item">
                <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop"
                  alt="成果展示2" />
                <div class="gallery-overlay">
                  <span>数据分析</span>
                </div>
              </div>
              <div class="gallery-item">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
                  alt="成果展示3" />
                <div class="gallery-overlay">
                  <span>研究场景</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" @click="detailVisible = false">
            <el-icon>
              <Close />
            </el-icon>
            <span>关闭</span>
          </el-button>
          <el-button type="primary" size="large" @click="contactResearch">
            <el-icon>
              <Message />
            </el-icon>
            <span>合作咨询</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search,
  TrendCharts,
  View,
  DataAnalysis,
  Compass,
  Promotion,
  ArrowRight,
  VideoPlay,
  Document,
  Aim,
  Trophy,
  Opportunity,
  Picture,
  Star,
  Close,
  Message
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const researchAreas = ref([])
const searchQuery = ref('')
const detailVisible = ref(false)
const selectedArea = ref(null)
const projectCount = ref(0)

// 搜索防抖
let searchTimeout = null

// 计算属性
const filteredAreas = computed(() => {
  if (!searchQuery.value) {
    return researchAreas.value
  }

  const query = searchQuery.value.toLowerCase()
  return researchAreas.value.filter(area => {
    return area.title.toLowerCase().includes(query) ||
      area.description.toLowerCase().includes(query) ||
      (area.keywords && area.keywords.toLowerCase().includes(query))
  })
})

const totalKeywords = computed(() => {
  const allKeywords = researchAreas.value
    .map(area => area.keywords)
    .filter(keywords => keywords)
    .join(',')
    .split(',')
    .map(k => k.trim())
    .filter(k => k)

  return new Set(allKeywords).size
})

// 加载研究方向列表
const loadResearchAreas = async () => {
  try {
    loading.value = true
    const response = await api.get('/research-areas/list', {
      params: {
        status: 'active',
        sort: 'sort_order',
        order: 'DESC'
      }
    })

    if (response && response.data) {
      // 确保数据是数组格式
      const data = response.data.data || response.data || []
      researchAreas.value = Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.error('加载研究方向失败:', error)
    ElMessage.error('加载研究方向失败')
  } finally {
    loading.value = false
  }
}

// 加载项目数量
const loadProjectCount = async () => {
  try {
    const response = await api.get('/projects', {
      params: {
        page: 1,
        limit: 1
      }
    })

    if (response && response.data) {
      // 从分页信息中获取总数
      projectCount.value = response.data.pagination?.total || response.data.total || 0
    }
  } catch (error) {
    console.error('加载项目数量失败:', error)
    // 失败时不显示错误信息，只是默认为0
    projectCount.value = 0
  }
}

// 搜索处理（防抖）
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    // 搜索逻辑在 computed 中处理
  }, 300)
}

// 查看详情
const viewDetails = (area) => {
  selectedArea.value = area
  detailVisible.value = true
}

// 联系合作
const contactResearch = () => {
  ElMessage.info('请通过联系我们页面获取合作咨询信息')
  detailVisible.value = false
}

// 获取关键词数组
const getKeywords = (keywords) => {
  if (!keywords) return []
  return keywords.split(',').map(k => k.trim()).filter(k => k)
}

// 图片加载错误处理
const handleImageError = (e, area) => {
  e.target.style.display = 'none'
}

// 获取占位图片
const getPlaceholderImage = (index) => {
  const images = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop', // 科技感地球
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop', // 科技蓝色
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop', // 芯片电路
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop', // 网络科技
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop', // AI机器人
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop', // 技术设备
  ]
  return images[index % images.length]
}

// 获取随机标签类型
const tagTypes = ['primary', 'success', 'info', 'warning', 'danger']
let tagIndex = 0
const getRandomTagType = () => {
  const type = tagTypes[tagIndex % tagTypes.length]
  tagIndex++
  return type
}

// 初始化
onMounted(() => {
  loadResearchAreas()
  loadProjectCount()
})
</script>

<style scoped>
.research-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);
  position: relative;
  overflow-x: hidden;
}

/* 页面头部样式 */
.research-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 120px 0 100px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

.header-content {
  position: relative;
  z-index: 1;
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

.research-header h1 {
  font-size: 3.5rem;
  margin: 0 0 16px 0;
  font-weight: 800;
  letter-spacing: -1px;
}

.research-header .subtitle {
  font-size: 1.5rem;
  margin: 0 0 12px 0;
  opacity: 0.95;
  font-weight: 300;
}

.research-header .description {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.85;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.header-divider {
  width: 100px;
  height: 3px;
  background: rgba(255, 255, 255, 0.8);
  margin: 20px auto;
  border-radius: 2px;
}

.research-header .description {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.85;
  max-width: 600px;
  margin: 0 auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* 搜索区域 */
.search-section {
  text-align: center;
  margin: -40px auto 50px;
  position: relative;
  z-index: 10;
}

.search-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.search-wrapper .el-input {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 25px;
}

.search-wrapper :deep(.el-input__wrapper) {
  border-radius: 25px;
  padding: 10px 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.search-wrapper :deep(.el-input__wrapper:hover) {
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.3);
}

.search-tips {
  margin-top: 15px;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tip-icon {
  font-size: 1.2rem;
}

/* 统计信息 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin: 0 0 60px;
}

.stats-item {
  background: white;
  padding: 35px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stats-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.stats-decoration {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  transition: all 0.4s ease;
}

.stats-item-1 .stats-decoration {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-item-2 .stats-decoration {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-item-3 .stats-decoration {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-item:hover .stats-decoration {
  transform: scale(1.5);
  opacity: 0.15;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.stats-item-1 .stats-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-item-2 .stats-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-item-3 .stats-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 8px;
}

.stats-item-2 .stats-number {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-item-3 .stats-number {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-label {
  font-size: 0.95rem;
  color: #666;
  font-weight: 600;
}

/* 研究方向卡片 */
.research-areas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 35px;
  margin-bottom: 80px;
}

.research-area-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30px);
  position: relative;
}

.research-area-card.animate-in {
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.research-area-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
}

.card-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.area-image {
  position: relative;
  height: 240px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.area-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.area-image .placeholder-image {
  opacity: 0.9;
}

.image-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  pointer-events: none;
}

.research-area-card:hover .area-image img {
  transform: scale(1.1) rotate(2deg);
}

.area-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s ease;
}

.research-area-card:hover .area-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.65);
}

.area-overlay .el-button {
  transform: scale(0.9);
  transition: all 0.4s ease;
}

.research-area-card:hover .area-overlay .el-button {
  transform: scale(1);
}

.area-content {
  padding: 30px;
}

.content-header {
  margin-bottom: 20px;
}

.area-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.4;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-decoration {
  width: 50px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, transparent 100%);
  border-radius: 2px;
}

.area-description {
  color: #666;
  line-height: 1.8;
  margin: 0 0 20px 0;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.area-keywords {
  margin: 20px 0;
  padding: 15px 0;
  border-top: 1px dashed #e0e0e0;
  border-bottom: 1px dashed #e0e0e0;
}

.keywords-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.keywords-icon {
  color: #667eea;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.area-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.area-footer .el-button {
  font-weight: 600;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 100px 20px;
}

.empty-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  font-size: 3rem;
  color: white;
  opacity: 0.8;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 15px 0;
}

.empty-state p {
  color: #999;
  font-size: 1rem;
}

/* 章节标题 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 800;
}

.section-decoration {
  flex: 1;
  max-width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
}

.section-subtitle {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 50px 0;
}

/* 研究亮点 */
.research-highlights {
  margin: 100px 0;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 35px;
}

.highlight-card {
  background: white;
  padding: 45px 35px;
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-align: left;
}

.highlight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.highlight-card:hover::before {
  transform: scaleX(1);
}

.highlight-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
}

.highlight-card-1 .highlight-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.highlight-card-2 .highlight-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.highlight-card-3 .highlight-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.highlight-number {
  position: absolute;
  top: 20px;
  right: 25px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #667eea;
}

.highlight-icon {
  width: 90px;
  height: 90px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 25px 0;
  color: white;
  font-size: 2.5rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: transform 0.4s ease;
}

.highlight-card:hover .highlight-icon {
  transform: scale(1.1) rotate(5deg);
}

.highlight-content h4 {
  font-size: 1.4rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.highlight-content p {
  color: #666;
  line-height: 1.8;
  margin: 0 0 20px 0;
  font-size: 0.95rem;
}

.highlight-action {
  margin-top: 20px;
}

.highlight-bg-icon {
  position: absolute;
  right: -30px;
  bottom: -30px;
  font-size: 10rem;
  color: rgba(102, 126, 234, 0.03);
  pointer-events: none;
}

/* 视频展示区 */
.video-section {
  margin: 100px 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
}

.video-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
}

.video-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.video-placeholder {
  position: relative;
  padding-top: 56.25%;
  /* 16:9 比例 */
  background: #000;
  overflow: hidden;
}

.video-placeholder img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.video-card:hover .video-placeholder img {
  transform: scale(1.1);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.video-card:hover .video-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-card:hover .play-button {
  transform: scale(1.15);
  background: white;
}

.video-info {
  padding: 25px 30px;
}

.video-info h4 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.video-info p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* 详情对话框样式 */
.research-detail-dialog :deep(.el-dialog__header) {
  display: none;
}

.area-detail {
  max-height: 75vh;
  overflow-y: auto;
  padding: 10px;
}

.area-detail::-webkit-scrollbar {
  width: 8px;
}

.area-detail::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.area-detail::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.detail-hero {
  display: flex;
  gap: 35px;
  margin-bottom: 50px;
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
}

.detail-image {
  width: 320px;
  height: 240px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px;
}

.image-tags {
  display: flex;
  gap: 10px;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.detail-title-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 15px;
  border-radius: 20px;
}

.detail-keywords h4 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.keywords-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-content {
  padding: 0 30px;
}

.detail-section {
  margin-bottom: 40px;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title .el-icon {
  font-size: 1.5rem;
  color: #667eea;
}

.section-title h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.section-content p {
  color: #555;
  line-height: 2;
  margin: 0;
  font-size: 1rem;
}

.detailed-description {
  font-size: 1.05rem !important;
  line-height: 2.1 !important;
  text-align: justify;
}

/* 图片画廊 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.gallery-item {
  position: relative;
  padding-top: 75%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.gallery-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

/* 响应式样式 */
@media (max-width: 1024px) {
  .research-areas {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .video-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .research-header {
    padding: 60px 0 50px;
  }

  .research-header h1 {
    font-size: 2.5rem;
  }

  .research-header .subtitle {
    font-size: 1.2rem;
  }

  .research-header .description {
    font-size: 0.95rem;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .stats-overview {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stats-item {
    padding: 25px 20px;
  }

  .research-areas {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .highlights-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .detail-hero {
    flex-direction: column;
    padding: 20px;
  }

  .detail-image {
    width: 100%;
    height: 220px;
  }

  .detail-content {
    padding: 0 15px;
  }

  .detail-section {
    padding: 20px;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .research-header h1 {
    font-size: 2rem;
  }

  .header-icon {
    font-size: 3rem;
  }

  .search-section {
    margin: -30px auto 30px;
  }

  .stats-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .stats-number {
    font-size: 2rem;
  }

  .area-content {
    padding: 25px 20px;
  }

  .area-title {
    font-size: 1.3rem;
  }

  .highlight-card {
    padding: 35px 25px;
  }

  .highlight-icon {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
  }

  .section-header h2 {
    font-size: 1.8rem;
  }

  .section-decoration {
    display: none;
  }

  .video-grid {
    gap: 25px;
  }

  .detail-title-section h2 {
    font-size: 1.8rem;
  }

  .detail-meta {
    flex-direction: column;
    gap: 10px;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>