/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SITE_SETTING_KEYS } from "@/lib/admin/constants";
import { settingsSchema } from "@/lib/admin/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("*").eq("slug", "la-ki-trep-resort").single();
  const { data: settings } = await supabase.from("site_settings").select("*").in("setting_key", [SITE_SETTING_KEYS.HOMEPAGE_HERO, SITE_SETTING_KEYS.SEO_HOMEPAGE]);

  const hero = settings?.find((s: any) => s.setting_key === SITE_SETTING_KEYS.HOMEPAGE_HERO)?.setting_value ?? {};
  const seo = settings?.find((s: any) => s.setting_key === SITE_SETTING_KEYS.SEO_HOMEPAGE)?.setting_value ?? {};

  async function updateSettings(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const parsed = settingsSchema.safeParse({
      name: formData.get("name"),
      tagline: formData.get("tagline"),
      phoneNumber: formData.get("phoneNumber"),
      whatsappNumber: formData.get("whatsappNumber"),
      email: formData.get("email"),
      addressLine: formData.get("addressLine"),
      bookingNote: formData.get("bookingNote"),
      mapsNote: formData.get("mapsNote"),
      heroHeadline: formData.get("heroHeadline"),
      heroSubheadline: formData.get("heroSubheadline"),
      heroTrustLine: formData.get("heroTrustLine"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
    });

    if (!parsed.success) return;

    await supabase.from("properties").update({
      name: parsed.data.name,
      tagline: parsed.data.tagline || null,
      phone_number: parsed.data.phoneNumber || null,
      whatsapp_number: parsed.data.whatsappNumber || null,
      email: parsed.data.email || null,
      address_line: parsed.data.addressLine || null,
      booking_note: parsed.data.bookingNote || null,
      maps_note: parsed.data.mapsNote || null,
    }).eq("id", property.id);

    await supabase.from("site_settings").upsert({
      property_id: property.id,
      setting_key: SITE_SETTING_KEYS.HOMEPAGE_HERO,
      setting_value: {
        headline: parsed.data.heroHeadline || "",
        subheadline: parsed.data.heroSubheadline || "",
        trust_line: parsed.data.heroTrustLine || "",
      },
    });

    await supabase.from("site_settings").upsert({
      property_id: property.id,
      setting_key: SITE_SETTING_KEYS.SEO_HOMEPAGE,
      setting_value: {
        title: parsed.data.seoTitle || "",
        description: parsed.data.seoDescription || "",
      },
    });

    revalidatePath("/admin/settings");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form action={updateSettings} className="space-y-4">
        <Card><CardHeader><CardTitle>Property Basics</CardTitle></CardHeader><CardContent className="grid gap-2 md:grid-cols-2">
          <input name="name" defaultValue={property.name} placeholder="Property name" className="h-10 rounded-md border px-3" />
          <input name="tagline" defaultValue={property.tagline ?? ""} placeholder="Tagline" className="h-10 rounded-md border px-3" />
          <input name="phoneNumber" defaultValue={property.phone_number ?? ""} placeholder="Phone" className="h-10 rounded-md border px-3" />
          <input name="whatsappNumber" defaultValue={property.whatsapp_number ?? ""} placeholder="Whatsapp" className="h-10 rounded-md border px-3" />
          <input name="email" defaultValue={property.email ?? ""} placeholder="Email" className="h-10 rounded-md border px-3" />
          <input name="addressLine" defaultValue={property.address_line ?? ""} placeholder="Address" className="h-10 rounded-md border px-3" />
          <textarea name="bookingNote" defaultValue={property.booking_note ?? ""} rows={3} placeholder="Booking note" className="rounded-md border p-2 md:col-span-2" />
          <textarea name="mapsNote" defaultValue={property.maps_note ?? ""} rows={3} placeholder="Maps note" className="rounded-md border p-2 md:col-span-2" />
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Homepage Hero</CardTitle></CardHeader><CardContent className="grid gap-2">
          <input name="heroHeadline" defaultValue={hero.headline ?? ""} placeholder="Headline" className="h-10 rounded-md border px-3" />
          <input name="heroSubheadline" defaultValue={hero.subheadline ?? ""} placeholder="Subheadline" className="h-10 rounded-md border px-3" />
          <input name="heroTrustLine" defaultValue={hero.trust_line ?? ""} placeholder="Trust line" className="h-10 rounded-md border px-3" />
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Homepage SEO</CardTitle></CardHeader><CardContent className="grid gap-2">
          <input name="seoTitle" defaultValue={seo.title ?? ""} placeholder="SEO title" className="h-10 rounded-md border px-3" />
          <textarea name="seoDescription" defaultValue={seo.description ?? ""} rows={3} placeholder="SEO description" className="rounded-md border p-2" />
        </CardContent></Card>

        <Button type="submit">Save Settings</Button>
      </form>

      <Card><CardHeader><CardTitle>Supabase Environment Variables</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-zinc-600">
        <p>Required env vars in <code>.env.local</code>:</p>
        <ul className="list-disc pl-5">
          <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
          <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          <li><code>NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET</code> (optional, default: <code>lakitrep-media</code>)</li>
        </ul>
        <p>Find URL and anon key in Supabase Dashboard → Project Settings → API.</p>
        <p>The anon key is safe in frontend because RLS applies. Never expose the service role key in client code or <code>NEXT_PUBLIC_*</code> variables.</p>
      </CardContent></Card>
    </div>
  );
}
