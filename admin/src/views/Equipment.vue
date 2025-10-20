<template>
  <div class="equipment-management">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchForm.search" placeholder="搜索设备名称、型号、厂商..." style="width: 300px" clearable
          @keyup.enter="handleSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-select v-model="searchForm.category" placeholder="选择分类" clearable style="width: 150px"
          @change="handleSearch">
          <el-option label="计算设备" value="计算设备" />
          <el-option label="测试仪器" value="测试仪器" />
          <el-option label="实验器材" value="实验器材" />
          <el-option label="办公设备" value="办公设备" />
        </el-select>

        <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px" @change="handleSearch">
          <el-option label="正常使用" value="active" />
          <el-option label="维修中" value="maintenance" />
          <el-option label="已停用" value="inactive" />
        </el-select>

        <el-button type="primary" @click="handleSearch">
          <el-icon>
            <Search />
          </el-icon>
          搜索
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon>
            <Plus />
          </el-icon>
          添加设备
        </el-button>
      </div>
    </div>

    <!-- 设备列表 -->
    <el-table :data="equipment" v-loading="loading" @sort-change="handleSort" empty-text="暂无设备数据">
      <el-table-column prop="id" label="ID" width="80" sortable="custom" />

      <el-table-column prop="name" label="设备名称" min-width="150" sortable="custom">
        <template #default="{ row }">
          <div class="equipment-cell">
            <img v-if="row.image_url" :src="row.image_url" class="equipment-image" @error="handleImageError" />
            <div class="equipment-info">
              <h4>{{ row.name }}</h4>
              <p>{{ row.model }}</p>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="category" label="分类" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getCategoryTagType(row.category)" size="small">{{ row.category }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="manufacturer" label="厂商" width="150" sortable="custom" />

      <el-table-column prop="location" label="位置" width="120" sortable="custom" />

      <el-table-column prop="purchase_date" label="购买日期" width="120" sortable="custom">
        <template #default="{ row }">
          {{ formatDate(row.purchase_date) }}
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadEquipment" @current-change="loadEquipment" />
    </div>

    <!-- 添加/编辑设备对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入设备名称" maxlength="100" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设备分类" prop="category">
              <el-select v-model="form.category" placeholder="选择分类" style="width: 100%" filterable allow-create>
                <el-option label="计算设备" value="计算设备" />
                <el-option label="测试仪器" value="测试仪器" />
                <el-option label="实验器材" value="实验器材" />
                <el-option label="办公设备" value="办公设备" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设备型号">
              <el-input v-model="form.model" placeholder="请输入设备型号" maxlength="100" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="生产厂商">
              <el-input v-model="form.manufacturer" placeholder="请输入生产厂商" maxlength="100" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="设备描述">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入设备描述" maxlength="500"
                show-word-limit />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="技术规格">
              <el-input v-model="form.specifications" type="textarea" :rows="3" placeholder="请输入技术规格"
                maxlength="1000" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="存放位置">
              <el-input v-model="form.location" placeholder="请输入存放位置" maxlength="100" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="购买日期">
              <el-date-picker v-model="form.purchase_date" type="date" placeholder="选择购买日期" style="width: 100%"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设备价格">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" placeholder="设备价格（元）" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="form.contact_person" placeholder="负责人姓名" maxlength="50" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="使用说明">
              <el-input v-model="form.usage_notes" type="textarea" :rows="3" placeholder="请输入使用说明和注意事项"
                maxlength="1000" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设备图片">
              <el-upload ref="uploadRef" :auto-upload="false" :limit="1" accept="image/*" :on-change="handleImageChange"
                :on-remove="handleImageRemove" :file-list="imageList" list-type="picture-card">
                <el-icon>
                  <Plus />
                </el-icon>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传图片文件，且不超过5MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="active">正常使用</el-radio>
                <el-radio label="maintenance">维修中</el-radio>
                <el-radio label="inactive">已停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="排序权重">
              <el-input-number v-model="form.sort_order" :min="0" style="width: 100%" placeholder="数值越大排序越靠前" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialogMode === 'create' ? '创建' : '更新' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { equipmentApi } from '@/utils/api'
