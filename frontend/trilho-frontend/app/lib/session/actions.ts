"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "./index";

export async function logout() {
    await deleteSession();
    redirect("/login");
}
