import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3 } from "lucide-react";

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
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none p-4 min-h-[400px]",
      },
    },
    content: value,
    onUpdate({ editor }) {
      // Get HTML content and convert to markdown-like format
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update content when value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-card/60 sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={editor.isActive('bold') ? 'bg-accent' : ''}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={editor.isActive('italic') ? 'bg-accent' : ''}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          className={editor.isActive('strike') ? 'bg-accent' : ''}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichEditor;