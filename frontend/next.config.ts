import type { NextConfig } from "next"

// El navegador llama a /api/v1 en el mismo origen y Next lo reenvía al
// backend: sin CORS y sin exponer la URL del backend al cliente.
const API = process.env.NEXO_API_URL ?? "http://localhost:3000"

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/v1/:ruta*", destination: `${API}/api/v1/:ruta*` }]
  },
}

export default nextConfig
