"use client";

import * as React from "react";

export interface UseTableStateProps<T> {
  initialData: T[];
  initialPageSize?: number;
}

export interface UseTableStateReturn<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  selectedItem: T | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<T | null>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalMode: "add" | "edit";
  setModalMode: React.Dispatch<React.SetStateAction<"add" | "edit">>;
  handleAdd: () => void;
  handleEdit: (item: T) => void;
  handleSave: (item: T, idField?: keyof T) => void;
}

export function useTableState<T>({
  initialData,
}: UseTableStateProps<T>): UseTableStateReturn<T> {
  const [data, setData] = React.useState<T[]>(() => initialData);
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");

  const handleAdd = React.useCallback(() => {
    setSelectedItem(null);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  const handleEdit = React.useCallback((item: T) => {
    setSelectedItem(item);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const handleSave = React.useCallback(
    (item: T, idField: keyof T = "id" as keyof T) => {
      if (modalMode === "add") {
        setData((prev) => [...prev, item]);
      } else {
        setData((prev) =>
          prev.map((existingItem) =>
            existingItem[idField] === item[idField] ? item : existingItem
          )
        );
      }
      setIsModalOpen(false);
      setSelectedItem(null);
    },
    [modalMode]
  );

  return {
    data,
    setData,
    selectedItem,
    setSelectedItem,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    setModalMode,
    handleAdd,
    handleEdit,
    handleSave,
  };
}
