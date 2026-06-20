import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthReviewsColumn } from "@/components/auth/AuthReviewsColumn";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "إنشاء حساب" };
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : "/account";

  return (
    <Section spacing="none" className="flex flex-1 flex-col justify-center pb-16 pt-28 sm:pt-32">
      <Container size="wide" className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* RTL: first cell is on the right → the registration form */}
          <div className="flex justify-center">
            <AuthForm mode="register" redirectTo={redirectTo} />
          </div>
          {/* Left cell → customer reviews */}
          <AuthReviewsColumn className="hidden lg:flex" />
        </div>
      </Container>
    </Section>
  );
}
