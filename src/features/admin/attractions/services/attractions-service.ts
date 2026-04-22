import { attractionDemoData } from "../demo-data";
import type { Attraction } from "../types";

// TODO: replace mock service with Supabase query.
let records = [...attractionDemoData];

export async function getAllAttractions(): Promise<Attraction[]> { return records; }
export async function getAttractionById(id: string): Promise<Attraction | undefined> { return records.find((x) => x.id === id); }
export async function createAttraction(input: Omit<Attraction, "id">): Promise<Attraction> { const created = { id: `att-${Date.now()}`, ...input }; records = [created, ...records]; return created; }
export async function updateAttraction(id: string, input: Partial<Omit<Attraction, "id">>): Promise<Attraction | undefined> { records = records.map((x) => (x.id === id ? { ...x, ...input } : x)); return records.find((x) => x.id === id); }
export async function deleteAttraction(id: string): Promise<boolean> { const before = records.length; records = records.filter((x) => x.id !== id); return records.length < before; }
