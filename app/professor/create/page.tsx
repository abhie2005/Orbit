import { CreateClassForm } from "@/components/dashboard/create-class-form";
import { SiteHeader } from "@/components/ui/site-header";

export const metadata = { title: "Create a class — Orbit" };

export default function CreateClassPage() {
  return (
    <>
      <SiteHeader />
      <main className="orbit-stars relative flex flex-1 items-start justify-center px-5 py-10 sm:py-14">
        <CreateClassForm />
      </main>
    </>
  );
}
