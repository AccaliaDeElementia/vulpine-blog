import * as core from "express-serve-static-core";

import * as passport from "passport";
import { Strategy as LocalStrategy }  from "passport-local";

import * as Knex from 'knex';

import * as bcrypt from 'bcrypt';

import { Request, Response, NextFunction, Router } from "express";

interface User {
  id: number;
  username: string;
  displayname: string;
  email: string;
  salt: string;
  passwordhash: string;
}

type UserCallback = (err: undefined|Error, user?: User | boolean, options?: any) => void

export const initialize = async (app: core.Application, db: Knex): Promise<Router> => {

  passport.serializeUser<any, any>((user, done) => {
      done(undefined, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    db()
      .first(
        'id',
        'username',
        'displayname',
        'email'
      )
      .from<User>('users')
      .where({
        id
      })
      .then(user => done(undefined, user));
  });

  await db().first(
    'id',
    'username',
    'displayname',
    'email'
    )
    .from<User>('users')

  passport.use(new LocalStrategy({ usernameField: "username" }, (username: string, password: string, done: UserCallback) => {
    db('users')
      .first(
        'id',
        'username',
        'displayname',
        'email',
        'salt',
        'passwordhash'
      )
      .from<User>('users')
      .where({
        username: username.toLowerCase()
      })
      .then(async user => {
        if (user && await bcrypt.compare(password, user.passwordhash)){
          return done(undefined, user);
        }
        return done(undefined, false, { message: "Invalid username or password." });
      })
  }));

  app.use(passport.initialize());
  app.use(passport.session())

  const router = Router()
  console.log('foo') // eslint-disable-line
  router.get('/login', (req: Request, res: Response)=>{
      if (req.user){
        return res.redirect('/')
      }
      res.render('users/login',{
        title: 'Login'
      })
  })

  return router
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated()) {
        next()
        return
    }
    res.redirect("/login")
}
