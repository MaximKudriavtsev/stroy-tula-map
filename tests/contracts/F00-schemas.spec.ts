import { describe, expect, it } from 'vitest';
import {
  CalendarDateSchema,
  ConstructionStatusSchema,
  DateRangeSchema,
  LonLatSchema,
  ObjectDetailSchema,
  ObjectEventSchema,
  ObjectSummarySchema,
  UuidSchema,
} from '@tula/contracts';
import { demoEvents, demoObjectDetails } from '@tula/fixtures';

describe('F00 schemas', () => {
  it('отклоняет невалидный UUID', () => {
    const result = UuidSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });

  it('отклоняет несуществующую дату', () => {
    const result = CalendarDateSchema.safeParse('2024-13-40');
    expect(result.success).toBe(false);
  });

  it('отклоняет координаты вне WGS84', () => {
    const result = LonLatSchema.safeParse([200, 100]);
    expect(result.success).toBe(false);
  });

  it('отклоняет неизвестный enum статуса', () => {
    const result = ConstructionStatusSchema.safeParse('FINISHED');
    expect(result.success).toBe(false);
  });

  it('отклоняет DateRange с lower > upper', () => {
    const result = DateRangeSchema.safeParse({
      lower: '2026-02-02',
      upper: '2026-02-01',
      precision: 'DAY',
    });
    expect(result.success).toBe(false);
  });

  it('пропускает валидные DEMO fixtures', () => {
    for (const object of demoObjectDetails) {
      expect(ObjectDetailSchema.parse(object).dataOrigin).toBe('DEMO');
      expect(ObjectSummarySchema.parse(object).name.length).toBeGreaterThan(0);
    }
    for (const event of demoEvents) {
      expect(ObjectEventSchema.parse(event).kind === 'FACT' || event.kind === 'PLAN').toBe(true);
    }
    expect(demoObjectDetails.some((item) => item.name === 'Демонстрационная школа А')).toBe(true);
    expect(demoObjectDetails.some((item) => item.type === 'MEDICAL')).toBe(true);
    expect(demoObjectDetails.some((item) => item.type === 'BOILER')).toBe(true);
    expect(demoObjectDetails.some((item) => item.anchor === null)).toBe(true);
    expect(demoObjectDetails.some((item) => item.status === 'UNKNOWN')).toBe(true);
  });
});
