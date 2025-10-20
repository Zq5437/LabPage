<template>
  <section class="statssection-section">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="number">
            <AnimatedNumber :value="membersCount" :duration="2000" />
          </div>
          <div class="label">活跃成员</div>
        </div>
        <div class="stat-card">
          <div class="number">
            <AnimatedNumber :value="projectsCount" :duration="2000" />
          </div>
          <div class="label">项目总数</div>
        </div>
        <div class="stat-card">
          <div class="number">
            <AnimatedNumber :value="publicationsCount" :duration="2500" />
          </div>
          <div class="label">论文篇目</div>
        </div>
        <div class="stat-card" v-if="showVisitor">
          <div class="number">
            <template v-if="totalVisits !== null">
              <AnimatedNumber :value="totalVisits" :duration="2500" />
              <span class="unit"> 次</span>
            </template>
            <template v-else>统计中</template>
          </div>
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
import AnimatedNumber from '@/components/AnimatedNumber.vue'

export default {
  name: 'StatsSection',
  components: {
    AnimatedNumber
  },
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

    return {
      membersCount,
      projectsCount,
      publicationsCount,
      showVisitor,
      visitorsTotalText,
      visitorsRecentText,
      totalVisits,
      recentVisits
    }
  }
}
</script>

<style scoped>
.statssection-section {
  padding: 80px 0;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.number {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  margin-bottom: 12px;
}

.unit {
  font-size: 1.5rem;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: 4px;
}

.label {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.label-extra {
  display: block;
  margin-top: 6px;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 400;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 32px 24px;
  }

  .number {
    font-size: 2.5rem;
  }

  .unit {
    font-size: 1.2rem;
  }
}
</style>
