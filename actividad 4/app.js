import express from "express";
import { getCats, getMenu } from "./database.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/cats", async (req, res) => {
    const cats = await getCats();
    res.json(cats);
});

app.get("/api/menu/:day", async (req, res) => {
    const menu = await getMenu(req.params.day);
    res.json(menu);
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});