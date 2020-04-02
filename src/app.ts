// Definitions
import * as core from "express-serve-static-core";

export interface ErrorWithStatus extends Error {
  status: number;
}

import * as compression from "compression"
import * as session from "express-session"
import * as cookieParser from "cookie-parser"
import * as express from "express"
import * as createError from "http-errors"
import * as logger from "morgan"
import * as sassMiddleware from "node-sass-middleware"
import * as path from "path"

import indexRouter from "./routes/index"
import * as usersRouter from "./routes/users"

import * as database from './database'

const application = express()

const configureApp = async (app: core.Application): Promise<core.Application> => {
  await Promise.resolve()

  // view engine setup
  app.set("views", path.join(__dirname, "views"))
  app.set("view engine", "pug")

  app.use(logger("dev"))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(compression())
  app.use(session({
      resave: false,
      rolling: true,
      saveUninitialized: false,
      secret: `MySecretSession${Date.now}`,
      cookie:{
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
      }
  }))
  app.use(sassMiddleware({
    dest: path.join(__dirname, "public"),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true,
    src: path.join(__dirname, "public"),
  }))
  app.use(express.static(path.join(__dirname, "public")))
  return app
}

const configureRoutes = async (app: core.Application): Promise<core.Application> => {
  const db = await database.initialize()
  app.use("/", indexRouter)
  console.log('foo1') // eslint-disable-line
  app.use("/users", await usersRouter.initialize(app, db))
  console.log('foo2') // eslint-disable-line
  return app
}

const configureErrorHandling = async (app: core.Application): Promise<core.Application> => {
  await Promise.resolve()
  // catch 404 and forward to error handler
  app.use((_: Express.Request, __: Express.Response, next: core.NextFunction) => {
    next(createError(404))
  })

  // error handler
  app.use((err: ErrorWithStatus, req: core.Request, res: core.Response) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render("error")
  })
  return app
}

configureApp(application)
  .then(configureRoutes)
  .then(configureErrorHandling)

module.exports = application
