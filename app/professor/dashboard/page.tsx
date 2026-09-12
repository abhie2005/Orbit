import { DashboardView } from "@/components/dashboard/dashboard-view";
import { DemoReset } from "@/components/ui/demo-reset";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Professor dashboard — Orbit" };

export default function ProfessorDashboardPage() {
  return (
    <>
      <SiteHeader>
        <DemoReset />
      </SiteHeader>
      <main className="flex-1">
        <DashboardView />
      </main>
    </>
  );
}
