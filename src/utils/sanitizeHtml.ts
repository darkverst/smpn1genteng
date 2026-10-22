import DOMPurify from 'dompurify';

/**
 * Konfigurasi sanitasi HTML standar untuk aplikasi web portal sekolah.
 * Membersihkan skrip berbahaya (XSS), atribut event handler (onload, onerror, dll),
 * serta skema URL berbahaya (javascript:, vbscript:) namun tetap mempertahankan
 * format styling, layout, dan media yang aman dari RichTextEditor.
 */
const DEFAULT_SANATIZE_OPTIONS = {
  ALLOWED_TAGS: [
    'p', 'br', 'hr',
    'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup', 'mark',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'img', 'figure', 'figcaption',
    'iframe'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'title',
    'src', 'alt', 'width', 'height', 'loading',
    'class', 'className', 'style', 'id',
    'align', 'valign', 'colspan', 'rowspan',
    'allow', 'allowfullscreen', 'frameborder'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'form', 'input', 'button', 'textarea', 'select'],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onkeydown', 'onkeypress', 'onkeyup', 'formaction'
  ]
};

/**
 * Sanitasi string HTML sebelum dirender ke dangerouslySetInnerHTML
 * @param dirty HTML yang berpotensi mengandung kode XSS
 * @returns HTML bersih dan aman
 */
export function sanitizeHtml(dirty?: string | null): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Hook untuk memastikan link eksternal selalu memiliki rel="noopener noreferrer"
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const cleaned = DOMPurify.sanitize(dirty, DEFAULT_SANATIZE_OPTIONS);

  // Bersihkan hook setelah dipakai agar tidak menumpuk
  DOMPurify.removeHook('afterSanitizeAttributes');

  return typeof cleaned === 'string' ? cleaned : '';
}
