/// <reference types="express" />

import type { User } from "@backtrade/types";

declare global {
    namespace Express {
        interface Request {
            id?: string;
            user?: User;
        }
    }
}

export {};
