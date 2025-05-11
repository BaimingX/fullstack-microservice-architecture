<template>
  <div>
    <!-- 查询区 -->
    <div class="card" style="margin-bottom: 10px;">
      <el-input
        v-model="data.name"
        prefix-icon="Search"
        style="width: 240px; margin-right: 10px"
        placeholder="请输入名称查询"
      ></el-input>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="info" style="margin: 0 10px" @click="reset"
        >重置</el-button
      >
    </div>

    <!-- 列表区 -->
    <div class="card" style="margin-bottom: 10px">
      <div style="margin-bottom: 10px">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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

    <!-- 弹窗 -->
    <el-dialog v-model="data.formVisible" title="分类信息" width="40%" destroy-on-close>
      <el-form
        :model="data.form"
        ref="formRef"
        :rules="data.rules"
        label-width="70px"
        style="padding: 20px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="data.form.name" autocomplete="off" placeholder="请输入名称" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="data.formVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute } from "vue-router";

const route = useRoute();
const baseApi = "/category";

// 取出 URL 上的 siteId
const siteId = route.params.siteId;

// 响应式数据
const data = reactive({
  user: JSON.parse(localStorage.getItem("user") || "{}"),
  tableData: [],
  total: 0,
  pageNum: 1,
  pageSize: 5,
  formVisible: false,
  form: {},       // { id, name, siteId, ...}
  ids: [],
  name: '',
  rules: {
    name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  },
});

const formRef = ref(null);
console.log("data.name",data.name)
// 加载表格数据
function load() {
  
  request.get(baseApi + "/selectPage", {
      params: {
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        name: data.name,
        siteId: siteId
      },
    })
    .then((res) => {
      data.tableData = res.data?.list || [];
      data.total = res.data?.total || 0;
    });
}

// 点击“新增”
function handleAdd() {
  data.form = {
    siteId: Number(siteId), // 注意：新增时也要带上 siteId
  };
  data.formVisible = true;
}

// 点击“编辑”
function handleEdit(row) {
  data.form = JSON.parse(JSON.stringify(row));
  data.formVisible = true;
}

// 新增
function add() {
  // 后端会用 data.form.siteId 做插入
  request.post(baseApi + "/add", data.form).then((res) => {
    if (res.code === "200") {
      ElMessage.success("操作成功");
      data.formVisible = false;
      load();
    } else {
      ElMessage.error(res.msg);
    }
  });
}

// 更新
function update() {
  request.put(baseApi + "/update", data.form).then((res) => {
    if (res.code === "200") {
      ElMessage.success("更新成功");
      data.formVisible = false;
      load();
    } else {
      ElMessage.error(res.msg);
    }
  });
}

// 删除
function del(id) {
  ElMessageBox.confirm("删除后数据无法恢复，确定删除吗?", "删除确认", { type: "warning" })
    .then(() => {
      request.delete(baseApi + "/delete/" + id).then((res) => {
        if (res.code === "200") {
          ElMessage.success("删除成功");
          load();
        } else {
          ElMessage.error(res.msg);
        }
      });
    })
    .catch((err) => console.error(err));
}

// 批量删除
function handleSelectionChange(rows) {
  data.ids = rows.map((v) => v.id);
}
function delBatch() {
  if (!data.ids.length) {
    ElMessage.warning("请选择数据");
    return;
  }
  ElMessageBox.confirm("删除后数据无法恢复，确定删除吗?", "删除确认", { type: "warning" })
    .then(() => {
      request.delete(baseApi + "/delete/batch", { data: data.ids }).then((res) => {
        if (res.code === "200") {
          ElMessage.success("操作成功");
          load();
        } else {
          ElMessage.error(res.msg);
        }
      });
    })
    .catch((err) => console.error(err));
}

// 保存（区分新增 or 更新）
function save() {
  formRef.value.validate((valid) => {
    if (valid) {
      if (data.form.id) {
        update();
      } else {
        add();
      }
    }
  });
}

// 重置查询
function reset() {
  data.name = '';
  load();
}

// 初始化
onMounted(() => {
  load();
});
</script>
