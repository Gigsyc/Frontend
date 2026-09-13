/**
 * SAMPLE DATA — the prototype has one real employer user (Diane, from EMPLOYER_USERS).
 * These two colleagues exist only so the Team tab shows what a multi-seat workspace looks like.
 * Not part of the mock store; nothing else reads this.
 */
export type TeamRole = "Owner" | "Admin" | "Viewer";

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  jobTitle: string;
  email: string;
  status: "active" | "invited";
  lastActive: string;
  /** Initials-avatar colour, same convention as Worker.avatarColor */
  avatarColor: string;
}

export const SAMPLE_COLLEAGUES: TeamMember[] = [
  { id: "tm_sample_1", name: "Jean-Claude Habineza", role: "Admin", jobTitle: "Front Office Manager", email: "jc.habineza@ikaze.rw", status: "active", lastActive: "Yesterday", avatarColor: "#17336b" },
  { id: "tm_sample_2", name: "Solange Ingabire", role: "Viewer", jobTitle: "Finance Officer", email: "finance@ikaze.rw", status: "active", lastActive: "3 days ago", avatarColor: "#4d5567" },
];

export const TEAM_ROLE_HELP: Record<TeamRole, string> = {
  Owner: "Full access, including billing and team",
  Admin: "Post shifts, confirm workers, approve attendance",
  Viewer: "See shifts, attendance and invoices. No changes",
};

/** Colours for seats created in-session (owner uses the brand navy). */
export const OWNER_AVATAR_COLOR = "#001b56";
export const INVITED_AVATAR_COLOR = "#8a93a6";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
