import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ClanMember, Gender } from '../types';
import { hierarchy, tree } from 'd3-hierarchy';
import { Search, ZoomIn, ZoomOut, Move, UserPlus, ChevronDown, ChevronRight, PlusCircle, HeartPulse, Maximize, Minimize, Smartphone } from 'lucide-react';

interface FamilyTreeProps {
  members: ClanMember[];
  onSelectMember: (memberId: string) => void;
  selectedMemberId?: string;
  onAddMember?: (parentId: string, type: 'child' | 'spouse') => void;
}

export default function FamilyTree({ members, onSelectMember, selectedMemberId, onAddMember }: FamilyTreeProps) {
  // Navigation translation states
  const [transform, setTransform] = useState({ x: 150, y: 30, scale: 0.75 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<any>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterGeneration, setFilterGeneration] = useState('ALL');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  // Collapse states
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const resetPan = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTransform({ x: width / 2 - 800 * 0.75, y: 60, scale: 0.75 });
    } else {
      setTransform({ x: 150, y: 30, scale: 0.75 });
    }
    setIsRotated(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      resetPan();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Compute all branches in the clan for search option list
  const branchOptions = useMemo(() => {
    const branches = new Set<string>();
    members.forEach(m => {
      if (m.branchId) branches.add(m.branchId);
    });
    return Array.from(branches);
  }, [members]);

  const maxGeneration = useMemo(() => {
    if (!members || members.length === 0) return 5;
    return Math.max(...members.map(m => m.generation || 1), 5);
  }, [members]);
  
  const generationsList = useMemo(() => {
    return Array.from({ length: maxGeneration }, (_, i) => i + 1);
  }, [maxGeneration]);

  // Track the highlight node IDs based on search
  const highlightedIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    const matches = members.filter(m => 
      m.fullName.toLowerCase().includes(q) ||
      (m.nickname && m.nickname.toLowerCase().includes(q)) ||
      (m.profession && m.profession.toLowerCase().includes(q))
    );
    return new Set(matches.map(m => m.id));
  }, [searchQuery, members]);

  // Unified Family Tree Logic (Family Units)
  const layoutData = useMemo(() => {
    const positions: Record<string, { x: number; y: number; data: any }> = {};
    const primaryMembersMap = new Map<string, ClanMember>();
    const spouseToPrimaryMap = new Map<string, string>();
    const nodeDescendants: Record<string, number> = {};
    
    if (members.length === 0) return { positions, hierarchyNodes: {}, primaryMembersMap, spouseToPrimaryMap, nodeDescendants };

    // 1. Identify bloodline (has parents)
    const hasParents = new Set<string>();
    members.forEach(m => {
      if (m.fatherId || m.motherId) hasParents.add(m.id);
    });

    // 2. Group into Family Units
    const processed = new Set<string>();
    members.forEach(m => {
      if (processed.has(m.id)) return;
      
      const relatedSpouses = members.filter(other => other.spouseId === m.id || m.spouseId === other.id);
      if (relatedSpouses.length > 0) {
        const cluster = [m, ...relatedSpouses];
        let primary = cluster.find(c => hasParents.has(c.id)) || cluster.find(c => c.gender === Gender.MALE) || cluster[0];
        
        primaryMembersMap.set(primary.id, primary);
        cluster.forEach(c => {
           if (c.id !== primary.id) {
              spouseToPrimaryMap.set(c.id, primary.id);
           }
           processed.add(c.id);
        });
      } else {
        primaryMembersMap.set(m.id, m);
        processed.add(m.id);
      }
    });

    // 3. Build Node Hierarchy
    const buildNode = (primaryId: string): any => {
      const primary = primaryMembersMap.get(primaryId)!;
      const spouses = members.filter(m => spouseToPrimaryMap.get(m.id) === primaryId);
      
      const allParentIds = new Set([primaryId, ...spouses.map(s => s.id)]);
      const childMembers = members.filter(m => 
        (m.fatherId && allParentIds.has(m.fatherId)) || 
        (m.motherId && allParentIds.has(m.motherId))
      ).sort((a, b) => {
        const orderA = a.birthOrder !== undefined ? a.birthOrder : Infinity;
        const orderB = b.birthOrder !== undefined ? b.birthOrder : Infinity;
        return orderA - orderB;
      });

      // Map children to their primary identity (if they have spouses, we only link to the primary of their unit)
      const childPrimaryIds = childMembers.map(c => {
         return spouseToPrimaryMap.has(c.id) ? spouseToPrimaryMap.get(c.id)! : c.id;
      }).filter((v, i, a) => a.indexOf(v) === i); // unique

      const node: any = { 
        id: primaryId,
        primary,
        spouses
      };

      if (childPrimaryIds.length > 0) {
        if (collapsedNodes.has(primaryId)) {
          node._children = childPrimaryIds.map(id => buildNode(id));
        } else {
          node.children = childPrimaryIds.map(id => buildNode(id));
        }
      }
      return node;
    };

    const rootMembers = Array.from(primaryMembersMap.values()).filter(m => !m.fatherId && !m.motherId);
    const rootPrimaryIds = rootMembers.map(m => spouseToPrimaryMap.has(m.id) ? spouseToPrimaryMap.get(m.id)! : m.id).filter((v, i, a) => a.indexOf(v) === i);

    const hierarchyData = {
       id: 'VIRTUAL_ROOT',
       children: rootPrimaryIds.map(id => buildNode(id))
    };

    const hierarchyNodes: Record<string, any> = {};

    try {
      const root = hierarchy(hierarchyData, d => d.children);

      // Setup D3 tree layout with dynamic nodeSize for exact pixel spacing
      const treeLayout = tree<any>()
        .nodeSize([1, 260])
        .separation((a, b) => {
           const getWidth = (node: any) => {
              const membersCount = 1 + (node.data.spouses ? node.data.spouses.length : 0);
              return membersCount * 160 + (membersCount - 1) * 16;
           };
           const wA = getWidth(a);
           const wB = getWidth(b);
           const gap = a.parent === b.parent ? 40 : 80;
           return (wA + wB) / 2 + gap;
        });

      treeLayout(root);

      let minY = Infinity;
      root.each(node => {
        if (node.data.id !== 'VIRTUAL_ROOT' && node.y < minY) {
          minY = node.y;
        }
      });

      // Count descendants
      // Count descendants based on the original data since D3 nodes hide _children
      const countDescendantsData = (dataNode: any): number => {
         let count = dataNode.children ? dataNode.children.length : (dataNode._children ? dataNode._children.length : 0);
         if (dataNode.children) {
            dataNode.children.forEach((c: any) => count += countDescendantsData(c));
         } else if (dataNode._children) {
            dataNode._children.forEach((c: any) => count += countDescendantsData(c));
         }
         return count;
      };

      root.each(node => {
        if (node.data.id === 'VIRTUAL_ROOT') return;
        
        const px = node.x + 800; // Shift right to avoid negative coords initially
        const py = node.y - minY + 120;
        
        positions[node.data.id] = { x: px, y: py, data: node.data };
        hierarchyNodes[node.data.id] = node;
        nodeDescendants[node.data.id] = countDescendantsData(node.data);
      });
    } catch (e) {
      console.error("D3 Tree layout error:", e);
    }

    return { positions, hierarchyNodes, primaryMembersMap, spouseToPrimaryMap, nodeDescendants };
  }, [members, collapsedNodes]);

  const lineConnections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; parentId: string; childId: string }[] = [];
    const { positions, hierarchyNodes } = layoutData;

    Object.values(hierarchyNodes).forEach((node: any) => {
      if (node.children) {
        const pPos = positions[node.data.id];
        if (!pPos) return;
        node.children.forEach((child: any) => {
          const cPos = positions[child.data.id];
          if (!cPos) return;
          const hasSpouses = child.data.spouses && child.data.spouses.length > 0;
          lines.push({
            x1: pPos.x,
            y1: pPos.y + 82, // from bottom of parent's collapse button
            x2: cPos.x,
            y2: cPos.y - (hasSpouses ? 70 : 40), // to top of child container/card
            parentId: node.data.id,
            childId: child.data.id
          });
        });
      }
    });

    return lines;
  }, [layoutData]);

  // Mouse Handlers for Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile Pan & Pinch Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('select')) return;
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      const cx = (touch1.clientX + touch2.clientX) / 2;
      const cy = (touch1.clientY + touch2.clientY) / 2;
      
      let mx = cx, my = cy;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mx = cx - rect.left;
        my = cy - rect.top;
      }
      
      dragStart.current = { 
        ...dragStart.current, 
        initialPinchDist: dist, 
        initialScale: transform.scale,
        initialX: transform.x,
        initialY: transform.y,
        pinchX: mx,
        pinchY: my
      };
      return;
    }

    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { ...dragStart.current, x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      if (dragStart.current.initialPinchDist) {
        const scaleChange = dist / dragStart.current.initialPinchDist;
        let newScale = dragStart.current.initialScale * scaleChange;
        newScale = Math.max(0.3, Math.min(newScale, 2.0));
        
        const ratio = newScale / dragStart.current.initialScale;
        const newX = dragStart.current.pinchX - (dragStart.current.pinchX - dragStart.current.initialX) * ratio;
        const newY = dragStart.current.pinchY - (dragStart.current.pinchY - dragStart.current.initialY) * ratio;
        
        setTransform(prev => ({ x: newX, y: newY, scale: newScale }));
      }
      return;
    }

    if (!isDragging || e.touches.length !== 1) return;
    setTransform(prev => ({
      ...prev,
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStart.current.initialPinchDist = undefined;
  };

  // Zoom Controllers
  const zoomToPoint = (scaleFactor: number) => {
    setTransform(prev => {
      const newScale = Math.max(0.3, Math.min(prev.scale * scaleFactor, 2.0));
      if (newScale === prev.scale) return prev;
      
      let mx = 0, my = 0;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mx = rect.width / 2;
        my = rect.height / 2;
      }

      const ratio = newScale / prev.scale;
      const newX = mx - (mx - prev.x) * ratio;
      const newY = my - (my - prev.y) * ratio;
      return { x: newX, y: newY, scale: newScale };
    });
  };

  const zoomIn = () => zoomToPoint(1.2);
  const zoomOut = () => zoomToPoint(0.8);

  // Native wheel event listener to properly preventDefault (React's onWheel is passive)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setTransform(prev => {
        const newScale = Math.max(0.3, Math.min(prev.scale * zoomFactor, 2.0));
        if (newScale === prev.scale) return prev;
        
        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const ratio = newScale / prev.scale;
        const newX = mx - (mx - prev.x) * ratio;
        const newY = my - (my - prev.y) * ratio;
        return { x: newX, y: newY, scale: newScale };
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const getRoleLabel = (member: ClanMember, isPrimary: boolean) => {
     if (isPrimary) {
        if (member.generation === 1) return member.gender === Gender.MALE ? 'Cụ Khởi Tổ' : 'Cụ Bà';
        if (member.birthOrder) {
           if (member.birthOrder === 1) return member.gender === Gender.MALE ? 'Trưởng nam' : 'Trưởng nữ';
           if (member.birthOrder === 10) return member.gender === Gender.MALE ? 'Nam út' : 'Nữ út';
           return member.gender === Gender.MALE ? `Thứ nam ${member.birthOrder}` : `Thứ nữ ${member.birthOrder}`;
        }
        return member.gender === Gender.MALE ? 'Con trai' : 'Con gái';
     } else {
        if (member.generation === 1) return member.gender === Gender.MALE ? 'Cụ Ông' : 'Cụ Bà';
        return member.gender === Gender.MALE ? 'Con rể' : 'Con dâu';
     }
  };

  const layoutPositions = layoutData.positions;

  const drawOrthogonalLine = (x1: number, y1: number, x2: number, y2: number, r: number = 12) => {
    if (Math.abs(x1 - x2) < 1) return `M${x1},${y1} L${x2},${y2}`;
    const midY = Math.round((y1 + y2) / 2);
    const dirX = x1 < x2 ? 1 : -1;
    const dirY1 = y1 < midY ? 1 : -1;
    const dirY2 = midY < y2 ? 1 : -1;
    const safeR = Math.min(r, Math.abs(x1 - x2) / 2, Math.abs(midY - y1) / 2, Math.abs(y2 - midY) / 2);
    return `M${x1},${y1} L${x1},${midY - dirY1 * safeR} Q${x1},${midY} ${x1 + dirX * safeR},${midY} L${x2 - dirX * safeR},${midY} Q${x2},${midY} ${x2},${midY + dirY2 * safeR} L${x2},${y2}`;
  };

  return (
    <div className={isFullscreen 
      ? "fixed inset-0 z-[100] bg-amber-50/95 dark:bg-zinc-950/95 backdrop-blur-md select-none"
      : "relative w-full border border-gray-200 dark:border-gray-800 rounded-3xl bg-amber-50/20 dark:bg-zinc-950 shadow-inner overflow-hidden select-none"
    }>
      
      {/* Top Controller Panel */}
      <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex flex-row flex-wrap sm:flex-nowrap ${isFullscreen ? 'gap-1.5 p-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 shadow' : 'gap-3 p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 shadow-lg'} backdrop-blur border border-gray-100 dark:border-zinc-800 transition-all`}>
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[120px]">
          <Search className={`absolute left-2.5 ${isFullscreen ? 'top-1.5 h-3.5 w-3.5' : 'top-2.5 h-4 w-4'} text-gray-500 dark:text-zinc-500`} />
          <input
            type="text"
            placeholder={isFullscreen ? "Tìm..." : "Tìm theo tên, đời, nghề nghiệp..."}
            className={`w-full ${isFullscreen ? 'pl-7 pr-2 py-1 text-xs' : 'pl-9 pr-4 py-1.5 text-sm'} rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-950/80 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-zinc-100`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Branch Filter */}
        <select
          className={`${isFullscreen ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-950/80 focus:outline-none dark:text-zinc-100`}
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
        >
          <option value="ALL">Tất cả Chi</option>
          {branchOptions.map(b => (
            <option key={b} value={b}>{b === 'CHI_TRUONG' ? 'Trưởng' : 'Thứ 1'}</option>
          ))}
        </select>

        {/* Generation Filter */}
        <select
          className={`${isFullscreen ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-950/80 focus:outline-none dark:text-zinc-100`}
          value={filterGeneration}
          onChange={(e) => setFilterGeneration(e.target.value)}
        >
          <option value="ALL">Tất cả Đời</option>
          {generationsList.map(gen => (
            <option key={gen} value={String(gen)}>Đời {gen}</option>
          ))}
        </select>

        {/* Zoom Controls Buttons */}
        <div className={`flex gap-1 sm:gap-2 items-center ${!isFullscreen ? 'border-l dark:border-zinc-800 pl-2 sm:pl-3' : 'pl-1'}`}>
          <button type="button" onClick={zoomIn} className={`${isFullscreen ? 'p-1' : 'p-1.5'} rounded-lg bg-gray-100/80 dark:bg-zinc-800/80 hover:bg-amber-100 transition-all`}>
            <ZoomIn className={`${isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-gray-700 dark:text-zinc-300`} />
          </button>
          <button type="button" onClick={zoomOut} className={`${isFullscreen ? 'p-1' : 'p-1.5'} rounded-lg bg-gray-100/80 dark:bg-zinc-800/80 hover:bg-amber-100 transition-all`}>
            <ZoomOut className={`${isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-gray-700 dark:text-zinc-300`} />
          </button>
          <button type="button" onClick={resetPan} className={`${isFullscreen ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium shadow transition-all whitespace-nowrap`}>
            Mặc định
          </button>
          <button type="button" onClick={() => setIsRotated(!isRotated)} className={`${isFullscreen ? 'p-1' : 'p-1.5'} rounded-lg ${isRotated ? 'bg-amber-100 text-amber-600' : 'bg-gray-100/80 dark:bg-zinc-800/80'} hover:bg-amber-200 transition-all sm:ml-1`} title="Xoay dọc/ngang">
            <Smartphone className={`${isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${isRotated ? 'text-amber-600' : 'text-gray-700 dark:text-zinc-300'}`} />
          </button>
          <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className={`${isFullscreen ? 'p-1' : 'p-1.5'} rounded-lg bg-gray-100/80 dark:bg-zinc-800/80 hover:bg-amber-100 transition-all sm:ml-0.5`} title="Phóng to toàn màn hình">
            {isFullscreen ? <Minimize className={`${isFullscreen ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-gray-700 dark:text-zinc-300`} /> : <Maximize className="h-4 w-4 text-gray-700 dark:text-zinc-300" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas View */}
      <div 
        ref={containerRef}
        className={`relative overflow-hidden w-full ${isFullscreen ? 'h-screen' : 'h-[650px]'} cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Sticky Generation Labels */}
        <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none z-20 overflow-hidden">
          {generationsList.map((gen) => {
            const trackY = 120 + (gen - 1) * 260;
            const screenY = transform.y + trackY * transform.scale;
            
            if (screenY < -50 || screenY > 700) return null;

            return (
              <div key={gen} 
                className="absolute left-4 h-6 px-3 bg-amber-50 dark:bg-zinc-900 border border-amber-200 dark:border-zinc-700 rounded shadow-sm flex items-center justify-center transition-all duration-75"
                style={{ 
                  top: `${screenY - 12}px`, 
                  transform: `scale(${Math.max(0.7, Math.min(1, transform.scale))})`, 
                  transformOrigin: 'left center',
                  opacity: filterGeneration !== 'ALL' && filterGeneration !== String(gen) ? 0.15 : 0.9
                }}
              >
                <span className="text-amber-800 dark:text-amber-400 font-sans text-[11px] font-bold">
                  Thế Hệ Đời thứ {gen}
                </span>
              </div>
            );
          })}
        </div>

        <svg className="w-full h-full">
          <g style={{ 
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) ${isRotated ? 'rotate(90deg)' : 'rotate(0deg)'}`, 
            transformOrigin: isRotated ? '400px 400px' : '0 0', 
            transition: isDragging ? 'none' : 'transform 0.25s ease-out' 
          }}>
            {/* Generation Background Tracks */}
          {generationsList.map((gen) => {
            const trackY = 120 + (gen - 1) * 260;
            return (
              <g key={gen} style={{ opacity: filterGeneration !== 'ALL' && filterGeneration !== String(gen) ? 0.15 : 1 }}>
                <line x1="-3000" y1={trackY} x2="4000" y2={trackY} stroke="#e2e8f0" strokeDasharray="4 8" strokeWidth="1.5" className="stroke-gray-200 dark:stroke-zinc-800" />
              </g>
            );
          })}

          {/* Lines */}
          <g>
            {lineConnections.map((line, idx) => {
              const parent = members.find(m => m.id === line.parentId);
              const child = members.find(m => m.id === line.childId);
              
              let isDimmed = false;
              if (filterBranch !== 'ALL' && parent?.branchId !== filterBranch) isDimmed = true;
              if (filterGeneration !== 'ALL' && String(parent?.generation) !== filterGeneration && String(child?.generation) !== filterGeneration) isDimmed = true;

              return (
                  <path
                    key={idx}
                    d={drawOrthogonalLine(line.x1, line.y1, line.x2, line.y2)}
                    fill="none"
                    stroke="#b45309"
                    strokeWidth="2"
                    style={{ opacity: isDimmed ? 0.08 : 0.8 }}
                    className="stroke-amber-600 dark:stroke-amber-700"
                  />
              );
            })}
          </g>

          {/* Unified Family Unit Nodes */}
          <g>
            {Object.values(layoutPositions).map((pos: any) => {
              const { primary, spouses } = pos.data;
              const unitMembers = [primary, ...spouses];
              
              const cardWidth = 160;
              const cardHeight = 80;
              const gap = 16;
              const totalWidth = cardWidth * unitMembers.length + gap * (unitMembers.length - 1);
              const startX = -totalWidth / 2;

              let unitDimmed = false;
              if (filterBranch !== 'ALL' && primary.branchId !== filterBranch) unitDimmed = true;
              if (filterGeneration !== 'ALL' && String(primary.generation) !== filterGeneration) unitDimmed = true;

              return (
                <g key={primary.id} transform={`translate(${pos.x}, ${pos.y})`} className="group" style={{ opacity: unitDimmed ? 0.2 : 1 }}>
                  {/* Subtle Background for Couple */}
                  {spouses.length > 0 && (
                    <rect 
                      x={startX - 12} 
                      y={-cardHeight/2 - 30} 
                      width={totalWidth + 24} 
                      height={cardHeight + 50} 
                      rx="20" 
                      fill="#fbfcfd" 
                      className="dark:fill-zinc-900"
                      stroke="#cbd5e1" 
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Vertical stem connecting card bottom to collapse button */}
                  {layoutData.nodeDescendants[primary.id] > 0 && (
                    <line x1="0" y1="40" x2="0" y2="58" stroke="#b45309" strokeWidth="2" className="stroke-amber-600 dark:stroke-amber-700" />
                  )}

                  {unitMembers.map((member, idx) => {
                    const isHighlighted = highlightedIds.has(member.id);
                    const isSelected = selectedMemberId === member.id;
                    const cx = startX + idx * (cardWidth + gap) + cardWidth/2;
                    const cy = 0;

                    const borderTheme = member.isDeceased 
                      ? 'stroke-slate-400 dark:stroke-slate-600' 
                      : member.gender === Gender.MALE 
                        ? 'stroke-sky-500 dark:stroke-sky-600' 
                        : 'stroke-emerald-500 dark:stroke-emerald-600';
                    const bgTheme = member.isDeceased
                      ? 'fill-slate-50 dark:fill-slate-900'
                      : member.gender === Gender.MALE
                        ? 'fill-sky-50/95 dark:fill-sky-950/95'
                        : 'fill-emerald-50/95 dark:fill-emerald-950/95';
                    
                    const roleLabel = getRoleLabel(member, member.id === primary.id);
                    const isBloodline = member.id === primary.id;

                    return (
                      <g key={member.id} transform={`translate(${cx}, ${cy})`} className="cursor-pointer transition-transform duration-200" onClick={() => onSelectMember(member.id)}>
                        {(isSelected || isHighlighted) && (
                          <rect x="-84" y="-44" width="168" height="88" rx="16" fill="none" stroke={isSelected ? "#f59e0b" : "#3b82f6"} strokeWidth={isSelected ? "4" : "3"} strokeDasharray={isHighlighted && !isSelected ? "4 4" : "0"} className="animate-pulse" />
                        )}

                        <rect x="-80" y="-40" width="160" height="80" rx="12" className={`${bgTheme} ${borderTheme} transition-colors`} strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))" />

                        {/* Role Badge */}
                        <g transform={`translate(0, -50)`}>
                          <rect x="-40" y="0" width="80" height="20" rx="10" className={isBloodline ? "fill-amber-500" : (member.gender === Gender.MALE ? "fill-indigo-500" : "fill-pink-500")} />
                          <text x="0" y="14" textAnchor="middle" className="font-sans text-[10px] font-bold fill-white tracking-wider">{roleLabel}</text>
                        </g>

                        <g transform="translate(-50, 0)">
                          <circle cx="0" cy="0" r="18" fill="#e2e8f0" className="dark:fill-zinc-800" />
                        {member.avatarUrl ? (
                          <image href={member.avatarUrl} x="-18" y="-18" width="36" height="36" clipPath={`url(#avatar-clip-${member.id})`} preserveAspectRatio="xMidYMid slice" />
                        ) : (
                          <text x="0" y="5" textAnchor="middle" className="font-sans text-[16px] fill-gray-400 font-bold">{member.fullName.charAt(0)}</text>
                        )}
                        <defs><clipPath id={`avatar-clip-${member.id}`}><circle cx="0" cy="0" r="18" /></clipPath></defs>
                      </g>

                      <g>
                        <text x="-20" y="-10" className="font-sans text-xs font-bold fill-gray-900 dark:fill-zinc-100 select-none text-[11px]">
                          {member.fullName.length > 17 ? `${member.fullName.substring(0, 16)}.` : member.fullName}
                        </text>
                        <text x="-20" y="5" className="font-sans text-[9px] fill-gray-600 dark:fill-zinc-400">
                          {member.dob ? `SN: ${member.dob}` : 'Khuyết'} {member.isDeceased ? `- Mất: ${member.dod}` : ''}
                        </text>
                        <text x="-20" y="20" className="font-sans text-[8.5px] italic fill-amber-700 dark:fill-amber-400 truncate w-[90px]">
                          {member.profession || member.locationName || 'Nội trợ'}
                        </text>
                        {member.isDeceased && <text x="65" y="25" className="font-sans text-[10px]" title="Đã tạ thế">🕯️</text>}
                      </g>
                    </g>
                    );
                  })}

                  {/* Collapse / Add Child controls for the Family Unit */}
                  <g transform={`translate(0, ${cardHeight/2 + 30})`}>
                    {layoutData.nodeDescendants[primary.id] > 0 && (
                      <g onClick={(e) => { e.stopPropagation(); toggleCollapse(primary.id); }} className="cursor-pointer group">
                        <circle cx="0" cy="0" r="12" fill="#eab308" className="group-hover:fill-amber-600 transition-colors" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" />
                        <text x="0" y="4" textAnchor="middle" className="fill-white font-black text-[14px] group-hover:scale-110 transition-transform select-none">
                          {collapsedNodes.has(primary.id) ? '+' : '-'}
                        </text>
                        <title>{collapsedNodes.has(primary.id) ? 'Mở rộng nhánh con' : 'Thu gọn nhánh con'}</title>
                      </g>
                    )}
                    
                    {onAddMember && (
                      <g className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                        <rect x="-80" y="-12" width="160" height="30" fill="transparent" />
                        <g 
                          transform={`translate(${layoutData.nodeDescendants[primary.id] > 0 ? -28 : 0}, 0)`}
                          onClick={(e) => { e.stopPropagation(); onAddMember(primary.id, 'child'); }}
                          className="cursor-pointer group"
                        >
                          <circle cx="0" cy="0" r="11" fill="#3b82f6" className="group-hover:fill-blue-600 transition-colors" stroke="#ffffff" strokeWidth="1.5" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))" />
                          <text x="0" y="4" textAnchor="middle" className="fill-white font-bold text-[12px] group-hover:scale-110 transition-transform select-none">+</text>
                          <title>Thêm con ruột</title>
                        </g>
                        <g 
                          transform={`translate(${layoutData.nodeDescendants[primary.id] > 0 ? 28 : 28}, 0)`}
                          onClick={(e) => { e.stopPropagation(); onAddMember(primary.id, 'spouse'); }}
                          className="cursor-pointer group"
                        >
                          <circle cx="0" cy="0" r="11" fill="#ec4899" className="group-hover:fill-pink-600 transition-colors" stroke="#ffffff" strokeWidth="1.5" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))" />
                          <text x="0" y="3.5" textAnchor="middle" className="fill-white font-bold text-[12px] group-hover:scale-110 transition-transform select-none">♡</text>
                          <title>Thêm vợ/chồng</title>
                        </g>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
