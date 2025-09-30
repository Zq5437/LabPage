<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <!-- 实验室信息 -->
        <div class="footer-section">
          <h3 class="section-title">{{ siteTitle }}</h3>
          <div class="contact-info">
            <div v-if="contactEmail" class="contact-item">
              <i class="icon-email"></i>
              <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
            </div>
            <div v-if="contactPhone" class="contact-item">
              <i class="icon-phone"></i>
              <span>{{ contactPhone }}</span>
            </div>
            <div v-if="labInfo.address" class="contact-item">
              <i class="icon-location"></i>
              <span>{{ labInfo.address }}</span>
            </div>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-section">
          <h3 class="section-title">快速链接</h3>
          <ul class="link-list">
            <li><router-link to="/about">关于我们</router-link></li>
            <li><router-link to="/research">研究方向</router-link></li>
            <li><router-link to="/members">实验室成员</router-link></li>
            <li><router-link to="/projects">研究项目</router-link></li>
            <li><router-link to="/publications">发表论文</router-link></li>
            <li><router-link to="/news">新闻动态</router-link></li>
          </ul>
        </div>

        <!-- 研究方向 -->
        <div class="footer-section">
          <h3 class="section-title">研究方向</h3>
          <ul class="link-list">
            <li v-for="area in (researchAreas || []).slice(0, 6)" :key="area.id">
              <router-link to="/research">{{ area.name }}</router-link>
            </li>
          </ul>
        </div>

        <!-- 更多信息 -->
        <div class="footer-section">
          <h3 class="section-title">更多信息</h3>
          <ul class="link-list">
            <li><router-link to="/recruitment">招生信息</router-link></li>
            <li><router-link to="/equipment">设备资源</router-link></li>
            <li><router-link to="/contact">联系我们</router-link></li>
            <li v-if="labInfo.website">
              <a :href="labInfo.website" target="_blank" rel="noopener">官方网站</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>
            &copy; {{ currentYear }} {{ siteTitle }}. 保留所有权利.
            <span v-if="labInfo.established_year" class="established"> 成立于 {{ labInfo.established_year }} 年</span>
          </p>
        </div>
        <div class="footer-links">
          <a href="#" @click.prevent>隐私政策</a>
          <span class="divider">|</span>
          <a href="#" @click.prevent>使用条款</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'
import { useSiteStore } from '@/stores/site'

export default {
  name: 'SiteFooter',
  setup() {
    const siteStore = useSiteStore()

    const labInfo = computed(() => siteStore.labInfo)
    const siteTitle = computed(() => siteStore.siteTitle)
    const contactEmail = computed(() => siteStore.contactEmail)
    const contactPhone = computed(() => siteStore.contactPhone)
    const researchAreas = computed(() => siteStore.researchAreas)
    const currentYear = new Date().getFullYear()

    return {
      labInfo,
      siteTitle,
      contactEmail,
      contactPhone,
      researchAreas,
      currentYear
    }
  }
}
</script>

<style lang="scss" scoped>
.site-footer {
  background: #1a1a1a;
  color: #e6e6e6;
  padding: 60px 0 20px;
  margin-top: 80px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }
}

.footer-section {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 20px;
    line-height: 1.3;
  }

  .section-desc {
    color: #b3b3b3;
    line-height: 1.6;
    margin-bottom: 20px;
  }
}

.contact-info {
  .contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    color: #b3b3b3;

    @media (max-width: 768px) {
      justify-content: center;
    }

    .icon-email::before,
    .icon-phone::before,
    .icon-location::before {
      content: '';
      width: 16px;
      height: 16px;
      margin-right: 8px;
      background-size: contain;
      flex-shrink: 0;
    }

    .icon-email::before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23b3b3b3' viewBox='0 0 24 24'%3E%3Cpath d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
    }

    .icon-phone::before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23b3b3b3' viewBox='0 0 24 24'%3E%3Cpath d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/%3E%3C/svg%3E");
    }

    .icon-location::before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23b3b3b3' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E");
    }

    a {
      color: inherit;
      transition: color 0.3s ease;

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.link-list {
  li {
    margin-bottom: 8px;

    a {
      color: #b3b3b3;
      font-size: 14px;
      transition: color 0.3s ease;

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #333;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

.copyright {
  p {
    color: #999;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;

    .established {
      margin-left: 4px;
    }
  }
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;

  a {
    color: #999;
    font-size: 13px;
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-color);
    }
  }

  .divider {
    color: #666;
    font-size: 13px;
  }
}
</style>
