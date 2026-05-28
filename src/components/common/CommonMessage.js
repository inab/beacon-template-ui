import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

export const COMMON_MESSAGES = {
  noMatch: "No match found. Try another filter.",
  loadingTerms: "Loading filtering terms...",
  filteringResults: "Filtering results...",
  doubleFilter:
    "This filter is already in use. Choose another one to continue.",
  loadingData: "Loading data...",
  fillFields: "Please fill in all the fields",
  addFilter: "Please apply at least one filter to run this search.",
  unauthorized: "Authentication required. Please log in to access this data.",
  invalidInteger: "Please enter a whole number (e.g. 60)",
  invalidDecimal: "Please enter a valid number (e.g. 170 or 70.5)",
};

export default function CommonMessage({ text, type }) {
  const severity = type === "error" ? "error" : "success";

  return (
    <Stack
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      spacing={2}
    >
      <Alert
        severity={severity}
        sx={{ width: "80%", justifyContent: "center", alignItems: "center" }}
      >
        {text}
      </Alert>
    </Stack>
  );
}
