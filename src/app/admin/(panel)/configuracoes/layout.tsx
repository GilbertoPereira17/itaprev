import { requireModule } from "@/lib/auth";

export default async function ModuleLayout({ children }: { children: React.ReactNode }) {
  await requireModule("configuracoes");
  return children;
}
