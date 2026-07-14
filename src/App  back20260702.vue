<template>
  <div class="app-container">

    <div 
      class="music-float-btn" 
      :class="{ 'is-playing': isPlaying }" 
      @click="toggleMusic"
    >
      💿
    </div>
    
    <header class="main-nav-bar">
      <h1>MAYE'S WORLD</h1>
      <div class="main-nav-links">
        <button :class="{ active: currentMainTab === 'menu' }" @click="currentMainTab = 'menu'">马也菜单</button>
        <button :class="{ active: currentMainTab === 'legend' }" @click="currentMainTab = 'legend'">马也传奇</button>
        <button :class="{ active: currentMainTab === 'intro' }" @click="currentMainTab = 'intro'">马也简介</button>
      </div>
    </header>

    <div v-if="currentMainTab === 'menu'">
      <div class="sub-nav-bar">
        <h2>🍽️ 厨房</h2>
        <div class="nav-links">
          <button :class="{ active: currentMenuView === 'home' }" @click="currentMenuView = 'home'">首页</button>
          <button :class="{ active: currentMenuView === 'menu' }" @click="currentMenuView = 'menu'">点菜</button>
          <button :class="{ active: currentMenuView === 'cart' }" @click="currentMenuView = 'cart'">
            已选 ({{ cart.length }})
          </button>
        </div>
      </div>
      
      <main v-if="currentMenuView === 'home'" class="view-section">
        <h2>今日推荐</h2>
        <div class="carousel" ref="carouselRef">
          <img v-for="(img, index) in homeImages" :key="index" :src="img" alt="轮播图" class="carousel-img" />
        </div>
      </main>

      <main v-if="currentMenuView === 'menu'" class="view-section">
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

      <main v-if="currentMenuView === 'cart'" class="view-section">
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
    </div>


    <div v-if="currentMainTab === 'legend'" class="view-section">
      <h2>📖 马也传奇</h2>
      
      <div v-if="!isLegendUnlocked" class="password-box">
        <h3>🔒 访问受限</h3>
        <p>这是我的私人领地，需要密码才能访问哦。</p>
        <input type="password" v-model="inputPassword" placeholder="请输入密码" class="pwd-input" />
        <button @click="checkPassword" class="pwd-btn">验证解锁</button>
      </div>

      <div v-else class="blog-list">
        <div v-for="post in blogPosts" :key="post.id" class="blog-card">
          <h3 class="blog-title">{{ post.title }}</h3>
          <span class="blog-date">{{ post.date }}</span>
          <p class="blog-content">{{ post.content }}</p>
        </div>
      </div>
    </div>

      <div v-else class="legend-unlocked-area">
  
        <div class="admin-write-box">
          <h3>✍️ 记录今天的生活</h3>
          <input v-model="newPost.title" placeholder="写个吸引人的标题..." class="blog-input" />
          <textarea v-model="newPost.content" placeholder="今天主厨又研究了什么新菜？还是有什么感悟？" rows="4" class="blog-textarea"></textarea>
          <button @click="publishPost" :disabled="isPublishing" class="publish-btn">
            {{ isPublishing ? '正在同步到云端...' : '公开发布传奇' }}
          </button>
        </div>

        <div class="blog-list">
          <div v-for="post in blogPosts" :key="post.id" class="blog-card">
            <h3 class="blog-title">{{ post.title }}</h3>
            <span class="blog-date">{{ post.date }}</span>
            <p class="blog-content">{{ post.content }}</p>
          </div>
        </div>
</div>

    <div v-if="currentMainTab === 'intro'" class="view-section">
      <h2>🚧 马也简介</h2>
      <div class="placeholder-box">
        <p>自我介绍模块正在施工中，暂时搁置...</p>
        <p>敬请期待！</p>
      </div>
    </div>

    <audio ref="audioRef" loop src="/music/bgm.mp3"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import html2canvas from 'html2canvas';

// --- 全局路由 (新增) ---
const currentMainTab = ref('menu'); // 顶级导航：menu(菜单), legend(传奇), intro(简介)

// --- 模块一：马也菜单的专属状态 (把你以前的 currentView 改了名字) ---
const currentMenuView = ref('home'); 

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

const cart = ref([]);

// --- 模块二：马也传奇的专属状态 (新增加密逻辑与日志数据) ---
const isLegendUnlocked = ref(false); // 记录是否已经解锁
const inputPassword = ref('');       // 用户输入的密码
const SECRET_CODE = '5201314';       // ⭐这里设置你的私人密码，你可以随便改


// --- 博客密码
const checkPassword = () => {
  if (inputPassword.value === SECRET_CODE) {
    isLegendUnlocked.value = true;
    inputPassword.value = ''; // 密码正确，清空输入框
    
    // ⭐ 新增这一行：密码正确解锁后，立刻去云端把日记拿下来显示！
    fetchBlogsFromCloud(); 
  } else {
    alert('密码好像不太对哦！再试一次？');
    inputPassword.value = '';
  }
}


