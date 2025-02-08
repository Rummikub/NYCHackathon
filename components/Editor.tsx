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

interface EditorProps {
  editor: any;
  setEditor: (editor: any) => void;
}

const Editor: React.FC<EditorProps> = ({ editor, setEditor }) => {
  const editorInstance = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6]
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

  useEffect(() => {
    if (editorInstance) {
      setEditor(editorInstance);
    }
  }, [editorInstance, setEditor]);

  const [showSuggestion, setShowSuggestion] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<typeof suggestions[0] | null>(null);
  const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 });
  const ghostDecorationRef = useRef<DecorationSet | null>(null);

  // Function to update ghost text
  const updateGhostText = useCallback(
    (suggestion: string | null) => {
      if (!editorInstance) return;
  
      const { state, view } = editorInstance;
      let newDecoration: DecorationSet;
  
      if (!suggestion) {
        newDecoration = DecorationSet.empty;
      } else {
        // If the editor text doesn’t already end in a space, prepend one
        const endsWithSpace = /\s$/.test(editorInstance.getText());
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
    [editorInstance]
  );
  

  const handleSuggestion = useCallback(() => {
    if (!editorInstance) return;
  
    const text = editorInstance.getText();
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
      const { view } = editorInstance;
      const { top, left } = view.coordsAtPos(editorInstance.state.selection.from);
  
      setCurrentSuggestion(suggestion);
      setSuggestionPosition({ x: left, y: top + 24 });
      setShowSuggestion(true);
      updateGhostText(suggestion.completion);
    } else {
      setShowSuggestion(false);
      updateGhostText(null);
    }
  }, [editorInstance, updateGhostText]);
  
  

  // Updated applySuggestion to ensure a space before the ghost text if needed
  const applySuggestion = useCallback(() => {
    if (!editorInstance || !currentSuggestion) return;

    const currentText = editorInstance.getText();
    // Use a regex to check if the text ends with any whitespace
    const insertion = /\s$/.test(currentText)
      ? currentSuggestion.completion
      : ' ' + currentSuggestion.completion;
    editorInstance.commands.insertContent(insertion);
    setShowSuggestion(false);
  }, [editorInstance, currentSuggestion]);

  useEffect(() => {
    if (!editorInstance) return;

    const updateListener = () => {
      handleSuggestion();
    };

    const keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && showSuggestion && currentSuggestion) {
        event.preventDefault();
        applySuggestion();
      }
    };

    editorInstance.on('update', updateListener);
    document.addEventListener('keydown', keydownListener);

    return () => {
      editorInstance.off('update', updateListener);
      document.removeEventListener('keydown', keydownListener);
    };
  }, [editorInstance, handleSuggestion, showSuggestion, currentSuggestion, applySuggestion]);

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
      <MenuBar editor={editorInstance} />
      <EditorContent
        editor={editorInstance}
        className="flex-1 overflow-y-auto px-12 py-8 text-gray-900 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-800"
      />

      {/* Autocomplete popup */}
      {showSuggestion && currentSuggestion && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-gray-800"
          style={{
            top: suggestionPosition.y,
            left: suggestionPosition.x,
          }}
        >
          <div className="font-medium mb-2">Suggestion:</div>
          <div>{currentSuggestion.completion}</div>
          <div className="mt-2 text-sm text-gray-600">
            Press Tab to accept
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
