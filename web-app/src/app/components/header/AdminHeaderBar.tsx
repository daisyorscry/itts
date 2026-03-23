import { Row } from '@components/ui/layout';

export function AdminHeaderBar({ children }: { children: React.ReactNode }) {
  return (
    <header className="border-b border-sidebar-border bg-sidebar px-4 py-3 sm:px-5 md:px-6 md:py-3.5">
      <Row justify="justify-between" className="w-full flex-wrap items-center gap-3 md:flex-nowrap">
        {children}
      </Row>
    </header>
  );
}
