<!--
  =====================================================================
  CartPanel.vue — 购物车 + 订单导出组件
  =====================================================================
  功能：
    1. 显示用户已选的菜品列表（购物车）
    2. 每个菜品旁边有 × 删除按钮（可以反悔）
    3. 底部显示"全场免单"提示
    4. "发送给主厨"按钮：用 html2canvas 把订单区域截图，保存为 PNG 图片

  使用方式：
    <CartPanel :cart="cart" @remove-from-cart="removeFromCart($event)" />

  Props：
    cart — 购物车数组，每项是 { id, name, image }

  Emits：
    remove-from-cart — 用户点 × 删除某道菜时触发，传 index
-->

<template>
  <main class="view-section">
    <!--
      订单小票区域
      id="receipt-area"：这个 id 非常重要！
      html2canvas 通过这个 id 找到要截图的区域
    -->
    <div id="receipt-area" class="receipt-box">
      <!-- 小票标题 -->
      <h2 class="receipt-title">💖 专属订单 / VIP ORDER</h2>

      <!--
        购物车为空时：显示提示文字
        v-if="cart.length === 0" → 数组长度为 0 就是空的
      -->
      <div v-if="cart.length === 0" class="empty-cart">
        还没有选好今天要吃什么哦...
      </div>

      <!--
        购物车不为空时：循环显示每道已选菜品
        v-for="(item, index) in cart" → 遍历购物车
        item 是菜品对象（有 name, image 等属性）
        index 是位置序号（0, 1, 2...），用于删除时定位
      -->
      <div v-for="(item, index) in cart" :key="index" class="cart-item">
        <!-- 菜品名称 -->
        <span>{{ item.name }}</span>

        <!-- 右侧区域 -->
        <div class="cart-item-right">
          <!--
            删除按钮
            class="hide-on-export"：导出订单截图时隐藏此按钮（不想把 × 号印在订单上）
            @click="$emit('remove-from-cart', index)"：点击时告诉父组件"删除第 index 个"
          -->
          <button
            class="delete-btn hide-on-export"
            @click="$emit('remove-from-cart', index)"
          >
            ×
          </button>
        </div>
      </div>

      <!--
        小票底部信息
        v-if="cart.length > 0" → 购物车有东西时才显示
      -->
      <div class="receipt-footer" v-if="cart.length > 0">
        <span>全场免单 · 主厨马上准备！</span>
      </div>
    </div>

    <!--
      导出订单按钮
      v-if="cart.length > 0" → 有菜才显示
      @click="exportReceipt" → 点击时执行截图导出
    -->
    <button
      v-if="cart.length > 0"
      @click="exportReceipt"
      class="export-btn"
    >
      发送给主厨 (导出订单)
    </button>
  </main>
</template>

<script setup>
/**
 * ==================== 导入依赖 ====================
 *
 * html2canvas：把 HTML 元素渲染为 Canvas（画布），
 *              然后可以转成图片下载
 */
import html2canvas from 'html2canvas'

/**
 * ==================== Props 定义 ====================
 * cart：购物车数据，由父组件传入
 */
defineProps({
  cart: {
    type: Array,
    default: () => []   // 默认空购物车
  }
})

/**
 * ==================== Emits 定义 ====================
 * 'remove-from-cart'：用户删除菜品时触发
 * 携带参数：要删除的菜品在数组中的 index（索引位置）
 */
defineEmits(['remove-from-cart'])

/**
 * ==================== 订单导出功能 ====================
 *
 * exportReceipt —— 把订单小票截成图片并下载
 *
 * 工作流程：
 *   1. document.getElementById('receipt-area') → 找到订单区域的 DOM 元素
 *   2. html2canvas(元素, 配置) → 把 HTML 渲染成 <canvas>
 *   3. canvas.toDataURL('image/png') → 把 canvas 转成 PNG 图片的 Data URL
 *   4. 创建一个隐藏的 <a> 标签，设置 href 为图片 URL，download 为文件名
 *   5. link.click() → 触发浏览器下载
 */
const exportReceipt = () => {
  // 第 1 步：找到订单区域
  const receiptElement = document.getElementById('receipt-area')

  // 第 2 步：用 html2canvas 渲染成 canvas（画布）
  html2canvas(receiptElement, {
    scale: 2,                  // 2 倍分辨率 → 导出图片更清晰（Retina 效果）
    backgroundColor: '#ffffff' // 白色背景（不是透明的）
  }).then(canvas => {
    // 第 3 步：创建一个临时的 <a> 标签（不会添加到页面上）
    const link = document.createElement('a')
    link.download = '今日专属订单.png'  // 下载时的文件名

    // 第 4 步：把 canvas 转成 PNG 图片链接
    link.href = canvas.toDataURL('image/png')

    // 第 5 步：模拟点击 → 触发浏览器下载
    link.click()
  })
}
</script>

<style scoped>
/* ---------- 标题左侧装饰线 ---------- */
.view-section h2 {
  border-left: 5px solid #000;
  padding-left: 10px;
  margin-bottom: 20px;
}

/* ---------- 订单小票容器 ---------- */
.receipt-box {
  border: 2px dashed #000;       /* 虚线边框 → 票据/收据感 */
  padding: 20px;
  background: #fff;               /* 纯白背景 → 模拟纸张 */
  margin-bottom: 20px;
}

/* ---------- 小票标题 ---------- */
.receipt-title {
  text-align: center;
  font-weight: 900;               /* 极粗字体 */
  border-bottom: 2px solid #000; /* 底部黑线分隔标题和内容 */
  padding-bottom: 10px;
  margin-top: 0;
  border-left: none;              /* 覆盖 .view-section h2 的左侧黑线 */
}

/* ---------- 小票中每道菜的行 ---------- */
.cart-item {
  display: flex;
  justify-content: space-between;  /* 菜名靠左，删除按钮靠右 */
  padding: 15px 0;
  border-bottom: 1px solid #eee;  /* 浅灰色分隔线 */
  font-weight: bold;
}

/* ---------- 删除按钮 -------- */
.cart-item-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.delete-btn {
  background: #ff4444;             /* 红色背景 */
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;              /* 正圆形 */
  cursor: pointer;
  line-height: 18px;
  text-align: center;
}

/* ---------- 购物车为空提示 ---------- */
.empty-cart {
  text-align: center;
  color: #888;                     /* 灰色文字 */
  padding: 20px;
}

/* ---------- 小票底部（免单提示）---------- */
.receipt-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  font-weight: 900;
  border-top: 2px solid #000;     /* 顶部黑线分隔 */
  padding-top: 15px;
  letter-spacing: 1px;             /* 字体间距加宽 */
}

/* ---------- 导出按钮 ---------- */
.export-btn {
  width: 100%;                     /* 宽度撑满 */
  background: #000;                /* 黑底 */
  color: #fff;                     /* 白字 */
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

/**
 * 导出截图时隐藏删除按钮
 * 在导出前会给 #receipt-area 加上 data-html2canvas-ignore 属性
 * 这里让带有 hide-on-export 类的元素在截图时不显示
 */
[data-html2canvas-ignore] .hide-on-export,
.receipt-box[data-html2canvas-ignore] .hide-on-export {
  display: none !important;
}
</style>
