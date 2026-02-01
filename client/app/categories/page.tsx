import Breadcrumbs from "@/components/Breadcrumbs";

export default function page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories" },
          ]}
          className="mb-6"
        />
        <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">
            Categories Page
          </h3>
        </div>
      </div>
    </div>
  );
}
