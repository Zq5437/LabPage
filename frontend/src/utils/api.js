import axios from 'axios'

// 获取基础路径（Vite 在构建时会自动设置）
const BASE_URL = import.meta.env.BASE_URL || '/';

// 检测是否为静态模式
let isStaticMode = false;
let staticModeChecked = false;
let staticModePromise = null;

// 异步检查静态模式（只检查一次）
async function checkStaticMode() {
    if (staticModeChecked) return isStaticMode;

    // 如果已经有正在进行的检查，等待它完成
    if (staticModePromise) {
        return await staticModePromise;
    }

    // 在开发模式下，直接返回 false，避免不必要的网络请求
    if (import.meta.env.DEV) {
        isStaticMode = false;
        staticModeChecked = true;
        return isStaticMode;
    }

    staticModePromise = (async () => {
        try {
            const url = `${BASE_URL}static-config.json`;
            const response = await fetch(url);
            if (response.ok) {
                const config = await response.json();
                isStaticMode = config.mode === 'static';
            }
        } catch (error) {
            // 静态模式下 static-config.json 不存在
            isStaticMode = false;
        }

        staticModeChecked = true;
        return isStaticMode;
    })();

    return await staticModePromise;
}

// 处理资源 URL（加上基础路径）
function processAssetUrl(url) {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) {
        return BASE_URL === '/' ? url : BASE_URL + url.slice(1);
    }
    return url;
}

// 递归处理对象中的所有 URL
function processUrls(obj) {
    if (!obj) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => processUrls(item));
    }

    const processed = {};
    const urlFields = [
        'avatar', 'image_url', 'cover_image', 'banner_url', 'logo_url',
        'image', 'cover', 'banner', 'logo', 'thumbnail', 'photo',
        'pdf_url', 'pdf_path', 'file_url', 'file_path'
    ];

    for (const key in obj) {
        if (urlFields.includes(key) && typeof obj[key] === 'string') {
            processed[key] = processAssetUrl(obj[key]);
        } else if (key === 'images' && Array.isArray(obj[key])) {
            processed[key] = obj[key].map(img => processAssetUrl(img));
        } else if (typeof obj[key] === 'object') {
            processed[key] = processUrls(obj[key]);
        } else {
            processed[key] = obj[key];
        }
    }

    return processed;
}

// 从静态JSON文件加载数据
async function loadStaticData(path) {
    try {
        const response = await fetch(`${BASE_URL}data/${path}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}`);
        }
        const data = await response.json();
        // 处理数据中的所有 URL
        return processUrls(data);
    } catch (error) {
        console.error('加载静态数据失败:', error);
        return { success: false, message: '数据加载失败' };
    }
}

// API 路径映射到 JSON 文件路径
const apiToJsonMap = {
    '/public/lab-info': 'lab-info.json',
    '/lab-info': 'lab-info.json',
    '/public/research-areas': 'research-areas.json',
    '/research-areas/list': 'research-areas.json',
    '/public/site-config': 'site-config.json',
    '/public/statistics': 'statistics.json',
    '/public/publications': 'publications.json',
    '/publications/list': 'publications.json',
    '/publications/stats/categories': 'publications.json', // 从 publications 中提取分类
    '/publications/stats/years': 'publications.json', // 从 publications 中提取年份
    '/public/recruitment': 'recruitment.json',
    '/recruitment/list': 'recruitment.json',
    '/public/equipment': 'equipment.json',
    '/equipment/list': 'equipment.json',
    '/equipment/stats/categories': 'equipment.json', // 从 equipment 中提取分类
    '/news': 'news.json',
    '/members': 'members.json',
    '/projects': 'projects.json'
};

