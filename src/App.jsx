import React, { useState, useEffect, useRef } from "react";

import {
  Container,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Snackbar,
  AppBar,
  Toolbar,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import logo from "./assets/Casual Logo with Centered Design Elements.svg";

import { motion, AnimatePresence, useMotionValue, useAnimation, useTransform } from "framer-motion";

const STORAGE_KEY = "pitchTracker";
const BALL_COLOR = "#4A6FA5";
const STRIKE_COLOR = "#C62828";

export default function App() {
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [selectedPitch, setSelectedPitch] = useState("Fastball");

  const [arsenal, setArsenal] = useState([
    "Fastball",
    "Curveball",
    "Changeup",
  ]);

  const [pitchLog, setPitchLog] = useState([]);
  const [pitchCounts, setPitchCounts] = useState({});
  const [totalPitches, setTotalPitches] = useState(0);

  const [open, setOpen] = useState(false);
  const [newPitch, setNewPitch] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [lastActionLabel, setLastActionLabel] = useState("");

  const undoStack = useRef([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data = JSON.parse(saved);

        setBalls(data.balls || 0);
        setStrikes(data.strikes || 0);
        setTotalPitches(data.totalPitches || 0);
        setPitchLog(data.pitchLog || []);
        setPitchCounts(data.pitchCounts || {});
        setArsenal(data.arsenal || ["Fastball"]);
        setSelectedPitch(data.selectedPitch || "Fastball");
      }
    } catch (error) {
      console.error("Failed to load saved pitch tracker data:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const data = {
        balls,
        strikes,
        totalPitches,
        pitchLog,
        pitchCounts,
        arsenal,
        selectedPitch,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save pitch tracker data:", error);
    }
  }, [balls, strikes, totalPitches, pitchLog, pitchCounts, arsenal, selectedPitch]);

  const pushUndoState = () => {
    undoStack.current.push({
      balls,
      strikes,
      totalPitches,
      pitchLog: [...pitchLog],
      pitchCounts: JSON.parse(JSON.stringify(pitchCounts)),
    });
  };

  const handleUndo = () => {
    const last = undoStack.current.pop();
    if (!last) return;

    setBalls(last.balls);
    setStrikes(last.strikes);
    setTotalPitches(last.totalPitches);
    setPitchLog(last.pitchLog);
    setPitchCounts(last.pitchCounts);

    setSnackbarOpen(false);
  };

  const handlePitch = (result) => {
    pushUndoState();

    const newEntry = {
  id: Date.now(), // ✅ ADD THIS
  pitch: selectedPitch,
  result,
  number: pitchLog.length + 1,
};

    setPitchLog((prev) => [...prev, newEntry]);
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

    setLastActionLabel("Pitch recorded");
    setSnackbarOpen(true);
  };

  const handleDeletePitch = (indexToDelete) => {
  pushUndoState();

  const pitchToRemove = pitchLog[indexToDelete];

  const updatedLog = pitchLog.filter((_, i) => i !== indexToDelete);

  const renumberedLog = updatedLog.map((p, i) => ({
    ...p,
    number: i + 1,
  }));

  setPitchLog(renumberedLog);

  setTotalPitches((prev) => Math.max(prev - 1, 0));

  if (pitchToRemove.result === "Ball") {
    setBalls((b) => Math.max(b - 1, 0));
  }

  if (pitchToRemove.result === "Strike") {
    setStrikes((s) => Math.max(s - 1, 0));
  }

  setPitchCounts((prev) => {
    const updated = { ...prev };
    const pitchType = pitchToRemove.pitch;
    const current = updated[pitchType];

    if (!current) return prev;

    const newBall = current.ball - (pitchToRemove.result === "Ball" ? 1 : 0);
    const newStrike = current.strike - (pitchToRemove.result === "Strike" ? 1 : 0);

    if (newBall <= 0 && newStrike <= 0) {
      delete updated[pitchType];
    } else {
      updated[pitchType] = {
        ball: Math.max(newBall, 0),
        strike: Math.max(newStrike, 0),
      };
    }

    return updated;
  });

  setLastActionLabel("Pitch deleted");
  setSnackbarOpen(true);
};

  const resetCurrentAtBat = () => {
    if (pitchLog.length === 0) return;

    setPitchLog([]);
    undoStack.current = [];
    setSnackbarOpen(false);
    setLastActionLabel("");
  };

  const resetAll = () => {
    setBalls(0);
    setStrikes(0);
    setTotalPitches(0);
    setPitchLog([]);
    setPitchCounts({});
    setSelectedPitch("Fastball");
    setArsenal(["Fastball", "Curveball", "Slider", "Changeup"]);
    undoStack.current = [];
    setSnackbarOpen(false);
    setLastActionLabel("");
    localStorage.removeItem(STORAGE_KEY);
    setConfirmOpen(false);
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

    if (totalAll === 0) return [];

    return Object.entries(pitchCounts).map(([pitch, counts]) => {
      const total = counts.ball + counts.strike;

      return {
        pitch,
        usagePct: Math.round((total / totalAll) * 100),
        ballPct: Math.round((counts.ball / total) * 100),
        strikePct: Math.round((counts.strike / total) * 100),
      };
    });
  };

  return (
  <>
  {/* HEADER */}
{/* HEADER */}
<AppBar
  sx={{
  bgcolor: "#6FA8C6",
  left: 0,
  right: 0,
  width: "100%",
  boxSizing: "border-box",
  position: "sticky",
  top: 0,
  zIndex: 1200,
}}
>
  <Toolbar
    sx={{
      minHeight: 56,
      px: 1.5,
      display: "flex",
      alignItems: "center",
    }}
  >
    <Box sx={{ flex: 1 }} />

    <Box
      component="img"
      src={logo}
      alt="App Logo"
      sx={{
        height: 52,
        display: "block",
        userSelect: "none",
      }}
    />

    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: "#fff" }}
      >
        <MoreVertIcon />
      </IconButton>
    </Box>
  </Toolbar>
