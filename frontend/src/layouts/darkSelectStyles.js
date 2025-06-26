export const darkSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#16171f",
    borderColor: state.isFocused ? "#FFD600" : "#FFD60055",
    boxShadow: state.isFocused ? "0 0 0 2px #FFD60033" : "",
    borderRadius: 12,
    color: "#fff",
    minHeight: 44,
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
    fontWeight: 600,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#FFD600",
    opacity: 0.8,
    fontWeight: 500,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "#292929"
      : state.isSelected
      ? "#FFD600"
      : "#16171f",
    color: state.isSelected ? "#16171f" : "#fff",
    fontWeight: 600,
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#23233a",
    color: "#FFD600",
    borderRadius: 8,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#FFD600",
    fontWeight: 600,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#FFD600",
    ':hover': {
      backgroundColor: "#FFD60033",
      color: "#FFD600",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#16171f",
    color: "#fff",
    borderRadius: 12,
    zIndex: 99,
    marginTop: 2,
    boxShadow: "0 4px 28px #000b"
  }),
};
