import SignInForm from "@/components/SignInForm";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
