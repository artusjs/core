import { Plugin } from './types';

// A utils function that toplogical sort plugins
export function topologicalSort(pluginInstanceMap: Map<string, Plugin>, pluginDepEdgeList: [string, string][]): string[] {
  const res: string[] = [];
  const indegree: Map<string, number> = new Map();

  pluginDepEdgeList.forEach(([to]) => {
    indegree.set(to, (indegree.get(to) ?? 0) + 1);
  });

  const queue: string[] = [];

  for (const [name] of pluginInstanceMap) {
    if (!indegree.has(name)) {
      queue.push(name);
    }
  }

  while(queue.length) {
    const cur = queue.shift()!;
    res.push(cur);
    for (const [to, from] of pluginDepEdgeList) {
      if (from === cur) {
        indegree.set(to, (indegree.get(to) ?? 0) - 1);
        if (indegree.get(to) === 0) {
          queue.push(to);
        }
      }
    }
  }
  return res;
}
