import { extractScoreFromText, cn } from "../lib/utils";

describe("extractScoreFromText", () => {
  it("should extract digits from text", () => {
    expect(extractScoreFromText("Your final score is 85")).toBe(85);
    expect(extractScoreFromText("Performance: 90/100")).toBe(90);
  });

  it("should extract scores written as words", () => {
    expect(extractScoreFromText("Your final score is eighty five")).toBe(85);
    expect(extractScoreFromText("The assessment shows sixty seven marks")).toBe(67);
  });

  it("should handle 'one hundred' correctly", () => {
    expect(extractScoreFromText("Final score is one hundred")).toBe(100);
  });

  it("should return 0 for text with no score", () => {
    expect(extractScoreFromText("Good job on the interview!")).toBe(0);
  });
});

describe("cn utility", () => {
  it("should merge tailwind classes correctly", () => {
    expect(cn("bg-red-500", "p-4")).toContain("bg-red-500 p-4");
    expect(cn("p-4", "p-2")).toBe("p-2"); // twMerge should handle conflicts
  });
});
