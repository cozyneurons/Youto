import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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

  return (
    <div className="rich-text-toolbar">
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <span style={{ fontStyle: 'italic' }}>I</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
          title="Strikethrough"
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`toolbar-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
          title="Highlight"
        >
          <span style={{ backgroundColor: '#ffcc00', color: '#000', padding: '0 4px', borderRadius: '2px' }}>H</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
          title="Inline Code"
        >
          {'<>'}
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          title="Ordered List"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
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
      editor.commands.setContent(value);
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
