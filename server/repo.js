const mailer = require("./mailer");
const model = require("./model");
const fetch = require("./fetch");

const sendNotification = async (items) => {
    const updatedItems = items.filter((item) => item.updateFlag);

    if (updatedItems.length) {
        console.log("send items", updatedItems.length);
        await mailer.sendMail(updatedItems);
    }
};

const fetchAndSave = async ({ url, selector }) => {
    const value = await fetch({ url, selector });
    const news = await model.save({ url, selector, value });
    return news
};

const fetchAll = async () => {
    const sites = await model.getAll();
    const values = await Promise.all(
        sites.map(({ url, selector }) => fetch({ url, selector }))
    );

    const promises = [];
    for (let i = 0; i < sites.length; i++) {
      promises.push(model.save({
        ...sites[i],
         value: values[i] 
      }));
    }

    const results = await Promise.allSettled(promises);
    const items = results.filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .filter((item) => item.newFlag || item.updateFlag);

    console.log("updated items", items.length);

    await sendNotification(items)

    return items;
};

const connect = async (cb) =>  {
    await model.connect();
    cb();
}
const deleteById = (_id) => model.deleteById(_id);
const update = (site) => model.update(site);
const save = (site) =>  model.save(site);
const getAll = () => model.getAll();

module.exports = {
    fetchAndSave,
    fetchAll,
    fetch,
    deleteById,
    connect,
    update,
    getAll,
    save
}
