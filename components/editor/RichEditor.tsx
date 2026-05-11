'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useCallback, useRef } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
}

export default function RichEditor({ content, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-[6px] my-4' } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'ProseMirror focus:outline-none min-h-[300px] px-1',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL odkazu', prev ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  async function insertImage(file: File) {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    })
    const { presignedUrl, publicUrl } = await res.json()
    await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    editor?.chain().focus().setImage({ src: publicUrl }).run()
  }

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, label: string) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
        active ? 'bg-[#0e0e0e] text-white' : 'text-[#3a3834] hover:bg-[#f2f1ee]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="border border-[#e4e2dc] rounded-[6px] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[#e4e2dc] flex-wrap bg-[#fafaf8]">
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
        <div className="w-px h-5 bg-[#e4e2dc] mx-1" />
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
        {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
        <div className="w-px h-5 bg-[#e4e2dc] mx-1" />
        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• Zoznam')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. Zoznam')}
        <div className="w-px h-5 bg-[#e4e2dc] mx-1" />
        {btn(editor.isActive('link'), setLink, '🔗 Odkaz')}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-2.5 py-1 rounded text-sm font-medium text-[#3a3834] hover:bg-[#f2f1ee] transition-colors"
        >
          🖼 Obrázok
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImage(f) }}
        />
      </div>

      {/* Editor content */}
      <div className="px-3 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
