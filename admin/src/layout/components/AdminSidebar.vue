<template>
  <div class="admin-sidebar">
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo-container">
        <el-icon size="32" color="#409EFF">
          <Monitor />
        </el-icon>
        <transition name="fade">
          <div v-show="!collapsed" class="logo-text">
            <h3>管理后台</h3>
            <span>Lab Admin</span>
          </div>
        </transition>
      </div>
    </div>

    <!-- 菜单区域 -->
    <div class="sidebar-menu">
      <el-menu :default-active="activeMenu" :collapse="collapsed" :unique-opened="true" router
        background-color="#001529" text-color="rgba(255, 255, 255, 0.65)" active-text-color="#fff"
        @select="handleMenuSelect">
        <!-- 仪表盘 -->
        <el-menu-item index="/dashboard">
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <!-- 实验室信息 -->
        <el-menu-item index="/lab-info">
          <el-icon>
            <OfficeBuilding />
          </el-icon>
          <template #title>实验室信息</template>
        </el-menu-item>

        <!-- 内容管理 -->
        <el-sub-menu index="content">
          <template #title>
            <el-icon>
              <Document />
            </el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/news">
            <el-icon>
              <Notebook />
            </el-icon>
            <template #title>新闻管理</template>
          </el-menu-item>
          <el-menu-item index="/members">
            <el-icon>
              <User />
            </el-icon>
            <template #title>成员管理</template>
          </el-menu-item>
          <el-menu-item index="/projects">
            <el-icon>
              <Folder />
            </el-icon>
            <template #title>项目管理</template>
          </el-menu-item>
          <el-menu-item index="/publications">
            <el-icon>
              <Reading />
            </el-icon>
            <template #title>论文管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 学术管理 -->
        <el-sub-menu index="academic">
          <template #title>
            <el-icon>
              <TrendCharts />
            </el-icon>
            <span>学术管理</span>
          </template>
          <el-menu-item index="/research-areas">
            <el-icon>
              <Compass />
            </el-icon>
            <template #title>研究方向</template>
          </el-menu-item>
          <el-menu-item index="/recruitment">
            <el-icon>
              <UserFilled />
            </el-icon>
            <template #title>招生管理</template>
          </el-menu-item>
          <el-menu-item index="/equipment">
            <el-icon>
              <Monitor />
            </el-icon>
            <template #title>设备管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 联系留言 -->
        <el-menu-item index="/contact-messages">
          <el-icon>
            <ChatDotRound />
          </el-icon>
          <template #title>联系留言</template>
        </el-menu-item>

        <!-- 系统管理 -->
        <el-sub-menu index="system" v-if="isSuperAdmin">
          <template #title>
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/settings">
            <el-icon>
              <Tools />
            </el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 用户信息 -->
    <div class="sidebar-footer">
      <div class="user-info" :class="{ collapsed }">
        <el-avatar :size="32">
          <el-icon>
            <Avatar />
          </el-icon>
        </el-avatar>
        <transition name="fade">
          <div v-show="!collapsed" class="user-details">
            <div class="username">{{ username }}</div>
            <div class="role">{{ userRoleText }}</div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Monitor, DataAnalysis, OfficeBuilding, Document, Notebook,
  User, Folder, Reading, TrendCharts, Compass, UserFilled,
  Setting, Tools, Avatar, ChatDotRound
} from '@element-plus/icons-vue'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const authStore = useAuthStore()

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 用户信息
const username = computed(() => authStore.username)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

// 用户角色文本
const userRoleText = computed(() => {
  const role = authStore.userRole
  const roleMap = {
    'super_admin': '超级管理员',
    'admin': '管理员'
  }
  return roleMap[role] || '用户'
})

// 菜单选择处理
const handleMenuSelect = (index) => {
  console.log('Selected menu:', index)
}
</script>

<style lang="scss" scoped>
.admin-sidebar {
  height: 100vh;
  background: #001529;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  height: var(--admin-header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1e3a5f;

  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;

    .logo-text {
      color: #fff;

      h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        line-height: 1.2;
      }

      span {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.65);
        line-height: 1.2;
      }
    }
  }
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  .el-menu {
    border-right: none;

    .el-menu-item {
      &:hover {
        background-color: #1c3a5e !important;
      }

      &.is-active {
        background-color: #1890ff !important;

        &::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #fff;
        }
      }
    }

    .el-sub-menu {
      .el-sub-menu__title {
        &:hover {
          background-color: #1c3a5e !important;
        }
      }

      .el-menu {
        background-color: #000c17;

        .el-menu-item {
          padding-left: 60px !important;

          &:hover {
            background-color: #1c3a5e !important;
          }

          &.is-active {
            background-color: #1890ff !important;
          }
        }
      }
    }
  }

  // 折叠状态下的样式
  .el-menu--collapse {
    .el-sub-menu {
      .el-sub-menu__title {
        padding: 0 20px !important;
      }
    }

    .el-menu-item {
      padding: 0 20px !important;
    }
  }
}

.sidebar-footer {
  border-top: 1px solid #1e3a5f;
  padding: 16px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.65);

    &.collapsed {
      justify-content: center;
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .username {
        font-size: 14px;
        font-weight: 500;
        color: #fff;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .role {
        font-size: 12px;
        line-height: 1.2;
        margin-top: 2px;
      }
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 滚动条样式
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #001529;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #1e3a5f;
  border-radius: 2px;

  &:hover {
    background: #2c5282;
  }
}
</style>
