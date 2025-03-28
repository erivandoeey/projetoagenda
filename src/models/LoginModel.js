const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Campo usado apenas no registro
  email: { type: String, required: true }, // Campo usado no login
  password: { type: String, required: true }, // Campo usado no login
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  async login() {
    this.valida();
    if (this.errors.length > 0) return;

    // Busca o usuário pelo email (ignora o username no login)
    this.user = await LoginModel.findOne({ email: this.body.email });

    if (!this.user) {
      this.errors.push('Usuário não existe.');
      return;
    }

    // Verifica se a senha está correta
    if (!bcryptjs.compareSync(this.body.password, this.user.password)) {
      this.errors.push('Senha inválida');
      this.user = null;
      return;
    }
  }

  async register() {
    this.valida();
    if (this.errors.length > 0) return;

    await this.userExists();

    if (this.errors.length > 0) return;

    // Cria o hash da senha
    const salt = bcryptjs.genSaltSync();
    this.body.password = bcryptjs.hashSync(this.body.password, salt);

    // Cria o usuário no banco de dados
    this.user = await LoginModel.create(this.body);
  }

  async userExists() {
    // Verifica se o email ou o username já existem
    this.user = await LoginModel.findOne({
      $or: [
        { email: this.body.email },
        { username: this.body.username }, // Verifica se o username já existe
      ],
    });
    if (this.user) this.errors.push('Usuário já existe.');
  }

  valida() {
    this.cleanUp();

    // Validação do username (apenas para registro)
    if (this.body.username) {
      // Verifica se o username começa com letra maiúscula e não contém números
      const usernameRegex = /^[A-Z][a-zA-Z]*$/;
      if (!usernameRegex.test(this.body.username)) {
        this.errors.push(
          'O usuário deve começar com letra maiúscula e não pode conter números.'
        );
      }

      // Verifica o comprimento do username
      if (this.body.username.length < 3 || this.body.username.length > 50) {
        this.errors.push('O usuário precisa ter entre 3 e 50 caracteres.');
      }
    }

    // Validação do email
    if (!validator.isEmail(this.body.email)) {
      this.errors.push('E-mail inválido');
    }

    // Validação da senha
    if (this.body.password.length < 3 || this.body.password.length > 50) {
      this.errors.push('A senha precisa ter entre 3 e 50 caracteres.');
    }
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    // Mantém apenas os campos necessários
    this.body = {
      username: this.body.username, // Usado apenas no registro
      email: this.body.email,
      password: this.body.password,
    };
  }
}

module.exports = Login;
