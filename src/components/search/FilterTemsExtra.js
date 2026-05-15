import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputBase,
  Button,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";

export default function FilterTermsExtra() {
  const { extraFilter, setExtraFilter, setSelectedFilter, setLoadingData, setResultData, setHasSearchResult } = useSelectedEntry();

  const handleCancel = () => {
    setExtraFilter(null);
    setSelectedOperator(">");
    setSelectedValue("");
    setSelectedScope("condition");
    setError("");
  };
  const [selectedOperator, setSelectedOperator] = useState(">");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedScope, setSelectedScope] = useState("condition");
  const [error, setError] = useState("");

  const handleAddFilter = () => {
    setError("");
    if (!selectedValue) {
      setError(COMMON_MESSAGES.fillFields);
      return;
    }

    const normalized = selectedValue.replace(",", ".");
    const valueType = extraFilter.valueType;

    if (valueType === "integer") {
      if (!/^-?\d+$/.test(normalized.trim())) {
        setError(COMMON_MESSAGES.invalidInteger);
        return;
      }
    } else if (valueType === "decimal") {
      if (isNaN(Number(normalized.trim())) || normalized.trim() === "") {
        setError(COMMON_MESSAGES.invalidDecimal);
        return;
      }
    }

    setSelectedFilter((prevFilters) => {
      if (prevFilters.some((filter) => filter.key === extraFilter.key)) {
        return prevFilters;
      }
      const extraFilterCustom = {
        field: extraFilter.key,
        operator: selectedOperator,
        value: normalized,
        label: extraFilter.key === "ageOfOnset"
          ? `${extraFilter.label} ${selectedOperator} ${normalized} (${selectedScope})`
          : `${extraFilter.label} ${selectedOperator} ${normalized}`,
        scope: extraFilter.key === "ageOfOnset" ? selectedScope : (extraFilter.scope || null),
        scopes: extraFilter.scopes || [],
        type: extraFilter.type || "alphanumeric",
      };
      setExtraFilter(null);
      setSelectedOperator(">");
      setSelectedValue("");
      return [...prevFilters, extraFilterCustom];
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        pt: 2,
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography
          sx={{
            color: "black",
            fontSize: "14px",
            fontFamily: '"Open Sans", sans-serif',
            minWidth: "80px",
          }}
        >
          Insert value:
        </Typography>
      </Box>
      {extraFilter.key === "ageOfOnset" && (
        <Box>
          <FormControl
            sx={{
              minWidth: 110,
              border: `1px solid ${CONFIG.ui.colors.primary}`,
              borderRadius: "10px",
              transition: "flex 0.3s ease",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiSelect-select": { padding: "5px 12px" },
            }}
            size="small"
          >
            <Select
              value={selectedScope}
              displayEmpty
              onChange={(e) => setSelectedScope(e.target.value)}
              sx={{
                "& fieldset": { border: "none" },
                p: 0,
              }}
            >
              <MenuItem value="condition">Condition</MenuItem>
              <MenuItem value="measurement">Measurement</MenuItem>
              <MenuItem value="observation">Observation</MenuItem>
              <MenuItem value="procedure">Procedure</MenuItem>
              <MenuItem value="treatments">Treatments</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      <Box>
        <FormControl
          sx={{
            minWidth: 60,
            border: `1px solid ${CONFIG.ui.colors.primary}`,
            borderRadius: "10px",
            transition: "flex 0.3s ease",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-select": {
              padding: "5px 12px",
            },
          }}
          size="small"
        >
          <Select
            labelId="select-value"
            id="select-value"
            value={selectedOperator}
            displayEmpty
            onChange={(e) => setSelectedOperator(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                border: "none",
              },
              "& fieldset": {
                border: "none",
              },
              p: 0,
            }}
          >
            <MenuItem value=">">{">"}</MenuItem>
            <MenuItem value=">=">{">="}</MenuItem>
            <MenuItem value="=">{"="}</MenuItem>
            <MenuItem value="<=">{"<="}</MenuItem>
            <MenuItem value="<">{"<"}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${CONFIG.ui.colors.primary}`,
          borderRadius: "10px",
          backgroundColor: "#fff",
          transition: "flex 0.3s ease",
          fontFamily: '"Open Sans", sans-serif',
          padding: "1px 12px",
          minWidth: "100px",
        }}
      >
        <InputBase
          placeholder="Value"
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          sx={{
            fontFamily: '"Open Sans", sans-serif',
            fontSize: "14px",
          }}
        />
        {extraFilter.unit && (
          <Typography sx={{ fontSize: "13px", color: "#9E9E9E", pl: 0.5, fontFamily: '"Open Sans", sans-serif' }}>
            {extraFilter.unit}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          fontFamily: '"Open Sans", sans-serif',
          padding: "0px",
          maxWidth: "30px",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleAddFilter}
          sx={{
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 400,
            fontFamily: '"Open Sans", sans-serif',
            backgroundColor: "white",
            border: `1px solid ${CONFIG.ui.colors.primary}`,
            color: CONFIG.ui.colors.primary,
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            minWidth: "30px",
            minHeight: "30px",
            padding: 0,
            "&:hover": {
              backgroundColor: CONFIG.ui.colors.primary,
              color: "white",
            },
          }}
        >
          <AddIcon fontSize="small" />
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "0px",
          maxWidth: "30px",
        }}
      >
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            textTransform: "none",
            backgroundColor: "white",
            border: `1px solid #9E9E9E`,
            color: "#9E9E9E",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            minWidth: "30px",
            minHeight: "30px",
            padding: 0,
            "&:hover": {
              backgroundColor: "#9E9E9E",
              color: "white",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </Box>
      {error && <CommonMessage text={error} type="error" />}
    </Box>
  );
}
