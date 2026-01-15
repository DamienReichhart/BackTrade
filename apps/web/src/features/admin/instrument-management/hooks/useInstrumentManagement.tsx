import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInstruments } from "../../../../api/hooks/requests/instruments";
import type { Instrument } from "@backtrade/types";

export function useInstrumentManagement() {
    const navigate = useNavigate();

    // API Hooks
    const { data: instrumentsData, isLoading, error } = useInstruments();
    const instruments = instrumentsData ?? [];

    // State
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [selectedInstrumentForEdit, setSelectedInstrumentForEdit] =
        useState<Instrument | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [selectedInstrumentForDelete, setSelectedInstrumentForDelete] =
        useState<Instrument | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCreate = () => {
        setIsCreateOpen(true);
    };

    const handleEdit = (instrument: Instrument) => {
        setSelectedInstrumentForEdit(instrument);
        setIsEditOpen(true);
    };

    const handleDelete = (instrument: Instrument) => {
        setSelectedInstrumentForDelete(instrument);
        setIsDeleteOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateOpen(false);
    };

    const closeEditModal = () => {
        setSelectedInstrumentForEdit(null);
        setIsEditOpen(false);
    };

    const closeDeleteModal = () => {
        setSelectedInstrumentForDelete(null);
        setIsDeleteOpen(false);
    };

    const handleBackToAdmin = () => {
        navigate("/dashboard/admin");
    };

    const handleSuccess = () => {
        // Refetch is handled by the mutation hook invalidating queries
        closeCreateModal();
        closeEditModal();
        closeDeleteModal();
    };

    // Filter instruments
    const filteredInstruments = instruments.filter((instrument) => {
        const query = searchQuery.toLowerCase();
        return (
            instrument.display_name.toLowerCase().includes(query) ||
            instrument.symbol.toLowerCase().includes(query)
        );
    });

    return {
        // Data
        instruments: filteredInstruments,
        isLoading,
        error,
        searchQuery,

        // Modal States
        isCreateOpen,
        isEditOpen,
        isDeleteOpen,
        selectedInstrumentForEdit,
        selectedInstrumentForDelete,

        // Handlers
        handleSearchChange,
        handleCreate,
        handleEdit,
        handleDelete,
        closeCreateModal,
        closeEditModal,
        closeDeleteModal,
        handleBackToAdmin,
        handleSuccess,
    };
}
