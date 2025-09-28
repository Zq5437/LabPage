<template>
  <div class="members-page">
    <!-- 页面头部 -->
    <div class="members-header">
      <div class="container">
        <h1>实验室成员</h1>
        <p>优秀的团队，卓越的研究</p>
      </div>
    </div>

    <div class="container">
      <!-- 搜索和筛选工具栏 -->
      <div class="filter-toolbar">
        <div class="filter-left">
          <el-input v-model="searchQuery" placeholder="搜索成员姓名、研究兴趣..." style="width: 300px" clearable
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-right">
          <el-select v-model="selectedCategory" placeholder="选择类别" clearable style="width: 150px"
            @change="filterByCategory">
            <el-option v-for="category in categoryOptions" :key="category.value" :label="category.label"
              :value="category.value" />
          </el-select>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="!loading">
        <div class="stats-item">
          <span class="stats-number">{{ filteredMembers.length }}</span>
          <span class="stats-label">位成员</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ Object.keys(groupedMembers).length }}</span>
          <span class="stats-label">个类别</span>
        </div>
        <div class="stats-item">
          <span class="stats-number">{{ totalResearchAreas }}</span>
          <span class="stats-label">个研究领域</span>
        </div>
      </div>

      <!-- 成员分组显示 -->
      <div class="members-content" v-loading="loading">
        <!-- 教师 -->
        <div v-if="groupedMembers.faculty && groupedMembers.faculty.length > 0" class="member-group">
          <h2 class="group-title">
            <el-icon>
              <User />
            </el-icon>
            教师团队
          </h2>
          <div class="members-grid">
            <div v-for="member in groupedMembers.faculty" :key="member.id" class="member-card faculty-card"
              @click="viewMemberDetail(member)">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                <div v-else class="default-avatar">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    style="margin-right: 5px; margin-bottom: 5px;" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他类别的成员组会在下面继续添加 -->
        <div v-if="groupedMembers.postdoc && groupedMembers.postdoc.length > 0" class="member-group">
          <h2 class="group-title">
            <el-icon>
              <StarFilled />
            </el-icon>
            博士后研究员
          </h2>
          <div class="members-grid">
            <div v-for="member in groupedMembers.postdoc" :key="member.id" class="member-card postdoc-card"
              @click="viewMemberDetail(member)">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                <div v-else class="default-avatar">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    style="margin-right: 5px; margin-bottom: 5px;" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学生组 -->
        <div v-if="groupedMembers.phd && groupedMembers.phd.length > 0" class="member-group">
          <h2 class="group-title">
            <el-icon>
              <Reading />
            </el-icon>
            博士研究生
          </h2>
          <div class="members-grid">
            <div v-for="member in groupedMembers.phd" :key="member.id" class="member-card student-card"
              @click="viewMemberDetail(member)">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                <div v-else class="default-avatar">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    style="margin-right: 5px; margin-bottom: 5px;" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>{{ member.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="groupedMembers.master && groupedMembers.master.length > 0" class="member-group">
          <h2 class="group-title">
            <el-icon>
              <School />
            </el-icon>
            硕士研究生
          </h2>
          <div class="members-grid">
            <div v-for="member in groupedMembers.master" :key="member.id" class="member-card student-card"
              @click="viewMemberDetail(member)">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.name" @error="handleImageError" />
                <div v-else class="default-avatar">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
              </div>
              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-name-en">{{ member.name_en }}</p>
                <p class="member-title">{{ member.title }}</p>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-interests" v-if="member.research_interests">
                  <el-tag v-for="interest in getInterests(member.research_interests)" :key="interest" size="small"
                    style="margin-right: 5px; margin-bottom: 5px;" effect="light">
                    {{ interest }}
                  </el-tag>
                </div>
                <div class="member-contact">
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

    <!-- 成员详情对话框 -->
    <el-dialog v-model="detailVisible" :title="selectedMember?.name" width="700px" destroy-on-close>
      <div v-if="selectedMember" class="member-detail">
        <div class="detail-header">
          <div class="detail-avatar">
            <img v-if="selectedMember.avatar" :src="selectedMember.avatar" :alt="selectedMember.name" />
            <div v-else class="detail-default-avatar">
              <el-icon>
                <User />
              </el-icon>
            </div>
          </div>

          <div class="detail-info">
            <h2>{{ selectedMember.name }}</h2>
            <p class="detail-name-en">{{ selectedMember.name_en }}</p>
            <p class="detail-title">{{ selectedMember.title }}</p>

            <div class="detail-contact">
              <div v-if="selectedMember.email" class="contact-item">
                <el-icon>
                  <Message />
                </el-icon>
                <span>{{ selectedMember.email }}</span>
              </div>
              <div v-if="selectedMember.homepage" class="contact-item">
                <el-icon>
                  <Link />
                </el-icon>
                <a :href="selectedMember.homepage" target="_blank">个人主页</a>
              </div>
              <div v-if="selectedMember.google_scholar" class="contact-item">
                <el-icon>
                  <Document />
                </el-icon>
                <a :href="selectedMember.google_scholar" target="_blank">Google Scholar</a>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div v-if="selectedMember.bio" class="detail-section">
            <h3>个人简介</h3>
            <p>{{ selectedMember.bio }}</p>
          </div>

          <div v-if="selectedMember.research_interests" class="detail-section">
            <h3>研究兴趣</h3>
            <div class="interests-tags">
              <el-tag v-for="interest in getInterests(selectedMember.research_interests)" :key="interest" size="medium"
                style="margin-right: 10px; margin-bottom: 10px;" effect="dark">
                {{ interest }}
              </el-tag>
            </div>
          </div>

          <div v-if="selectedMember.education" class="detail-section">
            <h3>教育背景</h3>
            <p>{{ selectedMember.education }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Search, User, Message, Link, Document, StarFilled, Reading, School, Notebook
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const members = ref([])
const groupedMembers = ref({})
const searchQuery = ref('')
const selectedCategory = ref('')
const detailVisible = ref(false)
const selectedMember = ref(null)

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

// 查看成员详情
const viewMemberDetail = (member) => {
  selectedMember.value = member
  detailVisible.value = true
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

// 初始化
onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.members-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.members-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.members-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.members-header h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.members-header p {
  font-size: 1.3rem;
  margin: 0;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 15px;
  align-items: center;
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
  color: #667eea;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
}

.member-group {
  margin-bottom: 60px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 30px 0;
  padding-bottom: 10px;
  border-bottom: 3px solid #667eea;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.member-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.faculty-card {
  border-top: 4px solid #e74c3c;
}

.postdoc-card {
  border-top: 4px solid #f39c12;
}

.student-card {
  border-top: 4px solid #3498db;
}

.member-avatar {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
}

.member-info {
  padding: 25px;
}

.member-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.member-name-en {
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0 0 8px 0;
  font-style: italic;
}

.member-title {
  font-size: 1rem;
  color: #667eea;
  font-weight: 500;
  margin: 0 0 15px 0;
}

.member-bio {
  color: #555;
  line-height: 1.6;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.member-interests {
  margin: 15px 0;
  min-height: 32px;
}

.member-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ecf0f1;
}

/* 详情对话框样式 */
.member-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
}

.detail-avatar {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-default-avatar {
  color: white;
  font-size: 3rem;
}

.detail-info h2 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.detail-name-en {
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 8px 0;
}

.detail-title {
  color: #667eea;
  font-weight: 500;
  margin: 0 0 20px 0;
  font-size: 1.1rem;
}

.detail-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.contact-item a {
  color: #667eea;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
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

.interests-tags {
  display: flex;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .members-header h1 {
    font-size: 2.2rem;
  }

  .members-header p {
    font-size: 1.1rem;
  }

  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    flex-direction: column;
  }

  .filter-left .el-input,
  .filter-right .el-select {
    width: 100% !important;
  }

  .stats-section {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .members-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .detail-header {
    flex-direction: column;
    text-align: center;
  }

  .detail-avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto;
  }

  .detail-contact {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .member-info {
    padding: 20px;
  }

  .member-avatar {
    height: 150px;
  }
}
</style>
