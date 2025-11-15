import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faFont,
  faTextHeight,
  faHighlighter,
  faPalette,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faIndent,
  faOutdent,
  faQuoteRight,
  faCode,
  faLink,
  faUnlink,
  faImage,
  faTable,
  faChevronDown,
  faUndo,
  faRedo,
  faCopy,
  faPaste,
  faScissors,
  faEraser,
  faSubscript,
  faSuperscript,
  faMinus,
  faRemoveFormat
} from '@fortawesome/free-solid-svg-icons';

export default function RichToolbar({ editor }) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  
  const fontMenuRef = useRef(null);
  const sizeMenuRef = useRef(null);
  const colorMenuRef = useRef(null);
  const highlightMenuRef = useRef(null);

  const hasEditor = !!editor;

  const fontSizes = [
    { label: '8', value: '8pt' },
    { label: '9', value: '9pt' },
    { label: '10', value: '10pt' },
    { label: '11', value: '11pt' },
    { label: '12', value: '12pt' },
    { label: '14', value: '14pt' },
    { label: '16', value: '16pt' },
    { label: '18', value: '18pt' },
    { label: '20', value: '20pt' },
    { label: '24', value: '24pt' },
    { label: '28', value: '28pt' },
    { label: '32', value: '32pt' },
    { label: '36', value: '36pt' },
    { label: '48', value: '48pt' },
    { label: '72', value: '72pt' }
  ];

  const textColors = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
    '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
    '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
    '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
    '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
    '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
    '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
    '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130'
  ];

  const highlightColors = [
    { color: 'transparent', label: 'Keine' },
    { color: '#FFFF00', label: 'Gelb' },
    { color: '#00FF00', label: 'Grün' },
    { color: '#00FFFF', label: 'Cyan' },
    { color: '#FF00FF', label: 'Magenta' },
    { color: '#0000FF', label: 'Blau' },
    { color: '#FF0000', label: 'Rot' },
    { color: '#FFA500', label: 'Orange' },
    { color: '#808080', label: 'Grau' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) {
        setShowFontMenu(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target)) {
        setShowSizeMenu(false);
      }
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target)) {
        setShowColorMenu(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(e.target)) {
        setShowHighlightMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setFontSize = (size) => {
    // TipTap doesn't have built-in font size, but we can use inline styles
    const fontSize = parseInt(size);
    if (fontSize <= 12) {
      editor.chain().focus().setParagraph().run();
    } else if (fontSize <= 18) {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (fontSize <= 24) {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    }
    setShowSizeMenu(false);
  };

  return (
    <div className="rich-toolbar" onMouseDown={(e) => e.preventDefault()}>
      {/* Undo/Redo */}
      <div className="rich-toolbar__group">
        <button
          className="rich-toolbar__btn"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!hasEditor || !editor?.can().undo()}
          title="Rückgängig (Ctrl+Z)"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button
          className="rich-toolbar__btn"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!hasEditor || !editor?.can().redo()}
          title="Wiederholen (Ctrl+Y)"
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>

      <div className="rich-toolbar__separator" />

      {/* Schriftgröße */}
      <div className="rich-toolbar__group" ref={sizeMenuRef}>
        <button
          className="rich-toolbar__btn rich-toolbar__btn--dropdown"
          onClick={() => hasEditor && setShowSizeMenu(!showSizeMenu)}
          disabled={!hasEditor}
          title="Schriftgröße"
        >
          <FontAwesomeIcon icon={faTextHeight} />
          <FontAwesomeIcon icon={faChevronDown} className="rich-toolbar__dropdown-icon" />
        </button>
        {showSizeMenu && (
          <div className="rich-toolbar__dropdown">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                className="rich-toolbar__dropdown-item"
                onClick={() => setFontSize(size.value)}
              >
                <span style={{ fontSize: `${parseInt(size.value) * 0.8}px` }}>{size.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rich-toolbar__separator" />

      {/* Formatierung */}
      <div className="rich-toolbar__group">
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('bold') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!hasEditor}
          title="Fett (Ctrl+B)"
        >
          <FontAwesomeIcon icon={faBold} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('italic') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!hasEditor}
          title="Kursiv (Ctrl+I)"
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('underline') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          disabled={!hasEditor}
          title="Unterstrichen (Ctrl+U)"
        >
          <FontAwesomeIcon icon={faUnderline} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('strike') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!hasEditor}
          title="Durchgestrichen"
        >
          <FontAwesomeIcon icon={faStrikethrough} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('subscript') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleSubscript().run()}
          disabled={!hasEditor}
          title="Tiefgestellt"
        >
          <FontAwesomeIcon icon={faSubscript} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('superscript') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleSuperscript().run()}
          disabled={!hasEditor}
          title="Hochgestellt"
        >
          <FontAwesomeIcon icon={faSuperscript} />
        </button>
      </div>

      <div className="rich-toolbar__separator" />

      {/* Textfarbe & Highlight */}
      <div className="rich-toolbar__group">
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('highlight') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleHighlight({ color: '#FFFF00' }).run()}
          disabled={!hasEditor}
          title="Textmarker"
        >
          <FontAwesomeIcon icon={faHighlighter} />
        </button>
        <button
          className="rich-toolbar__btn"
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          disabled={!hasEditor}
          title="Formatierung entfernen"
        >
          <FontAwesomeIcon icon={faRemoveFormat} />
        </button>
      </div>

      <div className="rich-toolbar__separator" />

      {/* Link */}
      <div className="rich-toolbar__group">
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('link') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => {
            if (!editor) return;
            const url = window.prompt('URL eingeben:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          disabled={!hasEditor}
          title="Link einfügen"
        >
          <FontAwesomeIcon icon={faLink} />
        </button>
        <button
          className="rich-toolbar__btn"
          onClick={() => editor?.chain().focus().unsetLink().run()}
          disabled={!hasEditor || !editor?.isActive('link')}
          title="Link entfernen"
        >
          <FontAwesomeIcon icon={faUnlink} />
        </button>
      </div>

      <div className="rich-toolbar__separator" />

      {/* Überschriften */}
      <div className="rich-toolbar__group">
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('heading', { level: 1 }) ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={!hasEditor}
          title="Überschrift 1"
        >
          <strong>H1</strong>
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('heading', { level: 2 }) ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!hasEditor}
          title="Überschrift 2"
        >
          <strong>H2</strong>
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('heading', { level: 3 }) ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={!hasEditor}
          title="Überschrift 3"
        >
          <strong>H3</strong>
        </button>
      </div>

      <div className="rich-toolbar__separator" />

      {/* Ausrichtung */}
      <div className="rich-toolbar__group">
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive({ textAlign: 'left' }) ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          disabled={!hasEditor}
          title="Linksbündig"
        >
          <FontAwesomeIcon icon={faAlignLeft} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive({ textAlign: 'center' }) ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          disabled={!hasEditor}
          title="Zentriert"
        >
          <FontAwesomeIcon icon={faAlignCenter} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive({ textAlign: 'right' }) ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          disabled={!hasEditor}
          title="Rechtsbündig"
        >
          <FontAwesomeIcon icon={faAlignRight} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive({ textAlign: 'justify' }) ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          disabled={!hasEditor}
          title="Blocksatz"
        >
          <FontAwesomeIcon icon={faAlignJustify} />
        </button>
      </div>

      <div className="rich-toolbar__separator" />

      {/* Listen */}
      <div className="rich-toolbar__group">
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('bulletList') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!hasEditor}
          title="Aufzählung"
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('orderedList') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!hasEditor}
          title="Nummerierung"
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>
        <button
          className="rich-toolbar__btn"
          onClick={() => {
            if (!editor) return;
            if (editor.can().sinkListItem('listItem')) {
              editor.chain().focus().sinkListItem('listItem').run();
            }
          }}
          disabled={!hasEditor || !editor?.can().sinkListItem('listItem')}
          title="Einzug vergrößern"
        >
          <FontAwesomeIcon icon={faIndent} />
        </button>
        <button
          className="rich-toolbar__btn"
          onClick={() => {
            if (!editor) return;
            if (editor.can().liftListItem('listItem')) {
              editor.chain().focus().liftListItem('listItem').run();
            }
          }}
          disabled={!hasEditor || !editor?.can().liftListItem('listItem')}
          title="Einzug verkleinern"
        >
          <FontAwesomeIcon icon={faOutdent} />
        </button>
      </div>

      <div className="rich-toolbar__separator" />

      {/* Weitere Optionen */}
      <div className="rich-toolbar__group">
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('blockquote') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          disabled={!hasEditor}
          title="Zitat"
        >
          <FontAwesomeIcon icon={faQuoteRight} />
        </button>
        <button
          className={`rich-toolbar__btn ${hasEditor && editor.isActive('code') ? 'rich-toolbar__btn--active' : ''}`}
          onClick={() => editor?.chain().focus().toggleCode().run()}
          disabled={!hasEditor}
          title="Code"
        >
          <FontAwesomeIcon icon={faCode} />
        </button>
        <button
          className="rich-toolbar__btn"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={!hasEditor}
          title="Horizontale Linie"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
      </div>
    </div>
  );
}
