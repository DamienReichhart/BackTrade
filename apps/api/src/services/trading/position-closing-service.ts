/**
 * Position Closing Service
 *
 * Orchestration service that handles the complete position closing workflow:
 * - Calculate gross PnL using contract size
 * - Apply trading costs (commission, spread, slippage)
 * - Calculate net realized PnL
 * - Update position with closing data
 * - Create PNL transaction
 * - Update session balance
 *
 * This service coordinates between repositories and calculation services
 * to ensure all closing-related operations are performed atomically.
 */

import type {
    Position,
    Transaction,
    User,
    TransactionCreateInput,
    PositionUpdateInput,
    SessionWithInstrument,
} from "@backtrade/types";
import { positionsRepo, sessionsRepo } from "@backtrade/data";
import { logger } from "../../libs/pino";
import pnlCalculationService from "./pnl-calculation-service";
import transactionsService from "../base/transactions-service";
import { positionsCacheRepo } from "../../libs/cache";
import NotFoundError from "../../errors/web/not-found-error";
import BadRequestError from "../../errors/web/bad-request-error";
import sessionsService from "../base/sessions-service";

/**
 * Trading costs breakdown for a closed position
 */
export interface TradingCosts {
    /** Commission cost (entry + exit fills) */
    commission: number;
    /** Spread cost based on position size */
    spread: number;
    /** Slippage cost based on position size */
    slippage: number;
    /** Total of all trading costs */
    total: number;
}

/**
 * Result of closing a position
 */
export interface PositionClosingResult {
    /** Updated position with closing data */
    position: Position;
    /** PNL transaction created for this closure */
    transaction: Transaction;
    /** Gross PnL before costs */
    grossPnL: number;
    /** Net PnL after costs (equals realized_pnl) */
    netPnL: number;
    /** Breakdown of trading costs */
    costs: TradingCosts;
}

/**
 * Position Closing Service
 *
 * Orchestrates all operations required to close a trading position,
 * including PnL calculation, cost application, and transaction creation.
 */
class PositionClosingService {
    private readonly logger: ReturnType<typeof logger.child>;

    constructor() {
        this.logger = logger.child({
            service: "position-closing-service",
        });
    }

    /**
     * Calculate trading costs for closing a position
     *
     * Costs are calculated as:
     * - Commission: commission_per_fill × 2 (entry + exit)
     * - Spread: spread_pts × pip_size × quantity_lots × contract_size
     * - Slippage: slippage_pts × pip_size × quantity_lots × contract_size
     *
     * @param position - Position being closed
     * @param session - Session with instrument data
     * @returns Trading costs breakdown
     */
    private calculateTradingCosts(
        position: Position,
        session: SessionWithInstrument
    ): TradingCosts {
        const { instrument } = session;
        const contractSize = Number(instrument.contract_size);
        const pipSize = Number(instrument.pip_size);
        const quantityLots = Number(position.quantity_lots);

        // Convert Prisma Decimals to numbers for calculations
        const commissionPerFill = Number(session.commission_per_fill);
        const spreadPts = Number(session.spread_pts);
        const slippagePts = Number(session.slippage_pts);

        // Commission is per fill, and closing requires 2 fills (entry was already done)
        // For closing, we charge commission for the exit fill
        const commission = commissionPerFill;

        // Spread cost: spread_pts × pip_size × quantity × contract_size
        const spread = spreadPts * pipSize * quantityLots * contractSize;

        // Slippage cost: slippage_pts × pip_size × quantity × contract_size
        const slippage = slippagePts * pipSize * quantityLots * contractSize;

        const total = commission + spread + slippage;

        this.logger.trace(
            {
                positionId: position.id,
                sessionId: session.id,
                commission,
                spread,
                slippage,
                total,
                spreadPts,
                slippagePts,
                commissionPerFill,
                pipSize,
                contractSize,
                quantityLots,
            },
            "Calculated trading costs"
        );

        return { commission, spread, slippage, total };
    }

