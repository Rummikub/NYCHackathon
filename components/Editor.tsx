'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { useCallback } from 'react';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-1.5 flex gap-1 bg-white sticky top-0 z-10">
      <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md text-sm font-medium transition-colors ${editor.isActive('bold') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md text-sm font-medium transition-colors ${editor.isActive('italic') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-md text-sm font-medium transition-colors ${editor.isActive('underline') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
        >
          U
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
        >
          H2
        </button>
      </div>

      <div className="h-6 w-px bg-gray-200 mx-1"></div>

      <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md text-sm font-medium transition-colors ${editor.isActive('bulletList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md text-sm font-medium transition-colors ${editor.isActive('orderedList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
        >
          1.
        </button>
      </div>
    </div>
  );
};

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2],
      }),
    ],
    content: `
      <h1>Your Research Paper Title</h1>
      <p>Start writing your research paper here. The AI assistant in the sidebar will help you with suggestions, references, and improvements.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="flex-1 overflow-y-auto px-12 py-8 text-gray-800 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none" 
      />
    </div>
  );
}
