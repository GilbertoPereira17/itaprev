import { requireModule } from "@/lib/auth";

export default async function ModuleLayout({ children }: { children: React.ReactNode }) {
  await requireModule("chatbot");
  return children;
}
