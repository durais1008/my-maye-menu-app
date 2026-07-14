/**
 * =====================================================================
 * useVisitorCount.js — 网站访问计数器
 * =====================================================================
 *
 * 【功能说明】
 *   记录网站的总访问次数，显示在页面上。
 *   用 Supabase visits 表存储计数，localStorage 防止重复计数。
 *
 * 【去重逻辑】
 *   同一个浏览器在同一天内只算一次访问。
 *   刷新页面不会重复计数。
 *
 * 【使用方式】
 *   import { useVisitorCount } from '../composables/useVisitorCount.js'
 *   const { visitCount, loading } = useVisitorCount()
 *   模板中：已访问 {{ visitCount }} 次
 */

import { ref, onMounted } from 'vue'

// Supabase 连接配置（与 useSupabase.js 共用同一套凭证）
const SUPABASE_URL = 'https://cwapbhxxcitzfvopgfnx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YXBiaHh4Y2l0emZ2b3BnZm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NTMxNDYsImV4cCI6MjA5ODUyOTE0Nn0.MImSLwGwAmYKLoOOGHnEjKneXQbcO0QT0dkM5eQRh7Q'

/**
 * 生成 fetch 请求的公共 headers
 */
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
}

export function useVisitorCount() {

  /** visitCount：当前的访问总次数 */
  const visitCount = ref(0)

  /** loading：是否正在加载中（用于显示占位符或骨架） */
  const loading = ref(true)

  /**
   * shouldIncrement —— 判断今天是否需要 +1
   *
   * 检查 localStorage 中是否已存在今天的访问记录
   * 如果有 → 返回 false（不重复计数）
   * 如果没有 → 写入标记 → 返回 true（需要计数）
   */
  const shouldIncrement = () => {
    const today = new Date().toISOString().split('T')[0]  // 如 "2026-07-14"
    const key = `maye_visit_${today}`  // 如 "maye_visit_2026-07-14"

    if (localStorage.getItem(key)) {
      return false  // 今天已经访问过了，不再 +1
    }

    // 标记今天已访问（过期时间设为明天凌晨）
    localStorage.setItem(key, '1')
    return true
  }

  /**
   * fetchCount —— 从 Supabase 获取当前计数
   */
  const fetchCount = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/visits?id=eq.1&select=count`,
        { headers }
      )
      const data = await res.json()
      if (data && data.length > 0) {
        visitCount.value = data[0].count
      }
    } catch (err) {
      console.warn('获取访问计数失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * incrementCount —— 将计数 +1 并推送到 Supabase
   */
  const incrementCount = async () => {
    const newCount = visitCount.value + 1
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/visits?id=eq.1`,
        {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: newCount })
        }
      )
      visitCount.value = newCount
    } catch (err) {
      console.warn('更新访问计数失败:', err)
    }
  }

  /**
   * init —— 初始化流程
   *
   * 1. 先从 Supabase 拉取当前计数
   * 2. 判断今天是否已计数
   * 3. 如果没有 → +1 并推送
   */
  const init = async () => {
    // 先获取当前计数
    await fetchCount()

    // 检查是否需要 +1
    if (shouldIncrement()) {
      await incrementCount()
    }
  }

  // 自动初始化
  onMounted(() => {
    init()
  })

  return { visitCount, loading }
}
