/**
 * URL 工具函数
 * 用于处理静态资源路径，自动适配不同的基础路径
 */

// 获取基础路径
const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * 获取完整的资源 URL
 * @param {string} path - 资源路径，如 '/uploads/xxx.jpg'
 * @returns {string} 完整的 URL
 */
export function getAssetUrl(path) {
    if (!path) return '';

    // 如果已经是完整 URL（http/https），直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // 如果路径以 / 开头，说明是绝对路径
    if (path.startsWith('/')) {
        // 如果基础路径是 /，直接返回原路径
        if (BASE_URL === '/') {
            return path;
        }
        // 否则，去掉路径开头的 /，然后拼接基础路径
        return BASE_URL + path.slice(1);
    }

    // 相对路径，直接拼接
    return BASE_URL + path;
}

/**
 * 批量处理对象中的图片 URL
 * @param {Object} obj - 包含图片 URL 的对象
 * @param {string[]} fields - 需要处理的字段名数组
 * @returns {Object} 处理后的对象
 */
export function processImageUrls(obj, fields = ['avatar', 'image_url', 'cover_image', 'banner_url', 'logo_url']) {
    if (!obj) return obj;

    const processed = { ...obj };

    fields.forEach(field => {
        if (processed[field]) {
            processed[field] = getAssetUrl(processed[field]);
        }
    });

    // 处理 images 数组
    if (Array.isArray(processed.images)) {
        processed.images = processed.images.map(img => getAssetUrl(img));
    }

    return processed;
}

export default {
    getAssetUrl,
    processImageUrls
};

