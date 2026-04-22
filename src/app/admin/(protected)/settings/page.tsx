/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_SLUG, SITE_SETTING_KEYS } from "@/lib/admin/constants";
import { settingsSchema } from "@/lib/admin/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyImagesManager } from "@/components/admin/property-images-manager";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("*").eq("slug", PROPERTY_SLUG).single();
  const { data: settings } = await supabase.from("site_settings").select("*").in("setting_key", [SITE_SETTING_KEYS.HOMEPAGE_HERO, SITE_SETTING_KEYS.SEO_HOMEPAGE]);

  if (!property) return notFound();

  const hero = settings?.find((s: any) => s.setting_key === SITE_SETTING_KEYS.HOMEPAGE_HERO)?.setting_value ?? {};
  const seo = settings?.find((s: any) => s.setting_key === SITE_SETTING_KEYS.SEO_HOMEPAGE)?.setting_value ?? {};

  async function updateSettings(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const parsed = settingsSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      tagline: formData.get("tagline"),
      shortIntro: formData.get("shortIntro"),
      fullDescription: formData.get("fullDescription"),
      propertyType: formData.get("propertyType"),
      addressLine: formData.get("addressLine"),
      district: formData.get("district"),
      state: formData.get("state"),
      country: formData.get("country"),
      phoneNumber: formData.get("phoneNumber"),
      whatsappNumber: formData.get("whatsappNumber"),
      email: formData.get("email"),
      instagramHandle: formData.get("instagramHandle"),
      instagramUrl: formData.get("instagramUrl"),
      facebookUrl: formData.get("facebookUrl"),
      bookingNote: formData.get("bookingNote"),
      mapsNote: formData.get("mapsNote"),
      checkInTime: formData.get("checkInTime"),
      checkOutTime: formData.get("checkOutTime"),
      isActive: formData.get("isActive") === "on",
      heroHeadline: formData.get("heroHeadline"),
      heroSubheadline: formData.get("heroSubheadline"),
      heroTrustLine: formData.get("heroTrustLine"),
      seoTitle: formData.get("seoTitle"),
      seoDescription: formData.get("seoDescription"),
    });

    if (!parsed.success) return;

    await supabase.from("properties").update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline || null,
      short_intro: parsed.data.shortIntro || null,
      full_description: parsed.data.fullDescription || null,
      property_type: parsed.data.propertyType || null,
      phone_number: parsed.data.phoneNumber || null,
      whatsapp_number: parsed.data.whatsappNumber || null,
      email: parsed.data.email || null,
      address_line: parsed.data.addressLine || null,
      district: parsed.data.district || null,
      state: parsed.data.state || null,
      country: parsed.data.country || null,
      instagram_handle: parsed.data.instagramHandle || null,
      instagram_url: parsed.data.instagramUrl || null,
      facebook_url: parsed.data.facebookUrl || null,
      booking_note: parsed.data.bookingNote || null,
      maps_note: parsed.data.mapsNote || null,
      check_in_time: parsed.data.checkInTime || null,
      check_out_time: parsed.data.checkOutTime || null,
      is_active: parsed.data.isActive,
    }).eq("id", property.id);

    await supabase.from("site_settings").upsert({
      property_id: property.id,
      setting_key: SITE_SETTING_KEYS.HOMEPAGE_HERO,
      setting_value: {
        headline: parsed.data.heroHeadline || "",
        subheadline: parsed.data.heroSubheadline || "",
        trust_line: parsed.data.heroTrustLine || "",
      },
    }, { onConflict: "setting_key" });

    await supabase.from("site_settings").upsert({
      property_id: property.id,
      setting_key: SITE_SETTING_KEYS.SEO_HOMEPAGE,
      setting_value: {
        title: parsed.data.seoTitle || "",
        description: parsed.data.seoDescription || "",
      },
    }, { onConflict: "setting_key" });

    revalidatePath("/admin/settings");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <PropertyImagesManager
        propertyId={property.id}
        initialCoverImage={property.cover_image ?? null}
        initialGalleryImages={Array.isArray(property.gallery_images) ? property.gallery_images : []}
      />

      <form action={updateSettings} className="space-y-4">
        <Card><CardHeader><CardTitle>Property Basics</CardTitle></CardHeader><CardContent className="grid gap-2 md:grid-cols-2">
          <input name="name" defaultValue={property.name} placeholder="Property name" className="h-10 rounded-md border px-3" />
          <input name="slug" defaultValue={property.slug} placeholder="Slug" className="h-10 rounded-md border px-3" />
          <input name="tagline" defaultValue={property.tagline ?? ""} placeholder="Tagline" className="h-10 rounded-md border px-3" />
          <input name="propertyType" defaultValue={property.property_type ?? ""} placeholder="Property type" className="h-10 rounded-md border px-3" />
          <input name="phoneNumber" defaultValue={property.phone_number ?? ""} placeholder="Phone" className="h-10 rounded-md border px-3" />
          <input name="whatsappNumber" defaultValue={property.whatsapp_number ?? ""} placeholder="WhatsApp" className="h-10 rounded-md border px-3" />
          <input name="email" defaultValue={property.email ?? ""} placeholder="Email" className="h-10 rounded-md border px-3" />
          <input name="addressLine" defaultValue={property.address_line ?? ""} placeholder="Address" className="h-10 rounded-md border px-3" />
          <input name="district" defaultValue={property.district ?? ""} placeholder="District" className="h-10 rounded-md border px-3" />
          <input name="state" defaultValue={property.state ?? ""} placeholder="State" className="h-10 rounded-md border px-3" />
          <input name="country" defaultValue={property.country ?? ""} placeholder="Country" className="h-10 rounded-md border px-3" />
          <input name="instagramHandle" defaultValue={property.instagram_handle ?? ""} placeholder="Instagram handle" className="h-10 rounded-md border px-3" />
          <input name="instagramUrl" defaultValue={property.instagram_url ?? ""} placeholder="Instagram URL" className="h-10 rounded-md border px-3" />
          <input name="facebookUrl" defaultValue={property.facebook_url ?? ""} placeholder="Facebook URL" className="h-10 rounded-md border px-3" />
          <input name="checkInTime" type="time" defaultValue={property.check_in_time ?? ""} className="h-10 rounded-md border px-3" />
          <input name="checkOutTime" type="time" defaultValue={property.check_out_time ?? ""} className="h-10 rounded-md border px-3" />
          <textarea name="shortIntro" defaultValue={property.short_intro ?? ""} rows={3} placeholder="Short intro" className="rounded-md border p-2 md:col-span-2" />
          <textarea name="fullDescription" defaultValue={property.full_description ?? ""} rows={4} placeholder="Full description" className="rounded-md border p-2 md:col-span-2" />
          <textarea name="bookingNote" defaultValue={property.booking_note ?? ""} rows={3} placeholder="Booking note" className="rounded-md border p-2 md:col-span-2" />
          <textarea name="mapsNote" defaultValue={property.maps_note ?? ""} rows={3} placeholder="Maps note" className="rounded-md border p-2 md:col-span-2" />
          <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="isActive" defaultChecked={property.is_active} /> Property active</label>
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
          <li><code>NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET</code> (optional, default: <code>website-media</code>)</li>
        </ul>
        <p>Find URL and anon key in Supabase Dashboard → Project Settings → API.</p>
        <p>Anon key is intended for browser use and is protected by RLS policies. Never expose the service role key in frontend code or any <code>NEXT_PUBLIC_*</code> env variable.</p>
      </CardContent></Card>
    </div>
  );
}
