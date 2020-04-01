require('dotenv/config');

const axios = require('axios')
const fs = require('fs')
const sha1 = require('sha1')
const FormData = require('form-data');

//Token
const TOKEN =  '5fe6d4c69299ca89019625223d9fb839edc215cf'

/**
 * Realiza a requisição do desafio
 * Salva o retorno em um arquivo .json
 */
function getData(){
    axios.get(`https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${TOKEN}`)
    .then(function(response){
        fs.writeFile(__dirname + '/answer.json', JSON.stringify(response.data), err=>{
            console.log(err || 'Arquivo JSON Salvo com Sucesso')
        })
    })   
}

/**
 * Abre o arquivo json e ler os dados;
 */
function openTextEncode(){
    const path = (__dirname + '/answer.json')
    fs.readFile(path, 'utf-8', (err, content)=>{
    const data = JSON.parse(content);
    const textEncode = data.cifrado.toLowerCase()
        decodeText(textEncode, data.numero_casas)
    })    
}

/**
 * Função para descriptografar a string solicitada;
 */
function decodeText(text, number){
  let textDecode =  text.replace(/[a-z0-9\.]/g, function(x){
    let matchesnumber = x.match(/\d+/g);
    let shift = (26 - number) % 26;
         return  (x === '.' || matchesnumber != null) ? x : String.fromCharCode((x.charCodeAt(0) - 97 + shift) % 26 + 97)
       
  })

    updateDecrifed(textDecode)
}

/**
 * Atualiza o arquivo com a string descriptografada
 */
function updateDecrifed(textDecode){
    const path = (__dirname + '/answer.json')
    fs.readFile(path, 'utf8', function(err, data) {  
        if (err) throw err;
        const content = JSON.parse(data)
        content.decifrado = textDecode
        content.resumo_criptografico = sha1(textDecode)

        fs.writeFile(__dirname + '/answer.json', JSON.stringify(content), err=>{
            console.log(err || 'Arquivo JSON Salvo com Sucesso')
        })

        sendData()
    })

}

/**
 * Faz a requisição POS mandando o json com as informações solicitadas;
 */
function sendData(){

    const filePath = (__dirname + '/answer.json')
    const URL = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${TOKEN}`
    let form = new FormData();
    const config = {headers:  form.getHeaders() }

    form.append('answer', fs.createReadStream(filePath), { filename: 'answer.json'});

    axios.post(URL, form, config)
        .then((resp) => {
            console.log('O arquivo answer.json foi enviado com sucesso!')
        }).catch(err => {
            console.log('O arquivo answer.json NÃO foi enviado , Erro', err.response.data.message)
        })    

}

//Run
getData()
openTextEncode()

