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

    let lastScrollTop = 0
    let scrollTimeout = null

    // 监听滚动事件
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const header = document.querySelector('.nav-header')

      // 更新滚动状态
      isScrolled.value = scrollTop > 50

      // 判断滚动方向
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // 向下滚动且不在顶部，隐藏导航栏
        header.classList.add('nav-up')
      } else {
        // 向上滚动或在顶部，显示导航栏
        header.classList.remove('nav-up')
      }

      lastScrollTop = scrollTop

      // 防抖处理：滚动停止后一段时间显示导航栏
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        header.classList.remove('nav-up')
      }, 1000)
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);

  &.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  // 向上滚动时显示导航栏
  &.nav-up {
    transform: translateY(-100%);
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
    height: calc(100vh - var(--header-height));
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--border-light);
    box-shadow: var(--shadow-medium);
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    &.active {
      transform: translateX(0);
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
    padding: 20px;
    height: 100%;
    gap: 10px;
  }
}

.nav-item {
  position: relative;
  margin: 0 8px;

  @media (max-width: 1024px) {
    margin: 0;
    width: 100%;

    .nav-link {
      justify-content: center;
      padding: 15px 20px;
      border-radius: 12px;
      font-size: 16px;

      &.dropdown-toggle::after {
        position: relative;
        right: auto;
        top: auto;
        margin-left: 8px;
      }
    }
  }

  &.dropdown {
    position: static;

    @media (min-width: 1025px) {
      position: relative;
    }

    &:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, 0);
    }

    @media (max-width: 1024px) {
      &:hover .dropdown-menu {
        transform: none;
      }
    }
  }
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  border-radius: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
    z-index: -1;
  }

  &:hover {
    color: var(--primary-color);
    transform: translateY(-2px);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &.router-link-active {
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    &:hover {
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  }

  &.dropdown-toggle {
    padding-right: 32px;

    &::after {
      content: '';
      position: absolute;
      right: 12px;
      top: 50%;
      width: 8px;
      height: 8px;
      border: 2px solid currentColor;
      border-left: 0;
      border-top: 0;
      transform: translateY(-70%) rotate(45deg);
      transition: transform 0.3s ease;
    }
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 15px);
  left: 50%;
  min-width: 200px;
  background: #fff;
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, -10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 2px;
  }

  @media (max-width: 1024px) {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    border: none;
    box-shadow: none;
    background: rgba(102, 126, 234, 0.05);
    margin: 5px 0;
    border-radius: 12px;
    padding: 5px;
    width: 100%;
    min-width: auto;

    &::before {
      display: none;
    }

    li {
      width: 100%;

      a {
        padding: 12px 20px;
        justify-content: center;
        text-align: center;
        font-size: 15px;

        &:hover {
          transform: none;
          background: rgba(102, 126, 234, 0.1);
        }
      }
    }
  }

  li {
    a {
      display: block;
      padding: 12px 20px;
      color: var(--text-primary);
      font-size: 14px;
      border-radius: 12px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
        z-index: -1;
      }

      &:hover {
        color: var(--primary-color);
        transform: translateX(5px);

        &::before {
          width: 300px;
          height: 300px;
        }
      }

      &.router-link-active {
        color: #fff;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

        &:hover {
          transform: translateX(5px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
      }
    }
  }
}

.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(102, 126, 234, 0.1);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  z-index: 1001;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }

  .hamburger-line {
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    margin: 3px auto;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
    border-radius: 2px;
  }

  &:hover .hamburger-line {
    background: var(--primary-color);

    &:nth-child(1) {
      width: 20px;
      margin-right: 0;
    }

    &:nth-child(3) {
      width: 20px;
      margin-left: 0;
    }
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    .hamburger-line {
      background: #fff;
      margin: 0;
      position: absolute;
      width: 24px;
      top: 50%;
      left: 50%;

      &:nth-child(1) {
        transform: translate(-50%, -50%) rotate(45deg);
      }

      &:nth-child(2) {
        opacity: 0;
        transform: translate(-50%, -50%);
      }

      &:nth-child(3) {
        transform: translate(-50%, -50%) rotate(-45deg);
      }
    }

    &:hover {
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
