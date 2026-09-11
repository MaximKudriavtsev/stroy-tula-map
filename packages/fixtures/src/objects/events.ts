import { ObjectEventSchema, type ObjectEvent } from '@tula/contracts';
import { IDS } from '../ids.js';
import { demoSource } from './objects.js';

export const demoEvents: ObjectEvent[] = [
  ObjectEventSchema.parse({
    id: IDS.eventSchoolFact,
    objectId: IDS.school,
    revisionId: IDS.schoolRevision,
    kind: 'FACT',
    effectiveDate: { lower: '2025-09-01', upper: '2025-09-01', precision: 'DAY' },
    recordedAt: '2025-09-02T09:00:00.000Z',
    status: 'IN_PROGRESS',
    progressPercent: 42,
    source: demoSource,
    supersedesEventId: null,
  }),
  ObjectEventSchema.parse({
    id: IDS.eventSchoolPlan,
    objectId: IDS.school,
    revisionId: IDS.schoolRevision,
    kind: 'PLAN',
    effectiveDate: { lower: '2026-09-01', upper: '2026-09-30', precision: 'MONTH' },
    recordedAt: '2025-03-01T12:00:00.000Z',
    status: 'COMMISSIONED',
    progressPercent: 100,
    source: demoSource,
    supersedesEventId: null,
  }),
  ObjectEventSchema.parse({
    id: IDS.eventMedicalFact,
    objectId: IDS.medical,
    revisionId: IDS.medicalRevision,
    kind: 'FACT',
    effectiveDate: { lower: '2026-01-15', upper: '2026-01-15', precision: 'DAY' },
    recordedAt: '2026-01-16T08:00:00.000Z',
    status: 'PLANNED',
    progressPercent: 0,
    source: demoSource,
    supersedesEventId: null,
  }),
  ObjectEventSchema.parse({
    id: IDS.eventBoilerPlan,
    objectId: IDS.boiler,
    revisionId: IDS.boilerRevision,
    kind: 'PLAN',
    effectiveDate: { lower: '2023-11-01', upper: '2023-11-01', precision: 'DAY' },
    recordedAt: '2022-02-01T10:00:00.000Z',
    status: 'COMMISSIONED',
    progressPercent: 100,
    source: demoSource,
    supersedesEventId: null,
  }),
];
