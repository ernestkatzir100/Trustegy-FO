import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";

export async function Providers({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
