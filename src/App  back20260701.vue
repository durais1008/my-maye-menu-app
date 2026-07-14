<template>
  <div class="app-container">

    <div 
      class="music-float-btn" 
      :class="{ 'is-playing': isPlaying }" 
      @click="toggleMusic"
    >
      💿
    </div>
    
    <header class="nav-bar">
      <h1>马也厨房</h1>
      <div class="nav-links">
        <button :class="{ active: currentView === 'home' }" @click="currentView = 'home'">首页</button>
        <button :class="{ active: currentView === 'menu' }" @click="currentView = 'menu'">点菜</button>
        <button :class="{ active: currentView === 'cart' }" @click="currentView = 'cart'">
          已选 ({{ cart.length }})
        </button>
      </div>
    </header>
    
    <main v-if="currentView === 'home'" class="view-section">
      <h2>今日推荐</h2>
      <div class="carousel" ref="carouselRef">
        <img v-for="(img, index) in homeImages" :key="index" :src="img" alt="轮播图" class="carousel-img" />
      </div>
    </main>

    <main v-if="currentView === 'menu'" class="view-section">
      <h2>主厨菜单</h2>
      <div class="menu-grid">
        <div v-for="item in menuItems" :key="item.id" class="food-card">
          <img :src="item.image" :alt="item.name" class="food-img" />
          <div class="food-info">
            <span class="name">{{ item.name }}</span>
          </div>
          <button class="add-btn" @click="addToCart(item)">想吃这个！</button>
        </div>
      </div>
    </main>

    <main v-if="currentView === 'cart'" class="view-section">
      <div id="receipt-area" class="receipt-box">
        <h2 class="receipt-title">💖 专属订单 / VIP ORDER</h2>
        
        <div v-if="cart.length === 0" class="empty-cart">还没有选好今天要吃什么哦...</div>
        
        <div v-for="(item, index) in cart" :key="index" class="cart-item">
          <span>{{ item.name }}</span>
          <div class="cart-item-right">
            <button class="delete-btn hide-on-export" @click="removeFromCart(index)">×</button>
          </div>
        </div>

        <div class="receipt-footer" v-if="cart.length > 0">
          <span>全场免单 · 主厨马上准备！</span>
        </div>
      </div>

      <button v-if="cart.length > 0" @click="exportReceipt" class="export-btn">发送给主厨 (导出订单)</button>
    </main>

    <audio ref="audioRef" loop src="/music/bgm.mp3"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import html2canvas from 'html2canvas';

// --- 状态管理 (State Machine) ---
const currentView = ref('home'); // 控制当前路由

const homeImages = ref([
  '/images/马也红烩牛肉抱蛋.jpg',
  '/images/超美味咖喱饭.jpg',
  '/images/鲫鱼豆腐汤.jpg'
]);

const menuItems = ref([
  { id: 1, name: '马也红烩牛肉抱蛋', image: '/images/马也红烩牛肉抱蛋.webp' },
  { id: 2, name: '超美味咖喱饭', image: '/images/超美味咖喱饭.webp' },
  { id: 3, name: '萝卜炖牛肉丸', image: '/images/萝卜炖牛肉丸.webp' },
  { id: 4, name: '韭菜炒蛋配黑椒牛肉', image: '/images/韭菜炒蛋配黑椒牛肉.webp' },
  { id: 5, name: '鸡丝凉面', image: '/images/鸡丝凉面.webp' },
  { id: 6, name: '小炒坤', image: '/images/小炒坤.webp' },
  { id: 7, name: '巫毒饮料', image: '/images/巫毒饮料.webp' },
  { id: 8, name: 'Damn Ber Fan', image: '/images/damn ber fan.webp' }
]);

const cart = ref([]); // 购物车动态数组

// --- 音乐控制系统 ---
const audioRef = ref(null);   // 指向 <audio> 的内存指针
const isPlaying = ref(false); // 播放状态寄存器

const toggleMusic = () => {
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play();
  }
  isPlaying.value = !isPlaying.value; // 翻转布尔值
};

// --- 轮播图滚动引擎 (异步时钟) ---
const carouselRef = ref(null); // 指向轮播图容器
let scrollTimer = null;        // 存储时钟句柄

