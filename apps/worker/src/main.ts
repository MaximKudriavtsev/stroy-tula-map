import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { parseRuntimeEnv } from '@tula/contracts';
import { createWorkerConnection } from './jobs/heartbeat.js';

@Module({})
class WorkerModule {}

const env = parseRuntimeEnv(process.env);
const app = await NestFactory.createApplicationContext(WorkerModule);
const queueWorker = createWorkerConnection(env);
console.log(`Worker started in ${env.API_MODE}. Очереди соседних фич не регистрируются в F00.`);
if (!queueWorker) {
  console.log('Live-очереди отключены: API_MODE=mock');
}

const shutdown = async () => {
  await queueWorker?.close();
  await app.close();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
