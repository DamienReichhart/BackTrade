/**
 * Audit Log Repository
 *
 * Data access layer for AuditLog model operations.
 */

import type { AuditLog, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all audit logs matching optional filter conditions
 */
async function getAllAuditLogs(
  where?: Prisma.AuditLogWhereInput,
): Promise<AuditLog[]> {
  return prisma.auditLog.findMany({ where });
}

/**
 * Get an audit log by ID
 */
async function getAuditLogById(
  id: number | string,
): Promise<AuditLog | null> {
  return prisma.auditLog.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Create a new audit log
 */
async function createAuditLog(
  data: Prisma.AuditLogCreateInput,
): Promise<AuditLog> {
  return prisma.auditLog.create({ data });
}

/**
 * Update an existing audit log
 */
async function updateAuditLog(
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
 */
async function deleteAuditLog(id: number | string): Promise<AuditLog> {
  return prisma.auditLog.delete({
    where: { id: Number(id) },
  });
}

export default {
  getAllAuditLogs,
  getAuditLogById,
  createAuditLog,
  updateAuditLog,
  deleteAuditLog,
};
