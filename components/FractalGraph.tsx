"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useGraphStore } from "../store/useGraphStore";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export default function FractalGraph() {
  const graphData = useGraphStore((state) => state.graphData);
  const fetchGraphData = useGraphStore((state) => state.fetchGraphData);
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode);
  
  // Referencia directa al motor de física para inyectar gravedad personalizada
  const graphRef = useRef<any>(null);

  useEffect(() => {
    // 1. Carga topológica inicial
    fetchGraphData();

    // 2. Abrir canal permanente de WebSockets
    const ws = new WebSocket("wss://buda-backend.onrender.com/ws");
    
    ws.onmessage = (event) => {
      if (event.data === "UPDATE_MATRIX") {
        console.log("[NEXUS] Perturbación detectada en la red. Sincronizando...");
        fetchGraphData();
      }
    };

    return () => {
      ws.close();
    };
  }, [fetchGraphData]);

  // 3. INYECCIÓN DE LEYES FÍSICAS (Frente Alfa)
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      const fg = graphRef.current;

      // LEY DE HOOKE MODIFICADA (Gravedad por Capital)
      // Si un enlace (arista) se conecta a un nodo con contratos, su resorte se tensa,
      // reduciendo la distancia y colapsando los nodos alrededor del dinero.
      fg.d3Force('link').distance((link: any) => {
        const targetBounties = link.target.bounties?.length || 0;
        const sourceBounties = link.source.bounties?.length || 0;
        const totalBounties = targetBounties + sourceBounties;
        
        // Distancia base = 60. Si hay capital, la distancia colapsa hasta 15.
        return totalBounties > 0 ? 15 : 60;
      });

      // LEY DE COULOMB (Repulsión Termodinámica)
      // Aumentamos la repulsión general para que los clústeres no se fusionen en un solo punto negro.
      fg.d3Force('charge').strength(-150);

      // Re-calentar el motor físico para aplicar las nuevas leyes instantáneamente
      fg.d3ReheatSimulation();
    }
  }, [graphData]);

  return (
    <div className="absolute inset-0 z-0">
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        
        // LEY DE MASA Y VOLUMEN (V)
        // V(n) = V_0 + \alpha * C_i
        nodeVal={(node: any) => {
          const baseVolume = 1;
          const capitalMultiplier = (node.bounties && node.bounties.length > 0) ? 5 : 0;
          return baseVolume + capitalMultiplier;
        }}
        
        nodeColor={(node: any) => {
          if (node.bounties && node.bounties.length > 0) return "#fbbf24"; 
          return node.id === 'raiz' ? '#ef4444' : '#3b82f6';
        }}
        
        nodeRelSize={6}
        enableNodeDrag={true}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        
        // Ajuste visual de los enlaces: más gruesos y brillantes si hay capital fluyendo
        linkWidth={(link: any) => {
          const targetHasCapital = link.target.bounties && link.target.bounties.length > 0;
          return targetHasCapital ? 2 : 0.5;
        }}
        linkColor={(link: any) => {
          const targetHasCapital = link.target.bounties && link.target.bounties.length > 0;
          return targetHasCapital ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255, 255, 255, 0.2)';
        }}
        
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