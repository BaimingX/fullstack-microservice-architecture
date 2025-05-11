<template>
  <div class="price-calculation-container">
    <h2>价格计算器</h2>
    
    <!-- 商品信息显示区域 -->
    <el-card class="product-info-card" v-if="currentProduct">
      <div class="product-info">
        <div class="product-image">
          <el-image
            v-if="currentProduct.img"
            :src="currentProduct.img"
            fit="cover"
            style="width: 100px; height: 100px; border-radius: 4px;">
          </el-image>
          <div v-else class="no-image">暂无图片</div>
        </div>
        <div class="product-details">
          <h3>{{ currentProduct.name }}</h3>
          <p>原价: {{ currentProduct.originPrice }}</p>
          <p v-if="currentProduct.categoryName">分类: {{ currentProduct.categoryName }}</p>
          <!-- 红框显示URL -->
          <el-input 
            v-model="productUrl"
            placeholder="商品URL" 
            class="url-display"
            :readonly="true"
            style="margin-top: 10px; border: 2px solid #f56c6c;">
            <template #append>
              <el-button @click="copyProductUrl">复制</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- 选择产品按钮 -->
    <el-button type="primary" @click="showProductSelector" class="select-product-btn">
      选择商品
    </el-button>

    <!-- 蓝框：秒杀/折扣选择区 -->
    <el-card class="promotion-card" style="border: 2px solid #409EFF; margin-bottom: 20px;">
      <h3>促销设置</h3>
      <el-form label-width="120px">
        <el-form-item label="促销类型">
          <el-radio-group v-model="promotionType">
            <el-radio label="none">不促销</el-radio>
            <el-radio label="flash">秒杀</el-radio>
            <el-radio label="discount">折扣</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="折扣幅度(%)" v-if="promotionType !== 'none'">
          <el-slider 
            v-model="discountPercent" 
            :min="0" 
            :max="90" 
            :step="1"
            show-stops
            show-input>
          </el-slider>
        </el-form-item>
        
        <el-form-item label="截止时间" v-if="promotionType === 'flash'">
          <el-date-picker
            v-model="flashEndTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择截止时间"
            :disabledDate="disabledDate">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="秒杀名额" v-if="promotionType === 'flash'">
          <el-input-number v-model="flashQuota" :min="1" :step="1"></el-input-number>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 计算器标签页 -->
    <el-tabs v-model="activeTab" class="calculator-tabs">
      <el-tab-pane label="Temu价格计算" name="temu">
        <el-card class="calc-form">
          <h3>Temu价格计算</h3>
          <el-form :model="temuForm" label-width="120px">
            <el-form-item label="进货价($)">
              <el-input-number v-model="temuForm.costPrice" :min="0" :precision="2" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="毛利率(%)">
              <el-slider 
                v-model="temuForm.profitMargin" 
                :min="0" 
                :max="100" 
                :step="1" 
                show-stops
                show-input>
              </el-slider>
            </el-form-item>
            <el-divider></el-divider>
            <el-form-item>
              <h3 class="result-price">
                定价: <span style="color: #f56c6c; font-weight: bold">${{ temuSellPrice.toFixed(1) }}</span>
              </h3>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="淘宝跨境计算" name="taobao">
        <el-card class="calc-form">
          <h3>淘宝跨境计算</h3>
          <el-form :model="taobaoForm" label-width="140px">
            <el-form-item label="进货价(¥)">
              <el-input-number v-model="taobaoForm.costPrice" :min="0" :precision="2" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="国际物流费(¥)">
              <el-input-number v-model="taobaoForm.shippingFee" :min="0" :precision="2" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="国家/地区">
              <el-select v-model="taobaoForm.country" placeholder="选择国家">
                <el-option label="澳大利亚" value="australia"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="汇率(¥:$)">
              <el-input-number v-model="taobaoForm.exchangeRate" :min="1" :precision="2" :step="0.1" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="毛利率(%)">
              <el-slider 
                v-model="taobaoForm.profitMargin" 
                :min="0" 
                :max="100" 
                :step="1" 
                show-stops
                show-input>
              </el-slider>
            </el-form-item>
            <el-form-item label="包含GST(10%)">
              <el-switch v-model="taobaoForm.includeGST"></el-switch>
            </el-form-item>
            <el-form-item label="包邮">
              <el-switch v-model="taobaoForm.freeShipping"></el-switch>
            </el-form-item>
            <el-divider></el-divider>
            
            <!-- 计算结果显示 -->
            <div class="calculation-results">
              <h3>计算结果</h3>
              <div class="result-item">
                <span class="label">人民币成本总计:</span>
                <span class="value">¥{{ totalRMBCost.toFixed(1) }}</span>
              </div>
              <div class="result-item">
                <span class="label">澳元成本价:</span>
                <span class="value">${{ audCost.toFixed(1) }}</span>
              </div>
              <div class="result-item" v-if="taobaoForm.includeGST">
                <span class="label">GST(10%):</span>
                <span class="value">${{ gstAmount.toFixed(1) }}</span>
              </div>
              <div class="result-item" v-if="!taobaoForm.freeShipping">
                <span class="label">建议收取运费:</span>
                <span class="value">${{ shippingAUD.toFixed(1) }}</span>
              </div>
              <div class="result-item result-final">
                <span class="label">建议售价{{taobaoForm.freeShipping ? '(包邮)' : ''}}:</span>
                <span class="value" style="color: #f56c6c; font-weight: bold">${{ finalPriceAUD.toFixed(1) }}</span>
              </div>
              <div class="recommendations">
                <h4>价格建议</h4>
                <p v-if="audCost < 20">
                  低单价商品(低于$20澳元)，建议不包邮或满额包邮，避免运费侵蚀利润。
                </p>
                <p v-else>
                  高单价商品(超过$20澳元)，运费占比较小，建议包邮提升转化率。
                </p>
              </div>
            </div>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 一键应用按钮 -->
    <el-button 
      type="success" 
      @click="applyToGoods" 
      style="margin-top: 20px; width: 100%; height: 50px; font-size: 16px;"
      :disabled="!currentProduct || !currentProduct.id">
      一键应用到商品
    </el-button>

    <!-- 商品选择对话框 -->
    <el-dialog
      v-model="productSelectorVisible"
      title="选择商品"
      width="70%"
    >
      <div class="product-search">
        <el-input
          v-model="searchName"
          placeholder="请输入商品名称"
          style="width: 220px; margin-right: 10px"
        ></el-input>
        <el-button type="primary" @click="loadProducts">搜索</el-button>
      </div>
      
      <el-table :data="products" style="width: 100%; margin-top: 15px">
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="originPrice" label="原价" width="80"></el-table-column>
        
        <!-- 添加促销信息列 -->
        <el-table-column label="促销类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.hasFlash" type="danger">秒杀</el-tag>
            <el-tag v-else-if="scope.row.hasDiscount" type="success">折扣</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 添加促销价格列 -->
        <el-table-column label="促销价" width="80">
          <template #default="scope">
            <span v-if="scope.row.hasFlash" class="promotion-price">${{ scope.row.flashPrice }}</span>
            <span v-else-if="scope.row.hasDiscount" class="promotion-price">${{ scope.row.discountPrice }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 添加折扣信息列 -->
        <el-table-column label="折扣" width="80">
          <template #default="scope">
            <span v-if="scope.row.hasFlash && scope.row.flashPrice && scope.row.originPrice" class="discount-info">
              {{ calculateDiscount(scope.row.flashPrice, scope.row.originPrice) }}%
            </span>
            <span v-else-if="scope.row.hasDiscount && scope.row.discountPrice && scope.row.originPrice" class="discount-info">
              {{ calculateDiscount(scope.row.discountPrice, scope.row.originPrice) }}%
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 如果是秒杀，显示截止时间 -->
        <el-table-column label="截止时间" width="150">
          <template #default="scope">
            <span v-if="scope.row.hasFlash && scope.row.flashTime">
              {{ scope.row.flashTime }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryName" label="分类" width="100"></el-table-column>
        <el-table-column prop="img" label="图片" width="80">
          <template #default="scope">
            <el-image
              v-if="scope.row.img"
              :src="scope.row.img"
              style="width: 50px; height: 50px; object-fit: cover;"
            ></el-image>
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="primary" size="small" @click="selectProduct(scope.row)">
              选择
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-if="total > 0"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNum"
        @current-change="handlePageChange"
        style="margin-top: 15px; text-align: center"
      ></el-pagination>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeMount } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useRoute, useRouter } from 'vue-router'

