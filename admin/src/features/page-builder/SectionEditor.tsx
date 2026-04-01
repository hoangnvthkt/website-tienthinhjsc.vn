import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react'
import type { SectionField } from './sectionTypes'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'

interface SectionEditorProps {
  fields: SectionField[]
  data: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

// Field-level renderers
function TextField({ field, value, onChange }: {field: SectionField, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
    </div>
  )
}

function UrlField({ field, value, onChange }: {field: SectionField, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
      <input type="url" value={value || ''} onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
    </div>
  )
}

function TextareaField({ field, value, onChange }: {field: SectionField, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
    </div>
  )
}

function SelectField({ field, value, onChange }: {field: SectionField, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
        {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function NumberField({ field, value, onChange }: {field: SectionField, value: number, onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
      <input type="number" value={value ?? 0} onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
    </div>
  )
}

function ToggleField({ field, value, onChange }: {field: SectionField, value: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-xs font-medium text-gray-600">{field.label}</label>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${value ? 'bg-primary' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function ImageField({ field, value, onChange }: {field: SectionField, value: string | null, onChange: (v: string | null) => void }) {
  return <ImageUploader value={value} onChange={onChange} bucket="pages" label={field.label} />
}

function RichTextField({ field, value, onChange }: {field: SectionField, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
      <RichTextEditor content={value || ''} onChange={onChange} storageBucket="pages" placeholder="Viết nội dung..." />
    </div>
  )
}

// Icon-text list editor: for items like features, stats, FAQs
interface ListItem { icon?: string; title: string; description: string }

function IconTextListField({ field, value, onChange }: {field: SectionField, value: ListItem[], onChange: (v: ListItem[]) => void }) {
  const items: ListItem[] = Array.isArray(value) ? value : []

  const updateItem = (idx: number, patch: Partial<ListItem>) => {
    const next = [...items]
    next[idx] = { ...next[idx], ...patch }
    onChange(next)
  }

  const addItem = () => onChange([...items, { icon: '⭐', title: '', description: '' }])
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx))

  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = [...items]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    onChange(next)
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{field.label}</label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-0.5 pt-1">
                <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp size={12} /></button>
                <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown size={12} /></button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input type="text" value={item.icon || ''} onChange={e => updateItem(idx, { icon: e.target.value })}
                    className="w-12 px-2 py-1.5 border border-gray-200 rounded-md text-center text-sm" placeholder="🔹" />
                  <input type="text" value={item.title} onChange={e => updateItem(idx, { title: e.target.value })}
                    placeholder="Tiêu đề mục" className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-sm" />
                </div>
                <textarea value={item.description} onChange={e => updateItem(idx, { description: e.target.value })}
                  placeholder="Mô tả ngắn" rows={2}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm resize-none" />
              </div>
              <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-medium">
        <Plus size={14} /> Thêm mục
      </button>
    </div>
  )
}

// Multi-image uploader
function MultiImageField({ field, value, onChange }: { field: SectionField, value: string[], onChange: (v: string[]) => void }) {
  const urls: string[] = Array.isArray(value) ? value : []

  const addImage = (url: string | null) => {
    if (url) onChange([...urls, url])
  }

  const removeImage = (idx: number) => onChange(urls.filter((_, i) => i !== idx))

  const moveImage = (idx: number, dir: -1 | 1) => {
    const next = [...urls]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    onChange(next)
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{field.label}</label>
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {urls.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                  className="p-1 bg-white/90 rounded text-gray-700 hover:bg-white disabled:opacity-30 text-xs">◀</button>
                <button type="button" onClick={() => removeImage(idx)}
                  className="p-1 bg-red-500 rounded text-white hover:bg-red-600"><Trash2 size={12} /></button>
                <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === urls.length - 1}
                  className="p-1 bg-white/90 rounded text-gray-700 hover:bg-white disabled:opacity-30 text-xs">▶</button>
              </div>
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">{idx + 1}</span>
            </div>
          ))}
        </div>
      )}
      <ImageUploader value={null} onChange={addImage} bucket="pages" label={urls.length > 0 ? 'Thêm ảnh' : 'Upload ảnh'} />
    </div>
  )
}

// Main SectionEditor
export default function SectionEditor({ fields, data, onChange }: SectionEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('content')

  const groups = {
    content: fields.filter(f => (f.group || 'content') === 'content'),
    style: fields.filter(f => f.group === 'style'),
    advanced: fields.filter(f => f.group === 'advanced'),
  }

  const availableTabs = Object.entries(groups).filter(([, fs]) => fs.length > 0)
  const tabLabels: Record<string, string> = { content: 'Nội dung', style: 'Giao diện', advanced: 'Nâng cao' }

  const renderField = (field: SectionField) => {
    const val = field.key === 'content' ? data.content
      : field.key === 'title' ? data.title
      : field.key === 'subtitle' ? data.subtitle
      : field.key === 'media_urls' ? data.media_urls
      : (data.config as Record<string, unknown>)?.[field.key]

    const handleFieldChange = (v: unknown) => {
      if (['title', 'subtitle', 'content', 'media_urls'].includes(field.key)) {
        onChange(field.key, v)
      } else {
        // Store in config
        onChange(`config.${field.key}`, v)
      }
    }

    switch (field.type) {
      case 'text': return <TextField key={field.key} field={field} value={val as string} onChange={handleFieldChange} />
      case 'url': return <UrlField key={field.key} field={field} value={val as string} onChange={handleFieldChange} />
      case 'textarea': return <TextareaField key={field.key} field={field} value={val as string} onChange={handleFieldChange} />
      case 'select': return <SelectField key={field.key} field={field} value={val as string} onChange={handleFieldChange} />
      case 'number': return <NumberField key={field.key} field={field} value={val as number} onChange={handleFieldChange} />
      case 'toggle': return <ToggleField key={field.key} field={field} value={val as boolean} onChange={handleFieldChange} />
      case 'image': return <ImageField key={field.key} field={field} value={val as string | null} onChange={handleFieldChange} />
      case 'richtext': return <RichTextField key={field.key} field={field} value={val as string} onChange={handleFieldChange} />
      case 'images': return <MultiImageField key={field.key} field={field} value={val as string[]} onChange={handleFieldChange} />
      case 'icon-text-list': return <IconTextListField key={field.key} field={field} value={val as ListItem[]} onChange={handleFieldChange} />
      default: return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      {availableTabs.length > 1 && (
        <div className="flex gap-1 border-b border-gray-100 pb-1">
          {availableTabs.map(([key]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === key ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tabLabels[key]}
            </button>
          ))}
        </div>
      )}

      {/* Fields for active tab */}
      <div className="space-y-4">
        {(groups[activeTab as keyof typeof groups] || groups.content).map(renderField)}
      </div>
    </div>
  )
}
