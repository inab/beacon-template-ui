import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Button,
  Tooltip,
  Chip,
  Divider,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelectedEntry } from "../context/SelectedEntryContext";

async function loadDefaultData() {
  const res = await fetch("/config/omop_filters_grouped.json");
  if (!res.ok) throw new Error("No se pudo cargar filters_grouped.json");
  return await res.json();
}

const filterValue = (f) => String(f?.id ?? f?.code ?? f?.label ?? "");

export default function OmopFilters({ data, onChange }) {
  const [json, setJson] = useState(data || null);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [value, setValue] = useState(null);
  const [rangeError, setRangeError] = useState("");
  const { setOmopFilters } = useSelectedEntry();

  const CFG = globalThis.CONFIG ?? {};
  const primary = CFG.ui?.colors?.primary || "#1976d2";

  const unitFull = /\[(.*?)\]/.exec(selectedFilter?.label || "")?.[1] || "";

  const unitShort = unitFull
    .replace(/Moles/i, "mol")
    .replace(/Units/i, "U")
    .replace(/volume/i, "vol");

  useEffect(() => {
    if (data) return;
    let mounted = true;
    loadDefaultData()
      .then((d) => mounted && setJson(d))
      .catch((e) => mounted && setError(e.message));
    return () => {
      mounted = false;
    };
  }, [data]);

  useEffect(() => {
    if (typeof onChange === "function" && selectedFilter) {
      onChange({ [selectedFilter.id ?? selectedFilter.code]: value });
    }
  }, [value, selectedFilter, onChange]);

  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!json) return <Typography>Cargando…</Typography>;

  const groups = json.groups || [];
  const currentGroup = groups.find((g) => g.group_id === selectedGroup);
  const filters = currentGroup?.filters || [];

  const getFilterId = (f) => String(f?.code ?? f?.id ?? f?.label ?? "");

  const upsertFilter = (list, next) => {
    const i = list.findIndex((f) => f.id === next.id);
    if (i === -1) return [...list, next];
    const copy = list.slice();
    copy[i] = next;
    return copy;
  };

  const normalizeValueForContext = (uiType, value) => {
    const t = (uiType || "checkbox").toLowerCase();
    if (t === "checkbox") return true;

    if (t === "range") {
      const op = value?.op || "<";
      const raw = value?.num;
      if (raw === "" || raw == null || isNaN(Number(raw))) return null;
      const n = Number(raw);
      if (op === "<")  return { min: undefined, max: n };
      if (op === ">")  return { min: n, max: undefined };
      return { min: n, max: n };
    }

    if (value == null || String(value).trim() === "") return null;
    return String(value);
  };

  const hasValidValue = (uiType, value) => {
    const t = (uiType || "checkbox").toLowerCase();
    if (t === "checkbox") return true;
    if (t === "range") {
      const num = value?.num;
      return num !== "" && num != null && !isNaN(Number(num));
    }
    return value != null && String(value).trim() !== "";
  };

  const handleAddFilter = () => {
    if (!selectedFilter) return;
    const id = getFilterId(selectedFilter);
    const uiType = (selectedFilter.ui_type || "checkbox").toLowerCase();

    if (!hasValidValue(uiType, value)) return;
    const normalized = normalizeValueForContext(uiType, value);
    if (normalized === null) return;

    setOmopFilters((prev) =>
      upsertFilter(prev, { id, uiType, value: normalized })
    );

    setSelectedFilter(null);
    setValue(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 400, paddingTop: 1 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Group</InputLabel>
        <Select
          value={selectedGroup}
          label="Group"
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            setSelectedFilter(null);
            setValue(null);
          }}
          sx={{
            "& .MuiSelect-select": {
              paddingTop: "5px",
              paddingBottom: "5px",
              paddingLeft: "12px",
              paddingRight: "32px",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: CONFIG.ui.colors.primary,
            },
          }}
        >
          <MenuItem value="">
            <em>Select a group</em>
          </MenuItem>
          {groups.map((g) => (
            <MenuItem key={g.group_id} value={g.group_id}>
              {g.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filters.length > 0 && (
        <FormControl fullWidth size="small">
          <InputLabel>Filters</InputLabel>
          <Select
            value={selectedFilter ? filterValue(selectedFilter) : ""}
            label="Filter"
            onChange={(e) => {
              const v = e.target.value;
              const f = filters.find((x) => filterValue(x) === v) || null;
              setSelectedFilter(f);
              setValue(null);
              setRangeError("");
            }}
            sx={{
                "& .MuiSelect-select": {
                  paddingTop: "5px",
                  paddingBottom: "5px",
                  paddingLeft: "12px",
                  paddingRight: "32px",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: CONFIG.ui.colors.primary,
                },
              }}
            >
            <MenuItem value="">
              <em>Select a filter</em>
            </MenuItem>
            {filters.map((f) => (
              <MenuItem key={filterValue(f)} value={filterValue(f)}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedFilter && (
        <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: 13
              }}>
              {selectedFilter.label}
            </Typography>
            <IconButton
              size="small"
              onClick={() => { setSelectedFilter(null); setValue(null); setRangeError(""); }}
              sx={{ color: "#9E9E9E", "&:hover": { color: "#555" } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            {unitFull && (
              <Box sx={{ display: "flex", justifyContent: "start", with: "100%", paddingBottom: "7px" }}>
                <Tooltip title={unitFull} arrow>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={unitShort}
                    sx={{ fontSize: "0.75rem", height: 28 }}
                  />
                </Tooltip>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 1 }}>
            {(() => {
              const type = (selectedFilter.ui_type || "checkbox").toLowerCase();

              if (type === "range") {
                const op = value?.op || "<";
                const num = value?.num ?? "";
                const opLabelId = "op-label";

                return (
                  <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 76, maxWidth: 86 }}>
                      <InputLabel id={opLabelId}>Op</InputLabel>
                      <Select
                        labelId={opLabelId}
                        id={`${opLabelId}-select`}
                        label="Op"
                        value={op}
                        onChange={(e) => setValue({ op: e.target.value, num })}
                        sx={{
                          height: 30,
                          "& .MuiSelect-select": {
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            padding: "0 12px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: primary },
                          "& .MuiSelect-icon": { color: primary },
                        }}
                      >
                        <MenuItem value="<">&lt;</MenuItem>
                        <MenuItem value=">">&gt;</MenuItem>
                        <MenuItem value="=">=</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      label="Value"
                      placeholder="Value"
                      value={num ?? ""}
                      InputLabelProps={{ shrink: true }}
                      error={!!rangeError}
                      helperText={rangeError}
                      onChange={(e) => {
                        const normalized = e.target.value.replace(",", ".");
                        if (normalized !== "" && isNaN(Number(normalized))) {
                          setRangeError("Please enter a number using dot as decimal separator (e.g. 70.5).");
                        } else {
                          setRangeError("");
                        }
                        setValue({ op, num: normalized });
                      }}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 30,
                        },
                        "& .MuiOutlinedInput-input": {
                          height: "100%",
                          padding: "0 12px",
                          display: "flex",
                          alignItems: "center",
                        },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: primary },
                      }}
                    />
                  </Box>
                );
              }

              if (type === "text") {
                return (
                  <TextField
                    fullWidth
                    label="Valor"
                    value={value || ""}
                    onChange={(e) => setValue(e.target.value)}
                    sx={{
                      '& label.Mui-focused': {
                        color: primary,
                      },
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: primary,
                        },
                      },
                    }}
                  />
                );
              }

              if (type === "select") {
                return (
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: primary }}>Valor</InputLabel>
                    <Select
                      value={value || ''}
                      onChange={(e) => setValue(e.target.value)}
                      sx={{
                        '.MuiOutlinedInput-notchedOutline': { borderColor: primary },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: primary,
                        },
                        '& .MuiSelect-icon': { color: primary },
                      }}
                    >
                      <MenuItem value=""><em>Select…</em></MenuItem>
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                );
              }

              return null;
            })()}
          </Box>
          
          <Box>
            <Button 
              variant="outlined"
              size="small"
              onClick={handleAddFilter}
              disabled={!selectedFilter || !hasValidValue(selectedFilter.ui_type, value)}
              sx={{
                mt: 2,
                borderRadius: "999px",
                textTransform: "none",
                fontFamily: '"Open Sans", sans-serif',
                fontSize: "14px",
                fontWeight: 700,
                color: CONFIG.ui.colors.darkPrimary,
                borderColor: CONFIG.ui.colors.darkPrimary,
                '&:hover': {
                  backgroundColor: '#f2f2f2',
                },
              }}
            >
              Add Filter
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
