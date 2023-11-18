import mysql from 'mysql2'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors())

const conexion = mysql.createConnection({
    
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:{"rejectUnauthorized":true},
});

conexion.connect(function(err) {
    if (err) {
        console.error('Error de conexion: ' + err.stack);
        return;
    }
    console.log('BD Conectada exitosamente');
});

app.get('/',(req,res) => {
    let tabledb = 'usuarios';
    var sqlpetget = `SELECT * FROM ${tabledb};`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        res.status(200).json({
            data:mess,
        });
    });
})

app.get('/',(req,res) => {
    let tabledb = 'usuarios';
    var sqlpetget = `SELECT * FROM ${tabledb};`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        res.status(200).json({
            data:mess,
        });
    });
})

app.get('/promociones',(req,res) => {
    let tabledb = 'promociones';
    var sqlpetget = `SELECT * FROM ${tabledb};`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        res.status(200).json({
            data:mess,
        });
    });
})
app.get('/destinos',(req,res) => {
    let tabledb = 'ciudades';
    var sqlpetget = `SELECT * FROM ${tabledb};`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        res.status(200).json({
            data:mess,
        });
    });
})
app.get('/hoteles',(req,res) => {
    var {pais,ciudad} = req.query;
    console.log(pais,ciudad)
    let cond = null
    if (pais || ciudad){
        if (pais && ciudad){
            cond = `WHERE c.nombre_ciudad = '${ciudad}' AND p.pais_Name = '${pais}' ORDER BY id_hotel;`
        }
        else if (pais){
            cond = `WHERE p.pais_Name = '${pais}' ORDER BY id_hotel;`
        }
        else{
            cond = `WHERE c.nombre_ciudad = '${ciudad}' ORDER BY id_hotel;`
        }
    }
    var sqlpetget = 
        `SELECT h.id_hotel, p.pais_Name,  c.nombre_ciudad,  h.nombre_hotel, h.stars, h.camas, h.habitaciones
        FROM hoteles h
        JOIN ciudades c ON h.id_ciudad = c.id_ciudad
        JOIN paises p ON c.id_pais = p.id_pais
        ${cond?cond:'ORDER BY id_hotel;'}`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        res.status(200).json({
            data:mess,
        });
    });
})


app.set('port',process.env.PORT || 8050)
app.use(express.json());
app.use(express.static('src'))
app.listen(app.get('port'), '0.0.0.0' ,()=>{
    console.log("Alojado en el puerto:",app.get('port'))
})