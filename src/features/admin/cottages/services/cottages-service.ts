import { cottageDemoData } from "../demo-data";
import type { Cottage } from "../types";

// TODO: replace mock service with Supabase query.
let records = [...cottageDemoData];

export async function getAllCottages(): Promise<Cottage[]> { return records; }
export async function getCottageById(id: string): Promise<Cottage | undefined> { return records.find((item) => item.id === id); }
export async function createCottage(input: Omit<Cottage, "id">): Promise<Cottage> { const created = { id: `cot-${Date.now()}`, ...input }; records = [created, ...records]; return created; }
export async function updateCottage(id: string, input: Partial<Omit<Cottage, "id">>): Promise<Cottage | undefined> { records = records.map((item) => (item.id === id ? { ...item, ...input } : item)); return records.find((item) => item.id === id); }
export async function deleteCottage(id: string): Promise<boolean> { const before = records.length; records = records.filter((item) => item.id !== id); return records.length < before; }
