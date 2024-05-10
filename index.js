//middleware const pool=require("./db");
// app.use(express.json);

//! todo
const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const { pool } = require("./db");
const path = require("path");
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//
// Servez le dossier 'upload' comme statique
app.use("/static", express.static(path.join(__dirname, "upload")));
//! todo
// app.get("/db/:nompr", async (req, res) => {
//   const { nompr } = req.params;
//   try {
//     const result = await pool.query("SELECT * FROM PRODUIT WHERE nompr = $1", [
//       nompr,
//     ]);
//     if (result.rows.length > 0) {
//       res.json(result.rows[0]);
//     } else {
//       res.status(404).send("Produit non trouvé");
//     }
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Erreur du serveur");
//   }
// });
app.get("/db/:codebare", async (req, res) => {
  const { codebare } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM PRODUIT WHERE codebare = $1",
      [codebare]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send("Produit non trouvé");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur du serveur");
  }
});

app.post("/verifier-carte", async (req, res) => {
  const { numeroCarte } = req.body;
  try {
    const result = await pool.query(
      "SELECT num_carte FROM compte_client WHERE num_carte = $1",
      [numeroCarte]
    );
    if (result.rows.length > 0) {
      // Numéro de carte trouvé, renvoyer un statut de succès
      res.json({ status: "success", message: "Numéro de carte valide." });
    } else {
      // Numéro de carte non trouvé, renvoyer une erreur
      res
        .status(404)
        .json({ status: "error", message: "Numéro de carte invalide." });
    }
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .send("Erreur du serveur lors de la vérification du numéro de la carte.");
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur est démarré sur le port ${port}`);
});
