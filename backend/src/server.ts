import app from "@/app";

// Set port (default to 3000 if not specified)
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`[server] Server is running on port ${PORT}`);
});
