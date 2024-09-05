export default {
  databaseURL: process.env.MONGO_CONNECT,
  port: process.env.PORT,
  password_salt: process.env.PASSWORD_SALT,
  admin_password: process.env.ADMIN_PASSWORD,
  smtp_service: process.env.SMTP_SERVICE,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  redis_url: process.env.REDIS_URL,
  api: {
    prefix: "/api",
  },
};
