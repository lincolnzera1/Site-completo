const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: String,
    email: String,
    senha: {
        type: String,
        required: true
    },
    eAdmin:{
        type: Number,
        default: 0
    }
})

mongoose.model("usuarios", Usuario)
    

