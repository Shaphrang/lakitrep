import { policyDemoData } from "../demo-data";
import type { Policy } from "../types";

// TODO: replace mock service with Supabase query.
let records = [...policyDemoData];

export async function getAllPolicies(): Promise<Policy[]> { return records; }
export async function getPolicyById(id: string): Promise<Policy | undefined> { return records.find((x) => x.id === id); }
export async function createPolicy(input: Omit<Policy, "id">): Promise<Policy> { const created = { id: `pol-${Date.now()}`, ...input }; records = [created, ...records]; return created; }
export async function updatePolicy(id: string, input: Partial<Omit<Policy, "id">>): Promise<Policy | undefined> { records = records.map((x) => (x.id === id ? { ...x, ...input } : x)); return records.find((x) => x.id === id); }
export async function deletePolicy(id: string): Promise<boolean> { const before = records.length; records = records.filter((x) => x.id !== id); return records.length < before; }
