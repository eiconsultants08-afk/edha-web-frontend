export const STATUS_COLORS = {
  NORMAL: { bg: "#E7F7EF", fg: "#11865B" },
  HIGH: { bg: "#FDECEC", fg: "#B42318" },
  LOW: { bg: "#FFF4E5", fg: "#A05A00" },
};

export const DEFAULT_COLOR = { bg: "#F3F4F6", fg: "#6B7280" };

export const qualitativeTests = [
  "hiv",
  "hbsag",
  "hcv",
  "dengue",
  "malaria",
  "covid",
  "typhoid",
  "pregnancy",
];

export const isQualitative = (testType = {}) => {
  const name = String(
    testType?.name || testType?.test_type_name || testType?.test_name || ""
  )
    .toLowerCase()
    .trim();

  return qualitativeTests.some((keyword) => name.includes(keyword));
};

export const getDisplayValue = (result = {}) => {
  if (result?.value_num != null && result?.value_num !== "") return result.value_num;
  if (result?.value_text != null && result?.value_text !== "") return result.value_text;
  if (result?.result_value != null && result?.result_value !== "") return result.result_value;
  return "----";
};

export const resolveStatus = (result = {}, testType = {}, gender = "") => {
  const textValue = String(
    result?.value_text ?? result?.result_value ?? ""
  )
    .trim()
    .toLowerCase();

  if (isQualitative(testType)) {
    if (textValue === "negative") return "NORMAL";
    if (textValue === "positive") return "HIGH";
    return null;
  }

  const valueNum =
    result?.value_num != null && result?.value_num !== ""
      ? Number(result.value_num)
      : result?.result_value != null &&
        result?.result_value !== "" &&
        !isNaN(Number(result.result_value))
      ? Number(result.result_value)
      : null;

  if (valueNum == null || !testType) return null;

  const v = Number(valueNum);
  if (!Number.isFinite(v)) return null;

  const g = String(gender || "").toUpperCase();

  const min =
    g === "MALE" && testType.male_min != null
      ? Number(testType.male_min)
      : g === "FEMALE" && testType.female_min != null
      ? Number(testType.female_min)
      : testType.normal_min != null
      ? Number(testType.normal_min)
      : null;

  const max =
    g === "MALE" && testType.male_max != null
      ? Number(testType.male_max)
      : g === "FEMALE" && testType.female_max != null
      ? Number(testType.female_max)
      : testType.normal_max != null
      ? Number(testType.normal_max)
      : null;

  if (min != null && max != null) {
    if (v < min) return "LOW";
    if (v > max) return "HIGH";
    return "NORMAL";
  }

  const op = testType.threshold_operator;
  const threshold =
    testType.threshold_value != null ? Number(testType.threshold_value) : null;

  if (!op || threshold == null || !Number.isFinite(threshold)) return null;

  const exceeded =
    op === ">" ? v > threshold :
    op === ">=" ? v >= threshold :
    op === "<" ? v < threshold :
    op === "<=" ? v <= threshold :
    false;

  if (exceeded) {
    return op === ">" || op === ">=" ? "HIGH" : "LOW";
  }

  return "NORMAL";
};

export const refRangeLabel = (testType = {}, gender = "") => {
  const g = String(gender || "").toUpperCase();

  const min =
    g === "MALE" && testType.male_min != null
      ? Number(testType.male_min)
      : g === "FEMALE" && testType.female_min != null
      ? Number(testType.female_min)
      : testType.normal_min != null
      ? Number(testType.normal_min)
      : null;

  const max =
    g === "MALE" && testType.male_max != null
      ? Number(testType.male_max)
      : g === "FEMALE" && testType.female_max != null
      ? Number(testType.female_max)
      : testType.normal_max != null
      ? Number(testType.normal_max)
      : null;

  if (min == null || max == null) return null;

  return `${min} - ${max}${testType.unit ? " " + testType.unit : ""}`;
};

export const getStatusColors = (status) => {
  return STATUS_COLORS[status] || DEFAULT_COLOR;
};