import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { sendOverdueReminder } from "@/app/actions/book";

async function remindAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await sendOverdueReminder(id);
}

export { remindAction };
