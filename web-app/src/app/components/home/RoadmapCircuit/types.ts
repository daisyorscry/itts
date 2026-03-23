export interface CircuitNode {
  id: string
  label: string
  sub: string
  type: "start" | "module" | "project" | "cap"
  col: number
  row: number
  desc: string
  tags: string[]
}

export interface CircuitTrack {
  id: string
  label: string
  accentColor: string
  nodes: CircuitNode[]
  connections: [string, string][]
}
