// src/components/editor/NotionEditor.tsx
import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  EditorContent,
  useEditor,
  Editor,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import type { Root } from "hast";
import {
  Type,
  Hash,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import "./editor-styles.css";

/**
 * NOTES:
 * - This component uses CodeBlockLowlight + lowlight for syntax highlighting.
 * - Code block NodeView renders a small language selector (auto, plus languages available in lowlight).
 *
 * Docs references:
 * - CodeBlockLowlight example & docs: https://tiptap.dev/docs/editor/extensions/nodes/code-block-lowlight
 * - Node view + React: https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views/react
 * - lowlight usage: https://www.npmjs.com/package/lowlight
 *
 * Install:
 * npm i @tiptap/extension-code-block-lowlight lowlight
 * (and other tiptap packages used)
 */

/* -------------------------
   Type defs used locally
   ------------------------- */
interface NotionEditorProps {
  value: string;
  onChange: (htmlOrMarkdown: string) => void;
  placeholder?: string;
}

interface SuggestionItem {
  title: string;
  description: string;
  searchTerms: string[];
  icon?: React.ReactNode;
  command: ({ editor, range }: { editor: Editor; range: { from: number; to: number } | null }) => void;
}

/* -------------------------
   Suggestions (slash menu)
   ------------------------- */
const suggestions: SuggestionItem[] = [
  {
    title: "Text",
    description: "Plain paragraph",
    searchTerms: ["p", "paragraph", "text"],
    icon: <Type className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big heading",
    searchTerms: ["h1", "heading1", "title"],
    icon: <Hash className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium heading",
    searchTerms: ["h2", "heading2"],
    icon: <Hash className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Unordered list",
    searchTerms: ["ul", "unordered", "bullet", "list"],
    icon: <List className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    searchTerms: ["ol", "ordered", "numbered", "list"],
    icon: <ListOrdered className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "To-do",
    description: "Task list",
    searchTerms: ["todo", "task", "checkbox"],
    icon: <CheckSquare className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Quote",
    description: "Blockquote",
    searchTerms: ["quote", "blockquote"],
    icon: <Quote className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code",
    description: "Code block",
    searchTerms: ["code", "codeblock", "snippet"],
    icon: <Code className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      // insert a code block (using code block lowlight's node)
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Image",
    description: "Insert image by URL",
    searchTerms: ["img", "image", "photo"],
    icon: <ImageIcon className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      const url = window.prompt("Image URL:");
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      }
    },
  },
  {
    title: "Table",
    description: "Insert table (3×3)",
    searchTerms: ["table", "grid"],
    icon: <TableIcon className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Divider",
    description: "Horizontal rule",
    searchTerms: ["divider", "hr", "rule"],
    icon: <Minus className="w-4 h-4" />,
    command: ({ editor, range }) => {
      if (!range) return;
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

/* -------------------------
   lowlight setup
   ------------------------- */
// create a lowlight instance that includes the 'common' grammars.
// (you can also register additional highlight.js grammars manually)
const lowlight = createLowlight(common as any); // common includes many languages

/* -------------------------
   Code block node view component
   ------------------------- */
const CodeBlockNodeView: React.FC<NodeViewProps> = (props) => {
  // NodeViewProps includes: node, updateAttributes, editor, getPos, etc.
  const { node, updateAttributes, editor } = props as any;
  const language = (node.attrs && node.attrs.language) || "auto";
  const available = lowlight.listLanguages(); // array of registered languages (strings)

  const onChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value || null;
    // Update node attributes for the code block. If lang is 'auto' or empty, set attribute accordingly.
    updateAttributes({ language: lang });
    // keep focus inside editor
    setTimeout(() => editor?.commands?.focus?.(), 20);
  };

  return (
    <NodeViewWrapper className="notion-code-block relative">
      <div style={{ position: "absolute", right: 8, top: 8, zIndex: 20 }}>
        <select
          value={language ?? "auto"}
          onChange={onChangeLanguage}
          className="appearance-none px-2 py-1 text-xs rounded bg-muted/70"
          aria-label="Select code language"
        >
          <option value="auto">auto</option>
          <option value="plaintext">plaintext</option>
          {available.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <pre className="notion-code-pre">
         <code className={`language-${language ?? ""}`}>

        <NodeViewContent />
         </code>

      </pre>
    </NodeViewWrapper>
  );
};

/* -------------------------
   Extend CodeBlockLowlight to use our NodeView
   ------------------------- */
const CodeBlockLowlightWithView = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },
}).configure({
  lowlight,
  defaultLanguage: "auto",
  // languageClassPrefix: 'language-', // optional
});

/* -------------------------
   SlashMenu component (you already have something similar)
   We'll keep it small and local to integrate easily.
   ------------------------- */
