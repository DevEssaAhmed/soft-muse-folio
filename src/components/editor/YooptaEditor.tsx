import React, { useMemo, useState, useCallback } from 'react';
import YooptaEditor, { createYooptaEditor, YooptaContentValue } from '@yoopta/editor';
import { YooptaPlugin } from '@yoopta/editor';

// Core plugins
import Paragraph from '@yoopta/paragraph';
import Blockquote from '@yoopta/blockquote';
import Accordion from '@yoopta/accordion';
import Code from '@yoopta/code';
import Embed from '@yoopta/embed';
import Image from '@yoopta/image';
import Link from '@yoopta/link';
import File from '@yoopta/file';
import Callout from '@yoopta/callout';
import Video from '@yoopta/video';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Table from '@yoopta/table';
import Divider from '@yoopta/divider';

// Tools
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list';
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar';
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool';

// Marks
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';

// Exports
import { serializeHtml, serializeMarkdown } from '@yoopta/exports';

// Supabase for uploads
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface YooptaAdvancedEditorProps {
  value?: YooptaContentValue;
  onChange: (value: YooptaContentValue) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const YooptaAdvancedEditor: React.FC<YooptaAdvancedEditorProps> = ({
  value,
  onChange,
  placeholder = "Type '/' for commands or start writing...",
  readOnly = false,
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Upload handler for images and files
  const uploadToSupabase = useCallback(async (file: File, type: 'image' | 'file' | 'video'): Promise<string> => {
    try {
      setIsUploading(true);
      
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${type}-${timestamp}-${safeName}`;
      
      const bucket = type === 'image' ? 'images' : type === 'video' ? 'videos' : 'files';

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
      return urlData.publicUrl;
    } catch (error) {
      console.error(`${type} upload error:`, error);
      toast.error(`Failed to upload ${type}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Configure plugins with upload handlers
  const plugins: YooptaPlugin[] = useMemo(() => [
    Paragraph.extend({
      options: {
        HTMLAttributes: {
          className: 'text-base leading-relaxed text-foreground mb-3',
        },
      },
    }),
    
    HeadingOne.extend({
      options: {
        HTMLAttributes: {
          className: 'text-4xl font-bold text-foreground mb-6 mt-8',
        },
      },
    }),
    
    HeadingTwo.extend({
      options: {
        HTMLAttributes: {
          className: 'text-3xl font-semibold text-foreground mb-5 mt-7',
        },
      },
    }),
    
    HeadingThree.extend({
      options: {
        HTMLAttributes: {
          className: 'text-2xl font-medium text-foreground mb-4 mt-6',
        },
      },
    }),

    Blockquote.extend({
      options: {
        HTMLAttributes: {
          className: 'border-l-4 border-primary/30 pl-4 italic text-muted-foreground bg-muted/30 py-2 my-4 rounded-r-lg',
        },
      },
    }),

    BulletedList.extend({
      options: {
        HTMLAttributes: {
          className: 'list-disc list-inside space-y-2 my-4 text-foreground',
        },
      },
    }),

    NumberedList.extend({
      options: {
        HTMLAttributes: {
          className: 'list-decimal list-inside space-y-2 my-4 text-foreground',
        },
      },
    }),

    TodoList.extend({
      options: {
        HTMLAttributes: {
          className: 'space-y-2 my-4',
        },
      },
    }),

    Code.extend({
      options: {
        HTMLAttributes: {
          className: 'bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto my-4 border',
        },
      },
    }),

    Image.extend({
      options: {
        async onUpload(file: File) {
          return await uploadToSupabase(file, 'image');
        },
        HTMLAttributes: {
          className: 'rounded-lg max-w-full h-auto my-6 shadow-soft',
        },
      },
    }),

    Video.extend({
      options: {
        async onUpload(file: File) {
          return await uploadToSupabase(file, 'video');
        },
        HTMLAttributes: {
          className: 'rounded-lg max-w-full my-6 shadow-soft',
        },
      },
    }),

    File.extend({
      options: {
        async onUpload(file: File) {
          return await uploadToSupabase(file, 'file');
        },
        HTMLAttributes: {
          className: 'bg-muted/50 border border-border rounded-lg p-4 my-4 hover:bg-muted/70 transition-colors',
        },
      },
    }),

    Callout.extend({
      options: {
        HTMLAttributes: {
          className: 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4',
        },
      },
    }),

    Table.extend({
      options: {
        HTMLAttributes: {
          className: 'w-full border-collapse border border-border rounded-lg overflow-hidden my-4',
        },
      },
    }),

    Divider.extend({
      options: {
        HTMLAttributes: {
          className: 'border-t border-border my-8',
        },
      },
    }),

    Accordion.extend({
      options: {
        HTMLAttributes: {
          className: 'border border-border rounded-lg my-4 overflow-hidden',
        },
      },
    }),

    Link.extend({
      options: {
        HTMLAttributes: {
          className: 'text-primary hover:text-primary/80 underline cursor-pointer transition-colors',
        },
      },
    }),

    Embed.extend({
      options: {
        HTMLAttributes: {
          className: 'rounded-lg my-6 overflow-hidden shadow-soft',
        },
      },
    }),
  ], [uploadToSupabase]);

  // Configure marks
  const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

  // Configure tools
  const TOOLS = {
    ActionMenu: {
      tool: ActionMenu,
      render: DefaultActionMenuRender,
    },
    Toolbar: {
      tool: Toolbar,
      render: DefaultToolbarRender,
    },
    LinkTool: {
      tool: LinkTool,
      render: DefaultLinkToolRender,
    },
  };

  const editor = useMemo(() => createYooptaEditor(), []);

  // Helper functions for export
  const exportAsMarkdown = useCallback(() => {
    if (value) {
      const markdown = serializeMarkdown(editor, value);
      return markdown;
    }
    return '';
  }, [editor, value]);

  const exportAsHtml = useCallback(() => {
    if (value) {
      const html = serializeHtml(editor, value);
      return html;
    }
    return '';
  }, [editor, value]);

  return (
    <div className={`yoopta-editor-container ${className}`}>
      {isUploading && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Uploading...
          </div>
        </div>
      )}
      
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        tools={TOOLS}
        marks={MARKS}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="min-h-[400px] prose prose-lg max-w-none focus:outline-none"
        style={{
          backgroundColor: 'transparent',
        }}
      />
      
      <style jsx global>{`
        .yoopta-editor-container .yoopta-editor {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        
        .yoopta-editor-container .yoopta-block-options {
          background: rgba(var(--background), 0.9) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(var(--border), 0.5) !important;
          border-radius: 8px !important;
        }
        
        .yoopta-editor-container .yoopta-action-menu {
          background: rgba(var(--background), 0.95) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(var(--border), 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
        }
        
        .yoopta-editor-container .yoopta-toolbar {
          background: rgba(var(--background), 0.95) !important;
          backdrop-filter: blur(15px) !important;
          border: 1px solid rgba(var(--border), 0.3) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        .yoopta-editor-container .yoopta-block {
          margin: 0.5rem 0 !important;
        }
        
        .yoopta-editor-container .yoopta-block:hover {
          background: rgba(var(--muted), 0.3) !important;
          border-radius: 6px !important;
          transition: background 0.2s ease !important;
        }
        
        /* Custom scrollbar */
        .yoopta-editor-container ::-webkit-scrollbar {
          width: 6px;
        }
        
        .yoopta-editor-container ::-webkit-scrollbar-track {
          background: rgba(var(--muted), 0.3);
          border-radius: 3px;
        }
        
        .yoopta-editor-container ::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.4);
          border-radius: 3px;
        }
        
        .yoopta-editor-container ::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary), 0.6);
        }
      `}</style>
    </div>
  );
};

export default YooptaAdvancedEditor;