import React, { useEffect, useCallback, useState } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { createLowlight } from "lowlight";
import { Slash, SlashCmd, SlashCmdProvider } from "@harshtalks/slash-tiptap";
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
  GripVertical,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import "./editor-styles.css";

interface NotionEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

const NotionEditor: React.FC<NotionEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Type '/' for commands or start writing..." 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Slash command suggestions
  const suggestions = [
    {
      title: "Text",
      description: "Just start typing with plain text",
      searchTerms: ["p", "paragraph", "text"],
      icon: <Type className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading",
      searchTerms: ["h1", "heading1", "title"],
      icon: <Hash className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      },
    },
    {
      title: "Heading 2", 
      description: "Medium section heading",
      searchTerms: ["h2", "heading2", "subtitle"],
      icon: <Hash className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading", 
      searchTerms: ["h3", "heading3"],
      icon: <Hash className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      searchTerms: ["ul", "unordered", "bullet", "list"],
      icon: <List className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      searchTerms: ["ol", "ordered", "numbered", "list"],
      icon: <ListOrdered className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "To-do List",
      description: "Track tasks with a to-do list",
      searchTerms: ["todo", "task", "checkbox", "check"],
      icon: <CheckSquare className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quote",
      searchTerms: ["quote", "blockquote", "citation"],
      icon: <Quote className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code",
      description: "Capture a code snippet",
      searchTerms: ["code", "codeblock", "snippet"],
      icon: <Code className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Image",
      description: "Upload an image",
      searchTerms: ["img", "image", "photo", "picture"],
      icon: <ImageIcon className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        const url = window.prompt('Enter image URL:');
        if (url) {
          editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
        }
      },
    },
    {
      title: "Table",
      description: "Insert a table",
      searchTerms: ["table", "grid"],
      icon: <TableIcon className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
    {
      title: "Divider",
      description: "Visually divide blocks",
      searchTerms: ["hr", "horizontal", "rule", "divider", "separator"],
      icon: <Minus className="w-4 h-4" />,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: false, // Use CodeBlockLowlight instead
        horizontalRule: {
          HTMLAttributes: {
            class: 'notion-hr',
          },
        },
      }),
      Slash.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            return suggestions.filter(item => {
              const searchTerms = item.searchTerms.join(' ').toLowerCase();
              return item.title.toLowerCase().includes(query.toLowerCase()) || 
                     searchTerms.includes(query.toLowerCase());
            });
          },
        },
      }),
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'notion-image',
        },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'notion-link',
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
          class: 'notion-task-list',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'notion-task-item',
        },
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'notion-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'notion-table-row',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'notion-table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'notion-table-cell',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
        HTMLAttributes: {
          class: 'notion-code-block',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "notion-editor-content focus:outline-none",
        "data-placeholder": placeholder,
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

  // Add drag handles to blocks
  const addDragHandles = useCallback(() => {
    if (!editor) return;
    
    const editorElement = document.querySelector('.notion-editor-content');
    if (!editorElement) return;

    // Remove existing handles
    document.querySelectorAll('.notion-drag-handle').forEach(handle => handle.remove());

    // Add drag handles to each block
    const blocks = editorElement.querySelectorAll('p, h1, h2, h3, ul, ol, blockquote, pre, table, hr');
    blocks.forEach((block, index) => {
      if (block.closest('.notion-drag-handle')) return;
      
      const handle = document.createElement('button');
      handle.className = 'notion-drag-handle drag-handle';
      handle.innerHTML = '⋮⋮';
      handle.draggable = true;
      handle.title = 'Drag to move';
      
      // Position the handle
      const blockElement = block as HTMLElement;
      blockElement.style.position = 'relative';
      blockElement.appendChild(handle);
      
      // Add drag functionality
      handle.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', index.toString());
      });
    });
  }, [editor]);

  // Add plus buttons for new blocks
  const addPlusButtons = useCallback(() => {
    if (!editor) return;
    
    const editorElement = document.querySelector('.notion-editor-content');
    if (!editorElement) return;

    // Remove existing plus buttons
    document.querySelectorAll('.notion-plus-button').forEach(btn => btn.remove());

    // Add plus buttons between blocks
    const blocks = editorElement.querySelectorAll('p, h1, h2, h3, ul, ol, blockquote, pre, table, hr');
    blocks.forEach((block) => {
      const plusButton = document.createElement('button');
      plusButton.className = 'notion-plus-button plus-button';
      plusButton.innerHTML = '+';
      plusButton.title = 'Add block';
      
      const blockElement = block as HTMLElement;
      blockElement.style.position = 'relative';
      blockElement.appendChild(plusButton);
      
      plusButton.addEventListener('click', () => {
        setIsMenuOpen(true);
        // Focus at the end of current block
        const pos = editor.view.posAtDOM(block, 0);
        editor.chain().focus().setTextSelection(pos).run();
      });
    });
  }, [editor]);

  // Update handles when content changes
  useEffect(() => {
    if (editor) {
      const timeout = setTimeout(() => {
        addDragHandles();
        addPlusButtons();
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [editor, addDragHandles, addPlusButtons]);

  if (!editor) return null;

  return (
    <SlashCmdProvider>
      <div className="notion-editor border rounded-lg overflow-hidden bg-background">
        <div className="relative">
          <EditorContent 
            editor={editor} 
            className="notion-editor-wrapper"
          />
          
          {/* Slash Command Menu */}
          <SlashCmd.Root editor={editor}>
            <SlashCmd.Cmd className="slash-menu">
              <SlashCmd.Empty>No commands found</SlashCmd.Empty>
              <SlashCmd.List>
                {suggestions.map((item) => (
                  <SlashCmd.Item
                    key={item.title}
                    value={item.title}
                    onCommand={(val) => item.command(val)}
                    className="slash-menu-item"
                  >
                    <div className="slash-menu-item-icon">
                      {item.icon}
                    </div>
                    <div className="slash-menu-item-content">
                      <div className="slash-menu-item-title">{item.title}</div>
                      <div className="slash-menu-item-description">{item.description}</div>
                    </div>
                  </SlashCmd.Item>
                ))}
              </SlashCmd.List>
            </SlashCmd.Cmd>
          </SlashCmd.Root>
          
          {/* Drag & Drop Indicator */}
          <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1 pointer-events-none">
            Type "/" for commands • Drag blocks to reorder
          </div>
        </div>
      </div>
    </SlashCmdProvider>
  );
};

export default NotionEditor;