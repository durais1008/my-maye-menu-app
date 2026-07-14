<!--
  =====================================================================
  CartPanel.vue — 购物车 + 订单导出组件
  =====================================================================
  设计：玻璃态小票 + 大圆角 + 橘红渐变导出按钮
-->

<template>
  <main class="view-section">
    <!-- 订单小票（玻璃态纸张） -->
    <div id="receipt-area" class="receipt-box reveal">
      <h2 class="receipt-title">💖 专属订单 / VIP ORDER</h2>

      <!-- 空购物车 -->
      <div v-if="cart.length === 0" class="empty-cart">
        还没有选好今天要吃什么哦...
      </div>

      <!-- 已选菜品列表 -->
      <div v-for="(item, index) in cart" :key="index" class="cart-item">
        <span>{{ item.name }}</span>
        <div class="cart-item-right">
          <button
            class="delete-btn hide-on-export"
            @click="$emit('remove-from-cart', index)"
          >×</button>
        </div>
      </div>

      <!-- 底部免单提示 -->
      <div class="receipt-footer" v-if="cart.length > 0">
        <span>全场免单 · 主厨马上准备！</span>
      </div>
    </div>

    <!-- 导出订单按钮（橘红渐变） -->
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
import html2canvas from 'html2canvas'

defineProps({
  cart: { type: Array, default: () => [] }
})

defineEmits(['remove-from-cart'])

const exportReceipt = () => {
  const receiptElement = document.getElementById('receipt-area')
  html2canvas(receiptElement, {
    scale: 2,
    backgroundColor: '#1A1A1A'       /* 导出背景用深灰色 */
  }).then(canvas => {
    const link = document.createElement('a')
    link.download = '今日专属订单.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}
</script>

<style scoped>
/* ---------- 小票容器（玻璃态纸张）---------- */
.receipt-box {
  background: rgba(255, 255, 255, 0.04);        /* 玻璃底 */
  border: 1px solid rgba(255, 255, 255, 0.10);  /* 半透白边框 */
  border-radius: 20px;                            /* 大圆角 */
  padding: 24px 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ---------- 小票标题 ---------- */
.receipt-title {
  text-align: center;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #D7E2EA;
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  padding-bottom: 12px;
  margin-top: 0;
}

/* ---------- 菜品行 ---------- */
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 15px;
  color: #D7E2EA;
}

/* ---------- 删除按钮（玻璃态红）---------- */
.delete-btn {
  background: rgba(255, 68, 68, 0.15);
  color: rgba(255, 100, 100, 0.85);
  border: 1px solid rgba(255, 68, 68, 0.25);
  width: 24px;
  height: 24px;
  border-radius: 50%;                /* 正圆形 */
  cursor: pointer;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: rgba(255, 68, 68, 0.30);
  border-color: rgba(255, 68, 68, 0.50);
}

/* ---------- 空购物车提示 ---------- */
.empty-cart {
  text-align: center;
  color: rgba(215, 226, 234, 0.45);
  padding: 24px;
  font-size: 14px;
}

/* ---------- 底部免单 ---------- */
.receipt-footer {
  text-align: center;
  margin-top: 20px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: rgba(215, 226, 234, 0.65);
  border-top: 1px solid rgba(255, 255, 255, 0.10);
  padding-top: 16px;
  letter-spacing: 0.5px;
}

/* ---------- 导出按钮（橘红渐变）---------- */
.export-btn {
  width: 100%;
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  color: #FFFFFF;
  padding: 16px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 16px;               /* 大圆角 */
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(224, 62, 62, 0.30);
}

.export-btn:hover {
  background: linear-gradient(135deg, #FF8050, #E85555);
  box-shadow: 0 6px 28px rgba(224, 62, 62, 0.45);
  transform: translateY(-1px);
}
</style>
