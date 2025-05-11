<template>
  <div>
    <!-- 顶部搜索栏 -->
    <div class="card" style="margin-bottom: 10px;">
      <el-input
        v-model="data.name"
        prefix-icon="Search"
        style="width: 240px; margin-right: 10px"
        placeholder="请输入名称查询"
      />
      <el-select
        v-model="data.categoryId"
        style="width: 240px; margin-right: 10px"
        placeholder="请选择分类"
      >
        <el-option
          v-for="item in data.categoryList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="info" style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <!-- 商品表格 -->
    <div class="card" style="margin-bottom: 10px">
      <div style="margin-bottom: 10px">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" @click="delBatch">批量删除</el-button>
      </div>

      <div class="box" style="margin-bottom: 5px">
        <el-table :data="data.tableData" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />

          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="categoryName" label="商品分类" width="100" />
          <el-table-column prop="originPrice" label="原价" width="80" />
          <el-table-column prop="store" label="库存" width="80" />

          <el-table-column prop="img" label="封面图片">
            <template #default="scope">
              <el-image v-if="scope.row.img" :src="scope.row.img" :preview-src-list="[scope.row.img]" preview-teleported
                        style="width: 100px; height: 100px"></el-image>
            </template>
          </el-table-column>

          <!-- 折扣信息 - 两列组合 -->
          <el-table-column label="折扣信息">
            <el-table-column prop="hasDiscount" label="是否折扣" width="100">
              <template #default="scope">
                <strong v-if="scope.row.hasDiscount" style="color: red">是</strong>
                <span v-else>否</span>
              </template>
            </el-table-column>
            <el-table-column prop="discountPrice" label="折扣价" width="100" />
          </el-table-column>

          <!-- 秒杀信息 - 整合为一组 -->
          <el-table-column label="秒杀信息">
            <el-table-column prop="hasFlash" label="是否秒杀" width="100">
              <template #default="scope">
                <strong v-if="scope.row.hasFlash" style="color: red">是</strong>
                <span v-else>否</span>
              </template>
            </el-table-column>
            <el-table-column prop="flashPrice" label="秒杀价" width="100" />
            <el-table-column prop="flashNum" label="秒杀名额" width="100" />
            <el-table-column prop="flashTime" label="秒杀截止时间" width="180" show-overflow-tooltip />
          </el-table-column>
          
          <el-table-column prop="content" label="商品详情" width="120">
            <template #default="scope">
              <el-button plain type="primary" @click="preview(scope.row.content)">查看详情</el-button>
            </template>
          </el-table-column>

          <el-table-column prop="date" label="上架日期" show-overflow-tooltip width="150" />

          <!-- 操作列 -->
          <el-table-column label="操作" header-align="center" width="380">
            <template #default="scope">
              <el-button type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" plain @click="del(scope.row.id)">删除</el-button>
              <!-- 查看媒体按钮 -->
              <el-button plain @click="viewMedia(scope.row)">查看媒体</el-button>
              <!-- 新增价格计算器按钮 -->
              <el-button type="success" plain @click="openPriceCalculator(scope.row)">价格计算器</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分页 -->
    <div style="margin-top: 15px" v-if="data.total">
      <el-pagination
        small
        @current-change="load"
        background
        layout="prev, pager, next"
        :page-size="data.pageSize"
        v-model:current-page="data.pageNum"
        :total="data.total"
      />
    </div>

    <!-- 新增 / 编辑商品 对话框 -->
    <el-dialog v-model="data.formVisible" title="商品信息" width="50%" destroy-on-close>
      <el-form :model="data.form" ref="formRef" :rules="data.rules" label-width="100px" style="padding: 20px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="data.form.name" placeholder="商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="data.form.categoryId" style="width: 100%">
            <el-option
              v-for="item in data.categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- 添加URL字段 -->
        <el-form-item label="URL" prop="url">
          <el-input 
            v-model="data.form.url" 
            placeholder="请输入商品URL" 
          />
        </el-form-item>
        
        <!-- 添加商品类型字段 -->
        <el-form-item label="商品类型" prop="type">
          <el-input 
            v-model="data.form.type" 
            placeholder="请输入类型，多个类型用分号(;)分隔" 
          />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            示例：运动;户外;夏季 （多个类型之间用分号分隔，系统会自动去除空格）
          </div>
        </el-form-item>
        
        <el-form-item label="封面图片" prop="img">
          <el-upload 
            :action="fileUploadUrl" 
            :headers="{ headlesscmstoken: data.user.token }" 
            :on-success="handleImgSuccess"
            :before-upload="beforeUploadCover"
          >
            <el-button type="primary">上传封面图片</el-button>
          </el-upload>
        </el-form-item>
        
        <!-- 替换原先的上传入口 => 新增两个上传按钮 -->
        <el-form-item label="上传图片">
          <el-upload
            :action="`${uploadMediaUrl}/${data.form.id}`"
            name="file"
            :data="{ mediaType: 'image', siteId: siteId }"
            :headers="{ headlesscmstoken: data.user.token }"
            :on-success="handleMediaSuccess"
            :before-upload="beforeUpload"
            multiple
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="上传视频">
          <el-upload
            :action="`${uploadMediaUrl}/${data.form.id}`"
            name="file"
            :data="{ mediaType: 'video', siteId: siteId }"
            :headers="{ headlesscmstoken: data.user.token }"
            :on-success="handleMediaSuccess"
          >
            <el-button type="primary">上传视频</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="原价" prop="originPrice">
          <el-input-number :min="0" v-model="data.form.originPrice" placeholder="原价" />
        </el-form-item>
        <el-form-item label="库存" prop="store">
          <el-input v-model="data.form.store" placeholder="库存" />
        </el-form-item>
        <el-form-item label="是否折扣" prop="hasDiscount">
          <el-switch v-model="data.form.hasDiscount" />
        </el-form-item>
        <el-form-item label="折扣价" prop="discountPrice" v-if="data.form.hasDiscount">
          <el-input-number :min="0" v-model="data.form.discountPrice" placeholder="折扣价" />
        </el-form-item>

        <el-form-item label="是否秒杀" prop="hasFlash">
          <el-switch v-model="data.form.hasFlash" />
        </el-form-item>
        <div v-if="data.form.hasFlash">
          <el-form-item label="秒杀价" prop="flashPrice">
            <el-input-number :min="0" v-model="data.form.flashPrice" placeholder="秒杀价" />
          </el-form-item>
          <el-form-item label="秒杀名额" prop="flashNum">
            <el-input-number :min="0" v-model="data.form.flashNum" placeholder="秒杀名额" />
          </el-form-item>
          <el-form-item label="秒杀截止时间" prop="flashTime">
            <el-date-picker
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              v-model="data.form.flashTime"
              type="datetime"
              placeholder="秒杀截止时间"
            />
          </el-form-item>
        </div>

        <!-- 富文本编辑器 -->
        <el-form-item label="商品详情" prop="content">
          <div style="border: 1px solid #ccc; width: 100%;">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :mode="mode"
            />
            <Editor
              style="height: 500px; overflow-y: hidden;"
              v-model="data.form.content"
              :mode="mode"
              :defaultConfig="editorConfig"
              @onCreated="handleCreated"
            />
          </div>
          
          <!-- 媒体库快速插入区域 -->
          <div style="margin-top: 15px; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div><strong>媒体库</strong> <span style="color: #999; font-size: 12px;">（点击图片插入或拖拽到编辑器）</span></div>
              <el-button type="primary" size="small" @click="loadCurrentMediaList">刷新媒体库</el-button>
            </div>
            
            <div class="media-gallery" style="display: flex; flex-wrap: wrap; gap: 10px; max-height: 200px; overflow-y: auto;">
              <template v-for="item in editorMediaList" :key="item.id">
                <div 
                  v-if="item && item.mediaType === 'image'"
                  class="media-item" 
                  style="position: relative; cursor: pointer; border: 1px solid #eee; padding: 5px; border-radius: 4px;"
                  @click="insertMediaToEditor(item)"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                >
                  <el-image 
                    :src="item.url" 
                    style="width: 80px; height: 80px; object-fit: cover;" 
                    :preview-src-list="[item.url]"
                  />
                </div>
              </template>
              
              <div v-if="!editorMediaList || editorMediaList.length === 0" style="color: #999; width: 100%; text-align: center; padding: 20px 0;">
                暂无图片，请先上传
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="data.formVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 商品详情预览对话框（仅展示 content）-->
    <el-dialog v-model="data.formVisible1" title="商品详情" width="50%" destroy-on-close>
      <div style="padding: 10px" v-html="data.content"></div>
      <template #footer>
        <el-button type="primary" @click="data.formVisible1 = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 媒体预览对话框：查看/删除商品图片 & 视频 -->
    <el-dialog v-model="mediaDialogVisible" title="商品媒体" width="60%" destroy-on-close>
      <div>
        <!-- 列表渲染 -->
        <el-row :gutter="20">
          <el-col
            v-for="media in mediaList"
            :key="media.id"
            :span="8"
            style="text-align: center; margin-bottom: 20px;"
          >
            <!-- 如果是图片 -->
            <el-image
              v-if="media.mediaType === 'image'"
              :src="media.url"
              style="width: 160px; height: 160px; object-fit: cover;"
              :preview-src-list="[media.url]"
            />
            <!-- 如果是视频 -->
            <video
              v-else-if="media.mediaType === 'video'"
              :ref="el => { if(el) videoRefs[media.id] = el }"
              width="200"
              height="160"
              controls
              style="background: #000;"
            ></video>
            <!-- URL显示和复制功能 -->
            <div style="margin-top: 5px; margin-bottom: 5px;">
              <el-input
                v-model="media.url"
                size="small"
                readonly
                style="margin-bottom: 5px;"
              >
                <template #append>
                  <el-button @click="copyUrl(media.url)">复制</el-button>
                </template>
              </el-input>
            </div>
            <div style="margin-top: 5px;">
              <el-button type="danger" size="small" @click="delMedia(media.id)">删除</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button type="primary" @click="mediaDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref, shallowRef, onMounted} from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import Hls from 'hls.js';
