<template>
  <div>
    <!-- 查询区 -->
    <div class="card" style="margin-bottom: 10px;">
      <el-input
        v-model="data.orderNo"
        prefix-icon="Search"
        style="width: 240px; margin-right: 10px"
        placeholder="请输入订单号查询"
      ></el-input>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="info" style="margin: 0 10px" @click="reset"
        >重置</el-button
      >
    </div>

    <!-- 列表区 -->
    <div class="card" style="margin-bottom: 10px">
      <div style="margin-bottom: 10px">
        
        <el-button type="danger" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="totalPrice" label="总价" />
        <el-table-column 
          prop="status" 
          label="状态"
          :filters="statusFilters"
          :filter-method="filterStatus"
          filter-placement="bottom-end"
        >
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payNo" label="支付单号">
          <template #default="scope">
            {{ scope.row.payNo || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="payTime" label="支付时间" />
        <el-table-column type="expand">
          <template #default="props">
            <div class="order-details-container">
              <div class="order-details-title">订单详情</div>
              <el-table :data="props.row.orderDetails" border class="order-details-table">
                <el-table-column prop="goodsName" label="商品名称" />
                <el-table-column prop="goodsPrice" label="单价" />
                <el-table-column prop="num" label="数量" />
                <el-table-column prop="subtotal" label="小计" />
                <el-table-column label="商品图片">
                  <template #default="scope">
                    <el-image style="width: 50px; height: 50px" :src="scope.row.goodsImg" fit="cover" />
                  </template>
                </el-table-column>
                <el-table-column label="商品链接">
                  <template #default="scope">
                    <el-link 
                      v-if="scope.row.url" 
                      type="primary" 
                      :href="scope.row.url" 
                      target="_blank"
                      :underline="false"
                      :title="scope.row.url"
                    >
                      {{ shortenUrl(scope.row.url) }}
                    </el-link>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button type="primary" size="small" @click="showAddressInfo(scope.row)">地址信息</el-button>
            <el-button type="success" size="small" @click="showEmailManager(scope.row)">邮件管理</el-button>
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

    <!-- 地址信息弹窗 -->
    <el-dialog v-model="addressDialogVisible" title="地址信息" width="30%">
      <div class="address-info">
        <div class="address-item" v-if="addressInfo.addressLine1">
          <span class="label">地址行1：</span>
          <span class="value" @click="copyToClipboard(addressInfo.addressLine1)">{{ addressInfo.addressLine1 }}</span>
        </div>
        <div class="address-item" v-if="addressInfo.addressLine2">
          <span class="label">地址行2：</span>
          <span class="value" @click="copyToClipboard(addressInfo.addressLine2)">{{ addressInfo.addressLine2 }}</span>
        </div>
        <div class="address-item" v-if="addressInfo.suburb">
          <span class="label">区域：</span>
          <span class="value" @click="copyToClipboard(addressInfo.suburb)">{{ addressInfo.suburb }}</span>
        </div>
        <div class="address-item" v-if="addressInfo.state">
          <span class="label">省/州：</span>
          <span class="value" @click="copyToClipboard(addressInfo.state)">{{ addressInfo.state }}</span>
        </div>
        <div class="address-item" v-if="addressInfo.postalCode">
          <span class="label">邮编：</span>
          <span class="value" @click="copyToClipboard(addressInfo.postalCode)">{{ addressInfo.postalCode }}</span>
        </div>
        <div class="address-item" v-if="addressInfo.country">
          <span class="label">国家：</span>
          <span class="value" @click="copyToClipboard(addressInfo.country)">{{ addressInfo.country }}</span>
        </div>
      </div>
      <div class="copy-tip">点击任意地址信息可复制到剪贴板</div>
      <div class="dialog-footer">
        <el-button 
          type="success" 
          @click="confirmShipment" 
          :disabled="!currentOrder || !isOrderReadyToShip(currentOrder.status)"
          :loading="confirmLoading"
        >
          确认发货
        </el-button>
      </div>
    </el-dialog>

    <!-- 邮件管理弹窗 -->
    <el-dialog v-model="emailDialogVisible" title="邮件管理" width="50%">
      <div class="email-manager">
        <div class="email-header">
          <span class="email-label">收件人邮箱：</span>
          <el-input v-model="emailData.userEmail" placeholder="请输入收件人邮箱" style="width: 300px;"></el-input>
        </div>
        
        <div class="template-selector">
          <span class="email-label">选择模板：</span>
          <el-radio-group v-model="emailData.templateType" @change="changeTemplate">
            <el-radio :label="1">订单发货通知</el-radio>
            <el-radio :label="2">订单送达通知</el-radio>
          </el-radio-group>
        </div>
        
        <div class="email-subject">
          <span class="email-label">邮件主题：</span>
          <el-input v-model="emailData.subject" placeholder="邮件主题" style="width: 400px;"></el-input>
        </div>
        
        <div v-if="emailData.templateType === 1" class="delivery-date">
          <span class="email-label">预计送达日期：</span>
          <el-date-picker v-model="emailData.estimatedDeliveryDate" type="date" placeholder="选择预计送达日期"></el-date-picker>
        </div>
        
        <div class="email-content">
          <span class="email-label">邮件内容：</span>
          <el-input
            v-model="emailData.content"
            type="textarea"
            :rows="10"
            placeholder="邮件内容"
            style="width: 100%;"
          ></el-input>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button type="primary" @click="sendEmail" :loading="sendingEmail">发送邮件</el-button>
        <el-button @click="emailDialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute } from "vue-router";

const route = useRoute();
const baseApi = "/orderMain"; // 修改为订单API路径

// 取出 URL 上的 siteId
const siteId = route.params.siteId;

// 状态枚举转中文显示
function getStatusText(status) {
  // 先将英文值映射到枚举名
  const valueToEnum = {
    'Cancelled': 'CANCEL',
    'Pending Payment': 'NOT_PAY',
    'Pending Shipment': 'NOT_SEND',
    'Dispatched': 'DISPATCHED',
    'Completed': 'DONE',
    'Refunded': 'REFUND_DONE',
    'Reviewed': 'COMMENT_DONE'
  };
  
  // 如果是英文值，先转为枚举名
  const enumName = valueToEnum[status] || status;
  
  const statusMap = {
    'CANCEL': '已取消',
    'NOT_PAY': '待支付',
    'NOT_SEND': '待发货', 
    'DISPATCHED': '待收货',
    'DONE': '已完成',
    'REFUND_DONE': '已退款',
    'COMMENT_DONE': '已评价'
  };
  return statusMap[enumName] || status;
}

// 状态对应的标签类型
function getStatusType(status) {
  // 先将英文值映射到枚举名
  const valueToEnum = {
    'Cancelled': 'CANCEL',
    'Pending Payment': 'NOT_PAY',
    'Pending Shipment': 'NOT_SEND',
    'Dispatched': 'DISPATCHED',
    'Completed': 'DONE',
    'Refunded': 'REFUND_DONE',
    'Reviewed': 'COMMENT_DONE'
  };
  
  // 如果是英文值，先转为枚举名
  const enumName = valueToEnum[status] || status;
  
  const typeMap = {
    'CANCEL': 'info',        // 灰色
    'NOT_PAY': 'danger',     // 红色
    'NOT_SEND': 'warning',   // 黄色
    'DISPATCHED': 'success', // 黄色
    'DONE': 'success',       // 绿色
    'REFUND_DONE': 'info',   // 灰色
    'COMMENT_DONE': 'success'// 绿色
  };
  return typeMap[enumName] || '';
}

// 状态筛选选项
const statusFilters = [
  { text: '已取消', value: 'CANCEL' },
  { text: '待支付', value: 'NOT_PAY' },
  { text: '待发货', value: 'NOT_SEND' },
  { text: '待收货', value: 'DISPATCHED' },
  { text: '已完成', value: 'DONE' },
  { text: '已退款', value: 'REFUND_DONE' },
  { text: '已评价', value: 'COMMENT_DONE' }
];

// 状态筛选方法
function filterStatus(value, row) {
  // 处理英文状态值和枚举状态值
  const valueToEnum = {
    'Cancelled': 'CANCEL',
    'Pending Payment': 'NOT_PAY',
    'Pending Shipment': 'NOT_SEND',
    'Dispatched': 'DISPATCHED',
    'Completed': 'DONE',
    'Refunded': 'REFUND_DONE',
    'Reviewed': 'COMMENT_DONE'
  };
  
  // 获取行的实际枚举值
  const rowEnumValue = valueToEnum[row.status] || row.status;
  
  return rowEnumValue === value;
}

// URL缩略显示
function shortenUrl(url) {
  if (!url) return '';
  try {
    // 尝试解析URL获取域名
    const urlObj = new URL(url);
    return urlObj.hostname + (urlObj.pathname !== '/' ? '/...' : '');
  } catch (e) {
    // 如果URL格式无效，简单截断显示
    return url.length > 30 ? url.substring(0, 27) + '...' : url;
  }
}

// 地址信息弹窗相关
const addressDialogVisible = ref(false);
const addressInfo = ref({
  addressLine1: '',
  addressLine2: '',
  suburb: '',
  state: '',
  postalCode: '',
  country: ''
});
const currentOrder = ref(null);
const confirmLoading = ref(false);

// 显示地址信息弹窗
function showAddressInfo(row) {
  currentOrder.value = row;
  addressInfo.value = {
    addressLine1: row.addressLine1 || '',
    addressLine2: row.addressLine2 || '',
    suburb: row.suburb || '',
    state: row.state || '',
    postalCode: row.postalCode || '',
    country: row.country || ''
  };
  addressDialogVisible.value = true;
}

// 复制到剪贴板
function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败');
    });
}

