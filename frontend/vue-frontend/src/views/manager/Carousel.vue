<template>
  <div>

    <div class="card" style="margin-bottom: 10px;">
      <el-input v-model="data.name" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入名称查询"></el-input>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="info" style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <div class="card" style="margin-bottom: 10px">
      <div style="margin-bottom: 10px">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="goodsName" label="商品名称"/>
        <el-table-column prop="mediaType" label="媒体类型">
          <template #default="scope">
            <el-tag :type="scope.row.mediaType === 'video' ? 'danger' : 'success'">
              {{ scope.row.mediaType === 'video' ? '视频' : '图片' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="img" label="推荐媒体">
          <template #default="scope">
            <!-- 判断媒体类型并相应显示 -->
            <template v-if="scope.row.mediaType === 'video'">
              <video :src="scope.row.img" style="width: 100px; height: 100px" controls></video>
            </template>
            <template v-else>
              <el-image v-if="scope.row.img" :src="scope.row.img" :preview-src-list="[scope.row.img]" preview-teleported
                        style="width: 100px; height: 100px"></el-image>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="margin-top: 15px" v-if="data.total">
      <el-pagination small @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total"/>
    </div>

    <el-dialog v-model="data.formVisible" title="轮播图信息" width="40%" destroy-on-close>
      <el-form :model="data.form" ref="formRef" :rules="data.rules" label-width="70px" style="padding: 20px">
        <el-form-item label="商品" prop="goodsId">
          <el-select v-model="data.form.goodsId" style="width: 100%" @change="handleGoodsChange">
            <el-option v-for="item in data.goodsList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="媒体类型" prop="mediaType">
          <el-select v-model="data.form.mediaType" style="width: 100%" disabled>
            <el-option label="图片" value="image"></el-option>
            <el-option label="视频" value="video"></el-option>
          </el-select>
          <div class="form-tip">媒体类型将根据您选择的媒体自动设置</div>
        </el-form-item>

        <el-form-item label="选择媒体" prop="img">
          <el-button type="primary" @click="openMediaSelector" :disabled="!data.form.goodsId">
            从媒体库选择
          </el-button>
          <div v-if="data.form.img" style="margin-top: 10px;">
            <!-- 显示已选媒体预览 -->
            <template v-if="data.form.mediaType === 'video'">
              <video :src="data.form.img" style="width: 200px; max-height: 150px;" controls></video>
            </template>
            <template v-else>
              <el-image :src="data.form.img" style="width: 200px; max-height: 150px;"></el-image>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="data.formVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 媒体选择器对话框 -->
    <el-dialog v-model="mediaDialogVisible" title="选择媒体" width="60%" destroy-on-close>
      <div class="media-filter" style="margin-bottom: 15px;">
        <el-radio-group v-model="mediaFilterType" @change="filterMedia">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="image">图片</el-radio-button>
          <el-radio-button label="video">视频</el-radio-button>
        </el-radio-group>
      </div>
      
      <div>
        <el-row :gutter="20">
          <el-col
            v-for="media in filteredMediaList"
            :key="media.id"
            :span="8"
            style="text-align: center; margin-bottom: 20px;"
          >
            <!-- 如果是图片 -->
            <div 
              :class="['media-item', {'selected': selectedMediaId === media.id}]" 
              @click="selectMedia(media)"
              style="border: 2px solid transparent; padding: 5px; cursor: pointer;"
              :style="{'border-color': selectedMediaId === media.id ? '#409EFF' : 'transparent'}"
            >
              <el-image
                v-if="media.mediaType === 'image'"
                :src="media.url"
                style="width: 160px; height: 160px; object-fit: cover;"
              />
              <!-- 如果是视频 -->
              <video
                v-else-if="media.mediaType === 'video'"
                :src="media.url"
                width="160"
                height="160"
                controls
                style="background: #000; object-fit: cover;"
              ></video>
              <div style="margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <el-tag size="small" :type="media.mediaType === 'video' ? 'danger' : 'success'" style="margin-right: 5px;">
                  {{ media.mediaType === 'video' ? '视频' : '图片' }}
                </el-tag>
                {{ media.url.split('/').pop() }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-if="filteredMediaList.length === 0" style="text-align: center; padding: 20px;">
        <p v-if="mediaList.length === 0">该商品暂无媒体，请先在商品管理页面上传媒体</p>
        <p v-else>没有符合筛选条件的媒体</p>
      </div>
      <template #footer>
        <el-button @click="mediaDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelectMedia" :disabled="selectedMediaId === null">确认选择</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import {reactive, ref, computed} from "vue"
import request from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import { useRoute } from "vue-router";

const route = useRoute();
const baseApi = '/carousel'
const formRef = ref()

const siteId = route.params.siteId;

// 媒体选择器相关状态
const mediaDialogVisible = ref(false)
const mediaList = ref([])
const selectedMediaId = ref(null)
const selectedMedia = ref(null)
const mediaFilterType = ref('all')

// 筛选后的媒体列表
const filteredMediaList = computed(() => {
  if (mediaFilterType.value === 'all') {
    return mediaList.value
  }
  return mediaList.value.filter(item => item.mediaType === mediaFilterType.value)
})

// 筛选媒体
const filterMedia = (type) => {
  mediaFilterType.value = type
}

const data = reactive({
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  tableData: [],
  total: 0,
  pageNum: 1,  // 当前的页码
  pageSize: 5,  // 每页的个数
  formVisible: false,
  form: {
    mediaType: 'image' // 默认媒体类型
  },
  ids: [],
  name: '',
  roles: [],
  rules: {
    goodsId: [
      { required: true, message: '请选择商品', trigger: 'blur' }
    ],
    img: [
      { required: true, message: '请选择媒体', trigger: 'blur' }
    ],
    mediaType: [
      { required: true, message: '媒体类型不能为空', trigger: 'blur' }
    ]
  },
  goodsList: [],
})

// 打开媒体选择器
const openMediaSelector = () => {
  if (!data.form.goodsId) {
    ElMessage.warning('请先选择商品')
    return
  }
  
  selectedMediaId.value = null
  selectedMedia.value = null
  mediaFilterType.value = 'all'
  loadMediaList(data.form.goodsId)
  mediaDialogVisible.value = true
}

// 加载商品的媒体列表
const loadMediaList = (goodsId) => {
  request.get(`/media/goods/${goodsId}`).then((res) => {
    if (res.code === '200') {
      mediaList.value = res.data || []
      // 预选择当前设置的媒体
      if (data.form.img) {
        const found = mediaList.value.find(item => item.url === data.form.img)
        if (found) {
          selectedMediaId.value = found.id
          selectedMedia.value = found
        }
      }
    } else {
      ElMessage.error(res.msg || '加载媒体列表失败')
    }
  })
}

// 选择媒体
const selectMedia = (media) => {
  selectedMediaId.value = media.id
  selectedMedia.value = media
}

// 确认选择媒体
const confirmSelectMedia = () => {
  if (selectedMedia.value) {
    data.form.img = selectedMedia.value.url
    data.form.mediaType = selectedMedia.value.mediaType
    mediaDialogVisible.value = false
    ElMessage.success('已选择媒体')
  }
}

// 商品变更时重置媒体选择
const handleGoodsChange = () => {
  data.form.img = ''
  data.form.mediaType = 'image'
}

// 加载表格数据
const load = () => {
  request.get(baseApi + '/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      name: data.name,
      siteId: siteId
    }
  }).then(res => {
    if (res.data?.list) {
      // 确保每一行数据都有 mediaType 字段
      data.tableData = res.data.list.map(item => {
        // 如果没有 mediaType，根据图片 URL 判断类型
        if (!item.mediaType) {
          const imgUrl = item.img || '';
          item.mediaType = imgUrl.toLowerCase().includes('.mp4') || 
                          imgUrl.toLowerCase().includes('.m3u8') ? 
                          'video' : 'image';
        }
        return item;
      });
    } else {
      data.tableData = [];
    }
    data.total = res.data?.total || 0;
  })
}

const loadGoods = () => {
  request.get('/goods/selectAll',{
    params: {
      siteId: siteId
    }}).then(res =>{
      data.goodsList = res.data
  })
}

// 打开新增弹窗
const handleAdd = () => {
  
  data.form = {
    siteId: Number(siteId),
    mediaType: 'image' // 默认为图片类型
  };
  data.formVisible = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  // 深拷贝行数据
  const rowData = JSON.parse(JSON.stringify(row))
  
  // 确保 mediaType 字段存在
  if (!rowData.mediaType) {
    const imgUrl = rowData.img || '';
    rowData.mediaType = imgUrl.toLowerCase().includes('.mp4') || 
                      imgUrl.toLowerCase().includes('.m3u8') ? 
                      'video' : 'image';
  }
  
  data.form = rowData;
  data.formVisible = true;
}

// 新增
const add = () => {
  // 确保表单数据包含 mediaType 字段
  if (!data.form.mediaType) {
    data.form.mediaType = 'image';
  }
  
  request.post(baseApi + '/add', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('操作成功')
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

// 更新
const update = () => {
  // 确保表单数据包含 mediaType 字段
  if (!data.form.mediaType) {
    data.form.mediaType = 'image';
  }
  
  request.put(baseApi + '/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('更新成功')
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

// 删除
const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗?', '删除确认', { type: 'warning' }).then(res => {
    request.delete(baseApi + '/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {
    console.error(err)
  })
}

// 批量删除
const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning("请选择数据")
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗?', '删除确认', { type: 'warning' }).then(res => {
    request.delete(baseApi + '/delete/batch', {data: data.ids}).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        load()  // 刷新表格数据
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => console.log(err))
}

const save = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (data.form.id) {  // 有id表示数据存在，那么就是更新
        update()
      } else {  // 否则就是新增
        add()
      }
    }
  })
}

const reset = () => {
  data.name = ''
  load()
}

load()
loadGoods()
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.media-item {
  transition: all 0.3s;
  border-radius: 4px;
}

.media-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.selected {
  border-color: #409EFF;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.3);
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 4px;
}
</style>