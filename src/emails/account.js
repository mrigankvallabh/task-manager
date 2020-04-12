const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRIG_API_KEY);

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: "mrigank@trident-international.net",
    subject: "Welcome to the Task Manager App",
    text: `Dear ${name}! Thanks for signing up!`,
    html: `<strong>Dear ${name}! Thanks for signing up!</strong>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Welcome Email sent to ${email}`);
    })
    .catch((e) => console.log(e));
};

const sendCancelEmail = (email, name) => {
  const msg = {
    to: email,
    from: "mrigank@trident-international.net",
    subject: "Task Manager App: Sorry to see you go",
    text: `Dear ${name}! Thanks for using our services! We are indeed sorry to see you go. We would love to have you back. Please do provide your suggestions so that we may improve our services.`,
    html: `<p>Dear ${name}! Thanks for using our services! We are indeed sorry to see you go. We would love to have you back. Please do provide your suggestions so that we may improve our services.</p><p>Task App Team!</p>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Cancellation Email sent to ${email}`);
    })
    .catch((e) => console.log(e));
};
module.exports = { sendWelcomeEmail, sendCancelEmail };
