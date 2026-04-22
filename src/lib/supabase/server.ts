// TODO: replace with real Supabase server client setup.
export function getSupabaseServerClient() {
  return {
    from: () => {
      throw new Error("Supabase server placeholder: connect real client before use.");
    },
  };
}
