import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SortableImageItemProps {
  field: { id: string };
  index: number;
  imageSrc: string | null;
  name: string;
  fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  handleFileDelete: (index: number) => void;
  remove: (index: number) => void;
}

const SortableImageItem = ({
  field,
  index,
  imageSrc,
  name,
  fileInputRefs,
  handleFileChange,
  handleFileDelete,
  remove,
}: SortableImageItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative border border-dashed border-gray-200 rounded-xl overflow-hidden"
    >
      {imageSrc ? (
        <div className="relative aspect-square">
          <img
            src={imageSrc}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-white/80 hover:bg-red-50 hover:text-red-500"
              onClick={() => handleFileDelete(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div
            className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 rounded bg-white/80"
            {...listeners}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="5" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="aspect-square flex flex-col items-center justify-center gap-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            ref={(el) => {
              fileInputRefs.current[`${name}.${index}`] = el;
            }}
            onChange={(e) => handleFileChange(e, index)}
          />
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Click to upload</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-red-50 hover:text-red-500"
            onClick={(e) => { e.stopPropagation(); remove(index); }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SortableImageItem;
