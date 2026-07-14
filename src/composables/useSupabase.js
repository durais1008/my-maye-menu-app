/**
 * =====================================================================
 * useSupabase.js — Supabase 云数据库操作模块
 * =====================================================================
 *
 * 【功能说明】
 *   这个文件封装了所有与 Supabase 云数据库交互的逻辑，
 *   包括：拉取博客列表、发布新博客、删除博客。
 *   把数据库操作从 App.vue 中抽出来，方便单独维护和复用。
 *
 * 【什么是 Supabase？】
 *   Supabase 是一个免费的后端云服务，提供了 PostgreSQL 数据库。
 *   前端可以直接通过 REST API（类似网页请求）读写数据，
 *   不需要自己搭建服务器。
 *
 * 【使用方式】
 *   在 .vue 文件中这样引入：
 *   import { useSupabase } from '../composables/useSupabase.js'
 *   const { blogPosts, fetchPosts, publishPost, deletePost } = useSupabase()
 */

// ========== 导入 Vue 的响应式工具 ==========
import { ref } from 'vue'
// ref: Vue 3 的核心函数，把普通数据变成"响应式数据"
// 响应式的意思是：数据一变，页面上用到它的地方会自动更新

/**
 * useSupabase 函数 —— 返回博客相关的所有数据和方法
 * 这是一种 Vue 3 的设计模式叫 "Composable"（可组合函数），
 * 类似于把相关功能打包成一个工具箱
 */
