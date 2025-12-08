/// <reference types="express" />
import { User } from "@backtrade/types";

declare namespace Express {
    interface Request {
        id?: string;
        validatedInput?: unknown;
        user?: User;
    }
}
