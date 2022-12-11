require("dotenv").config()

const express = require('express')
const bodyParser = require('body-parser')

const { connect, save, update, getAll, deleteById, fetch, fetchAll } = require('./server/repo')
const mailer = require("./server/mailer");

const PORT = process.env.PORT || 3000
const app = express()

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html', 'css', 'js', 'ico', 'jpg', 'jpeg', 'png', 'svg'],
    index: ['index.html'],
    maxAge: '1m',
    redirect: false
}
app.use(express.static('dist', options))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/api/sites", async (req, res) => {
    const sites = await getAll()
    res.json(sites)
})

app.post("/api/sites", async (req, res) => {
    try {
        const body = req.body
        const site = await save(body)
        res.json(site)
    } catch ({ message }) {
        res.json({ message })
    }
})

app.put("/api/sites", async (req, res) => {
    const body = req.body
    const site = await update(body)
    res.json(site)
})

app.delete("/api/sites", async (req, res) => {
    const { _id } = req.body
    await deleteById(_id)
    res.json({ _id })
})

app.get("/api/fetch", async (req, res) => {
    const sites = await fetchAll()
    res.json(sites)
})

app.put("/api/fetch", async (req, res) => {
    const { url, selector } = req.body
    const content = await fetch({ url, selector })
    res.json({ content })
})

app.get("/api/sendmail", function (req, res) {
    mailer.sendMail([{ url: "foo", value: 1, prevItem: { value: 2 } }]);
    res.send("sendMail");
  });

connect(() => {
    app.listen(PORT, () => {
        console.log(`App listening at http://localhost:${PORT}`)
    })
})
