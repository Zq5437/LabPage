<template>
  <div class="contact-page">
    <!-- 页面头部 -->
    <div class="contact-header">
      <div class="container">
        <h1>联系我们</h1>
        <p>欢迎与我们取得联系，共同探讨学术合作与交流</p>
      </div>
    </div>

    <div class="container">
      <!-- 联系方式卡片 -->
      <div class="contact-cards">
        <div class="contact-card" v-loading="loading">
          <div class="card-header">
            <el-icon><Location /></el-icon>
            <h3>地址信息</h3>
          </div>
          <div class="card-content">
            <p class="main-info">{{ labInfo.address || '北京市海淀区学院路XX号' }}</p>
            <p class="sub-info">邮编：{{ labInfo.postal_code || '100083' }}</p>
            <p class="sub-info">{{ labInfo.building_info || 'XX楼XX层XX室' }}</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="card-header">
            <el-icon><Phone /></el-icon>
            <h3>电话联系</h3>
          </div>
          <div class="card-content">
            <p class="main-info">{{ labInfo.phone || '+86 010-xxxx-xxxx' }}</p>
            <p class="sub-info">办公时间：周一至周五 9:00-17:00</p>
            <p class="sub-info">传真：{{ labInfo.fax || '+86 010-xxxx-xxxx' }}</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="card-header">
            <el-icon><Message /></el-icon>
            <h3>邮箱联系</h3>
          </div>
          <div class="card-content">
            <p class="main-info">{{ labInfo.email || 'info@lab.edu.cn' }}</p>
            <p class="sub-info">一般咨询：general@lab.edu.cn</p>
            <p class="sub-info">学术合作：academic@lab.edu.cn</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="card-header">
            <el-icon><Connection /></el-icon>
            <h3>在线联系</h3>
          </div>
          <div class="card-content">
            <p class="main-info">{{ labInfo.website || 'www.lab.edu.cn' }}</p>
            <div class="social-links">
              <el-button circle @click="openWeChat">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle @click="openWeibo">
                <el-icon><Share /></el-icon>
              </el-button>
              <el-button circle @click="openLinkedIn">
                <el-icon><Link /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系表单和地图 -->
      <div class="contact-main">
        <!-- 联系表单 -->
        <div class="contact-form-section">
          <h2>发送消息</h2>
          <p class="form-description">
            如果您有任何问题或建议，请通过以下表单联系我们，我们会尽快回复您。
          </p>
          
          <el-form
            ref="contactFormRef"
            :model="contactForm"
            :rules="formRules"
            label-width="80px"
            class="contact-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input
                    v-model="contactForm.name"
                    placeholder="请输入您的姓名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input
                    v-model="contactForm.email"
                    placeholder="请输入您的邮箱"
                    type="email"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="电话" prop="phone">
                  <el-input
                    v-model="contactForm.phone"
                    placeholder="请输入您的电话号码"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机构" prop="organization">
                  <el-input
                    v-model="contactForm.organization"
                    placeholder="请输入您的机构或公司"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="咨询类型" prop="inquiry_type">
              <el-select v-model="contactForm.inquiry_type" placeholder="请选择咨询类型" style="width: 100%">
                <el-option label="学术合作" value="academic" />
                <el-option label="技术咨询" value="technical" />
                <el-option label="招生咨询" value="recruitment" />
                <el-option label="媒体采访" value="media" />
                <el-option label="其他咨询" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="主题" prop="subject">
              <el-input
                v-model="contactForm.subject"
                placeholder="请输入消息主题"
              />
            </el-form-item>

            <el-form-item label="消息内容" prop="message">
              <el-input
                v-model="contactForm.message"
                type="textarea"
                :rows="6"
                placeholder="请详细描述您的问题或需求..."
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="submitting" size="large">
                发送消息
              </el-button>
              <el-button @click="resetForm" size="large">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 地图和位置信息 -->
        <div class="map-section">
          <h2>位置导航</h2>
          <div class="map-container">
            <div class="map-placeholder">
              <el-icon><Location /></el-icon>
              <p>地图加载中...</p>
              <el-button type="primary" @click="openMap">
                在地图中查看
              </el-button>
            </div>
          </div>

          <div class="location-info">
            <h3>交通指南</h3>
            <div class="transport-item">
              <el-icon><Guide /></el-icon>
              <div>
                <h4>地铁</h4>
                <p>4号线/16号线 - 学院路站，A出口步行5分钟</p>
              </div>
            </div>
            <div class="transport-item">
              <el-icon><Truck /></el-icon>
              <div>
                <h4>公交</h4>
                <p>333路、562路、634路 - XX站下车</p>
              </div>
            </div>
            <div class="transport-item">
              <el-icon><Position /></el-icon>
              <div>
                <h4>自驾</h4>
                <p>内部停车场有限，建议使用公共交通</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常见问题 -->
      <div class="faq-section">
        <h2>常见问题</h2>
        <el-collapse v-model="activeFAQ">
          <el-collapse-item
            v-for="(faq, index) in faqs"
            :key="index"
            :title="faq.question"
            :name="index"
          >
            <div class="faq-answer">{{ faq.answer }}</div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 联系团队 -->
      <div class="team-contacts">
        <h2>联系团队</h2>
        <div class="team-grid">
          <div class="team-contact-card">
            <div class="avatar">
              <el-icon><User /></el-icon>
            </div>
            <h3>学术事务</h3>
            <p>负责学术合作、访问学者等事务</p>
            <div class="contact-details">
              <p><el-icon><Message /></el-icon> academic@lab.edu.cn</p>
              <p><el-icon><Phone /></el-icon> +86 010-xxxx-xxxx</p>
            </div>
          </div>

          <div class="team-contact-card">
            <div class="avatar">
              <el-icon><UserFilled /></el-icon>
            </div>
            <h3>招生咨询</h3>
            <p>负责研究生招生、本科生实习等</p>
            <div class="contact-details">
              <p><el-icon><Message /></el-icon> recruitment@lab.edu.cn</p>
              <p><el-icon><Phone /></el-icon> +86 010-xxxx-xxxx</p>
            </div>
          </div>

          <div class="team-contact-card">
            <div class="avatar">
              <el-icon><Service /></el-icon>
            </div>
            <h3>技术支持</h3>
            <p>负责技术咨询、设备使用等</p>
            <div class="contact-details">
              <p><el-icon><Message /></el-icon> tech@lab.edu.cn</p>
              <p><el-icon><Phone /></el-icon> +86 010-xxxx-xxxx</p>
            </div>
          </div>

          <div class="team-contact-card">
            <div class="avatar">
              <el-icon><Management /></el-icon>
            </div>
            <h3>行政事务</h3>
            <p>负责日常行政、财务、后勤等</p>
            <div class="contact-details">
              <p><el-icon><Message /></el-icon> admin@lab.edu.cn</p>
              <p><el-icon><Phone /></el-icon> +86 010-xxxx-xxxx</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import {
  Location, Phone, Message, Connection, ChatDotRound,
  Share, Link, Guide, Truck, Position, User, UserFilled,
  Service, Management
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const contactFormRef = ref()
const activeFAQ = ref([])
const labInfo = ref({})

// 联系表单
const contactForm = reactive({
  name: '',
  email: '',
  phone: '',
  organization: '',
  inquiry_type: '',
  subject: '',
  message: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' }
  ],
  inquiry_type: [
    { required: true, message: '请选择咨询类型', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请输入消息主题', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
    { min: 10, message: '消息内容至少10个字符', trigger: 'blur' }
  ]
}

// 常见问题
const faqs = ref([
  {
    question: '如何申请参观实验室？',
    answer: '您可以通过邮件联系我们(info@lab.edu.cn)提前预约参观时间。我们通常安排在工作日进行参观，需要提前3-5个工作日预约。请在邮件中说明参观目的、人数和期望时间。'
  },
  {
    question: '实验室是否接受访问学者？',
    answer: '我们欢迎国内外学者来访交流。访问学者申请需要提供个人简历、研究计划和推荐信。具体申请流程请联系学术事务负责人(academic@lab.edu.cn)。'
  },
  {
    question: '如何获得技术支持？',
    answer: '对于技术相关问题，您可以联系我们的技术支持团队(tech@lab.edu.cn)。我们提供设备使用指导、技术咨询等服务。紧急技术支持请直接致电技术支持热线。'
  },
  {
    question: '实验室招生政策是什么？',
    answer: '我们每年招收硕士、博士研究生和博士后研究人员。具体招生信息请查看招生信息页面，或联系招生负责人(recruitment@lab.edu.cn)获取最新的招生政策和要求。'
  },
  {
    question: '如何建立合作关系？',
    answer: '我们欢迎与高校、企业、科研院所建立合作关系。请通过邮件(academic@lab.edu.cn)联系我们，详细说明合作意向、合作内容和期望的合作模式。'
  }
])

// 加载实验室信息
const loadLabInfo = async () => {
  try {
    loading.value = true
    const response = await api.get('/lab-info/info')
    if (response.data) {
      labInfo.value = response.data.data || {}
    }
  } catch (error) {
    console.error('加载实验室信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  try {
    const valid = await contactFormRef.value.validate()
    if (!valid) return

    submitting.value = true

    // 构建邮件内容
    const emailSubject = encodeURIComponent(`[网站联系] ${contactForm.subject}`)
    const emailBody = encodeURIComponent(`姓名：${contactForm.name}
邮箱：${contactForm.email}
电话：${contactForm.phone}
机构：${contactForm.organization}
咨询类型：${getInquiryTypeName(contactForm.inquiry_type)}

消息内容：
${contactForm.message}

---
此消息来自实验室官网联系表单`)

    // 打开邮件客户端
    const emailLink = `mailto:info@lab.edu.cn?subject=${emailSubject}&body=${emailBody}`
    window.open(emailLink, '_self')

    ElMessage.success('邮件客户端已打开，请确认发送')
    resetForm()
  } catch (error) {
    ElMessage.error('发送失败，请直接通过邮箱联系我们')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  contactFormRef.value?.resetFields()
}

// 获取咨询类型名称
const getInquiryTypeName = (type) => {
  const typeMap = {
    'academic': '学术合作',
    'technical': '技术咨询',
    'recruitment': '招生咨询',
    'media': '媒体采访',
    'other': '其他咨询'
  }
  return typeMap[type] || type
}

// 打开地图
const openMap = () => {
  // 使用百度地图或高德地图
  const address = encodeURIComponent(labInfo.value.address || '北京市海淀区学院路')
  window.open(`https://map.baidu.com/search/${address}`, '_blank')
}

// 社交媒体链接
const openWeChat = () => {
  ElMessage.info('微信号：Lab_WeChat_Official')
}

const openWeibo = () => {
  window.open('https://weibo.com/lab_official', '_blank')
}

const openLinkedIn = () => {
  window.open('https://linkedin.com/company/lab-official', '_blank')
}

// 初始化
onMounted(() => {
  loadLabInfo()
})
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.contact-header {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
}

.contact-header h1 {
  font-size: 3rem;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.contact-header p {
  font-size: 1.3rem;
  margin: 0;
  opacity: 0.95;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 联系方式卡片 */
.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin: 50px 0 80px;
}

.contact-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-header .el-icon {
  font-size: 1.8rem;
  color: #48bb78;
}

.card-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.main-info {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.sub-info {
  color: #666;
  margin: 5px 0;
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* 主要内容区域 */
.contact-main {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 60px;
  margin-bottom: 80px;
}

.contact-form-section h2,
.map-section h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.form-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.contact-form {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.map-section {
  position: sticky;
  top: 30px;
  height: fit-content;
}

.map-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.map-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #666;
  gap: 15px;
}

.map-placeholder .el-icon {
  font-size: 3rem;
  color: #48bb78;
}

.location-info {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.location-info h3 {
  color: #2c3e50;
  margin: 0 0 25px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.transport-item {
  display: flex;
  gap: 15px;
  margin: 20px 0;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.transport-item:last-child {
  border-bottom: none;
}

.transport-item .el-icon {
  font-size: 1.5rem;
  color: #48bb78;
  margin-top: 2px;
}

.transport-item h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 1rem;
}

.transport-item p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 常见问题 */
.faq-section {
  margin: 80px 0;
}

.faq-section h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  text-align: center;
  margin: 0 0 50px 0;
  font-weight: 600;
}

.faq-answer {
  color: #666;
  line-height: 1.7;
  padding: 15px 0;
}

/* 联系团队 */
.team-contacts {
  margin: 80px 0;
}

.team-contacts h2 {
  font-size: 2.2rem;
  color: #2c3e50;
  text-align: center;
  margin: 0 0 50px 0;
  font-weight: 600;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.team-contact-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.team-contact-card:hover {
  transform: translateY(-5px);
}

.avatar {
  width: 80px;
  height: 80px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 2rem;
}

.team-contact-card h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.team-contact-card > p {
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.contact-details {
  text-align: left;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.contact-details p {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  margin: 8px 0;
  font-size: 0.9rem;
}

.contact-details .el-icon {
  color: #48bb78;
}

@media (max-width: 768px) {
  .contact-header h1 {
    font-size: 2.2rem;
  }

  .contact-header p {
    font-size: 1.1rem;
  }

  .contact-cards {
    grid-template-columns: 1fr;
    gap: 20px;
    margin: 30px 0 50px;
  }

  .contact-main {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .map-section {
    position: static;
  }

  .contact-form {
    padding: 30px 20px;
  }

  .team-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .transport-item {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .contact-form {
    padding: 20px 15px;
  }
  
  .location-info {
    padding: 20px;
  }
  
  .team-contact-card {
    padding: 30px 20px;
  }
}
</style>