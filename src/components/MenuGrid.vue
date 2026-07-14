<!--
  =====================================================================
  MenuGrid.vue — 菜品菜单网格组件
  =====================================================================
  功能：以 2 列网格展示所有菜品
  每道菜显示图片、菜名、和"想吃这个！"按钮
  点击按钮后通过 emit 通知父组件把菜品加入购物车

  使用方式：
    <MenuGrid :items="menuItems" @add-to-cart="addToCart($event)" />

  Props：
    items — 菜品数据数组，每项包含 { id, name, image }

  Emits：
    add-to-cart — 用户点击"想吃这个"时，把菜品对象传给父组件
-->

<template>
  <main class="view-section">
    <h2>主厨菜单</h2>

    <!--
      menu-grid：CSS Grid 2 列布局
    -->
    <div class="menu-grid">
      <!--
        v-for：遍历菜品数据，每个菜品生成一张 food-card（菜品卡片）
        :key="item.id" → 用菜品 id 作为唯一标识
      -->
      <div v-for="item in items" :key="item.id" class="food-card">
        <!--
          菜品图片
          :src="item.image" → 动态绑定图片路径
          :alt="item.name"  → 图片替代文字（SEO 和无障碍访问用）
        -->
        <img :src="item.image" :alt="item.name" class="food-img" />

        <!-- 菜品名称区域 -->
        <div class="food-info">
          <span class="name">{{ item.name }}</span>
        </div>

        <!--
          "想吃这个"按钮
          @click="$emit('add-to-cart', item)"：
            点击时把整个菜品对象 item（包含 id, name, image）
            通过 add-to-cart 事件发送给父组件
            父组件的购物车里就会新增这道菜
        -->
        <button class="add-btn" @click="$emit('add-to-cart', item)">
          想吃这个！
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
/**
 * ==================== Props 定义 ====================
 *
 * items：菜品菜单数据
 * 每个菜品对象格式：{ id: 1, name: '菜名', image: '/images/xxx.webp' }
 * 由父组件（App.vue）提供数据
 */
defineProps({
  items: {
    type: Array,        // 数组类型
    default: () => []   // 默认空数组
  }
})

/**
 * ==================== Emits 定义 ====================
 * 'add-to-cart'：用户想吃某道菜时触发
 * 携带参数：被点击的菜品对象
 */
defineEmits(['add-to-cart'])
</script>

<style scoped>
/* ---------- 标题左侧装饰线 ---------- */
.view-section h2 {
  border-left: 5px solid #000;
  padding-left: 10px;
  margin-bottom: 20px;
}

/* ---------- 2 列网格布局 ---------- */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;   /* 两列等宽：每个 1 份（fr = fraction 份数） */
  gap: 15px;                         /* 卡片之间的间距 */
}

/* ---------- 菜品卡片 ---------- */
.food-card {
  border: 2px solid #000;           /* 黑色边框 */
  display: flex;
  flex-direction: column;            /* 内容竖着排列：图 → 菜名 → 按钮 */
}

/* ---------- 菜品图片 ---------- */
.food-img {
  width: 100%;                       /* 宽度撑满卡片 */
  height: 150px;                     /* 固定高度 */
  object-fit: cover;                 /* 图片按比例裁剪填充（不变形拉伸） */
  border-bottom: 2px solid #000;    /* 底部黑线分隔图片和文字 */
}

/* ---------- 菜品名称 ---------- */
.food-info {
  display: flex;
  justify-content: center;           /* 文字水平居中 */
  padding: 10px;
  font-weight: bold;
  font-size: 16px;
}

/* ---------- "想吃这个"按钮 ---------- */
.add-btn {
  background: #000;                  /* 黑底 */
  color: #fff;                       /* 白字 */
  border: none;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;       /* 背景色变化平滑过渡 0.2 秒 */
  border-top: 2px solid #000;
}

/* ---------- 按钮悬停效果 ---------- */
.add-btn:hover {
  background: #333;                  /* 鼠标悬停时变成深灰色 */
}
</style>