import imageCompression from 'browser-image-compression'; // 引入图片压缩库

// wangEditor5
import "@wangeditor/editor/dist/css/style.css"
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"

import request from "@/utils/request"

const route = useRoute()
const router = useRouter()
const videoRefs = ref({});

/** ========== 1. 基础常量与数据 ========== **/
const baseApi = "/goods"
const fileUploadUrl = import.meta.env.VITE_BASE_URL + "/files/upload" // 你原本的上传地址
const uploadMediaUrl = import.meta.env.VITE_BASE_URL + "/files/uploadMedia" 
const siteId = route.params.siteId

const formRef = ref()

function initializeVideos() {
  // 延迟一帧确保DOM已更新
  setTimeout(() => {
    mediaList.value.forEach(media => {
      if (media.mediaType === 'video' && videoRefs.value[media.id]) {
        const videoEl = videoRefs.value[media.id];
        const videoUrl = media.url
        
        console.log('正在初始化视频:', media.id, videoUrl);
        
        if (Hls.isSupported()) {
          try {
            const hls = new Hls({
              debug: true,  // 启用调试日志
              xhrSetup: function(xhr) {
                // 可以在这里为每个 XHR 请求设置头
                xhr.setRequestHeader('headlesscmstoken', data.user.token);
              }
            });
            
            hls.attachMedia(videoEl);
            hls.on(Hls.Events.MEDIA_ATTACHED, function() {
              console.log('HLS: 媒体附加成功');
              hls.loadSource(videoUrl);
            });
            
            hls.on(Hls.Events.ERROR, function(event, data) {
              console.error('HLS 错误:', event, data);
              if (data.fatal) {
                switch(data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('HLS 致命网络错误，尝试恢复...');
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error('HLS 媒体错误，尝试恢复...');
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error('无法恢复的HLS错误');
                    hls.destroy();
                    break;
                }
              }
            });
          } catch (e) {
            console.error('HLS初始化错误:', e);
          }
        } else {
          console.warn('浏览器不支持HLS.js');
          // 尝试原生支持
          videoEl.src = videoUrl;
        }
      }
    });
  }, 0);
}

