import { ConstellationView } from "@/components/constellation/constellation-view";
import { DemoReset } from "@/components/ui/demo-reset";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Classroom constellation — Orbit" };

export default function ConstellationPage() {
  return (
    <>
      <SiteHeader>
        <DemoReset />
      </SiteHeader>
      <main className="flex-1">
        <ConstellationView />
      </main>
    </>
  );
}
