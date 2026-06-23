import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TableCell,
  TableContainer,
  TableRow,
  Table,
  TableBody,
  Typography,
  Button,
  Tooltip
} from "@mui/material";
import { BEACON_NETWORK_COLUMNS_EXPANDED } from '../../lib/constants';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

export default function ResultsTableRow({ item, status, colors, handleOpenModal }) {
  if (item.items.length === 0 && status) {
    return (
      <TableRow>
        <TableCell colSpan={6} sx={{
          backgroundColor: colors?.bg ?? 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportProblemIcon sx={{ color: colors?.text }} />
            <Typography variant="body2" sx={{ color: colors?.text, fontWeight: 'bold' }}>
              {status.long}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={6} sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        p: 0
      }}>
        <Box sx={{ p: 0 }}>
          <TableContainer>
            <Table stickyHeader aria-label="Results table">
              <TableBody>
                { item.items.map((dataset) => (
                  <TableRow key={dataset.id || dataset.dataset}>
                    <TableCell 
                      style={{ 
                        width: BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_detail.width,
                        paddingRight: '0px'
                      }}
                      align={ 
                        BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_detail.float 
                      }
                      >
                      <Tooltip title="View dataset details" arrow>
                        <Button 
                          variant="text"
                          onClick={ () => handleOpenModal(item) }
                          sx={{
                            textTransform: "none",
                            fontSize: "14px",
                            fontWeight: 400,
                            fontFamily: '"Open Sans", sans-serif',
                            backgroundColor: "transparent",
                            color: "gray",
                            width: "50px",
                            height: "30px",
                            minWidth: "30px",
                            minHeight: "30px",
                            padding: "0",
                            marginRight: "5px",
                            transition: 'all 0.3s ease',
                            "&:hover": {
                              color: CONFIG.ui.colors.primary,
                              transform: 'scale(1.1)'
                            },
                          }}>
                          <CalendarViewMonthIcon />
                        </Button>
                      </Tooltip>
                    </TableCell>
                    <TableCell style={{ width: BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_name }}>
                      <Box sx={{ display: 'flex'}}>
                        <Typography sx={{ fontWeight: "bold" }} variant="body2">Dataset: </Typography>
                        <Typography sx={{ paddingLeft: '5px' }} variant="body2">{ dataset.dataset } </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold"  }}  style={{ width: BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_response }}>
                      { item.totalResultsCount > 0 ? new Intl.NumberFormat(navigator.language, { useGrouping: true }).format(Number(item.totalResultsCount)) : '-' }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
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