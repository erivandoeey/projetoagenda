require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const path = require('path');

mongoose
  .connect(process.env.CONNECTIONSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.emit("pronto");
  })
  .catch((e) => console.log(e));
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const routes = require("./routes");
const path = require("path");
// const helmet = require('helmet'); // helmet começou a causar problemas no localhost por conta da falta de SSL
const csrf = require("csurf");
const {
  middlewareGlobal,
  checkCsrfError,
  csrfMiddleware,
} = require("./src/middlewares/middleware");

// app.use(helmet()); // helmet começou a causar problemas no localhost por conta da falta de SSL

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.static(path.resolve(__dirname, "frontend/assets")));

const sessionOptions = session({
  secret: "akasdfj0út23453456+54qt23qv  qwf qwer qwer qewr asdasdasda a6()",
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
});
app.use(sessionOptions);
app.use(flash());

app.set("views", path.resolve(__dirname, "src", "views"));
app.set("view engine", "ejs");

app.use(csrf());
// Nossos próprios middlewares
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

app.on("pronto", () => {
  app.listen(3000, () => {
    console.log("Acessar http://localhost:3000");
    console.log("Servidor executando na porta 3000");
  });
});

// require("dotenv").config();
// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");

// // Conexão com o banco de dados
// mongoose
//   .connect(process.env.CONNECTIONSTRING, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => app.emit("pronto"))
//   .catch((e) => console.log("Erro ao conectar ao MongoDB:", e));

// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const flash = require("connect-flash");
// const routes = require("./routes");
// const path = require("path");
// // const helmet = require('helmet'); // helmet pode causar problemas sem SSL no localhost
// const csrf = require("csurf");
// const {
//   middlewareGlobal,
//   checkCsrfError,
//   csrfMiddleware,
// } = require("./src/middlewares/middleware");

// // Configuração de middlewares essenciais
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.resolve(__dirname, "public")));
// app.use(express.static(path.resolve(__dirname, "frontend/assets")));

// // Configuração da sessão
// const sessionOptions = session({
//   secret: process.env.SESSION_SECRET || "chave-secreta-super-segura",
//   store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
//     httpOnly: true,
//   },
// });

// app.use(sessionOptions);
// app.use(flash());

// // Configuração do template engine
// app.set("views", path.resolve(__dirname, "src", "views"));
// app.set("view engine", "ejs");

// // Proteção CSRF
// app.use(csrf());

// // Middlewares personalizados
// app.use(middlewareGlobal);
// app.use(checkCsrfError);
// app.use(csrfMiddleware);
// app.use(routes);

// // Inicialização do servidor após a conexão com o banco de dados
// app.on("pronto", () => {
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => {
//     console.log(`Servidor rodando em http://localhost:${PORT}`);
//   });
// });
