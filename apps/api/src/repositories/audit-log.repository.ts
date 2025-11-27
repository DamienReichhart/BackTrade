import type { Prisma, AuditLog } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import type { IBaseRepository } from "./base.repository";

/**
 * Repository for AuditLog model operations
 *
 * Provides CRUD operations for managing audit logs in the database
 */
export class AuditLogRepository
  implements
    IBaseRepository<
      AuditLog,
      Prisma.AuditLogCreateInput,
      Prisma.AuditLogUpdateInput,
      Prisma.AuditLogWhereInput
    >
{
  /**
   * Get all audit logs
   *
   * @param where - Optional filter conditions
   * @returns Promise resolving to an array of audit logs
   */
  async getAll(where?: Prisma.AuditLogWhereInput): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where,
    });
  }

  /**
   * Get an audit log by ID
   *
   * @param id - The audit log ID
   * @returns Promise resolving to the audit log or null if not found
   */
  async getById(id: number | string): Promise<AuditLog | null> {
    return prisma.auditLog.findUnique({
      where: { id: Number(id) },
    });
  }

  /**
   * Create a new audit log
   *
   * @param data - The audit log data to create
   * @returns Promise resolving to the created audit log
   */
  async add(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return prisma.auditLog.create({
      data,
    });
  }

  /**
   * Update an existing audit log
   *
   * @param id - The audit log ID to update
   * @param data - The audit log data to update
   * @returns Promise resolving to the updated audit log
   */
  async update(
    id: number | string,
    data: Prisma.AuditLogUpdateInput,
  ): Promise<AuditLog> {
    return prisma.auditLog.update({
      where: { id: Number(id) },
      data,
    });
  }

  /**
   * Delete an audit log by ID
   *
   * @param id - The audit log ID to delete
   * @returns Promise resolving to the deleted audit log
   */
  async delete(id: number | string): Promise<AuditLog> {
    return prisma.auditLog.delete({
      where: { id: Number(id) },
    });
  }
}
