import type { ConstructionObject } from "@/data/objects";

export type ConstructionParticipant = {
  label: string;
  value: string;
};

export function constructionParticipantsForObject(
  object: ConstructionObject,
): ConstructionParticipant[] {
  const items: ConstructionParticipant[] = [];

  if (object.customer) {
    items.push({ label: "Заказчик:", value: object.customer });
  }

  if (object.contractor) {
    items.push({ label: "Подрядчик:", value: object.contractor });
  }

  if (object.address) {
    items.push({ label: "Адрес объекта:", value: object.address });
  }

  return items;
}
