import React, { useMemo, useState } from "react";
import "./input.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

/**
 * Backward compatible TextBox:
 * - old props: change, onClick, minDate, maxDate, pointer, inputLabelClass, checkboxLabel, icons, etc.
 * - new props: onChange, min, max, options (for select)
 *
 * Supports:
 * - input types (text, number, password, email, month, date, etc.)
 * - select (type="select")
 * - checkbox
 */
export default function TextBox({
  inputClass = "",
  inputDivClass = "",
  inputLabelClass = "",

  label,
  name = "input-box",

  value,
  defaultValue, // ✅ helps uncontrolled forms if any page uses it

  type = "text",
  placeholder = "Enter value",

  // ✅ BOTH supported
  onChange,
  change,

  onClick, // old prop
  isEditable = true,

  // ✅ BOTH supported
  min,
  max,
  minDate,
  maxDate,

  required = false,
  icons,
  checkboxLabel,
  pointer = false,

  // for select
  options = [],

  // pass-through props (helps login pages: id, autoComplete, onKeyDown, etc.)
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  // ✅ fallback to old handler
  const effectiveOnChange = onChange || change || (() => {});
  const effectiveMin = min ?? minDate ?? undefined;
  const effectiveMax = max ?? maxDate ?? undefined;

  const isSelect = type === "select";
  const isCheckbox = type === "checkbox";

  const inputType = useMemo(() => {
    if (isSelect) return undefined;
    if (type === "password") return showPassword ? "text" : "password";
    return type;
  }, [type, showPassword, isSelect]);

  const paddingLeft = icons ? "36px" : "";
  const marginTop = label ? "5px" : "";

  const fieldClassName = `${inputClass} ${!isEditable ? "unhovered" : "input-field"} ${
    pointer ? "input-pointer" : ""
  }`;

  const renderField = () => (
    <div className={`input-content ${pointer ? "input-pointer" : ""}`}>
      {icons && (
        <div className="input-icons" style={label ? { top: "15px" } : { top: "10px" }}>
          {icons}
        </div>
      )}

      <div className={`${isCheckbox ? "input-checkbox" : ""}`}>
        {isSelect ? (
          <select
            style={{ paddingLeft, marginTop }}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={effectiveOnChange}
            className={fieldClassName}
            disabled={!isEditable}
            required={required}
            {...rest}
          >
            {(options || []).map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            style={{ paddingLeft, marginTop }}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={effectiveOnChange}
            className={fieldClassName}
            type={inputType}
            placeholder={placeholder}
            disabled={!isEditable}
            min={effectiveMin}
            max={effectiveMax}
            required={required}
            {...rest}
          />
        )}

        {checkboxLabel && <label className="input-label">{checkboxLabel}</label>}
      </div>

      {/* ✅ Password toggle
          IMPORTANT: stopPropagation prevents wrapper click / form weirdness
      */}
      {type === "password" && (
        <button
          type="button"
          className="password-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPassword((prev) => !prev);
          }}
          disabled={!isEditable}
          tabIndex={-1}
        >
          {showPassword ? <FaRegEye size={17} /> : <FaRegEyeSlash size={17} />}
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`input-container ${inputDivClass || ""}`}
      // ✅ keep old behavior: click on container triggers onClick
      onClick={onClick}
    >
      {label ? (
        <label className={`input-label ${inputLabelClass || ""}`}>
          {label}
          {renderField()}
        </label>
      ) : (
        renderField()
      )}
    </div>
  );
}
