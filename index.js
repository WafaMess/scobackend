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
app.get("/db", async (req, res) => {
  const { nompr, codebare } = req.query;

  if (!nompr && !codebare) {
    return res
      .status(400)
      .send(
        "Veuillez fournir un nom de produit (nompr) ou un code-barres (codebare)"
      );
  }

  try {
    let result;
    if (nompr) {
      result = await pool.query("SELECT * FROM PRODUIT WHERE nompr = $1", [
        nompr,
      ]);
    } else if (codebare) {
      result = await pool.query("SELECT * FROM PRODUIT WHERE codebare = $1", [
        codebare,
      ]);
    }

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
app.get("/db/:param", async (req, res) => {
  const { param } = req.params;
  try {
    let result;
    if (isNaN(param)) {
      // Si le paramètre n'est pas un nombre, recherche par nom de produit
      result = await pool.query("SELECT * FROM PRODUIT WHERE nompr = $1", [
        param,
      ]);
    } else {
      // Si le paramètre est un nombre, recherche par code-barres
      result = await pool.query("SELECT * FROM PRODUIT WHERE codebare = $1", [
        param,
      ]);
    }
    if (result.rows.length > 0) {
      const product = result.rows[0];
      if (product.chemin_img) {
        // Construisez l'URL de l'image seulement si le chemin existe
        product.imageUrl = `http://localhost:5000/static/${product.chemin_img}`;
      }
      // Envoyez la réponse avec les détails du produit
      // Si le produit n'a pas d'image, 'imageUrl' ne sera pas inclus
      res.json(product);
    } else {
      res.status(404).send("Produit non trouvé");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur du serveur");
  }
});

app.post("/verifier-codepostal", async (req, res) => {
  const { codePostal } = req.body;
  try {
    const result = await pool.query("SELECT cpcl FROM client WHERE cpcl = $1", [
      codePostal,
    ]);
    if (result.rows.length > 0) {
      // Code Postal trouvé, renvoyer un statut de succès
      res.json({ status: "success", message: "Code Postal valide." });
    } else {
      // Code Postal non trouvé, renvoyer une erreur
      res
        .status(404)
        .json({ status: "error", message: "Code Postal invalide." });
    }
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .send("Erreur du serveur lors de la vérification du Code Postal.");
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
app.post("/verifier-codepromo", async (req, res) => {
  const { Codepromo } = req.body;
  try {
    const result = await pool.query(
      "SELECT codepromo FROM promo WHERE codepromo = $1",
      [Codepromo]
    );
    if (result.rows.length > 0) {
      // Numéro de carte trouvé, renvoyer un statut de succès
      res.json({ status: "success", message: "Code promo valide." });
    } else {
      // Numéro de carte non trouvé, renvoyer une erreur
      res
        .status(404)
        .json({ status: "error", message: "Code promo invalide." });
    }
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .send(
        "Erreur du serveur lors de la vérification du numéro de code promo."
      );
  }
});

// app.post("/enregistrer-code-postal", async (req, res) => {
//   const { cpcl } = req.body;
//   console.log("Received cpcl:", cpcl); // Log the received cpcl

//   if (!cpcl) {
//     return res.status(400).json({
//       status: "error",
//       message: "Le code postal est requis.",
//     });
//   }

//   try {
//     const result = await pool.query(
//       "INSERT INTO client (cpcl) VALUES ($1) RETURNING *",
//       [cpcl]
//     );
//     console.log("Insert result:", result); // Log the result of the insert query

//     res.json({
//       status: "success",
//       message: "Code postal enregistré.",
//       data: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'insertion du code postal:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Erreur du serveur lors de l'enregistrement du code postal.",
//       error: error.message,
//     });
//   }
// });
app.post("/recuperer-solde", async (req, res) => {
  const { numeroCarte, telcl } = req.body;
  try {
    let result;
    if (numeroCarte) {
      result = await pool.query(
        "SELECT soldefid FROM client WHERE num_carte = $1",
        [numeroCarte]
      );
    } else if (telcl) {
      result = await pool.query(
        "SELECT soldefid FROM client WHERE telcl = $1",
        [telcl]
      );
    }

    if (result.rows.length > 0) {
      res.json({ status: "success", solde: result.rows[0].soldefid });
    } else {
      res.status(404).json({ status: "error", message: "Client non trouvé." });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Erreur du serveur lors de la récupération du solde.");
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur est démarré sur le port ${port}`);
});
