"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import BranchEditorItem, {
  createEmptyBranch,
  type BranchEditorErrors,
  type BranchEditorValues,
} from "./BranchEditorItem";

interface BranchesSectionProps {
  branches: BranchEditorValues[];
  onChange: (branches: BranchEditorValues[]) => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty?: boolean;
  /** Per-branch field errors, indexed the same as `branches`. Present only after a save attempt. */
  errors?: BranchEditorErrors[];
}

export default function BranchesSection({
  branches,
  onChange,
  onSave,
  isSaving,
  isDirty = false,
  errors,
}: BranchesSectionProps) {
  const updateBranch = (index: number, values: BranchEditorValues) => {
    onChange(branches.map((b, i) => (i === index ? values : b)));
  };

  const removeBranch = (index: number) => {
    onChange(branches.filter((_, i) => i !== index));
  };

  const addBranch = () => {
    onChange([...branches, createEmptyBranch()]);
  };

  return (
    <section
      id="salon-branches"
      className="scroll-mt-24 rounded-[20px] border border-border bg-surface p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">شعبه‌ها و آدرس</h2>
          {isDirty && (
            <span className="rounded-full bg-warning-background px-2 py-0.5 text-[11px] font-semibold text-warning">
              تغییرات ذخیره‌نشده
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addBranch}
          disabled={isSaving}
          className="gap-1"
        >
          <PlusIcon size={14} />
          افزودن شعبه
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {branches.map((branch, index) => (
          <BranchEditorItem
            key={branch.clientKey}
            index={index}
            values={branch}
            onChange={(values) => updateBranch(index, values)}
            onRemove={() => removeBranch(index)}
            canRemove={branches.length > 1}
            errors={errors?.[index]}
          />
        ))}

        <Button
          type="button"
          className="w-full"
          onClick={onSave}
          disabled={isSaving}
          isLoading={isSaving}
        >
          ذخیره شعبه‌ها
        </Button>
      </div>
    </section>
  );
}
