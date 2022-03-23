import 'reflect-metadata';
import assert from 'assert';
import { getArtusApplication } from '../../src';

describe('test/trigger/timer.test.ts', () => {
  it('[trigger with timer] should run succeed', async () => {
    const {
      main,
      getTaskExecution,
    } = await import('../fixtures/trigger-timer/app');
    const app = getArtusApplication();
    await main();
    await new Promise(resolve => setTimeout(resolve, 3000));
    const execution = getTaskExecution();
    assert(execution);
    console.log(execution);
    // task1
    const task1ExecutionCount = execution.task1.count;
    assert(task1ExecutionCount > 10);

    // task2
    const task2ExecutionCount = execution.task2.count;
    assert(task2ExecutionCount > 5);

    // execution average cost
    const task1ExecutionAverage = execution.task1.cost / task1ExecutionCount;
    const task2ExecutionAverage = execution.task2.cost / task2ExecutionCount;
    assert(task2ExecutionAverage < task1ExecutionAverage);
    await app.close();
  });
});