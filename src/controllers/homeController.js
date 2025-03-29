const Contato = require('../models/ContatoModel');

exports.index = async (req, res) => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.session.user) {
      return res.render('index', { contatos: [] }); // Retorna a página sem contatos
    }

    const contatos = await Contato.buscaContatos(req.session.user._id);
    res.render('index', { contatos });
  } catch (error) {
    console.error(error);
    res.render('404');
  }
};
