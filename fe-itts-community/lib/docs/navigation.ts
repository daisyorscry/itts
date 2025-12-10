export interface DocNavItem {
  title: string
  slug?: string
  items?: DocNavItem[]
}

export interface DocNavSection {
  title: string
  items: DocNavItem[]
}

export interface DocNavigation {
  [module: string]: DocNavSection[]
}

export const docsNavigation: DocNavigation = {
  "golang-fundamental": [
    {
      title: "Pengenalan",
      items: [
        {
          title: "Overview",
          slug: "golang-fundamental",
        },
      ],
    },
    {
      title: "Bagian 1: Pengantar Golang",
      items: [
        {
          title: "Dasar Golang",
          slug: "golang-fundamental/dasar-golang",
        },
        {
          title: "Variabel & Tipe Data",
          slug: "golang-fundamental/variabel-dan-tipe-data",
        },
        {
          title: "Struct & Method",
          slug: "golang-fundamental/struct-dan-method",
        },
        {
          title: "Map & Slice",
          slug: "golang-fundamental/map-dan-slice",
        },
      ],
    },
    {
      title: "Bagian 2: Function",
      items: [
        {
          title: "Error Handling & Testing",
          slug: "golang-fundamental/error-handling-testing",
        },
        {
          title: "Interface & Composition",
          slug: "golang-fundamental/interface-composition",
        },
      ],
    },
    {
      title: "Bagian 3: Concurrency",
      items: [
        {
          title: "Goroutine & Channel",
          slug: "golang-fundamental/goroutine-channel",
        },
        {
          title: "Context & Timeout",
          slug: "golang-fundamental/context-timeout",
        },
        {
          title: "Worker Pool Pattern",
          slug: "golang-fundamental/worker-pool",
        },
      ],
    },
  ],
}

export function getModuleNavigation(module: string): DocNavSection[] | undefined {
  return docsNavigation[module]
}
