// import React, { useEffect, useCallback, useState, useRef } from "react";
// import { EditorContent, useEditor, Editor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { Image } from "@tiptap/extension-image";
// import { Link } from "@tiptap/extension-link";
// import { Placeholder } from "@tiptap/extension-placeholder";
// import { TaskList } from "@tiptap/extension-task-list";
// import { TaskItem } from "@tiptap/extension-task-item";
// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableCell } from "@tiptap/extension-table-cell";
// import { TableHeader } from "@tiptap/extension-table-header";
// import CodeBlock from "@tiptap/extension-code-block";
// import Suggestion from "@tiptap/suggestion";
// import { createLowlight }  from "lowlight";
// const lowlight = createLowlight()
// import {
//   Type,
//   Hash,
//   List,
//   ListOrdered,
//   CheckSquare,
//   Quote,
//   Code,
//   Image as ImageIcon,
//   Table as TableIcon,
//   Minus,
// } from "lucide-react";

// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";
// import "./editor-styles.css";

// interface NotionEditorProps {
//   value: string;
//   onChange: (markdown: string) => void;
//   placeholder?: string;
// }

// interface SuggestionItem {
//   title: string;
//   description: string;
//   searchTerms: string[];
//   icon: React.ReactNode;
//   command: ({ editor, range }: { editor: Editor; range: any }) => void;
// }

// const suggestions: SuggestionItem[] = [
//   {
//     title: "Text",
//     description: "Just start typing with plain text",
//     searchTerms: ["p", "paragraph", "text"],
//     icon: <Type className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).setParagraph().run();
//     },
//   },
//   {
//     title: "Heading 1",
//     description: "Big section heading",
//     searchTerms: ["h1", "heading1", "title"],
//     icon: <Hash className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
//     },
//   },
//   {
//     title: "Heading 2",
//     description: "Medium section heading",
//     searchTerms: ["h2", "heading2", "subtitle"],
//     icon: <Hash className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
//     },
//   },
//   {
//     title: "Heading 3",
//     description: "Small section heading",
//     searchTerms: ["h3", "heading3"],
//     icon: <Hash className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
//     },
//   },
//   {
//     title: "Bullet List",
//     description: "Create a simple bullet list",
//     searchTerms: ["ul", "unordered", "bullet", "list"],
//     icon: <List className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleBulletList().run();
//     },
//   },
//   {
//     title: "Numbered List",
//     description: "Create a numbered list",
//     searchTerms: ["ol", "ordered", "numbered", "list"],
//     icon: <ListOrdered className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleOrderedList().run();
//     },
//   },
//   {
//     title: "To-do List",
//     description: "Track tasks with a to-do list",
//     searchTerms: ["todo", "task", "checkbox", "check"],
//     icon: <CheckSquare className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleTaskList().run();
//     },
//   },
//   {
//     title: "Quote",
//     description: "Capture a quote",
//     searchTerms: ["quote", "blockquote", "citation"],
//     icon: <Quote className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleBlockquote().run();
//     },
//   },
//   {
//     title: "Code",
//     description: "Capture a code snippet",
//     searchTerms: ["code", "codeblock", "snippet"],
//     icon: <Code className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
//     },
//   },
//   {
//     title: "Image",
//     description: "Upload an image",
//     searchTerms: ["img", "image", "photo", "picture"],
//     icon: <ImageIcon className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       const url = window.prompt("Enter image URL:");
//       if (url) {
//         editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
//       }
//     },
//   },
//   {
//     title: "Table",
//     description: "Insert a table",
//     searchTerms: ["table", "grid"],
//     icon: <TableIcon className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain()
//         .focus()
//         .deleteRange(range)
//         .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
//         .run();
//     },
//   },
//   {
//     title: "Divider",
//     description: "Visually divide blocks",
//     searchTerms: ["hr", "horizontal", "rule", "divider", "separator"],
//     icon: <Minus className="w-4 h-4" />,
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).setHorizontalRule().run();
//     },
//   },
// ];

// // Create a suggestion extension with a custom render for the slash menu
// const SlashCommand = Suggestion.configure({
//   char: "/",
//   startOfLine: true,
//   command: ({ editor, range, props }) => {
//     props.command({ editor, range });
//   },
//   items: ({ query }) => {
//     return suggestions
//       .filter((item) => {
//         const searchText = item.searchTerms.join(" ").toLowerCase();
//         return (
//           item.title.toLowerCase().includes(query.toLowerCase()) ||
//           searchText.includes(query.toLowerCase())
//         );
//       })
//       .slice(0, 10);
//   },
//   render: () => {
//     let component: HTMLDivElement;
//     let editor: Editor;
//     let items: SuggestionItem[] = [];
//     let selectedIndex = 0;

//     return {
//       onStart: (props) => {
//         editor = props.editor;
//         items = props.items;
//         selectedIndex = 0;

//         component = document.createElement("div");
//         component.classList.add(
//           "slash-menu",
//           "bg-white",
//           "border",
//           "rounded-md",
//           "shadow-lg",
//           "max-w-sm",
//           "overflow-hidden"
//         );
//         update();
//         document.body.appendChild(component);

