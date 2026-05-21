import { redirect } from "next/navigation";

export default function JsonPathPage() {
  redirect("/json?tab=tree");
}
