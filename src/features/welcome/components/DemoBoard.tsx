'use client';

import React, { useMemo, useRef } from 'react';
import { ReactFlow, Node } from '@xyflow/react';
import { NODE_TYPES } from '@/features/board/constants/boardConstants';
import { useDemoNoteStore } from '@/stores/demoNoteStore';
import '@xyflow/react/dist/style.css';

const DemoBoard: React.FC = () => {
  const title = useDemoNoteStore((state) => state.title);
  const content = useDemoNoteStore((state) => state.content);
  const isLoading = useDemoNoteStore((state) => state.isLoading);
  const dateRef = useRef(new Date().toISOString());

  const nodes: Node[] = useMemo(
    () => [
      {
        id: 'demo-note-1',
        type: 'cardNode',
        position: { x: 300, y: 200 },
        data: {
          id: 1,
          boardId: 0,
          title,
          content,
          type: 'note',
          tags: [],
          color: null,
          createdAt: dateRef.current,
          updatedAt: dateRef.current,
          showAiResponseFooter: true,
          isContentLoading: isLoading,
          dimensions: { width: 338, height: 284 },
        },
      },
    ],
    [title, content, isLoading]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={NODE_TYPES}
        panOnDrag
        zoomOnScroll
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="w-full h-full"
      />
    </div>
  );
};

export default DemoBoard;
