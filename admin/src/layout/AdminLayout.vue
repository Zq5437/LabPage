<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="layout-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <AdminSidebar :collapsed="sidebarCollapsed" />
    </div>

    <!-- 主要内容区域 -->
    <div class="layout-main">
      <!-- 顶部导航 -->
      <div class="layout-header">
        <AdminHeader :sidebar-collapsed="sidebarCollapsed" @toggle-sidebar="toggleSidebar" />
      </div>

      <!-- 内容区域 -->
      <div class="layout-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="keepAliveComponents">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminHeader from './components/AdminHeader.vue'

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 需要缓存的组件
const keepAliveComponents = computed(() => [
  'Dashboard',
  'NewsList',
  'MembersList',
  'ProjectsList'
])

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // 侧边栏宽度有过渡动画，动画结束后触发一次全局 resize 以通知图表自适应
  // 与 .layout-sidebar 的 transition: width 0.3s 保持一致，略加偏移
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 320)
}

// 监听窗口大小变化
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebarCollapsed.value = true
    }
  }

  window.addEventListener('resize', handleResize)
  handleResize() // 初始化检查

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout-sidebar {
  width: var(--admin-sidebar-width);
  flex-shrink: 0;
  transition: width 0.3s ease;

  &.collapsed {
    width: 64px;
  }
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: var(--admin-header-height);
  flex-shrink: 0;
  border-bottom: 1px solid var(--admin-border-lighter);
  background: var(--admin-bg-color);
  z-index: 100;
}

.layout-content {
  flex: 1;
  overflow: auto;
  background: var(--admin-bg-page);
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式
@media (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }

  .layout-main {
    width: 100%;
  }
}
</style>
