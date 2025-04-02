const express = require('express');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')

// buat server nya menggunakan port sesuai settingan konstanta = 5000
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));



// script upload
app.use(express.static("./public"))
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({storage: storage}); // script untuk penggunaan multer saat upload
 
// create data / insert data
app.post('/api/film', upload.single('images'), (req, res) => {
    // Debugging: Log body dan file untuk memastikan data sampai dengan benar
    console.log('Body:', req.body);  // Log semua data di body
    console.log('File:', req.file);  // Log file yang di-upload
    console.log('Request File:', req.file);

    // Pastikan data dari req.body ada dan valid
    const { judul, sutradara, tahun } = req.body;
    
    // Pastikan data sudah ada
    if (!judul || !sutradara || !tahun) {
        return res.status(400).json({ message: 'Data tidak lengkap, pastikan judul, sutradara, dan tahun sudah diisi.' });
    }
    
    let imgsrc = null;  // Variabel untuk URL gambar
    
    // Cek jika ada file yang di-upload
    if (req.file) {
        imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        console.log('File uploaded:', imgsrc);
    }

    // Query SQL untuk insert data
    const querySql = 'INSERT INTO film(judul, images, sutradara, tahun) VALUES (?, ?, ?, ?)';
    koneksi.query(querySql, [judul, imgsrc, sutradara, tahun], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal insert data!', error: err });
        }
        res.status(201).json({ success: true, message: 'Berhasil insert data!' });
    });
});




// read data / get data
app.get('/api/film', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM film';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/film/:nim', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM film WHERE nim = ?';
    const nim = req.body.nim;
    const nama = req.body.nama;
    const tanggal_lahir = req.body.tanggal_lahir;
    const alamat = req.body.alamat;

    const queryUpdate = 'UPDATE film SET nama=?,tanggal_lahir=?,alamat=? WHERE nim = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.nim, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama,tanggal_lahir,alamat, req.params.nim], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/film/:nim', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM film WHERE nim = ?';
    const queryDelete = 'DELETE FROM film WHERE nim = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.nim, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.nim, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});