import { redirect } from "next/navigation";

/** The cloned page lives at its source path, /ko (Pokemon tab). */
export default function Home() {
  redirect("/ko?qo_tab=pokemon");
}
