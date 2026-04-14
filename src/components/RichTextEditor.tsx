import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon,
  Youtube, Heading2, Heading3, Quote, Image, AlignLeft, AlignCenter, AlignRight, Type, Minus, X
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Tulis konten di sini...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [showYoutubePopup, setShowYoutubePopup] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current && editorRef.current) {
      editorRef.current.innerHTML = value || '';
      isInitialMount.current = false;
    }
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    syncContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = () => {
    syncContent();
  };

  const insertLink = () => {
    if (linkUrl) {
      exec('createLink', linkUrl);
    }
    setLinkUrl('');
    setShowLinkPopup(false);
  };

  const insertYoutube = () => {
    const match = youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      const videoId = match[1];
      const html = `<div class="yt-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
      document.execCommand('insertHTML', false, html);
      syncContent();
    }
    setYoutubeUrl('');
    setShowYoutubePopup(false);
  };

  const insertImage = () => {
    if (imageUrl) {
      const html = `<img src="${imageUrl}" alt="Image" style="max-width:100%;border-radius:8px;margin:8px 0;" /><p><br></p>`;
      document.execCommand('insertHTML', false, html);
      syncContent();
    }
    setImageUrl('');
    setShowImagePopup(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const html = `<img src="${reader.result}" alt="Image" style="max-width:100%;border-radius:8px;margin:8px 0;" /><p><br></p>`;
      document.execCommand('insertHTML', false, html);
      syncContent();
    };
    reader.readAsDataURL(file);
    setShowImagePopup(false);
  };

  const toolbarButtons = [
    { icon: Type, action: () => exec('removeFormat'), title: 'Normal Text' },
    { icon: Bold, action: () => exec('bold'), title: 'Bold' },
    { icon: Italic, action: () => exec('italic'), title: 'Italic' },
    { icon: Underline, action: () => exec('underline'), title: 'Underline' },
    { type: 'separator' as const },
    { icon: Heading2, action: () => exec('formatBlock', 'h2'), title: 'Heading 2' },
    { icon: Heading3, action: () => exec('formatBlock', 'h3'), title: 'Heading 3' },
    { icon: Quote, action: () => exec('formatBlock', 'blockquote'), title: 'Quote' },
    { type: 'separator' as const },
    { icon: List, action: () => exec('insertUnorderedList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => exec('insertOrderedList'), title: 'Numbered List' },
    { type: 'separator' as const },
    { icon: AlignLeft, action: () => exec('justifyLeft'), title: 'Align Left' },
    { icon: AlignCenter, action: () => exec('justifyCenter'), title: 'Center' },
    { icon: AlignRight, action: () => exec('justifyRight'), title: 'Align Right' },
    { type: 'separator' as const },
    { icon: LinkIcon, action: () => setShowLinkPopup(true), title: 'Insert Link' },
    { icon: Image, action: () => setShowImagePopup(true), title: 'Insert Image' },
    { icon: Youtube, action: () => setShowYoutubePopup(true), title: 'Embed YouTube' },
    { type: 'separator' as const },
    { icon: Minus, action: () => exec('insertHorizontalRule'), title: 'Horizontal Line' },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {toolbarButtons.map((btn, i) => {
          if ('type' in btn && btn.type === 'separator') {
            return <div key={i} className="w-px h-6 bg-gray-300 mx-1" />;
          }
          const Ic = 'icon' in btn ? btn.icon : null;
          return (
            <button
              key={i}
              type="button"
              onClick={'action' in btn ? btn.action : undefined}
              title={'title' in btn ? btn.title : ''}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
              onMouseDown={(e) => e.preventDefault()}
            >
              {Ic && <Ic className="h-4 w-4" />}
            </button>
          );
        })}
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={syncContent}
        className="min-h-[250px] max-h-[500px] overflow-y-auto p-4 text-sm text-gray-800 leading-relaxed focus:outline-none rich-text-content"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Link Popup */}
      {showLinkPopup && (
        <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4" onClick={() => setShowLinkPopup(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Sisipkan Link</h4>
              <button onClick={() => setShowLinkPopup(false)} className="p-1 hover:bg-gray-100 rounded"><X className="h-4 w-4" /></button>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
              placeholder="https://example.com"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkPopup(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={insertLink} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">Sisipkan</button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Popup */}
      {showYoutubePopup && (
        <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4" onClick={() => setShowYoutubePopup(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Embed Video YouTube
              </h4>
              <button onClick={() => setShowYoutubePopup(false)} className="p-1 hover:bg-gray-100 rounded"><X className="h-4 w-4" /></button>
            </div>
            <input
              type="url"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              placeholder="https://www.youtube.com/watch?v=..."
              autoFocus
            />
            <p className="text-xs text-gray-400 mb-3">Mendukung: youtube.com/watch, youtu.be, youtube.com/shorts</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowYoutubePopup(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={insertYoutube} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Embed Video</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup */}
      {showImagePopup && (
        <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4" onClick={() => setShowImagePopup(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Sisipkan Gambar</h4>
              <button onClick={() => setShowImagePopup(false)} className="p-1 hover:bg-gray-100 rounded"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">URL Gambar</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="text-center text-xs text-gray-400">— atau —</div>
              <label className="block cursor-pointer text-center border-2 border-dashed border-gray-200 rounded-lg py-4 hover:border-primary-300 transition-colors">
                <Image className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                <span className="text-sm text-gray-500">Upload dari komputer (maks 2MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowImagePopup(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={insertImage} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">Sisipkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
