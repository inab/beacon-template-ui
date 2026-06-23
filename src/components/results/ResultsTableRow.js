import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TableCell,
  TableRow,
  Typography,
  Button,
  Tooltip
} from "@mui/material";
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

export default function ResultsTableRow({ item, status, colors, handleOpenModal }) {
  const hasStatusOnly = item.items.length === 0 && status;

  return (
    <TableRow>
      <TableCell colSpan={5} sx={{
        backgroundColor: hasStatusOnly ? (colors?.bg ?? 'background.paper') : 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}>
        { hasStatusOnly ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportProblemIcon sx={{ color: colors?.text }} />
            <Typography variant="body2" sx={{ color: colors?.text, fontWeight: 'bold' }}>
              {status.long}
            </Typography>
          </Box>
        ) : (
          item.items.map((dataset) => (
            <Box
              key={dataset.id || dataset.dataset}
              sx={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <Tooltip title="View dataset details" arrow>
                <Button
                  variant="text"
                  startIcon={<CalendarViewMonthIcon />}
                  onClick={ () => handleOpenModal(item) }
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    fontWeight: 400,
                    fontFamily: '"Open Sans", sans-serif',
                    backgroundColor: "transparent",
                    color: CONFIG.ui.colors.darkPrimary,
                    minWidth: 0,
                    padding: "0 8px",
                    whiteSpace: "nowrap",
                    transition: 'all 0.3s ease',
                    "&:hover": {
                      color: CONFIG.ui.colors.primary,
                    },
                  }}>
                  View details
                </Button>
              </Tooltip>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ fontWeight: "bold" }} variant="body2">Dataset: </Typography>
                <Typography sx={{ paddingLeft: '5px' }} variant="body2">{ dataset.dataset }</Typography>
              </Box>
              <Box sx={{ display: 'flex' }}>
                <Typography sx={{ fontWeight: "bold" }} variant="body2">Results: </Typography>
                <Typography sx={{ paddingLeft: '5px' }} variant="body2">
                  { item.totalResultsCount > 0 ? new Intl.NumberFormat(navigator.language, { useGrouping: true }).format(Number(item.totalResultsCount)) : '-' }
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </TableCell>
    </TableRow>
  );
}

ResultsTableRow.propTypes = {
  item: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        dataset: PropTypes.string.isRequired,
        results: PropTypes.array.isRequired
      })
    ).isRequired
  }).isRequired,
  status: PropTypes.shape({
    severity: PropTypes.string,
    short: PropTypes.string,
    long: PropTypes.string
  }),
  colors: PropTypes.shape({
    text: PropTypes.string,
    bg: PropTypes.string,
    bgHover: PropTypes.string
  }),
  handleOpenModal: PropTypes.func.isRequired
};
