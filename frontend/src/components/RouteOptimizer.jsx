import React, { useState, useEffect } from 'react';
import { Route, CheckCircle, Play } from 'lucide-react';
import { api } from '../services/api';

export default function RouteOptimizer({ onSetRoutePath, shelves }) {
  const [algorithm, setAlgorithm] = useState('AStar'); // AStar or Dijkstra
  const [destination, setDestination] = useState({ r: 2, c: 1 }); // Shelf A2 default
  const [path, setPath] = useState([]);
  const [taskRecommendations, setTaskRecommendations] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);

  const start = { r: 5, c: 0 }; // Loading dock start

  // 6x6 grid representation (0: Walkable floor, 1: Shelf obstacle)
  const grid = [
    [0, 0, 0, 0, 0, 0], // Row 0: cross aisle
    [0, 1, 0, 1, 0, 1], // Row 1: shelves (A1, B1, C1)
    [0, 1, 0, 1, 0, 1], // Row 2: shelves (A2, B2, C2)
    [0, 0, 0, 0, 0, 0], // Row 3: cross aisle
    [0, 0, 0, 0, 0, 1], // Row 4: promo shelf (D1)
    [0, 0, 0, 0, 0, 0], // Row 5: dock/forklift aisle
  ];

  // Map shelf positions to grid coords
  const shelfGridMap = {
    'A1': { r: 1, c: 1 },
    'A2': { r: 2, c: 1 },
    'B1': { r: 1, c: 3 },
    'B2': { r: 2, c: 3 },
    'C1': { r: 1, c: 5 },
    'C2': { r: 2, c: 5 },
    'D1': { r: 4, c: 5 }
  };

  // Fetch task recommendations and active tasks from REST API
  const refreshTasks = async () => {
    try {
      const recData = await api.getTaskRecommendations();
      if (recData && recData.recommendations) {
        setTaskRecommendations(recData.recommendations);
      }
      const taskData = await api.getTasks();
      if (taskData && taskData.tasks) {
        setTasksList(taskData.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks from REST API:', err);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, [shelves]);

  useEffect(() => {
    runPathfinding();
  }, [destination, algorithm]);

  const getNeighbors = (r, c) => {
    if (r === undefined || c === undefined) return [];
    const neighbors = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) {
        const isDest = destination && nr === destination.r && nc === destination.c;
        if (grid[nr][nc] === 0 || isDest) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }
    return neighbors;
  };

  const runPathfinding = () => {
    if (!destination) return;

    const parents = {};
    const key = (r, c) => `${r},${c}`;
    const openSet = [];
    const closedSet = new Set();

    const startKey = key(start.r, start.c);
    parents[startKey] = null;

    if (algorithm === 'AStar') {
      const gScore = {};
      const fScore = {};
      const h = (r, c) => Math.abs(r - destination.r) + Math.abs(c - destination.c);

      gScore[startKey] = 0;
      fScore[startKey] = h(start.r, start.c);
      openSet.push({ ...start, f: fScore[startKey] });

      while (openSet.length > 0) {
        openSet.sort((a, b) => (a.f || 0) - (b.f || 0));
        const current = openSet.shift();
        if (!current) continue;
        const currentKey = key(current.r, current.c);

        if (current.r === destination.r && current.c === destination.c) break;
        closedSet.add(currentKey);

        const neighbors = getNeighbors(current.r, current.c);
        for (const neighbor of neighbors) {
          const neighborKey = key(neighbor.r, neighbor.c);
          if (closedSet.has(neighborKey)) continue;

          const tentativeG = (gScore[currentKey] || 0) + 1;
          if (gScore[neighborKey] === undefined || tentativeG < gScore[neighborKey]) {
            parents[neighborKey] = current;
            gScore[neighborKey] = tentativeG;
            fScore[neighborKey] = tentativeG + h(neighbor.r, neighbor.c);
            if (!openSet.some(item => item.r === neighbor.r && item.c === neighbor.c)) {
              openSet.push({ ...neighbor, f: fScore[neighborKey] });
            }
          }
        }
      }
    } else {
      // Dijkstra
      const dist = {};
      dist[startKey] = 0;
      openSet.push({ ...start, dist: 0 });

      while (openSet.length > 0) {
        openSet.sort((a, b) => (a.dist || 0) - (b.dist || 0));
        const current = openSet.shift();
        if (!current) continue;
        const currentKey = key(current.r, current.c);

        if (current.r === destination.r && current.c === destination.c) break;
        closedSet.add(currentKey);

        const neighbors = getNeighbors(current.r, current.c);
        for (const neighbor of neighbors) {
          const neighborKey = key(neighbor.r, neighbor.c);
          if (closedSet.has(neighborKey)) continue;

          const alt = (dist[currentKey] || 0) + 1;
          if (dist[neighborKey] === undefined || alt < dist[neighborKey]) {
            parents[neighborKey] = current;
            dist[neighborKey] = alt;
            if (!openSet.some(item => item.r === neighbor.r && item.c === neighbor.c)) {
              openSet.push({ ...neighbor, dist: alt });
            }
          }
        }
      }
    }

    // Reconstruct path
    const reconstructed = [];
    let currKey = key(destination.r, destination.c);
    let currNode = destination;

    if (parents[currKey] !== undefined || (destination.r === start.r && destination.c === start.c)) {
      while (currNode) {
        reconstructed.unshift(currNode);
        const pKey = key(currNode.r, currNode.c);
        currNode = parents[pKey];
      }
    }

    setPath(reconstructed);
    if (onSetRoutePath) {
      onSetRoutePath(reconstructed);
    }
  };

  const handleSelectShelf = (shelfId) => {
    const coords = shelfGridMap[shelfId];
    if (coords) {
      setDestination(coords);
    }
  };

  const handleCreateAndApproveTask = async (rec) => {
    try {
      const created = await api.createTask({
        type: rec.type,
        sourceModule: rec.sourceModule,
        executionStatus: rec.executionStatus,
        executionGranularity: rec.executionGranularity,
        productId: rec.productId,
        productName: rec.productName,
        sourceShelfId: rec.sourceShelfId,
        sourceZone: rec.sourceZone,
        targetShelfId: rec.targetShelfId,
        targetZone: rec.targetZone,
        quantity: rec.quantity,
        reason: rec.reason
      });

      await api.approveTask(created.taskId);
      const assigned = await api.assignTask(created.taskId);

      setActionMessage({ type: 'success', text: `Task ${created.taskId} created, approved & assigned to ${assigned.assignedAgvId || 'AGV'}!` });
      refreshTasks();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  const handleExecuteTask = async (taskId) => {
    try {
      const res = await api.executeTask(taskId);
      setActionMessage({ type: 'success', text: res.message || `Task ${taskId} executed successfully!` });
      refreshTasks();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723]">AGV Route Optimizer & Task Engine</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Interactive pathfinding grid & Human-approved AGV task orchestration</p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex bg-[#dcd9cf]/60 p-1 rounded-xl border border-[#b9bba8]/40 gap-1 text-xs">
          <button
            onClick={() => setAlgorithm('AStar')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              algorithm === 'AStar' ? 'bg-[#2a3723] text-white shadow-sm' : 'text-[#2a3723]/70 hover:text-[#2a3723]'
            }`}
          >
            A* Search
          </button>
          <button
            onClick={() => setAlgorithm('Dijkstra')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              algorithm === 'Dijkstra' ? 'bg-[#2a3723] text-white shadow-sm' : 'text-[#2a3723]/70 hover:text-[#2a3723]'
            }`}
          >
            Dijkstra
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-2.5 rounded-xl mb-3 text-xs flex items-center justify-between ${
          actionMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        
        {/* Left: 6x6 Pathfinding Grid & Destination Selectors */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-[#2a3723] flex items-center justify-between">
            <span>Grid Map (Target Destination)</span>
            <span className="font-mono text-[10px] text-[#2a3723]/60">Path Steps: {path.length}</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 p-3 bg-[#dcd9cf]/30 rounded-xl border border-[#b9bba8]/40 aspect-square max-w-[260px] mx-auto">
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isStart = r === start.r && c === start.c;
                const isDest = destination && r === destination.r && c === destination.c;
                const isInPath = path.some(p => p.r === r && p.c === c);

                let cellColor = 'bg-[#e8e5dd] border-[#b9bba8]/30'; // Floor
                if (cell === 1) cellColor = 'bg-[#2a3723]/20 border-[#2a3723]/30'; // Obstacle
                if (isInPath) cellColor = 'bg-amber-500/80 border-amber-600 text-white font-bold';
                if (isStart) cellColor = 'bg-emerald-600 border-emerald-700 text-white font-bold';
                if (isDest) cellColor = 'bg-rose-600 border-rose-700 text-white font-bold';

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`rounded-lg border flex items-center justify-center text-[9px] transition-all aspect-square ${cellColor}`}
                  >
                    {isStart ? 'DOCK' : isDest ? 'DEST' : isInPath ? '•' : cell === 1 ? 'RACK' : ''}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Rack Buttons */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-1">
            {Object.keys(shelfGridMap).map(sId => (
              <button
                key={sId}
                onClick={() => handleSelectShelf(sId)}
                className={`text-[10px] font-mono px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  destination && destination.r === shelfGridMap[sId].r && destination.c === shelfGridMap[sId].c
                    ? 'bg-[#2a3723] text-white shadow-sm'
                    : 'bg-[#dcd9cf]/60 hover:bg-[#dcd9cf] text-[#2a3723]'
                }`}
              >
                {sId}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Operational Tasks & Human Approval Queue */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="text-xs font-bold text-[#2a3723] mb-2 flex items-center justify-between">
            <span>Human Approval & AGV Task Queue</span>
            <span className="text-[10px] text-[#2a3723]/60 font-mono">Tasks: {tasksList.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[260px]">
            {/* Approved / Active Tasks List */}
            {tasksList.map(task => (
              <div key={task.taskId} className="bg-[#dcd9cf]/45 p-3 rounded-xl border border-[#b9bba8]/30 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#2a3723]">{task.taskId}</span>
                    <span className="ml-2 text-[10px] font-mono text-[#2a3723]/60">({task.type})</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    task.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800' :
                    task.status === 'ASSIGNED' ? 'bg-amber-100 text-amber-800' :
                    'bg-[#2a3723]/10 text-[#2a3723]'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#2a3723]/75 mt-1 font-medium">{task.reason}</p>

                {task.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleExecuteTask(task.taskId)}
                    className="mt-2 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <Play className="w-3 h-3" /> Execute Task
                  </button>
                )}
              </div>
            ))}

            {/* Recommended Tasks Queue */}
            {taskRecommendations.map(rec => (
              <div key={rec.recommendationId} className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-amber-900">REC: {rec.type}</span>
                    <span className="ml-2 text-[9px] font-mono text-amber-700">[{rec.sourceModule}]</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    rec.executionStatus === 'EXECUTABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {rec.executionStatus}
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 mt-1 font-medium">{rec.reason}</p>

                {rec.executionStatus === 'EXECUTABLE' && (
                  <button
                    onClick={() => handleCreateAndApproveTask(rec)}
                    className="mt-2 text-[10px] bg-[#2a3723] hover:bg-[#2a3723]/90 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-3 h-3" /> Approve & Assign Task
                  </button>
                )}
              </div>
            ))}

            {tasksList.length === 0 && taskRecommendations.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-500">
                No active or recommended operational tasks.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
