<template>
  <section class="statssection-section">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="number">{{ membersCount }}</div>
          <div class="label">活跃成员</div>
        </div>
        <div class="stat-card">
          <div class="number">{{ projectsCount }}</div>
          <div class="label">项目总数</div>
        </div>
        <div class="stat-card">
          <div class="number">{{ publicationsCount }}</div>
          <div class="label">论文篇目</div>
        </div>
        <div class="stat-card" v-if="showVisitor">
          <div class="number">{{ visitorsTotalText }}</div>
          <div class="label">访问统计 <span v-if="visitorsRecentText" class="label-extra">{{ visitorsRecentText }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import api, { publicApi } from '@/utils/api'
import { useSiteStore } from '@/stores/site'

export default {
  name: 'StatsSection',
  setup() {
    const siteStore = useSiteStore()
    const membersCount = ref(0)
    const projectsCount = ref(0)
    const publicationsCount = ref(0)

    const showVisitor = computed(() => !!siteStore.siteConfig.show_visitor_count)
    const totalVisits = ref(null)
    const recentVisits = ref(null)

    const loadMembers = async () => {
      try {
        const res = await api.get('/members', { params: { status: 'active' } })
        membersCount.value = (res?.data?.members || []).length
      } catch (_) { membersCount.value = 0 }
    }

    const loadProjects = async () => {
      try {
        const res = await api.get('/projects', { params: { page: 1, limit: 1 } })
        projectsCount.value = res?.data?.pagination?.total || (res?.data?.projects || []).length
      } catch (_) { projectsCount.value = 0 }
    }

    const loadPublications = async () => {
      try {
        const res = await publicApi.getPublications({ page: 1, limit: 1 })
        publicationsCount.value = res?.data?.pagination?.total || (res?.data?.publications || []).length
      } catch (_) { publicationsCount.value = 0 }
    }

    const loadStatistics = async () => {
      try {
        const res = await publicApi.getStatistics({ days: 30 })
        totalVisits.value = res?.data?.totalVisits ?? null
        recentVisits.value = res?.data?.recentVisits ?? null
      } catch (_) {
        totalVisits.value = null
        recentVisits.value = null
      }
    }

    onMounted(() => {
      loadMembers()
      loadProjects()
      loadPublications()
      if (showVisitor.value) loadStatistics()
    })

    const visitorsTotalText = computed(() => {
      if (!showVisitor.value) return ''
      if (totalVisits.value == null) return '统计中'
      return `${totalVisits.value} 次`
    })

    const visitorsRecentText = computed(() => {
      if (!showVisitor.value) return ''
      if (totalVisits.value == null) return ''
      return `(近30天 ${recentVisits.value ?? 0})`
    })

    return { membersCount, projectsCount, publicationsCount, showVisitor, visitorsTotalText, visitorsRecentText }
  }
}
</script>

<style scoped>
.statssection-section {
  padding: 80px 0;
  background: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 28px 20px;
  text-align: center;
}

.number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.label {
  margin-top: 6px;
  color: #666;
}

.label-extra {
  margin-left: 6px;
  color: #999;
  font-size: .85em;
}
</style>
