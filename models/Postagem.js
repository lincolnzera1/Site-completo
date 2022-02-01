const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:String,
    slug: String,
    descricao: String,
    conteudo: String,
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'categorias',
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('postagens', Postagem)