import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, RemoveFormatting, Underline as UnderlineIcon } from 'lucide-react'

function ToolButton({ label, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center disabled:opacity-40 ${
        active ? 'bg-navy text-white' : 'text-navy hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder, label, compact = false }) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [linking, setLinking] = useState(false)
  const [href, setHref] = useState('')

  const editor = useEditor({
    immediatelyRender: true,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Write here…' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `rich-copy px-3 py-3 focus:outline-none ${compact ? 'min-h-24' : 'min-h-44'}`,
        'aria-label': label || 'Rich text',
      },
    },
    onUpdate: ({ editor: next }) => onChangeRef.current(next.getHTML()),
  })

  function applyLink(event) {
    event.preventDefault()
    if (!editor) return
    const url = href.trim()
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      const safe = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`
      editor.chain().focus().extendMarkRange('link').setLink({ href: safe }).run()
    }
    setLinking(false)
  }

  return (
    <div className={`rich-editor mt-1 overflow-hidden rounded-md border border-line bg-white focus-within:border-navy focus-within:shadow-[0_0_0_3px_rgba(11,37,69,.12)] ${compact ? 'is-compact' : ''}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-paper p-1" role="toolbar" aria-label={`${label || 'Text'} formatting`}>
        <ToolButton label="Bold" disabled={!editor} active={editor?.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton label="Italic" disabled={!editor} active={editor?.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolButton>
        <ToolButton label="Underline" disabled={!editor} active={editor?.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <ToolButton label="Heading" disabled={!editor} active={editor?.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton label="Subheading" disabled={!editor} active={editor?.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <ToolButton label="Bullet list" disabled={!editor} active={editor?.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton label="Numbered list" disabled={!editor} active={editor?.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <ToolButton
          label="Link"
          disabled={!editor}
          active={editor?.isActive('link') || linking}
          onClick={() => {
            setHref(editor.getAttributes('link').href || '')
            setLinking((open) => !open)
          }}
        >
          <Link2 size={16} />
        </ToolButton>
        <ToolButton
          label="Clear formatting"
          disabled={!editor}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <RemoveFormatting size={16} />
        </ToolButton>
      </div>
      {linking && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-2 py-2">
          <label className="min-w-0 flex-1 text-sm text-navy">
            <span className="sr-only">Link address</span>
            <input
              value={href}
              onChange={(event) => setHref(event.target.value)}
              placeholder="https://"
              className="field mt-0"
              autoFocus
            />
          </label>
          <button type="button" className="btn btn-primary !px-3 !py-2" onClick={applyLink}>Apply</button>
          <button
            type="button"
            className="btn btn-outline !px-3 !py-2"
            onClick={() => {
              editor?.chain().focus().extendMarkRange('link').unsetLink().run()
              setLinking(false)
            }}
          >
            Remove
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
