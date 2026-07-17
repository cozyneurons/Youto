import { useEffect } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import '../../styles/rich-text.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isUnderline: ctx.editor.isActive('underline'),
      isStrike: ctx.editor.isActive('strike'),
      isHighlight: ctx.editor.isActive('highlight'),
      isCode: ctx.editor.isActive('code'),
      isBulletList: ctx.editor.isActive('bulletList'),
      isOrderedList: ctx.editor.isActive('orderedList'),
      isBlockquote: ctx.editor.isActive('blockquote'),
      canBold: ctx.editor.can().chain().focus().toggleBold().run(),
      canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
      canUnderline: ctx.editor.can().chain().focus().toggleUnderline().run(),
      canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
      canCode: ctx.editor.can().chain().focus().toggleCode().run(),
    }),
  });

  return (
    <div className="rich-text-toolbar">
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!state.canBold}
          className={`toolbar-btn ${state.isBold ? 'is-active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!state.canItalic}
          className={`toolbar-btn ${state.isItalic ? 'is-active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <span style={{ fontStyle: 'italic' }}>I</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!state.canUnderline}
          className={`toolbar-btn ${state.isUnderline ? 'is-active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!state.canStrike}
          className={`toolbar-btn ${state.isStrike ? 'is-active' : ''}`}
          title="Strikethrough"
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`toolbar-btn ${state.isHighlight ? 'is-active' : ''}`}
          title="Highlight"
        >
          <span style={{ backgroundColor: '#ffcc00', color: '#000', padding: '0 4px', borderRadius: '2px' }}>H</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!state.canCode}
          className={`toolbar-btn ${state.isCode ? 'is-active' : ''}`}
          title="Inline Code"
        >
          {'<>'}
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${state.isBulletList ? 'is-active' : ''}`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${state.isOrderedList ? 'is-active' : ''}`}
          title="Ordered List"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-btn ${state.isBlockquote ? 'is-active' : ''}`}
          title="Blockquote"
        >
          "
        </button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Pass HTML back to parent
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-content',
        spellcheck: 'true',
      },
    },
  });

  // Keep editor content in sync with external value changes (e.g. initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const isHtml = !value || value.trim().startsWith('<');
      if (!isHtml) {
        // Migrate legacy plain text to HTML preserving paragraphs
        const escaped = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const migrated = escaped.split('\n').map(line => `<p>${line}</p>`).join('');
        editor.commands.setContent(migrated, { emitUpdate: true });
      } else {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [value, editor]);

  return (
    <div className="rich-text-container">
      <MenuBar editor={editor} />
      <div className="rich-text-editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
