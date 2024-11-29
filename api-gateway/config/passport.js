const passport = require("passport");
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
// const User = require('../models/User');

const db = require("../Models/index");
const User = db.user;
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "secret",
};

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      // const user = await User.findOne({ id: jwt_payload.id });
      //console.log(`ID ${jwt_payload.id}`)
      const user = await User.findOne({ where: { id: jwt_payload.id } });
      // console.log(user)
      //console.log(user);
      if (user) {
        console.log("login success");

        return done(null, user);
      } else {
        console.log("User not found");
        return done(null, false);
        // or you could create a new account
      }
    } catch (err) {
      console.log(err);
      return done(err, false);
    }
  })
);
