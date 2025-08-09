import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wand2, 
  Code2, 
  Twitch,
  Sparkles,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditorSelectorProps {
  selectedEditor: 'yoopta' | 'tiptap';
  onEditorChange: (editor: 'yoopta' | 'tiptap') => void;
  className?: string;
}

const EditorSelector: React.FC<EditorSelectorProps> = ({
  selectedEditor,
  onEditorChange,
  className = ""
}) => {
  return (
    <Card className={`bg-card/50 backdrop-blur-sm border ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Twitch className="w-4 h-4" />
            Editor Type
          </h3>
          <Badge variant="secondary" className="text-xs">
            Enhanced
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Yoopta Editor */}
          <Button
            variant={selectedEditor === 'yoopta' ? 'default' : 'outline'}
            className={`h-auto p-4 flex flex-col items-start text-left transition-all duration-200 ${
              selectedEditor === 'yoopta' 
                ? 'bg-gradient-primary text-white shadow-glow' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onEditorChange('yoopta')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Yoopta Editor</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                Default
              </Badge>
            </div>
            <p className="text-sm opacity-90 text-left">
              Modern block-based editor with advanced features, drag & drop, and rich media support
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">Notion-like</Badge>
              <Badge variant="secondary" className="text-xs">Media Rich</Badge>
              <Badge variant="secondary" className="text-xs">Blocks</Badge>
            </div>
          </Button>

          {/* TipTap Editor */}
          <Button
            variant={selectedEditor === 'tiptap' ? 'default' : 'outline'}
            className={`h-auto p-4 flex flex-col items-start text-left transition-all duration-200 ${
              selectedEditor === 'tiptap' 
                ? 'bg-gradient-primary text-white shadow-glow' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onEditorChange('tiptap')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-5 h-5" />
              <span className="font-medium">TipTap Editor</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                Legacy
              </Badge>
            </div>
            <p className="text-sm opacity-90 text-left">
              Traditional rich text editor with markdown support and familiar editing experience
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">Markdown</Badge>
              <Badge variant="secondary" className="text-xs">Traditional</Badge>
              <Badge variant="secondary" className="text-xs">Lightweight</Badge>
            </div>
          </Button>
        </div>

        {selectedEditor === 'yoopta' && (
          <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Pro Features Active</span>
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
              Advanced blocks, drag & drop, real-time collaboration, and enhanced media handling
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EditorSelector;