// 核心数据
const data = reactive({
  user: JSON.parse(localStorage.getItem("user") || "{}"),

  tableData: [],     // 商品列表
  categoryList: [],  // 分类下拉
  fileList: [],      // 原先的图片 fileList
  name: "",          // 搜索名称
  categoryId: null,  // 搜索分类ID

  total: 0,          // 总记录数
  pageNum: 1,        // 当前页
  pageSize: 5,       // 每页大小

  formVisible: false, // 控制商品编辑对话框可见性
  formVisible1: false,// 控制商品详情预览对话框可见性
  form: {},          // 商品表单

  // 校验规则
  rules: {
    name: [
      { required: true, message: "请输入商品名称", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "请选择分类", trigger: "blur" }
    ],
    originPrice: [
      { required: true, message: "请输入原价", trigger: "blur" }
    ],
    store: [
      { required: true, message: "请输入库存", trigger: "blur" }
    ]
  },

  content: "" // 用于预览商品详情
})

/** ========== 2. wangEditor5 初始化 ========== **/
const editorRef = shallowRef() // 编辑器实例
const mode = "default"
const editorConfig = { MENU_CONF: {} }

// 配置 wangEditor 的图片上传
editorConfig.MENU_CONF["uploadImage"] = {
  headers: {
    headlesscmstoken: data.user.token
  },
  server: import.meta.env.VITE_BASE_URL + "/files/wang/upload",
  fieldName: "file"
}