import {
  Search, Plus, Edit, Delete
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const equipment = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('create') // create | edit
const currentId = ref(null)
const formRef = ref()
const uploadRef = ref()
const imageList = ref([])

// 搜索表单
const searchForm = reactive({
  search: '',
  category: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 排序数据
const sort = reactive({
  field: 'created_at',
  order: 'DESC'
})

// 表单数据
const form = reactive({
  name: '',
  category: '',
  model: '',
  manufacturer: '',
  description: '',
  specifications: '',
  location: '',
  purchase_date: '',
  price: '',
  contact_person: '',
  usage_notes: '',
  status: 'active',
  sort_order: 0,
  image: null
})

// 对话框标题
const dialogTitle = computed(() => {
  return dialogMode.value === 'create' ? '添加设备' : '编辑设备'
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择设备分类', trigger: 'change' }
  ]
}

// 加载设备列表
const loadEquipment = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: sort.field,
      order: sort.order,
      ...searchForm
    }

    const response = await equipmentApi.getAdminList(params)
    equipment.value = response.data || []

    if (response.pagination) {
      pagination.total = response.pagination.total
      pagination.page = response.pagination.page
      pagination.limit = response.pagination.limit
    }
  } catch (error) {
    console.error('加载设备列表失败:', error)
    ElMessage.error('加载设备列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadEquipment()
}

// 排序处理
const handleSort = ({ prop, order }) => {
  if (prop) {
    sort.field = prop
    sort.order = order === 'ascending' ? 'ASC' : 'DESC'
  } else {
    // 取消排序，恢复默认
    sort.field = 'created_at'
    sort.order = 'DESC'
  }
  loadEquipment()
}

// 创建设备
const handleCreate = () => {
  dialogMode.value = 'create'
  currentId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑设备
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  currentId.value = row.id

  // 填充表单数据
  Object.keys(form).forEach(key => {
    if (key in row) {
      form[key] = row[key]
    }
  })

  // 处理现有图片
  if (row.image_url) {
    imageList.value = [{
      name: '当前图片',
      url: row.image_url
    }]
  }

  dialogVisible.value = true
}

// 删除设备
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await equipmentApi.delete(row.id)
    ElMessage.success('删除成功')
    loadEquipment()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 图片上传处理
const handleImageChange = (file) => {
  form.image = file.raw
}

const handleImageRemove = () => {
  form.image = null
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.src = '/placeholder-equipment.png'
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    // 处理空值，确保空字符串不会被发送到后端
    const submitData = { ...form }

    // 处理日期字段
    if (submitData.purchase_date === '') {
      submitData.purchase_date = null
    }

    // 处理价格字段
    if (submitData.price === '' || submitData.price === null) {
      submitData.price = null
    }

    // 处理排序字段
    if (submitData.sort_order === '' || submitData.sort_order === null) {
      submitData.sort_order = 0
    }

    if (dialogMode.value === 'create') {
      await equipmentApi.create(submitData)
      ElMessage.success('设备创建成功')
    } else {
      await equipmentApi.update(currentId.value, submitData)
      ElMessage.success('设备更新成功')
    }

    dialogVisible.value = false
    loadEquipment()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  imageList.value = []
  form.image = null
  Object.keys(form).forEach(key => {
    if (key === 'status') {
      form[key] = 'active'
    } else if (key === 'sort_order') {
      form[key] = 0
    } else if (key !== 'image') {
      form[key] = ''
    }
  })
}

// 获取分类标签颜色
const getCategoryTagType = (category) => {
  const categoryColorMap = {
    '计算设备': 'primary',   // 蓝色
    '测试仪器': 'success',   // 绿色
    '实验器材': 'warning',   // 橙色
    '办公设备': 'info'       // 灰色
  }
  return categoryColorMap[category] || ''
}

// 获取状态类型

const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    maintenance: 'warning',
    inactive: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '正常使用',
    maintenance: '维修中',
    inactive: '已停用'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  loadEquipment()
})
</script>

<style scoped>
.equipment-management {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.equipment-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.equipment-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
}

.equipment-info h4 {
  margin: 0 0 4px 0;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.equipment-info p {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }

  .toolbar-left,
  .toolbar-right {
    flex-direction: column;
  }

  .toolbar-left .el-input,
  .toolbar-left .el-select {
    width: 100% !important;
  }
}
</style>
