import { createPoliciesAction, deletePoliciesAction, updatePoliciesAction } from "@/actions/admin/policies";
import { FormActions } from "@/components/admin/shared/FormActions";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";

export function PolicyForm({ policy, propertyOptions }: { policy?: Record<string, unknown> | null; propertyOptions: { id: string; name: string }[] }) {
  return (
    <>
      <form action={policy ? updatePoliciesAction : createPoliciesAction} className="space-y-4 rounded-2xl border border-[#e1d9cc] bg-white p-4 sm:p-5">
        {policy ? <input type="hidden" name="id" value={String(policy.id)} /> : null}
        <h2 className="font-semibold text-[#274734]">Policy Content</h2>
        <label className="block text-sm">Property<select name="property_id" defaultValue={String(policy?.property_id ?? "")} required className={inputClass}>{propertyOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label className="block text-sm">Policy Key<input name="policy_key" defaultValue={String(policy?.policy_key ?? "")} className={inputClass} /></label>
        <label className="block text-sm">Title<input name="title" defaultValue={String(policy?.title ?? "")} required className={inputClass} /></label>
        <label className="block text-sm">Content<textarea name="content" defaultValue={String(policy?.content ?? "")} rows={7} className={inputClass} /></label>
        <input type="hidden" name="sort_order" value={String(policy?.sort_order ?? 0)} />
        <label className="flex items-center gap-2 text-sm text-[#33533f]"><input type="checkbox" name="is_active" defaultChecked={Boolean(policy?.is_active ?? true)} /> Active</label>
        <FormActions submitLabel={policy ? "Update Policy" : "Create Policy"} />
      </form>
      {policy ? <form action={deletePoliciesAction} className="mt-4"><input type="hidden" name="id" value={String(policy.id)} /><SubmitButton pendingText="Deleting..." className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">Delete Policy</SubmitButton></form> : null}
    </>
  );
}
