<template>
  <section class="teampreview-section">
    <div class="container">
      <div class="section-header">
        <h2>团队预览</h2>
        <router-link to="/members" class="more-link">查看全部 →</router-link>
      </div>

      <div class="members-list" v-loading="loading">
        <div v-for="member in displayMembers" :key="member.id" class="member-item" @click="goDetail(member)">
          <div class="member-media">
            <img v-if="member.avatar" :src="member.avatar" :alt="member.name" class="member-avatar" />
            <div v-else class="default-avatar">{{ getInitials(member.name) }}</div>
          </div>

          <div class="member-content">
            <h3 class="member-name">{{ member.name }}</h3>
            <p class="member-title">{{ member.title }}</p>
            <div class="member-info" v-if="member.research_interests">
              <span class="info-label">研究方向：</span>
              <span class="info-value">{{ getInterests(member.research_interests) }}</span>
            </div>
            <div class="member-info" v-if="member.email">
              <span class="info-label">邮箱：</span>
              <span class="info-value">{{ member.email }}</span>
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
      // 优先展示教师与博士后
      const faculty = members.value.filter(m => m.category === 'faculty').slice(0, 2)
      const postdoc = members.value.filter(m => m.category === 'postdoc').slice(0, 1)
      const others = members.value.filter(m => m.category !== 'faculty' && m.category !== 'postdoc').slice(0, 2)
      return [...faculty, ...postdoc, ...others].slice(0, 4)
    })

    const getInterests = (str) => {
      const interests = (str || '').split(',').map(s => s.trim()).filter(Boolean)
      return interests.slice(0, 3).join('、')
    }

    const getInitials = (name) => (name || 'U').slice(0, 1).toUpperCase()
    const goDetail = (m) => { window.location.href = `/members/${m.id}` }

    onMounted(load)

    return { loading, displayMembers, getInterests, getInitials, goDetail }
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
  margin-bottom: 40px;
}

.section-header h2 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
}

.more-link {
  color: #667eea;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.more-link:hover {
  opacity: 0.8;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.member-item {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  align-items: center;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.member-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.member-media {
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-avatar {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  object-fit: cover;
}

.default-avatar {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
}

.member-content {
  color: #2c3e50;
}

.member-name {
  font-size: 1.5rem;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.member-title {
  color: #667eea;
  font-size: 1.1rem;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.member-info {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  line-height: 1.6;
}

.info-label {
  color: #7f8c8d;
  flex-shrink: 0;
}

.info-value {
  color: #555;
}

.empty {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .member-item {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .member-media {
    order: 1;
  }

  .member-content {
    order: 2;
  }

  .member-avatar,
  .default-avatar {
    width: 120px;
    height: 120px;
  }
}
</style>