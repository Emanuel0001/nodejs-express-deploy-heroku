const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv/config.js')
const { Client } = require('pg');
const { rows } = require('pg/lib/defaults');


const url = process.env.DATABASE_URL;

const app = express();
let user = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(process.env.PORT || 3001, (err) => {
    if (err) { return console.log(err) }

console.log(`Rodando na porta: ${process.env.PORT}!`);

})



const SECRET = process.env.SECRET

const verifyJWT = (req, res, next) => {
    const token = req.headers['x-access-token'];
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).end();
        req.userId = decoded.userId;
        next();
    })
}


app.get('/client', verifyJWT, (req, res) => {
    console.log(req.userId + ' fez chamada')
    res.status(200).send("Welcome 🙌 ");
})

app.post('/login', (req, res) => {

    console.log(req.body)
    const email = req.body.email;
    const password = req.body.password;

    client.query(`select * from usuario WHERE email = $1 AND password = $2`, [email, password])
        .then(results => {
            const resultado = results

            console.log(resultado.rowCount)

            if (resultado.rowCount === 1) {
                const token = jwt.sign({ userId: 1, email: email }, SECRET, { expiresIn: '1h' })               
                
                return res.json({ "message": "Sucesso", auth: true, token, email });

            } else {
                return res.json({ "error": "Credencias Inválidas" });
            }
        })
        .catch(e => console.log(" erro!!",))

});


app.post('/cadastrar', (req, res) => {

    console.log(req.body)
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirmacao = req.body.passwordConfirmacao;
    const name = req.body.name;

    if (password === passwordConfirmacao) {
        client.query(`INSERT INTO usuario (email,password,name) VALUES ($1, $2, $3)`, [email, password, name])
            .then(results => {
                const resultado = results

                console.log(resultado.rowCount)

                if (resultado.rowCount === 1) {


                    return res.json({ "message": "Usuario cadastrado com sucesso" });

                } else {
                    return res.json({ "error": "Erro ao cadastrar" });
                }
            })
            .catch(e => res.json({ "error": "E-mail já possui cadastro" }))

    } else {
        return res.json({ "error": "Erro: Senhas Diferentes" });

    }
});





