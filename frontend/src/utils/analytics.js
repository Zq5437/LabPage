// 访问统计工具
import { publicApi } from './api.js'

// 记录页面访问
export const logPageVisit = async (pageUrl, referer = '') => {
    try {
        // 避免在开发环境记录访问
        if (import.meta.env.DEV) {
            return
        }

        await publicApi.logVisit({
            page_url: pageUrl,
            referer: referer || document.referrer
        })
    } catch (error) {
        // 访问统计失败不应影响用户体验，只记录错误
        console.warn('访问统计记录失败:', error.message)
    }
}

// 防抖函数，避免频繁记录
let visitTimer = null
export const debouncedLogVisit = (pageUrl, referer = '', delay = 1000) => {
    if (visitTimer) {
        clearTimeout(visitTimer)
    }

    visitTimer = setTimeout(() => {
        logPageVisit(pageUrl, referer)
    }, delay)
}

// 获取当前页面路径（用于统计）
export const getCurrentPagePath = () => {
    return window.location.pathname + window.location.search
}

// 页面标题映射（用于更友好的统计显示）
export const getPageTitle = (path) => {
    const titleMap = {
        '/': '首页',
        '/about': '关于我们',
        '/research': '研究方向',
        '/members': '团队成员',
        '/news': '新闻动态',
        '/projects': '研究项目',
        '/publications': '发表论文',
        '/equipment': '设备资源',
        '/recruitment': '招生信息',
        '/contact': '联系我们'
    }

    // 处理动态路由
    if (path.startsWith('/news/')) {
        return '新闻详情'
    }
    if (path.startsWith('/members/')) {
        return '成员详情'
    }
    if (path.startsWith('/projects/')) {
        return '项目详情'
    }

    return titleMap[path] || path
}