export function useSupabase() {

  // ==================== 数据库连接配置 ====================

  /**
   * SUPABASE_URL：你的 Supabase 数据库的访问地址
   * 注意：地址只需要到 .co，后面的具体路径在 fetch 时拼接
   */
  const SUPABASE_URL = 'https://cwapbhxxcitzfvopgfnx.supabase.co'

  /**
   * SUPABASE_KEY：匿名访问密钥（anon key）
   * 这个是"公钥"，可以放在前端代码里，权限是你在 Supabase 后台设置好的
   * 注意：这不是秘密的私钥（service_role key），那个不能暴露在前端！
   */
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YXBiaHh4Y2l0emZ2b3BnZm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NTMxNDYsImV4cCI6MjA5ODUyOTE0Nn0.MImSLwGwAmYKLoOOGHnEjKneXQbcO0QT0dkM5eQRh7Q'

  // ==================== 响应式状态 ====================

  /**
   * blogPosts：博客列表数据
   * ref([]) 创建一个响应式的空数组
   * 当从云端拉取数据后，给 blogPosts.value 赋值，页面会自动刷新
   */
  const blogPosts = ref([])

  /**
   * isPublishing：是否正在发布中
   * 用于防止用户重复点击"发布"按钮
   * true = 正在发送请求，按钮显示"正在同步..."且不可点击
   * false = 空闲状态，按钮可以点击
   */
  const isPublishing = ref(false)

  // ==================== 方法一：从云端拉取所有博客 ====================

  /**
   * fetchPosts —— 从 Supabase 数据库中获取所有博客文章
   *
   * async：表示这是一个"异步函数"（需要等待网络请求返回）
   * 异步 = 不会卡住页面，请求发出后可以干别的事，数据到了再处理
   */
  const fetchPosts = async () => {
    try {
      /**
       * fetch()：浏览器内置的网络请求函数
       * 这里向 Supabase 的 REST API 发送 GET 请求，查询 posts 表
       *
       * URL 参数解析：
       *   /rest/v1/posts     → 访问 posts 表
       *   ?select=*          → 查询所有字段（id, title, content, date）
       *   &order=id.desc     → 按 id 降序排列（最新的在前面）
       */
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/posts?select=*&order=id.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,            // API 密钥（你的身份标识）
            'Authorization': `Bearer ${SUPABASE_KEY}`  // 授权头（Bearer 是标准格式）
          }
        }
      )

      /**
       * response.json()：把服务器返回的 JSON 字符串解析成 JavaScript 对象
       * await：等解析完成后再继续
       */
      const data = await response.json()

      /**
       * 把拉取到的数据赋值给 blogPosts.value
       * .value 是因为 blogPosts 是 ref 包裹的，访问实际值需要用 .value
       * 这一行执行后，页面上所有用到 blogPosts 的地方会自动刷新
       */
      blogPosts.value = data
    } catch (error) {
      // catch：如果上面的代码出错（比如网络断开了），就执行这里
      // console.error：在浏览器控制台打印红色错误信息，方便调试
      console.error('拉取日记失败:', error)
    }
  }

  // ==================== 方法二：发布新博客到云端 ====================

  /**
   * publishPost —— 把新写的博客发送到 Supabase 数据库
   *
   * @param {Object} post - 博客对象 { title: '标题', content: '内容' }
   * @returns {boolean} - 发布成功返回 true，失败返回 false
   */
  const publishPost = async (post) => {
    // 表单验证：标题和内容都不能为空
    if (!post.title || !post.content) {
      alert('标题和内容都不能为空哦！')
      return false  // 阻止继续执行，返回 false 表示失败
    }

    isPublishing.value = true  // 锁定按钮，显示"正在同步..."

    /**
     * 获取今天的日期，格式如 "2026-07-14"
     * new Date()          → 创建当前时间的日期对象
     * .toISOString()      → 转成 "2026-07-14T12:30:00.000Z" 格式
     * .split('T')         → 以 'T' 为分隔符切分，得到 ["2026-07-14", "12:30:00.000Z"]
     * [0]                 → 取第一部分，即 "2026-07-14"
     */
    const today = new Date().toISOString().split('T')[0]

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',  // POST = 向数据库新增一条数据（对比 GET = 查询）
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',  // 告诉服务器：我发的数据是 JSON 格式
          'Prefer': 'return=representation'     // 让 Supabase 返回刚创建的完整记录
        },
        /**
         * body：要发送的数据体
         * JSON.stringify()：把 JavaScript 对象转成 JSON 字符串
         * 服务器端收到的是字符串，而不是 JS 对象
         */
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          date: today
        })
      })

      // response.ok：HTTP 状态码在 200-299 之间为 true，表示请求成功
      if (response.ok) {
        alert('🎉 传奇发布成功！已同步至云数据库。')
        await fetchPosts()  // 重新拉取博客列表，让页面显示最新数据
        return true         // 返回 true 表示成功
      }
    } catch (error) {
      alert('发布失败，检查下网络？')
    } finally {
      /**
       * finally：无论成功还是失败，都会执行的代码
       * 这里确保按钮一定会解锁（不会永远卡在"同步中"）
       */
      isPublishing.value = false
    }
    return false  // 走到这里说明失败了
  }

  // ==================== 方法三：从云端删除博客 ====================

  /**
   * deletePost —— 删除 Supabase 数据库中的一篇博客
   *
   * @param {number} id - 要删除的博客的 id（数据库主键）
   * @returns {boolean} - 删除成功返回 true，失败返回 false
   */
  const deletePost = async (id) => {
    // confirm()：浏览器原生确认弹窗，返回 true（确定）或 false（取消）
    const confirmDelete = confirm('确定要删除这篇传奇吗？删了就找不回了哦！')
    if (!confirmDelete) return false  // 用户点取消，直接返回，不执行删除

    try {
      /**
       * Supabase 的查询语法：?id=eq.123
       * eq = equal（等于），所以 id=eq.123 意思是 "找到 id 等于 123 的那条记录"
       */
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`,
        {
          method: 'DELETE',  // DELETE = 删除数据
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      )

      if (response.ok) {
        alert('🗑️ 删除成功！')
        await fetchPosts()  // 重新拉取，刷新页面
        return true
      }
    } catch (error) {
      alert('删除失败，请稍后再试。')
    }
    return false
  }

  // ==================== 导出（返回）所有内容 ====================

  /**
   * return：把数据和方法打包返回给调用者
   * 调用者通过解构赋值获取：
   * const { blogPosts, fetchPosts, publishPost, deletePost, isPublishing } = useSupabase()
   */
  return {
    blogPosts,       // 博客列表（响应式数据）
    isPublishing,    // 发布状态（true=正在发布）
    fetchPosts,      // 拉取博客的方法
    publishPost,     // 发布博客的方法
    deletePost       // 删除博客的方法
  }
}
