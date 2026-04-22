import { propertyDemoData } from "../demo-data";
import type { Property } from "../types";

// TODO: replace mock service with Supabase query.
let records = [...propertyDemoData];

export async function getAllProperties(): Promise<Property[]> { return records; }
export async function getPropertyById(id: string): Promise<Property | undefined> { return records.find((item) => item.id === id); }
export async function createProperty(input: Omit<Property, "id">): Promise<Property> { const created = { id: `prop-${Date.now()}`, ...input }; records = [created, ...records]; return created; }
export async function updateProperty(id: string, input: Partial<Omit<Property, "id">>): Promise<Property | undefined> { records = records.map((item) => (item.id === id ? { ...item, ...input } : item)); return records.find((item) => item.id === id); }
export async function deleteProperty(id: string): Promise<boolean> { const before = records.length; records = records.filter((item) => item.id !== id); return records.length < before; }
