import React, { useEffect, useMemo } from "react";
import { EditorContent, useEditor, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { lowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, Strikethrough, Underline as UnderlineIcon, List, ListOrdered, Quote, Code, Image as ImageIcon, Table as TableIcon, CheckSquare, Link as LinkIcon, Heading1, Heading2, Heading3 } from "lucide-react";

interface RichEditorProps {
  value: string; // markdown
  onChange: (markdown: string) => void;
  placeholder?: string;
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, placeholder = "Write your content..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({ html: false })
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none p-4 min-h-[400px]",
      },
    },
    onUpdate({ editor }) {
      // export markdown on each update
      try {
        const md = (editor.storage as any).markdown.getMarkdown();
        onChange(md);
      } catch (e) {
        // ignore
      }
    },
  });

  // initialize from markdown
  useEffect(() => {
    if (!editor) return;
    // Only set when editor is empty to avoid cursor jumps
    const json = editor.getJSON();
    if (json && (json.content === undefined || json.content.length === 0)) {
      try {
        editor.commands.setContent(value || "", "markdown");
      } catch {
        // fallback: set as paragraph
        editor.commands.setContent(value || "");
      }
    }
  }, [editor]);

  const addImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("Set link URL", previousUrl || "https://");
    if (url === null) return; // cancel
    if (url === "") {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const MenuBar = useMemo(() => (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-card/60 sticky top-0 z-10">
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-accent' : ''}><Bold className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-accent' : ''}><Italic className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleStrike().run()} className={editor?.isActive('strike') ? 'bg-accent' : ''}><Strikethrough className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'bg-accent' : ''}><UnderlineIcon className="w-4 h-4" /></Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}><Heading1 className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}><Heading2 className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}><Heading3 className="w-4 h-4" /></Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'bg-accent' : ''}><List className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive('orderedList') ? 'bg-accent' : ''}><ListOrdered className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleTaskList().run()} className={editor?.isActive('taskList') ? 'bg-accent' : ''}><CheckSquare className="w-4 h-4" /></Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={editor?.isActive('blockquote') ? 'bg-accent' : ''}><Quote className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={editor?.isActive('codeBlock') ? 'bg-accent' : ''}><Code className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={addImage}><ImageIcon className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={setLink} className={editor?.isActive('link') ? 'bg-accent' : ''}><LinkIcon className="w-4 h-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="w-4 h-4" /></Button>
    </div>
  ), [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {MenuBar}

      <EditorContent editor={editor} />

      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex gap-1 p-1 bg-popover border rounded-lg shadow">
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent' : ''}><Bold className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent' : ''}><Italic className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-accent' : ''}><UnderlineIcon className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-accent' : ''}><Strikethrough className="w-4 h-4" /></Button>
        </div>
      </BubbleMenu>

      <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex gap-1 p-1 bg-popover border rounded-lg shadow">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Button>
        </div>
      </FloatingMenu>
    </div>
  );
};

export default RichEditor;