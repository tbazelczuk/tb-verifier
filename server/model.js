const mongoose = require("mongoose");

const uristring =
  process.env.MONGODB_URI || "mongodb://localhost/HelloMongoose";

var NewsSchema = new mongoose.Schema(
  {
    url: String,
    value: String,
    title: String,
    selector: String,
    history: [],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const NewsModel = mongoose.model("News", NewsSchema);

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
  return new Promise((resolve, reject) => {
    const { url } = item;

    NewsModel.findOne({ url })
      .then((doc) => {
        if (!doc) {
          const model = new NewsModel(item);
          model
            .save()
            .then((doc) => {
              console.log("succeess saved", doc);
              resolve({
                ...doc._doc,
                newFlag: true
              });
            })
            .catch((err) => {
              console.log(err);
              reject();
            });
        } else if (shouldUpdate(item, doc)) {
          NewsModel.findOneAndUpdate({ url }, {
            value: item.value,
            history: [...doc.history, {
              created_at: new Date(),
              value: item.value
            }]
          }, { new: true })
            .then((newDoc) => {
              console.log("succeess updated", newDoc);
              resolve({
                ...newDoc._doc,
                prevItem: doc._doc,
                updateFlag: true
              });
            })
            .catch((err) => {
              console.log(err);
              reject();
            });
        } else {
          console.log("nothing to change", doc.url, doc.value);
          reject();
        }
      })
      .catch((err) => {
        console.log(err);
        reject();
      });
  });
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

module.exports = {
  disconnect,
  connect,
  deleteById,
  find,
  save,
  update,
  // TODO: rename to findAll
  getAll,
};
