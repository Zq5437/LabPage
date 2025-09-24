<template>
  <div class="admin-header">
    <div class="header-left">
      <!-- 侧边栏切换按钮 -->
      <el-button
        type="text"
        class="sidebar-toggle"
        @click="$emit('toggle-sidebar')"
      >
        <el-icon size="18">
          <Expand v-if="sidebarCollapsed" />
          <Fold v-else />
        </el-icon>
      </el-button>
      
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item
          v-for="item in breadcrumbItems"
          :key="item.path"
          :to="item.path"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="header-right">
      <!-- 快捷操作 -->
      <div class="quick-actions">
        <!-- 前台网站 -->
        <el-tooltip content="访问前台网站" placement="bottom">
          <el-button 
            type="text" 
            class="action-btn"
            @click="openFrontSite"
          >
            <el-icon size="18"><Monitor /></el-icon>
          </el-button>
        </el-tooltip>
        
        <!-- 全屏切换 -->
        <el-tooltip content="全屏" placement="bottom">
          <el-button 
            type="text" 
            class="action-btn"
            @click="toggleFullscreen"
          >
            <el-icon size="18">
              <FullScreen v-if="!isFullscreen" />
              <Aim v-else />
            </el-icon>
          </el-button>
        </el-tooltip>
        
        <!-- 刷新页面 -->
        <el-tooltip content="刷新页面" placement="bottom">
          <el-button 
            type="text" 
            class="action-btn"
            @click="refreshPage"
          >
            <el-icon size="18"><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
      
      <!-- 用户菜单 -->
      <el-dropdown trigger="click" @command="handleUserMenuCommand">
        <div class="user-menu">
          <el-avatar :size="32">
            <el-icon><Avatar /></el-icon>
          </el-avatar>
          <span class="username">{{ username }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="change-password">
              <el-icon><Key /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 修改密码对话框 -->
    <ChangePasswordDialog 
      v-model:visible="passwordDialogVisible" 
      @success="handlePasswordChanged"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFullscreen } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'
import {
  Expand, Fold, Monitor, FullScreen, Aim, Refresh,
  Avatar, ArrowDown, User, Key, SwitchButton
} from '@element-plus/icons-vue'

defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 全屏相关
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

// 用户信息
const username = computed(() => authStore.username)

// 修改密码对话框
const passwordDialogVisible = ref(false)

// 面包屑导航
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const items = []
  
  // 添加首页
  if (route.path !== '/dashboard') {
    items.push({
      path: '/dashboard',
      title: '首页'
    })
  }
  
  // 添加匹配的路由
  matched.forEach(item => {
    if (item.path !== '/') {
      items.push({
        path: item.path,
        title: item.meta.title
      })
    }
  })
  
  return items
})

// 打开前台网站
const openFrontSite = () => {
  window.open('/', '_blank')
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 处理用户菜单命令
const handleUserMenuCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'change-password':
      passwordDialogVisible.value = true
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await authStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

// 密码修改成功处理
const handlePasswordChanged = () => {
  ElMessage.success('密码修改成功')
  passwordDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.admin-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--admin-bg-color);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .sidebar-toggle {
    padding: 8px;
    border-radius: 4px;
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--admin-border-extra-light);
    }
  }
  
  .breadcrumb {
    font-size: 14px;
    
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: var(--admin-text-regular);
        font-weight: 400;
        
        &:hover {
          color: var(--admin-primary-color);
        }
      }
      
      &:last-child {
        .el-breadcrumb__inner {
          color: var(--admin-text-primary);
          font-weight: 500;
        }
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .action-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: var(--admin-text-regular);
    
    &:hover {
      background: var(--admin-border-extra-light);
      color: var(--admin-primary-color);
    }
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--admin-border-extra-light);
  }
  
  .username {
    font-size: 14px;
    font-weight: 500;
    color: var(--admin-text-primary);
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .dropdown-icon {
    font-size: 12px;
    color: var(--admin-text-secondary);
    transition: transform 0.3s ease;
  }
  
  &:hover .dropdown-icon {
    transform: rotate(180deg);
  }
}

// 下拉菜单样式
:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--admin-border-lighter);
  
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    
    .el-icon {
      font-size: 16px;
      color: var(--admin-text-secondary);
    }
    
    &:hover {
      background: var(--admin-border-extra-light);
      color: var(--admin-primary-color);
      
      .el-icon {
        color: var(--admin-primary-color);
      }
    }
    
    &.is-divided {
      border-top: 1px solid var(--admin-border-lighter);
      margin-top: 4px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .admin-header {
    padding: 0 15px;
  }
  
  .header-left {
    gap: 12px;
    
    .breadcrumb {
      display: none;
    }
  }
  
  .quick-actions {
    gap: 4px;
    
    .action-btn {
      width: 32px;
      height: 32px;
    }
  }
  
  .user-menu {
    .username {
      display: none;
    }
  }
}
</style>
