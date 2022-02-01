const express = require('express')
const { route } = require('express/lib/application')
const res = require('express/lib/response')
const router = express.Router() // Ajuda na criação de rotas

// Usando um model de forma externa, ou seja, trazendo de fora pra cá
const mongoose = require('mongoose') // mongoose padrão
require('../models/Categoria')  // Chama o arquivo do model
const Categoria = mongoose.model('categorias')  // Esse categorias é o nome que dei pra collection, lá no Categoria.js
//
require('../models/Postagem')  // Chama o arquivo Postagem
const Postagem = mongoose.model('postagens')
const {eAdmin}= require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => { 
    res.render("./admin/index")
})

router.get('/posts', eAdmin, (req, res) => { // Defino o nome da url, e em res defino oq vai abrir.
    res.send("página de posts")
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => { // .sorte({date: 'desc'}) deixa em ordem decrescente a forma como os dados aparecem no site.
    res.render("./admin/categorias", {categorias: categorias})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as caregorias.")
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("./admin/addcategorias")
})

// Depois de criada a model e trazendo ela pra cá, agora essa rota vai mandar os dados pro mongoDB.
router.post('/categorias/nova', eAdmin, (req, res) => { // Manda pra rota /nova
    var erros = []

    if(req.body.nome == null || req.body.nome == undefined || !(req.body.nome)){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"})
    }

    if(erros.length > 0){
        res.render("./admin/addcategorias", {erros: erros})
    }else{
        console.log("passando sim")
        const novaCategoria = {
            nome: req.body.nome, // Pega o nome do formulário e bota no nome
            slug: req.body.slug  // Pega o slug do formulário e bota no slug
        }
        new Categoria(novaCategoria).save().then(() => { // Adiciona no mongodb, o objeto novaCategoria, que tem os dados do formulário.
            req.flash("success_msg", 'Categoria criada com sucesso!') // Passa uma msg para a variavel global success_msg, antes de dar o render
            res.redirect('../categorias') // renderiza a página categorias
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente.')  // Passa uma msg para a variavel global error_msg, antes de dar o render
            res.redirect('/admin')
        })
    }
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('./admin/editcategorias', {categoria: categoria})
    }).catch((erro) => {
        console.log("nao foi possivel editarrrrrrrrrrr")
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {

    var erros2 = []

    if(!req.body.nome){
        erros2.push("Nome inválido")
    }else{
        erros2.push("Nome muito pequeno")
    }

    if(!req.body.slug){
        erros2.push("Slug inválido")
    }

    

    if(erros2.length > 0){
        res.render("./admin/editcategorias", {erros: erros}) // Se tiver erros, manda de volta pra mms página, e fala os erros.
    }


    Categoria.findOne({_id: req.body.id}).lean().then((categoria) => {

        categoria.nome = req.body.nome // vai pegar o nome da categoria nome, e vai passar p ele o nome do formulario de edição
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success_msg', "A categoria foi editada com sucesso.")
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', "Houve um erro interno ao editar a categoria")
            res.redirect('/admin/categorias')
        })

    }).catch((erro) => {
        req.flash('error_msg', "Houve um erro ao editar a categoria")
        res.redirect('/admin/categorias')
    }) 
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', "A categoria foi deletada com sucesso.")
        res.redirect('/admin/categorias')
    }).catch(() => {
        req.flash('error_msg', "Houve um erro ao deletar a categoria.")
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req, res) => { // Rota criada

    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens.')
        res.redirect('./admin/')
    })
})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().lean().then( (categorias) => {
        res.render('admin/addpostagens', {categorias: categorias})
    }).catch(() => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário.')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {

    var erros = []

    if(req.body.categoria == '0'){
        erros.push({texto:"Categoria inválida! Registre uma categoria."})
    }

    if(erros.length > 0){
        res.render("admin/addpostagens", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', "Postagem criada com sucesso!")
            console.log('sucessooooooooooooooooooooooooo postagem nova')
            res.redirect('/admin/postagens')
        }).catch(() => {
            req.flash('error_msg', "Houve um erro ao criar a postagem")
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((erro) => {
            req.flash('error_msg', "Houve um erro ao listar as categorias.")
            res.redirect('/admin/postagens')
        })
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição.')
        res.redirect('/admin/postagens')
    })
})


router.post('/postagem/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => { // tirar o lean daqui, e do save()
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((error) => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/postagens')
        })

    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao salvar a edição: ' + erro)
        res.redirect('/admin/postagens')
    })
})


router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((erro) => {
        console.log('ooooooooooooooooooooooooo')
        req.flash('error_msg', 'Houve um erro ao deletar a postagem: ' + erro)
        res.redirect('/admin/postagens')
    })
})




module.exports = router