// 路由相关
const route = useRoute()
const router = useRouter()
const siteId = route.params.siteId // 从路径参数中获取siteId

// 标签页控制
const activeTab = ref('temu')

// 商品选择相关
const productSelectorVisible = ref(false)
const currentProduct = ref(null)
const products = ref([])
const searchName = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const productUrl = ref('')

// 促销相关
const promotionType = ref('none') // none, flash, discount
const discountPercent = ref(20)
const flashEndTime = ref('')
const flashQuota = ref(10)

// Temu计算器相关数据
const temuForm = reactive({
  costPrice: 100,
  profitMargin: 30,
})

// 淘宝计算器相关数据
const taobaoForm = reactive({
  costPrice: 100,
  shippingFee: 48,
  country: 'australia',
  exchangeRate: 4.4,
  profitMargin: 30,
  includeGST: true,
  freeShipping: true,
})

// 计算结果
const temuSellPrice = computed(() => {
  const costPrice = temuForm.costPrice || 0
  const margin = temuForm.profitMargin / 100
  
  // 公式: 售价 = 成本价 / (1 - 毛利率)
  if (margin >= 1) return costPrice * 10 // 避免除以0导致的无穷大
  return costPrice / (1 - margin)
})

// 淘宝计算相关
const totalRMBCost = computed(() => {
  return (taobaoForm.costPrice || 0) + (taobaoForm.shippingFee || 0)
})

