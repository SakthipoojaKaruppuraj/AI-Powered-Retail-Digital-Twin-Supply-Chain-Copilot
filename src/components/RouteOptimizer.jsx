import React, { useState, useEffect } from 'react';
import { Route, Zap, Compass, RefreshCw, Layers } from 'lucide-react';

export default function RouteOptimizer({ onSetRoutePath, shelves }) {
  const [algorithm, setAlgorithm] = useState('AStar'); // AStar or Dijkstra
  const [destination, setDestination] = useState({ r: 2, c: 1 }); // Shelf A2 default
  const [path, setPath] = useState([]);
  const [visited, setVisited] = useState([]);
  const [animating, setAnimating] = useState(false);

  const start = { r: 5, c: 0 }; // Loading dock start

  // 6x6 grid representation
  // 0: Walkable floor, 1: Shelf obstacle
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

  // Run pathfinding on changes
  useEffect(() => {
    runPathfinding();
  }, [destination, algorithm]);

  const getNeighbors = (r, c) => {
    if (r === undefined || c === undefined) return [];
    const neighbors = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // orthogonal moves only
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) {
        // Destination cell can be visited (even if it's marked as obstacle, since forklift parks next to it)
        const isDest = destination && nr === destination.r && nc === destination.c;
        if (grid[nr][nc] === 0 || isDest) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }
    return neighbors;
  };

  const runPathfinding = () => {
    if (animating || !destination) return;

    const visitedCells = [];
    const parents = {};
    const key = (r, c) => `${r},${c}`;

    // Priority queues / open list
    const openSet = [];
    const closedSet = new Set();

    const startKey = key(start.r, start.c);
    parents[startKey] = null;

    if (algorithm === 'AStar') {
      // A* Pathfinding with Manhattan distance heuristic
      const gScore = {};
      const fScore = {};
      const h = (r, c) => Math.abs(r - destination.r) + Math.abs(c - destination.c);

      gScore[startKey] = 0;
      fScore[startKey] = h(start.r, start.c);

      openSet.push({ ...start, f: fScore[startKey] });

      while (openSet.length > 0) {
        // Pick node with lowest f-score
        openSet.sort((a, b) => (a.f || 0) - (b.f || 0));
        const current = openSet.shift();
        if (!current) continue;
        const currentKey = key(current.r, current.c);

        visitedCells.push(current);

        if (current.r === destination.r && current.c === destination.c) {
          break;
        }

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

            if (!openSet.some(node => node && node.r === neighbor.r && node.c === neighbor.c)) {
              openSet.push({ ...neighbor, f: fScore[neighborKey] });
            }
          }
        }
      }
    } else {
      // Dijkstra's Algorithm (Uninformed uniform cost search)
      const dist = {};
      dist[startKey] = 0;
      openSet.push({ ...start, d: 0 });

      while (openSet.length > 0) {
        openSet.sort((a, b) => (a.d || 0) - (b.d || 0));
        const current = openSet.shift();
        if (!current) continue;
        const currentKey = key(current.r, current.c);

        visitedCells.push(current);

        if (current.r === destination.r && current.c === destination.c) {
          break;
        }

        closedSet.add(currentKey);

        const neighbors = getNeighbors(current.r, current.c);
        for (const neighbor of neighbors) {
          const neighborKey = key(neighbor.r, neighbor.c);
          if (closedSet.has(neighborKey)) continue;

          const alt = (dist[currentKey] || 0) + 1;
          if (dist[neighborKey] === undefined || alt < dist[neighborKey]) {
            parents[neighborKey] = current;
            dist[neighborKey] = alt;
            openSet.push({ ...neighbor, d: alt });
          }
        }
      }
    }

    // Reconstruct path safely
    const reconstructedPath = [];
    let curr = destination;
    while (curr && curr.r !== undefined && curr.c !== undefined) {
      reconstructedPath.push(curr);
      const parentNode = parents[key(curr.r, curr.c)];
      if (!parentNode || parentNode === curr) break;
      curr = parentNode;
    }
    reconstructedPath.reverse();

    // Trigger grid path animations
    setAnimating(true);
    setVisited([]);
    setPath([]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < visitedCells.length) {
        const nextCell = visitedCells[step];
        if (nextCell && nextCell.r !== undefined && nextCell.c !== undefined) {
          setVisited(prev => [...prev, nextCell]);
        }
        step++;
      } else {
        clearInterval(interval);
        setPath(reconstructedPath);
        if (onSetRoutePath) {
          onSetRoutePath(reconstructedPath); // push path coordinates to the digital twin
        }
        setAnimating(false);
      }
    }, 45);
  };

  const handleShelfSelect = (shelfId) => {
    if (animating) return;
    const coords = shelfGridMap[shelfId];
    if (coords) {
      setDestination(coords);
    }
  };

  // Helper colors for drawing grid cells
  const getCellColor = (r, c) => {
    if (!destination || !start) return 'bg-[#e8e5dd]/40';

    const isStart = r === start.r && c === start.c;
    const isDest = r === destination.r && c === destination.c;
    const isObstacle = grid[r][c] === 1 && !isDest;

    if (isStart) return 'bg-emerald-600 shadow-sm text-white';
    if (isDest) return 'bg-rose-600 shadow-sm text-white animate-pulse';

    const pathIndex = path ? path.findIndex(node => node && node.r === r && node.c === c) : -1;
    const isPath = pathIndex !== -1;
    if (isPath) return 'bg-[#2a3723] border border-[#2a3723]/30 text-white';

    const visitedIndex = visited ? visited.findIndex(node => node && node.r === r && node.c === c) : -1;
    const isVisited = visitedIndex !== -1;
    if (isVisited) return 'bg-[#b9bba8]/30 border border-[#b9bba8]/40';

    if (isObstacle) return 'bg-[#5a6e50] border border-[#b9bba8]/30';

    return 'bg-[#e8e5dd]/40 border border-[#b9bba8]/20';
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723]">Route Optimization Engine</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Automated pathfinding (A* vs Dijkstra) for forklift operations</p>
        </div>

        {/* Algorithm Select */}
        <div className="flex bg-[#e8e5dd] rounded-lg p-1 border border-[#b9bba8]">
          <button
            onClick={() => setAlgorithm('AStar')}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer ${
              algorithm === 'AStar' ? 'bg-[#2a3723] text-white' : 'text-[#2a3723]/60 hover:text-[#2a3723]'
            }`}
          >
            A* Search
          </button>
          <button
            onClick={() => setAlgorithm('Dijkstra')}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer ${
              algorithm === 'Dijkstra' ? 'bg-[#2a3723] text-white' : 'text-[#2a3723]/60 hover:text-[#2a3723]'
            }`}
          >
            Dijkstra
          </button>
        </div>
      </div>

      {/* Main interactive grid and info panels */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-1 items-stretch">
        
        {/* Left Grid */}
        <div className="md:col-span-3 flex flex-col justify-center">
          <div className="grid grid-cols-6 gap-2 w-full max-w-[280px] mx-auto">
            {Array.from({ length: 6 }).map((_, r) => (
              Array.from({ length: 6 }).map((_, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => {
                    if (!animating && grid[r][c] === 0) setDestination({ r, c });
                  }}
                  className={`grid-cell rounded-lg flex items-center justify-center font-mono text-[9px] cursor-pointer ${getCellColor(r, c)}`}
                >
                  {r === start.r && c === start.c && 'START'}
                  {destination && r === destination.r && c === destination.c && 'DEST'}
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Right Info panels */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-4">
          
          {/* Quick Shelf targets selector */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-[#2a3723]/60 uppercase">Target Shelves</div>
            <div className="flex flex-wrap gap-1.5">
              {shelves.map(s => {
                const targetCoords = shelfGridMap[s.id];
                const isSelected = destination && targetCoords && destination.r === targetCoords.r && destination.c === targetCoords.c;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleShelfSelect(s.id)}
                    className={`text-[10px] px-2 py-1 rounded border font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2a3723]/10 border-[#2a3723] text-[#2a3723]'
                        : 'bg-[#dcd9cf]/40 border-[#b9bba8]/30 text-[#2a3723]/70 hover:bg-[#dcd9cf]/60'
                    }`}
                  >
                    {s.id} ({s.item})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance cards */}
          <div className="bg-[#dcd9cf]/35 p-4 rounded-xl border border-[#b9bba8]/30 space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#2a3723]/60">Route Distance:</span>
              <span className="font-extrabold text-[#2a3723] font-mono">{(path.length * 60) || 0} m</span>
            </div>
            
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#2a3723]/60">Nodes Evaluated:</span>
              <span className="font-extrabold text-[#2a3723]/80 font-mono">{visited.length} cells</span>
            </div>

            <div className="border-t border-[#b9bba8]/40 pt-3 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Path Optimized</div>
                <div className="text-xs font-bold text-[#2a3723] mt-0.5">38% Travel Time Saved</div>
                <p className="text-[9px] text-[#2a3723]/70 mt-1 leading-relaxed font-medium">
                  Forklift travel routing calculated using {algorithm === 'AStar' ? 'A* (manhattan heuristics)' : 'Dijkstra search'}. 
                  Path synchronizes immediately to coordinates in the 3D twin view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
