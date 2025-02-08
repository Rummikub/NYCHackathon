'use client';

import Underline from '@tiptap/extension-underline'
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { useCallback, useState, useEffect, useRef } from 'react';
import { Mark, mergeAttributes, Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// Create a PluginKey for ghost text
const ghostTextPluginKey = new PluginKey('ghost-text');

// Updated GhostText extension that reads meta data from transactions
const GhostText = Extension.create({
  name: 'ghostText',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: ghostTextPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            const ghost = tr.getMeta(ghostTextPluginKey);
            if (ghost) {
              return ghost;
            }
            return set.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return ghostTextPluginKey.getState(state);
          },
        },
      }),
    ];
  },
});

// Custom marks for different types of highlights
const HighlightPurple = Mark.create({
  name: 'highlightPurple',
  addAttributes() {
    return {
      tooltip: {
        default: null,
        parseHTML: element => element.getAttribute('data-tooltip'),
        renderHTML: attributes => ({
          'data-tooltip': attributes.tooltip,
          class: 'highlight-purple',
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span.highlight-purple' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const HighlightYellow = Mark.create({
  name: 'highlightYellow',
  addAttributes() {
    return {
      tooltip: {
        default: null,
        parseHTML: element => element.getAttribute('data-tooltip'),
        renderHTML: attributes => ({
          'data-tooltip': attributes.tooltip,
          class: 'highlight-yellow',
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span.highlight-yellow' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const HighlightOrange = Mark.create({
  name: 'highlightOrange',
  addAttributes() {
    return {
      tooltip: {
        default: null,
        parseHTML: element => element.getAttribute('data-tooltip'),
        renderHTML: attributes => ({
          'data-tooltip': attributes.tooltip,
          class: 'highlight-orange',
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span.highlight-orange' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});

const mockText = `<h1>The Impact of Artificial Intelligence on Modern Society</h1>
<p>In recent years, artificial intelligence has <span class="highlight-purple" data-tooltip="Consider using a more specific verb">made</span> significant changes to how we live and work. The technology <span class="highlight-yellow" data-tooltip="Passive voice detected">has been implemented</span> across various industries, from healthcare to transportation.</p>
<p>The rapid advancement of AI technology <span class="highlight-orange" data-tooltip="Consider breaking this into shorter sentences">has led to numerous breakthroughs in machine learning algorithms and neural networks, which have revolutionized the way computers process and analyze large amounts of data, making it possible to solve increasingly complex problems</span>.</p>
<p>AI systems <span class="highlight-purple" data-tooltip="Too vague - be more specific">do</span> many important tasks in our daily lives. They <span class="highlight-yellow" data-tooltip="Passive voice detected">are being used</span> to predict weather patterns, diagnose diseases, and even drive cars.</p>`;

// Custom suggestion data
const suggestions = [
  {
    trigger: 'machine',
    completion: 'learning algorithms have revolutionized',
    description: 'Discuss the impact of ML algorithms',
  },
  {
    trigger: 'work',
    completion: 'networks can process vast amounts of data',
    description: 'Explain neural network capabilities',
  },
  {
    trigger: 'deep',
    completion: 'learning models have achieved remarkable results',
    description: 'Highlight deep learning achievements',
  },
];

export default function Editor() {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<typeof suggestions[0] | null>(null);
  const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 });
  const ghostDecorationRef = useRef<DecorationSet | null>(null);

  const editor = useEditor({
    extensions: [
      Underline,
      StarterKit,
      Heading.configure({
        levels: [1, 2],
      }),
      HighlightPurple,
      HighlightYellow,
      HighlightOrange,
      GhostText,
    ],
    content: mockText,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  // Function to update ghost text
  const updateGhostText = useCallback(
    (suggestion: string | null) => {
      if (!editor) return;
  
      const { state, view } = editor;
      let newDecoration: DecorationSet;
  
      if (!suggestion) {
        newDecoration = DecorationSet.empty;
      } else {
        // If the editor text doesn’t already end in a space, prepend one
        const endsWithSpace = /\s$/.test(editor.getText());
        const displaySuggestion = endsWithSpace
          ? suggestion
          : ' ' + suggestion;
        
        const pos = state.selection.from;
        const decoration = Decoration.widget(pos, () => {
          const span = document.createElement('span');
          span.className = 'ghost-text';
          span.textContent = displaySuggestion;
          return span;
        });
        newDecoration = DecorationSet.create(state.doc, [decoration]);
      }
  
      ghostDecorationRef.current = newDecoration;
      view.dispatch(state.tr.setMeta(ghostTextPluginKey, newDecoration));
    },
    [editor]
  );
  

  const handleSuggestion = useCallback(() => {
    if (!editor) return;
  
    const text = editor.getText();
    console.log('Editor text:', JSON.stringify(text));
  
    // 1. Check if text ends with space
    const endsWithSpace = /\s$/.test(text);
    console.log('Ends with space?', endsWithSpace);
  
    if (!endsWithSpace) {
      setShowSuggestion(false);
      updateGhostText(null);
      return;
    }
  
    // 2. Trim + split, then get the last word
    const words = text.trim().split(/\s+/);
    const lastWord = words[words.length - 1].toLowerCase();
    console.log('Last word after trim:', lastWord);
  
    const suggestion = suggestions.find(s => s.trigger === lastWord);
    console.log('Found suggestion?', suggestion);
  
    if (suggestion) {
      const { view } = editor;
      const { top, left } = view.coordsAtPos(editor.state.selection.from);
  
      setCurrentSuggestion(suggestion);
      setSuggestionPosition({ x: left, y: top + 24 });
      setShowSuggestion(true);
      updateGhostText(suggestion.completion);
    } else {
      setShowSuggestion(false);
      updateGhostText(null);
    }
  }, [editor, updateGhostText]);
  
  

  // Updated applySuggestion to ensure a space before the ghost text if needed
  const applySuggestion = useCallback(() => {
    if (!editor || !currentSuggestion) return;

    const currentText = editor.getText();
    // Use a regex to check if the text ends with any whitespace
    const insertion = /\s$/.test(currentText)
      ? currentSuggestion.completion
      : ' ' + currentSuggestion.completion;
    editor.commands.insertContent(insertion);
    setShowSuggestion(false);
  }, [editor, currentSuggestion]);

  useEffect(() => {
    if (!editor) return;

    const updateListener = () => {
      handleSuggestion();
    };

    const keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && showSuggestion && currentSuggestion) {
        event.preventDefault();
        applySuggestion();
      }
    };

    editor.on('update', updateListener);
    document.addEventListener('keydown', keydownListener);

    return () => {
      editor.off('update', updateListener);
      document.removeEventListener('keydown', keydownListener);
    };
  }, [editor, handleSuggestion, showSuggestion, currentSuggestion, applySuggestion]);

  const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
      return null;
    }

    return (
      <div className="border-b p-1.5 flex gap-1 bg-white sticky top-0 z-10">
        <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('bold') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('italic') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('underline') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            U
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            H2
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('bulletList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            •
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-md text-sm font-medium transition-colors ${
              editor.isActive('orderedList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
            }`}
          >
            1.
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg relative">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto px-12 py-8 text-gray-800 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
      />

      {/* Autocomplete popup */}
      {showSuggestion && currentSuggestion && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-80 animate-fade-in z-50"
          style={{
            top: suggestionPosition.y,
            left: suggestionPosition.x,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xs">✨</span>
            </div>
            <span className="text-sm font-medium text-gray-700">AI Suggestion</span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{currentSuggestion.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Tab</kbd>
              <span className="text-xs text-gray-500">to accept</span>
            </div>
            <button
              onClick={applySuggestion}
              className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
