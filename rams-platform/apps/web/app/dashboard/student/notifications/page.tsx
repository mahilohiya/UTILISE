import { redirect } from "next/navigation";

// This route now redirects to the shared, role-agnostic notifications page
// at /dashboard/notifications. Kept as a redirect (not deleted) so any
// existing bookmarks or links to the old student-specific URL still work.
export default function StudentNotificationsRedirect() {
  redirect("/dashboard/notifications");
}
