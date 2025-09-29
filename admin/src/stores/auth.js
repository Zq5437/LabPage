import { defineStore } from 'pinia'
import { adminApi } from '@/utils/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        // 用户信息
        user: null,
        // 登录状态
        isLoggedIn: false,
        // 访问令牌
        token: localStorage.getItem('admin_token') || null,
        // 加载状态
        loading: false
    }),

    getters: {
        // 获取用户名
        username: (state) => state.user?.username || '',

        // 获取用户角色
        userRole: (state) => state.user?.role || '',

        // 是否为超级管理员
        isSuperAdmin: (state) => state.user?.role === 'super_admin',

        // 是否为管理员
        isAdmin: (state) => ['admin', 'super_admin'].includes(state.user?.role)
    },

    actions: {
        // 登录
        async login(credentials) {
            try {
                this.loading = true
                const response = await adminApi.login(credentials)
                // 接口返回结构为 { success, message, data: { token, user } }
                const { token, user } = response?.data || {}

                // 保存令牌和用户信息
                this.token = token
                this.user = user
                this.isLoggedIn = true

                // 保存到本地存储
                localStorage.setItem('admin_token', token)
                localStorage.setItem('admin_user', JSON.stringify(user))

                return { success: true }
            } catch (error) {
                return {
                    success: false,
                    message: error.message || '登录失败'
                }
            } finally {
                this.loading = false
            }
        },

        // 登出
        async logout() {
            try {
                // 调用登出接口
                if (this.token) {
                    await adminApi.logout()
                }
            } catch (error) {
                console.error('登出接口调用失败:', error)
            } finally {
                // 清除本地状态
                this.token = null
                this.user = null
                this.isLoggedIn = false

                // 清除本地存储
                localStorage.removeItem('admin_token')
                localStorage.removeItem('admin_user')
            }
        },

        // 检查认证状态
        async checkAuth() {
            const token = localStorage.getItem('admin_token')
            const userStr = localStorage.getItem('admin_user')

            if (!token || !userStr) {
                return false
            }

            try {
                // 验证令牌是否有效
                const res = await adminApi.getCurrentUser()
                const user = res?.data

                this.token = token
                this.user = user
                this.isLoggedIn = true

                return true
            } catch (error) {
                // 令牌无效，清除本地存储
                this.logout()
                return false
            }
        },

        // 更新用户信息
        updateUser(userData) {
            this.user = { ...this.user, ...userData }
            localStorage.setItem('admin_user', JSON.stringify(this.user))
        },

        // 修改密码
        async changePassword(passwordData) {
            try {
                this.loading = true
                await adminApi.changePassword(passwordData)
                return { success: true, message: '密码修改成功' }
            } catch (error) {
                return {
                    success: false,
                    message: error.message || '密码修改失败'
                }
            } finally {
                this.loading = false
            }
        }
    }
})
