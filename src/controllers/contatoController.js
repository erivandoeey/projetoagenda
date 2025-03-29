const Contato = require('../models/ContatoModel');

exports.index = (req, res) => {
  res.render('contato', {
    contato: {},
  });
};

exports.register = async (req, res) => {
  try {
    // Verifica se o usuário está logado
    if (!req.session.user || !req.session.user._id) {
      req.flash('errors', ['Usuário não autenticado.']);
      return req.session.save(() => res.redirect('/login'));
    }
    const contato = new Contato(req.body);
    // Garante que o user ID está sendo passado corretamente
    contato.body.user = req.session.user._id;
    await contato.register();

    if (contato.errors.length > 0) {
      req.flash('errors', contato.errors);
      req.session.save(() => res.redirect('back'));
      return;
    }

    req.flash('success', 'Contato registrado com sucesso.');
    req.session.save(
      // () => res.redirect(`/contato/index/${contato.contato._id}`) // Modificado para ir para agenda quando salvar
      res.redirect('/')
    );
    return;
  } catch (e) {
    console.log(e);
    return res.render('404');
  }
};

exports.editIndex = async function (req, res) {
  if (!req.params.id) return res.render('404');

  const contato = await Contato.buscaPorId(req.params.id, req.session.user._id); // Passar o ID do usuário

  if (!contato) return res.render('404');

  res.render('contato', { contato });
};

exports.edit = async function (req, res) {
  try {
    if (!req.params.id) return res.render('404');
    const contato = new Contato(req.body);
    contato.body.user = req.session.user._id; // Associar o contato ao usuário logado
    await contato.edit(req.params.id, req.session.user._id); // Passar o ID do usuário

    if (contato.errors.length > 0) {
      req.flash('errors', contato.errors);
      req.session.save(() => res.redirect('back'));
      return;
    }

    req.flash('success', 'Contato editado com sucesso.');
    req.session.save(() =>
      res.redirect(`/contato/index/${contato.contato._id}`)
    );
    return;
  } catch (e) {
    console.log(e);
    res.render('404');
  }
};

exports.delete = async function (req, res) {
  if (!req.params.id) return res.render('404');

  const contato = await Contato.delete(req.params.id, req.session.user._id); // Passando o ID do usuário
  if (!contato) {
    req.flash('errors', [
      'Contato não encontrado ou você não tem permissão para excluí-lo.',
    ]);
    return req.session.save(() => res.redirect('back'));
  }

  req.flash('success', 'Contato apagado com sucesso.');
  req.session.save(() => res.redirect('back'));
  return;
};
