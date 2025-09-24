import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
api.interceptors.request.use(
    config => {
        // 添加认证token
        const token = localStorage.getItem('admin_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
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
            ElMessage.error(data.message || '请求失败')
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
                    message = '登录已过期，请重新登录'
                    // 清除本地认证信息
                    localStorage.removeItem('admin_token')
                    localStorage.removeItem('admin_user')
                    // 跳转到登录页
                    router.push('/login')
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

        ElMessage.error(message)
        return Promise.reject(new Error(message))
    }
)

// 认证相关API
export const adminApi = {
    // 登录
    login: (data) => api.post('/auth/login', data),

    // 登出
    logout: () => api.post('/auth/logout'),

    // 获取当前用户信息
    getCurrentUser: () => api.get('/auth/me'),

    // 修改密码
    changePassword: (data) => api.post('/auth/change-password', data),

    // 创建管理员
    createAdmin: (data) => api.post('/auth/create-admin', data),

    // 获取管理员列表
    getAdmins: () => api.get('/auth/admins')
}

// 新闻管理API
export const newsApi = {
    // 获取新闻列表（管理端）
    getList: (params) => api.get('/news/admin/list', { params }),

    // 获取新闻详情
    getDetail: (id) => api.get(`/news/${id}`),

    // 创建新闻
    create: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.post('/news', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 更新新闻
    update: (id, data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.put(`/news/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 删除新闻
    delete: (id) => api.delete(`/news/${id}`)
}

// 成员管理API
export const membersApi = {
    // 获取成员列表（管理端）
    getList: (params) => api.get('/members/admin/list', { params }),

    // 获取成员详情
    getDetail: (id) => api.get(`/members/${id}`),

    // 创建成员
    create: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.post('/members', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 更新成员
    update: (id, data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.put(`/members/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 删除成员
    delete: (id) => api.delete(`/members/${id}`)
}

// 项目管理API
export const projectsApi = {
    // 获取项目列表（管理端）
    getList: (params) => api.get('/projects/admin/list', { params }),

    // 获取项目详情
    getDetail: (id) => api.get(`/projects/${id}`),

    // 创建项目
    create: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (key === 'attachments' && Array.isArray(data[key])) {
                data[key].forEach(file => {
                    formData.append('attachments', file)
                })
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.post('/projects', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 更新项目
    update: (id, data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (key === 'attachments' && Array.isArray(data[key])) {
                data[key].forEach(file => {
                    formData.append('attachments', file)
                })
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.put(`/projects/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 删除项目
    delete: (id) => api.delete(`/projects/${id}`)
}

// 公共API
export const publicApi = {
    // 获取实验室信息
    getLabInfo: () => api.get('/public/lab-info'),

    // 更新实验室信息
    updateLabInfo: (data) => api.put('/public/admin/lab-info', data),

    // 获取网站配置
    getSiteConfig: () => api.get('/public/site-config'),

    // 更新网站配置
    updateSiteConfig: (data) => api.put('/public/admin/site-config', data),

    // 获取访问统计
    getStatistics: (params) => api.get('/public/admin/statistics', { params }),

    // 获取研究方向
    getResearchAreas: () => api.get('/public/research-areas'),

    // 获取论文列表
    getPublications: (params) => api.get('/public/publications', { params }),

    // 获取招生信息
    getRecruitment: () => api.get('/public/recruitment'),

    // 获取设备列表
    getEquipment: (params) => api.get('/public/equipment', { params })
}

// 文件上传API
export const uploadApi = {
    // 上传单个文件
    uploadFile: (file, type = 'common') => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 上传多个文件
    uploadFiles: (files, type = 'common') => {
        const formData = new FormData()
        files.forEach(file => {
            formData.append('files', file)
        })
        formData.append('type', type)
        return api.post('/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}

export default api
