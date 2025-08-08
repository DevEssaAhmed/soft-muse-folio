import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface NotionToolbarProps {
  editor: Editor;
}

const NotionToolbar: React.FC<NotionToolbarProps> = ({ editor }) => {
  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const colors = [
    { label: 'Default', value: '#000000' },
    { label: 'Gray', value: '#9CA3AF' },
    { label: 'Brown', value: '#92400E' },
    { label: 'Orange', value: '#EA580C' },
    { label: 'Yellow', value: '#CA8A04' },
    { label: 'Green', value: '#16A34A' },
    { label: 'Blue', value: '#2563EB' },
    { label: 'Purple', value: '#9333EA' },
    { label: 'Pink', value: '#DB2777' },
    { label: 'Red', value: '#DC2626' },
  ];

  return (
    <div className="notion-toolbar flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50 sticky top-0 z-20">
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
          title="Bold (⌘B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
          title="Italic (⌘I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-accent' : ''}
          title="Underline (⌘U)"
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
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-accent' : ''}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" title="Text Color">
            <Palette className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="grid grid-cols-5 gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                className="w-8 h-8 rounded border-2 border-transparent hover:border-gray-300"
                style={{ backgroundColor: color.value }}
                onClick={() => editor.chain().focus().setColor(color.value).run()}
                title={color.label}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-6" />

      {/* Headings */}
      <div className="flex items-center gap-1">
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
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists and Blocks */}
      <div className="flex items-center gap-1">
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
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Media and Special Elements */}
      <div className="flex items-center gap-1">
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
          onClick={addImage}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default NotionToolbar;