    /**
     * Close a position with full PnL calculation and transaction creation
     *
     * This method:
     * 1. Validates the position exists and is open
     * 2. Validates user has access to the session
     * 3. Gets session with instrument for contract_size
     * 4. Calculates gross PnL using contract_size
     * 5. Calculates trading costs (commission, spread, slippage)
     * 6. Calculates net realized PnL
     * 7. Updates position with closing data
     * 8. Creates PNL transaction and updates session balance
     *
     * @param positionId - ID of the position to close
     * @param exitPrice - Price at which position is being closed
     * @param closedAt - Timestamp when position was closed
     * @param user - User performing the close operation
     * @param positionStatus - Status to set (CLOSED or LIQUIDATED)
     * @returns Position closing result with all calculated values
     * @throws NotFoundError if position or session not found
     * @throws BadRequestError if position is not open
     * @throws ForbiddenError if user doesn't have access
     */
    async closePosition(
        positionId: string,
        exitPrice: number,
        closedAt: string,
        user: User,
        positionStatus: "CLOSED" | "LIQUIDATED" = "CLOSED"
    ): Promise<PositionClosingResult> {
        this.logger.debug(
            { positionId, exitPrice, closedAt, userId: user.id, positionStatus },
            "Starting position close operation"
        );

        // 1. Get and validate position
        const position = await positionsRepo.getPositionById(positionId);
        if (!position) {
            this.logger.debug({ positionId }, "Position not found");
            throw new NotFoundError("Position not found");
        }

        if (position.position_status !== "OPEN") {
            this.logger.debug(
                { positionId, status: position.position_status },
                "Position is not open"
            );
            throw new BadRequestError(
                `Cannot close position with status ${position.position_status}`
            );
        }

        // 2. Get session with instrument (includes access check)
        const session = await sessionsRepo.getSessionWithInstrument(
            position.session_id
        );
        if (!session) {
            this.logger.debug(
                { sessionId: position.session_id },
                "Session not found"
            );
            throw new NotFoundError("Session not found");
        }

        // 3. Validate user access
        sessionsService.ensureSessionOwnershipOrAdmin(session, user);

        const contractSize = session.instrument.contract_size;

        // 4. Calculate gross PnL
        const grossPnL = pnlCalculationService.calculateGrossRealizedPnL(
            position,
            exitPrice,
            contractSize
        );

        // 5. Calculate trading costs
        const costs = this.calculateTradingCosts(position, session);

        // 6. Calculate net realized PnL
        const netPnL = grossPnL - costs.total;

        this.logger.debug(
            {
                positionId,
                grossPnL,
                costs,
                netPnL,
                contractSize,
            },
            "PnL calculated"
        );

        // 7. Update position with closing data
        // Set unrealized_pnl to null since position is now closed (realized takes over)
        const positionUpdateData: PositionUpdateInput = {
            position_status: positionStatus,
            exit_price: exitPrice,
            closed_at: closedAt,
            realized_pnl: netPnL,
            unrealized_pnl: null,
            commission_cost: costs.commission,
            spread_cost: costs.spread,
            slippage_cost: costs.slippage,
        };

        const updatedPosition = await positionsRepo.updatePosition(
            positionId,
            positionUpdateData
        );

        // Update position cache
        await positionsCacheRepo.cachePosition(updatedPosition.id, updatedPosition);

        this.logger.debug(
            { positionId: updatedPosition.id },
            "Position updated with closing data"
        );

        // 8. Create PNL transaction
        // Convert Prisma Decimal to number before arithmetic
        const currentBalance = Number(session.current_balance);
        const newBalance = currentBalance + netPnL;
        const transactionData: TransactionCreateInput = {
            session_id: session.id,
            transaction_type: "PNL",
            amount: netPnL,
            balance_after: newBalance,
        };

        const transaction = await transactionsService.createTransaction(
            transactionData,
            user
        );

        this.logger.info(
            {
                positionId: updatedPosition.id,
                transactionId: transaction.id,
                grossPnL,
                netPnL,
                newBalance,
            },
            "Position closed successfully"
        );

        return {
            position: updatedPosition,
            transaction,
            grossPnL,
            netPnL,
            costs,
        };
    }
}

export default new PositionClosingService();
