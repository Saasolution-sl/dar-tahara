import Link from "next/link";
import { Container } from "@/components/ui/section";
import { buttonVariants } from "@/components/ui/button";
import { DomeMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center py-32">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <DomeMark className="h-12 w-12 text-accent" />
          <p className="mt-6 font-serif text-6xl text-foreground">404</p>
          <h1 className="mt-2 font-serif text-2xl text-foreground">This room seems to be empty.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The page you are looking for has moved or no longer exists.
          </p>
          <Link href="/en" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8")}>
            Return home
          </Link>
        </div>
      </Container>
    </section>
  );
}
