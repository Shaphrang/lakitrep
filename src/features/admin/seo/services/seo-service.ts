import { seoDemoData } from "../demo-data";
import type { SeoEntry } from "../types";

// TODO: replace mock service with Supabase query.
let records = [...seoDemoData];

export async function getAllSeoEntries(): Promise<SeoEntry[]> { return records; }
export async function getSeoById(id: string): Promise<SeoEntry | undefined> { return records.find((x) => x.id === id); }
export async function createSeoEntry(input: Omit<SeoEntry, "id">): Promise<SeoEntry> { const created = { id: `seo-${Date.now()}`, ...input }; records = [created, ...records]; return created; }
export async function updateSeoEntry(id: string, input: Partial<Omit<SeoEntry, "id">>): Promise<SeoEntry | undefined> { records = records.map((x) => (x.id === id ? { ...x, ...input } : x)); return records.find((x) => x.id === id); }
export async function deleteSeoEntry(id: string): Promise<boolean> { const before = records.length; records = records.filter((x) => x.id !== id); return records.length < before; }
