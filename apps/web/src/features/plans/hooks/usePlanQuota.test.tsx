import { renderHook } from "../../../test-utils";
import { usePlanQuota } from "./usePlanQuota";
import * as sessionsApi from "../../../api/hooks/requests/sessions";

jest.mock("../../../api/hooks/requests/sessions", () => ({
    useSessions: jest.fn(),
}));

const mockUseSessions = sessionsApi.useSessions as jest.Mock;

it("counts non-archived sessions against the max", () => {
    mockUseSessions.mockReturnValue({
        data: [
            { id: 1, session_status: "RUNNING" },
            { id: 2, session_status: "PAUSED" },
            { id: 3, session_status: "ARCHIVED" },
        ],
        isLoading: false,
    });

    const { result } = renderHook(() => usePlanQuota(10));

    expect(result.current.used).toBe(2);
    expect(result.current.max).toBe(10);
    expect(result.current.isLoading).toBe(false);
});
