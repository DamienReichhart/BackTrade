/**
 * Position Repository
 *
 * Data access layer for trading Position model operations.
 */

import type { Prisma } from "../generated/prisma/client";
import type {
    Position,
    PositionWhereInput,
    PositionCreateInput,
    PositionUpdateInput,
    PositionOrderBy,
    PositionStatus,
} from "@backtrade/types";
import { BasePostgresRepository } from "./base-repository";

export interface FindAllOptions {
    where?: PositionWhereInput;
    skip?: number;
    take?: number;
    orderBy?: PositionOrderBy;
}

/**
 * Repository for Position model CRUD operations with pagination and sorting.
 */
class PositionsRepository extends BasePostgresRepository {
    /**
     * Get all positions matching optional filter, pagination, and sorting.
     *
     * @param options - Optional filter, pagination, and sorting options
     * @returns Array of matching positions
     */
    async getAllPositions(options?: FindAllOptions): Promise<Position[]> {
        return this.prisma.position.findMany({
            where: options?.where as Prisma.PositionWhereInput | undefined,
            skip: options?.skip,
            take: options?.take,
            orderBy: options?.orderBy as
                | Prisma.PositionOrderByWithRelationInput
                | undefined,
        }) as unknown as Position[];
    }

    /**
     * Get a position by ID.
     *
     * @param id - Position ID as number or string
     * @returns Position entity or null if not found
     */
    async getPositionById(id: number | string): Promise<Position | null> {
        return this.prisma.position.findUnique({
            where: { id: this.toNumericId(id) },
        }) as unknown as Position | null;
    }

    /**
     * Create a new position.
     *
     * @param data - Position creation data
     * @returns Created position entity
     */
    async createPosition(data: PositionCreateInput): Promise<Position> {
        return this.prisma.position.create({
            data: data as Prisma.PositionCreateInput,
        }) as unknown as Position;
    }

    /**
     * Update an existing position.
     *
     * @param id - Position ID as number or string
     * @param data - Position update data
     * @returns Updated position entity
     */
    async updatePosition(
        id: number | string,
        data: PositionUpdateInput
    ): Promise<Position> {
        return this.prisma.position.update({
            where: { id: this.toNumericId(id) },
            data: data as Prisma.PositionUpdateInput,
        }) as unknown as Position;
    }

    /**
     * Delete a position by ID.
     *
     * @param id - Position ID as number or string
     * @returns Deleted position entity
     */
    async deletePosition(id: number | string): Promise<Position> {
        return this.prisma.position.delete({
            where: { id: this.toNumericId(id) },
        }) as unknown as Position;
    }
    /**
     * Get all positions for a specific session.
     *
     * @param sessionId - Session ID as number or string
     * @returns Array of positions belonging to the session
     */
    async getPositionsBySessionId(
        sessionId: number | string
    ): Promise<Position[]> {
        return this.prisma.position.findMany({
            where: { session_id: this.toNumericId(sessionId) },
        }) as unknown as Position[];
    }

    /**
     * Get open positions for a specific session.
     *
     * Filters at database level to only fetch positions with status "OPEN".
     *
     * @param sessionId - Session ID as number or string
     * @returns Array of open positions belonging to the session
     */
    async getOpenPositionsBySessionId(
        sessionId: number | string
    ): Promise<Position[]> {
        return this.prisma.position.findMany({
            where: {
                session_id: this.toNumericId(sessionId),
                position_status: "OPEN",
            },
        }) as unknown as Position[];
    }

    /**
     * Get closed positions for a specific session.
     *
     * Filters at database level to only fetch positions with status "CLOSED" or "LIQUIDATED".
     *
     * @param sessionId - Session ID as number or string
     * @returns Array of closed positions (CLOSED or LIQUIDATED) belonging to the session
     */
    async getClosedPositionsBySessionId(
        sessionId: number | string
    ): Promise<Position[]> {
        return this.prisma.position.findMany({
            where: {
                session_id: this.toNumericId(sessionId),
                position_status: {
                    in: ["CLOSED", "LIQUIDATED"],
                },
            },
        }) as unknown as Position[];
    }

    /**
     * Get positions for a specific session filtered by status.
     *
     * Generic method to filter positions by session and status at database level.
     *
     * @param sessionId - Session ID as number or string
     * @param status - Position status to filter by
     * @returns Array of positions matching the session and status
     */
    async getPositionsBySessionIdAndStatus(
        sessionId: number | string,
        status: PositionStatus
    ): Promise<Position[]> {
        return this.prisma.position.findMany({
            where: {
                session_id: this.toNumericId(sessionId),
                position_status: status,
            },
        }) as unknown as Position[];
    }

    /**
     * Get closed or liquidated positions for a specific session.
     *
     * @param sessionId - Session ID as number or string
     * @returns Array of closed or liquidated positions belonging to the session
     */
    async getClosedOrLiquidatedPositionsBySessionId(
        sessionId: number | string
    ): Promise<Position[]> {
        return this.prisma.position.findMany({
            where: {
                session_id: this.toNumericId(sessionId),
                position_status: {
                    in: ["CLOSED", "LIQUIDATED"],
                },
            },
        }) as unknown as Position[];
    }
}

const positionsRepo = new PositionsRepository();

export default positionsRepo;
