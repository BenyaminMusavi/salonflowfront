"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import BranchEditorItem, {
  createEmptyBranch,
  type BranchEditorValues,
} from "./BranchEditorItem";

interface BranchesSectionProps {
  branches: BranchEditorValues[];
  onChange: (branches: BranchEditorValues[]) => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export default function BranchesSection({
  branches,
  onChange,
  onSave,
  isSaving,
  canSave,
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
        <h2 className="text-sm font-bold text-foreground">شعبه‌ها و آدرس</h2>
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
          />
        ))}

        <Button
          type="button"
          className="w-full"
          onClick={onSave}
          disabled={!canSave || isSaving}
          isLoading={isSaving}
        >
          ذخیره شعبه‌ها
        </Button>
      </div>
    </section>
  );
}
