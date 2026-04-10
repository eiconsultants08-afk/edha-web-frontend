import React, { useEffect, useState, useRef } from "react";
import "./dropdown.css";
import { FaAngleDown } from "react-icons/fa";
import { TiTick } from "react-icons/ti";

export default function Dropdown({
  options,
  onSelect,
  optioncheckBox,
  optionTitle,
  label,
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [checkAll, setCheckAll] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setCheckAll(options.every((item) => item.isSelected));
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) =>
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      setIsClicked(false);

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedValue(null); // whenever optionTitle changes, reset internal state
  }, [optionTitle]);

  const handleClickDropdown = () => {
    setIsClicked(!isClicked);
  };

  const handleOptionClick = (option) => {
    if (optioncheckBox) {
      setIsClicked(true);

      option.isSelected = !option.isSelected;

      setCheckAll(!options.some((item) => !item.isSelected));

      onSelect(options);
    } else {
      setSelectedValue(option.name);
      setIsClicked(!isClicked);
      onSelect(option);
    }
  };

  const handleAllCheckbox = () => {
    options.map((item) => (item.isSelected = true));

    setCheckAll(!options.some((item) => !item.isSelected));

    onSelect(options);
  };

  const dropdownList = () => {
    return options.map((option, index) => {
      return (
        <li
          key={index}
          onClick={() => handleOptionClick(option)}
          className={`${option.isSelected ? "checkbox-list" : ""}`}
        >
          {!optioncheckBox ? (
            <span>{option.name}</span>
          ) : (
            <div className="checkbox-option">
              <span>
                <TiTick />
              </span>{" "}
              <p>{option.name}</p>
            </div>
          )}
        </li>
      );
    });
  };

  return (
    <div>
      <p className="dropdown-label">{label}</p>
      <div className="dropdown-container" ref={dropdownRef}>
        <div className="dropdown-content" onClick={handleClickDropdown}>
          <div className="dropdown-title">
            {optioncheckBox
              ? optionTitle
              : selectedValue
              ? selectedValue
              : optionTitle}
          </div>

          <div>
            <FaAngleDown
              size={window.innerWidth < 768 ? 16 : 20}
              className={`arrow-down ${isClicked ? " arrow-up" : ""}`}
            />
          </div>
        </div>

        {isClicked && (
          <ul
            className="dropdown-list"
            style={
              options.length >= 4 ? { height: "207px" } : { height: "auto" }
            }
          >
            {optioncheckBox && (
              <div
                className={`option-checkall ${checkAll ? "checkbox-list" : ""}`}
                onClick={handleAllCheckbox}
              >
                <span>
                  <TiTick />
                </span>
                <p>Check All</p>
              </div>
            )}
            {dropdownList()}
          </ul>
        )}
      </div>
    </div>
  );
}