// 创建axios实例
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器 - 静态模式下拦截所有 API 请求
api.interceptors.request.use(
    async config => {
        // 检查是否为静态模式
        const isStatic = await checkStaticMode();

        if (isStatic) {
            // 在静态模式下，拦截请求并从 JSON 文件读取
            const url = config.url;

            // 尝试匹配路径
            let jsonPath = null;

            // 详情页面（如 /news/1, /members/2）
            if (url.match(/^\/news\/\d+$/)) {
                const id = url.split('/')[2];
                jsonPath = `news/${id}.json`;
            } else if (url.match(/^\/members\/\d+$/)) {
                const id = url.split('/')[2];
                jsonPath = `members/${id}.json`;
            } else if (url.match(/^\/members\/\d+\/publications$/)) {
                const id = url.split('/')[2];
                jsonPath = `members/${id}-publications.json`;
            } else if (url.match(/^\/projects\/\d+$/)) {
                const id = url.split('/')[2];
                jsonPath = `projects/${id}.json`;
            } else {
                // 列表页面 - 从映射中查找
                for (const [apiPath, json] of Object.entries(apiToJsonMap)) {
                    if (url === apiPath || url.startsWith(apiPath + '?')) {
                        jsonPath = json;
                        break;
                    }
                }
            }

            if (jsonPath) {
                // 直接读取 JSON 文件并返回，绕过 HTTP 请求
                let data = await loadStaticData(jsonPath);

                // 特殊处理：统计 API
                if (url === '/publications/stats/categories') {
                    // 从 publications 中提取所有唯一的 type
                    // data.data 现在直接是论文数组（与后端 API 格式一致）
                    const pubs = Array.isArray(data.data) ? data.data : [];
                    const types = [...new Set(pubs.map(p => p.type).filter(Boolean))];
                    data = {
                        success: true,
                        data: types.map(type => ({ type, count: pubs.filter(p => p.type === type).length }))
                    };
                } else if (url === '/publications/stats/years') {
                    // 从 publications 中提取所有唯一的年份
                    // data.data 现在直接是论文数组（与后端 API 格式一致）
                    const pubs = Array.isArray(data.data) ? data.data : [];
                    const years = [...new Set(pubs.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
                    data = {
                        success: true,
                        data: years.map(year => ({ year, count: pubs.filter(p => p.year === year).length }))
                    };
                } else if (url === '/equipment/stats/categories') {
                    // 从 equipment 中提取所有唯一的分类
                    const items = data.data || [];
                    const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
                    data = {
                        success: true,
                        data: categories.map(category => ({
                            category,
                            count: items.filter(i => i.category === category).length
                        }))
                    };
                }

                // 创建一个假的 axios 响应对象
                const fakeResponse = {
                    data: data,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: config,
                    request: {}
                };

                // 使用 adapter 返回 Promise，这样就不会发起真实请求
                config.adapter = () => Promise.resolve(fakeResponse);
            }
        }

        return config;
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
    getLabInfo: async () => {
        if (await checkStaticMode()) {
            return loadStaticData('lab-info.json');
        }
        return api.get('/public/lab-info');
    },

    // 获取研究方向
    getResearchAreas: async () => {
        if (await checkStaticMode()) {
            return loadStaticData('research-areas.json');
        }
        return api.get('/public/research-areas');
    },

    // 获取网站配置
    getSiteConfig: async () => {
        if (await checkStaticMode()) {
            return loadStaticData('site-config.json');
        }
        return api.get('/public/site-config');
    },

    // 记录访问（静态模式下不记录）
    logVisit: async (data) => {
        if (await checkStaticMode()) {
            return { success: true, message: '静态模式不记录访问' };
        }
        return api.post('/public/visit-log', data);
    },

    // 获取公开访问统计
    getStatistics: async (params) => {
        if (await checkStaticMode()) {
            return loadStaticData('statistics.json');
        }
        return api.get('/public/statistics', { params });
    },

    // 获取论文列表
    getPublications: async (params) => {
        if (await checkStaticMode()) {
            return loadStaticData('publications.json');
        }
        return api.get('/public/publications', { params });
    },

    // 获取招生信息
    getRecruitment: async () => {
        if (await checkStaticMode()) {
            return loadStaticData('recruitment.json');
        }
        return api.get('/public/recruitment');
    },

    // 获取设备列表
    getEquipment: async (params) => {
        if (await checkStaticMode()) {
            return loadStaticData('equipment.json');
        }
        return api.get('/public/equipment', { params });
    }
}

export const newsApi = {
    // 获取新闻列表
    getList: async (params) => {
        if (await checkStaticMode()) {
            return loadStaticData('news.json');
        }
        return api.get('/news', { params });
    },

    // 获取新闻详情
    getDetail: async (id) => {
        if (await checkStaticMode()) {
            return loadStaticData(`news/${id}.json`);
        }
        return api.get(`/news/${id}`);
    }
}

export const membersApi = {
    // 获取成员列表
    getList: async (params) => {
        if (await checkStaticMode()) {
            return loadStaticData('members.json');
        }
        return api.get('/members', { params });
    },

    // 获取成员详情
    getDetail: async (id) => {
        if (await checkStaticMode()) {
            return loadStaticData(`members/${id}.json`);
        }
        return api.get(`/members/${id}`);
    },

    // 获取成员论文
    getPublications: async (id) => {
        if (await checkStaticMode()) {
            return loadStaticData(`members/${id}-publications.json`);
        }
        return api.get(`/members/${id}/publications`);
    }
}

export const projectsApi = {
    // 获取项目列表
    getList: async (params) => {
        if (await checkStaticMode()) {
            return loadStaticData('projects.json');
        }
        return api.get('/projects', { params });
    },

    // 获取项目详情
    getDetail: async (id) => {
        if (await checkStaticMode()) {
            return loadStaticData(`projects/${id}.json`);
        }
        return api.get(`/projects/${id}`);
    }
}

export const contactApi = {
    // 提交联系表单（静态模式下不可用）
    submit: async (data) => {
        if (await checkStaticMode()) {
            return {
                success: false,
                message: '静态网站不支持留言功能，请通过邮箱或电话联系我们'
            };
        }
        return api.post('/contact/submit', data);
    },

    // 获取实验室信息（用于联系页面）
    getLabInfo: async () => {
        if (await checkStaticMode()) {
            return loadStaticData('lab-info.json');
        }
        return api.get('/lab-info');
    }
}

export default api
