<template>
  <header class="nav-header" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <div class="nav-content">
        <!-- Logo和标题 -->
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <img v-if="labInfo.logo" :src="labInfo.logo" alt="实验室Logo" class="brand-logo">
            <div class="brand-text">
              <h1 class="brand-title">{{ siteTitle }}</h1>
              <p v-if="labInfo.name_en" class="brand-subtitle">{{ labInfo.name_en }}</p>
            </div>
          </router-link>
        </div>

        <!-- 导航菜单 -->
        <nav class="nav-menu" :class="{ 'active': mobileMenuActive }">
          <ul class="nav-list">
            <li class="nav-item">
              <router-link to="/" class="nav-link" @click="closeMobileMenu">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link" @click="closeMobileMenu">关于我们</router-link>
            </li>
            <li class="nav-item dropdown">
              <a href="#" class="nav-link dropdown-toggle">研究工作</a>
              <ul class="dropdown-menu">
                <li><router-link to="/research" @click="closeMobileMenu">研究方向</router-link></li>
                <li><router-link to="/projects" @click="closeMobileMenu">研究项目</router-link></li>
                <li><router-link to="/publications" @click="closeMobileMenu">发表论文</router-link></li>
              </ul>
            </li>
            <li class="nav-item">
              <router-link to="/members" class="nav-link" @click="closeMobileMenu">实验室成员</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/news" class="nav-link" @click="closeMobileMenu">新闻动态</router-link>
            </li>
            <li class="nav-item dropdown">
              <a href="#" class="nav-link dropdown-toggle">更多</a>
              <ul class="dropdown-menu">
                <li><router-link to="/recruitment" @click="closeMobileMenu">招生信息</router-link></li>
                <li><router-link to="/equipment" @click="closeMobileMenu">设备资源</router-link></li>
                <li><router-link to="/contact" @click="closeMobileMenu">联系我们</router-link></li>
              </ul>
            </li>
          </ul>
        </nav>

        <!-- 菜单按钮（≤1024px 显示） -->
        <button class="mobile-menu-btn d-lg-none" :class="{ active: mobileMenuActive }"
          @click.stop.prevent="toggleMobileMenu" :aria-expanded="mobileMenuActive.toString()" aria-label="切换导航"
          type="button">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useSiteStore } from '@/stores/site'

export default {
  name: 'NavHeader',
  setup() {
    const siteStore = useSiteStore()
    const isScrolled = ref(false)
    const mobileMenuActive = ref(false)

    const labInfo = computed(() => siteStore.labInfo)
    const siteTitle = computed(() => siteStore.siteTitle)

    // 监听滚动事件
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50
    }

    // 切换移动端菜单
    const toggleMobileMenu = () => {
      mobileMenuActive.value = !mobileMenuActive.value
    }

    // 关闭移动端菜单
    const closeMobileMenu = () => {
      mobileMenuActive.value = false
    }

    const syncMenuByViewport = () => {
      // ≥1025px 桌面端默认展开；≤1024px 默认收起
      if (window.innerWidth >= 1025) {
        mobileMenuActive.value = true
      } else {
        mobileMenuActive.value = false
      }
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', syncMenuByViewport)
      syncMenuByViewport()
      // 初始化站点数据
      siteStore.initSiteData()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', syncMenuByViewport)
    })

    return {
      labInfo,
      siteTitle,
      isScrolled,
      mobileMenuActive,
      toggleMobileMenu,
      closeMobileMenu
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  transition: all 0.3s ease;

  &.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: var(--shadow-light);
  }
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
}

.nav-brand {
  .brand-link {
    display: flex;
    align-items: center;
    color: var(--text-primary);

    &:hover {
      color: var(--primary-color);
    }
  }

  .brand-logo {
    width: 50px;
    height: 50px;
    margin-right: 12px;
    border-radius: var(--border-radius);
  }

  .brand-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
  }

  .brand-subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.2;
  }
}

.nav-menu {
  @media (max-width: 1024px) {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid var(--border-light);
    box-shadow: var(--shadow-medium);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.3s ease;

    &.active {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }

  @media (min-width: 1025px) {
    // 桌面端默认可见
    opacity: 1;
    visibility: visible;
    transform: none;
  }
}

.nav-list {
  display: flex;
  align-items: center;

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 20px 0;
  }
}

.nav-item {
  position: relative;
  margin: 0 8px;

  @media (max-width: 1024px) {
    margin: 8px 0;
    width: 100%;
    text-align: center;
  }

  &.dropdown {
    &:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;

  &:hover {
    color: var(--primary-color);
    background: rgba(24, 144, 255, 0.1);
  }

  &.router-link-active {
    color: var(--primary-color);
    background: rgba(24, 144, 255, 0.1);
  }

  &.dropdown-toggle::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid currentColor;
    margin-left: 6px;
    transition: transform 0.3s ease;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 160px;
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    border: none;
    box-shadow: none;
    background: var(--background-light);
    margin-top: 8px;
  }

  li {
    a {
      display: block;
      padding: 10px 16px;
      color: var(--text-primary);
      font-size: 14px;
      border-radius: 0;

      &:hover {
        color: var(--primary-color);
        background: var(--background-light);
      }

      &.router-link-active {
        color: var(--primary-color);
        background: rgba(24, 144, 255, 0.1);
      }
    }
  }
}

.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1001; // 高于 .nav-header 的 z-index 内容层，避免被菜单捕获点击

  .hamburger-line {
    width: 20px;
    height: 2px;
    background: var(--text-primary);
    margin: 2px 0;
    transition: all 0.3s ease;
    transform-origin: center;
  }

  &:hover .hamburger-line {
    background: var(--primary-color);
  }

  &.active {
    .hamburger-line:nth-child(1) {
      transform: translateY(4px) rotate(45deg);
    }

    .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .hamburger-line:nth-child(3) {
      transform: translateY(-4px) rotate(-45deg);
    }
  }
}

// 兜底：桌面端强制隐藏汉堡按钮，避免 scoped 样式覆盖全局的 d-lg-none
@media (min-width: 1025px) {
  .mobile-menu-btn {
    display: none !important;
  }
}

// 桌面端：下拉箭头在 hover 时旋转，反馈更直观
.nav-item.dropdown:hover .nav-link.dropdown-toggle::after {
  transform: rotate(180deg);
}
</style>
