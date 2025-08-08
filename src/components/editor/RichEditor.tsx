import React, { useEffect, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
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
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { lowlight } from "lowlight";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, 
  Heading1, Heading2, Heading3, Underline as UnderlineIcon, 
  Image as ImageIcon, Link2, Table as TableIcon, 
  CheckSquare, Palette, Type
} from "lucide-react";

interface RichEditorProps {
  value: string; // markdown
  onChange: (markdown: string) => void;
  placeholder?: string;
}

const RichEditor: React.FC<RichEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Type '/' for commands or start writing..." 
}) => {
  
  // Image upload handler
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `editor-${timestamp}-${safeName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
      return null;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Underline,
      TextStyle,
      Color,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'task-item',
        },
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'table-auto border-collapse border border-gray-300 my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 px-4 py-2 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-100 dark:bg-gray-800 p-4 my-4',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none p-6 min-h-[500px]",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          const images = Array.from(event.dataTransfer.files).filter(file => 
            file.type.includes('image/')
          );
          
          if (images.length > 0) {
            event.preventDefault();
            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            
            images.forEach(async (image) => {
              const src = await uploadImage(image);
              if (src) {
                const node = schema.nodes.image.create({ src });
                const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
                view.dispatch(transaction);
              }
            });
            
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        const images = items.filter(item => item.type.includes('image'));
        
        if (images.length > 0) {
          event.preventDefault();
          images.forEach(async (item) => {
            const file = item.getAsFile();
            if (file) {
              const src = await uploadImage(file);
              if (src) {
                editor?.chain().focus().setImage({ src }).run();
              }
            }
          });
          return true;
        }
        return false;
      },
    },
    content: value,
    onUpdate({ editor }) {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  // Update content when value changes
  useEffect(() => {
    if (editor && value !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Add image via URL
  const addImageUrl = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // Add link
  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Insert table
  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-card/60 sticky top-0 z-10">
        {/* Text Formatting */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={editor.isActive('bold') ? 'bg-accent' : ''}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={editor.isActive('italic') ? 'bg-accent' : ''}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={editor.isActive('underline') ? 'bg-accent' : ''}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          className={editor.isActive('strike') ? 'bg-accent' : ''}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Headings */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Lists */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleTaskList().run()} 
          className={editor.isActive('taskList') ? 'bg-accent' : ''}
          title="Task List"
        >
          <CheckSquare className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Other Blocks */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Media & Links */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={addImageUrl}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-accent' : ''}
          title="Add Link"
        >
          <Link2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={insertTable}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
        
        {/* Drag & Drop Indicator */}
        <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1">
          Drag & drop images or paste directly
        </div>
      </div>
    </div>
  );
};

export default RichEditor;