// 你的日记/博客数据存放处
const blogPosts = ref([
  { 
    id: 1, 
    title: '网站第一次大升级', 
    date: '2026-07-01', 
    content: '今天给网站加入了马也传奇模块，以后就在这里记录生活啦！加了密码锁，感觉非常有安全感。' 
  },
  { 
    id: 2, 
    title: '研发新菜品的一天', 
    date: '2026-06-28', 
    content: '尝试做了一道新菜，味道出乎意料的好。也许下周可以把它加入到“马也菜单”里面去。' 
  }
]);

// --- 网站在线写入系统 ---
import { ref, onMounted } from 'vue';

// 填入你在 Supabase 拿到的凭证
const SUPABASE_URL = 'https://cwapbhxxcitzfvopgfnx.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YXBiaHh4Y2l0emZ2b3BnZm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NTMxNDYsImV4cCI6MjA5ODUyOTE0Nn0.MImSLwGwAmYKLoOOGHnEjKneXQbcO0QT0dkM5eQRh7Q';

const blogPosts = ref([]); // 初始为空，等着从数据库加载
const isPublishing = ref(false); // 控制按钮的加载状态

// 用于绑定输入框的数据结构
const newPost = ref({
  title: '',
  content: ''
});

// --- 核心功能 1：从云端数据库拉取日记 ---
const fetchBlogsFromCloud = async () => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=*&order=id.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    blogPosts.value = data; // 把云端抓到的数组送给网页渲染
  } catch (error) {
    console.error('拉取日记失败:', error);
  }
};

// --- 核心功能 2：把新日记推送到云端 ---
const publishPost = async () => {
  if (!newPost.value.title || !newPost.value.content) {
    alert('标题和内容都不能为空哦！');
    return;
  }
  
  isPublishing.value = true;
  
  // 自动获取今天的日期 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  try {
    // 通过快递员(fetch)把数据发给 Supabase 表格
    const response = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: newPost.value.title,
        content: newPost.value.content,
        date: today
      })
    });

    if (response.ok) {
      alert('🎉 传奇发布成功！已同步至云数据库。');
      // 清空输入框
      newPost.value.title = '';
      newPost.value.content = '';
      // 重新刷新列表，把刚写的刷出来
      await fetchBlogsFromCloud();
    }
  } catch (error) {
    alert('发布失败，检查下网络？');
  } finally {
    isPublishing.value = false;
  }
};

// 密码正确解锁时，或者页面刚加载时，去调用拉取数据的函数
// 你可以在原本的 checkPassword 成功后加入：fetchBlogsFromCloud()

// --- 音乐控制系统 (保持原样) ---
const audioRef = ref(null);   
const isPlaying = ref(false); 

const toggleMusic = () => {
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

// --- 轮播图滚动引擎 (保持原样) ---
const carouselRef = ref(null); 
let scrollTimer = null;        

const startAutoScroll = () => {
  scrollTimer = setInterval(() => {
    if (carouselRef.value) {
      const container = carouselRef.value;
      const scrollAmount = container.clientWidth; 
      
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, 3000); 
};

// --- 生命周期钩子 (保持原样) ---
onMounted(() => {
  startAutoScroll();
  const autoPlayBgm = () => {
    if (!isPlaying.value && audioRef.value) {
      audioRef.value.play().then(() => {
        isPlaying.value = true;
      }).catch(err => {
        console.log("浏览器拦截机制触发:", err);
      });
    }
    document.removeEventListener('click', autoPlayBgm);
    document.removeEventListener('touchstart', autoPlayBgm);
  };
  document.addEventListener('click', autoPlayBgm);
  document.addEventListener('touchstart', autoPlayBgm);
});

onUnmounted(() => {
  if (scrollTimer) clearInterval(scrollTimer);
});

// --- 核心业务逻辑 (保持原样) ---
const addToCart = (item) => {
  cart.value.push(item);
  alert(`【${item.name}】已加入今日菜单！`);
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1); 
};

const exportReceipt = () => {
  const receiptElement = document.getElementById('receipt-area');
  html2canvas(receiptElement, {
    scale: 2, 
    backgroundColor: '#ffffff'
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = '今日专属订单.png';
    link.href = canvas.toDataURL('image/png'); 
    link.click(); 
  });
};
</script>

<style>
/* ================= 基础物理层 ================= */
body {
  background-image: url('/images/background.jpg'); 
  background-size: cover; 
  background-position: center; 
  background-attachment: fixed; 
  margin: 0; 
  padding: 0;
}
</style>

<style scoped>
/* ================= 组件渲染层 ================= */
.app-container { 
  max-width: 600px; 
  margin: 0 auto; 
  padding: 20px; 
  font-family: 'Helvetica', sans-serif;
  background-color: rgba(255, 255, 255, 0.85); 
  min-height: 100vh; 
  box-shadow: 0 0 20px rgba(0,0,0,0.1); 
}

/* 音乐悬浮按钮样式保持不变 */
.music-float-btn { position: fixed; bottom: 20px; right: 20px; z-index: 9999; width: clamp(40px, 8vw, 60px); height: clamp(40px, 8vw, 60px); font-size: clamp(20px, 4vw, 30px); border-radius: 50%; background-color: rgba(255, 255, 255, 0.9); display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25); cursor: pointer; transition: all 0.3s ease; }
.music-float-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); }
@keyframes spinRecord { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.music-float-btn.is-playing { animation: spinRecord 3s linear infinite; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); }

