import React, { useRef, useEffect } from 'react';
import type { Tree } from '../../types';

interface GardenCanvasProps {
  trees: Tree[];
  onTreeSelect: (tree: Tree) => void;
  onTreeMove: (treeId: string, newX: number) => void;
  waterEventId: number;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
}

interface AnimatedTree extends Tree {
  currentGrowth: number;
  wiggleIntensity: number;
  wigglePhase: number;
  swayPhase: number;
  swayIntensity: number;
  growthRate: number;
  particles: Particle[];
}

interface WaterParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export const GardenCanvas: React.FC<GardenCanvasProps> = ({ trees, onTreeSelect, onTreeMove, waterEventId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedTreesRef = useRef<Map<string, AnimatedTree>>(new Map());
  const waterParticlesRef = useRef<WaterParticle[]>([]);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  
  const draggedTreeRef = useRef<AnimatedTree | null>(null);
  const dragStartPosRef = useRef<{ x: number, y: number } | null>(null);


  const seededRandom = (seed: number) => {
    let s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
  };
  
  useEffect(() => {
    const currentAnimatedTrees = animatedTreesRef.current;
    const newTreesMap = new Map(trees.map(t => [t.id, t]));

    // To handle clearing the garden, we must remove trees from our internal
    // animation map if they are no longer in the `trees` prop.
    currentAnimatedTrees.forEach((_, id) => {
      if (!newTreesMap.has(id)) {
        currentAnimatedTrees.delete(id);
      }
    });

    newTreesMap.forEach((tree: Tree, id) => {
      if (!currentAnimatedTrees.has(id)) {
        const newParticles: Particle[] = [];
        const numParticles = tree.branches * 2;
        for (let i = 0; i < numParticles; i++) {
            newParticles.push({
                angle: seededRandom(tree.seed + i) * Math.PI * 2,
                radius: 15 + seededRandom(tree.seed + i * 2) * 15,
                speed: (seededRandom(tree.seed + i * 3) - 0.5) * 0.02,
                size: 1 + seededRandom(tree.seed + i * 4) * 1.5,
            });
        }
        currentAnimatedTrees.set(id, { 
            ...tree, 
            currentGrowth: 0, 
            wiggleIntensity: 0, 
            wigglePhase: 0, 
            swayPhase: Math.random() * Math.PI * 2,
            swayIntensity: 0.01 + Math.random() * 0.02,
            growthRate: 0.015 + Math.random() * 0.01, // Slower growth rate
            particles: newParticles 
        });
      } else {
        const existing = currentAnimatedTrees.get(id)!;
        const wasWatered = tree.targetGrowth > existing.targetGrowth;
        const branchesIncreased = tree.branches > existing.branches;
        
        let updatedParticles = existing.particles;
        if (branchesIncreased) {
            const newParticleCount = (tree.branches - existing.branches) * 2;
            for (let i = 0; i < newParticleCount; i++) {
                updatedParticles.push({
                    angle: Math.random() * Math.PI * 2,
                    radius: 15 + Math.random() * 15,
                    speed: (Math.random() - 0.5) * 0.02,
                    size: 1 + Math.random() * 1.5,
                });
            }
        }

        currentAnimatedTrees.set(id, { 
            ...existing, 
            x: tree.x, // Ensure x position is updated from props
            targetGrowth: tree.targetGrowth, 
            branches: tree.branches,
            particles: updatedParticles,
            wiggleIntensity: wasWatered ? 1.0 : (existing.wiggleIntensity || 0),
            wigglePhase: wasWatered ? Math.random() * Math.PI * 2 : (existing.wigglePhase || 0),
        });
      }
    });
    
  }, [trees]);

  useEffect(() => {
    if (waterEventId === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width / 2;
    const startY = canvas.height;
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 3 + Math.random() * 5;
        const life = 80 + Math.random() * 40;
        waterParticlesRef.current.push({
            id: Math.random(),
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: life,
            maxLife: life,
            size: 1 + Math.random() * 2,
        });
    }

  }, [waterEventId]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    const getTreeAtPos = (x: number, y: number): AnimatedTree | undefined => {
        const CLICK_RADIUS = 20; // Increased radius for easier touch interaction
        // FIX: Add explicit type to `treesArray` to fix type inference issue on iterated array.
        const treesArray: AnimatedTree[] = Array.from(animatedTreesRef.current.values()).reverse();
        for (const tree of treesArray) {
            const trunkHeight = tree.currentGrowth * 40;
            const trunkTopY = tree.y - trunkHeight;
            if (Math.abs(x - tree.x) < CLICK_RADIUS && y >= trunkTopY && y <= tree.y) {
                return tree;
            }
        }
        return undefined;
    };
    
    const handleMouseDown = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const clickedTree = getTreeAtPos(x, y);

        if (clickedTree) {
            draggedTreeRef.current = clickedTree;
            dragStartPosRef.current = { x: event.clientX, y: event.clientY };
            canvas.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (draggedTreeRef.current && dragStartPosRef.current) {
            const draggedTree = animatedTreesRef.current.get(draggedTreeRef.current.id);
            if(draggedTree) {
                const dx = event.clientX - dragStartPosRef.current.x;
                draggedTree.x = draggedTreeRef.current.x + dx;
            }
        } else {
             const treeUnderMouse = getTreeAtPos(mouseX, mouseY);
             canvas.style.cursor = treeUnderMouse ? 'grab' : 'default';
        }
    };

    const handleMouseUp = (event: MouseEvent) => {
        const draggedTree = draggedTreeRef.current;
        const startPos = dragStartPosRef.current;
        
        if (draggedTree && startPos) {
            const dist = Math.hypot(event.clientX - startPos.x, event.clientY - startPos.y);
            
            const finalTreeState = animatedTreesRef.current.get(draggedTree.id);

            if (dist > 5) { // Dragged
                if(finalTreeState) onTreeMove(finalTreeState.id, finalTreeState.x);
            } else { // Clicked
                onTreeSelect(draggedTree);
            }
        }

        draggedTreeRef.current = null;
        dragStartPosRef.current = null;
        const rect = canvas.getBoundingClientRect();
        canvas.style.cursor = getTreeAtPos(event.clientX - rect.left, event.clientY - rect.top) ? 'grab' : 'default';
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const touchedTree = getTreeAtPos(x, y);
        if (touchedTree) {
          draggedTreeRef.current = touchedTree;
          dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (draggedTreeRef.current && dragStartPosRef.current && event.touches.length > 0) {
        event.preventDefault();
        const touch = event.touches[0];
        const draggedTree = animatedTreesRef.current.get(draggedTreeRef.current.id);
        if (draggedTree) {
          const dx = touch.clientX - dragStartPosRef.current.x;
          draggedTree.x = draggedTreeRef.current.x + dx;
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const draggedTree = draggedTreeRef.current;
      const startPos = dragStartPosRef.current;

      if (draggedTree && startPos && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const dist = Math.hypot(touch.clientX - startPos.x, touch.clientY - startPos.y);
        const finalTreeState = animatedTreesRef.current.get(draggedTree.id);

        if (dist > 10) { // Dragged
          if (finalTreeState) onTreeMove(finalTreeState.id, finalTreeState.x);
        } else { // Tapped
          onTreeSelect(draggedTree);
        }
      }
      draggedTreeRef.current = null;
      dragStartPosRef.current = null;
    };


    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    const drawBranch = (
      x: number, y: number, angle: number, length: number, depth: number, 
      maxDepth: number, treeSeed: number, maxBranches: number,
      wiggleIntensity: number, wigglePhase: number, 
      swayIntensity: number, swayPhase: number, fileType: string
    ) => {
      // styles...
      const style = {
        branchColor: 'rgba(80, 254, 213, 0.7)',
        blossomColor: 'rgba(255, 106, 90, 0.8)',
        blossomShadow: '#FF6A5A',
        useCurves: true,
        branchBendFactor: seededRandom(treeSeed * depth) * 2 - 1,
        angleVariance: 1.2,
        lengthReduction: 0.65 + seededRandom(treeSeed * 2 + depth) * 0.2,
        drawBlossom: (x: number, y: number, size: number) => {
          ctx.arc(x, y, size, 0, Math.PI * 2);
        }
      };
      switch (fileType) {
        case 'image':
          style.branchColor = 'rgba(122, 92, 255, 0.8)';
          style.blossomColor = 'rgba(255, 180, 90, 0.9)';
          style.blossomShadow = '#FFB45A';
          style.drawBlossom = (x, y, size) => {
              for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                ctx.moveTo(x, y);
                ctx.arc(x + Math.cos(a) * size * 1.5, y + Math.sin(a) * size * 1.5, size, 0, Math.PI * 2);
              }
          };
          break;
        case 'text':
          style.branchColor = 'rgba(200, 220, 255, 0.7)';
          style.blossomColor = 'rgba(220, 230, 255, 0.9)';
          style.blossomShadow = '#DCECFF';
          style.branchBendFactor *= 0.2;
          style.angleVariance = 0.8;
          break;
        case 'code':
          style.branchColor = 'rgba(80, 220, 254, 0.8)';
          style.blossomColor = 'rgba(80, 254, 213, 1)';
          style.blossomShadow = '#50FED5';
          style.useCurves = false;
          style.angleVariance = 1.57;
          style.drawBlossom = (x, y, size) => {
            ctx.rect(x - size, y - size, size * 2, size * 2);
          };
          break;
        case 'media':
          style.branchColor = 'rgba(255, 106, 90, 0.7)';
          style.blossomColor = 'rgba(255, 136, 120, 0.9)';
          style.blossomShadow = '#FF8878';
          style.branchBendFactor *= 1.5;
          style.angleVariance = 1.5;
          break;
      }
      if (depth > maxDepth || length < 2) {
        if (length > 1) {
          ctx.beginPath();
          ctx.fillStyle = style.blossomColor;
          ctx.shadowColor = style.blossomShadow;
          ctx.shadowBlur = 10;
          style.drawBlossom(x, y, 1.5 + wiggleIntensity * 1.5);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x, y);
      const waterWiggleAmount = wiggleIntensity > 0 ? Math.sin(wigglePhase + depth * 0.5) * 0.2 * wiggleIntensity : 0;
      const constantSwayAmount = Math.sin(swayPhase + depth * 0.3) * swayIntensity;
      const finalAngle = angle + waterWiggleAmount + constantSwayAmount;
      const endX = x + Math.cos(finalAngle) * length;
      const endY = y + Math.sin(finalAngle) * length;
      if (style.useCurves) {
        const controlPointOffset = length * 0.4 * style.branchBendFactor;
        const controlX = (x + endX) / 2 + Math.cos(finalAngle + Math.PI / 2) * controlPointOffset;
        const controlY = (y + endY) / 2 + Math.sin(finalAngle + Math.PI / 2) * controlPointOffset;
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      } else {
        ctx.lineTo(endX, endY);
      }
      ctx.strokeStyle = style.branchColor;
      ctx.lineWidth = Math.max(0.5, (maxDepth - depth + 1) * 0.8);
      ctx.lineCap = 'round';
      ctx.stroke();
      const branchCount = depth === 0 ? maxBranches : Math.floor(seededRandom(treeSeed * depth * x) * 1.5) + 1;
      for (let i = 0; i < branchCount; i++) {
          const newAngle = finalAngle + (seededRandom(treeSeed * i * y + depth) - 0.5) * style.angleVariance;
          const newLength = length * style.lengthReduction;
          drawBranch(endX, endY, newAngle, newLength, depth + 1, maxDepth, treeSeed, maxBranches, wiggleIntensity, wigglePhase, swayIntensity, swayPhase, fileType);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      animatedTreesRef.current.forEach(tree => {
        if (tree.currentGrowth < tree.targetGrowth) {
          tree.currentGrowth += (tree.targetGrowth - tree.currentGrowth) * tree.growthRate;
        }
        if (tree.wiggleIntensity > 0) {
            tree.wiggleIntensity *= 0.98;
            tree.wigglePhase += 0.1;
        }
        tree.swayPhase += 0.01;
        const maxDepth = Math.floor(tree.currentGrowth * 1.5) + 1;
        const initialLength = tree.currentGrowth * 30;
        if (tree.isVerified) {
          ctx.shadowColor = 'rgba(80, 254, 213, 0.7)';
          ctx.shadowBlur = 15;
        }
        drawBranch(tree.x, tree.y, -Math.PI / 2, initialLength, 0, maxDepth, tree.seed, tree.branches, tree.wiggleIntensity, tree.wigglePhase, tree.swayIntensity, tree.swayPhase, tree.fileType);
        ctx.shadowBlur = 0;

        // Draw particles
        const trunkHeight = tree.currentGrowth * 30;
        const canopyCenterY = tree.y - trunkHeight * 0.8;
        const canopyCenterX = tree.x;
        ctx.fillStyle = 'rgba(80, 254, 213, 0.8)';
        ctx.shadowColor = 'rgba(80, 254, 213, 1)';
        ctx.shadowBlur = 8;
        tree.particles.forEach(p => {
            p.angle += p.speed;
            const orbitRadius = p.radius + tree.currentGrowth * 3;
            const x = canopyCenterX + Math.cos(p.angle) * orbitRadius;
            const y = canopyCenterY + Math.sin(p.angle) * orbitRadius * 0.6;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
      });
      
      // Draw water particles
      ctx.fillStyle = 'rgba(80, 254, 213, 0.9)';
      ctx.shadowColor = '#50FED5';
      ctx.shadowBlur = 10;
      const currentParticles = waterParticlesRef.current;
      for (let i = currentParticles.length - 1; i >= 0; i--) {
          const p = currentParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // Gravity
          p.life--;
          if (p.life <= 0) {
              currentParticles.splice(i, 1);
              continue;
          }
          const opacity = p.life / p.maxLife;
          ctx.globalAlpha = Math.max(0, opacity);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    observer.observe(parent);
    
    resizeCanvas(); // Set initial size

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
        observer.disconnect();
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onTreeSelect, onTreeMove]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};