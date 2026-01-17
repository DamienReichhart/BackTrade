export const getInstruments = async () => {
    return [
        {
            symbol: "EURUSD",
            display_name: "EURUSD",
            pip_size: 0.0001,
            contract_size: 1000,
        },
        {
            symbol: "XAUUSD",
            display_name: "XAUUSD",
            pip_size: 0.01,
            contract_size: 100,
        },
        {
            symbol: "BTCUSD",
            display_name: "BTCUSD",
            pip_size: 0.1,
            contract_size: 100,
        },
    ];
};
