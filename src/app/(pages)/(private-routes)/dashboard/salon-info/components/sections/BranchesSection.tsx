"use client";

import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";
import BranchEditorItem, {
  type BranchEditorValues,
} from "./BranchEditorItem";

const emptyBranch = (): BranchEditorValues => ({
  name: "",
  city: "",
  address: "",
  phone: "",
  genderType: 3,
});

export default function BranchesSection() {
  const [branches, setBranches] = useState<BranchEditorValues[]>([
    emptyBranch(),
  ]);

  const updateBranch = (index: number, values: BranchEditorValues) => {
    setBranches((prev) => prev.map((b, i) => (i === index ? values : b)));
  };

  const removeBranch = (index: number) => {
    setBranches((prev) => prev.filter((_, i) => i !== index));
  };

  const addBranch = () => {
    setBranches((prev) => [...prev, emptyBranch()]);
  };

  return (
    <section
      id="salon-branches"
      className="scroll-mt-14 rounded-lg bg-surface-secondary p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-foreground">شعبه‌ها و آدرس</h2>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addBranch}
          className="gap-1"
        >
          <PlusIcon size={14} />
          افزودن شعبه
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {branches.map((branch, index) => (
          <BranchEditorItem
            key={index}
            index={index}
            values={branch}
            onChange={(values) => updateBranch(index, values)}
            onRemove={() => removeBranch(index)}
            canRemove={branches.length > 1}
          />
        ))}

        <Button type="button" disabled className="w-full">
          ذخیره شعبه‌ها
        </Button>
        <p className="text-xs text-foreground-muted">
          ذخیره شعبه‌ها در مرحله بعد به API متصل می‌شود.
        </p>
      </div>
    </section>
  );
}
