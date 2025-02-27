var express = require('express');
const Model_Produk = require('../model/Model_Produk');
var router = express.Router();

const fs = require('fs');
const multer = require('multer');
const path = require('path');

const limits = {filesize: 1 * 1024 * 1024};

const filefilter = (req, file, cb) => {
    if(file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }
    return cb(new Error('Hanya bisa pdf dan gambar'), false);
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

router.get('/', async function(req, res, next){
    let rows = await Model_Produk.getAll();
    return res.status(200).json({
        status: true,
        message: 'Data Produk',
        data: rows
    })
})

router.get('/(:id)', async function(req, res, next){
    let id = req.params.id;
    let rows = await Model_Produk.getId(id);
    return res.status(200).json({
        status: true,
        message: 'Data Produk',
        data: rows
    })
})

router.post('/store', upload.single("gambar_produk"), async function(req, res, next){
    try{
        let {nama_produk, kategori_id} = req.body;
        let Data = {
            nama_produk,
            gambar_produk : req.file.filename,
            kategori_id
        }
        await Model_Produk.Store(Data);
        return res.status(201).json({
            status: true,
            message: 'Data berhasil ditambahkan'
        })
    } catch (error) {
        return res.status(500).json({
            status: true,
            message: 'Terjadi kesalahan pada router'
        })
    }
})

router.patch('/update/(:id)', upload.single("gambar_produk"), async function(req, res, next){
    try{
        let id = req.params.id;
        let {nama_produk, kategori_id} = req.body;
        let gambar = req.file ? req.file.filename : null;
        const fileold = rows[0].gambar_produk;
        if(gambar && fileold){
            const pathfile = path.join(__dirname, '../public/images/', fileold);
            fs.unlinkSync(pathfile);
        }
        let gambar_produk = gambar || fileold;
        let Data = {
            nama_produk,
            gambar_produk,
            kategori_id
        }
        await Model_Produk.Update(id, Data);
        return res.status(201).json({
            status: true,
            message: 'Data produk berhasil diperbarui'
        })
    } catch (error) {
        return res.status(500).json({
            status: true,
            message: 'Terjadi kesalahan pada router'
        })
    }
})

router.delete('/delete/(:id)', async function(req, res, next){
    try{
        let id = req.params.id;
        let rows = await Model_Produk.getId(id);
        const fileold = rows[0].gambar_produk;
        if(fileold){
            const pathfile = path.join(__dirname, '../public/images/', fileold);
            fs.unlinkSync(pathfile);
        }
        await Model_Produk.Delete(id, Data);
        return res.status(201).json({
            status: true,
            message: 'Data produk berhasil dihapus'
        })
    } catch (error) {
        return res.status(500).json({
            status: true,
            message: 'Terjadi kesalahan pada router'
        })
    }
})

module.exports = router;
