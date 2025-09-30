<template>
  <section class="teampreview-section">
    <div class="container">
      <div class="section-header">
        <h2>团队预览</h2>
        <router-link to="/members" class="more-link">查看全部</router-link>
      </div>

      <div class="teams-grid" v-loading="loading">
        <div v-for="member in displayMembers" :key="member.id" class="member-card" @click="goDetail(member)">
          <div class="avatar">
            <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
            <div v-else class="default-avatar">{{ getInitials(member.name) }}</div>
          </div>
          <div class="info">
            <h3 class="name">{{ member.name }}</h3>
            <p class="title">{{ member.title }}</p>
            <div class="tags" v-if="member.research_interests">
              <span v-for="t in interests(member.research_interests).slice(0, 3)" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && displayMembers.length === 0" class="empty">
        <el-empty description="暂无成员" />
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

export default {
  name: 'TeamPreview',
  setup() {
    const loading = ref(false)
    const members = ref([])

    const load = async () => {
      try {
        loading.value = true
        const res = await api.get('/members', { params: { status: 'active' } })
        members.value = res?.data?.members || []
      } finally {
        loading.value = false
      }
    }

    const displayMembers = computed(() => {
      // 优先展示教师与博士后，各取若干，再补学生
      const faculty = members.value.filter(m => m.category === 'faculty').slice(0, 3)
      const postdoc = members.value.filter(m => m.category === 'postdoc').slice(0, 2)
      const others = members.value.filter(m => m.category !== 'faculty' && m.category !== 'postdoc').slice(0, 5)
      return [...faculty, ...postdoc, ...others].slice(0, 8)
    })

    const interests = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean)
    const getInitials = (name) => (name || 'U').slice(0, 1).toUpperCase()
    const goDetail = (m) => { window.location.href = `/members/${m.id}` }

    onMounted(load)

    return { loading, displayMembers, interests, getInitials, goDetail }
  }
}
</script>

<style scoped>
.teampreview-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.more-link {
  color: #667eea;
  text-decoration: none;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}

.member-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform .2s ease;
  display: flex;
  gap: 14px;
  padding: 14px;
  align-items: center;
}

.member-card:hover {
  transform: translateY(-4px);
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-weight: 700;
  font-size: 1.4rem;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  margin: 0;
  font-size: 1.05rem;
  color: #2c3e50;
  line-height: 1.3;
}

.title {
  margin: .25rem 0 .5rem 0;
  color: #667eea;
  font-size: .9rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f0f2f5;
  color: #666;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: .8rem;
}

.empty {
  padding: 20px 0;
}

@media (max-width: 768px) {
  .teams-grid {
    grid-template-columns: 1fr;
  }
}
</style>
