/**
 * =====================================================================
 * useDeepSeek.js — AI 菜谱生成器（DeepSeek API）
 * =====================================================================
 */

import { ref } from 'vue'

const KEY_STORAGE = 'maye_deepseek_key'
const API_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = `你是一位专业的中餐大厨 AI 助手，名叫"马也大厨"。

【你的职责】
- 用户输入食材名称，你给出 2-3 道推荐菜谱
- 用户输入菜名，你给出详细的做法步骤
- 每道菜谱必须包含：食材清单、调料、详细步骤、小贴士

【菜谱格式】
🍳 **菜名**
📋 **食材**：列出所有食材及用量
🧂 **调料**：列出所有调料
📝 **做法**：
1. 步骤1
2. 步骤2
💡 **小贴士**：1-2 条烹饪技巧

【严格禁止】
如果用户问题与烹饪、食材、菜谱完全无关，只回复：
"抱歉，我是马也大厨 AI，只能回答与菜谱、食材、烹饪相关的问题。请输入食材名称或菜名，我来为你推荐菜谱！"`

export function useDeepSeek() {

  const response = ref('')
  const loading = ref(false)
  const errorMsg = ref('')
  const hasKey = ref(false)

  // 初始化：检查是否有已保存的 Key
  try {
    hasKey.value = !!localStorage.getItem(KEY_STORAGE)
  } catch (e) { /* ignore */ }

  const saveKey = (key) => {
    try {
      localStorage.setItem(KEY_STORAGE, key.trim())
      hasKey.value = true
      return true
    } catch (e) { return false }
  }

  const getKey = () => {
    try { return localStorage.getItem(KEY_STORAGE) || '' }
    catch (e) { return '' }
  }

  const clearKey = () => {
    try {
      localStorage.removeItem(KEY_STORAGE)
      hasKey.value = false
    } catch (e) { /* ignore */ }
  }

  const askRecipe = async (query) => {
    const apiKey = getKey()
    if (!apiKey) {
      errorMsg.value = '请先设置 DeepSeek API Key'
      return ''
    }

    loading.value = true
    errorMsg.value = ''
    response.value = ''

    try {
      console.log('🚀 发送菜谱查询:', query)

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: query }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      console.log('📡 API 响应状态:', res.status)

      if (!res.ok) {
        let errMsg = `请求失败 (${res.status})`
        try {
          const errData = await res.json()
          console.error('❌ API 错误详情:', errData)
          if (res.status === 401) errMsg = 'API Key 无效，请检查后重新输入'
          else if (res.status === 402) errMsg = 'API 余额不足，请充值'
          else errMsg = errData.error?.message || errMsg
        } catch (e) { /* ignore */ }
        throw new Error(errMsg)
      }

      const data = await res.json()
      console.log('✅ API 返回数据:', data)

      const content = data.choices?.[0]?.message?.content || ''
      if (!content) {
        throw new Error('AI 返回为空')
      }

      response.value = content
      console.log('✅ 菜谱内容已设置，长度:', content.length)
      return content

    } catch (err) {
      console.error('❌ 请求失败:', err)
      errorMsg.value = err.message || '网络请求失败'
      return ''
    } finally {
      loading.value = false
      console.log('🏁 请求完成, loading:', loading.value, 'response长度:', response.value.length)
    }
  }

  return { response, loading, errorMsg, hasKey, saveKey, getKey, clearKey, askRecipe }
}
