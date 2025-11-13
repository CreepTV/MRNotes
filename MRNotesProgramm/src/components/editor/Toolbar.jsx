import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faCode,
  faHeading,
  faListUl,
  faListOl,
  faTasks,
  faQuoteRight,
  faMinus,
  faImage,
  faLink,
  faTable,
  faHighlighter,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faUndo,
  faRedo
} from '@fortawesome/free-solid-svg-icons';

export default function Toolbar({ editor }) {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="editor__toolbar">
      <div className="editor__toolbar-group">
        <button
          className={`editor__toolbar-button ${editor.isActive('bold') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <FontAwesomeIcon icon={faBold} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('italic') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('strike') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <FontAwesomeIcon icon={faStrikethrough} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('code') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <FontAwesomeIcon icon={faCode} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('highlight') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <FontAwesomeIcon icon={faHighlighter} />
        </button>
      </div>

      <div className="editor__toolbar-group">
        <button
          className={`editor__toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <FontAwesomeIcon icon={faHeading} />
          <sup>1</sup>
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <FontAwesomeIcon icon={faHeading} />
          <sup>2</sup>
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <FontAwesomeIcon icon={faHeading} />
          <sup>3</sup>
        </button>
      </div>

      <div className="editor__toolbar-group">
        <button
          className={`editor__toolbar-button ${editor.isActive('bulletList') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('orderedList') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('taskList') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Task List"
        >
          <FontAwesomeIcon icon={faTasks} />
        </button>
      </div>

      <div className="editor__toolbar-group">
        <button
          className={`editor__toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <FontAwesomeIcon icon={faAlignLeft} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <FontAwesomeIcon icon={faAlignCenter} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <FontAwesomeIcon icon={faAlignRight} />
        </button>
      </div>

      <div className="editor__toolbar-group">
        <button
          className={`editor__toolbar-button ${editor.isActive('blockquote') ? 'editor__toolbar-button--active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <FontAwesomeIcon icon={faQuoteRight} />
        </button>
        <button
          className="editor__toolbar-button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
      </div>

      <div className="editor__toolbar-group">
        <button
          className="editor__toolbar-button"
          onClick={addImage}
          title="Insert Image"
        >
          <FontAwesomeIcon icon={faImage} />
        </button>
        <button
          className={`editor__toolbar-button ${editor.isActive('link') ? 'editor__toolbar-button--active' : ''}`}
          onClick={addLink}
          title="Insert Link"
        >
          <FontAwesomeIcon icon={faLink} />
        </button>
        <button
          className="editor__toolbar-button"
          onClick={insertTable}
          title="Insert Table"
        >
          <FontAwesomeIcon icon={faTable} />
        </button>
      </div>

      <div className="editor__toolbar-group">
        <button
          className="editor__toolbar-button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button
          className="editor__toolbar-button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>
    </div>
  );
}