const audCost = computed(() => {
  const exchangeRate = taobaoForm.exchangeRate || 4.4
  return totalRMBCost.value / exchangeRate
})

const gstAmount = computed(() => {
  if (!taobaoForm.includeGST) return 0
  return audCost.value * 0.1 // 10% GST
})

const shippingAUD = computed(() => {
  const exchangeRate = taobaoForm.exchangeRate || 4.4
  return Math.round((taobaoForm.shippingFee / exchangeRate) * 10) / 10
})

const finalPriceAUD = computed(() => {
  let baseCost = audCost.value
  
  // 加上GST (如果需要)
  if (taobaoForm.includeGST) {
    baseCost += gstAmount.value
  }
  
  // 计算含毛利的价格
  const margin = taobaoForm.profitMargin / 100
  
  if (margin >= 0.99) return baseCost * 10 // 避免除以接近0导致的极大值
  
  let finalPrice = baseCost / (1 - margin)
  
  // 如果不包邮，则不把运费算在内
  if (!taobaoForm.freeShipping) {
    finalPrice = (baseCost - shippingAUD.value) / (1 - margin)
  }
  
  return finalPrice
})

// 计算促销价格
const promotionPrice = computed(() => {
  if (promotionType.value === 'none') return 0
  
  // 取当前活跃标签页的价格
  let basePrice = activeTab.value === 'temu' 
    ? temuSellPrice.value 
    : finalPriceAUD.value
  
  // 根据折扣百分比计算促销价
  return basePrice * (1 - discountPercent.value / 100)
})

// 计算折扣百分比
const calculateDiscount = (promotionPrice, originalPrice) => {
  if (!promotionPrice || !originalPrice || originalPrice <= 0) return '-'
  const discount = 100 - (promotionPrice / originalPrice * 100)
  return Math.round(discount)
}

// 显示商品选择器
const showProductSelector = () => {
  productSelectorVisible.value = true
  loadProducts()
}