// 编辑器媒体库功能
const editorMediaList = ref([])
const mediaDialogVisible = ref(false)
const mediaList = ref([])
const currentGoodsId = ref(null)

// 加载当前商品的媒体库
function loadCurrentMediaList() {
  if (!data.form.id) {
    ElMessage.warning('请先保存商品，再使用媒体库功能')
    return
  }
  
  console.log('正在加载媒体库，商品ID:', data.form.id)
  // 初始化为空数组，确保在加载过程中视图不会出错
  editorMediaList.value = [] 
  
  request.get(`/media/goods/${data.form.id}`).then((res) => {
    if (res.code === "200") {
      console.log('媒体库数据获取成功:', res.data)
      // 过滤掉所有非法值，确保每个元素都是有效对象
      const validItems = Array.isArray(res.data) ? 
        res.data.filter(item => item && typeof item === 'object') : []
      editorMediaList.value = validItems
      
      // 调试输出有效图片数量
      const imageCount = validItems.filter(item => item.mediaType === 'image').length
      console.log(`加载成功：共${validItems.length}个媒体，其中${imageCount}张图片`)
    } else {
      console.error('媒体库数据获取失败:', res.msg)
      editorMediaList.value = []
    }
  }).catch(err => {
    console.error('加载媒体库出错：', err)
    editorMediaList.value = []
  })
}

// 将图片插入到编辑器
function insertMediaToEditor(media) {
  const editor = editorRef.value
  if (editor && media && media.mediaType === 'image') {
    editor.insertImage({
      url: media.url,
      alt: '商品图片',
      href: media.url
    })
    ElMessage.success('图片已插入')
  }
}

// 处理拖拽事件
function handleDragStart(event, media) {
  if (media && media.mediaType === 'image') {
    // 设置拖拽数据
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'image',
      url: media.url
    }))
    
    // 创建一个自定义事件处理拖放到编辑器
    const handleDrop = (e) => {
      const editor = editorRef.value
      if (editor) {
        editor.insertImage({
          url: media.url,
          alt: '商品图片',
          href: media.url
        })
        ElMessage.success('图片已拖拽插入')
      }
      document.removeEventListener('drop', handleDrop)
    }
    
    document.addEventListener('drop', handleDrop, { once: true })
  }
}

// 复制URL到剪贴板
function copyUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('URL已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor
  
  // 检查是否已有商品ID，如有则加载媒体库
  if (data.form.id) {
    loadCurrentMediaList()
  }
  
  // 添加拖拽处理逻辑
  editor.on('drop', (e) => {
    // 编辑器自带的拖拽处理已经很好，所以这里不需要额外处理
    console.log('编辑器内部拖拽事件', e)
  })
}

/** ========== 3. 页面加载 - 查询商品列表 & 分类 ========== **/
function load() {
  request
    .get(baseApi + "/selectPageOrderById", {
      params: {
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        name: data.name,
        categoryId: data.categoryId,
        siteId: siteId
      }
    })
    .then((res) => {
      data.tableData = res.data?.list || []
      data.total = res.data?.total || 0
    })
}

function loadCategory() {
  request
    .get("/category/selectAll", { params: { siteId } })
    .then((res) => {
      data.categoryList = res.data
    })
}


/** ========== 4. 商品的增删改查逻辑 ========== **/
// 点击新增
function handleAdd() {
  data.form = {
    siteId: Number(siteId),
    hasDiscount: false,
    hasFlash: false,
    url: ''
  }
  data.formVisible = true
}

