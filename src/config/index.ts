export default {
  databaseURL: process.env.MONGO_CONNECT,
  port: process.env.PORT,
  password_salt: process.env.PASSWORD_SALT,
  admin_password: process.env.ADMIN_PASSWORD,
  api: {
    prefix: "/api",
  },
};
