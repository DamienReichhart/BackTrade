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
    // Skip sending email if NEUTRALIZE_EMAIL is enabled
    if (ENV.NEUTRALIZE_EMAIL) {
        mailerServiceLogger.info(
            { to, subject },
            "Email sending neutralized (NEUTRALIZE_EMAIL=true)"
        );
        return;
    }

    const info = await mailer.sendMail({
        from: ENV.SMTP_FROM,
        to,
        subject,
        html,
    });
    mailerServiceLogger.info({ info }, "Email sent successfully");
}

async function checkConnection(): Promise<boolean> {
    try {
        await mailer.verify();
        return true;
    } catch {
        return false;
    }
}

export default {
    sendEmail,
    checkConnection,
};
