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
app.get("/db/:nompr", async (req, res) => {
  const { nompr } = req.params;
  try {
    const result = await pool.query("SELECT * FROM PRODUIT WHERE nompr = $1", [
      nompr,
    ]);
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
// app.get("/db/:codebare", async (req, res) => {
//   const { codebare } = req.params;
//   try {
//     const result = await pool.query(
//       "SELECT * FROM PRODUIT WHERE codebare = $1",
//       [codebare]
//     );
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
app.post("/verifier-tel", async (req, res) => {
  const { numeroTel } = req.body;
  try {
    const result = await pool.query(
      "SELECT telcl FROM client WHERE telcl = $1",
      [numeroTel]
    );
    if (result.rows.length > 0) {
      // Numéro tel trouvé, renvoyer un statut de succès
      res.json({ status: "success", message: "Numéro de telephone valide." });
    } else {
      // Numéro de telephone non trouvé, renvoyer une erreur
      res
        .status(404)
        .json({ status: "error", message: "Numéro de telephone invalide." });
    }
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .send(
        "Erreur du serveur lors de la vérification du numéro de telephone."
      );
  }
});

app.post("/enregistrer-code-postal", async (req, res) => {
  const { cpcl } = req.body;
  console.log("Received cpcl:", cpcl); // Log the received cpcl

  if (!cpcl) {
    return res.status(400).json({
      status: "error",
      message: "Le code postal est requis.",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO client (cpcl) VALUES ($1) RETURNING *",
      [cpcl]
    );
    console.log("Insert result:", result); // Log the result of the insert query

    res.json({
      status: "success",
      message: "Code postal enregistré.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de l'insertion du code postal:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur du serveur lors de l'enregistrement du code postal.",
      error: error.message,
    });
  }
});
// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur est démarré sur le port ${port}`);
});
