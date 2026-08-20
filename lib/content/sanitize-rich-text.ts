import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(value: string | null | undefined) {
  return sanitizeHtml(value ?? "", {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s",
      "h1", "h2", "h3", "h4",
      "ul", "ol", "li", "blockquote",
      "pre", "code", "a", "hr", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      div: ["style"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^center$/, /^right$/, /^justify$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          ...(attribs.target === "_blank" ? { target: "_blank" } : {}),
        },
      }),
    },
  }).trim();
}
