'use client'

import { useState } from 'react'

interface Tab {
  label: string
  value: string
  content: React.ReactNode
}

interface TabsProps {
  defaultValue?: string
  items: Tab[]
}

export function Tabs({ defaultValue, items }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0]?.value)

  return (
    <div className="my-6 rounded-lg border border-border overflow-hidden">
      <div className="flex border-b border-border bg-muted/30">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => setActiveTab(item.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === item.value
                ? 'bg-background text-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {items.find((item) => item.value === activeTab)?.content}
      </div>
    </div>
  )
}