/* ================= 新增：顶级导航栏样式 ================= */
.main-nav-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
.main-nav-bar h1 { margin: 0; font-weight: 900; letter-spacing: -1px; font-size: 24px;}
.main-nav-links button { background: none; border: 2px solid #000; padding: 8px 12px; margin-left: 5px; cursor: pointer; font-weight: bold; border-radius: 4px; transition: all 0.2s;}
.main-nav-links button.active { background: #000; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 0px #000;}

/* 子导航样式 (原先的导航栏) */
.sub-nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background-color: rgba(0,0,0,0.05); border: 1px dashed #000;}
.sub-nav-bar h2 { margin: 0; font-size: 18px; }
.nav-links button { background: none; border: 1px solid #000; padding: 5px 10px; margin-left: 5px; cursor: pointer; font-weight: bold; }
.nav-links button.active { background: #000; color: #fff; }

.view-section h2 { border-left: 5px solid #000; padding-left: 10px; margin-bottom: 20px; }

/* 轮播图、菜单网格、小票样式保持不变 */
.carousel { display: flex; overflow-x: auto; gap: 15px; scroll-snap-type: x mandatory; padding-bottom: 10px; }
.carousel-img { width: 100%; max-height: 250px; object-fit: cover; scroll-snap-align: start; border: 2px solid #000; flex-shrink: 0; }
.menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.food-card { border: 2px solid #000; display: flex; flex-direction: column; }
.food-img { width: 100%; height: 150px; object-fit: cover; border-bottom: 2px solid #000; }
.food-info { display: flex; justify-content: center; padding: 10px; font-weight: bold; font-size: 16px;}
.add-btn { background: #000; color: #fff; border: none; padding: 10px; cursor: pointer; font-weight: bold; transition: background 0.2s; border-top: 2px solid #000; }
.add-btn:hover { background: #333; }
.receipt-box { border: 2px dashed #000; padding: 20px; background: #fff; margin-bottom: 20px; }
.receipt-title { text-align: center; font-weight: 900; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 0; border-left: none;}
.cart-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; font-weight: bold;}
.cart-item-right { display: flex; align-items: center; gap: 10px; }
.delete-btn { background: #ff4444; color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; line-height: 18px; text-align: center;}
.empty-cart { text-align: center; color: #888; padding: 20px; }
.receipt-footer { text-align: center; margin-top: 20px; font-size: 14px; font-weight: 900; border-top: 2px solid #000; padding-top: 15px; letter-spacing: 1px;}
.export-btn { width: 100%; background: #000; color: #fff; padding: 15px; font-size: 16px; font-weight: bold; border: none; cursor: pointer; }
[data-html2canvas-ignore] .hide-on-export, .receipt-box[data-html2canvas-ignore] .hide-on-export { display: none !important; }


/* ================= 新增：密码框与博客样式 ================= */
.password-box { text-align: center; padding: 40px 20px; border: 2px solid #000; background: #fff; }
.pwd-input { padding: 10px; border: 2px solid #000; margin-bottom: 15px; width: 80%; font-size: 16px; text-align: center; font-weight: bold;}
.pwd-btn { background: #000; color: #fff; border: none; padding: 10px 30px; font-weight: bold; cursor: pointer; font-size: 16px; transition: 0.2s;}
.pwd-btn:hover { background: #333; }

.blog-list { display: flex; flex-direction: column; gap: 20px; }
.blog-card { border: 2px solid #000; padding: 20px; background: #fff; box-shadow: 4px 4px 0px rgba(0,0,0,1); }
.blog-title { margin: 0 0 10px 0; font-weight: 900; }
.blog-date { display: inline-block; background: #000; color: #fff; padding: 3px 8px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
.blog-content { line-height: 1.6; margin: 0; color: #333; }

.admin-write-box {
  border: 3px solid #000;
  padding: 20px;
  background: #fff;
  margin-bottom: 30px;
  box-shadow: 6px 6px 0px #000;
}
.blog-input, .blog-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #000;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 14px;
  font-family: inherit;
}
.blog-input:focus, .blog-textarea:focus {
  outline: none;
  background: #f9f9f9;
}
.publish-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 12px 24px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.publish-btn:disabled {
  background: #999;
  cursor: not-allowed;
}

/* 施工中占位框 */
.placeholder-box { text-align: center; padding: 50px; border: 2px dashed #999; color: #666; font-weight: bold;}
</style>