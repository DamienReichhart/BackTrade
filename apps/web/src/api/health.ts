import { apiClient } from ".";
import { Health } from '@backtrade/types';



export const getHealth = async () => {
    return apiClient.get<Health>("/health");
}