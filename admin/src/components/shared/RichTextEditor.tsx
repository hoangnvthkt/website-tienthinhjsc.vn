import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Youtube from '@tiptap/extension-youtube'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Minus, Undo, Redo,
  Image as ImageIcon, Link as LinkIcon, Unlink, Video,
  Table as TableIcon, Heading1, Heading2, Heading3,
  Highlighter, Palette, Pilcrow, Type, Trash2,
  Plus, Rows3, Columns3, TableCellsMerge
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  storageBucket?: string
}

export default function RichTextEditor({ content, onChange, placeholder = 'Bắt đầu viết nội dung...', storageBucket = 'media' }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showTableMenu, setShowTableMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialContent = useRef(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: initialContent.current,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] px-5 py-4',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML() && content !== initialContent.current) {
      editor.commands.setContent(content)
      initialContent.current = content
    }
  }, [content, editor])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const ext = file.name.split('.').pop()
    const path = `editor/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from(storageBucket).upload(path, file)
    if (error) { alert('Upload thất bại: ' + error.message); return }

    const { data: { publicUrl } } = supabase.storage.from(storageBucket).getPublicUrl(path)
    editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()

    e.target.value = ''
  }, [editor, storageBucket])

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }, [editor, linkUrl])

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl) return
    editor.commands.setYoutubeVideo({ src: youtubeUrl })
    setYoutubeUrl('')
    setShowYoutubeInput(false)
  }, [editor, youtubeUrl])

  if (!editor) return null

  const colors = ['#000000', '#374151', '#dc2626', '#ea580c', '#d97706', '#16a34a', '#2563eb', '#7c3aed', '#db2777']
  const highlightColors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fecdd3']

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50/80 p-1.5 flex flex-wrap gap-0.5">
        {/* Text Type */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-1">
          <ToolbarBtn
            active={editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Đoạn văn"
          ><Pilcrow size={16} /></ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Tiêu đề 1"
          ><Heading1 size={16} /></ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Tiêu đề 2"
          ><Heading2 size={16} /></ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Tiêu đề 3"
          ><Heading3 size={16} /></ToolbarBtn>
        </div>

        {/* Format */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-1">
          <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Đậm (Ctrl+B)">
            <Bold size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Nghiêng (Ctrl+I)">
            <Italic size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Gạch chân (Ctrl+U)">
            <UnderlineIcon size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Gạch ngang">
            <Strikethrough size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code inline">
            <Code size={16} />
          </ToolbarBtn>
        </div>

        {/* Color */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-1 relative">
          <ToolbarBtn onClick={() => { setShowColorPicker(!showColorPicker); setShowTableMenu(false) }} title="Màu chữ">
            <Palette size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
            <Highlighter size={16} />
          </ToolbarBtn>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 w-48">
              <p className="text-xs text-gray-500 mb-2 font-medium">Màu chữ</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {colors.map(c => (
                  <button key={c} className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }}
                    onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false) }} />
                ))}
                <button className="w-6 h-6 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false) }}>
                  <Type size={12} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Highlight</p>
              <div className="flex flex-wrap gap-1.5">
                {highlightColors.map(c => (
                  <button key={c} className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }}
                    onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowColorPicker(false) }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Align */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-1">
          <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Trái">
            <AlignLeft size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Giữa">
            <AlignCenter size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Phải">
            <AlignRight size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify">
            <AlignJustify size={16} />
          </ToolbarBtn>
        </div>

        {/* Lists & Blocks */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-1">
          <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Danh sách">
            <List size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Danh sách số">
            <ListOrdered size={16} />
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Trích dẫn">
            <Quote size={16} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
            <Minus size={16} />
          </ToolbarBtn>
        </div>

        {/* Media */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-1">
          <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Chèn ảnh">
            <ImageIcon size={16} />
          </ToolbarBtn>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          <ToolbarBtn onClick={() => { setShowLinkInput(!showLinkInput); setShowYoutubeInput(false) }} active={editor.isActive('link')} title="Chèn link">
            <LinkIcon size={16} />
          </ToolbarBtn>
          {editor.isActive('link') && (
            <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Bỏ link">
              <Unlink size={16} />
            </ToolbarBtn>
          )}
          <ToolbarBtn onClick={() => { setShowYoutubeInput(!showYoutubeInput); setShowLinkInput(false) }} title="YouTube video">
            <Video size={16} />
          </ToolbarBtn>
        </div>

        {/* Table */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-1 relative">
          <ToolbarBtn onClick={() => { setShowTableMenu(!showTableMenu); setShowColorPicker(false) }} active={editor.isActive('table')} title="Bảng">
            <TableIcon size={16} />
          </ToolbarBtn>
          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 w-44">
              <p className="text-xs text-gray-500 mb-2 px-1 font-medium">Bảng</p>
              <TableMenuItem onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setShowTableMenu(false) }}>
                <Plus size={14} /> Thêm bảng 3×3
              </TableMenuItem>
              {editor.isActive('table') && (<>
                <TableMenuItem onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false) }}>
                  <Rows3 size={14} /> Thêm hàng
                </TableMenuItem>
                <TableMenuItem onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false) }}>
                  <Columns3 size={14} /> Thêm cột
                </TableMenuItem>
                <TableMenuItem onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false) }}>
                  <Trash2 size={14} /> Xóa hàng
                </TableMenuItem>
                <TableMenuItem onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false) }}>
                  <Trash2 size={14} /> Xóa cột
                </TableMenuItem>
                <TableMenuItem onClick={() => { editor.chain().focus().mergeOrSplit().run(); setShowTableMenu(false) }}>
                  <TableCellsMerge size={14} /> Gộp/Tách ô
                </TableMenuItem>
                <hr className="my-1 border-gray-100" />
                <TableMenuItem onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false) }} className="text-red-600 hover:bg-red-50">
                  <Trash2 size={14} /> Xóa bảng
                </TableMenuItem>
              </>)}
            </div>
          )}
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
            <Undo size={16} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
            <Redo size={16} />
          </ToolbarBtn>
        </div>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
          <LinkIcon size={14} className="text-blue-500 shrink-0" />
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLink()}
            className="flex-1 text-sm px-2 py-1 border border-blue-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            autoFocus
          />
          <button onClick={addLink} className="text-xs bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">Chèn</button>
          <button onClick={() => setShowLinkInput(false)} className="text-xs text-gray-500 hover:text-gray-700">Hủy</button>
        </div>
      )}

      {/* YouTube Input */}
      {showYoutubeInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-100">
          <Video size={14} className="text-red-500 shrink-0" />
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addYoutube()}
            className="flex-1 text-sm px-2 py-1 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-400"
            autoFocus
          />
          <button onClick={addYoutube} className="text-xs bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Chèn</button>
          <button onClick={() => setShowYoutubeInput(false)} className="text-xs text-gray-500 hover:text-gray-700">Hủy</button>
        </div>
      )}


      {/* Editor Content */}
      <div onClick={() => editor.chain().focus().run()} className="cursor-text">
        <EditorContent editor={editor} />
      </div>

      {/* Word count */}
      <div className="border-t border-gray-100 px-4 py-1.5 bg-gray-50/50 flex justify-between text-xs text-gray-400">
        <span>{editor.storage.characterCount?.characters?.() ?? editor.getText().length} ký tự</span>
        <span>{editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length} từ</span>
      </div>
    </div>
  )
}

/* ---- Sub-components ---- */

function ToolbarBtn({ children, active, disabled, onClick, title }: {
  children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void; title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-150 ${
        active ? 'bg-primary/15 text-primary shadow-sm' :
        disabled ? 'text-gray-300 cursor-not-allowed' :
        'text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function BubbleBtn({ children, active, onClick }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-white/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
    >
      {children}
    </button>
  )
}

function TableMenuItem({ children, onClick, className = '' }: {
  children: React.ReactNode; onClick: () => void; className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}
