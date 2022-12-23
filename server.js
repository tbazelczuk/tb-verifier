require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')

const { connect, save, update, getAll, deleteById, fetch, fetchAll, getStatus } = require('./server/repo')
const mailer = require('./server/mailer');

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.static('dist'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/api/status', async (req, res) => {
    res.json(await getStatus())
})

app.get('/api/sites', async (req, res) => {
    res.json(await getAll())
})

app.post('/api/sites', async (req, res) => {
    res.json(await save(req.body))
})

app.put('/api/sites', async (req, res) => {
    res.json(await update(req.body))
})

app.delete('/api/sites', async (req, res) => {
    res.json(await deleteById(req.body._id))
})

app.get('/api/fetch', async (req, res) => {
    res.json(await fetchAll())
})

app.put('/api/fetch', async (req, res) => {
    res.json(await fetch(req.body))
})

app.get('/api/sendmail', function (req, res) {
    mailer.sendMail([{ url: 'foo', value: 1, prevItem: { value: 2 } }]);
    res.send('sendMail');
});

connect(() => {
    app.listen(PORT, () => {
        console.log(`App listening at http://localhost:${PORT}`)
    })
})
