const express = require("express");
const path = require("path");
const routes = require("./routes/route");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({
    message: "HosBank - Binôme B",
    status: "ok",
    description: "Espace chargé client et administration simple"
  });
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur sur http://localhost:${PORT}`);
});