// 点击编辑
function handleEdit(row) {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
  
  // 编辑时尝试预加载媒体库
  if (data.form.id) {
    setTimeout(() => {
      loadCurrentMediaList()
    }, 500) // 延迟加载以确保编辑器已初始化
  }
}

// 保存（新增或更新）
function save() {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (data.form.id) {
      update()
    } else {
      add()
    }
  })
}

function add() {
  // 处理type字段，以分号分隔并去除空格
  if (data.form.type) {
    data.form.type = formatTypeField(data.form.type)
  }
  
  request.post(baseApi + "/add", data.form).then((res) => {
    if (res.code === "200") {
      ElMessage.success("操作成功")
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

function handleMediaSuccess(res, file) {
  if (res.code === "200") {
    ElMessage.success("上传成功")
    // 如果想立即在对话框"查看媒体"里看到最新内容
    // => 立刻调接口刷新 mediaList
    if (data.form.id) {
      loadMediaList(data.form.id)
      loadCurrentMediaList() // 同时更新编辑器的媒体库
    }
  } else {
    ElMessage.error("上传失败：" + res.msg)
  }
}

function update() {
  // 处理type字段，以分号分隔并去除空格
  if (data.form.type) {
    data.form.type = formatTypeField(data.form.type)
  }
  
  request.put(baseApi + "/update", data.form).then((res) => {
    if (res.code === "200") {
      ElMessage.success("更新成功")
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg)
    }
  })
}

// 删除单个商品
function del(id) {
  ElMessageBox.confirm("删除后数据无法恢复，确定删除吗?", "删除确认", { type: "warning" })
    .then(() => {
      request.delete(baseApi + "/delete/" + id).then((res) => {
        if (res.code === "200") {
          ElMessage.success("删除成功")
          load()
        } else {
          ElMessage.error(res.msg)
        }
      })
    })
    .catch(() => {})
}

// 批量删除
function handleSelectionChange(rows) {
  data.ids = rows.map((v) => v.id)
}

function delBatch() {
  if (!data.ids || !data.ids.length) {
    ElMessage.warning("请选择数据")
    return
  }
  ElMessageBox.confirm("删除后数据无法恢复，确定批量删除吗?", "删除确认", { type: "warning" })
    .then(() => {
      request.delete(baseApi + "/delete/batch", { data: data.ids }).then((res) => {
        if (res.code === "200") {
          ElMessage.success("操作成功")
          load()
        } else {
          ElMessage.error(res.msg)
        }
      })
    })
    .catch(() => {})
}

/** ========== 5. 商品详情预览 ========== **/
function preview(content) {
  data.content = content
  data.formVisible1 = true
}

/** ========== 6. 上传图片成功回调 (旧接口) ========== **/
function handleImgSuccess(res, file) {
  if (res.code === "200") {
    const imgUrl = res.data // 后端返回的图片 URL
    data.form.img = imgUrl
    data.fileList.push({ name: file.name, url: imgUrl })
    ElMessage.success("封面图片上传成功！")
  } else {
    ElMessage.error("封面图片上传失败：" + res.msg)
  }
}

// 封面图片上传前的处理（包含压缩与格式转换）
function beforeUploadCover(file) {
  const isValidFormat = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp"
  
  if (!isValidFormat) {
    ElMessage.error("上传图片只能是 JPG/PNG/WebP 格式！")
    return false
  }
  
  // 返回一个Promise对象
  return new Promise(async (resolve, reject) => {
    try {
      const originalSizeMB = file.size / 1024 / 1024
      
      // 如果图片小于1MB，则不压缩直接上传
      if (originalSizeMB < 1) {
        ElMessage.success(`图片大小适中(${originalSizeMB.toFixed(2)}MB)，无需压缩`)
        resolve(file)
        return
      }
      
      // 开始处理图片
      ElMessage.info("图片大于1MB，正在压缩处理...")
      
      // 压缩配置
      const options = {
        maxSizeMB: 0.8,         // 压缩目标大小为0.8MB
        maxWidthOrHeight: 1600, // 限制最大宽度或高度
        useWebWorker: true,     // 使用Web Worker加速
        fileType: file.type     // 保持原始文件格式
      }
      
      // 执行压缩
      const compressedFile = await imageCompression(file, options)
      
      // 显示压缩结果信息
      const compressedSizeMB = compressedFile.size / 1024 / 1024
      ElMessage.success(`封面压缩成功: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`)
      
      // 返回压缩后的文件
      resolve(compressedFile)
    } catch (error) {
      console.error('封面图片处理失败:', error)
      ElMessage.error('封面图片处理失败，请重试或选择其他图片')
      reject(error)
    }
  })
}

// 媒体图片上传前的处理（包含压缩与格式转换）
function beforeUpload(file) {
  const isValidFormat = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp"
  
  if (!isValidFormat) {
    ElMessage.error("上传图片只能是 JPG/PNG/WebP 格式！")
    return false
  }
  
  // 只对图片类型进行处理
  if (!file.type.startsWith('image/')) {
    return true; // 非图片类型直接通过
  }
  
  // 返回一个Promise对象
  return new Promise(async (resolve, reject) => {
    try {
      const originalSizeMB = file.size / 1024 / 1024
      
      // 如果图片小于1MB，则不压缩直接上传
      if (originalSizeMB < 1) {
        ElMessage.success(`图片大小适中(${originalSizeMB.toFixed(2)}MB)，无需压缩`)
        resolve(file)
        return
      }
      
      // 开始处理图片
      ElMessage.info("图片大于1MB，正在压缩处理...")
      
      // 压缩配置
      const options = {
        maxSizeMB: 0.8,         // 压缩目标大小为0.8MB
        maxWidthOrHeight: 1600, // 限制最大宽度或高度
        useWebWorker: true,     // 使用Web Worker加速
        fileType: file.type     // 保持原始文件格式
      }
      
      // 执行压缩
      const compressedFile = await imageCompression(file, options)
      
      // 显示压缩结果信息
      const compressedSizeMB = compressedFile.size / 1024 / 1024
      ElMessage.success(`图片压缩成功: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`)
      
      // 返回压缩后的文件
      resolve(compressedFile)
    } catch (error) {
      console.error('图片处理失败:', error)
      ElMessage.error('图片处理失败，请重试或选择其他图片')
      reject(error)
    }
  })
}

/** ========== 7. 查看/删除商品媒体 ========== **/

// 点击「查看媒体」按钮
function viewMedia(row) {
  currentGoodsId.value = row.id
  loadMediaList(row.id)
  
  mediaDialogVisible.value = true
}

function loadMediaList(goodsId) {
  console.log('正在加载媒体列表，商品ID:', goodsId)
  request.get(`/media/goods/${goodsId}`).then((res) => {
    if (res.code === "200") {
      console.log("媒体列表数据:", res.data)
      mediaList.value = Array.isArray(res.data) ? res.data : []
      initializeVideos()
    } else {
      console.error('媒体列表获取失败:', res.msg)
      mediaList.value = []
    }
  }).catch(err => {
    console.error('加载媒体列表出错：', err)
    mediaList.value = []
  })
}

// 删除单个媒体
function delMedia(id) {
  ElMessageBox.confirm("确定删除该媒体吗？", "提示", { type: "warning" })
    .then(() => {
      request.delete(`/media/${id}`).then((res) => {
        if (res.code === "200") {
          ElMessage.success("删除成功")
          // 重新加载该商品的媒体列表
          if (currentGoodsId.value) {
            loadMediaList(currentGoodsId.value)
          }
        } else {
          ElMessage.error(res.msg)
        }
      })
    })
    .catch(() => {})
}

/** ========== 8. 其它辅助方法 ========== **/
function reset() {
  data.name = ""
  data.categoryId = null
  load()
}

// 价格计算器功能
function openPriceCalculator(row) {
  // 跳转到价格计算器页面并传递当前商品信息和siteId作为参数
  router.push({
    path: `/manager/site/${siteId}/priceCalculation`,
    query: { 
      productId: row.id,
      productName: row.name,
      productImg: row.img,
      productPrice: row.originPrice,
      productCategory: row.categoryName,
      url: row.url
    }
  })
}

// 格式化type字段的辅助函数
function formatTypeField(typeStr) {
  if (!typeStr) return ''
  
  // 分割字符串，去除每部分的空格，然后重新用分号连接
  return typeStr.split(';')
    .map(item => item.trim())
    .filter(item => item) // 移除空项
    .join(';')
}

/** ========== 9. 页面初始化 ========== **/
load()
loadCategory()
</script>

<style scoped>
.card {
  background: #fff;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
