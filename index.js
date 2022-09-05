const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv/config.js')

const { rows } = require('pg/lib/defaults');


const url = process.env.DATABASE_URL;

const app = express();
let user = [];

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();


app.listen(process.env.PORT || 3001, (err) => {
    if (err) { return console.log(err) }

console.log(`Rodando na porta: ${process.env.PORT}!`);

})


const SECRET = process.env.SECRET

app.post('/', (req, res) => {
    return res.json({ "sucess": "Bando de dados rodando" });
});
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


    client.query(`select * from usuario WHERE email = $1`, [email])
        .then(results => {
            const resultadoQuery = results
           
           console.log(resultadoQuery.rowCount)
            if (resultadoQuery.rowCount === 1) {
             
                res.json({ "error": "E-mail já possui cadastro" })
                resultadoQuery.rowCount = 0
            } else {
                
                if (password === passwordConfirmacao) {
                    client.query(`INSERT INTO usuario (email,password,name) VALUES ($1, $2, $3)`, [email, password, name])
                        .then(results => {
                            const resultado = results

                            console.log(resultado.rowCount)

                            if (resultado.rowCount === 1) {


                                return res.json({ "cadastrado": "Usuario cadastrado com sucesso" });

                            } else {
                                return res.json({ "error": "Erro ao cadastrar" });
                            }
                        })

                } else {
                    return res.json({ "error": "Erro: Senhas Diferentes" });

                }

            }
        });
});


app.post('/salvarFoto', (req, res) => {
    const email = req.body.email;
    const isBase64Code = req.body.code64;

    client.query('UPDATE usuario SET id_cod_img = $1 WHERE email = $2', [isBase64Code, email])
        .then(results => {
            let resultado = results;
            console.log(resultado)
            if (resultado.rowCount === 1) {
                return res.json({ "message": "Salvo com sucesso!" });

            } else {
                return res.json({ 'error': "Erro ao salvar imagem" })
            }

        })
        .catch(e => console.log(error))

});


app.post('/imagem', (req, res) => {

    const email = req.body.email;

    client.query(`select id_cod_img from usuario WHERE email = $1`, [email]) 
       .then(results => {
        let resultado = results


        const id_cod_img = results.rows[0];
        console.log(id_cod_img)

        if (resultado.rowCount === 1) {
            return res.json({ "message": id_cod_img});
        }
        else {

        }
    })
});



app.post('/apagaImagem', (req, res) => {

    const email = req.body.email;
    const isBase64Code = '';

    client.query('UPDATE usuario SET id_cod_img = $1 WHERE email = $2', [isBase64Code, email]) 
       .then(results => {
        let resultado = results

        console.log(resultado.rowCount)

        if (resultado.rowCount === 1) {
            return res.json({ "message": 'Apagada com sucesso!'});
        }
        else {
            return res.json({ "error": 'Error ao apagar!'});

        }
    })
});

app.post('/buscarRegistros', (req, res) => {

    client.query(`SELECT email,name , id_cod_img FROM usuario`) 
       .then(results => {
        
      
        var Resultado2 = results
        var usuarios = [Resultado2.rows];
        return res.json({ "usuarios": Resultado2});
       
    })

});


app.post('/alterarSenha', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const newPassword = req.body.passwordConfirmacao;
  console.log(email,password,newPassword)
  client.query('UPDATE usuario SET password = $1 WHERE email = $2', [newPassword, email])
    .then(results => {
      let resultado = results
    console.log(resultado)
      if (resultado.rowCount === 1) {
        return res.json({ "message": 'alterado com sucesso!' });
      } else {
        return res.json({ "error": 'Error ao alterar!' });
      }
    })
});

