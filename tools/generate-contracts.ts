import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOpenApiDocument, catalogEndpoints, CONTRACT_VERSION } from '@tula/contracts';
import { generatedOperationIds, GENERATED_CONTRACT_VERSION } from '@tula/api-client';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const stringify = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const writeOrCheck = async (filePath: string, contents: string): Promise<void> => {
  if (check) {
    try {
      const current = await readFile(filePath, 'utf8');
      if (current !== contents) {
        throw new Error(`Сгенерированный файл устарел: ${path.relative(root, filePath)}. Запустите pnpm contracts:gen`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Нет ${path.relative(root, filePath)}. Запустите pnpm contracts:gen`);
      }
      throw error;
    }
    return;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
};

const openapi = await buildOpenApiDocument();
const openapiPath = path.join(root, 'packages/contracts/openapi/v1.json');
await writeOrCheck(openapiPath, stringify(openapi));

const operations = catalogEndpoints.map((endpoint) => ({
  operationId: endpoint.operationId,
  method: endpoint.method,
  path: endpoint.path,
  feature: endpoint.feature,
  permission: endpoint.permission,
  availability: endpoint.availability,
}));
const operationsPath = path.join(root, 'packages/api-client/src/generated/operations.json');
await writeOrCheck(operationsPath, stringify(operations));

const missing = catalogEndpoints
  .map((endpoint) => endpoint.operationId)
  .filter((id) => !generatedOperationIds.includes(id));
if (GENERATED_CONTRACT_VERSION !== CONTRACT_VERSION) {
  throw new Error('Версия generated client не совпадает с contracts v1');
}
if (missing.length > 0) {
  console.warn(`Typed helpers ещё не покрывают: ${missing.join(', ')}. Общий invoke покрывает весь каталог.`);
}

const catalogIds = new Set(catalogEndpoints.map((endpoint) => endpoint.operationId));
if (catalogIds.size !== catalogEndpoints.length) {
  throw new Error('В каталоге повторяются operationId');
}

const pathMethods = catalogEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);
if (new Set(pathMethods).size !== pathMethods.length) {
  throw new Error('В каталоге повторяются method+path');
}

console.log(`contracts v${CONTRACT_VERSION}: ${catalogEndpoints.length} endpoints, OpenAPI записан.`);
