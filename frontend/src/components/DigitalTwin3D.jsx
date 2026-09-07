import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Layers, MousePointerClick, RefreshCcw, ZoomIn } from 'lucide-react';

export default function DigitalTwin3D({ shelves, activeRoutePath, onSelectShelf, selectedShelfId }) {
  const mountRef = useRef(null);
  const [hoveredShelf, setHoveredShelf] = useState(null);
  const [resetKey, setResetKey] = useState(0); // Trigger re-mount for resize/reset

  useEffect(() => {
    if (!mountRef.current) return;

    // Get dimensions of mount container
    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 350;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8e5dd'); // Warm Sand background
    scene.fog = new THREE.FogExp2('#e8e5dd', 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 18, 25);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.target.set(5, 2, 0);

    // Ambient light
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6); // Brighter ambient for light theme
    scene.add(ambientLight);

    // Main directional light
    const dirLight = new THREE.DirectionalLight('#ffffff', 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Soft warm spot light to highlight active work areas
    const spotLight = new THREE.SpotLight('#f59e0b', 1.5, 40, Math.PI / 6, 0.5, 1);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);

    // Grid Floor Helper (Forest Green grid lines on sand background)
    const gridHelper = new THREE.GridHelper(60, 30, '#2a3723', '#b9bba8');
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Custom Concrete Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#e8e5dd',
      roughness: 0.9,
      metalness: 0.0
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create Shelves Group
    const shelfGroup = new THREE.Group();
    scene.add(shelfGroup);

    // Shelf meshes reference array for Raycasting
    const raycastMeshes = [];

    // Visual colors based on shelf status
    const getStatusColor = (shelf) => {
      if (shelf.id === selectedShelfId) return '#2a3723'; // Forest Green for active selection
      if (shelf.quantity === 0) return '#a3a3a3'; // Gray for empty
      if (shelf.status === 'low' || shelf.quantity / shelf.capacity < 0.2) return '#d97706'; // Amber warning
      if (shelf.status === 'hazard' || shelf.expiryDays <= 4) return '#dc2626'; // Red hazard
      return '#15803d'; // Emerald stocked
    };

    // Draw Shelf structures dynamically
    shelves.forEach((s) => {
      // Map 2D grid coordinates from shelf variables (for A, B, C, D)
      // Shelf row maps to X axis, col maps to Z axis
      const shelfX = (s.row * 8) - 8;
      const shelfZ = (s.col * 10) - 5;
      
      const isSelected = s.id === selectedShelfId;

      // Group representing a single double-bay shelf rack
      const rack = new THREE.Group();
      rack.position.set(shelfX, 0, shelfZ);
      rack.userData = { id: s.id, item: s.item, quantity: s.quantity, capacity: s.capacity };

      // Support pillars (4 vertical metallic/sage green legs)
      const pillarGeo = new THREE.BoxGeometry(0.3, 7, 0.3);
      const pillarMat = new THREE.MeshStandardMaterial({ color: '#b9bba8', metalness: 0.4, roughness: 0.3 }); // Sage legs
      
      const p1 = new THREE.Mesh(pillarGeo, pillarMat); p1.position.set(-1.8, 3.5, -2.8); rack.add(p1);
      const p2 = new THREE.Mesh(pillarGeo, pillarMat); p2.position.set(1.8, 3.5, -2.8); rack.add(p2);
      const p3 = new THREE.Mesh(pillarGeo, pillarMat); p3.position.set(-1.8, 3.5, 2.8); rack.add(p3);
      const p4 = new THREE.Mesh(pillarGeo, pillarMat); p4.position.set(1.8, 3.5, 2.8); rack.add(p4);

      // Horizontal Shelf Bars (3 levels: low, mid, high - colored in Forest Green)
      const barGeo = new THREE.BoxGeometry(3.6, 0.2, 5.6);
      const barMat = new THREE.MeshStandardMaterial({ color: isSelected ? '#2a3723' : '#5a6e50', roughness: 0.6 });

      const shelfLevels = [0.2, 2.8, 5.4];
      shelfLevels.forEach((h, idx) => {
        const level = new THREE.Mesh(barGeo, barMat);
        level.position.set(0, h, 0);
        level.receiveShadow = true;
        rack.add(level);

        // Put boxes on shelves if they have inventory
        const fillFactor = s.quantity / s.capacity;
        if (fillFactor > 0 && idx < 2) { // fill lower 2 levels first
          const boxColor = getStatusColor(s);
          const boxMat = new THREE.MeshStandardMaterial({
            color: boxColor,
            roughness: 0.6,
            metalness: 0.0
          });

          // Draw multiple small boxes representing packages
          const boxGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
          // 2x3 box cluster per level
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
              // Only draw if we haven't exceeded filled quantity ratio
              if (Math.random() < fillFactor + 0.1) {
                const box = new THREE.Mesh(boxGeo, boxMat);
                box.position.set(
                  (row * 1.2) - 0.6,
                  h + 0.5,
                  (col * 1.5) - 1.5
                );
                box.castShadow = true;
                rack.add(box);
              }
            }
          }
        }
      });

      // An invisible click box covering the whole shelf for easier raycast clicking
      const clickGeo = new THREE.BoxGeometry(4.2, 7.2, 6.2);
      const clickMat = new THREE.MeshBasicMaterial({
        color: isSelected ? '#2a3723' : '#b9bba8',
        transparent: true,
        opacity: isSelected ? 0.1 : 0.0,
      });
      const clickBox = new THREE.Mesh(clickGeo, clickMat);
      clickBox.position.set(0, 3.6, 0);
      clickBox.userData = { id: s.id }; // Attach id
      rack.add(clickBox);
      raycastMeshes.push(clickBox); // Add to target list

      shelfGroup.add(rack);
    });

    // Forklift mesh (Moving Forest Green utility vehicle)
    const forklift = new THREE.Group();
    forklift.position.set(-8, 0.4, 5);
    scene.add(forklift);

    // Forklift Body
    const flBodyGeo = new THREE.BoxGeometry(1.6, 0.8, 2.4);
    const flBodyMat = new THREE.MeshStandardMaterial({ color: '#2a3723', metalness: 0.4, roughness: 0.3 }); // Forest Green forklift body
    const flBody = new THREE.Mesh(flBodyGeo, flBodyMat);
    flBody.castShadow = true;
    forklift.add(flBody);

    // Forklift Cabin
    const cabinGeo = new THREE.BoxGeometry(1.4, 1.0, 1.2);
    const cabinMat = new THREE.MeshStandardMaterial({ color: '#b9bba8', transparent: true, opacity: 0.5 }); // Sage glass cabin
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.9, -0.3);
    forklift.add(cabin);

    // Mast and Forks
    const mastGeo = new THREE.BoxGeometry(0.2, 2.2, 0.2);
    const mastMat = new THREE.MeshStandardMaterial({ color: '#2a3723', metalness: 0.7 });
    const mast1 = new THREE.Mesh(mastGeo, mastMat); mast1.position.set(-0.4, 0.7, 1.3); forklift.add(mast1);
    const mast2 = new THREE.Mesh(mastGeo, mastMat); mast2.position.set(0.4, 0.7, 1.3); forklift.add(mast2);

    const forkGeo = new THREE.BoxGeometry(0.1, 0.1, 1.2);
    const forkMat = new THREE.MeshStandardMaterial({ color: '#b9bba8', metalness: 0.6 });
    const fork1 = new THREE.Mesh(forkGeo, forkMat); fork1.position.set(-0.3, 0.1, 1.8); forklift.add(fork1);
    const fork2 = new THREE.Mesh(forkGeo, forkMat); fork2.position.set(0.3, 0.1, 1.8); forklift.add(fork2);

    // Fork cargo crate
    const cargoGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const cargoMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.8 }); // Orange crate
    const flCrate = new THREE.Mesh(cargoGeo, cargoMat);
    flCrate.position.set(0, 0.6, 1.5);
    forklift.add(flCrate);

    // Forklift Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#2a3723', roughness: 0.9 });
    
    const w1 = new THREE.Mesh(wheelGeo, wheelMat); w1.rotation.z = Math.PI / 2; w1.position.set(-0.9, -0.1, 0.8); forklift.add(w1);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat); w2.rotation.z = Math.PI / 2; w2.position.set(0.9, -0.1, 0.8); forklift.add(w2);
    const w3 = new THREE.Mesh(wheelGeo, wheelMat); w3.rotation.z = Math.PI / 2; w3.position.set(-0.9, -0.1, -0.8); forklift.add(w3);
    const w4 = new THREE.Mesh(wheelGeo, wheelMat); w4.rotation.z = Math.PI / 2; w4.position.set(0.9, -0.1, -0.8); forklift.add(w4);

    // Translate 2D pathfinding coordinates to 3D spaces
    // Route visualizer works on a 6x6 grid spanning coordinates from row 0-5, col 0-5
    // Grid center is (row=2.5, col=2.5) -> we scale grid into world coordinate mapping
    const mapGridTo3D = (row, col) => {
      const x = (row * 6) - 15;
      const z = (col * 7) - 17.5;
      return new THREE.Vector3(x, 0.4, z);
    };

    let pathPoints3D = [];
    if (activeRoutePath && activeRoutePath.length > 0) {
      pathPoints3D = activeRoutePath.map(p => mapGridTo3D(p.r, p.c));
    }

    // Path Line Visualizer (colored Forest Green)
    let routeLine = null;
    if (pathPoints3D.length > 1) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pathPoints3D);
      const lineMat = new THREE.LineBasicMaterial({
        color: '#2a3723',
        linewidth: 4
      });
      routeLine = new THREE.Line(lineGeo, lineMat);
      scene.add(routeLine);

      // Add small glowing beacon light bulbs at corners
      pathPoints3D.forEach((p, idx) => {
        if (idx === pathPoints3D.length - 1 || idx === 0) {
          const ptGeo = new THREE.SphereGeometry(0.3, 8, 8);
          const ptMat = new THREE.MeshBasicMaterial({ color: idx === 0 ? '#15803d' : '#dc2626' });
          const pt = new THREE.Mesh(ptGeo, ptMat);
          pt.position.copy(p);
          scene.add(pt);
        }
      });
    }

    // Animation variables
    let flSpeed = 0.05;
    let targetPathIndex = 1;

    // Raycaster for mouse picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseInteraction = (event, isClick) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const clickedId = clickedMesh.userData.id;

        if (isClick) {
          onSelectShelf(clickedId);
        } else {
          setHoveredShelf(clickedId);
        }
      } else {
        if (!isClick) setHoveredShelf(null);
      }
    };

    const onMouseMove = (event) => handleMouseInteraction(event, false);
    const onClick = (event) => handleMouseInteraction(event, true);

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Controls update
      controls.update();

      // Animate Forklift along path
      if (pathPoints3D.length > 1) {
        // Move forklift along pathPoints3D
        const targetPos = pathPoints3D[targetPathIndex];
        const flPos = forklift.position;

        const distance = flPos.distanceTo(targetPos);
        if (distance > 0.3) {
          // Calculate heading angle
          const dir = new THREE.Vector3().subVectors(targetPos, flPos).normalize();
          const targetAngle = Math.atan2(-dir.z, dir.x);
          
          // Smooth rotation
          forklift.rotation.y = targetAngle;
          
          // Move forward
          flPos.add(dir.multiplyScalar(flSpeed));
        } else {
          // Increment path step
          if (targetPathIndex < pathPoints3D.length - 1) {
            targetPathIndex++;
          } else {
            // Path finished, wrap back or stop
            targetPathIndex = 0; // restart cycle
            forklift.position.copy(pathPoints3D[0]);
          }
        }
      } else {
        // Default idle patrol path (sweeps along columns)
        const time = clock.getElapsedTime() * 0.5;
        forklift.position.x = Math.sin(time) * 12;
        forklift.position.z = Math.cos(time * 0.5) * 8;
        forklift.rotation.y = -time + Math.PI / 2;
      }

      // Small bounce on cargo crate carried by forklift
      flCrate.position.y = 0.5 + Math.sin(clock.getElapsedTime() * 5) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [shelves, activeRoutePath, selectedShelfId, resetKey]);

  const activeShelfObj = shelves.find(s => s.id === selectedShelfId);
  const hoveredShelfObj = shelves.find(s => s.id === hoveredShelf);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col relative">
      {/* HUD Info */}
      <div className="flex justify-between items-start mb-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723] font-sans">3D Digital Twin Engine</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Interactive spatial view of shelves and automated forklift routing</p>
        </div>
        <button
          onClick={() => setResetKey(prev => prev + 1)}
          className="text-[#2a3723]/70 hover:text-[#2a3723] bg-[#dcd9cf] p-2 rounded-lg border border-[#b9bba8]/30 transition-all cursor-pointer"
          title="Reset Camera View"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Render Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-[400px] min-h-[350px] rounded-xl border border-[#b9bba8] relative cursor-grab active:cursor-grabbing overflow-hidden"
      >
        {/* Instruction badge */}
        <div className="absolute bottom-3 right-3 bg-[#e8e5dd]/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#b9bba8]/40 text-[10px] text-[#2a3723] flex items-center gap-1.5 pointer-events-none select-none">
          <ZoomIn className="w-3.5 h-3.5 text-[#2a3723]" />
          Drag to Rotate | Scroll to Zoom
        </div>

        {/* Hover Tooltip */}
        {hoveredShelfObj && (
          <div className="absolute top-3 left-3 bg-[#e8e5dd]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#2a3723]/30 text-xs pointer-events-none select-none space-y-1">
            <div className="font-semibold text-[#2a3723]">{hoveredShelfObj.name}</div>
            <div className="text-[10px] text-[#2a3723]/70">Stock: <span className="font-semibold font-mono text-[#2a3723]">{hoveredShelfObj.quantity} / {hoveredShelfObj.capacity}</span></div>
            <div className="text-[10px] text-[#2a3723]/70">Status: <span className={`font-semibold capitalize ${hoveredShelfObj.quantity === 0 ? 'text-gray-500' : hoveredShelfObj.status === 'low' ? 'text-amber-600' : hoveredShelfObj.expiryDays <= 4 ? 'text-red-600' : 'text-emerald-700'}`}>{hoveredShelfObj.status}</span></div>
          </div>
        )}
      </div>

      {/* Active Selected shelf info */}
      <div className="mt-4 bg-[#dcd9cf]/45 p-4 rounded-xl border border-[#b9bba8]/45 grid grid-cols-4 gap-4">
        {activeShelfObj ? (
          <>
            <div className="col-span-1">
              <div className="text-[10px] text-[#2a3723]/50 uppercase font-bold">Active Selection</div>
              <div className="font-bold text-sm text-[#2a3723] truncate mt-0.5">{activeShelfObj.id}</div>
              <div className="text-[10px] text-[#2a3723]/70 truncate">{activeShelfObj.item}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#2a3723]/50 uppercase font-bold">Live Fill Rate</div>
              <div className="font-bold text-sm text-[#2a3723] mt-0.5">
                {Math.round((activeShelfObj.quantity / activeShelfObj.capacity) * 100)}%
              </div>
              <div className="text-[10px] text-[#2a3723]/70 font-mono">{activeShelfObj.quantity} / {activeShelfObj.capacity}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#2a3723]/50 uppercase font-bold">Expiry Date</div>
              <div className="font-bold text-sm mt-0.5 text-[#2a3723]">
                {activeShelfObj.expiryDays === 999 ? 'N/A' : `${activeShelfObj.expiryDays} Days`}
              </div>
              <span className={`text-[10px] font-bold ${activeShelfObj.expiryDays <= 4 ? 'text-red-600' : 'text-emerald-700'}`}>
                {activeShelfObj.expiryDays <= 4 ? 'Risk: Critical' : 'Risk: Normal'}
              </span>
            </div>
            <div>
              <div className="text-[10px] text-[#2a3723]/50 uppercase font-bold">Daily Demand</div>
              <div className="font-bold text-sm capitalize text-[#2a3723] mt-0.5">{activeShelfObj.demand}</div>
              <div className="text-[10px] text-[#2a3723]/70">Trend score: 0.94</div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center py-1.5 text-xs text-[#2a3723]/50 flex items-center justify-center gap-1.5 font-medium">
            <MousePointerClick className="w-4 h-4 text-[#2a3723]" />
            Click any shelf in the 3D grid view to pull live telemetry logs
          </div>
        )}
      </div>
    </div>
  );
}