// 加载商品列表
const loadProducts = () => {
  request.get('/goods/selectPage', {
    params: {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      name: searchName.value,
      siteId: siteId // 添加siteId过滤
    }
  }).then(res => {
    if (res.code === '200') {
      products.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '加载商品失败')
    }
  })
}

// 页码变化
const handlePageChange = (page) => {
  pageNum.value = page
  loadProducts()
}

// 选择商品
const selectProduct = (product) => {
  currentProduct.value = product
  productSelectorVisible.value = false
  
  // 设置商品URL
  productUrl.value = product.url || ''
  
  // 自动填充进货价
  if (product.originPrice) {
    temuForm.costPrice = product.originPrice
    taobaoForm.costPrice = product.originPrice
  }

  // 检查商品是否已有促销设置，并填充相应字段
  if (product.hasFlash) {
    promotionType.value = 'flash'
    flashEndTime.value = product.flashTime
    flashQuota.value = product.flashNum || 10
    
    // 计算折扣百分比 (如果有闪购价)
    if (product.flashPrice && product.originPrice) {
      const discount = 100 - (product.flashPrice / product.originPrice * 100)
      discountPercent.value = Math.round(discount)
    }
  } else if (product.hasDiscount) {
    promotionType.value = 'discount'
    
    // 计算折扣百分比 (如果有折扣价)
    if (product.discountPrice && product.originPrice) {
      const discount = 100 - (product.discountPrice / product.originPrice * 100)
      discountPercent.value = Math.round(discount)
    }
  } else {
    promotionType.value = 'none'
  }
  
  ElMessage.success('已选择商品: ' + product.name)
}

