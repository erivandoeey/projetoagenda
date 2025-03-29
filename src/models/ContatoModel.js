const mongoose = require('mongoose');
const validator = require('validator');

const ContatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: false, default: '' },
  telefone: { type: String, required: false, default: '' },
  categoria: {
    type: String,
    enum: ['Melhores Amigos', 'Trabalho', 'Amigos da Faculdade'],
    required: true,
  },
  criadoEm: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Adicionado referência ao usuário
});

const ContatoModel = mongoose.model('Contato', ContatoSchema);

function Contato(body) {
  this.body = body;
  this.errors = [];
  this.contato = null;
}

// Função para formatar nome
function formatarNome(nome) {
  return nome
    .toLowerCase()
    .split(' ')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

// Função para formatar o telefone
Contato.prototype.formatarTelefone = function (telefone) {
  // Remove todos os caracteres que não são números
  const numeros = telefone.replace(/\D/g, '');

  // Aplica a máscara (xx)xxxxx-xxxx
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
  }

  // Retorna o telefone sem formatação se não tiver 11 dígitos
  return telefone;
};

Contato.prototype.register = async function () {
  this.valida();
  if (this.errors.length > 0) return;
  this.contato = await ContatoModel.create(this.body);
};

Contato.prototype.valida = function () {
  this.cleanUp();

  // Validação do nome
  if (!this.body.nome) {
    this.errors.push('Nome é um campo obrigatório.');
  } else {
    // Verifica se o nome começa com letra maiúscula, tem mais de 3 caracteres e não contém números
    const nomeRegex = /^[A-ZÀ-Ú][a-zà-ú\s]{2,}$/;
    if (!nomeRegex.test(this.body.nome)) {
      this.errors.push(
        'Deve conter apenas o primeiro nome, começar com letra maiúscula, ter mais de 3 caracteres e não pode conter espaços, números ou caracteres especiais.'
      );
    }
  }

  // Validação do e-mail
  if (this.body.email && !validator.isEmail(this.body.email)) {
    this.errors.push('E-mail inválido');
  }

  // Validação e formatação do telefone
  if (this.body.telefone) {
    const telefoneFormatado = this.formatarTelefone(this.body.telefone);

    // Verifica se o telefone foi formatado corretamente
    const telefoneRegex = /^\(\d{2}\)\d{5}-\d{4}$/;
    if (!telefoneRegex.test(telefoneFormatado)) {
      this.errors.push('Telefone inválido. Use o formato (XX)XXXXX-XXXX.');
    } else {
      // Atualiza o telefone no body com o valor formatado
      this.body.telefone = telefoneFormatado;
    }
  }

  // Validação de pelo menos um contato (e-mail ou telefone)
  if (!this.body.email && !this.body.telefone) {
    this.errors.push(
      'Pelo menos um contato precisa ser enviado: e-mail ou telefone.'
    );
  }

  // Validação da categoria
  if (!this.body.categoria) {
    this.errors.push('Categoria é um campo obrigatório.');
  } else if (
    !['Melhores Amigos', 'Trabalho', 'Amigos da Faculdade'].includes(
      this.body.categoria
    )
  ) {
    this.errors.push('Categoria inválida.');
  }
};

Contato.prototype.cleanUp = function () {
  for (const key in this.body) {
    if (typeof this.body[key] !== 'string' && key !== 'user') {
      this.body[key] = '';
    }
  }

  // Formata nome
  if (this.body.nome) {
    this.body.nome = formatarNome(this.body.nome);
  }

  this.body = {
    nome: this.body.nome,
    email: this.body.email,
    telefone: this.body.telefone,
    categoria: this.body.categoria,
    user: this.body.user, // Mantém o campo user
  };
};

Contato.prototype.edit = async function (id, userId) {
  if (typeof id !== 'string') return;
  this.valida();
  if (this.errors.length > 0) return;
  this.contato = await ContatoModel.findOneAndUpdate(
    { _id: id, user: userId }, // Verificar tanto o ID do contato quanto o do usuário
    this.body,
    { new: true }
  );
};

// Métodos estáticos
Contato.buscaPorId = async function (id, userId) {
  if (typeof id !== 'string') return;
  const contato = await ContatoModel.findOne({ _id: id, user: userId }); // Verificar o usuário
  return contato;
};

Contato.buscaContatos = async function (userId) {
  const contatos = await ContatoModel.find({ user: userId }).sort({
    criadoEm: -1,
  }); // Filtrar por usuário
  return contatos;
};

Contato.delete = async function (id, userId) {
  if (typeof id !== 'string') return null;
  if (typeof userId !== 'string') return null; // Verificação extra para evitar problemas

  const contato = await ContatoModel.findOneAndDelete({
    _id: id,
    user: userId, // Agora userId está corretamente passado como argumento
  });

  return contato;
};

module.exports = Contato;
