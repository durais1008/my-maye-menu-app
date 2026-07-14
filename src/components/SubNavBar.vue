<!--
  =====================================================================
  SubNavBar.vue — 菜单模块的二级导航栏
  =====================================================================
  功能：在"马也菜单"模块中显示三个二级标签：
   - 首页（home）  → 显示轮播图推荐
   - 点菜（menu）  → 显示菜品菜单网格
   - 已选（cart）  → 显示购物车，圆括号里显示已选数量
  点击按钮通过 emit 通知父组件切换二级视图

  使用方式：
    <SubNavBar :current-view="currentMenuView" :cart-count="cart.length" @view-change="currentMenuView = $event" />

  Props：
    currentView — 当前选中的二级视图名（'home' / 'menu' / 'cart'）
    cartCount   — 购物车中菜品的数量（显示在按钮上）
-->

<template>
  <div class="sub-nav-bar">
    <!-- 二级导航标题 -->
    <h2>🍽️ 厨房</h2>

    <!-- 二级导航按钮组 -->
    <div class="nav-links">
      <button
        v-for="item in subNavItems"
        :key="item.key"
        :class="{ active: currentView === item.key }"
        @click="$emit('view-change', item.key)"
      >
        <!--
          如果按钮有 count 属性（即"已选"按钮），则在文字后显示数量
          例如：已选 (3)
        -->
        {{ item.label }}{{ item.key === 'cart' ? ` (${cartCount})` : '' }}
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * ==================== Props 定义 ====================
 *
 * currentView：当前激活的二级页面
 * cartCount：购物车中的菜品数量（显示在"已选"按钮旁边）
 */
defineProps({
  currentView: {
    type: String,
    default: 'home'   // 默认显示"首页"
  },
  cartCount: {
    type: Number,
    default: 0        // 默认数量为 0
  }
})

/** 向父组件发送 view-change 事件 */
defineEmits(['view-change'])

/**
 * ==================== 二级导航配置 ====================
 *
 * subNavItems：二级导航按钮的配置
 * 和 MainNavBar 一样的设计思路：用数据驱动模板
 * key 的值对应父组件中 currentMenuView 的值
 */
const subNavItems = [
  { key: 'home', label: '首页' },
  { key: 'menu', label: '点菜' },
  { key: 'cart', label: '已选' }
]
</script>

<style scoped>
/**
 * 极简黑白风格，带一点虚线边框的工业感
 */

/* ---------- 二级导航整体容器 ---------- */
.sub-nav-bar {
  display: flex;
  justify-content: space-between;  /* 标题靠左，按钮靠右 */
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.05);  /* 5% 黑色 = 淡灰色背景 */
  border: 1px dashed #000;                /* 虚线边框 → 手绘草稿感 */
}

/* ---------- 标题 ---------- */
.sub-nav-bar h2 {
  margin: 0;
  font-size: 18px;
}

/* ---------- 按钮基础样式 ---------- */
.nav-links button {
  background: none;
  border: 1px solid #000;          /* 细黑边框 */
  padding: 5px 10px;
  margin-left: 5px;
  cursor: pointer;
  font-weight: bold;
}

/* ---------- 按钮激活状态 ---------- */
.nav-links button.active {
  background: #000;                /* 黑底白字 */
  color: #fff;
}
</style>
