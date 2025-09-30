import { defineStore } from 'pinia'
import { publicApi } from '@/utils/api'

export const useSiteStore = defineStore('site', {
    state: () => ({
        // 实验室基本信息
        labInfo: {
            name: '智能计算实验室',
            name_en: 'Intelligent Computing Lab',
            description: '',
            director: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            logo: '',
            banner: '',
            established_year: null
        },

        // 研究方向
        researchAreas: [],

        // 网站配置
        siteConfig: {
            site_title: '智能计算实验室',
            site_description: '专注于人工智能与机器学习研究',
            contact_email: '',
            contact_phone: '',
            show_visitor_count: true,
            max_news_per_page: 10
        },

        // 加载状态
        loading: {
            labInfo: false,
            researchAreas: false,
            siteConfig: false
        }
    }),

    getters: {
        // 获取网站标题
        siteTitle: (state) => state.siteConfig.site_title || state.labInfo.name,

        // 获取网站描述
        siteDescription: (state) => state.siteConfig.site_description || state.labInfo.description,

        // 获取联系邮箱
        contactEmail: (state) => state.siteConfig.contact_email || state.labInfo.email,

        // 获取联系电话
        contactPhone: (state) => state.siteConfig.contact_phone || state.labInfo.phone
    },

    actions: {
        // 获取实验室信息
        async fetchLabInfo() {
            if (this.loading.labInfo) return

            try {
                this.loading.labInfo = true
                const response = await publicApi.getLabInfo()
                const payload = response && response.data ? response.data : {}
                this.labInfo = { ...this.labInfo, ...payload }
            } catch (error) {
                console.error('获取实验室信息失败:', error)
            } finally {
                this.loading.labInfo = false
            }
        },

        // 获取研究方向
        async fetchResearchAreas() {
            if (this.loading.researchAreas) return

            try {
                this.loading.researchAreas = true
                const response = await publicApi.getResearchAreas()
                // 确保数据是数组格式
                this.researchAreas = Array.isArray(response.data) ? response.data : []
            } catch (error) {
                console.error('获取研究方向失败:', error)
                this.researchAreas = []
            } finally {
                this.loading.researchAreas = false
            }
        },

        // 获取网站配置
        async fetchSiteConfig() {
            if (this.loading.siteConfig) return

            try {
                this.loading.siteConfig = true
                const response = await publicApi.getSiteConfig()
                const payload = response && response.data ? response.data : {}
                this.siteConfig = { ...this.siteConfig, ...payload }
            } catch (error) {
                console.error('获取网站配置失败:', error)
            } finally {
                this.loading.siteConfig = false
            }
        },

        // 初始化站点数据
        async initSiteData() {
            await Promise.all([
                this.fetchLabInfo(),
                this.fetchResearchAreas(),
                this.fetchSiteConfig()
            ])
        }
    }
})