const startAutoScroll = () => {
  scrollTimer = setInterval(() => {
    if (carouselRef.value) {
      const container = carouselRef.value;
      const scrollAmount = container.clientWidth; // 步长
      
      // 碰撞检测：到达最右侧后复位，否则继续步进
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, 3000); // 3000毫秒节拍
};

// --- 生命周期钩子 ---
onMounted(() => {
  // DOM 挂载完毕后，启动轮播引擎
  startAutoScroll();

  // 定义全局物理中断函数，破解浏览器禁止自动播放的限制
  const autoPlayBgm = () => {
    if (!isPlaying.value && audioRef.value) {
      audioRef.value.play().then(() => {
        isPlaying.value = true;
      }).catch(err => {
        console.log("浏览器拦截机制触发:", err);
      });
    }
    // 首次交互后销毁监听，释放 CPU 资源
    document.removeEventListener('click', autoPlayBgm);
    document.removeEventListener('touchstart', autoPlayBgm);
  };

  document.addEventListener('click', autoPlayBgm);
  document.addEventListener('touchstart', autoPlayBgm);
});

onUnmounted(() => {
  // 组件销毁前回收时钟资源，防止内存泄漏
  if (scrollTimer) clearInterval(scrollTimer);
});

// --- 核心业务逻辑 ---
const addToCart = (item) => {
  cart.value.push(item);
  alert(`【${item.name}】已加入今日菜单！`);
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1); // 数组切片删除
};

const exportReceipt = () => {
  const receiptElement = document.getElementById('receipt-area');
  
  // 显存重绘：将 DOM 树渲染为二进制 Canvas 画布
  html2canvas(receiptElement, {
    scale: 2, // 提升像素密度防锯齿
    backgroundColor: '#ffffff'
  }).then(canvas => {
    // 凭空伪造下载通道
    const link = document.createElement('a');
    link.download = '今日专属订单.png';
    link.href = canvas.toDataURL('image/png'); // 提取 base64 数据流
    link.click(); 
  });
};
</script>

<style>
/* ================= 基础物理层 ================= */
/* 这里没有 scoped，直接作用于系统的最底端 <body> 节点 */
body {
  /* 挂载你的私人定制背景图 */
  background-image: url('/images/background.jpg'); 
  background-size: cover; 
  background-position: center; 
  /* 开启硬件固化：无论内容多长，背景死死钉住不随之滚动 */
  background-attachment: fixed; 
  margin: 0; 
  padding: 0;
}
</style>

<style scoped>
/* ================= 组件渲染层 ================= */

/* 应用主板 (悬浮半透明玻璃面板) */
.app-container { 
  max-width: 600px; 
  margin: 0 auto; 
  padding: 20px; 
  font-family: 'Helvetica', sans-serif;
  /* 核心魔法：使用 rgba 设置 85% 白色不透明度，透出底层的 background.jpg */
  background-color: rgba(255, 255, 255, 0.85); 
  min-height: 100vh; 
  box-shadow: 0 0 20px rgba(0,0,0,0.1); 
}


/* ================= 悬浮音乐图标系统 ================= */

/* 1. 基础形态与固定定位 */
.music-float-btn {
  /* 脱离正常排版流，死死钉在屏幕左上角 */
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999; /* 保证它永远在最上层，不会被图片挡住 */
  
  /* 响应式尺寸魔法：clamp(最小值, 理想值, 最大值) */
  /* 在手机上它会小一点(40px)，在电脑上会按 8vw 变大，但绝不超过 60px */
  width: clamp(40px, 8vw, 60px);
  height: clamp(40px, 8vw, 60px);
  font-size: clamp(20px, 4vw, 30px);
  
  /* 画一个圆，并让里面的光盘 emoji 绝对居中 */
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* 硬件级的高级阴影：X轴偏移0, Y轴偏移4px, 模糊半径15px, 颜色为带透明度的黑 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  
  /* 让所有状态切换（比如悬停变大）都有 0.3 秒的平滑过渡 */
  transition: all 0.3s ease;
}

/* 2. 鼠标悬停时的微交互感 */
.music-float-btn:hover {
  transform: scale(1.1); /* 鼠标放上去时放大 10% */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* 3. 定义旋转动画引擎 (类似 C 语言的循环函数) */
@keyframes spinRecord {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 4. 当 JS 判定 isPlaying 为 true 时，激活这个类 */
.music-float-btn.is-playing {
  /* 调用上面的引擎：3秒转一圈，匀速(linear)，无限循环(infinite) */
  animation: spinRecord 3s linear infinite;
  /* 播放时给一点轻微的呼吸发光感 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

/* 导航模块 */
.nav-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
.nav-bar h1 { margin: 0; font-weight: 900; letter-spacing: -1px; }
.nav-links button { background: none; border: 1px solid #000; padding: 5px 10px; margin-left: 5px; cursor: pointer; font-weight: bold; }
.nav-links button.active { background: #000; color: #fff; }


/* 视图模块标题 */
.view-section h2 { border-left: 5px solid #000; padding-left: 10px; margin-bottom: 20px; }

/* 轮播图模块 (借助 flex 和 CSS 硬件吸附特性) */
.carousel { display: flex; overflow-x: auto; gap: 15px; scroll-snap-type: x mandatory; padding-bottom: 10px; }
.carousel-img { width: 100%; max-height: 250px; object-fit: cover; scroll-snap-align: start; border: 2px solid #000; flex-shrink: 0; }

/* 点菜网格模块 */
.menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.food-card { border: 2px solid #000; display: flex; flex-direction: column; }
.food-img { width: 100%; height: 150px; object-fit: cover; border-bottom: 2px solid #000; }
.food-info { display: flex; justify-content: center; padding: 10px; font-weight: bold; font-size: 16px;}
.add-btn { background: #000; color: #fff; border: none; padding: 10px; cursor: pointer; font-weight: bold; transition: background 0.2s; border-top: 2px solid #000; }
.add-btn:hover { background: #333; }

/* 小票发票模块 */
.receipt-box { border: 2px dashed #000; padding: 20px; background: #fff; margin-bottom: 20px; }
.receipt-title { text-align: center; font-weight: 900; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 0; border-left: none;}
.cart-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; font-weight: bold;}
.cart-item-right { display: flex; align-items: center; gap: 10px; }
.delete-btn { background: #ff4444; color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; line-height: 18px; text-align: center;}
.empty-cart { text-align: center; color: #888; padding: 20px; }
.receipt-footer { text-align: center; margin-top: 20px; font-size: 14px; font-weight: 900; border-top: 2px solid #000; padding-top: 15px; letter-spacing: 1px;}

/* 底部交互面板 */
.export-btn { width: 100%; background: #000; color: #fff; padding: 15px; font-size: 16px; font-weight: bold; border: none; cursor: pointer; }

/* 编译期属性选择器：截图时绕过目标节点 */
[data-html2canvas-ignore] .hide-on-export, .receipt-box[data-html2canvas-ignore] .hide-on-export { display: none !important; }
</style>