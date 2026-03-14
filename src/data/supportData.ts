// ── Ticketing System — Shared Types & Mock Data ──

export type TicketStatus   = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
  | "account"
  | "billing"
  | "listing"
  | "offer"
  | "technical"
  | "verification"
  | "syndication"
  | "other";

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorName: string;
  authorRole: "user" | "support" | "admin";
  body: string;
  createdAt: string;
  isInternal?: boolean; // admin-only note
}

export interface Ticket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: "buyer" | "seller" | "developer";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  tags?: string[];
}

// ── Status config ──
export const STATUS_CONFIG: Record<TicketStatus, { label: string; style: string; dot: string }> = {
  open:        { label: "Open",        style: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",          dot: "bg-blue-500" },
  in_progress: { label: "In Progress", style: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",       dot: "bg-amber-500" },
  waiting:     { label: "Waiting",     style: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",   dot: "bg-purple-500" },
  resolved:    { label: "Resolved",    style: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  closed:      { label: "Closed",      style: "bg-secondary text-secondary-foreground",                                     dot: "bg-muted-foreground" },
};

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; style: string; icon: string }> = {
  low:    { label: "Low",    style: "bg-secondary text-secondary-foreground",                                              icon: "▽" },
  medium: { label: "Medium", style: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",               icon: "◈" },
  high:   { label: "High",   style: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",           icon: "△" },
  urgent: { label: "Urgent", style: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",                       icon: "⚠" },
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  account:      "Account & Profile",
  billing:      "Billing & Subscription",
  listing:      "Property Listing",
  offer:        "Offer / Transaction",
  technical:    "Technical Issue",
  verification: "Seller Verification",
  syndication:  "Syndication / Investment",
  other:        "Other",
};

// ── Mock data ──
export const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Cannot upload verification documents",
    category: "verification",
    priority: "high",
    status: "in_progress",
    userId: "u1",
    userName: "Ahmed Al-Rashidi",
    userEmail: "ahmed@example.com",
    userRole: "seller",
    assignedTo: "Sarah (Support)",
    createdAt: "2026-03-10T09:15:00Z",
    updatedAt: "2026-03-11T14:30:00Z",
    tags: ["verification", "upload"],
    messages: [
      {
        id: "m1", ticketId: "TKT-001", authorName: "Ahmed Al-Rashidi", authorRole: "user",
        body: "I keep getting an error when I try to upload my ID document. The page shows 'File too large' even though my file is only 1.2MB. I've tried three times already.",
        createdAt: "2026-03-10T09:15:00Z",
      },
      {
        id: "m2", ticketId: "TKT-001", authorName: "Sarah (Support)", authorRole: "support",
        body: "Hi Ahmed! I can see the issue — our upload limit was recently reduced to 1MB for security reasons. Could you try compressing your file slightly? You can use a free tool like Smallpdf. I've also noted your account for a manual review if needed.",
        createdAt: "2026-03-11T14:30:00Z",
      },
    ],
  },
  {
    id: "TKT-002",
    subject: "Offer was auto-rejected but my payment proof was valid",
    category: "offer",
    priority: "urgent",
    status: "open",
    userId: "u2",
    userName: "Sara Mahmoud",
    userEmail: "sara@example.com",
    userRole: "buyer",
    createdAt: "2026-03-12T11:00:00Z",
    updatedAt: "2026-03-12T11:00:00Z",
    tags: ["offer", "payment"],
    messages: [
      {
        id: "m3", ticketId: "TKT-002", authorName: "Sara Mahmoud", authorRole: "user",
        body: "My offer on property #4521 (Ankawa Villa) was rejected automatically saying 'payment proof invalid'. I uploaded a certified bank statement. This is urgent as the seller said they will accept another offer tomorrow.",
        createdAt: "2026-03-12T11:00:00Z",
      },
    ],
  },
  {
    id: "TKT-003",
    subject: "Subscription upgraded but Pro features not unlocked",
    category: "billing",
    priority: "high",
    status: "waiting",
    userId: "u3",
    userName: "Khalid Nouri",
    userEmail: "khalid@example.com",
    userRole: "buyer",
    assignedTo: "Omar (Support)",
    createdAt: "2026-03-08T16:20:00Z",
    updatedAt: "2026-03-09T10:00:00Z",
    tags: ["billing", "subscription", "pro"],
    messages: [
      {
        id: "m4", ticketId: "TKT-003", authorName: "Khalid Nouri", authorRole: "user",
        body: "I upgraded to Pro yesterday and was charged $49. But I still can't send offers or access the AI analysis pages. It says I need a Pro subscription even though I just paid.",
        createdAt: "2026-03-08T16:20:00Z",
      },
      {
        id: "m5", ticketId: "TKT-003", authorName: "Omar (Support)", authorRole: "support",
        body: "Hi Khalid, I confirmed the payment went through successfully. I've manually triggered a subscription sync on your account. Could you please log out and back in? Let me know if the Pro features are now available.",
        createdAt: "2026-03-09T10:00:00Z",
      },
      {
        id: "m6", ticketId: "TKT-003", authorName: "Khalid Nouri", authorRole: "user",
        body: "Still not working after logging out and back in. Tried on mobile too.",
        createdAt: "2026-03-09T14:00:00Z",
      },
    ],
  },
  {
    id: "TKT-004",
    subject: "How do I add multiple agents to my developer account?",
    category: "account",
    priority: "low",
    status: "resolved",
    userId: "u4",
    userName: "Nour Hassan",
    userEmail: "nour@example.com",
    userRole: "developer",
    assignedTo: "Sarah (Support)",
    createdAt: "2026-03-05T08:00:00Z",
    updatedAt: "2026-03-05T15:00:00Z",
    messages: [
      {
        id: "m7", ticketId: "TKT-004", authorName: "Nour Hassan", authorRole: "user",
        body: "We have a team of 3 agents who need access to our developer account. Is there a way to add sub-users?",
        createdAt: "2026-03-05T08:00:00Z",
      },
      {
        id: "m8", ticketId: "TKT-004", authorName: "Sarah (Support)", authorRole: "support",
        body: "Great question! You can invite team members via Settings → Team Management. Each invited agent gets their own login and you can set their permissions (view only, can post, full access). You'll find this under the Enterprise tier. Let me know if you need help getting set up!",
        createdAt: "2026-03-05T15:00:00Z",
      },
    ],
  },
  {
    id: "TKT-005",
    subject: "Property page not loading on mobile",
    category: "technical",
    priority: "medium",
    status: "open",
    userId: "u5",
    userName: "Layla Aziz",
    userEmail: "layla@example.com",
    userRole: "buyer",
    createdAt: "2026-03-13T07:30:00Z",
    updatedAt: "2026-03-13T07:30:00Z",
    messages: [
      {
        id: "m9", ticketId: "TKT-005", authorName: "Layla Aziz", authorRole: "user",
        body: "The property detail page keeps crashing on my iPhone 13 (Safari). It loads for a second then goes white. Works fine on desktop Chrome.",
        createdAt: "2026-03-13T07:30:00Z",
      },
    ],
  },
];
