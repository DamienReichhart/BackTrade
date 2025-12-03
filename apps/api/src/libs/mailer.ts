import nodemailer from "nodemailer";
import { ENV } from "../config/env";
import { logger } from "./logger/pino";

const mailerLogger = logger.child({
    service: "mailer",
});

const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASSWORD,
    },
});

mailerLogger.info(
    {
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: true,
    },
    "SMTP transport created, SMTP client ready"
);

export default transporter;
