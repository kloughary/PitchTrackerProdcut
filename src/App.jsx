import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Chip,
  Paper,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function App() {
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [selectedPitch, setSelectedPitch] = useState("Fastball");

  const [arsenal, setArsenal] = useState([
    "Fastball",
    "Curveball",
    "Slider",
    "Changeup",
  ]);

  const [pitchLog, setPitchLog] = useState([]);
  const [pitchCounts, setPitchCounts] = useState({});
  const [totalPitches, setTotalPitches] = useState(0); // running total

  const [open, setOpen] = useState(false);
  const [newPitch, setNewPitch] = useState("");

  /* Auto-select if only one pitch exists */
  useEffect(() => {
    if (arsenal.length === 1) {
      setSelectedPitch(arsenal[0]);
    }
  }, [arsenal]);

  const handlePitch = (result) => {
    const newEntry = {
      pitch: selectedPitch,
      result,
      number: totalPitches + 1, // running pitch number
    };

    setPitchLog((prev) => [...prev, newEntry]);

    // ✅ increment running totals
    setTotalPitches((prev) => prev + 1);
    if (result === "Ball") setBalls((b) => b + 1);
    if (result === "Strike") setStrikes((s) => s + 1);

    setPitchCounts((prev) => {
      const current = prev[selectedPitch] || { ball: 0, strike: 0 };
      return {
        ...prev,
        [selectedPitch]: {
          ball: current.ball + (result === "Ball" ? 1 : 0),
          strike: current.strike + (result === "Strike" ? 1 : 0),
        },
      };
    });
  };

  const resetAtBat = () => {
    setPitchLog([]); // only clear current at-bat pitches
    // balls, strikes, totalPitches remain running totals
  };

  const addPitch = () => {
    const trimmed = newPitch.trim();
    if (!trimmed || arsenal.includes(trimmed)) return;
    setArsenal([...arsenal, trimmed]);
    setNewPitch("");
  };

  const removePitch = (pitch) => {
    const updated = arsenal.filter((p) => p !== pitch);
    setArsenal(updated);

    if (selectedPitch === pitch) {
      setSelectedPitch(updated[0] || "");
    }
  };

  const getStats = () => {
    const totalAll = Object.values(pitchCounts).reduce(
      (sum, p) => sum + p.ball + p.strike,
      0
    );

    return Object.entries(pitchCounts).map(([pitch, counts]) => {
      const total = counts.ball + counts.strike;

      return {
        pitch,
        usagePct: totalAll ? Math.round((total / totalAll) * 100) : 0,
        ballPct: total ? Math.round((counts.ball / total) * 100) : 0,
        strikePct: total ? Math.round((counts.strike / total) * 100) : 0,
      };
    });
  };

  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      {/* HEADER */}
      <Box sx={{ bgcolor: "#1e3a5f", color: "#fff", p: 2, borderRadius: 2 }}>
        <Typography align="center" variant="h5">
          Pitch Tracker
        </Typography>
      </Box>

      {/* COUNTS */}
      <Box display="flex" justifyContent="space-around" alignItems="center" mt={3}>
        <Circle color="#2e7d32" value={balls} label="BALLS" />

        {/* TOTAL SQUARE */}
        <Box textAlign="center">
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: 2,
              backgroundColor: "#eee",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption">TOTAL</Typography>
            <Typography variant="h4" fontWeight="bold">
              {totalPitches}
            </Typography>
            <Typography variant="caption">PITCHES</Typography>
          </Box>
        </Box>

        <Circle color="#c62828" value={strikes} label="STRIKES" />
      </Box>

      {/* SELECT PITCH */}
      <SectionTitle title="Select Pitch">
        <IconButton onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </SectionTitle>

      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
        {arsenal.map((pitch) => (
          <Chip
            key={pitch}
            label={pitch}
            onClick={() => setSelectedPitch(pitch)}
            sx={{
              fontWeight: 600,
              border: "1px solid",
              backgroundColor:
                selectedPitch === pitch ? "#1e3a5f" : "transparent",
              color: selectedPitch === pitch ? "#fff" : "text.primary",
            }}
          />
        ))}
      </Box>

      {/* ACTION BUTTONS */}
      <Box display="flex" gap={2} mt={4}>
        <Button
          fullWidth
          sx={{ bgcolor: "#2e7d32", color: "#fff", fontSize: 20, p: 2 }}
          onClick={() => handlePitch("Ball")}
        >
          Ball
        </Button>

        <Button
          fullWidth
          sx={{ bgcolor: "#c62828", color: "#fff", fontSize: 20, p: 2 }}
          onClick={() => handlePitch("Strike")}
        >
          Strike
        </Button>
      </Box>

      {/* AT BAT */}
      <SectionTitle title="Pitches This At-Bat" />

      <Paper sx={{ p: 1 }}>
        {pitchLog.length === 0 ? (
          <Typography align="center">No pitches yet</Typography>
        ) : (
          pitchLog.map((p, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1} p={1}>
              <MiniCircle result={p.result} number={p.number} />
              {p.pitch} — {p.result}
            </Box>
          ))
        )}
      </Paper>

      <Button fullWidth sx={{ mt: 2 }} variant="contained" onClick={resetAtBat}>
        Start New At-Bat
      </Button>

      {/* COLLAPSIBLE STATS */}
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" width="100%" gap={2}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="h6">Pitch Stats</Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Paper sx={{ p: 1 }}>
            {getStats().length === 0 ? (
              <Typography align="center">No data yet</Typography>
            ) : (
              getStats().map((s) => (
                <Box key={s.pitch} p={1}>
                  <Typography fontWeight={600}>
                    {s.pitch} — {s.usagePct}%
                  </Typography>
                  <Typography variant="body2">
                    Balls: {s.ballPct}% | Strikes: {s.strikePct}%
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))
            )}
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Manage Pitch Arsenal</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={1} mb={2}>
            <TextField
              fullWidth
              label="New Pitch"
              value={newPitch}
              onChange={(e) => setNewPitch(e.target.value)}
            />
            <Button onClick={addPitch}>Add</Button>
          </Box>

          {arsenal.map((pitch) => (
            <Box key={pitch} display="flex" justifyContent="space-between">
              {pitch}
              <IconButton onClick={() => removePitch(pitch)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

/* COMPONENTS */

function Circle({ color, value, label }) {
  return (
    <Box textAlign="center">
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: "bold",
        }}
      >
        {value}
      </Box>
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}

function MiniCircle({ result, number }) {
  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        backgroundColor: result === "Strike" ? "#c62828" : "#2e7d32",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
      }}
    >
      {number}
    </Box>
  );
}

function SectionTitle({ title, children }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      mt={4}
      mb={1}
    >
      <Divider sx={{ flex: 1 }} />
      <Typography variant="h6">{title}</Typography>
      {children}
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}
