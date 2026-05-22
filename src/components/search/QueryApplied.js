import { Box, Typography, Button } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import QueryAppliedItems from "./QueryAppliedItems";
import deleteIcon from "../../assets/logos/delete.svg";

export default function QueryApplied({ variant }) {
  const {
    setSelectedFilter,
    setLoadingData,
    setResultData,
    setHasSearchResult,
    setOmopFilters,
  } = useSelectedEntry();

  const primaryDarkColor = CONFIG.ui.colors.darkPrimary;


  const handleFilterRemove = (item) => {
    // If something has change, reload filter
    setLoadingData(false);
    setResultData([]);
    setHasSearchResult(false);
    setSelectedFilter((prevFilters) =>
      prevFilters.filter(
        (filter) => !(filter.key === item.key && filter.scope === item.scope)
      )
    );
  };

  return (
    <Box
      sx={{
        display: "block",
        backgroundColor: "white",
        mt: 3,
        borderRadius: "10px",
        border: "1px solid #E0E0E0",
      }}
    >
      <Box
        sx={{
          padding: "5px 15px 15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            paddingBottom: "1px",
          }}
        >
          <Typography
            sx={{
              mb: 2,
              pt: 1,
              fontWeight: 700,
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
            }}
          >
            Query Applied
          </Typography>
          <Box
            sx={{
              color: CONFIG.ui.colors.primary,
            }}
          >
            <Button
              onClick={() => {
                setSelectedFilter([]);
                setOmopFilters([]);
                setResultData([]);
                setLoadingData(false);
                setHasSearchResult(false);
              }}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                pl: 2,
                ml: 2,
                backgroundColor: "transparent",
                color: primaryDarkColor,
              }}
              startIcon={
                <img
                  src={deleteIcon}
                  alt="Delete"
                  style={{ width: 18, height: 18, marginRight: 4 }}
                />
              }
            >
              Clear All
            </Button>
          </Box>
        </Box>
        <QueryAppliedItems
          handleFilterRemove={handleFilterRemove}
          variant={variant}
        />
      </Box>
    </Box>
  );
}
