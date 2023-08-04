import { Router } from "express";
import userModel from "../models/Users.model.js";
import passport from "passport";
import bcrypt from "bcrypt";
import LocalStrategy from "passport-local";
import GitHubStrategy from "passport-github2";

const router = Router();

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await userModel.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Credenciales incorrectas" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return done(null, false, { message: "Credenciales incorrectas" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "github",
  new GitHubStrategy(
    {
      clientID: "Iv1.fcc7092cab00b5f6",
      clientSecret: "464cfcbab267838cf073585604f5206e664c3cf3",
      callbackURL: "http://localhost:8080/api/sessions/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        let user = await userModel.findOne({ email });

        if (!user) {
          user = await userModel.create({
            email,
            first_name: profile.displayName,
            password: "",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/products",
    failureRedirect: "/login",
  })
);

router.get("/github", passport.authenticate("github", { scope: ["email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/products",
    failureRedirect: "/login",
  })
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {});

router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

export default router;
