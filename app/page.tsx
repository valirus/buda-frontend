"use client";

import FractalGraph from "../components/FractalGraph";
import AuthGate from "../components/AuthGate";
import { useGraphStore } from "../store/useGraphStore";
import { useState } from "react";

export default function Home() {
  const selectedNode = useGraphStore((state) => state.selectedNode);
  const actionType = useGraphStore((state) => state.actionType);
  const currentUser = useGraphStore((state) => state.currentUser);
  const token = useGraphStore((state) => state.token); // <-- EXTRAEMOS LA LLAVE CRIPTOGRÁFICA
  const [isCreating, setIsCreating] = useState(false);
  const [newPremise, setNewPremise] = useState("");
  const [newEvidence, setNewEvidence] = useState("");
  const [showSponsorPanel, setShowSponsorPanel] = useState(false);

  // Si no hay usuario logueado, mostrar solo el portal de acceso
  if (!currentUser) {
    return <AuthGate />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0a] relative overflow-hidden">
      
      {/* El motor 3D */}
      <FractalGraph />

      {/* HUD del Agente (Esquina superior izquierda) */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-4 bg-black/80 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-emerald-500 font-mono tracking-wider">{currentUser.username}</span>
          </div>
          <div className="w-px h-4 bg-zinc-700"></div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-amber-400" title="Billetera Virtual">
              <span className="text-zinc-500 mr-1">💰</span> 
              ${currentUser.wallet_balance !== undefined ? currentUser.wallet_balance.toFixed(2) : "0.00"}
            </span>
            <span className="text-blue-400" title="Score Cognitivo">
              <span className="text-zinc-500 mr-1">🧠</span> 
              {currentUser.cognitive_score !== undefined ? currentUser.cognitive_score.toFixed(2) : "0.00"}
            </span>
          </div>
        </div>
      </div>

      {/* Marca de Agua (Esquina inferior derecha) */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none opacity-30 text-right select-none">
        <h1 className="text-2xl font-bold tracking-[0.4em] uppercase text-zinc-100">Nexus</h1>
        <p className="mt-1 text-[10px] text-zinc-400 tracking-widest">[ SISTEMA ACTIVO ]</p>
      </div>

      {/* PANEL DE BIG BANG (Solo visible cuando no hay nodo seleccionado) */}
      {!selectedNode && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          {!isCreating ? (
            <button 
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 border border-zinc-700 bg-black/50 backdrop-blur text-zinc-300 font-mono text-sm hover:bg-zinc-800 hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded"
            >
              [+] INYECTAR NUEVO AXIOMA
            </button>
          ) : (
            <div className="w-[500px] bg-[#0a0a0a]/95 border border-zinc-700 p-6 rounded shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-4 text-xs font-mono text-zinc-400">
                <span>INICIAR NUEVO FRACTAL</span>
                <button onClick={() => { setIsCreating(false); setNewPremise(""); }} className="hover:text-white transition-colors">[ CERRAR ]</button>
              </div>
              
              {/* Caja de texto existente */}
              <textarea 
                className="w-full h-32 bg-black border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-zinc-500 resize-none mb-4"
                placeholder="Escribe la premisa fundamental..."
                value={newPremise}
                onChange={(e) => setNewPremise(e.target.value)}
                autoFocus
              />
              
              {/* CAMPO NUEVO */}
              <input 
                type="text"
                placeholder="Enlace de evidencia o paper científico (Opcional)..."
                className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-zinc-500 mb-4"
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
              />

              <button 
                onClick={async () => {
                  if (!newPremise) return;
                  const res = await fetch("https://buda-backend.onrender.com/nodos/premisa", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({
                      premise: newPremise,
                      evidence_link: newEvidence || null // <-- CARGA ÚTIL DE EVIDENCIA
                    })
                  });

                  if (res.ok) {
                    setNewPremise("");
                    setNewEvidence(""); // Reset local
                    setIsCreating(false);
                    await useGraphStore.getState().fetchGraphData();
                  }
                }}
                className="w-full py-3 border border-zinc-500 bg-zinc-200 text-black font-mono font-bold text-sm hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                DETONAR BIG BANG
              </button>
            </div>
          )}
        </div>
      )}

      {/* HUD LATERAL */}
      <div className={`absolute top-0 right-0 h-full w-[400px] bg-[#0a0a0a]/90 backdrop-blur-md border-l border-zinc-800 p-8 transform transition-transform duration-300 ease-in-out flex flex-col ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedNode && (
          <>
            <div className="text-xs text-zinc-500 font-mono mb-2 border-b border-zinc-800 pb-2">
              TARGET ID: {selectedNode.id.split('-')[0]}
            </div>
            <h2 className="text-lg text-zinc-200 font-mono mb-8 leading-relaxed">
              {selectedNode.text}
            </h2>

            {/* VISUALIZADOR DE EVIDENCIA (Solo si el nodo contiene un link) */}
            {selectedNode.evidence_link && (
              <a 
                href={selectedNode.evidence_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full text-center py-2 mb-6 border border-amber-500/30 bg-amber-500/5 text-amber-400 font-mono text-xs hover:bg-amber-500/20 transition-all rounded pointer-events-auto"
              >
                🔗 VERIFICAR EVIDENCIA EMPÍRICA
              </a>
            )}

            <div className="flex flex-col gap-4 mt-auto">
              {/* VISTA 1: BOTONES PRINCIPALES */}
              {!actionType && !showSponsorPanel && (
                <>
                  <button onClick={() => useGraphStore.getState().setActionType('SUPPORTS')} className="w-full py-3 border border-emerald-900 bg-emerald-900/20 text-emerald-500 font-mono text-sm hover:bg-emerald-900/40 transition-colors">
                    [+] SUPPORT
                  </button>
                  <button onClick={() => useGraphStore.getState().setActionType('REFUTES')} className="w-full py-3 border border-rose-900 bg-rose-900/20 text-rose-500 font-mono text-sm hover:bg-rose-900/40 transition-colors">
                    [-] REFUTE
                  </button>
                  <button onClick={() => useGraphStore.getState().setActionType('SYNTHESIZES')} className="w-full py-3 border border-blue-900 bg-blue-900/20 text-blue-500 font-mono text-sm hover:bg-blue-900/40 transition-colors mt-2 shadow-[0_0_15px_rgba(30,58,138,0.5)]">
                    [Δ] SYNTHESIZE
                  </button>
                  
                  <div className="w-full h-px bg-zinc-800 my-2"></div>
                  
                  {/* EL BOTÓN DORADO DEL INVERSOR */}
                  <button onClick={() => setShowSponsorPanel(true)} className="w-full py-3 border border-amber-900 bg-amber-900/10 text-amber-500 font-mono text-sm hover:bg-amber-900/30 transition-colors">
                    [$$] INJECT CAPITAL
                  </button>
                </>
              )}

              {/* VISTA 2: PANEL DE INYECCIÓN DE CAPITAL */}
              {showSponsorPanel && (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="text-xs font-mono text-amber-400 flex justify-between mb-2">
                    <span>ACCIÓN: <span className="text-white">FONDEAR NODO</span></span>
                    <button onClick={() => setShowSponsorPanel(false)} className="text-zinc-500 hover:text-white transition-colors">[ CANCELAR ]</button>
                  </div>
                  <input id="bounty-title" type="text" placeholder="Título del contrato..." className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-amber-500" />
                  <textarea id="bounty-desc" placeholder="Condiciones de la síntesis buscada..." className="w-full h-24 bg-black border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-amber-500 resize-none" />
                  <input id="bounty-amount" type="number" placeholder="Recompensa (USD)" className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-amber-500" />
                  <button 
                    onClick={async () => {
                      const title = (document.getElementById('bounty-title') as HTMLInputElement).value;
                      const desc = (document.getElementById('bounty-desc') as HTMLTextAreaElement).value;
                      const amount = parseFloat((document.getElementById('bounty-amount') as HTMLInputElement).value);
                      if (!title || !desc || isNaN(amount)) return;

                      // 1. Calculamos el deadline (+30 días por defecto para el MVP)
                      const deadline = new Date();
                      deadline.setDate(deadline.getDate() + 30);

                      // 2. Disparo 1: Crear el contrato en PostgreSQL
                      const resCrear = await fetch("https://buda-backend.onrender.com/bounties/crear", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" }, // Omitimos JWT temporalmente para simular modo Inversor
                        body: JSON.stringify({
                          title: title, description: desc, reward_amount: amount, deadline: deadline.toISOString()
                        })
                      });

                      if (resCrear.ok) {
                        const dataCrear = await resCrear.json();
                        
                        // 3. Disparo 2: Trazar el vector magnético en Neo4j
                        const resVincular = await fetch("https://buda-backend.onrender.com/bounties/vincular", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            bounty_id: dataCrear.bounty_id, node_id: selectedNode.id
                          })
                        });

                        if (resVincular.ok) {
                          setShowSponsorPanel(false);
                          await useGraphStore.getState().fetchGraphData(); // Recarga local para pintar de dorado
                        }
                      }
                    }}
                    className="w-full py-3 border border-amber-600 bg-amber-800 text-white font-mono text-sm hover:bg-amber-700 transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)] mt-2"
                  >
                    CONFIRM TRANSACTION
                  </button>
                </div>
              )}

              {/* VISTA 3: PANEL DE ARGUMENTO (Fricción Cognitiva Original) */}
              {actionType && (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="text-xs font-mono text-zinc-400 flex justify-between">
                    <span>ACCIÓN: <span className={actionType === 'SUPPORTS' ? 'text-emerald-500' : actionType === 'REFUTES' ? 'text-rose-500' : 'text-blue-500'}>{actionType}</span></span>
                    <button onClick={() => useGraphStore.getState().setActionType(null)} className="hover:text-white transition-colors">[ CANCELAR ]</button>
                  </div>
                  <textarea 
                    id="argument-input"
                    className="w-full h-32 bg-black border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-zinc-500 resize-none mb-2"
                    placeholder="Despliega tu argumento aquí..."
                  />
                  
                  {/* CAMPO NUEVO */}
                  <input 
                    id="argument-evidence"
                    type="text"
                    placeholder="Enlace de evidencia (Opcional)..."
                    className="w-full bg-black border border-zinc-800 rounded p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-zinc-500 mb-4"
                  />

                  <button 
                    onClick={async () => {
                      const inputElement = document.getElementById('argument-input') as HTMLTextAreaElement;
                      const evidenceElement = document.getElementById('argument-evidence') as HTMLInputElement;
                      const text = inputElement.value;
                      const evidenceLink = evidenceElement.value || null; // EXTRAEMOS EL LINK
                      
                      if (!text || !selectedNode) return;

                      let response;

                      if (actionType === 'SYNTHESIZES' && selectedNode.bounties && selectedNode.bounties.length > 0) {
                        response = await fetch("https://buda-backend.onrender.com/bounties/resolver", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                          body: JSON.stringify({ bounty_id: selectedNode.bounties[0], target_node_id: selectedNode.id, synthesis_text: text })
                        });
                      } else {
                        response = await fetch("https://buda-backend.onrender.com/nodos/interactuar", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                          body: JSON.stringify({ 
                            parent_node_id: selectedNode.id, 
                            text: text, 
                            relation_type: actionType,
                            evidence_link: evidenceLink // <-- CARGA ÚTIL DE INTERACCIÓN
                          })
                        });
                      }

                      if (response.ok) {
                        await useGraphStore.getState().fetchGraphData(); 
                        if (actionType === 'SYNTHESIZES' && selectedNode.bounties && selectedNode.bounties.length > 0) {
                          await useGraphStore.getState().fetchUserStats(currentUser.user_id);
                        }
                        useGraphStore.getState().setActionType(null);    
                        inputElement.value = "";                         
                        if (evidenceElement) evidenceElement.value = ""; // Limpieza
                      }
                    }}
                    className="w-full py-3 border border-zinc-600 bg-zinc-800 text-white font-mono text-sm hover:bg-zinc-700 transition-colors"
                  >
                    DEPLOY ARGUMENT
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}