## Drag and Drop

This includes drag-and-drop functionality powered by **dnd-kit**.

---

## Basic Usage

To create a sortable list:

```tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={items} strategy={verticalListSortingStrategy}>
    {items.map((item) => (
      <SortableItem key={item.id} id={item.id} />
    ))}
  </SortableContext>
</DndContext>
```

---

## Handle Reordering

```ts
const handleDragEnd = ({ active, over }) => {
  if (!over || active.id === over.id) return;

  setItems((items) => {
    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);
    return arrayMove(items, oldIndex, newIndex);
  });
};
```

---

## Make Items Draggable

Use the `useSortable` hook inside each item:

```ts
const { attributes, listeners, setNodeRef } = useSortable({ id });
```

Attach them to your element:

```tsx
<div ref={setNodeRef} {...attributes} {...listeners}>
  Item
</div>
```

---

## Table Integration

For tables, use the built-in component:

```tsx
import SortableRows from "@Components/common/DragAndDrop/sortable_row";

<SortableRows row={row} index={index} />
```

---

## Key Concepts

* **DndContext** → Enables drag-and-drop
* **SortableContext** → Makes list sortable
* **useSortable** → Makes item draggable
* **arrayMove** → Reorders data after drop
* **PointerSensor** → Controls drag activation

---

## Notes

* Always use **unique `id`** for each item
* Reordering happens via **state update**, not automatically
* Use `closestCenter` for best list behavior

---