// 确认发货
function confirmShipment() {
  if (!currentOrder.value) return;
  
  confirmLoading.value = true;
  
  ElMessageBox.confirm("确认将此订单标记为已发货状态?", "确认发货", { type: "info" })
    .then(() => {
      const orderData = JSON.parse(JSON.stringify(currentOrder.value));
      orderData.status = "DISPATCHED"; // 修改状态为待收货
      
      request.put(baseApi + "/update", orderData).then((res) => {
        if (res.code === "200") {
          ElMessage.success("确认发货成功");
          addressDialogVisible.value = false;
          load(); // 重新加载数据
        } else {
          ElMessage.error(res.msg || "操作失败");
        }
      }).finally(() => {
        confirmLoading.value = false;
      });
    })
    .catch(() => {
      confirmLoading.value = false;
    });
}

// 判断订单是否处于可发货状态
function isOrderReadyToShip(status) {
  // 处理所有可能的"待发货"状态表示
  return status === 'NOT_SEND' || 
         status === 'Pending Shipment' || 
         getStatusText(status) === '待发货';
}

// 响应式数据
const data = reactive({
  user: JSON.parse(localStorage.getItem("user") || "{}"),
  tableData: [],
  total: 0,
  pageNum: 1,
  pageSize: 20,

  form: {
    orderDetails: [],
    status: "NOT_PAY" // 默认状态改为枚举值
  },
  ids: [],
  name: '',
  orderNo: '',
});

