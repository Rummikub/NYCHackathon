'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { FaChevronDown, FaChevronRight, FaSearch } from 'react-icons/fa';

interface TableOfContentsProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  position: number;
  children: HeadingItem[];
  isCollapsed?: boolean;
  number?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ isOpen, onClose, editor }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNumbers, setShowNumbers] = useState(true);
  const [filteredHeadings, setFilteredHeadings] = useState<HeadingItem[]>([]);

  const buildHeadingTree = (flatHeadings: Omit<HeadingItem, 'children'>[]) => {
    const root: HeadingItem[] = [];
    const stack: HeadingItem[] = [];
    let counter = [0, 0, 0, 0, 0, 0];

    flatHeadings.forEach((heading) => {
      const level = heading.level - 1;
      counter[level]++;
      // Reset lower level counters
      for (let i = level + 1; i < counter.length; i++) {
        counter[i] = 0;
      }

      const number = showNumbers 
        ? counter.slice(0, level + 1).join('.') 
        : '';

      const newHeading: HeadingItem = {
        ...heading,
        children: [],
        number
      };

      while (
        stack.length > 0 &&
        stack[stack.length - 1].level >= heading.level
      ) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(newHeading);
      } else {
        stack[stack.length - 1].children.push(newHeading);
      }

      stack.push(newHeading);
    });

    return root;
  };

  useEffect(() => {
    if (editor && isOpen) {
      updateHeadings();
    }
  }, [editor, isOpen, showNumbers]);

  const updateHeadings = () => {
    if (!editor) return;

    const items: Omit<HeadingItem, 'children'>[] = [];
    let position = 0;

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const id = `heading-${position}`;
        items.push({
          id,
          level: node.attrs.level,
          text: node.textContent,
          position: pos
        });
        position++;
      }
    });

    const tree = buildHeadingTree(items);
    setHeadings(tree);
  };

  useEffect(() => {
    const filterHeadings = (headings: HeadingItem[], query: string): HeadingItem[] => {
      return headings.reduce((acc: HeadingItem[], heading) => {
        const matchesSearch = heading.text.toLowerCase().includes(query.toLowerCase());
        const childMatches = filterHeadings(heading.children, query);
        
        if (matchesSearch || childMatches.length > 0) {
          acc.push({
            ...heading,
            children: childMatches,
            isCollapsed: false // Expand if there's a match
          });
        }
        return acc;
      }, []);
    };

    setFilteredHeadings(searchQuery ? filterHeadings(headings, searchQuery) : headings);
  }, [searchQuery, headings]);

  const toggleCollapse = (headingId: string) => {
    const toggleHeading = (headings: HeadingItem[]): HeadingItem[] => {
      return headings.map(heading => {
        if (heading.id === headingId) {
          return { ...heading, isCollapsed: !heading.isCollapsed };
        }
        return {
          ...heading,
          children: toggleHeading(heading.children)
        };
      });
    };

    setHeadings(toggleHeading(headings));
  };

  const handleHeadingClick = (position: number) => {
    if (editor) {
      editor.commands.setTextSelection(position);
      editor.commands.scrollIntoView();
    }
  };

  const renderHeading = (heading: HeadingItem, level: number = 0) => {
    const hasChildren = heading.children.length > 0;
    
    return (
      <div key={heading.id}>
        <div
          className="flex items-center hover:bg-gray-100 rounded p-2 transition-colors group"
          style={{
            paddingLeft: `${level * 1.5}rem`,
          }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleCollapse(heading.id)}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800"
            >
              {heading.isCollapsed ? <FaChevronRight size={12} /> : <FaChevronDown size={12} />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => handleHeadingClick(heading.position)}
          >
            {showNumbers && heading.number && (
              <span className="text-gray-600 mr-2">{heading.number}</span>
            )}
            <span className="text-gray-900 hover:text-black">{heading.text}</span>
          </div>
        </div>
        {!heading.isCollapsed && heading.children.length > 0 && (
          <div className="ml-2">
            {heading.children.map(child => renderHeading(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-16 top-0 h-screen w-72 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Table of Contents</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search headings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-10 border rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredHeadings.length === 0 ? (
          <div className="text-gray-600 text-center">
            {searchQuery ? 'No matching headings found.' : 'No headings found. Add headings to your document to create a table of contents.'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredHeadings.map(heading => renderHeading(heading))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={showNumbers}
              onChange={(e) => setShowNumbers(e.target.checked)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            <span>Show numbers</span>
          </label>
          <span className="text-sm text-gray-600">Click to navigate</span>
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;
