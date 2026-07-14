<!--
  =====================================================================
  SubNavBar.vue — 菜单模块的二级导航栏
  =====================================================================
  设计：玻璃态面板 + 胶囊按钮 + 橘红渐变激活态
-->

<template>
  <div class="sub-nav-bar">
    <h2>🍽️ 厨房</h2>

    <div class="nav-links">
      <button
        v-for="item in subNavItems"
        :key="item.key"
        :class="{ active: currentView === item.key }"
        @click="$emit('view-change', item.key)"
      >
        {{ item.label }}{{ item.key === 'cart' ? ` (${cartCount})` : '' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentView: { type: String, default: 'home' },
  cartCount:    { type: Number, default: 0 }
})

defineEmits(['view-change'])

const subNavItems = [
  { key: 'home', label: '首页' },
  { key: 'menu', label: '点菜' },
  { key: 'cart', label: '已选' }
]
</script>

<style scoped>
/* ---------- 二级导航容器（玻璃态）---------- */
.sub-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  /* 玻璃态 */
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ---------- 标题 ---------- */
.sub-nav-bar h2 {
  margin: 0;
  font-size: 16px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  color: #D7E2EA;
}

/* ---------- 按钮（默认态）---------- */
.nav-links button {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(215, 226, 234, 0.65);
  padding: 6px 14px;
  margin-left: 6px;
  cursor: pointer;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 500;
  font-size: 13px;
  border-radius: 50px;               /* 胶囊形 */
  transition: all 0.25s ease;
}

/* ---------- 悬停态 ---------- */
.nav-links button:hover {
  border-color: rgba(255, 255, 255, 0.20);
  color: #D7E2EA;
  background: rgba(255, 255, 255, 0.06);
}

/* ---------- 激活态 ---------- */
.nav-links button.active {
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  border-color: transparent;
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(224, 62, 62, 0.30);
}
</style>
