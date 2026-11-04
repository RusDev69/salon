import { redirect } from "next/navigation";

/**
 * Backwards-compatible alias. The canonical route is /admin/bookings, which
 * is also the URL used in the owner navigation and documentation.
 */
export default function AppointmentsAliasPage() {
  redirect("/admin/bookings");
}
