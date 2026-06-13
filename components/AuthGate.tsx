"use client";

import { useState } from "react";
import { useGraphStore } from "../store/useGraphStore";

export default function AuthGate() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const setCurrentUser = useGraphStore((state) => state.setCurrentUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin 
      ? { username, password } 
      : { username, email, password };

    try {
      const res = await fetch(`https://buda-backend.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // El endpoint de login devuelve user_id en la raíz, el de register dentro de 'data'
      const userObj = isLogin 
        ? { user_id: data.user_id, username: data.username }
        : data.user;

      setCurrentUser(userObj);
      useGraphStore.getState().setToken(data.access_token); // GUARDAMOS EL TOKEN CRIPTOGRÁFICO
      await useGraphStore.getState().fetchUserStats(userObj.user_id);

    } catch (err) {
      setError("Error de conexión con la bóveda de identidad.");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] backdrop-blur-md">
      <div className="w-full max-w-md p-8 border border-zinc-800 bg-black/50 shadow-2xl rounded-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-[0.3em] uppercase text-zinc-100">Nexus</h1>
          <p className="mt-2 text-xs text-zinc-500 tracking-widest">[ IDENTIFICACIÓN REQUERIDA ]</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="USERNAME" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent border-b border-zinc-700 p-2 text-zinc-300 font-mono text-sm focus:outline-none focus:border-zinc-400 transition-colors"
            required
          />
          {!isLogin && (
            <input 
              type="email" 
              placeholder="EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 p-2 text-zinc-300 font-mono text-sm focus:outline-none focus:border-zinc-400 transition-colors"
              required
            />
          )}
          <input 
            type="password" 
            placeholder="PASSWORD" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-zinc-700 p-2 text-zinc-300 font-mono text-sm focus:outline-none focus:border-zinc-400 transition-colors"
            required
          />

          {error && <div className="text-rose-500 text-xs font-mono mt-2">{error}</div>}

          <button type="submit" className="mt-6 w-full py-3 border border-zinc-600 bg-zinc-800 text-white font-mono text-sm hover:bg-zinc-700 transition-colors">
            {isLogin ? "INICIAR SESIÓN" : "CREAR IDENTIDAD"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }} 
            className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
          >
            {isLogin ? "¿No tienes acceso? Solicita una cuenta." : "¿Ya tienes identidad? Inicia sesión."}
          </button>
        </div>
      </div>
    </div>
  );
}