import { useCallback, useState, useEffect, useRef } from 'react';
import { MiniMap, Node, useReactFlow } from '@xyflow/react';
import { useBoardStore } from '@/stores/boardStore';
import { Icon } from '@/shared/ui/Icon';
import RemoveIcon from '@mui/icons-material/Remove';

interface BoardMiniMapProps {
  nodeColor?: (node: Node) => string;
}

const BoardMiniMap = ({ nodeColor }: BoardMiniMapProps) => {
  const showMiniMap = useBoardStore((state) => state.showMiniMap);
  const { getZoom, zoomIn, zoomOut } = useReactFlow();
  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);
  const zoomCheckRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const checkZoomLimits = useCallback(() => {
    const currentZoom = getZoom();
    setCanZoomIn(currentZoom < 2);
    setCanZoomOut(currentZoom > 0.025);
  }, [getZoom]);

  useEffect(() => {
    if (!showMiniMap) return;
    checkZoomLimits();
    const interval = setInterval(checkZoomLimits, 200);
    return () => clearInterval(interval);
  }, [checkZoomLimits, showMiniMap]);

  const handleZoomIn = useCallback(() => {
    if (canZoomIn) {
      zoomIn();
      clearTimeout(zoomCheckRef.current);
      zoomCheckRef.current = setTimeout(checkZoomLimits, 50);
    }
  }, [canZoomIn, zoomIn, checkZoomLimits]);

  const handleZoomOut = useCallback(() => {
    if (canZoomOut) {
      zoomOut();
      clearTimeout(zoomCheckRef.current);
      zoomCheckRef.current = setTimeout(checkZoomLimits, 50);
    }
  }, [canZoomOut, zoomOut, checkZoomLimits]);

  // Cleanup zoom check timer on unmount
  useEffect(() => {
    return () => clearTimeout(zoomCheckRef.current);
  }, []);

  const defaultNodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case 'cardNode':
        return 'var(--blackinverse-a56)';
      case 'tradingIdeaNode':
        return 'var(--mind-accent)';
      case 'aiNode':
        return 'var(--other-cyan)';
      case 'brokerReportNode':
        return 'var(--status-warning)';
      default:
        return 'var(--blackinverse-a32)';
    }
  }, []);

  if (!showMiniMap) return null;

  return (
    <>
      {/* Zoom Controls - above minimap */}
      <div className="fixed bottom-[112px] right-3 z-[1001] flex items-center gap-1 bg-[var(--toolbar-bg)] backdrop-blur-effects-panel rounded-[2px] shadow-effects-panel px-1 py-1">
        <button
          onClick={handleZoomOut}
          disabled={!canZoomOut}
          className="p-1.5 rounded w-7 h-7 hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RemoveIcon
            sx={{ fontSize: 18 }}
            className="text-[var(--text-secondary)]"
          />
        </button>
        <button
          onClick={handleZoomIn}
          disabled={!canZoomIn}
          className="p-1.5 rounded w-7 h-7 hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icon
            variant="plus"
            size={18}
            className="text-[var(--text-secondary)]"
          />
        </button>
      </div>

      <div className="fixed bottom-3 right-3 z-[1000] w-[160px] h-[88px] bg-[var(--toolbar-bg)] backdrop-blur-effects-panel rounded-[2px] shadow-effects-panel overflow-hidden">
        <MiniMap
          nodeStrokeWidth={3}
          nodeBorderRadius={8}
          className="!relative !bottom-auto !right-auto !left-auto !top-auto !m-0 !bg-transparent !w-full !h-full"
          nodeColor={nodeColor || defaultNodeColor}
          pannable={true}
          zoomable={true}
          maskColor="rgba(4,4,5,0.04)"
        />
      </div>
    </>
  );
};

export default BoardMiniMap;
