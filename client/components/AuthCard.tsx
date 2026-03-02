import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthCardProps {
  title: string;
  buttonText: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export function AuthCard({
  title,
  buttonText,
  footerText,
  footerLinkText,
  footerLinkHref,
  onSubmit,
  children,
}: AuthCardProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        {/* Placeholder for logo */}
        <div className="mx-auto h-12 w-12 rounded-full bg-black" />
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <Button type="submit" className="w-full">
            {buttonText}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center gap-1 text-sm">
        <p>{footerText}</p>
        <Link href={footerLinkHref} className="underline font-medium">
          {footerLinkText}
        </Link>
      </CardFooter>
    </Card>
  );
}
