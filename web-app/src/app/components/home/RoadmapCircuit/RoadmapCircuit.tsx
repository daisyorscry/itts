import { useState } from "react"
import { motion } from "motion/react"
import { Network, GitBranch } from "lucide-react"
import { CIRCUIT_TRACKS } from "./circuit-data"
import { COL_X, ROW_Y, SVG_W, SVG_H, circuitPath } from "./circuit-helpers"
import type { CircuitNode } from "./types"

export function RoadmapCircuit() {
  const [activeTrack, setActiveTrack] = useState<string>("networking")
  const [hoveredNode, setHoveredNode] = useState<CircuitNode | null>(null)

  const track = CIRCUIT_TRACKS.find((t) => t.id === activeTrack)!
  const nodeMap = Object.fromEntries(track.nodes.map((n) => [n.id, n]))

  return (
    <section className="bg-[#04090C] py-20 relative overflow-hidden roadmap-section">
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(41,230,140,1) 1px, transparent 1px), linear-gradient(90deg, rgba(41,230,140,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-12 roadmap-header">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 mb-6">
            <GitBranch size={12} className="text-accent" />
            <span className="text-accent text-xs font-semibold tracking-widest uppercase">
              Learning Roadmap
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              Setiap track punya jalur yang jelas — dari fondasi sampai capstone project
              production-ready.
            </p>
          </div>
        </div>

        {/* Track Tabs */}
        <div className="flex gap-2 mb-10 flex-wrap roadmap-tabs">
          {CIRCUIT_TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTrack(t.id)
                setHoveredNode(null)
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border roadmap-tab ${
                activeTrack === t.id
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/15 text-white/50 hover:text-white hover:border-white/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start roadmap-grid">
          {/* Circuit Diagram */}
          <div className="lg:col-span-7 roadmap-circuit">
            <motion.div
              key={activeTrack}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative bg-[#07111A] rounded-2xl border border-white/10 overflow-hidden p-4 circuit-wrapper"
            >
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />

              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full"
                style={{ height: "auto" }}
              >
                {track.connections.map(([aId, bId]) => {
                  const a = nodeMap[aId]
                  const b = nodeMap[bId]
                  const ax = COL_X[a.col],
                    ay = ROW_Y[a.row]
                  const bx = COL_X[b.col],
                    by = ROW_Y[b.row]
                  const isHighlighted = hoveredNode?.id === aId || hoveredNode?.id === bId
                  return (
                    <path
                      key={`${aId}-${bId}`}
                      d={circuitPath(ax, ay, bx, by)}
                      fill="none"
                      stroke={isHighlighted ? track.accentColor : "rgba(255,255,255,0.12)"}
                      strokeWidth={isHighlighted ? 2 : 1.5}
                      strokeDasharray={isHighlighted ? "none" : "6 4"}
                      style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                    />
                  )
                })}

                {track.nodes.map((node) => {
                  const cx = COL_X[node.col]
                  const cy = ROW_Y[node.row]
                  const isHovered = hoveredNode?.id === node.id
                  const isCap = node.type === "cap"
                  const isStart = node.type === "start"

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${cx},${cy})`}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {isHovered && (
                        <circle r={42} fill={track.accentColor} opacity={0.08} />
                      )}
                      <rect
                        x={-70}
                        y={-34}
                        width={140}
                        height={68}
                        rx={14}
                        fill={
                          isCap
                            ? track.accentColor
                            : isHovered
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(255,255,255,0.05)"
                        }
                        stroke={
                          isCap
                            ? track.accentColor
                            : isHovered
                              ? track.accentColor
                              : "rgba(255,255,255,0.15)"
                        }
                        strokeWidth={isCap ? 0 : isHovered ? 2 : 1}
                        style={{ transition: "all 0.2s" }}
                      />
                      <circle
                        cx={-70}
                        cy={-34}
                        r={3}
                        fill={
                          isHovered || isCap
                            ? track.accentColor
                            : "rgba(255,255,255,0.2)"
                        }
                      />
                      <circle
                        cx={70}
                        cy={-34}
                        r={3}
                        fill={
                          isHovered || isCap
                            ? track.accentColor
                            : "rgba(255,255,255,0.2)"
                        }
                      />
                      {(isCap || isStart) && (
                        <rect
                          x={-24}
                          y={-47}
                          width={isCap ? 62 : 46}
                          height={16}
                          rx={8}
                          fill={isCap ? track.accentColor : "rgba(255,255,255,0.15)"}
                        />
                      )}
                      {isCap && (
                        <text
                          x={7}
                          y={-36}
                          textAnchor="middle"
                          fontSize={8}
                          fontWeight="700"
                          fill="#000"
                          fontFamily="monospace"
                          letterSpacing="1"
                        >
                          CAPSTONE
                        </text>
                      )}
                      {isStart && (
                        <text
                          x={-1}
                          y={-36}
                          textAnchor="middle"
                          fontSize={8}
                          fontWeight="700"
                          fill="rgba(255,255,255,0.7)"
                          fontFamily="monospace"
                          letterSpacing="1"
                        >
                          START
                        </text>
                      )}
                      <text
                        y={-8}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight="700"
                        fill={isCap ? "#000" : "#fff"}
                        fontFamily="system-ui, sans-serif"
                      >
                        {node.label}
                      </text>
                      <text
                        y={10}
                        textAnchor="middle"
                        fontSize={10}
                        fill={isCap ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)"}
                        fontFamily="system-ui, sans-serif"
                      >
                        {node.sub}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </motion.div>
            <p className="text-white/25 text-xs text-center mt-3 font-mono">
              hover node untuk detail modul
            </p>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            {hoveredNode ? (
              <motion.div
                key={hoveredNode.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-[#07111A] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1">
                      {hoveredNode.sub}
                    </p>
                    <h3 className="text-white text-2xl font-bold">{hoveredNode.label}</h3>
                  </div>
                  {hoveredNode.type === "cap" && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold text-black"
                      style={{ backgroundColor: track.accentColor }}
                    >
                      CAPSTONE
                    </div>
                  )}
                  {hoveredNode.type === "project" && (
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/70">
                      LAB
                    </div>
                  )}
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  {hoveredNode.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {hoveredNode.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#07111A] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-3">
                  <Network size={18} className="text-white/20" />
                </div>
                <p className="text-white/25 text-sm">
                  Hover salah satu node
                  <br />
                  untuk lihat detail modul
                </p>
              </div>
            )}

            <div className="mt-4 bg-[#07111A] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs">Track Progress</span>
                <span className="text-white/60 text-xs font-mono">
                  {track.nodes.length} modules
                </span>
              </div>
              <div className="flex gap-1.5">
                {track.nodes.map((n) => (
                  <div
                    key={n.id}
                    onMouseEnter={() => setHoveredNode(n)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`h-1.5 rounded-full flex-1 cursor-pointer transition-all ${hoveredNode?.id === n.id ? "opacity-100" : "opacity-40"}`}
                    style={{
                      backgroundColor:
                        n.type === "cap" ? track.accentColor : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .roadmap-section {
            padding: 60px 0 !important;
          }
          .roadmap-header {
            margin-bottom: 32px !important;
          }
          .roadmap-tabs {
            gap: 8px !important;
            margin-bottom: 32px !important;
          }
          .roadmap-tab {
            padding: 10px 20px !important;
            font-size: 13px !important;
          }
          .roadmap-grid {
            gap: 24px !important;
          }
          .circuit-wrapper {
            padding: 12px !important;
          }
        }
      `}</style>
    </section>
  )
}
