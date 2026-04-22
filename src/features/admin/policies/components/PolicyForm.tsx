import { createPoliciesAction, deletePoliciesAction, updatePoliciesAction } from "@/actions/admin/policies";
import { FormActions } from "@/components/admin/shared/FormActions";

export function PolicyForm({ policy, propertyOptions }: { policy?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={policy ? updatePoliciesAction : createPoliciesAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {policy ? <input type="hidden" name="id" value={String(policy.id)} /> : null}
        <label className="block text-sm"><span className="mb-1 block">Property</span><select name="property_id" defaultValue={String(policy?.property_id ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2">{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="block text-sm"><span className="mb-1 block">Policy Key</span><input name="policy_key" defaultValue={String(policy?.policy_key ?? "")} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Title</span><input name="title" defaultValue={String(policy?.title ?? "")} required className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <label className="block text-sm"><span className="mb-1 block">Content</span><textarea name="content" defaultValue={String(policy?.content ?? "")} rows={7} className="w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <input type="hidden" name="sort_order" value={String(policy?.sort_order ?? 0)} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={Boolean(policy?.is_active ?? true)} /> Active</label>
        <FormActions submitLabel={policy ? "Update Policy" : "Create Policy"} />
      </form>
      {policy ? <form action={deletePoliciesAction} className="mt-3"><input type="hidden" name="id" value={String(policy.id)} /><button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Delete Policy</button></form> : null}
    </>
  );
}
