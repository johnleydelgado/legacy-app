// components/Sidebar/Sidebar.tsx
import { decode } from "jsonwebtoken";
import { Role } from "@/utils/acl";
import { cookies } from "next/headers";
import SidebarUI from "@/components/widgets/sidebar/SidebarUI";

export default async function Sidebar() {
    // 1️⃣ await the cookies store
    const cookieStore = await cookies();

    // 2️⃣ now you can safely .get()
    const idToken = cookieStore.get("idToken")?.value;

    // 3️⃣ decode and pull the role
    const decoded: any = idToken ? decode(idToken) : {};
    const rawRole = decoded?.["cognito:groups"]?.[0];
    const role: Role = (rawRole as Role) ?? "employee";

    // 4️⃣ render your client UI
    return <SidebarUI role={role} />;
}
