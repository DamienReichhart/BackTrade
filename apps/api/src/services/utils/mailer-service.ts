import mailer from "../../libs/mailer";
import { ENV } from "../../config/env";
import { logger } from "../../libs/logger/pino";

const mailerServiceLogger = logger.child({
    service: "mailer-service",
});

async function sendEmail(
    to: string,
    subject: string,
    html: string
): Promise<void> {
    const info = await mailer.sendMail({
        from: ENV.SMTP_FROM,
        to,
        subject,
        html,
    });
    mailerServiceLogger.info({ info }, "Email sent successfully");
}

async function checkConnection(): Promise<"connected" | "error"> {
    try {
        await mailer.verify();
        return "connected";
    } catch {
        return "error";
    }
}

export default {
    sendEmail,
    checkConnection,
};