//         position(props.clientRect);
//       },
//       onUpdate: (props) => {
//         items = props.items;
//         selectedIndex = 0;
//         update();
//         position(props.clientRect);
//       },
//       onKeyDown: (props) => {
//         if (props.event.key === "ArrowDown") {
//           selectedIndex = (selectedIndex + 1) % items.length;
//           update();
//           return true;
//         }
//         if (props.event.key === "ArrowUp") {
//           selectedIndex = (selectedIndex + items.length - 1) % items.length;
//           update();
//           return true;
//         }
//         if (props.event.key === "Enter") {
//           items[selectedIndex].command({
//             editor,
//             range: props.range,
//           });
//           return true;
//         }
//         if (props.event.key === "Escape") {
//           props.command(null);
//           return true;
//         }
//         return false;
//       },
//       onExit: () => {
//         component.remove();
//       },
//     };

//     function update() {
//       if (!component) return;
//       component.innerHTML = "";
//       items.forEach((item, index) => {
//         const el = document.createElement("div");
//         el.classList.add("slash-menu-item", "flex", "items-center", "p-2", "cursor-pointer");
//         if (index === selectedIndex) {
//           el.classList.add("bg-gray-200");
//         }
//         // icon container
//         const iconWrapper = document.createElement("div");
//         iconWrapper.classList.add("mr-2");
//         // Use React icon's render function to SVG string is complicated,
//         // so just skip icons here or replace with your own SVGs if you want.

//         // title and description
//         const content = document.createElement("div");
//         content.innerHTML = `<div class="font-semibold">${item.title}</div><div class="text-xs text-gray-600">${item.description}</div>`;

//         el.appendChild(iconWrapper);
//         el.appendChild(content);

//         el.addEventListener("click", () => {
//           item.command({ editor, range: null });
//         });

//         component.appendChild(el);
//       });
//     }

//     function position(clientRect: DOMRect | null) {
//       if (!clientRect) return;
//       const editorRect = document.querySelector(".notion-editor-content")?.getBoundingClientRect();
//       if (!editorRect) return;

//       component.style.position = "absolute";
//       component.style.top = `${clientRect.bottom + window.pageYOffset}px`;
//       component.style.left = `${clientRect.left + window.pageXOffset}px`;
//       component.style.zIndex = "1000";
//       component.style.minWidth = "200px";
//     }
//   },
// });



// const NotionEditor: React.FC<NotionEditorProps> = ({
//   value,
//   onChange,
//   placeholder = "Type '/' for commands or start writing...",
// }) => {
//   // Image upload handler
//   const uploadImage = useCallback(async (file: File): Promise<string | null> => {
//     try {
//       const timestamp = Date.now();
//       const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
//       const fileName = `editor-${timestamp}-${safeName}`;

//       const { data, error } = await supabase.storage
//         .from("images")
//         .upload(fileName, file, {
//           contentType: file.type,
//           upsert: true,
//         });

//       if (error) throw error;

//       const { data: urlData } = supabase.storage
//         .from("images")
//         .getPublicUrl(fileName);

//       return urlData.publicUrl;
//     } catch (error) {
//       console.error("Image upload error:", error);
//       toast.error("Failed to upload image");
//       return null;
//     }
//   }, []);

//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         codeBlock: false, // we use CodeBlock extension instead
//       }),
//       SlashCommand,
//       Placeholder.configure({
//         placeholder,
//         showOnlyWhenEditable: true,
//         showOnlyCurrent: false,
//       }),
//       TaskList.configure({
//         HTMLAttributes: {
//           class: "notion-task-list",
//         },
//       }),
//       TaskItem.configure({
//         HTMLAttributes: {
//           class: "notion-task-item",
//         },
//         nested: true,
//       }),
//       Table.configure({
//         resizable: true,
//         HTMLAttributes: {
//           class: "notion-table",
//         },
//       }),
//       TableRow,
//       TableHeader,
//       TableCell,
//       Link,
//       Image,
//       CodeBlock.configure({
//         lowlight,
//         HTMLAttributes: {
//           class: "notion-code-block",
//         },
//       }),
//     ],
//     editorProps: {
//       attributes: {
//         class:
//           "notion-editor-content focus:outline-none prose prose-lg max-w-none p-8",
//         "data-placeholder": placeholder,
//       },
//       handleDrop: (view, event, slice, moved) => {
//         if (
//           !moved &&
//           event.dataTransfer &&
//           event.dataTransfer.files &&
//           event.dataTransfer.files.length
//         ) {
//           const images = Array.from(event.dataTransfer.files).filter((file) =>
//             file.type.includes("image/")
//           );

//           if (images.length > 0) {
//             event.preventDefault();
//             const { schema } = view.state;
//             const coordinates = view.posAtCoords({
//               left: event.clientX,
//               top: event.clientY,
//             });

//             images.forEach(async (image) => {
//               const src = await uploadImage(image);
//               if (src) {
//                 const node = schema.nodes.image.create({ src });
//                 const transaction = view.state.tr.insert(
//                   coordinates?.pos || 0,
//                   node
//                 );
//                 view.dispatch(transaction);
//               }
//             });

//             return true;
//           }
//         }
//         return false;
//       },
//     },
//     content: value,
//     onUpdate({ editor }) {
//       // For markdown conversion, you will need to implement your own
//       // method or use a markdown converter separately
//       onChange(editor.getHTML());
//     },
//   });

//   // Sync content prop changes with editor content
//   useEffect(() => {
//     if (editor && value !== editor.getHTML()) {
//       editor.commands.setContent(value);
//     }
//   }, [editor, value]);

//   if (!editor) return null;

//   return (
//     <div className="notion-editor border rounded-lg overflow-hidden bg-background relative">
//       <EditorContent editor={editor} className="notion-editor-wrapper min-h-[500px]" />
//       {/* Info Tip */}
//       <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1 pointer-events-none">
//         Type "/" for commands
//       </div>
//     </div>
//   );
// };

// export default NotionEditor;
