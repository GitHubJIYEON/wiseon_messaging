import Quill, { type QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EditorValue {
  body: string;
}

interface EditorProps {
  placeholder?: string;
  defaultValue?: string;
  innerRef?: RefObject<Quill | null>;
  className?: string;
  onSubmit?: ({ body }: EditorValue) => void;
  onChange: (html: string) => void;
}

export function Editor({
  placeholder = "",
  defaultValue = "",
  innerRef,
  className,
  onSubmit,
  onChange,
}: EditorProps) {
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div"),
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
      },
    };

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;

    if (innerRef) {
      innerRef.current = quill;
    }

    if (defaultValueRef.current) {
      quill.clipboard.dangerouslyPasteHTML(defaultValueRef.current);
      quill.blur();
    }

    quill.on(Quill.events.TEXT_CHANGE, () => {
      const htmlContent = quill.getSemanticHTML();
      onChangeRef.current(htmlContent);
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  return <div ref={containerRef} className={cn("h-full", className)} />;
}
