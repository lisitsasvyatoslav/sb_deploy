import CreateCardDialog from '@/features/board/components/CreateCardDialog';
import BoardMiniMap from '@/features/board/components/BoardMiniMap';
import CardSelectionToolbar from '@/features/board/components/CardSelectionToolbar';
import ContextMenu from '@/features/board/components/ContextMenu';
import DeleteCardConfirmDialog from '@/features/board/components/DeleteCardConfirmDialog';
import BoardBetaBanner from '@/features/board/components/BoardBetaBanner';
import DragDropOverlay from '@/features/board/components/DragDropOverlay';
import GroupSelectionOutline from '@/features/board/components/GroupSelectionOutline';
import SelectionArea from '@/features/board/components/SelectionArea';
import { NODE_TYPES } from '@/features/board/constants/boardConstants';
import { useBoard } from '@/features/board/hooks/useBoard';
import FundamentalDetailsModal from '@/features/ticker/components/FundamentalDetailsModal';
import TechAnalysisDetailsModal from '@/features/ticker/components/TechAnalysisDetailsModal';
import { CardModal } from '@/features/board/components/cardModal';
import { useTranslation } from '@/shared/i18n/client';
import { ReactFlow, MarkerType, SelectionMode } from '@xyflow/react';

interface BoardProps {
  boardId: number;
  highlightCardId?: number;
}

export const Board = ({ boardId, highlightCardId }: BoardProps) => {
  const board = useBoard({ boardId, highlightCardId });
  const { t } = useTranslation('board');

  // Loading state
  if (board.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-900">{t('loading')}</p>
      </div>
    );
  }

  // Error state
  if (board.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{t('error')}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="lmx__home__main-container"
        data-board-container
        onMouseDown={board.handlers.onPaneMouseDown}
        onMouseMove={board.handlers.onPaneMouseMove}
        onMouseUp={board.handlers.onPaneMouseUp}
        onContextMenu={board.onRootContextMenu}
      >
        <div className="lmx__home__reactflow-wrapper">
          <ReactFlow
            nodes={board.nodes}
            edges={board.edges}
            onNodesChange={board.onNodesChange}
            onEdgesChange={board.onEdgesChange}
            onConnect={board.handlers.onConnect}
            onMove={board.handlers.onMove}
            onNodeClick={board.handlers.onNodeClick}
            onNodeDragStart={board.handlers.onNodeDragStart}
            onNodeDrag={board.handlers.onNodeDrag}
            onNodeDragStop={board.handlers.onNodeDragStop}
            onNodeDoubleClick={board.handlers.onNodeDoubleClick}
            onDrop={board.handlers.onDrop}
            onDragOver={board.handlers.onDragOver}
            onDragLeave={board.handlers.onDragLeave}
            onPaneClick={board.handlers.onPaneClick}
            onPaneContextMenu={board.handlers.onPaneContextMenu}
            onNodeContextMenu={board.handlers.onNodeContextMenu}
            isValidConnection={board.isValidConnection}
            deleteKeyCode={null}
            selectionOnDrag={true}
            selectionKeyCode={['Control', 'Meta']}
            selectionMode={SelectionMode.Partial}
            className="w-full h-full"
            nodeTypes={NODE_TYPES}
            defaultViewport={board.initialViewport || undefined}
            fitView={!board.initialViewport}
            fitViewOptions={{ padding: 0.1, maxZoom: 1.5 }}
            minZoom={0.025}
            maxZoom={2}
            translateExtent={[
              [-10000, -10000],
              [10000, 10000],
            ]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--blackinverse-a32)',
              },
              style: {
                strokeWidth: 2,
                stroke: 'var(--blackinverse-a32)',
              },
            }}
            noWheelClassName="nowheel"
            attributionPosition="bottom-left"
          >
            <BoardMiniMap />
            <BoardBetaBanner />
            <DragDropOverlay isVisible={board.isDragOver} />
          </ReactFlow>
          <GroupSelectionOutline {...board.groupOutline} />
        </div>
        <CardModal />
      </div>

      <SelectionArea selectionBox={board.selectionBox} />

      {/* Create/Edit Note Dialog */}
      <CreateCardDialog {...board.createDialogProps} />

      {/* Context Menu */}
      <ContextMenu {...board.contextMenuProps} />

      {/* Toolbar for selected cards */}
      <CardSelectionToolbar
        visible={board.toolbarState.visible}
        x={board.toolbarState.x}
        y={board.toolbarState.y}
        selectedCount={board.selectedCards.length}
        selectedCardType={board.toolbarHandlers.selectedCardType}
        onRename={board.toolbarHandlers.onRename}
        onAskAI={board.toolbarHandlers.onAskAI}
        onOpen={board.toolbarHandlers.onOpen}
        onDelete={board.toolbarHandlers.onDelete}
        onChangeFilters={board.toolbarHandlers.onChangeFilters}
        onExport={board.toolbarHandlers.onExport}
      />

      {/* Technical Analysis Details Modal */}
      <TechAnalysisDetailsModal />

      {/* Fundamental Details Modal */}
      <FundamentalDetailsModal />

      {/* Delete Confirmation Dialog */}
      <DeleteCardConfirmDialog {...board.deleteConfirmDialogProps} />
    </>
  );
};

export default Board;
