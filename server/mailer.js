const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const projectId = process.env.PROJECT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

const credentials = {
    "type": "authorized_user",
    "client_id": clientId,
    "client_secret": clientSecret,
    "refresh_token": refreshToken
}

const auth = google.auth.fromJSON(credentials)
const gmail = google.gmail({ version: 'v1', auth });

const sendEmail = async (emailOptions) => {
    const { subject, from, to, html } = emailOptions;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `From: ${from}`,
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        html,
        '',
        '🤘❤️😎',
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    });
    console.log(res.data);
};

function prepareHtmlItem(item) {
    if (item.prevItem) {
        return `<strike>${item.prevItem.value}</strike> - ${item.value}`;
    }
    return item.value;
}

function prepareHtml(items) {
    let html = "<ol>";
    for (var i = 0; i < items.length; i++) {
        let item = items[i];
        html += "<li>";
        html +=
            '<a href="' +
            item.url +
            '"> ' +
            item.url +
            "</a> - " +
            prepareHtmlItem(item);
        html += "</li>";
    }
    html += "</ol>";
    return html;
}

async function sendMail(items) {
    const html = prepareHtml(items);
    console.log("send mail", html);

    await sendEmail({
        subject: "🤘 Verifier 🤘 ",
        html: html,
        to: "Tomasz Bazelczuk <tbazelczuk@gmail.com>",
        from: "Tomasz Bazelczuk <tbazelczuk@gmail.com>",
    });
}

module.exports = {
    sendMail,
};
