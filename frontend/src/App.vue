<template>
    <div id="app">
        <!-- 网站导航 -->
        <NavHeader />

        <!-- 主要内容区域 -->
        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="page" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <!-- 网站底部 -->
        <SiteFooter />

        <!-- 返回顶部按钮 -->
        <BackToTop />
    </div>
</template>

<script>
import { onMounted } from 'vue'
import NavHeader from '@/components/common/NavHeader.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import { useSiteStore } from '@/stores/site'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default {
    name: 'App',
    components: {
        NavHeader,
        SiteFooter,
        BackToTop
    },
    setup() {
        const siteStore = useSiteStore()

        onMounted(async () => {
            // 初始化站点数据
            await siteStore.initSiteData()
            // 初始化AOS动画
            AOS.init({
                duration: 1000,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50
            })
        })

        return {}
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

// 全局过渡动画
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

// 页面切换动画
.page-enter-active,
.page-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

// 悬浮动画
.hover-scale {
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
}

// 渐入动画
.fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;

    &.visible {
        opacity: 1;
        transform: translateY(0);
    }
}

// 强调动画
@keyframes emphasis {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

.emphasis {
    animation: emphasis 0.6s ease-in-out;
}
</style>