// 复制URL
const copyProductUrl = () => {
  if (!productUrl.value) {
    ElMessage.warning('没有可复制的URL')
    return
  }
  
  navigator.clipboard.writeText(productUrl.value).then(() => {
    ElMessage.success('URL已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 一键应用到商品
const applyToGoods = () => {
  if (!currentProduct.value || !currentProduct.value.id) {
    ElMessage.warning('请先选择商品')
    return
  }
  
  // 获取当前活跃标签页的价格作为基础价格
  let calculatedPrice
  let currencySymbol
  
  if (activeTab.value === 'temu') {
    calculatedPrice = Number(temuSellPrice.value.toFixed(1))
    currencySymbol = '$'
  } else {
    calculatedPrice = Number(finalPriceAUD.value.toFixed(1))
    currencySymbol = '$'
  }
  
  // 准备更新的商品数据
  const updatedGoods = {
    id: currentProduct.value.id,
    
    // 默认情况：不促销时直接用计算价格作为原价
    originPrice: calculatedPrice,
    
    // 重置促销状态
    hasFlash: false,
    flashPrice: null,
    flashTime: null,
    flashNum: null,
    
    hasDiscount: false,
    discountPrice: null
  }
  
  // 如果选择了促销(秒杀或折扣)
  if (promotionType.value !== 'none') {
    const discountRate = discountPercent.value / 100
    
    // 用计算出的价格作为促销价格
    const promotionPriceValue = calculatedPrice
    
    // 根据公式: 原价 = 促销价 / (1 - 折扣率) 计算原价
    // 例如：促销价$70，折扣30%，则原价 = $70 / (1 - 0.3) = $70 / 0.7 = $100
    const originalPrice = discountRate < 1 ? 
                          Number((promotionPriceValue / (1 - discountRate)).toFixed(1)) : 
                          promotionPriceValue * 2 // 防止除以0
  
    // 设置原价
    updatedGoods.originPrice = originalPrice
    
    // 根据促销类型设置相应字段
    if (promotionType.value === 'flash') {
      updatedGoods.hasFlash = true
      updatedGoods.flashPrice = promotionPriceValue
      updatedGoods.flashTime = flashEndTime.value
      updatedGoods.flashNum = flashQuota.value
    } else if (promotionType.value === 'discount') {
      updatedGoods.hasDiscount = true
      updatedGoods.discountPrice = promotionPriceValue
    }
  }
  
  // 调用API更新商品
  request.put('/goods/update', updatedGoods).then(res => {
    if (res.code === '200') {
      let successMsg = `商品更新成功!`
      
      if (promotionType.value === 'flash') {
        successMsg = `秒杀价已设为${currencySymbol}${updatedGoods.flashPrice.toFixed(1)}, 原价已设为${currencySymbol}${updatedGoods.originPrice.toFixed(1)}`
      } else if (promotionType.value === 'discount') {
        successMsg = `折扣价已设为${currencySymbol}${updatedGoods.discountPrice.toFixed(1)}, 原价已设为${currencySymbol}${updatedGoods.originPrice.toFixed(1)}`
      } else {
        successMsg = `原价已设为${currencySymbol}${updatedGoods.originPrice.toFixed(1)}`
      }
      
      ElMessage.success(successMsg)
      
      // 更新当前选中的商品信息
      Object.assign(currentProduct.value, updatedGoods)
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  }).catch(err => {
    console.error('更新商品失败:', err)
    ElMessage.error('更新失败，请检查网络连接')
  })
}

// 页面初始化
onMounted(() => {
  // 从路由参数中获取商品信息
  const query = route.query
  
  // 设置默认的截止时间（明天同一时间）
  if (!flashEndTime.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    flashEndTime.value = tomorrow.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  if (query.productId) {
    // 如果URL中包含商品信息，则自动填充
    currentProduct.value = {
      id: query.productId,
      name: query.productName,
      img: query.productImg,
      originPrice: parseFloat(query.productPrice) || 0,
      categoryName: query.productCategory,
      url: query.url || ''
    }
    
    // 设置商品URL
    productUrl.value = currentProduct.value.url || ''
    
    // 自动填充计算器的进货价
    if (currentProduct.value.originPrice) {
      temuForm.costPrice = currentProduct.value.originPrice
      taobaoForm.costPrice = currentProduct.value.originPrice
    }
    
    // 获取完整的商品信息（包括折扣、秒杀信息）
    if (query.productId) {
      request.get(`/goods/${query.productId}`).then(res => {
        if (res.code === '200' && res.data) {
          // 更新当前商品信息
          currentProduct.value = res.data
          productUrl.value = res.data.url || ''
          
          // 检查商品是否已有促销设置
          if (res.data.hasFlash) {
            promotionType.value = 'flash'
            flashEndTime.value = res.data.flashTime
            flashQuota.value = res.data.flashNum || 10
            
            // 计算折扣百分比
            if (res.data.flashPrice && res.data.originPrice) {
              const discount = 100 - (res.data.flashPrice / res.data.originPrice * 100)
              discountPercent.value = Math.round(discount)
            }
          } else if (res.data.hasDiscount) {
            promotionType.value = 'discount'
            
            // 计算折扣百分比
            if (res.data.discountPrice && res.data.originPrice) {
              const discount = 100 - (res.data.discountPrice / res.data.originPrice * 100)
              discountPercent.value = Math.round(discount)
            }
          } else {
            promotionType.value = 'none'
          }
        }
      }).catch(err => {
        console.error('获取商品详情失败:', err)
      })
    }
  }
})

// 禁用日期：不能选择今天之前的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期
}
</script>

<style scoped>
.price-calculation-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #606266;
}

.product-info-card {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  margin-right: 20px;
}

.no-image {
  width: 100px;
  height: 100px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  border-radius: 4px;
}

.product-details h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.product-details {
  flex: 1;
}

.url-display {
  margin-top: 10px;
}

.select-product-btn {
  margin-bottom: 20px;
}

.calculator-tabs {
  margin-top: 20px;
}

.calc-form {
  margin-bottom: 20px;
}

.result-price {
  text-align: center;
  font-size: 20px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.result-final {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
}

.calculation-results {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.recommendations {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #dcdfe6;
}

.recommendations h4 {
  color: #409EFF;
  margin-bottom: 10px;
}

.recommendations p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.el-slider {
  margin-top: 5px;
}

.promotion-price {
  color: #f56c6c;
  font-weight: bold;
}

.discount-info {
  color: #67c23a;
  font-weight: bold;
}
</style>
