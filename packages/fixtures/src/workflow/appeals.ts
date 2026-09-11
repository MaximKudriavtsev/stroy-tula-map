import { ActorSchema, AppealSchema, TaskSchema, type Actor, type Appeal, type Task } from '@tula/contracts';
import { IDS } from '../ids.js';

export const demoActor: Actor = ActorSchema.parse({
  id: IDS.actor,
  roles: ['ADMIN'],
  scope: { allMunicipalities: true, municipalityIds: [] },
});

export const demoAppeals: Appeal[] = [
  AppealSchema.parse({
    id: IDS.appealA,
    number: 'DEMO-2026-0001',
    applicantId: IDS.applicantA,
    objectId: IDS.school,
    status: 'IN_REVIEW',
    taskId: IDS.taskShared,
    createdAt: '2026-02-10T10:15:00.000Z',
    version: 1,
  }),
  AppealSchema.parse({
    id: IDS.appealB,
    number: 'DEMO-2026-0002',
    applicantId: IDS.applicantB,
    objectId: IDS.school,
    status: 'REGISTERED',
    taskId: IDS.taskShared,
    createdAt: '2026-02-11T08:40:00.000Z',
    version: 1,
  }),
];

export const demoTasks: Task[] = [
  TaskSchema.parse({
    id: IDS.taskShared,
    title: 'Демонстрационная задача: шум у школы А (два заявителя)',
    objectId: IDS.school,
    municipalityId: IDS.municipality,
    status: 'IN_PROGRESS',
    assigneeId: IDS.actor,
    dueAt: '2026-03-01T12:00:00.000Z',
    priority: 'NORMAL',
    version: 1,
    mergedIntoTaskId: null,
  }),
];
