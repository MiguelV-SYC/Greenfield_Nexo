"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

const AVATAR_SRC = "/brand/nexo-ai-avatar.png"

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  )
}

function BotMessage({ children }: { children: string }) {
  return (
    <div className="ai-msg from-bot">
      <div className="ai-msg-avatar">
        {/* eslint-disable-next-line @next/next/no-img-element -- avatar decorativo de 18px, next/image no aporta optimización aquí */}
        <img src={AVATAR_SRC} alt="" />
      </div>
      <div className="ai-msg-bubble">{children}</div>
    </div>
  )
}

function ChatWindow({ onClose }: { onClose: () => void }) {
  return (
    <div className="ai-chat">
      <div className="ai-chat-head">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono decorativo de 26px */}
        <img src={AVATAR_SRC} alt="" />
        <div className="ai-chat-head-text">
          <div className="ai-chat-title">Asistente IA de Nexo</div>
          <div className="ai-chat-status">
            <span className="live-dot" />
            En desarrollo — vista previa
          </div>
        </div>
        <button type="button" className="ai-chat-close" aria-label="Cerrar asistente" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="ai-chat-body">
        <BotMessage>
          ¡Hola! Soy el asistente de Nexo. Cuando esté activo, podré ayudarte a consultar el estado de cumplimiento, diligenciar formatos y resolver dudas sobre el Decreto 1072 — todo desde este chat.
        </BotMessage>
      </div>
      <div className="ai-chat-foot">
        <input className="ai-chat-input" type="text" placeholder="Escribe tu mensaje..." disabled />
        <button type="button" className="ai-chat-send" aria-label="Enviar" disabled>
          <ArrowIcon />
        </button>
      </div>
    </div>
  )
}

// Widget flotante hexagonal del asistente IA (vista previa de diseño, sin backend).
export function AiAssistant() {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("ai-widget", open && "open")}>
      <ChatWindow onClose={() => setOpen(false)} />
      <button
        type="button"
        className="ai-hex-outer"
        aria-label={open ? "Cerrar asistente IA" : "Abrir asistente IA"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ai-hex-inner">
          {/* eslint-disable-next-line @next/next/no-img-element -- ícono decorativo de 36px */}
          <img src={AVATAR_SRC} alt="" />
        </span>
      </button>
    </div>
  )
}
