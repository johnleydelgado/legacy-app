import { Role } from "@/utils/acl";

/**
 * @param allowedRoles  the roles that may see this item
 * @param userRole      the current user’s role
 */
export function canView(allowed: Role[], user: Role) {
    if (allowed.length === 0) return true;      // ⬅️ public
    return allowed.includes(user);
}