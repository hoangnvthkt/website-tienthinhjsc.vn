export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">Module này sẽ được triển khai trong Phase 2</p>
    </div>
  )
}
