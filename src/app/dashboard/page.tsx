import { redirect } from "next/navigation";
import { AUTH_LANDING_PATH } from "@/lib/authPaths";

export default function Page() {
  redirect(AUTH_LANDING_PATH);
}
