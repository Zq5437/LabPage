import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { title: '关于我们' }
    },
    {
        path: '/research',
        name: 'Research',
        component: () => import('@/views/Research.vue'),
        meta: { title: '研究方向' }
    },
    {
        path: '/members',
        name: 'Members',
        component: () => import('@/views/Members.vue'),
        meta: { title: '实验室成员' }
    },
    {
        path: '/members/:id',
        name: 'MemberDetail',
        component: () => import('@/views/MemberDetail.vue'),
        meta: { title: '成员详情' }
    },
    {
        path: '/projects',
        name: 'Projects',
        component: () => import('@/views/Projects.vue'),
        meta: { title: '研究项目' }
    },
    {
        path: '/projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/ProjectDetail.vue'),
        meta: { title: '项目详情' }
    },
    {
        path: '/publications',
        name: 'Publications',
        component: () => import('@/views/Publications.vue'),
        meta: { title: '发表论文' }
    },
    {
        path: '/news',
        name: 'News',
        component: () => import('@/views/News.vue'),
        meta: { title: '新闻动态' }
    },
    {
        path: '/news/:id',
        name: 'NewsDetail',
        component: () => import('@/views/NewsDetail.vue'),
        meta: { title: '新闻详情' }
    },
    {
        path: '/recruitment',
        name: 'Recruitment',
        component: () => import('@/views/Recruitment.vue'),
        meta: { title: '招生信息' }
    },
    {
        path: '/equipment',
        name: 'Equipment',
        component: () => import('@/views/Equipment.vue'),
        meta: { title: '设备资源' }
    },
    {
        path: '/contact',
        name: 'Contact',
        component: () => import('@/views/Contact.vue'),
        meta: { title: '联系我们' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '页面未找到' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
    // 设置页面标题
    const baseTitle = '智能计算实验室'
    if (to.meta.title) {
        document.title = `${to.meta.title} - ${baseTitle}`
    } else {
        document.title = baseTitle
    }

    next()
})

export default router
