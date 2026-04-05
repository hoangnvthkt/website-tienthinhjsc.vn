import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, TrendingUp, Users, Clock, ChevronRight, RefreshCw, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'

interface ChatSession {
  session_id: string
  created_at: string
  updated_at: string
  message_count: number
  last_message: string
}

interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface TopicStat {
  topic: string
  count: number
  color: string
}

const TOPIC_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#64748b']

export default function ChatAnalyticsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [aiReport, setAiReport] = useState<string>('')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [topicStats, setTopicStats] = useState<TopicStat[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, avgMessages: 0 })
  const [reportExpanded, setReportExpanded] = useState(true)

  const SUPABASE_URL = 'https://hafiotcabigmdpoocddu.supabase.co'
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmlvdGNhYmlnbWRwb29jZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzU2NDEsImV4cCI6MjA5MDUxMTY0MX0.22BAFw0LXsomxY0PtD3V-5G5yGFa2F5gmCUNVr4tyrk'

  // ─── Load sessions ───────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      // Get sessions
      const { data: sessData } = await supabase
        .from('chat_sessions')
        .select('session_id, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100) as any

      if (!sessData?.length) { setSessions([]); setLoading(false); return }

      // Get message counts & latest message per session
      const sessionIds = sessData.map((s: any) => s.session_id)
      const { data: msgData } = await supabase
        .from('chat_messages')
        .select('session_id, role, content, created_at')
        .in('session_id', sessionIds)
        .order('created_at', { ascending: false }) as any

      // Group by session
      const msgMap: Record<string, { count: number; last: string }> = {}
      ;(msgData || []).forEach((m: any) => {
        if (!msgMap[m.session_id]) {
          msgMap[m.session_id] = { count: 0, last: m.role === 'user' ? m.content : '' }
        }
        msgMap[m.session_id].count++
        if (m.role === 'user' && !msgMap[m.session_id].last) {
          msgMap[m.session_id].last = m.content
        }
      })

      const enriched: ChatSession[] = sessData.map((s: any) => ({
        ...s,
        message_count: msgMap[s.session_id]?.count || 0,
        last_message: msgMap[s.session_id]?.last || '...',
      })).filter((s: ChatSession) => s.message_count > 0)

      setSessions(enriched)

      // Stats
      const today = new Date().toDateString()
      const todayCount = sessData.filter((s: any) => new Date(s.created_at).toDateString() === today).length
      const totalMsgs = Object.values(msgMap).reduce((a, b) => a + b.count, 0)
      setStats({
        total: enriched.length,
        today: todayCount,
        avgMessages: enriched.length > 0 ? Math.round(totalMsgs / enriched.length) : 0,
      })

      // Phân tích topics từ user messages
      analyzeTopics(msgData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Topic analysis (keyword-based) ────────────────────────
  function analyzeTopics(msgs: any[]) {
    const userMsgs = msgs.filter(m => m.role === 'user').map(m => m.content.toLowerCase())
    const topicKeywords: Record<string, string[]> = {
      'Báo giá / Chi phí': ['bao gia', 'báo giá', 'chi phi', 'chi phí', 'gia ca', 'giá cả', 'gia bao nhieu', 'giá bao nhiêu', 'tien', 'tiền', 'cost', 'price'],
      'Dịch vụ / Sản phẩm': ['dich vu', 'dịch vụ', 'san pham', 'sản phẩm', 'lam gi', 'làm gì', 'cung cap', 'cung cấp', 'thep', 'thép', 'ket cau', 'kết cấu', 'peb', 'khung'],
      'Dự án / Công trình': ['du an', 'dự án', 'cong trinh', 'công trình', 'thi cong', 'thi công', 'bao nhieu du an', 'bao nhiêu dự án'],
      'Thông tin công ty': ['thanh lap', 'thành lập', 'nam nao', 'năm nào', 'lich su', 'lịch sử', 'gioi thieu', 'giới thiệu', 'cong ty', 'công ty', 'dia chi', 'địa chỉ'],
      'Nhân sự / Tuyển dụng': ['nhan su', 'nhân sự', 'tuyen dung', 'tuyển dụng', 'ung tuyen', 'ứng tuyển', 'viec lam', 'việc làm', 'nhan vien', 'nhân viên', 'ky su', 'kỹ sư'],
      'Liên hệ / Hotline': ['hotline', 'lien he', 'liên hệ', 'dien thoai', 'điện thoại', 'email', 'so dien', 'số điện', 'contact'],
      'Chứng chỉ / Năng lực': ['chung chi', 'chứng chỉ', 'nang luc', 'năng lực', 'iso', 'chung nhan', 'chứng nhận', 'tieu chuan', 'tiêu chuẩn'],
    }

    const counts: Record<string, number> = {}
    userMsgs.forEach(msg => {
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(kw => msg.includes(kw))) {
          counts[topic] = (counts[topic] || 0) + 1
        }
      })
    })

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic, count], i) => ({ topic, count, color: TOPIC_COLORS[i] }))

    setTopicStats(sorted)
  }

  // ─── Load messages for selected session ─────────────────────
  async function fetchMessages(sessionId: string) {
    setLoadingMessages(true)
    setSelectedSession(sessionId)
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true }) as any
      setMessages(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  // ─── AI Report Generation ────────────────────────────────────
  async function generateAiReport() {
    if (sessions.length === 0) return
    setGeneratingReport(true)
    setReportExpanded(true)

    try {
      // Lấy tất cả user messages (max 200)
      const { data: allMsgs } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(200) as any

      const userQuestions = (allMsgs || [])
        .map((m: any) => m.content)
        .join('\n- ')

      const prompt = `Bạn là chuyên gia phân tích dữ liệu. Dưới đây là ${(allMsgs || []).length} câu hỏi thực tế khách hàng đã nhắn tin cho chatbot AI của Công ty Tiến Thịnh JSC (kết cấu thép, xây lắp công nghiệp):

- ${userQuestions}

Hãy phân tích và viết báo cáo tổng hợp ngắn gọn (bằng tiếng Việt, dùng bullet points) bao gồm:
1. **Top chủ đề khách hàng quan tâm**: liệt kê 5-7 chủ đề phổ biến nhất
2. **Nhu cầu chính**: khách hàng muốn gì nhất?
3. **Khuyến nghị cải thiện chatbot**: chatbot nên bổ sung thêm thông tin gì?
4. **Nhận xét tổng quan**: 1-2 câu tóm tắt xu hướng

Trả lời súc tích, dùng **bold** cho tiêu đề mỗi phần.`

      const resp = await fetch(
        `${SUPABASE_URL}/functions/v1/website-chatbot`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
          body: JSON.stringify({ question: prompt, history: [] }),
        }
      )
      const data = await resp.json()
      setAiReport(data.answer || 'Không thể tạo báo cáo.')
    } catch (err) {
      setAiReport('⚠️ Lỗi khi tạo báo cáo. Vui lòng thử lại.')
    } finally {
      setGeneratingReport(false)
    }
  }

  useEffect(() => { fetchSessions() }, [fetchSessions])

  // ─── Format markdown to HTML ─────────────────────────────────
  function formatReport(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('\n')
      .map(line => {
        if (line.startsWith('- ') || line.startsWith('• ')) return `<li>${line.slice(2)}</li>`
        if (line.match(/^\d+\./)) return `<p class="font-medium mt-2">${line}</p>`
        return line ? `<p>${line}</p>` : '<br/>'
      })
      .join('')
  }

  const totalTopics = topicStats.reduce((s, t) => s + t.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <MessageSquare size={24} /> Chat Analytics
          </h1>
          <p className="text-white/70 text-sm">Phân tích hội thoại khách hàng — Chatbot AI Tiến Thịnh JSC</p>
        </div>
        <div className="relative z-10 flex gap-8 mt-4">
          <div className="flex items-center gap-2 text-white/80 text-sm"><Users size={16} /> {stats.total} cuộc hội thoại</div>
          <div className="flex items-center gap-2 text-white/80 text-sm"><TrendingUp size={16} /> {stats.today} hôm nay</div>
          <div className="flex items-center gap-2 text-white/80 text-sm"><MessageSquare size={16} /> TB {stats.avgMessages} tin/phiên</div>
        </div>
      </div>

      {/* Stats + Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Topic breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" /> Chủ đề phổ biến
            </h3>
            <span className="text-xs text-gray-400">{totalTopics} lượt phát hiện</span>
          </div>
          {topicStats.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              <Clock size={16} className="mr-2" /> Chưa đủ dữ liệu
            </div>
          ) : (
            <div className="space-y-3">
              {topicStats.map(t => (
                <div key={t.topic}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{t.topic}</span>
                    <span className="font-medium text-gray-800">{t.count} lần</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${totalTopics > 0 ? (t.count / totalTopics) * 100 : 0}%`, backgroundColor: t.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Report Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" /> Báo cáo AI tổng hợp
            </h3>
            <div className="flex items-center gap-2">
              {aiReport && (
                <button onClick={() => setReportExpanded(!reportExpanded)} className="text-gray-400 hover:text-gray-600">
                  {reportExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
              <button
                onClick={generateAiReport}
                disabled={generatingReport || sessions.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generatingReport ? (
                  <><RefreshCw size={12} className="animate-spin" /> Đang phân tích...</>
                ) : (
                  <><Sparkles size={12} /> Tạo báo cáo</>
                )}
              </button>
            </div>
          </div>

          {!aiReport && !generatingReport && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm text-center">
              <Sparkles size={24} className="mb-2 text-purple-200" />
              <p>Nhấn "Tạo báo cáo" để AI phân tích<br/>toàn bộ hội thoại khách hàng</p>
            </div>
          )}

          {generatingReport && (
            <div className="flex flex-col items-center justify-center h-32 text-purple-400 text-sm">
              <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-2"/>
              <p>AI đang phân tích dữ liệu...</p>
            </div>
          )}

          {aiReport && !generatingReport && reportExpanded && (
            <div className="text-sm text-gray-700 leading-relaxed max-h-64 overflow-y-auto space-y-1
              [&_strong]:font-semibold [&_strong]:text-gray-900
              [&_li]:ml-4 [&_li]:list-disc [&_li]:text-gray-600
              [&_p]:text-gray-700"
              dangerouslySetInnerHTML={{ __html: formatReport(aiReport) }}
            />
          )}
        </div>
      </div>

      {/* Sessions List + Conversation Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Sessions List */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Các phiên chat ({sessions.length})</h3>
            <button onClick={fetchSessions} className="text-gray-400 hover:text-gray-600 transition-colors" title="Làm mới">
              <RefreshCw size={15} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"/>
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-200" />
              Chưa có hội thoại nào
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {sessions.map(s => (
                <button
                  key={s.session_id}
                  onClick={() => fetchMessages(s.session_id)}
                  className={`w-full text-left px-5 py-3.5 hover:bg-gray-50/80 transition-colors flex items-start justify-between gap-3 ${
                    selectedSession === s.session_id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full shrink-0"/>
                      <span className="text-xs text-gray-400 font-mono truncate">{s.session_id.substring(3, 14)}...</span>
                      <span className="ml-auto shrink-0 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {s.message_count} tin
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{s.last_message || '...'}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{formatDateTime(s.updated_at)}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Viewer */}
        <div className="md:col-span-3 bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400"/> Nội dung hội thoại
            </h3>
            {selectedSession && (
              <button onClick={() => { setSelectedSession(null); setMessages([]) }}
                className="text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>

          {!selectedSession ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm text-center px-8">
              <MessageSquare size={36} className="mb-3 text-gray-200" />
              <p className="font-medium text-gray-500">Chọn một phiên chat</p>
              <p className="text-xs mt-1">Bấm vào phiên ở bên trái để xem toàn bộ hội thoại</p>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"/>
            </div>
          ) : (
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {formatDateTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
