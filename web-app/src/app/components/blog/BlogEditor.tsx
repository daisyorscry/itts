import { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import { type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from '@components/ui/button';
import { cn } from '@components/ui/utils';

const lowlight = createLowlight(common);

const blogEditorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [2, 3],
    },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: 'https',
  }),
  Image.configure({
    inline: false,
    allowBase64: false,
  }),
  Placeholder.configure({
    placeholder: 'Write the article here...',
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'plaintext',
  }),
];

interface BlogEditorProps {
  content?: JSONContent;
  onChange?: (content: JSONContent) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
}

export function BlogEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Write the article here...',
  className,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: blogEditorExtensions.map((extension) => {
      if (extension.name === 'placeholder') {
        return Placeholder.configure({ placeholder });
      }

      return extension;
    }),
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          'blog-editor-surface min-h-[320px] px-5 py-4 text-sm text-[#04090C] outline-none',
          editable ? 'cursor-text' : 'cursor-default',
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || !content) {
      return;
    }

    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(content);

    if (current !== next) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter a URL', previousUrl || 'https://');

    if (url === null) {
      return;
    }

    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const src = window.prompt('Enter an image URL');

    if (!src) {
      return;
    }

    const alt = window.prompt('Enter alt text', 'Article image') || 'Article image';
    editor.chain().focus().setImage({ src, alt }).run();
  };

  const toggleCodeBlock = () => {
    const language = window.prompt('Code language', 'bash') || 'plaintext';
    editor.chain().focus().toggleCodeBlock({ language }).run();
  };

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-black/10 bg-[#F7F4EC]', className)}>
      {editable ? (
        <div className="flex flex-wrap gap-2 border-b border-black/10 px-4 py-3">
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
            <Icons.Bold size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Icons.Italic size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            H2
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            H3
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <Icons.List size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <Icons.ListOrdered size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Icons.TextQuote size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={addLink}>
            <Icons.Link2 size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={addImage}>
            <Icons.ImagePlus size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={toggleCodeBlock}>
            <Icons.Code2 size={16} />
          </Button>
          <Button type="button" variant="soft-action" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Icons.Minus size={16} />
          </Button>
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