const formRef = ref(null);

// 加载表格数据
function load() {
  request.get(baseApi + "/selectPage", {
      params: {
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        orderNo: data.orderNo,
        siteId: siteId
      },
    })
    .then((res) => {
      console.log(res);
      data.tableData = res.data?.list || [];
      data.total = res.data?.total || 0;
    });
}

// 点击"新增"


// 点击"编辑"
function handleEdit(row) {
  data.form = JSON.parse(JSON.stringify(row));
  if (!data.form.orderDetails) {
    data.form.orderDetails = [];
  }
  data.formVisible = true;
}

// 添加订单详情项
function addDetail() {
  if (!data.form.orderDetails) {
    data.form.orderDetails = [];
  }
  data.form.orderDetails.push({
    goodsName: '',
    goodsPrice: 0,
    num: 1,
    goodsImg: ''
  });
}

// 移除订单详情项
function removeDetail(index) {
  data.form.orderDetails.splice(index, 1);
}

// 新增
function add() {
  // 计算总价
  calculateTotalPrice();
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

// 计算总价
function calculateTotalPrice() {
  if (data.form.orderDetails && data.form.orderDetails.length > 0) {
    data.form.totalPrice = data.form.orderDetails.reduce((sum, item) => {
      return sum + (item.goodsPrice * item.num);
    }, 0);
  } else {
    data.form.totalPrice = 0;
  }
}

// 更新
function update() {
  calculateTotalPrice();
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

// 邮件管理相关
const emailDialogVisible = ref(false);
const sendingEmail = ref(false);
const emailData = reactive({
  userEmail: '',
  templateType: 1, // 1: 发货通知, 2: 送达通知
  subject: '',
  content: '',
  orderId: '',
  goodsName: '',
  estimatedDeliveryDate: ''
});

// 邮件模板
const emailTemplates = {
  shipped: {
    subject: 'Your Order #{orderId} Has Been Shipped!',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #4a4a4a; }
    .content { margin-bottom: 20px; }
    .details { margin: 15px 0; padding-left: 15px; }
    .footer { margin-top: 30px; font-size: 14px; color: #666; }
    .highlight { font-weight: bold; color: #0066cc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Order Shipment Notification</div>
    <div class="content">
      <p>Dear <span class="highlight">{userEmail}</span>,</p>
      <p>Great news! Your order <span class="highlight">#{orderId}</span> has been shipped and is on its way to you.</p>
      
      <div class="details">
        <p><strong>Order Details:</strong></p>
        <p>Order Number: <span class="highlight">#{orderId}</span></p>
        <p>Item(s): <span class="highlight">{goodsName}</span></p>
        <p>Estimated Delivery Date: <span class="highlight">{estimatedDeliveryDate}</span></p>
      </div>
      
      <p>If you have any questions about your order, please don't hesitate to contact our customer service team at <a href="mailto:support@auscoolstuff.com.au">support@auscoolstuff.com.au</a>.</p>
      <p>Thank you for shopping with us!</p>
    </div>
    <div class="footer">
      Best regards,<br>
      The AusCoolStuff Team
    </div>
  </div>
</body>
</html>`
  },
  delivered: {
    subject: 'Your Order #{orderId} Has Been Delivered!',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #4a4a4a; }
    .content { margin-bottom: 20px; }
    .details { margin: 15px 0; padding-left: 15px; }
    .footer { margin-top: 30px; font-size: 14px; color: #666; }
    .highlight { font-weight: bold; color: #0066cc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Order Delivery Confirmation</div>
    <div class="content">
      <p>Dear <span class="highlight">{userEmail}</span>,</p>
      <p>We're pleased to inform you that your order <span class="highlight">#{orderId}</span> has been successfully delivered.</p>
      
      <p>If you haven't received your package or if there are any issues with your delivery, please contact our customer service team immediately at <a href="mailto:support@auscoolstuff.com.au">support@auscoolstuff.com.au</a>.</p>
      
      <p>We hope you enjoy your purchase! If you have a moment, we'd appreciate if you could leave a review about your shopping experience and the product(s) you received.</p>
      
      <p>Thank you for choosing AusCoolStuff!</p>
    </div>
    <div class="footer">
      Best regards,<br>
      The AusCoolStuff Team
    </div>
  </div>
</body>
</html>`
  }
};

// 显示邮件管理弹窗
function showEmailManager(row) {
  // 准备商品名称列表
  const goodsNames = row.orderDetails?.map(item => item.goodsName).join(', ') || '';
  
  // 设置邮件数据
  emailData.userEmail = row.userEmail || '';
  emailData.orderId = row.orderNo || '';
  emailData.goodsName = goodsNames;
  emailData.templateType = 1; // 默认使用发货通知模板
  
  // 应用默认模板
  changeTemplate(1);
  
  emailDialogVisible.value = true;
}

// 切换邮件模板
function changeTemplate(templateType) {
  const template = templateType === 1 ? emailTemplates.shipped : emailTemplates.delivered;
  
  let subject = template.subject.replace('{orderId}', emailData.orderId);
  let content = template.content
    .replace(/\{userEmail\}/g, emailData.userEmail)
    .replace(/\{orderId\}/g, emailData.orderId)
    .replace(/\{goodsName\}/g, emailData.goodsName);
  
  if (templateType === 1) {
    const formattedDate = emailData.estimatedDeliveryDate 
      ? new Date(emailData.estimatedDeliveryDate).toLocaleDateString() 
      : '[请选择预计送达日期]';
    content = content.replace(/\{estimatedDeliveryDate\}/g, formattedDate);
  }
  
  emailData.subject = subject;
  emailData.content = content;
}

// 发送邮件
function sendEmail() {
  if (!emailData.userEmail) {
    ElMessage.warning('请输入收件人邮箱');
    return;
  }
  
  // 如果是发货通知且没有填写预计送达日期
  if (emailData.templateType === 1 && !emailData.estimatedDeliveryDate) {
    ElMessage.warning('请选择预计送达日期');
    return;
  }
  
  sendingEmail.value = true;
  
  // 在发送前再次更新预计送达日期，确保最新值被使用
  if (emailData.templateType === 1 && emailData.estimatedDeliveryDate) {
    const formattedDate = new Date(emailData.estimatedDeliveryDate).toLocaleDateString();
    emailData.content = emailData.content.replace(/\[请选择预计送达日期\]/g, formattedDate);
    emailData.content = emailData.content.replace(/\{estimatedDeliveryDate\}/g, formattedDate);
  }
  
  // 准备邮件数据
  const mailData = {
    to: emailData.userEmail,
    from: 'support@auscoolstuff.com.au',
    subject: emailData.subject,
    content: emailData.content,
    orderId: emailData.orderId,
    isHtml: true, // 标记内容为HTML格式
    estimatedDeliveryDate: emailData.estimatedDeliveryDate ? new Date(emailData.estimatedDeliveryDate).toLocaleDateString() : '' // 明确传递送达日期
  };
  
  // 发送邮件请求
  request.post(baseApi + '/sendEmail', mailData)
    .then(res => {
      if (res.code === '200') {
        ElMessage.success('邮件发送成功');
        emailDialogVisible.value = false;
      } else {
        ElMessage.error(res.msg || '邮件发送失败');
      }
    })
    .catch(err => {
      console.error('邮件发送错误:', err);
      ElMessage.error('邮件发送失败');
    })
    .finally(() => {
      sendingEmail.value = false;
    });
}


</script>

<style scoped>
.detail-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.order-details-container {
  padding: 10px 20px 20px 40px; /* 左侧缩进，体现从属关系 */
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 10px;
}

.order-details-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.order-details-table {
  width: 100%;
  margin-left: 20px; /* 表格再次缩进 */
}

/* 地址信息弹窗样式 */
.address-info {
  padding: 10px;
}

.address-item {
  margin-bottom: 15px;
  display: flex;
}

.label {
  width: 80px;
  color: #606266;
}

.value {
  color: #303133;
  flex: 1;
  cursor: pointer;
  padding: 5px 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.value:hover {
  background-color: #e6e8eb;
}

.copy-tip {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 10px;
}

.dialog-footer {
  margin-top: 20px;
  text-align: center;
}


/* 邮件管理样式 */
.email-manager {
  padding: 10px;
}

.email-header, .template-selector, .email-subject, .delivery-date {
  margin-bottom: 15px;
}

.email-label {
  display: inline-block;
  width: 100px;
  color: #606266;
  text-align: right;
  margin-right: 10px;
}

.email-content {
  margin-bottom: 20px;
}
</style>
