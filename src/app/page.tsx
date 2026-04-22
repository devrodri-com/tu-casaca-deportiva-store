import { appConfig } from "@/lib/config";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-20">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          {appConfig.name}
        </h1>
        <p className="text-sm leading-relaxed text-foreground/80">
          {appConfig.description}
        </p>
      </main>
    </div>
  );
}
