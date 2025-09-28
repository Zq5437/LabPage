import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: {
            title: '登录',
            requiresAuth: false
        }
    },
    {
        path: '/',
        redirect: '/dashboard',
        component: () => import('@/layout/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: {
                    title: '仪表盘',
                    icon: 'DataAnalysis'
                }
            },
            {
                path: 'lab-info',
                name: 'LabInfo',
                component: () => import('@/views/LabInfo.vue'),
                meta: {
                    title: '实验室信息',
                    icon: 'OfficeBuilding'
                }
            },
            {
                path: 'news',
                name: 'NewsManage',
                component: () => import('@/views/news/Index.vue'),
                meta: {
                    title: '新闻管理',
                    icon: 'Document'
                },
                children: [
                    {
                        path: '',
                        name: 'NewsList',
                        component: () => import('@/views/news/List.vue'),
                        meta: { title: '新闻列表' }
                    },
                    {
                        path: 'create',
                        name: 'NewsCreate',
                        component: () => import('@/views/news/Form.vue'),
                        meta: { title: '创建新闻' }
                    },
                    {
                        path: 'edit/:id',
                        name: 'NewsEdit',
                        component: () => import('@/views/news/Form.vue'),
                        meta: { title: '编辑新闻' }
                    }
                ]
            },
            {
                path: 'members',
                name: 'MembersManage',
                component: () => import('@/views/members/Index.vue'),
                meta: {
                    title: '成员管理',
                    icon: 'User'
                },
                children: [
                    {
                        path: '',
                        name: 'MembersList',
                        component: () => import('@/views/members/List.vue'),
                        meta: { title: '成员列表' }
                    },
                    {
                        path: 'create',
                        name: 'MembersCreate',
                        component: () => import('@/views/members/Form.vue'),
                        meta: { title: '添加成员' }
                    },
                    {
                        path: 'edit/:id',
                        name: 'MembersEdit',
                        component: () => import('@/views/members/Form.vue'),
                        meta: { title: '编辑成员' }
                    }
                ]
            },
            {
                path: 'projects',
                name: 'ProjectsManage',
                component: () => import('@/views/projects/Index.vue'),
                meta: {
                    title: '项目管理',
                    icon: 'Folder'
                },
                children: [
                    {
                        path: '',
                        name: 'ProjectsList',
                        component: () => import('@/views/projects/List.vue'),
                        meta: { title: '项目列表' }
                    },
                    {
                        path: 'create',
                        name: 'ProjectsCreate',
                        component: () => import('@/views/projects/Form.vue'),
                        meta: { title: '创建项目' }
                    },
                    {
                        path: 'edit/:id',
                        name: 'ProjectsEdit',
                        component: () => import('@/views/projects/Form.vue'),
                        meta: { title: '编辑项目' }
                    }
                ]
            },
            {
                path: 'publications',
                name: 'PublicationsManage',
                component: () => import('@/views/publications/Index.vue'),
                meta: {
                    title: '论文管理',
                    icon: 'Reading'
                },
                children: [
                    {
                        path: '',
                        name: 'PublicationsList',
                        component: () => import('@/views/publications/List.vue'),
                        meta: { title: '论文列表' }
                    },
                    {
                        path: 'create',
                        name: 'PublicationsCreate',
                        component: () => import('@/views/publications/Form.vue'),
                        meta: { title: '创建论文' }
                    },
                    {
                        path: 'edit/:id',
                        name: 'PublicationsEdit',
                        component: () => import('@/views/publications/Form.vue'),
                        meta: { title: '编辑论文' }
                    }
                ]
            },
            {
                path: 'research-areas',
                name: 'ResearchAreas',
                component: () => import('@/views/ResearchAreas.vue'),
                meta: {
                    title: '研究方向',
                    icon: 'TrendCharts'
                }
            },
            {
                path: 'recruitment',
                name: 'RecruitmentManage',
                component: () => import('@/views/Recruitment.vue'),
                meta: {
                    title: '招生管理',
                    icon: 'UserFilled'
                }
            },
            {
                path: 'equipment',
                name: 'EquipmentManage',
                component: () => import('@/views/Equipment.vue'),
                meta: {
                    title: '设备管理',
                    icon: 'Monitor'
                }
            },
            {
                path: 'settings',
                name: 'Settings',
                component: () => import('@/views/Settings.vue'),
                meta: {
                    title: '系统设置',
                    icon: 'Setting'
                }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/Profile.vue'),
                meta: {
                    title: '个人资料',
                    icon: 'Avatar'
                }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '页面未找到' }
    }
]

const router = createRouter({
    history: createWebHistory('/admin/'),
    routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 设置页面标题
    const baseTitle = '实验室管理后台'
    if (to.meta.title) {
        document.title = `${to.meta.title} - ${baseTitle}`
    } else {
        document.title = baseTitle
    }

    // 检查是否需要认证
    if (to.meta.requiresAuth !== false) {
        // 检查是否已登录
        if (!authStore.isLoggedIn) {
            // 尝试从本地存储恢复登录状态
            await authStore.checkAuth()

            if (!authStore.isLoggedIn) {
                next('/login')
                return
            }
        }
    }

    // 如果已登录且访问登录页，重定向到仪表盘
    if (to.name === 'Login' && authStore.isLoggedIn) {
        next('/dashboard')
        return
    }

    next()
})

export default router
