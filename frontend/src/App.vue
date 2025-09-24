<template>
  <div id="app">
    <!-- 网站导航 -->
    <NavHeader />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 网站底部 -->
    <SiteFooter />
    
    <!-- 返回顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script>
import NavHeader from '@/components/common/NavHeader.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import BackToTop from '@/components/common/BackToTop.vue'

export default {
  name: 'App',
  components: {
    NavHeader,
    SiteFooter,
    BackToTop
  },
  created() {
    // 记录页面访问
    this.logVisit()
  },
  methods: {
    logVisit() {
      // 简单的访问统计
      const visitData = {
        page_url: window.location.href,
        referer: document.referrer
      }
      
      // 发送访问记录（不阻塞页面加载）
      fetch('/api/public/visit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitData)
      }).catch(() => {
        // 忽略错误，不影响用户体验
      })
    }
  }
}
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; // 为固定导航栏留出空间
}

// 全局滚动条样式
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
