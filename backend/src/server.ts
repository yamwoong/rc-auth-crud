import app from "@/app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server] Server is running on port ${PORT}`);
  console.log(
    `[server] Swagger docs available at http://localhost:${PORT}/docs`
  );
});
