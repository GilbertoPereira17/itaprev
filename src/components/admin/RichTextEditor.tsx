"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Undo2, Redo2, Minus,
} from "lucide-react";

/** Editor visual (tipo WordPress). Grava o HTML num input oculto com o `name` informado. */
export function RichTextEditor({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose-itaprev min-h-[320px] px-5 py-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-[var(--color-brand-blue)] focus-within:ring-2 focus-within:ring-[var(--color-brand-blue)]/25">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
      active ? "bg-[var(--color-brand-blue)] text-white" : "text-slate-600 hover:bg-slate-100"
    }`;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (deixe vazio para remover):", prev || "https://");
    if (url === null) return;
    if (url.trim() === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const tools = [
    { icon: Bold, label: "Negrito", run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, label: "Itálico", run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { icon: Heading2, label: "Título", run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { icon: Heading3, label: "Subtítulo", run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    { icon: List, label: "Lista", run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { icon: ListOrdered, label: "Lista numerada", run: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { icon: Quote, label: "Citação", run: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
    { icon: Link2, label: "Link", run: setLink, active: editor.isActive("link") },
    { icon: Minus, label: "Linha divisória", run: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    { icon: Undo2, label: "Desfazer", run: () => editor.chain().focus().undo().run(), active: false },
    { icon: Redo2, label: "Refazer", run: () => editor.chain().focus().redo().run(), active: false },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
      {tools.map((t) => (
        <button key={t.label} type="button" title={t.label} aria-label={t.label} onClick={t.run} className={btn(t.active)}>
          <t.icon className="h-4 w-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
