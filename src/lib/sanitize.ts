import sanitizeHtml from "sanitize-html";

/** Limpa HTML vindo do editor/WordPress: mantém formatação, remove scripts, estilos e iframes */
export function cleanHtml(html: string) {
  return sanitizeHtml(html || "", {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "hr", "img", "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      h1: "h2",
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(/^https?:\/\//.test(attribs.href || "") ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
      }),
    },
  });
}
