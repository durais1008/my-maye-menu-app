<!--
  =====================================================================
  RecipeAI.vue — AI 智能厨房（DeepSeek 菜谱生成器）
  =====================================================================
  输入食材或菜名 → AI 生成详细菜谱
  非菜谱问题自动拒绝
-->

<template>
  <div class="view-section">

    <!-- ========== API Key 设置区（首次使用）========== -->
    <div v-if="!hasKey" class="setup-box reveal">
      <h3>🔑 首次使用 — 设置 API Key</h3>
      <p class="setup-desc">
        本功能使用 DeepSeek AI 生成菜谱，需要一个 API Key。
        <br />前往
        <a href="https://platform.deepseek.com/api_keys" target="_blank" class="setup-link">
          platform.deepseek.com
        </a>
        创建 Key 后粘贴到下方。
      </p>
      <div class="key-input-row">
        <input
          v-model="keyInput"
          type="password"
          placeholder="sk-xxxxxxxxxxxxxxxx"
          class="key-input"
          @keyup.enter="handleSaveKey"
        />
        <button @click="handleSaveKey" class="key-save-btn">保存</button>
      </div>
      <p class="setup-note">
        ⚠️ Key 仅保存在你的浏览器中，不会上传到任何服务器。
      </p>
    </div>

    <!-- ========== 已设置 Key → 显示主界面 ========== -->
    <template v-else>
      <h2>🤖 AI 智能厨房</h2>
      <p class="subtitle">输入食材或菜名，马也大厨为你生成菜谱</p>

      <!-- 输入区域 -->
      <div class="input-area reveal">
        <input
          v-model="query"
          type="text"
          placeholder="例如：鸡胸肉、宫保鸡丁、牛肉..."
          class="recipe-input"
          @keyup.enter="handleAsk"
          :disabled="loading"
        />
        <button
          @click="handleAsk"
          :disabled="loading || !query.trim()"
          class="ask-btn"
        >
          {{ loading ? '正在生成...' : '🔍 生成菜谱' }}
        </button>
      </div>

      <!-- 快捷标签 -->
      <div class="quick-tags reveal reveal-delay-1">
        <button
          v-for="tag in quickTags"
          :key="tag"
          @click="query = tag; handleAsk()"
          class="quick-tag"
          :disabled="loading"
        >{{ tag }}</button>
      </div>

      <!-- 加载动画 -->
      <div v-if="loading" class="loading-box">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <p class="loading-text">马也大厨正在思考菜谱...</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMsg && !loading" class="error-box">
        ❌ {{ errorMsg }}
      </div>

      <!-- AI 回复内容（不用 reveal — 这是用户操作后动态生成的） -->
      <div v-if="response" class="response-box">
        <!-- 用正则解析 Markdown 渲染 -->
        <div class="recipe-content" v-html="renderMarkdown(response)"></div>

        <!-- 重新生成按钮 -->
        <button v-if="response" @click="handleRegenerate" class="regenerate-btn" :disabled="loading">
          🔄 重新生成
        </button>
      </div>

      <!-- 底部 Key 管理 -->
      <div class="key-manage">
        <button @click="showKeyManage = !showKeyManage" class="key-toggle-btn">
          ⚙️ API Key 管理
        </button>
        <div v-if="showKeyManage" class="key-manage-panel">
          <div class="key-input-row">
            <input
              v-model="keyInput"
              type="password"
              placeholder="输入新的 API Key"
              class="key-input"
            />
            <button @click="handleSaveKey" class="key-save-btn">更新</button>
            <button @click="handleClearKey" class="key-clear-btn">清除</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDeepSeek } from '../composables/useDeepSeek.js'

// ==================== DeepSeek 实例 ====================
const { response, loading, errorMsg, hasKey, saveKey, clearKey, askRecipe } = useDeepSeek()

// ==================== 本地状态 ====================
const query = ref('')           // 用户输入
const keyInput = ref('')        // Key 输入框
const showKeyManage = ref(false) // Key 管理面板开关

// ==================== 快捷标签 ====================
const quickTags = [
  '鸡胸肉', '牛肉', '土豆', '番茄炒蛋', '红烧肉', '鱼香肉丝'
]

// ==================== 保存 Key ====================
const handleSaveKey = () => {
  if (!keyInput.value.trim()) return
  if (saveKey(keyInput.value.trim())) {
    keyInput.value = ''
    showKeyManage.value = false
  } else {
    alert('保存失败，请检查浏览器是否支持 localStorage')
  }
}

// ==================== 清除 Key ====================
const handleClearKey = () => {
  if (confirm('确定要清除已保存的 API Key 吗？')) {
    clearKey()
    keyInput.value = ''
  }
}

// ==================== 发送查询 ====================
const handleAsk = async () => {
  if (!query.value.trim() || loading.value) return
  await askRecipe(query.value.trim())
}

// ==================== 重新生成 ====================
const handleRegenerate = () => {
  if (query.value.trim()) {
    handleAsk()
  }
}

// ==================== Markdown 简单渲染 ====================
/**
 * 将 AI 返回的 Markdown 文本转为 HTML
 * 支持：**粗体**、### 标题、- 列表、--- 分隔线、换行
 */