const SlashMenu: React.FC<{
  editor: Editor;
  items: SuggestionItem[];
  range: { from: number; to: number } | null;
  clientRect: DOMRect | null;
  onClose: () => void;
}> = ({ editor, items, range, clientRect, onClose }) => {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!items.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => (s + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => (s - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        items[selected].command({ editor, range });
        onClose();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [items, selected, editor, range, onClose]);

  if (!clientRect || !range || items.length === 0) return null;

  return (
    <div
      className="slash-menu bg-white border rounded shadow max-w-sm overflow-hidden absolute z-50"
      style={{
        top: clientRect.bottom + window.pageYOffset,
        left: clientRect.left + window.pageXOffset,
        minWidth: 220,
      }}
    >
      {items.map((it, idx) => (
        <div
          key={it.title}
          className={`flex items-center p-2 cursor-pointer ${idx === selected ? "bg-gray-200" : ""}`}
          onClick={() => {
            it.command({ editor, range });
            onClose();
          }}
          onMouseEnter={() => setSelected(idx)}
        >
          <div className="mr-2">{it.icon}</div>
          <div>
            <div className="font-semibold text-sm">{it.title}</div>
            <div className="text-xs text-gray-600">{it.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------
   Main NotionEditor component
   ------------------------- */
const NotionEditor: React.FC<NotionEditorProps> = ({ value, onChange, placeholder = "Type '/' for commands..." }) => {
  const [suggestionRange, setSuggestionRange] = useState<{ from: number; to: number } | null>(null);
  const [suggestionRect, setSuggestionRect] = useState<DOMRect | null>(null);
  const [suggestionItems, setSuggestionItems] = useState<SuggestionItem[]>([]);
  const suggestionTimer = useRef<number | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const ts = Date.now();
      const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const name = `editor-${ts}-${safe}`;
      const { data, error } = await supabase.storage.from("images").upload(name, file, {
        contentType: file.type,
        upsert: true,
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(name);
      return urlData.publicUrl;
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
      return null;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }), // disable default codeBlock
      CodeBlockLowlightWithView, // highlighted code blocks with our node view
      Placeholder.configure({ placeholder, showOnlyWhenEditable: true, showOnlyCurrent: false }),
      TaskList,
      TaskItem,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link,
      Image,
    ],
    content: value || "",
    onUpdate({ editor }) {
      // Return HTML. If you prefer Markdown, convert here with your converter.
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "notion-editor-content focus:outline-none prose prose-lg max-w-none p-6",
      },
      handleDrop(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          const images = Array.from(event.dataTransfer.files).filter((f) => f.type.includes("image/"));
          if (images.length > 0) {
            event.preventDefault();
            const { schema } = view.state;
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            images.forEach(async (img) => {
              const src = await uploadImage(img);
              if (src) {
                const node = schema.nodes.image.create({ src });
                const tr = view.state.tr.insert(coords?.pos || 0, node);
                view.dispatch(tr);
              }
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync incoming value -> editor content (controlled-ish)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value && value !== currentHtml) {
      editor.commands.setContent(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  // Slash detection: detect a `/` token + live query to show SlashMenu
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => {
      // Debounce quick typing a bit
      if (suggestionTimer.current) window.clearTimeout(suggestionTimer.current);
      suggestionTimer.current = window.setTimeout(() => {
        try {
          const state = (editor as any).state;
          const sel = state.selection;
          const from = sel.from; // cursor position
          if (from === 0) {
            setSuggestionRange(null);
            setSuggestionRect(null);
            setSuggestionItems([]);
            return;
          }
          // scan backwards from cursor for the nearest slash that's part of a "word"
          let found = -1;
          const doc = state.doc;
          for (let pos = from - 1; pos >= 0; pos--) {
            const ch = doc.textBetween(pos, pos + 1, "\n");
            if (ch === "/") {
              found = pos;
              break;
            }
            // stop scanning if whitespace or newline
            if (/\s/.test(ch)) {
              break;
            }
          }
          if (found >= 0) {
            const query = doc.textBetween(found + 1, from, "\n");
            // Build items via lightweight filter
            const q = query.toLowerCase();
            const items = suggestions.filter((it) => {
              const terms = (it.searchTerms || []).join(" ") + " " + it.title;
              return terms.toLowerCase().includes(q);
            }).slice(0, 10);
            if (items.length === 0) {
              // If nothing matches, keep not showing
              setSuggestionRange(null);
              setSuggestionRect(null);
              setSuggestionItems([]);
              return;
            }
            // compute client rect for the menu using coordsAtPos:
            // coordsAtPos expects a pos in the editor; position at 'from' shows caret location.
            const coords = (editor as any).view.coordsAtPos(from);
            // coords has { left, right, top, bottom } relative to viewport
            const rect = {
              bottom: coords.bottom,
              left: coords.left,
              top: coords.top,
            } as unknown as DOMRect;
            setSuggestionRange({ from: found, to: from });
            setSuggestionRect(rect);
            setSuggestionItems(items);
            return;
          }

          // no slash found — clear suggestion UI
          setSuggestionRange(null);
          setSuggestionRect(null);
          setSuggestionItems([]);
        } catch (err) {
          // swallow errors in detection logic
          // console.warn(err)
          setSuggestionRange(null);
          setSuggestionRect(null);
          setSuggestionItems([]);
        }
      }, 70);
    };

    editor.on("update", onUpdate);
    editor.on("selectionUpdate", onUpdate); // optional
    return () => {
      editor.off("update", onUpdate);
      editor.off("selectionUpdate", onUpdate);
      if (suggestionTimer.current) window.clearTimeout(suggestionTimer.current);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="notion-editor border rounded-lg overflow-hidden bg-background relative">
      <EditorContent editor={editor} className="notion-editor-wrapper min-h-[400px]" />
      <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1 pointer-events-none">
        Type "/" for commands
      </div>

      {/* Slash menu */}
      {suggestionRange && suggestionRect && suggestionItems.length > 0 && (
        <SlashMenu
          editor={editor}
          items={suggestionItems}
          range={suggestionRange}
          clientRect={suggestionRect}
          onClose={() => {
            setSuggestionRange(null);
            setSuggestionRect(null);
            setSuggestionItems([]);
          }}
        />
      )}
    </div>
  );
};

export default NotionEditor;
