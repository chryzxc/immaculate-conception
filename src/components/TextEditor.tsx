import "@mantine/tiptap/styles.css";

import { Link, RichTextEditor } from "@mantine/tiptap";
import { memo, useEffect, useState } from "react";

import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { IconColorPicker } from "@tabler/icons-react";
import StarterKit from "@tiptap/starter-kit";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";

type TTextEditorProps = {
  content: string;
  onChange?: (content: string) => void;
  readonly?: boolean;
};

const TextEditor = ({ content, onChange, readonly }: TTextEditorProps) => {
  const [editorContent, setEditorContent] = useState(content);

  const editor = useEditor(
    {
      content: content || "",
      editable: !readonly,
      onUpdate: ({ editor }) => {
        setEditorContent(editor.getHTML());
      },
      extensions: [
        StarterKit,
        Underline,
        Link,
        Superscript,
        SubScript,
        Highlight,
        Color,
        TextStyle,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
    },
    []
  );

  useEffect(() => {
    onChange?.(editorContent);
  }, [editorContent, onChange]);

  return (
    <RichTextEditor
      editor={editor}
      mih={readonly ? undefined : 600}
      style={{ border: readonly ? 0 : undefined }}
    >
      {!readonly && (
        <RichTextEditor.Toolbar sticky stickyOffset={60}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.ColorPicker
              colors={[
                "#25262b",
                "#868e96",
                "#fa5252",
                "#e64980",
                "#be4bdb",
                "#7950f2",
                "#4c6ef5",
                "#228be6",
                "#15aabf",
                "#12b886",
                "#40c057",
                "#82c91e",
                "#fab005",
                "#fd7e14",
              ]}
            />

            <RichTextEditor.Control interactive={false}>
              <IconColorPicker size="1rem" stroke={1.5} />
            </RichTextEditor.Control>

            <RichTextEditor.UnsetColor />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
      )}
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export default memo(TextEditor);
