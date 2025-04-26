import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the live monitoring page
  redirect("/canli")
}
