"use client";

import { useState } from "react";
import { CreateObjectForm } from "@/components/admin/create-object-form";
import { EditObjectForm } from "@/components/admin/edit-object-form";
import { ObjectsList } from "@/components/admin/objects-list";

const tabs = {
  list: "list",
  create: "create",
} as const;

type ObjectsTab = (typeof tabs)[keyof typeof tabs];

const tabOrder: ObjectsTab[] = [tabs.list, tabs.create];

const tabLabels: Record<ObjectsTab, string> = {
  list: "Список объектов",
  create: "Создание объекта",
};

export function ObjectsView() {
  const [activeTab, setActiveTab] = useState<ObjectsTab>(tabs.list);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);

  const openList = () => {
    setEditingObjectId(null);
    setActiveTab(tabs.list);
  };

  const handleTabClick = (tab: ObjectsTab) => {
    setEditingObjectId(null);
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="type-headline-md">Объекты</h1>
        <p className="mt-xs type-body-md text-on-surface-variant">
          Просмотр списка и создание объектов строительства
        </p>
      </div>

      <div
        aria-label="Разделы объектов"
        className="inline-flex w-fit rounded-full border border-outline-variant bg-surface-container-lowest p-0.5 shadow-panel"
        role="tablist"
      >
        {tabOrder.map((tab) => {
          const isSelected = editingObjectId === null && activeTab === tab;

          return (
            <button
              aria-selected={isSelected}
              className={`rounded-full px-md py-sm type-label-md transition-colors ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
              key={tab}
              onClick={() => handleTabClick(tab)}
              role="tab"
              type="button"
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {editingObjectId ? (
          <EditObjectForm
            objectId={editingObjectId}
            onCancel={openList}
            onSuccess={openList}
          />
        ) : activeTab === tabs.list ? (
          <ObjectsList onSelectObject={setEditingObjectId} />
        ) : (
          <CreateObjectForm onSuccess={openList} />
        )}
      </div>
    </div>
  );
}
