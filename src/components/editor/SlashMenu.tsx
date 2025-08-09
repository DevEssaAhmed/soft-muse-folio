import React, { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";

interface MySuggestionItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  command: ({ editor, range }: { editor: Editor; range: any }) => void;
}

interface SlashMenuProps {
  editor: Editor;
  items: MySuggestionItem[];
  range: { from: number; to: number } | null;
  clientRect: DOMRect | null;
  onClose: () => void;
}

const SlashMenu: React.FC<SlashMenuProps> = ({ editor, items, range, clientRect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!items.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex(i => (i + 1) % items.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(i => (i - 1 + items.length) % items.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        items[selectedIndex].command({ editor, range });
        onClose();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [items, selectedIndex, editor, range, onClose]);

  if (!clientRect || !range) return null;

  return (
    <div
      className="slash-menu bg-white border rounded-md shadow-lg max-w-sm overflow-hidden absolute z-50"
      style={{
        top: clientRect.bottom + window.pageYOffset,
        left: clientRect.left + window.pageXOffset,
        minWidth: 200,
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.title}
          className={`slash-menu-item flex items-center p-2 cursor-pointer ${
            index === selectedIndex ? "bg-gray-200" : ""
          }`}
          onClick={() => {
            item.command({ editor, range });
            onClose();
          }}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="mr-2">{item.icon}</div>
          <div>
            <div className="font-semibold">{item.title}</div>
            <div className="text-xs text-gray-600">{item.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlashMenu;