</AppBar>
<Container maxWidth="sm" sx={{ pb: 4 }}>
      

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setConfirmOpen(true);
          }}
        >
          Reset All
        </MenuItem>
      </Menu>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Reset All Data?</DialogTitle>
        <DialogContent>
          <Typography>This will clear all stats.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={resetAll}>
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ display: "flex", textAlign: "center" }}>
          <Box flex={1}>
            <Typography variant="caption">BALLS</Typography>
            <Typography variant="h5">{balls}</Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box flex={1}>
            <Typography variant="caption">TOTAL</Typography>
            <Typography variant="h4">{totalPitches}</Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box flex={1}>
            <Typography variant="caption">STRIKES</Typography>
            <Typography variant="h5">{strikes}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <SectionTitle
            title="Select Pitch"
            action={
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setOpen(true)}
              >
                Edit
              </Button>
            }
          />

          <Box display="flex" flexWrap="wrap" gap={1}>
            {arsenal.map((pitch) => {
              const isSelected = selectedPitch === pitch;

              return (
                <Chip
                  key={pitch}
                  label={pitch}
                  onClick={() => setSelectedPitch(pitch)}
                  sx={{
                    bgcolor: isSelected ? "#6FA8C6" : "transparent",
                    color: isSelected ? "#fff" : "text.primary",
                    border: isSelected ? "none" : "1px solid rgba(0,0,0,0.23)",
                    "&:hover": {
                      bgcolor: isSelected ? "#6FA8C6" : "rgba(0,0,0,0.04)",
                    },
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <Button
              fullWidth
              onClick={() => handlePitch("Ball")}
              sx={{
                bgcolor: BALL_COLOR,
                color: "#fff",
                "&:hover": { bgcolor: BALL_COLOR },
              }}
            >
              Ball
            </Button>

            <Button
              fullWidth
              onClick={() => handlePitch("Strike")}
              sx={{
                bgcolor: STRIKE_COLOR,
                color: "#fff",
                "&:hover": { bgcolor: STRIKE_COLOR },
              }}
            >
              Strike
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <SectionTitle
            title="Current At-Bat"
            action={
              <Button
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={resetCurrentAtBat}
                disabled={pitchLog.length === 0}
              >
                New At-Bat
              </Button>
            }
          />

          {pitchLog.length === 0 ? (
  <Typography align="center" variant="body2" color="text.secondary">
    No pitches yet.
  </Typography>
) : (
  <AnimatePresence>
  {pitchLog.map((p, i) => (
    <SwipeablePitchRow
  key={p.id}
      p={p}
      i={i}
      handleDeletePitch={handleDeletePitch}
    />
  ))}
</AnimatePresence>
)}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <SectionTitle title="Pitch Stats" />

          {getStats().length === 0 ? (
            <Typography align="center" variant="body2" color="text.secondary">
              No pitches yet.
            </Typography>
          ) : (
            getStats().map((s) => (
              <Box key={s.pitch} sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>{s.pitch}</Typography>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2">Total {s.usagePct}%</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    height: 10,
                    borderRadius: 5,
                    overflow: "hidden",
                    mt: 0.5,
                  }}
                >
                  <Box sx={{ width: `${s.ballPct}%`, bgcolor: BALL_COLOR }} />
                  <Box sx={{ width: `${s.strikePct}%`, bgcolor: STRIKE_COLOR }} />
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption">Balls {s.ballPct}%</Typography>
                  <Typography variant="caption">
                    Strikes {s.strikePct}%
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Edit Pitch Arsenal</DialogTitle>

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        message={lastActionLabel}
        action={
          <Button size="small" onClick={handleUndo}>
            UNDO
          </Button>
        }
      />
    </Container>
</>
);
}

function MiniCircle({ result, number }) {
  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        backgroundColor: result === "Strike" ? STRIKE_COLOR : BALL_COLOR,
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

function SectionTitle({ title, action }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Typography variant="subtitle1">{title}</Typography>
      {action}
    </Box>
  );
}
function SwipeablePitchRow({ p, i, handleDeletePitch }) {
  const x = useMotionValue(0);
const controls = useAnimation();
useEffect(() => {
  x.set(0);                 // reset swipe position
  controls.set({ x: 0 });   // reset animation state
}, [p.id]);                 // run when a new row replaces this one

// Reveal background width based on swipe
const revealWidth = useTransform(x, [-120, 0], [120, 0]);

// Fade icon in after threshold
const iconOpacity = useTransform(x, [-80, -40], [1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -120) {
      handleDeletePitch(i);
    } else if (info.offset.x < -60) {
      controls.start({ x: -80 });
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.2 }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        
        {/* Background */}
        <motion.div
  style={{
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: revealWidth,
    backgroundColor: STRIKE_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  }}
>
  <motion.div style={{ opacity: iconOpacity }}>
    <IconButton
      onClick={() => handleDeletePitch(i)}
      sx={{ color: "#fff" }}
    >
      <DeleteIcon />
    </IconButton>
  </motion.div>
</motion.div>

        {/* Foreground */}
        <motion.div
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -120, right: 0 }}
          dragElastic={0.1}
          animate={controls}
          onDragEnd={handleDragEnd}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              px: 1,
              bgcolor: "#fff",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MiniCircle result={p.result} number={p.number} />
              {p.pitch} — {p.result}
            </Box>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
}
