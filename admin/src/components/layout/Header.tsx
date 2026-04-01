import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Quản lý Dự án',
  '/posts': 'Quản lý Bài viết',
  '/pages': 'Quản lý Trang',
  '/contacts': 'Liên hệ',
  '/documents': 'Tài liệu',
  '/media': 'Thư viện Media',
  '/settings': 'Cài đặt',
}

export default function Header() {
  const location = useLocation()
  const [newContacts, setNewContacts] = useState(0)

  const basePath = '/' + (location.pathname.split('/')[1] || '')
  const title = pageTitles[basePath] || 'Admin'

  useEffect(() => {
    supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .then(({ count }) => setNewContacts(count || 0))
  }, [location])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          {newContacts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {newContacts > 9 ? '9+' : newContacts}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
