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
} from "@backtrade/types";
import { BaseRepository } from "./base-repository";

/**
 * Repository for Position model CRUD operations.
 */
class PositionsRepository extends BaseRepository {
    /**
     * Get all positions matching optional filter conditions.
     *
     * @param where - Optional filter conditions
     * @returns Array of matching positions
     */
    async getAllPositions(where?: PositionWhereInput): Promise<Position[]> {
        return this.prisma.position.findMany({
            where: where as Prisma.PositionWhereInput,
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
}

const positionsRepo = new PositionsRepository();

export default positionsRepo;
