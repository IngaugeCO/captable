"use client";

import { type TemplateSigningFieldForm } from "@/providers/template-signing-field-provider";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { useCallback, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ReadOnlyTemplateField } from "./readonly-template-field";

const resizeObserverOptions = {};

export function ReadOnlyFieldCanvas() {
  const { control } = useFormContext<TemplateSigningFieldForm>();
  const { fields } = useFieldArray({
    name: "fields",
    control,
    keyName: "_id",
  });

  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [viewport, setViewport] = useState({ height: 0, width: 0 });

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      const { height, width } = entry.contentRect;
      setViewport({ height, width });
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  return (
    <>
      <div
        ref={setContainerRef}
        className="absolute bottom-0 left-0 right-0 top-0 z-10"
      />

      {fields.map((field) => (
        <ReadOnlyTemplateField
          viewportWidth={field.viewportWidth}
          viewportHeight={field.viewportHeight}
          currentViewportWidth={viewport.width}
          currentViewportHeight={viewport.height}
          key={field._id}
          height={field.height}
          left={field.left}
          top={field.top}
          id={field.id}
          width={field.width}
          name={field.name}
          type={field.type}
          recipientId={field.recipientId}
          prefilledValue={field.prefilledValue}
        />
      ))}
    </>
  );
}
