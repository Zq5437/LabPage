<template>
  <div class="home-page">
    <!-- 首页横幅 -->
    <HeroBanner />
    
    <!-- 实验室简介 -->
    <LabIntro />
    
    <!-- 研究方向 -->
    <ResearchHighlights />
    
    <!-- 最新新闻 -->
    <LatestNews />
    
    <!-- 实验室成员 -->
    <TeamPreview />
    
    <!-- 统计数据 -->
    <StatsSection />
  </div>
</template>

<script>
import HeroBanner from '@/components/home/HeroBanner.vue'
import LabIntro from '@/components/home/LabIntro.vue'
import ResearchHighlights from '@/components/home/ResearchHighlights.vue'
import LatestNews from '@/components/home/LatestNews.vue'
import TeamPreview from '@/components/home/TeamPreview.vue'
import StatsSection from '@/components/home/StatsSection.vue'

export default {
  name: 'Home',
  components: {
    HeroBanner,
    LabIntro,
    ResearchHighlights,
    LatestNews,
    TeamPreview,
    StatsSection
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  overflow-x: hidden;
}
</style>
