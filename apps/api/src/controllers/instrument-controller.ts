import { SearchQuerySchema } from "@backtrade/types";
import type { Request, Response } from "express";
import instrumentService from "../services/base/instrument-service";
import BadRequestError from "../errors/web/bad-request-error";

const getInstrumentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError("Instrument ID is required");
    }
    const instrument = await instrumentService.getInstrumentById(id);
    return res.status(200).json(instrument);
};

const getAllInstruments = async (req: Request, res: Response) => {
    const query = SearchQuerySchema.parse(req.query);
    const instruments = await instrumentService.getAllInstruments(query);
    return res.status(200).json(instruments);
};

const createInstrument = async (req: Request, res: Response) => {
    const instrument = await instrumentService.createInstrument(req.body);
    return res.status(201).json(instrument);
};

const updateInstrument = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError("Instrument ID is required");
    }
    const instrument = await instrumentService.updateInstrument(id, req.body);
    return res.status(200).json(instrument);
};

const deleteInstrument = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequestError("Instrument ID is required");
    }
    await instrumentService.deleteInstrument(id);
    return res.status(204).send();
};

export default {
    getInstrumentById,
    getAllInstruments,
    createInstrument,
    updateInstrument,
    deleteInstrument,
};
