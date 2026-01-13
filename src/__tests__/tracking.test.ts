import { trackOrder } from "../logic/tracking";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("trackOrder", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return pending for 'pending' status", async () => {
        mockedAxios.get.mockResolvedValue({ data: { status: "pending" } });
        const result = await trackOrder("tx-123");
        expect(result.status).toBe("pending");
        expect(result.retry_after).toBe(5);
    });

    it("should return success for 'success' status", async () => {
        mockedAxios.get.mockResolvedValue({ data: { status: "success" } });
        const result = await trackOrder("tx-123");
        expect(result.status).toBe("success");
        expect(result.details).toContain("successfully");
    });

    it("should return failed for 'fail' status including logic", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                status: "fail",
                operations: [{ message: "Out of gas" }]
            }
        });
        const result = await trackOrder("tx-123");
        expect(result.status).toBe("failed");
        expect(result.details).toContain("Out of gas");
    });

    it("should handle 404 as pending (propagation delay)", async () => {
        const error: any = new Error("Not Found");
        error.isAxiosError = true;
        error.response = { status: 404 };
        (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

        mockedAxios.get.mockRejectedValue(error);

        const result = await trackOrder("tx-not-found");
        expect(result.status).toBe("pending");
        expect(result.details).toContain("Propagation Delay");
        expect(result.retry_after).toBe(5);
    });

    it("should handle generic API errors", async () => {
        const error: any = new Error("Network Error");
        (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false); // or true but different status

        mockedAxios.get.mockRejectedValue(error);
        const result = await trackOrder("tx-error");
        expect(result.status).toBe("unknown");
        expect(result.details).toContain("Network Error");
    });

    it("should return unknown if no hash provided", async () => {
        const result = await trackOrder("");
        expect(result.status).toBe("unknown");
    });
});
