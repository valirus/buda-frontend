"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useGraphStore } from "../store/useGraphStore";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export default function FractalGraph() {
  const graphData = useGraphStore((state) => state.graphData);
  const fetchGraphData = useGraphStore((state) => state.fetchGraphData);
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode);

  useEffect(() => {
    // 1. Carga topológica inicial
    fetchGraphData();

    // 2. Abrir canal permanente de WebSockets
    const ws = new WebSocket("wss://buda-backend.onrender.com/ws");
    
    ws.onmessage = (event) => {
      if (event.data === "UPDATE_MATRIX") {
        console.log("[NEXUS] Perturbación detectada en la red. Sincronizando...");
        fetchGraphData(); // Forzamos la actualización reactiva
      }
    };

    // 3. Cerrar el canal limpiamente si el usuario abandona la pantalla
    return () => {
      ws.close();
    };
  }, [fetchGraphData]);

  return (
    <div className="absolute inset-0 z-0">
      <ForceGraph3D
        graphData={graphData}
        // nodeAutoColorBy="id" <-- COMENTA O BORRA ESTA LÍNEA para tomar control total del color
        nodeColor={(node: any) => {
          // Si el nodo tiene bounties vinculados, brilla en dorado cyberpunk. Si no, usa colores por defecto.
          if (node.bounties && node.bounties.length > 0) {
            return "#fbbf24"; // Amarillo/Dorado brillante (amber-400)
          }
          return node.id === 'raiz' ? '#ef4444' : '#3b82f6'; // Ajuste básico de colores si quieres discriminar
        }}
        nodeRelSize={6}
        enableNodeDrag={true}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        backgroundColor="#0a0a0a"
        onNodeClick={(node: any) => setSelectedNode(node)}
        onBackgroundClick={() => setSelectedNode(null)}
        nodeLabel={(node: any) => `
          <div>
            <div style="font-size: 10px; color: #52525b; margin-bottom: 4px;">
              ID: ${node.id.split('-')[0]}... ${node.bounties && node.bounties.length > 0 ? '💰 [BOUNTY ACTIVO]' : ''}
            </div>
            <div>${node.text}</div>
          </div>
        `}
      />
    </div>
  );
}