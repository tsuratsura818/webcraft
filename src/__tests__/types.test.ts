import { describe, it, expect } from "vitest";
import {
  PROPOSAL_SECTIONS,
  type ProposalSection,
  type ProposalData,
} from "@/types/proposal";
import {
  createEmptyHearing,
  SITE_TYPES,
  FEATURE_OPTIONS,
  SNS_OPTIONS,
  MATERIAL_OPTIONS,
  CMS_OPTIONS,
  BUDGET_RANGES,
  SERVER_TYPES,
  SSL_OPTIONS,
  PHASES,
} from "@/types/hearing";

describe("ProposalSection 型・定数", () => {
  it("PROPOSAL_SECTIONSが5つのセクションを持つ", () => {
    expect(PROPOSAL_SECTIONS).toHaveLength(5);
  });

  it("各セクションにkey/label/iconが揃っている", () => {
    for (const sec of PROPOSAL_SECTIONS) {
      expect(sec.key).toBeTruthy();
      expect(sec.label).toBeTruthy();
      expect(sec.icon).toBeTruthy();
    }
  });

  it("全セクションキーが正しい", () => {
    const keys = PROPOSAL_SECTIONS.map((s) => s.key);
    expect(keys).toEqual([
      "sitemap",
      "wireframes",
      "topDesign",
      "schedule",
      "clientTasks",
    ]);
  });

  it("ProposalData型の全キーがPROPOSAL_SECTIONSに対応する", () => {
    const keys = PROPOSAL_SECTIONS.map((s) => s.key);
    const proposalDataKeys: ProposalSection[] = [
      "sitemap",
      "wireframes",
      "topDesign",
      "schedule",
      "clientTasks",
    ];
    expect(keys).toEqual(proposalDataKeys);
  });

  it("ProposalData型が文字列プロパティのみ", () => {
    const data: ProposalData = {
      sitemap: "",
      wireframes: "",
      topDesign: "",
      schedule: "",
      clientTasks: "",
    };
    for (const val of Object.values(data)) {
      expect(typeof val).toBe("string");
    }
  });
});

describe("HearingSheet 型・定数", () => {
  it("createEmptyHearing()が全フィールドを含む", () => {
    const empty = createEmptyHearing();
    expect(empty.clientName).toBe("");
    expect(empty.features).toEqual([]);
    expect(empty.snsIntegration).toEqual([]);
    expect(empty.materialsProvided).toEqual([]);
    expect(empty.responsiveRequired).toBe(true);
    expect(empty.seoRequired).toBe(true);
    expect(empty.analyticsRequired).toBe(true);
    expect(empty.maintenanceRequired).toBe(false);
    expect(empty.status).toBe("draft");
  });

  it("createEmptyHearing()のcreatedAt/updatedAtが今日の日付", () => {
    const empty = createEmptyHearing();
    const today = new Date().toISOString().slice(0, 10);
    expect(empty.createdAt).toBe(today);
    expect(empty.updatedAt).toBe(today);
  });

  it("SITE_TYPESが8種類", () => {
    expect(SITE_TYPES).toHaveLength(8);
    expect(SITE_TYPES).toContain("コーポレートサイト");
    expect(SITE_TYPES).toContain("ECサイト");
  });

  it("FEATURE_OPTIONSが15種類", () => {
    expect(FEATURE_OPTIONS).toHaveLength(15);
    expect(FEATURE_OPTIONS).toContain("お問い合わせフォーム");
  });

  it("SNS_OPTIONSが6種類", () => {
    expect(SNS_OPTIONS).toHaveLength(6);
    expect(SNS_OPTIONS).toContain("Instagram");
  });

  it("MATERIAL_OPTIONSが6種類", () => {
    expect(MATERIAL_OPTIONS).toHaveLength(6);
  });

  it("CMS_OPTIONSが6種類", () => {
    expect(CMS_OPTIONS).toHaveLength(6);
    expect(CMS_OPTIONS).toContain("WordPress");
  });

  it("BUDGET_RANGESが7種類", () => {
    expect(BUDGET_RANGES).toHaveLength(7);
  });

  it("SERVER_TYPESが6種類", () => {
    expect(SERVER_TYPES).toHaveLength(6);
  });

  it("SSL_OPTIONSが4種類", () => {
    expect(SSL_OPTIONS).toHaveLength(4);
  });

  it("PHASESが7フェーズ", () => {
    expect(PHASES).toHaveLength(7);
    const keys = PHASES.map((p) => p.key);
    expect(keys).toEqual([
      "basic",
      "analysis",
      "strategy",
      "requirements",
      "design",
      "schedule",
      "operation",
    ]);
  });
});
