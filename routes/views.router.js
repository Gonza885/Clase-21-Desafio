import { Router } from "express";
const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/products", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const { name } = req.session.user;
  const mensajeDeBienvenida = `Bienvenido, ${name}!`;
  res.render("products", { mensajeDeBienvenida });
});

export default router;
