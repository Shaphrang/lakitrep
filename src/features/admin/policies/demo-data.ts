import type { Policy } from "./types";

export const policyDemoData: Policy[] = [
  { id: "pol-1", title: "Cancellation Policy", slug: "cancellation-policy", content: "Cancellations made 7 days before check-in are fully refundable.", status: "active" },
  { id: "pol-2", title: "Pet Policy", slug: "pet-policy", content: "Small pets are allowed in selected cottages with prior approval.", status: "draft" },
];
