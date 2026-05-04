
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Store exchange rates in memory
let exchangeRates = {
  USD: {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    AUD: 1.53,
    CAD: 1.36,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
  },
  EUR: {
    USD: 1.09,
    GBP: 0.86,
    JPY: 162.5,
    AUD: 1.66,
    CAD: 1.48,
    CHF: 0.96,
    CNY: 7.87,
    INR: 90.34,
  },
  GBP: {
    USD: 1.27,
    EUR: 1.16,
    JPY: 189.0,
    AUD: 1.93,
    CAD: 1.72,
    CHF: 1.12,
    CNY: 9.15,
    INR: 105.1,
  },
};

// Tool definitions
const tools = [
  {
    name: "get_exchange_rate",
    description:
      "Get the exchange rate between two currencies. Returns the rate to convert from source to target currency.",
    input_schema: {
      type: "object",
      properties: {
        source_currency: {
          type: "string",
          description: "The source currency code (e.g., USD, EUR, GBP)",
        },
        target_currency: {
          type: "string",
          description: "The target currency code (e.g., USD, EUR, GBP)",
        },
      },
      required: ["source_currency", "target_currency"],
    },
  },
  {
    name: "convert_currency",
    description:
      "Convert an amount from one currency to another using current exchange rates.",
    input_schema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "The amount to convert",
        },
        source_currency: {
          type: "string",
          description: "The source currency code",
        },
        target_currency: {
          type: "string",
          description: "The target currency code",
        },
      },
      required: ["amount", "source_currency", "target_currency"],
    },
  },
  {
    name: "list_supported_currencies",
    description: "List all supported currencies in the converter",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "update_exchange_rate",
    description:
      "Update the exchange rate between two currencies (simulates real-time updates)",
    input_schema: {
      type: "object",
      properties: {
        source_currency: {
          type: "string",
          description: "The source currency code",
        },
        target_currency: {
          type: "string",
          description: "The target currency code",
        },
        rate: {
          type: "number",
          description: "The new exchange rate",
        },
      },
      required: ["source_currency", "target_currency", "rate"],
    },
  },
];

// Tool implementations
function getExchangeRate(sourceCurrency, targetCurrency) {
  const source = sourceCurrency.toUpperCase();
  const target = targetCurrency.toUpperCase();

  if (source === target) {
    return 1.0;
  }

  if (exchangeRates[source] && exchangeRates[source][target]) {
    return exchangeRates[source][target];
  }

  // Try reverse calculation
  if (exchangeRates[target] && exchangeRates[target][source]) {
    return 1 / exchangeRates[target][source];
  }

  return null;
}

function convertCurrency(amount, sourceCurrency, targetCurrency) {
  const rate = getExchangeRate(sourceCurrency, targetCurrency);
  if (rate === null) {
    return null;
  }
  return amount * rate;
}

function listSupportedCurrencies() {
  const currencies = Object.keys(exchangeRates);
  return currencies;
}

function updateExchangeRate(sourceCurrency, targetCurrency, rate) {
  const source = sourceCurrency.toUpperCase();
  const target = targetCurrency.toUpperCase();

  if (!exchangeRates[source]) {
    exchangeRates[source] = {};
  }

  exchangeRates[source][target] = rate;
  return `Exchange rate updated: 1 ${source} = ${rate} ${target}`;
}

// Process tool calls
function processToolCall(toolName, toolInput) {
  switch (toolName) {
    case "get_exchange_rate":
      const rate = getExchangeRate(
        toolInput.source_currency,
        toolInput.target_currency
      );
      if (rate === null) {
        return `Exchange rate not found for ${toolInput.source_currency} to ${toolInput.target_currency}`;
      }
      return `1 ${toolInput.source_currency.toUpperCase()} = ${rate} ${toolInput.target_currency.toUpperCase()}`;

    case "convert_currency":
      const converted = convertCurrency(
        toolInput.amount,
        toolInput.source_currency,
        toolInput.target_currency
      );
      if (converted === null) {
        return `Cannot convert between ${toolInput.source_currency} and ${toolInput.target_currency}`;
      }
      return `${toolInput.amount} ${toolInput.source_currency.toUpperCase()} = ${converted.toFixed(2)} ${toolInput.target_currency.toUpperCase()}`;

    case "list_supported_currencies":
      const currencies =