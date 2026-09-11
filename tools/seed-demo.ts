import { assertSeedAllowed, parseRuntimeEnv } from '@tula/contracts';
import { demoObjectDetails, demoAppeals } from '@tula/fixtures';

const env = parseRuntimeEnv(process.env);
assertSeedAllowed(env);

if (demoObjectDetails.some((item) => item.dataOrigin !== 'DEMO')) {
  throw new Error('Seed содержит не DEMO записи');
}

console.log(
  `seed:demo идемпотентен: проверено ${demoObjectDetails.length} объектов и ${demoAppeals.length} обращений. Бизнес-таблицы появятся в F03/F10, запись в БД не выполняется.`,
);
