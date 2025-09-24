import axios from 'axios'

// 创建axios实例
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
api.interceptors.request.use(
    config => {
        // 可以在这里添加token等认证信息
        // const token = localStorage.getItem('token')
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`
        // }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
api.interceptors.response.use(
    response => {
        const { data } = response
        if (data.success) {
            return data.data
        } else {
            return Promise.reject(new Error(data.message || '请求失败'))
        }
    },
    error => {
        let message = '网络错误'

        if (error.response) {
            const { status, data } = error.response
            switch (status) {
                case 400:
                    message = data.message || '请求参数错误'
                    break
                case 401:
                    message = '未授权访问'
                    break
                case 403:
                    message = '权限不足'
                    break
                case 404:
                    message = '请求的资源不存在'
                    break
                case 500:
                    message = '服务器内部错误'
                    break
                default:
                    message = data.message || `请求失败 (${status})`
            }
        } else if (error.request) {
            message = '网络连接失败'
        }

        return Promise.reject(new Error(message))
    }
)

// API方法
export const publicApi = {
    // 获取实验室信息
    getLabInfo: () => api.get('/public/lab-info'),

    // 获取研究方向
    getResearchAreas: () => api.get('/public/research-areas'),

    // 获取网站配置
    getSiteConfig: () => api.get('/public/site-config'),

    // 记录访问
    logVisit: (data) => api.post('/public/visit-log', data),

    // 获取论文列表
    getPublications: (params) => api.get('/public/publications', { params }),

    // 获取招生信息
    getRecruitment: () => api.get('/public/recruitment'),

    // 获取设备列表
    getEquipment: (params) => api.get('/public/equipment', { params })
}

export const newsApi = {
    // 获取新闻列表
    getList: (params) => api.get('/news', { params }),

    // 获取新闻详情
    getDetail: (id) => api.get(`/news/${id}`)
}

export const membersApi = {
    // 获取成员列表
    getList: (params) => api.get('/members', { params }),

    // 获取成员详情
    getDetail: (id) => api.get(`/members/${id}`)
}

export const projectsApi = {
    // 获取项目列表
    getList: (params) => api.get('/projects', { params }),

    // 获取项目详情
    getDetail: (id) => api.get(`/projects/${id}`)
}

export default api
