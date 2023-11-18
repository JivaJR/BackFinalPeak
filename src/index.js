import mysql from 'mysql2'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('src'))

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
    res.send('Servidor Proyecto Final')
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
app.get('/usuarios',(req,res) => {
    var {email} = req.query;
    let tabledb = 'usuarios';
    var sqlpetget = `SELECT * FROM ${tabledb} WHERE email = ${email};`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        if (result.length > 0) {
            return res.status(409).json({ message: 'El usuario ya está registrado', status: true });
        }else {
            res.status(200).json({
                status:false,
            });
        }
    });
})
app.get('/destinos',(req,res) => {
    let tabledb = 'ciudades';
    var sqlpetget = `SELECT * FROM ${tabledb};`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        if (err) {
            console.error('Error during registration:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
        res.status(200).json({
            data:mess,
        });
    });
})
app.get('/hoteles',(req,res) => {
    var {pais,ciudad,limit} = req.query;
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
        `SELECT h.id_hotel, p.pais_Name,  c.nombre_ciudad,  h.nombre_hotel, h.stars, h.camas, h.habitaciones,h.pricing
        FROM hoteles h
        JOIN ciudades c ON h.id_ciudad = c.id_ciudad
        JOIN paises p ON c.id_pais = p.id_pais
        ${cond?cond:'ORDER BY id_hotel;'} LIMIT ${limit?limit:'10'}`;
    conexion.query(sqlpetget, (err, mess, fields) => {
        res.status(200).json({
            data:mess,
        });
    });
})
app.post('/register', (req, res) => {
    const { username, password,email } = req.body;
    // Verifica que username y password estén presentes en el cuerpo de la solicitud
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Se requieren nombre de usuario, contraseña y correo' });
    }
    // Verifica si el usuario ya existe en la base de datos
    conexion.query(`SELECT * FROM usuarios WHERE email = '${email}';`, (err, result) => {
        if (err) {
            console.error('Error during registration:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
        // Si el usuario ya existe, devuelve un mensaje de error
        if (result.length > 0) {
            return res.status(409).json({ message: 'El nombre de usuario ya está registrado' });
        }
      // Si el usuario no existe, procede con la inserción en la base de datos
        conexion.query('INSERT INTO usuarios (email, user_Password, user_FullName) VALUES (?, ?, ?)', [email, password, username], (err, result) => {
            if (err) {
                console.error('Error during registration:', err);
                return res.status(500).json({ message: 'Error interno del servidor' });
            }
    
            return res.status(201).json({ message: 'Registro exitoso' });
        });
    });
});
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    // Verifica que username y password estén presentes en el cuerpo de la solicitud
    if (!email || !password) {
        return res.status(400).json({ message: 'Se requieren nombre de usuario y contraseña' });
    }
    // Busca al usuario en la base de datos
    conexion.query(`SELECT user_FullName FROM usuarios WHERE email = '${email}' AND user_Password = '${password}';`, (err, result) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
      // Verifica si se encontró un usuario con las credenciales proporcionadas
        if (result.length > 0) {
            return res.status(200).json({ message: 'Inicio de sesión exitoso',userName:result});
        }else {
            return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos' });
        }
    });
});
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

app.set('port',process.env.PORT || 8050)
app.listen(app.get('port'), '0.0.0.0' ,()=>{
    console.log("Alojado en el puerto:",app.get('port'))
})