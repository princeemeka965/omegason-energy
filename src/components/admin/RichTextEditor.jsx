import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Quote, RemoveFormatting, Underline as UnderlineIcon } from 'lucide-react'
import { uploadImage } from '../../lib/adminStore'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const IMAGE_LIMIT = 8 * 1024 * 1024

function imageFiles(list) {
  return Array.from(list || []).filter((file) => file.type.startsWith('image/'))
}

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

export default function RichTextEditor({ value, onChange, placeholder, label, compact = false, images = false }) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const fileRef = useRef(null)
  const uploadRef = useRef(null)
  const editorRef = useRef(null)
  const [linking, setLinking] = useState(false)
  const [href, setHref] = useState('')
  const [uploading, setUploading] = useState(0)
  const [imageError, setImageError] = useState('')

  async function insertImages(files, position) {
    setImageError('')
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        setImageError('Choose a JPEG, PNG, WebP, or GIF.')
        continue
      }
      if (file.size > IMAGE_LIMIT) {
        setImageError('Use an image under 8 MB.')
        continue
      }
      setUploading((count) => count + 1)
      try {
        const src = await uploadImage(file)
        const ed = editorRef.current
        if (!ed) continue
        const chain = ed.chain().focus()
        if (typeof position === 'number') chain.insertContentAt(position, { type: 'image', attrs: { src, alt: '' } })
        else chain.setImage({ src, alt: '' })
        chain.run()
      } catch (err) {
        setImageError(err.message)
      } finally {
        setUploading((count) => count - 1)
      }
    }
  }
  uploadRef.current = insertImages

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
      ...(images ? [Image.configure({ inline: false, allowBase64: false })] : []),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `rich-copy px-3 py-3 focus:outline-none ${compact ? 'min-h-24' : 'min-h-44'}`,
        'aria-label': label || 'Rich text',
      },
      handlePaste: (_view, event) => {
        if (!images) return false
        const files = imageFiles(event.clipboardData?.files)
        if (files.length === 0) return false
        event.preventDefault()
        uploadRef.current(files)
        return true
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!images || moved) return false
        const files = imageFiles(event.dataTransfer?.files)
        if (files.length === 0) return false
        event.preventDefault()
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        uploadRef.current(files, position)
        return true
      },
    },
    onUpdate: ({ editor: next }) => onChangeRef.current(next.getHTML()),
  })
  editorRef.current = editor
  const imageSelected = images && editor?.isActive('image')

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
        {images && (
          <ToolButton label="Quote" disabled={!editor} active={editor?.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={16} />
          </ToolButton>
        )}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        {images && (
          <>
            <ToolButton label={uploading ? 'Uploading image…' : 'Insert image'} disabled={!editor || uploading > 0} onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} />
            </ToolButton>
            <input
              ref={fileRef}
              type="file"
              accept={IMAGE_TYPES.join(',')}
              multiple
              tabIndex={-1}
              className="sr-only"
              onChange={(event) => {
                const files = imageFiles(event.target.files)
                event.target.value = ''
                if (files.length) insertImages(files)
              }}
            />
          </>
        )}
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
      {imageSelected && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-2 py-2">
          <label className="min-w-0 flex-1 text-sm text-navy">
            <span className="sr-only">Image description</span>
            <input
              value={editor.getAttributes('image').alt || ''}
              onChange={(event) => editor.chain().updateAttributes('image', { alt: event.target.value }).run()}
              placeholder="Describe this image for screen readers"
              className="field mt-0"
            />
          </label>
          <button type="button" className="btn btn-outline !px-3 !py-2" onClick={() => editor.chain().focus().deleteSelection().run()}>
            Remove image
          </button>
        </div>
      )}
      {(uploading > 0 || imageError) && (
        <p role={imageError ? 'alert' : 'status'} className={`border-b border-line px-3 py-2 text-sm ${imageError ? 'bg-red-50 text-red-900' : 'bg-paper text-navy'}`}>
          {imageError || 'Uploading image…'}
        </p>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
