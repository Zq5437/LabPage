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
            return data  // 返回完整的响应数据，包含data和pagination
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

// 论文管理API
export const publicationsApi = {
    // 获取论文列表（管理端）
    getAdminList: (params) => api.get('/publications/admin/list', { params }),

    // 获取论文详情
    getDetail: (id) => api.get(`/publications/${id}`),

    // 创建论文
    create: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.post('/publications/admin/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 更新论文
    update: (id, data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.put(`/publications/admin/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 删除论文
    delete: (id) => api.delete(`/publications/admin/delete/${id}`),

    // 批量删除论文
    batchDelete: (ids) => api.delete('/publications/admin/batch-delete', { data: { ids } }),

    // 更新论文状态
    updateStatus: (id, status) => api.patch(`/publications/admin/status/${id}`, { status }),

    // 获取分类列表
    getCategories: () => api.get('/publications/admin/categories'),

    // 获取年份列表
    getYears: () => api.get('/publications/admin/years')
}

// 设备管理API
export const equipmentApi = {
    // 获取设备列表（管理端）
    getAdminList: (params) => api.get('/equipment/admin/list', { params }),

    // 获取设备详情
    getDetail: (id) => api.get(`/equipment/${id}`),

    // 创建设备
    create: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                formData.append(key, data[key])
            }
        })
        return api.post('/equipment/admin/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 更新设备
    update: (id, data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                formData.append(key, data[key])
            }
        })
        return api.put(`/equipment/admin/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 删除设备
    delete: (id) => api.delete(`/equipment/admin/delete/${id}`)
}

// 研究方向管理API
export const researchAreasApi = {
    // 获取研究方向列表（管理端）
    getAdminList: (params) => api.get('/research-areas/admin/list', { params }),

    // 获取研究方向详情
    getDetail: (id) => api.get(`/research-areas/${id}`),

    // 创建研究方向
    create: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.post('/research-areas/admin/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 更新研究方向
    update: (id, data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.put(`/research-areas/admin/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 删除研究方向
    delete: (id) => api.delete(`/research-areas/admin/delete/${id}`)
}


// 实验室信息管理API
export const labInfoApi = {
    // 获取实验室信息
    getInfo: () => api.get('/lab-info/admin/info'),

    // 更新实验室信息
    update: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.put('/lab-info/admin/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
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

// 招聘信息管理API
export const recruitmentApi = {
    // 获取招聘信息列表（管理端）
    getList: (params) => api.get('/recruitment/admin/list', { params }),

    // 获取招聘信息详情
    getDetail: (id) => api.get(`/recruitment/admin/${id}`),

    // 创建招聘信息
    create: (data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.post('/recruitment/admin', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 更新招聘信息
    update: (id, data) => {
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key])
            }
        })
        return api.put(`/recruitment/admin/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 删除招聘信息
    delete: (id) => api.delete(`/recruitment/admin/${id}`)
}

// 联系留言管理API
export const contactApi = {
    // 获取联系统计信息
    getStats: () => api.get('/contact/stats'),

    // 获取联系留言列表（管理端）
    getMessages: (params) => api.get('/contact/messages', { params }),

    // 标记留言为已读
    markAsRead: (id) => api.put(`/contact/messages/${id}/read`),

    // 批量标记已读
    batchMarkRead: (ids) => api.put('/contact/messages/batch-read', { ids }),

    // 回复留言
    replyMessage: (id, reply) => api.put(`/contact/messages/${id}/reply`, { reply }),

    // 删除留言
    deleteMessage: (id) => api.delete(`/contact/messages/${id}`),

    // 批量删除留言
    batchDeleteMessages: (ids) => api.delete('/contact/messages/batch', { data: { ids } })
}

export default api
