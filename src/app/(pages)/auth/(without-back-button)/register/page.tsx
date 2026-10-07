import { redirect } from "next/navigation";
import { RouteAddress } from "@/shared/data/routeAddress";

/**
 * Sign-up and sign-in are one flow now («ورود یا ثبت‌نام» = phone → SMS code); keep old
 * /auth/register links working, including their ?callback=.
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { callback } = await searchParams;
  if (typeof callback === "string" && callback.startsWith("/") && !callback.startsWith("//")) {
    redirect(`${RouteAddress.AUTH.LOGIN.BASE}?${new URLSearchParams({ callback })}`);
  }
  redirect(RouteAddress.AUTH.LOGIN.BASE);
}
