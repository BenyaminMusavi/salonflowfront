import { describe, expect, it } from "vitest";
import { GenderType } from "@/services/common/enums/domain-enums";
import { GENDER_AUDIENCE_LEGEND, getGenderAudience } from "./genderAudience";

describe("getGenderAudience", () => {
  it("maps the real branch audience values", () => {
    expect(getGenderAudience(GenderType.Female).key).toBe("female");
    expect(getGenderAudience(GenderType.Male).key).toBe("male");
    expect(getGenderAudience(GenderType.Mixed).key).toBe("mixed");
  });

  it("never guesses: missing or legacy values are «unknown»", () => {
    expect(getGenderAudience(null).key).toBe("unknown");
    expect(getGenderAudience(undefined).key).toBe("unknown");
    expect(getGenderAudience(0).key).toBe("unknown");
    expect(getGenderAudience(9).key).toBe("unknown");
  });

  it("gives every audience its own marker shape, so colour is not the only cue", () => {
    const shapes = GENDER_AUDIENCE_LEGEND.map((m) => m.markerShape);
    expect(new Set(shapes).size).toBe(shapes.length);
  });
});
