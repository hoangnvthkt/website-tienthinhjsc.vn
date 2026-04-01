import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Page } from '@/types/database'
import { formatDate } from '@/lib/utils'

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('pages').select('*').order('created_at').then(({ data }) => {
      setPages(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tên trang</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cập nhật</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center"><svg className="animate-spin h-6 w-6 text-primary mx-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>
            ) : pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{page.title}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{page.slug}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(page.updated_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/pages/${page.id}/edit`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium">
                    <Pencil size={14} /> Sửa nội dung
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
