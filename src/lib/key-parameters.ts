import { objectCategoryLabels } from "@/data/object-categories";
import {
  statusLabels,
  type ConstructionObject,
} from "@/data/objects";
import { inferObjectCategory } from "@/lib/object-chip";

export type ObjectKeyParameter = {
  title: string;
  content: string;
};

export function keyParametersForObject(
  object: ConstructionObject,
): ObjectKeyParameter[] {
  return [
    {
      title: "Муниципалитет",
      content: object.municipality,
    },
    {
      title: "Статус",
      content: statusLabels[object.status],
    },
    {
      title: "Категория",
      content: objectCategoryLabels[inferObjectCategory(object.name)],
    },
  ];
}
