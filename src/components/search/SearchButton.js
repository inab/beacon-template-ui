import { Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { COMMON_MESSAGES } from "../common/CommonMessage";
import { PATH_SEGMENT_TO_ENTRY_ID } from "../../components/common/textFormatting";
import { useAuth } from "react-oidc-context";

export default function SearchButton({ setSelectedTool }) {
  const {
    selectedPathSegment,
    setLoadingData,
    setResultData,
    setHasSearchResult,
    selectedFilter,
    entryTypesConfig,
    setMessage,
    setHasSearchBeenTriggered,
    loadingData,
    isLoaded,
    setIsLoaded,
    omopFilters,
    setSearchJSON
  } = useSelectedEntry();

  const auth = useAuth();

  const isLogged = auth.isAuthenticated && !auth.user?.expired;

  const token = isLogged ? auth.user?.access_token : null;

  const handleSearch = async () => {
    const entryTypeId = PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment];
    const configForEntry = entryTypesConfig?.[entryTypeId];
    const nonFilteredAllowed =
      configForEntry?.nonFilteredQueriesAllowed ?? true;

    if (!nonFilteredAllowed && selectedFilter.length === 0 && omopFilters.length === 0) {
      setMessage(COMMON_MESSAGES.addFilter);
      setResultData([]);
      setHasSearchResult(true);
      return;
    }

    setMessage(null);
    setSelectedTool(null);
    setLoadingData(true);
    setResultData([]);
    setHasSearchBeenTriggered(true);

    try {
      const url = `${CONFIG.apiUrl}/${selectedPathSegment}`;
      let response;

      const query = queryBuilder(selectedFilter, omopFilters, entryTypeId);

      let requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      };

      setSearchJSON(requestOptions);

      if(token && token !== "undefined") {
        requestOptions.headers.Authorization = `Bearer ${token}`
      }

      response = await fetch(url, requestOptions);

      if (!response.ok) {
        console.error("Fetch failed:", response.status);
        setResultData([]);
        setHasSearchResult(true);
        setLoadingData(false);
        return;
      }

      const data = await response.json();
      
      // group beacons
      const rawItems = data?.response?.resultSets ?? data?.response?.collections ?? [];

      const groupedArray = Object.values(
        Object.values(rawItems).reduce((acc, item) => {
          const isBeaconNetwork = !!item.beaconId;
          const key = isBeaconNetwork ? item.beaconId : item.id;

          if (!acc[key]) {
            acc[key] = {
              ...(isBeaconNetwork
                ? { beaconId: item.beaconId, id: item.id }
                : { id: item.id }),
              exists: item.exists,
              info: item.info || null,
              totalResultsCount: 0,
              setType: item.setType,
              items: [],
              description: item.description ?? "",
            };
          }

          const count = Number(item.resultsCount) || 0;
          acc[key].totalResultsCount += count;

          if (Array.isArray(item.results)) {
            acc[key].items.push({
              dataset: item.id,
              results: item.results,
            });
          }

          return acc;
        }, {})
      );
      setResultData(groupedArray);
      setHasSearchResult(true);
    } catch (error) {
      setResultData([]);
      setHasSearchResult(true);
    } finally {
      setHasSearchResult(true);
      setLoadingData(false);
      setIsLoaded(true);
    }
  };

  const queryBuilder = (classicParams, omopParams, entryId) => {
    const filter = {
      meta: { apiVersion: "2.0" },
      query: {
        filters: [],
        includeResultsetResponses: "HIT",
        pagination: { skip: 0, limit: 10 },
        testMode: false,
        requestedGranularity: "record",
      },
    };

    const classicSrc = Array.isArray(classicParams) ? classicParams.filter(Boolean) : [];
    const omopSrc    = Array.isArray(omopParams)    ? omopParams.filter(Boolean)    : [];
    const classic = classicSrc.flatMap((item, idx) => {
      try {
        if (item && item.operator) {
          const out = { id: item.field, operator: item.operator, value: parseFloat(item.value) || item.value };
          if (item.scope) out.scope = item.scope;
          return [out];
        }
        const id = item?.key ?? item?.id;
        if (!id) {
          console.warn("[QB] classic without id", idx, item);
          return [];
        }
        const out = { id, scope: entryId };
        return [out];
      } catch (e) {
        console.error("[QB] classic error", idx, item, e);
        return [];
      }
    });

    const omop = omopSrc.flatMap((f, idx) => {
      try {
        const id = f?.id ?? f?.code;
        if (!id) {
          return [];
        }
        const t = String(f?.uiType || "checkbox").toLowerCase();

        if (t === "checkbox" || f?.value === true) {
          const out = { id, "includeDescendantTerms": true };
          return [out];
        }

        if (t === "range") {
          const min = f?.value?.min;
          const max = f?.value?.max;
          const parts = [];
          if (min != null && String(min) !== "") parts.push({ id, operator: ">", value: Number(min) });
          if (max != null && String(max) !== "") parts.push({ id, operator: "<", value: Number(max) });
          return parts;
        }

        if (f?.value != null && String(f.value).trim() !== "") {
          const out = { id, operator: "=", value: f.value };
          return [out];
        }

        return [];
      } catch (e) {
        console.error("[QB] omop error", idx, f, e);
        return [];
      }
    });

    const all = [...classic, ...omop];

    filter.query.filters = all;
    return filter;
  };

  return (
    <Button
      variant="contained"
      fullWidth
      sx={{
        borderRadius: "999px",
        textTransform: "none",
        fontSize: "14px",
        backgroundColor: CONFIG.ui.colors.primary,
        border: `1px solid ${CONFIG.ui.colors.primary}`,
        boxShadow: "none",
        "&:hover": {
          backgroundColor: "white",
          border: `1px solid ${CONFIG.ui.colors.primary}`,
          color: CONFIG.ui.colors.primary,
        },
      }}
      startIcon={<SearchIcon />}
      onClick={handleSearch}
      disabled={!isLoaded || loadingData }
    >
      Search
    </Button>
  );
}
