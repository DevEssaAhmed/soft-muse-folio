import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className = "" }: MarkdownRendererProps) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom heading styling
          h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-6 text-foreground" {...props} />,
          h2: ({ ...props }) => <h2 className="text-2xl font-semibold mb-5 text-foreground" {...props} />,
          h3: ({ ...props }) => <h3 className="text-xl font-semibold mb-4 text-foreground" {...props} />,
          h4: ({ ...props }) => <h4 className="text-lg font-semibold mb-3 text-foreground" {...props} />,
          h5: ({ ...props }) => <h5 className="text-base font-semibold mb-3 text-foreground" {...props} />,
          h6: ({ ...props }) => <h6 className="text-sm font-semibold mb-2 text-foreground" {...props} />,
          
          // Paragraph styling
          p: ({ ...props }) => <p className="mb-4 leading-relaxed text-foreground" {...props} />,
          
          // Link styling
          a: ({ ...props }) => (
            <a 
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          
          // List styling
          ul: ({ ...props }) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
          ol: ({ ...props }) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
          li: ({ ...props }) => <li className="text-foreground" {...props} />,
          
          // Code styling
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code 
                  className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className={`${className} block p-4 bg-muted rounded-lg overflow-x-auto text-sm`} 
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Pre styling for code blocks
          pre: ({ ...props }) => (
            <pre className="mb-6 p-4 bg-muted rounded-lg overflow-x-auto" {...props} />
          ),
          
          // Blockquote styling
          blockquote: ({ ...props }) => (
            <blockquote 
              className="mb-4 pl-4 border-l-4 border-primary/30 bg-muted/30 p-4 rounded-r-lg italic text-muted-foreground" 
              {...props} 
            />
          ),
          
          // Table styling
          table: ({ ...props }) => (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th className="px-4 py-3 bg-muted/50 border-b border-border text-left font-semibold text-foreground" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-3 border-b border-border text-foreground" {...props} />
          ),
          
          // Image styling
          img: ({ ...props }) => (
            <img className="mb-6 rounded-lg max-w-full h-auto shadow-md" {...props} />
          ),
          
          // Horizontal rule styling
          hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;