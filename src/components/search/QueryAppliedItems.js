import { Box } from "@mui/material";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { useState } from "react";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";

export default function QueryAppliedItems({
  handleFilterRemove,
  variant = "removable",
}) {
  const { selectedFilter, setSelectedFilter, omopFilters, setOmopFilters } = useSelectedEntry();

  const [expandedKey, setExpandedKey] = useState(false);
  const [message, setMessage] = useState(null);

  const handleScopeChange = (keyValue, newScope) => {
    const [baseKey, prevScope] = keyValue.split("__");

    const isDuplicate = selectedFilter.some(
      (filter) => filter.key === baseKey && filter.scope === newScope
    );

    if (isDuplicate) {
      setMessage(COMMON_MESSAGES.doubleFilter);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSelectedFilter((prevFilters) =>
      prevFilters.map((filter) =>
        filter.key === baseKey && filter.scope === prevScope
          ? { ...filter, scope: newScope }
          : filter
      )
    );

    setExpandedKey(null);
  };

  const formatOmopLabel = (f) => {
    const [onto, code] = String(f.id || "").split(":");
    const t = (f.uiType || "checkbox").toLowerCase();
    if (t === "range") {
      const op = f.value?.op;
      const val = f.value?.value;
      if (op != null && val != null) {
        return `${onto || "TERM"}:${code || ""} ${op} ${val}`;
      }
      return `${onto || "TERM"}:${code || ""}`;
    }
    if (t === "text" || t === "select") {
      const displayValue = f.valueLabel ?? f.value;
      return `${onto || "TERM"}:${code || ""}${displayValue != null ? ` = ${displayValue}` : ""}`;
    }
    // checkbox
    return `${onto || "TERM"}:${code || ""}`;
  };

  const removeOmop = (f) => {
    setOmopFilters((prev) => prev.filter((x) => x.id !== f.id));
  };

  return (
    <Box>
      {message && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {selectedFilter.map((filter) => {
          const keyValue =
            filter.key && filter.scope
              ? `${filter.key}__${filter.scope}`
              : `${filter.id || filter.label || Math.random()}__${
                  filter.bgColor || "common"
                }`;
          const bgColor = filter.bgColor === "genomic" ? "genomic" : "common";

          return (
            <FilterLabelRemovable
              key={
                filter.key
                  ? `${filter.key}__${filter.scope}`
                  : `${filter.id}__${filter.label}__genomic`
              }
              keyValue={keyValue}
              label={filter.label}
              scope={filter.scope}
              scopes={filter.scopes}
              onDelete={() => handleFilterRemove(filter)}
              onScopeChange={handleScopeChange}
              bgColor={filter.bgColor || "common"}
              expandedKey={expandedKey}
              setExpandedKey={setExpandedKey}
              variant={variant}
            />
          );
        })}

        {omopFilters.map((f) => {
          const keyValue = `${f.id}__omop`;
          return (
            <FilterLabelRemovable
              key={keyValue}
              keyValue={keyValue}
              label={formatOmopLabel(f)}
              scope={null}
              scopes={[]}
              onDelete={() => removeOmop(f)}
              onScopeChange={undefined}
              bgColor={"omop"}
              expandedKey={expandedKey}
              setExpandedKey={setExpandedKey}
              variant={variant}
            />
          );
        })}
      </Box>
    </Box>
  );
}
