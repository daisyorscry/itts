import { Sidebar } from "@/components/docs/Sidebar";
import { getModuleNavigation } from "@/lib/docs/navigation";
import { notFound } from "next/navigation";

export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const navigation = getModuleNavigation(module);

  if (!navigation) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] px-4">
      <Sidebar navigation={navigation} module={module} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
