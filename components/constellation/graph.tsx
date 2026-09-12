"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type Node,
  type EdgeMouseHandler,
  type OnNodeDrag,
  type NodeMouseHandler,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConnectionEdge as ConnectionEdgeComponent } from "./connection-edge";
import { CATEGORY_GLYPH, type ConnectionEdge, type StudentNode } from "./graph-types";
import { NODE_SIZE, StudentNode as StudentNodeComponent } from "./student-node";
import { usePhysics } from "./use-physics";
import { EDGE_CATEGORIES } from "@/lib/matching";
import { layoutConstellation } from "@/lib/layout";
import { buildPassport } from "@/lib/passport";
import type { StudentRecord } from "@/lib/seed-data";
import type { Connection } from "@/lib/types";

// Defined once at module scope — re-creating these objects on every render is
// the classic React Flow performance bug.
const nodeTypes = { student: StudentNodeComponent };
const edgeTypes = { connection: ConnectionEdgeComponent };

export type GraphProps = {
  students: readonly StudentRecord[];
  connections: readonly Connection[];
  selectedStudentId: string | null;
  selectedConnectionId: string | null;
  currentStudentId: string | null;
  /** Student ids that survive the active filter; null means "no filter". */
  filteredIds: ReadonlySet<string> | null;
  onSelectStudent: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
};

export function ConstellationGraph(props: GraphProps) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}

