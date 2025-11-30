/**
 * Session Repository
 *
 * Data access layer for trading Session model operations.
 */

import type { Prisma, Session } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

/**
 * Get all sessions matching optional filter conditions
 */
async function getAllSessions(
  where?: Prisma.SessionWhereInput,
): Promise<Session[]> {
  return prisma.session.findMany({ where });
}

/**
 * Get a session by ID
 */
async function getSessionById(id: number | string): Promise<Session | null> {
  return prisma.session.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Create a new session
 */
async function createSession(
  data: Prisma.SessionCreateInput,
): Promise<Session> {
  return prisma.session.create({ data });
}

/**
 * Update an existing session
 */
async function updateSession(
  id: number | string,
  data: Prisma.SessionUpdateInput,
): Promise<Session> {
  return prisma.session.update({
    where: { id: Number(id) },
    data,
  });
}

/**
 * Delete a session by ID
 */
async function deleteSession(id: number | string): Promise<Session> {
  return prisma.session.delete({
    where: { id: Number(id) },
  });
}

export default {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
};
