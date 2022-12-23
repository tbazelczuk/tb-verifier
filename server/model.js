const mongoose = require("mongoose");

const uristring = process.env.MONGODB_URI || "mongodb://localhost/HelloMongoose";

const NewsSchema = new mongoose.Schema({
  url: String,
  value: String,
  title: String,
  selector: String,
  history: [],
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

const NewsModel = mongoose.model("News", NewsSchema);

const StatusSchema = new mongoose.Schema({
  count: Number,
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

const StatusModel = mongoose.model("Status", StatusSchema);

mongoose.set('strictQuery', false)

async function connect() {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      uristring,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      function (err) {
        if (err) {
          console.error("ERROR connecting to mongodb:", err);
          reject();
        } else {
          console.log("Succeeded connected to mongodb");
          resolve();
        }
      }
    );
  });
}

function disconnect() {
  mongoose.disconnect();
  console.log("Succeeded disconnect from mongodb");
}

async function getAll() {
  const items = await NewsModel.find(null, null, { sort: { updated_at: -1 }, lean: true });
  return items.map(({ _id, url, title, value, selector, history, updated_at }) => ({ _id, url, title, value, selector, history, updated_at }))
}

const shouldUpdate = (item, doc) => {
  return item.value !== doc.value;
};

async function save(item) {
  const { url } = item;
  const doc = await NewsModel.findOne({ url })

  if (!doc) {
    const model = new NewsModel(item);
    const doc = await model.save()
    console.log("succeess saved", doc);
    return {
      ...doc._doc,
      newFlag: true
    };
  } else if (shouldUpdate(item, doc)) {
    const history = doc.history ? doc.history : [];
    const newDoc = await NewsModel.findOneAndUpdate({ url }, {
      value: item.value,
      history: [...history, {
        created_at: new Date(),
        value: doc.value
      }],
    }, { new: true })
    console.log("succeess updated", newDoc);
    return {
      ...newDoc._doc,
      prevItem: doc._doc,
      updateFlag: true
    };
  }

  console.log("nothing to change", doc.url, doc.value);
  return doc._doc;
}

async function update(item) {
  console.log('update', item);

  return new Promise(function (resolve, reject) {
    NewsModel.updateOne({ _id: item._id }, item)
      .then(() => {
        resolve(item);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

async function find(_id) {
  return new Promise((resolve, reject) => {
    NewsModel.findOne({ _id })
      .then((doc) => {
        resolve(doc);
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
}

function deleteById(_id) {
  return NewsModel.findByIdAndDelete(_id)
}

async function updateStatus(count) {
  const model = new StatusModel({ count });
  const doc = await model.save()
  return doc
}

async function getStatus() {
  const doc = await StatusModel.findOne(null, ['-_id', 'count', 'updated_at'], { sort: { updated_at: -1 } })
  return doc._doc
}

module.exports = {
  disconnect,
  connect,
  deleteById,
  find,
  save,
  update,
  // TODO: rename to findAll
  getAll,
  getStatus,
  updateStatus,
};