const renderMarkdown = (text) => {
  if (!text) return ''

  // 转义 HTML 防止 XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 分隔线
  html = html.replace(/^---$/gm, '<hr class="md-hr">')

  // 标题（### → h3）
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')

  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // emoji 前置行（如 "🍳 **菜名**"）
  html = html.replace(/^(🍳|📋|🧂|📝|💡)/gm, '<span class="md-emoji">$1</span>')

  // 列表项
  html = html.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="md-li-num">$1. $2</li>')

  // 换行
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')

  return `<p>${html}</p>`
}
</script>

<style scoped>
/* ==================== 通用 ==================== */
.view-section h2 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #D7E2EA;
  margin: 0 0 8px;
  padding-left: 12px;
  border-left: 3px solid #FF6B35;
}

.subtitle {
  color: rgba(215, 226, 234, 0.50);
  font-size: 13px;
  margin: 0 0 24px;
  padding-left: 12px;
}

/* ==================== Key 设置区 ==================== */
.setup-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
}

.setup-box h3 {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  color: #D7E2EA;
  margin: 0 0 12px;
}

.setup-desc {
  color: rgba(215, 226, 234, 0.55);
  font-size: 13px;
  line-height: 1.8;
  margin: 0 0 20px;
}

.setup-link {
  color: #FF6B35;
  text-decoration: underline;
}

.key-input-row {
  display: flex;
  gap: 8px;
  max-width: 420px;
  margin: 0 auto 12px;
}

.key-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 10px 14px;
  color: #D7E2EA;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-size: 13px;
  outline: none;
}

.key-input:focus { border-color: #FF6B35; }

.key-save-btn {
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.key-clear-btn {
  background: rgba(255, 68, 68, 0.15);
  color: rgba(255, 100, 100, 0.85);
  border: 1px solid rgba(255, 68, 68, 0.25);
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13px;
  cursor: pointer;
}

.setup-note {
  color: rgba(215, 226, 234, 0.30);
  font-size: 11px;
  margin: 0;
}

/* ==================== 输入区 ==================== */
.input-area {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.recipe-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 14px 18px;
  color: #D7E2EA;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-size: 15px;
  outline: none;
  transition: border-color 0.25s;
}

.recipe-input:focus { border-color: #FF6B35; }
.recipe-input::placeholder { color: rgba(215, 226, 234, 0.25); }

.ask-btn {
  background: linear-gradient(135deg, #FF6B35, #E03E3E);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 14px 24px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s;
}

.ask-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 6px 24px rgba(224, 62, 62, 0.40);
}

.ask-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 快捷标签 ==================== */
.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.quick-tag {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: rgba(215, 226, 234, 0.65);
  border-radius: 50px;
  padding: 7px 16px;
  font-size: 12px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover:not(:disabled) {
  border-color: #FF6B35;
  color: #FF6B35;
  background: rgba(255, 107, 53, 0.08);
}

/* ==================== 加载动画 ==================== */
.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
}

.loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FF6B35;
  animation: dotBounce 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.loading-text {
  color: rgba(215, 226, 234, 0.40);
  font-size: 14px;
  margin: 0 0 0 12px;
}

/* ==================== 错误提示 ==================== */
.error-box {
  background: rgba(255, 68, 68, 0.10);
  border: 1px solid rgba(255, 68, 68, 0.25);
  border-radius: 14px;
  padding: 16px 20px;
  color: rgba(255, 120, 120, 0.90);
  font-size: 14px;
  margin-bottom: 20px;
}

/* ==================== 回复区域 ==================== */
.response-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
  padding: 24px 22px;
  margin-top: 4px;
}

/* ==================== 渲染的 Markdown 内容 ==================== */
.recipe-content :deep(p) {
  margin: 0;
}

.recipe-content :deep(.md-hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
  margin: 20px 0;
}

.recipe-content :deep(.md-h3) {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: #D7E2EA;
  margin: 20px 0 8px;
}

.recipe-content :deep(.md-h2) {
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #FF6B35;
  margin: 18px 0 10px;
}

.recipe-content :deep(strong) {
  color: #FF6B35;
  font-weight: 600;
}

.recipe-content :deep(.md-emoji) {
  font-size: 18px;
}

.recipe-content :deep(.md-li) {
  color: rgba(215, 226, 234, 0.80);
  font-size: 14px;
  line-height: 1.8;
  padding-left: 8px;
  list-style: disc inside;
}

.recipe-content :deep(.md-li-num) {
  color: rgba(215, 226, 234, 0.80);
  font-size: 14px;
  line-height: 1.8;
  padding-left: 8px;
}

.recipe-content :deep(br) {
  display: block;
  content: '';
  margin-top: 4px;
}

/* ==================== 重新生成按钮 ==================== */
.regenerate-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(215, 226, 234, 0.65);
  border-radius: 50px;
  padding: 10px 20px;
  margin-top: 20px;
  font-size: 13px;
  font-family: 'Kanit', 'Noto Sans SC', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.regenerate-btn:hover:not(:disabled) {
  border-color: #FF6B35;
  color: #FF6B35;
}

/* ==================== Key 管理 ==================== */
.key-manage {
  margin-top: 32px;
  text-align: center;
}

.key-toggle-btn {
  background: none;
  border: none;
  color: rgba(215, 226, 234, 0.30);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
}

.key-toggle-btn:hover { color: rgba(215, 226, 234, 0.55); }

.key-manage-panel {
  margin-top: 12px;
}

.key-manage-panel .key-input-row {
  justify-content: center;
}
</style>