function GraphInner({
  students,
  connections,
  selectedStudentId,
  selectedConnectionId,
  currentStudentId,
  filteredIds,
  onSelectStudent,
  onSelectConnection,
}: GraphProps) {
  const { setCenter, fitView } = useReactFlow();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /**
   * What the view is focused on. Selection wins over hover so a chosen student
   * stays centred while the pointer wanders.
   */
  const focusId = selectedStudentId ?? hoveredId;

  const visibleConnections = useMemo(
    () => connections.filter((c) => c.status !== "dismissed"),
    [connections],
  );

  const positions = useMemo(
    () =>
      layoutConstellation(
        students.map((r) => ({ id: r.student.id })),
        visibleConnections.map((c) => ({
          source: c.studentAId,
          target: c.studentBId,
          weight: c.score / 6,
        })),
      ),
    [students, visibleConnections],
  );

  /** Neighbours of the focused student — drives dimming for hover and selection alike. */
  const neighbourIds = useMemo(() => {
    if (!focusId) return null;
    const set = new Set<string>([focusId]);
    for (const c of visibleConnections) {
      if (c.studentAId === focusId) set.add(c.studentBId);
      if (c.studentBId === focusId) set.add(c.studentAId);
    }
    return set;
  }, [focusId, visibleConnections]);

  const derivedNodes: StudentNode[] = useMemo(
    () =>
      students.map((record, index) => {
        const id = record.student.id;
        const position = positions[id] ?? { x: 0, y: 0 };
        const outOfFocus = neighbourIds ? !neighbourIds.has(id) : false;
        const outOfFilter = filteredIds ? !filteredIds.has(id) : false;
        return {
          id,
          type: "student" as const,
          position: { x: position.x - NODE_SIZE / 2, y: position.y - NODE_SIZE / 2 },
          data: {
            passport: buildPassport(record.student, record.answers),
            isCurrent: id === currentStudentId,
            dimmed: outOfFocus || outOfFilter,
            focused: id === focusId,
            index,
          },
          selected: id === selectedStudentId,
          draggable: true,
          connectable: false,
          // Explicit size so React Flow centres the node on its layout point.
          width: NODE_SIZE,
          height: NODE_SIZE,
        };
      }),
    [students, positions, neighbourIds, filteredIds, currentStudentId, selectedStudentId, focusId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<StudentNode>([]);

  /**
   * Sync derived DATA (focus, dimming, filter) into node state without ever
   * clobbering positions — those belong to the drag and the physics loop.
   */
  useEffect(() => {
    setNodes((prev) => {
      const prevPositions = new Map(prev.map((n) => [n.id, n.position]));
      return derivedNodes.map((n) => ({
        ...n,
        position: prevPositions.get(n.id) ?? n.position,
      }));
    });
  }, [derivedNodes, setNodes]);

  const edges: ConnectionEdge[] = useMemo(
    () =>
      visibleConnections.map((connection) => {
        const category = connection.reasons[0]?.category ?? "academic";
        const touchesSelection = neighbourIds
          ? connection.studentAId === focusId || connection.studentBId === focusId
          : false;
        const passesFilter = filteredIds
          ? filteredIds.has(connection.studentAId) && filteredIds.has(connection.studentBId)
          : true;
        return {
          id: connection.id,
          type: "connection" as const,
          source: connection.studentAId,
          target: connection.studentBId,
          selected: connection.id === selectedConnectionId,
          // Wider than the 1.5px stroke so lines are comfortably clickable.
          interactionWidth: 26,
          data: {
            category,
            confirmed: connection.status === "confirmed",
            dimmed: (neighbourIds ? !touchesSelection : false) || !passesFilter,
            highlighted: touchesSelection,
            categoryLabel: EDGE_CATEGORIES[category].label,
            glyph: CATEGORY_GLYPH[category],
          },
        };
      }),
    [visibleConnections, neighbourIds, focusId, selectedConnectionId, filteredIds],
  );

  // Centre on the selected student (spec §7.6), or refit when nothing is chosen.
  useEffect(() => {
    if (selectedStudentId && positions[selectedStudentId]) {
      const { x, y } = positions[selectedStudentId];
      setCenter(x, y, { zoom: 1.05, duration: 600 });
    } else {
      fitView({ padding: 0.18, duration: 500 });
    }
  }, [selectedStudentId, positions, setCenter, fitView]);

  const physics = usePhysics({
    seedPositions: positions,
    connections: visibleConnections,
    // Honour reduced motion: the graph stays draggable, it just does not drift.
    enabled: !prefersReducedMotion,
    nodeOffset: NODE_SIZE / 2,
    setNodes: setNodes as unknown as React.Dispatch<React.SetStateAction<Node[]>>,
  });

  const handleDragStart: OnNodeDrag<StudentNode> = useCallback(
    (_e, node) => physics.onDragStart(node.id),
    [physics],
  );
  const handleDrag: OnNodeDrag<StudentNode> = useCallback(
    (_e, node) => physics.onDrag(node.id, node.position),
    [physics],
  );
  const handleDragStop: OnNodeDrag<StudentNode> = useCallback(
    (_e, node) => physics.onDragStop(node.id),
    [physics],
  );

  const handleNodeEnter: NodeMouseHandler<StudentNode> = useCallback(
    (_event, node) => setHoveredId(node.id),
    [],
  );
  const handleNodeLeave = useCallback(() => setHoveredId(null), []);

  const handleNodeClick: NodeMouseHandler<StudentNode> = (_event, node) => {
    onSelectConnection(null);
    onSelectStudent(node.id === selectedStudentId ? null : node.id);
  };

  const handleEdgeClick: EdgeMouseHandler<ConnectionEdge> = (_event, edge) => {
    onSelectConnection(edge.id === selectedConnectionId ? null : edge.id);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={handleNodeEnter}
      onNodeMouseLeave={handleNodeLeave}
      onNodeDragStart={handleDragStart}
      onNodeDrag={handleDrag}
      onNodeDragStop={handleDragStop}
      onEdgeClick={handleEdgeClick}
      onPaneClick={() => {
        onSelectStudent(null);
        onSelectConnection(null);
      }}
      nodesConnectable={false}
      elementsSelectable
      edgesFocusable
      minZoom={0.35}
      maxZoom={2}
      fitView
      fitViewOptions={{ padding: 0.18 }}
    >
      <Background variant={BackgroundVariant.Dots} gap={34} size={1} color="var(--orbit-line)" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}
